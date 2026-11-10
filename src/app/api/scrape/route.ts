import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function parseCookieInput(rawCookie?: string | null, targetUrl?: string): string {
  if (!rawCookie || !rawCookie.trim()) return '';
  const trimmed = rawCookie.trim();

  // 1. Support JSON object containing multiple stores: { amazon: "...", myntra: "..." }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        if (targetUrl) {
          const lower = targetUrl.toLowerCase();
          if ((lower.includes('amazon') || lower.includes('amzn')) && obj.amazon) return obj.amazon;
          if (lower.includes('myntra') && obj.myntra) return obj.myntra;
          if (lower.includes('flipkart') && obj.flipkart) return obj.flipkart;
          if (lower.includes('ajio') && obj.ajio) return obj.ajio;
          if (lower.includes('meesho') && obj.meesho) return obj.meesho;
          if (lower.includes('tatacliq') && obj.tatacliq) return obj.tatacliq;
          if (lower.includes('nykaa') && obj.nykaa) return obj.nykaa;
          if (obj.custom) return obj.custom;
          for (const key of Object.keys(obj)) {
            if (lower.includes(key.toLowerCase()) && typeof obj[key] === 'string') {
              return obj[key];
            }
          }
        }
      }
    } catch {}
  }

  // 2. Support block-delimited format (=== AMAZON ===)
  if (trimmed.includes('===') && targetUrl) {
    const lower = targetUrl.toLowerCase();
    let currentStore = '';
    const lines = trimmed.split('\n');
    let matchedCookies: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('===') && t.endsWith('===')) {
        currentStore = t.replace(/=/g, '').trim().toLowerCase();
        continue;
      }
      if (currentStore && lower.includes(currentStore) && t) {
        matchedCookies.push(t);
      }
    }
    if (matchedCookies.length) return matchedCookies.join('; ');
  }

  // 3. Support JSON format exported from Cookie-Editor extension (array of cookie objects)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return arr
          .filter((item: any) => item && item.name && item.value !== undefined)
          .map((item: any) => `${item.name}=${item.value}`)
          .join('; ');
      }
    } catch {}
  }

  return trimmed;
}

async function getStoredCookies(): Promise<Record<string, string>> {
  try {
    const fs = (await import('fs/promises')).default;
    const path = (await import('path')).default;
    const filePath = path.join(process.cwd(), 'data/cookies.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function resolveCookiesForUrl(url: string, explicitCookies?: string): Promise<string> {
  if (explicitCookies && explicitCookies.trim()) {
    const parsed = parseCookieInput(explicitCookies, url);
    if (parsed) return parsed;
  }

  const stored = await getStoredCookies();
  const lower = url.toLowerCase();
  let cookie = '';
  if (lower.includes('amazon') || lower.includes('amzn')) {
    cookie = stored.amazon || process.env.AMAZON_COOKIES || '';
  } else if (lower.includes('myntra')) {
    cookie = stored.myntra || process.env.MYNTRA_COOKIES || '';
  } else if (lower.includes('flipkart')) {
    cookie = stored.flipkart || process.env.FLIPKART_COOKIES || '';
  } else if (lower.includes('ajio')) {
    cookie = stored.ajio || process.env.AJIO_COOKIES || '';
  } else if (lower.includes('meesho')) {
    cookie = stored.meesho || process.env.MEESHO_COOKIES || '';
  } else if (lower.includes('tatacliq')) {
    cookie = stored.tatacliq || process.env.TATACLIQ_COOKIES || '';
  } else if (lower.includes('nykaa')) {
    cookie = stored.nykaa || process.env.NYKAA_COOKIES || '';
  }

  if (!cookie) {
    cookie = stored.custom || process.env.CUSTOM_COOKIES || '';
  }

  return parseCookieInput(cookie, url);
}

interface StructuredProductExtraction {
  title?: string;
  brand?: string;
  category?: string;
  availableSizes?: string;
  colors?: string;
  clothType?: string;
  occasion?: string;
  description?: string;
}

async function extractWithGemini(
  apiKey: string,
  raw: {
    title: string;
    description: string;
    extractedDetails: Record<string, any>;
    bodyText: string;
  }
): Promise<StructuredProductExtraction | null> {
  // Primary model: gemini-3.8-flash (as requested by user), with robust fallbacks
  const models = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  const prompt = `You are an expert e-commerce catalog assistant for the fashion brand "Curvygirls".
We have scraped product data from a retailer page. Analyze the raw data and accurately categorize, clean, and map all fields to fit our clean database schema.

RAW PRODUCT DATA:
- Scraped Title: ${raw.title}
- Scraped Description/Bullets: ${raw.description}
- Extracted Details: ${JSON.stringify(raw.extractedDetails)}
- Page Snippet: ${raw.bodyText.substring(0, 3000)}

ALLOWED CATEGORIES (Pick EXACTLY ONE from this list):
["Co-ord Sets", "Dresses", "Jeans", "Kurtis & Tunics", "Nightwear", "Tops", "Traditional Wear", "Western Wear", "Wrap tops"]
(Guidelines: Any jeans, denim trousers, or jeggings MUST be categorized as "Jeans". Any kurtas, kurtis, anarkalis MUST be "Kurtis & Tunics". Nightgowns, pyjama sets, sleepwear MUST be "Nightwear". Two-piece matching sets MUST be "Co-ord Sets". Western shirts/t-shirts/blouses MUST be "Tops" or "Western Wear". Sarees, lehengas, dupattas MUST be "Traditional Wear".)

ALLOWED OCCASIONS (Pick EXACTLY ONE from this list):
["casual", "formal", "party", "ethnic"]

EXTRACTION & CLEANING RULES:
1. "title": A clean, appealing product title without seller SEO spam, pipe characters ("|"), or typos (e.g. fix "Lool" -> "Look", remove "Amazon.in: Fashion", remove "(Blue, 32)"). Max 70 characters.
2. "brand": Brand name (e.g. "KOTTY"). Extract from title or details.
3. "category": Pick ONE EXACT category from the ALLOWED CATEGORIES list above.
4. "availableSizes": Comma-separated list of sizes (e.g. "28, 30, 32, 34, 36" for jeans/pants, or "S, M, L, XL" for tops/dresses). Strip units like "inches", "waist", "size". If variations or sizes were found in the details or title, include all available sizes.
5. "colors": Comma-separated primary clean color names (e.g. "Blue" or "Dark Blue").
6. "clothType": Fabric or material composition (e.g. "Denim", "Cotton", "Cotton Blend", "Georgette", "Polyester", "Rayon").
7. "occasion": ONE from the ALLOWED OCCASIONS list (lowercase: "casual", "formal", "party", or "ethnic").
8. "description": An attractive, clean, boutique-style product description (2 to 4 sentences) written in an engaging tone. Highlight the fit, style, and fabric comfort. DO NOT include raw dumped specs, bullet points, retailer names, or seller noise.

Respond strictly with a valid JSON object matching this schema:
{
  "title": "Clean Product Title",
  "brand": "Brand Name",
  "category": "Jeans",
  "availableSizes": "28, 30, 32, 34, 36",
  "colors": "Blue",
  "clothType": "Denim",
  "occasion": "casual",
  "description": "Clean attractive product description."
}`;

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          console.log(`[Scraper] Successfully extracted fields with Gemini model: ${model}`);
          return parsed;
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Scraper] Gemini model ${model} failed (${res.status}): ${errText.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.warn(`[Scraper] Gemini model ${model} exception: ${err.message}`);
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { url, cookies: reqCookies } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const scraperApiKey = process.env.SCRAPERAPI_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const groqApiKey = process.env.GROQ_API_KEY;
    
    const userCookie = await resolveCookiesForUrl(url, reqCookies);
    let finalUrl = url;

    // Resolve short URLs BEFORE sending to ScraperAPI or fetching
    if (url.includes('amzn.in') || url.includes('amzn.to')) {
      try {
        const redirectRes = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            ...(userCookie ? { 'Cookie': userCookie } : {})
          }
        });
        if (redirectRes.url) {
          finalUrl = redirectRes.url;
        }
      } catch (err) {
        console.error('Failed to resolve Amazon short URL:', err);
      }
    }

    const browserHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Cache-Control': 'max-age=0',
      'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    if (userCookie) {
      browserHeaders['Cookie'] = userCookie;
    }

    let html = '';

    // Step 1: If cookies are available, try direct residential/cookie fetch first
    if (userCookie) {
      try {
        const directRes = await fetch(finalUrl, {
          headers: browserHeaders,
          redirect: 'follow',
          next: { revalidate: 0 }
        });

        if (directRes.ok) {
          const directHtml = await directRes.text();
          const isBlocked = directHtml.includes('api-services-support@amazon.com') ||
                            directHtml.includes('Type the characters you see in this image') ||
                            directHtml.includes('Robot Check');

          if (!isBlocked && directHtml.length > 1000) {
            html = directHtml;
          }
        }
      } catch (err) {
        console.warn('Direct fetch with cookies encountered error, falling back:', err);
      }
    }

    // Step 2: Fallback to ScraperAPI or direct fetch if no HTML obtained yet
    if (!html) {
      let fetchUrl = finalUrl;
      const headersToSend = { ...browserHeaders };

      if (scraperApiKey) {
        const isAmazon = finalUrl.includes('amazon') || finalUrl.includes('amzn');
        const premiumFlag = isAmazon ? '&premium=true' : '';
        const keepHeadersFlag = userCookie ? '&keep_headers=true' : '';
        fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(finalUrl)}${premiumFlag}${keepHeadersFlag}`;
      }

      const response = await fetch(fetchUrl, { headers: headersToSend, next: { revalidate: 0 } });
      if (!response.ok) {
        if (response.status === 500 && scraperApiKey) {
          throw new Error('ScraperAPI failed to retrieve the page. The link might be protected by CAPTCHA or invalid.');
        }
        throw new Error(`Failed to fetch from url (status: ${response.status})`);
      }
      html = await response.text();
    }

    const $ = cheerio.load(html);

    let title = '';
    let price = '';
    let description = '';
    let images: string[] = [];
    let extractedDetails: any = {};
    
    const domain = new URL(finalUrl).hostname;

    if (domain.includes('amazon') || domain.includes('amzn')) {
      title = $('#productTitle').text().trim() || $('meta[property="og:title"]').attr('content') || $('title').text();
      let priceWhole = $('.a-price-whole').map((_, el) => $(el).text()).get().find(t => t.trim().length > 0) || '';
      priceWhole = priceWhole.replace(/[^0-9]/g, '');
      if (!priceWhole) {
        priceWhole = $('.apexPriceToPay .a-offscreen').first().text().replace(/[^0-9]/g, '');
      }
      price = priceWhole;
      description = $('#productDescription').text().trim() || $('#feature-bullets').text().trim() || $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      
      // Amazon brand extraction
      const brandCandidate = $('.po-brand .po-break-word').first().text().trim() ||
                              $('#bylineInfo').text().replace(/Visit the\s+|Brand:\s+|Store/gi, '').trim() ||
                              $('#bylineInfo_feature_div').text().replace(/Visit the\s+|Brand:\s+|Store/gi, '').trim();

      // Amazon material/fabric extraction
      const materialCandidate = $('.po-material .po-break-word').first().text().trim() ||
                                $('.po-fabric .po-break-word').first().text().trim() ||
                                $('#productOverview_feature_div tr.po-material_composition td.a-span9 span').text().trim();

      // Amazon color extraction
      const colorCandidate = $('#variation_color_name .selection').text().trim() ||
                             $('.po-color .po-break-word').first().text().trim();

      // Amazon size variations extraction
      const amznSizes: string[] = [];
      const selectedSize = $('#variation_size_name .selection').text().trim();
      if (selectedSize) amznSizes.push(selectedSize);

      $('#variation_size_name ul li, #variation_size_name select option, #native_dropdown_selected_size_name option, select#dropdown_selected_size_name option').each((_, el) => {
        const txt = $(el).text().replace(/select/i, '').trim();
        if (txt && !txt.toLowerCase().includes('select') && txt.length < 25) {
          amznSizes.push(txt);
        }
      });

      // Also check title for size indicators (e.g., "(Blue, 32)")
      const titleSizeMatch = title.match(/\b(?:size|waist|)\s*([2-4][0-9]|XXS|XS|S|M|L|XL|[2-8]XL)\b/i);
      if (titleSizeMatch && titleSizeMatch[1]) {
        amznSizes.push(titleSizeMatch[1]);
      }

      // Breadcrumbs for category detection
      const breadcrumbs = $('#wayfinding-breadcrumbs_feature_div').text().replace(/\s+/g, ' ').trim();
      const productOverview = $('#productOverview_feature_div').text().replace(/\s+/g, ' ').trim();
      const amznSpecs = $('#productDetails_techSpec_section_1, #detailBullets_feature_div').text().replace(/\s+/g, ' ').trim();
      
      extractedDetails.amazon = {
        brand: brandCandidate,
        material: materialCandidate,
        color: colorCandidate,
        sizes: [...new Set(amznSizes)].join(', '),
        breadcrumbs,
        overview: productOverview,
        features: $('#feature-bullets').text().replace(/\s+/g, ' ').trim(),
        specs: amznSpecs
      };
      
      // Try finding high-res images in the DOM
      $('#altImages img, .a-dynamic-image').each((_, el) => {
        let src = ($(el).attr('src') || $(el).data('old-hires') || $(el).attr('data-src')) as string | undefined;
        if (typeof src === 'string' && src.startsWith('http')) {
          src = src.replace(/\._.*?\_\./, '.');
          images.push(src);
        }
      });

      if (!images.length) {
        const imageScript = $('script').filter((_, el) => $(el).text().includes('ImageBlockATF') || $(el).text().includes('colorImages')).text();
        const match = imageScript.match(/"hiRes":"(.*?)"/g);
        if (match) {
          images = match.map(m => m.replace(/"hiRes":"/, '').replace(/"$/, ''));
        }
      }

      if (!images.length) {
        images = [$('#landingImage').attr('src'), $('meta[property="og:image"]').attr('content')].filter(Boolean) as string[];
      }
      
      images = [...new Set(images)].filter(img => !img.includes('icon') && !img.includes('transparent'));
      
      if (!price && (title.includes('Amazon.in') || title.includes('Robot Check') || title === '')) {
        throw new Error('Amazon bot protection triggered. Please paste your personal browser session cookies in the Custom Cookies field or set AMAZON_COOKIES in .env.');
      }
    } else if (domain.includes('flipkart')) {
      title = $('.B_NuCI').text().trim() || $('.VU-ZEz').text().trim() || $('meta[property="og:title"]').attr('content') || '';
      price = $('._30jeq3').first().text().replace(/[^0-9]/g, '') || $('.Nx9bqj').first().text().replace(/[^0-9]/g, '');
      description = $('._1mXcCf').text().trim() || $('meta[property="og:description"]').attr('content') || '';
      
      const flipkartBrand = $('span.G6XhRU, .mEh187').first().text().trim();
      const flipkartSizes: string[] = [];
      $('._1fGeJ5, .CDDvd_ li, ul._1q8vST li').each((_, el) => {
        const txt = $(el).text().trim();
        if (txt) flipkartSizes.push(txt);
      });
      const flipkartColor = $('._3V2wfe').first().text().trim();
      const flipkartSpecs = $('table._14cfVK').text().replace(/\s+/g, ' ').trim();
      const flipkartBreadcrumbs = $('._1MR4o5').text().replace(/\s+/g, ' ').trim();

      extractedDetails.flipkart = {
        brand: flipkartBrand,
        sizes: [...new Set(flipkartSizes)].join(', '),
        color: flipkartColor,
        specs: flipkartSpecs,
        breadcrumbs: flipkartBreadcrumbs
      };

      $('img._396cs4, img._2r_T1I, img.DByuf4').each((_, el) => {
        const src = $(el).attr('src');
        if (src) images.push(src.replace('128/128', '832/832'));
      });
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);
    } else if (domain.includes('myntra')) {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      
      const priceText = $('.pdp-price').text().replace(/[^0-9]/g, '') || $('meta[property="product:price:amount"]').attr('content');
      if (priceText) price = priceText;

      const startIndex = html.indexOf('window.__myx = ');
      if (startIndex !== -1) {
        const jsonStart = startIndex + 'window.__myx = '.length;
        const endIndex = html.indexOf('</script>', jsonStart);
        if (endIndex !== -1) {
          let jsonString = html.substring(jsonStart, endIndex).trim();
          if (jsonString.endsWith(';')) jsonString = jsonString.slice(0, -1);
          try {
            const data = JSON.parse(jsonString);
            const product = data?.pdpData;
            if (product) {
              if (product.media?.albums?.[0]?.images) {
                const parsedImages = product.media.albums[0].images.map((img: any) => img.imageURL);
                if (parsedImages.length) {
                  images.push(...parsedImages);
                }
              }
              
              if (product.price?.discounted) {
                price = product.price.discounted.toString();
              }
              
              extractedDetails.myntra = {
                brand: product.brand,
                sizes: Array.isArray(product.sizes) ? product.sizes.map((s: any) => s.label || s.size).join(', ') : '',
                color: product.baseColour || '',
                category: product.articleType?.typeName || '',
                attributes: product.articleAttributes
              };
            }
          } catch (e) {
            console.error('Failed to parse Myntra state');
          }
        }
      }
    } else if (domain.includes('meesho')) {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      
      const possiblePrices = $('.price, [class*="Price"], [class*="pdp-price"], .discounted-price, h4').map((_, el) => $(el).text()).get();
      for (const p of possiblePrices) {
        if (p.includes('₹') || p.includes('Rs')) {
           const num = p.replace(/[^0-9]/g, '');
           if (num && parseInt(num) > 0) { price = num; break; }
        }
      }

      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (nextDataMatch) {
        try {
          const data = JSON.parse(nextDataMatch[1]);
          const detailsData = data?.props?.pageProps?.initialState?.product?.details?.data;
          
          if (detailsData) {
            const productImages = detailsData.images;
            if (Array.isArray(productImages)) {
              const highResImages = productImages.map((u: string) => u.replace(/_\d+\.(jpg|jpeg|png)$/i, '.$1'));
              images.push(...highResImages);
            }
            
            extractedDetails.meesho = {
              validSizes: Array.isArray(detailsData.validSizes) ? detailsData.validSizes.join(', ') : '',
              originalDescription: detailsData.description,
              category: detailsData.category_name || detailsData.catalog_name || '',
              attributes: detailsData.product_attributes
            };
            if (detailsData.price && detailsData.price > 0 && !price) {
               price = detailsData.price.toString();
            }
          }
        } catch (e) {
          console.error('Failed to parse Meesho next data');
        }
      }
    } else if (domain.includes('ajio')) {
      title = $('.prod-name').text().trim() || $('meta[property="og:title"]').attr('content') || $('title').text();
      description = $('.prod-desc').text().trim() || $('meta[property="og:description"]').attr('content') || '';
      price = $('.prod-sp').text().replace(/[^0-9]/g, '');
      
      const ajioSizes: string[] = [];
      $('.size-variant-item, .size-swatch').each((_, el) => {
        const txt = $(el).text().trim();
        if (txt) ajioSizes.push(txt);
      });

      extractedDetails.ajio = {
        brand: $('.brand-name').first().text().trim(),
        sizes: [...new Set(ajioSizes)].join(', '),
        breadcrumbs: $('.breadcrumb').text().replace(/\s+/g, ' ').trim()
      };

      $('img.preview-img, img.prod-img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('http')) images.push(src);
      });
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);
    } else {
      // Generic fallback
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);
      
      const possiblePrices = $('.price, .Price, [class*="price"], [class*="Price"], [class*="pdp-price"], .discounted-price').map((_, el) => $(el).text()).get();
      for (const p of possiblePrices) {
        const num = p.replace(/[^0-9.]/g, '');
        if (num && parseFloat(num) > 0) {
          price = num;
          break;
        }
      }

      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('icon') && !src.includes('logo') && src.startsWith('http')) {
          images.push(src);
        }
      });
    }

    title = title.replace(/\s+/g, ' ').trim();
    description = description.replace(/\s+/g, ' ').trim().substring(0, 1500);
    images = [...new Set(images)].slice(0, 5);
    
    // Snippet of page text for extra context
    const bodyText = $('body').text().replace(/\s+/g, ' ').substring(0, 4000);

    // AI Classification Data
    let aiData: StructuredProductExtraction = {
      title: '',
      brand: '',
      category: '',
      availableSizes: '',
      colors: '',
      clothType: '',
      occasion: 'casual',
      description: ''
    };

    // Step A: Extract with Google Gemini (using gemini-3.8-flash first)
    if (geminiApiKey) {
      try {
        const geminiResult = await extractWithGemini(geminiApiKey, {
          title,
          description,
          extractedDetails,
          bodyText
        });

        if (geminiResult) {
          aiData = {
            title: geminiResult.title || '',
            brand: geminiResult.brand || '',
            category: geminiResult.category || '',
            availableSizes: geminiResult.availableSizes || '',
            colors: geminiResult.colors || '',
            clothType: geminiResult.clothType || '',
            occasion: (geminiResult.occasion || 'casual').toLowerCase(),
            description: geminiResult.description || ''
          };
        }
      } catch (geminiErr: any) {
        console.error('Gemini extraction error:', geminiErr);
      }
    }

    // Step B: Secondary fallback to Groq if Gemini did not fill structured fields
    if ((!aiData.category || !aiData.brand) && groqApiKey) {
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: groqApiKey });
        
        const prompt = `You are an expert fashion e-commerce catalog assistant.
Categorize this product strictly to fit our schema.
Title: ${title}
Description: ${description}
Details: ${JSON.stringify(extractedDetails)}

Categories allowed: ["Co-ord Sets", "Dresses", "Jeans", "Kurtis & Tunics", "Nightwear", "Tops", "Traditional Wear", "Western Wear", "Wrap tops"]
Occasions allowed: ["casual", "formal", "party", "ethnic"]

Return ONLY a JSON object:
{
  "title": "Clean concise title",
  "brand": "Brand name",
  "category": "One category from allowed list",
  "availableSizes": "Comma-separated sizes (e.g. 28, 30, 32 or S, M, L)",
  "colors": "Comma-separated colors",
  "clothType": "Fabric or material",
  "occasion": "casual or formal or party or ethnic",
  "description": "Attractive 2-3 sentence product description"
}`;

        const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];
        for (const model of modelsToTry) {
          try {
            const chatCompletion = await groq.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              model,
              temperature: 0.1,
              response_format: { type: 'json_object' }
            });
            const text = chatCompletion.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(text);
            if (parsed.category || parsed.brand) {
              aiData = {
                title: parsed.title || aiData.title,
                brand: parsed.brand || aiData.brand,
                category: parsed.category || aiData.category,
                availableSizes: parsed.availableSizes || aiData.availableSizes,
                colors: parsed.colors || aiData.colors,
                clothType: parsed.clothType || aiData.clothType,
                occasion: (parsed.occasion || aiData.occasion || 'casual').toLowerCase(),
                description: parsed.description || aiData.description
              };
              break;
            }
          } catch (modelErr) {}
        }
      } catch (groqErr) {
        console.error('Groq fallback error:', groqErr);
      }
    }

    // Step C: Fallback to raw extracted details if still empty
    if (!aiData.brand) {
      aiData.brand = extractedDetails.amazon?.brand ||
                     extractedDetails.flipkart?.brand ||
                     extractedDetails.myntra?.brand ||
                     extractedDetails.ajio?.brand || '';
    }

    if (!aiData.clothType) {
      aiData.clothType = extractedDetails.amazon?.material || '';
    }

    if (!aiData.colors) {
      aiData.colors = extractedDetails.amazon?.color ||
                      extractedDetails.flipkart?.color ||
                      extractedDetails.myntra?.color || '';
    }

    if (!aiData.availableSizes) {
      aiData.availableSizes = extractedDetails.amazon?.sizes ||
                              extractedDetails.flipkart?.sizes ||
                              extractedDetails.myntra?.sizes ||
                              extractedDetails.meesho?.validSizes ||
                              extractedDetails.ajio?.sizes || '';
    }

    if (!aiData.category) {
      const lowerAll = (title + ' ' + (extractedDetails.amazon?.breadcrumbs || '')).toLowerCase();
      if (lowerAll.includes('jean') || lowerAll.includes('denim')) aiData.category = 'Jeans';
      else if (lowerAll.includes('dress')) aiData.category = 'Dresses';
      else if (lowerAll.includes('kurti') || lowerAll.includes('kurta')) aiData.category = 'Kurtis & Tunics';
      else if (lowerAll.includes('night') || lowerAll.includes('pyjama') || lowerAll.includes('sleep')) aiData.category = 'Nightwear';
      else if (lowerAll.includes('co-ord') || lowerAll.includes('coord') || lowerAll.includes('set')) aiData.category = 'Co-ord Sets';
      else if (lowerAll.includes('top') || lowerAll.includes('tee') || lowerAll.includes('shirt')) aiData.category = 'Tops';
    }

    return NextResponse.json({
      title: aiData.title || title,
      price,
      description: aiData.description || description,
      images,
      brand: aiData.brand || '',
      category: aiData.category || '',
      availableSizes: aiData.availableSizes || '',
      colors: aiData.colors || '',
      clothType: aiData.clothType || '',
      occasion: aiData.occasion || 'casual'
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
