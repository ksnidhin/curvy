import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function parseCookieInput(rawCookie?: string | null): string {
  if (!rawCookie || !rawCookie.trim()) return '';
  const trimmed = rawCookie.trim();
  // Support JSON format exported from Cookie-Editor extension (array of cookie objects)
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
    return parseCookieInput(explicitCookies);
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

  return parseCookieInput(cookie);
}

export async function POST(req: Request) {
  try {
    const { url, cookies: reqCookies } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const scraperApiKey = process.env.SCRAPERAPI_KEY;
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

    // Step 2: Fallback to ScraperAPI (with forward headers) or direct fetch if no HTML obtained yet
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
    
    // We parse the original URL domain, not scraperapi's domain
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
      
      // Extract specific Amazon details for the AI
      const amznDetails = $('#productDetails_techSpec_section_1, #detailBullets_feature_div').text().replace(/\s+/g, ' ').trim();
      extractedDetails.amazonRaw = {
        features: $('#feature-bullets').text().replace(/\s+/g, ' ').trim(),
        specs: amznDetails
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
      
      $('img._396cs4, img._2r_T1I, img.DByuf4').each((_, el) => {
        const src = $(el).attr('src');
        if (src) images.push(src.replace('128/128', '832/832').replace('128/128', '832/832'));
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
              
              extractedDetails.myntraRaw = {
                brand: product.brand,
                sizes: product.sizes,
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
        if (p.includes('₹')) {
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
              const highResImages = productImages.map((url: string) => url.replace(/_\d+\.(jpg|jpeg|png)$/i, '.$1'));
              images.push(...highResImages);
            }
            
            extractedDetails.meeshoRaw = {
              validSizes: detailsData.validSizes,
              originalDescription: detailsData.description
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
    
    // Extract a larger chunk of text from the body to give the AI more context (for sizes, colors, fabric)
    const bodyText = $('body').text().replace(/\s+/g, ' ').substring(0, 4000);

    // --- GROQ AI EXTRACTION ---
    let aiData = { brand: '', category: '', availableSizes: '', colors: '', clothType: '', occasion: '' };
    
    if (groqApiKey) {
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: groqApiKey });
        
        const prompt = `You are an expert fashion e-commerce data extraction assistant. We have scraped raw data from a product page.
I need you to carefully extract the exact details to fit strictly into our clean database schema.
DO NOT summarize or dump remaining data. ONLY extract what is asked for.

Raw Data Dump:
Title: ${title}
Description: ${description}
Raw JSON/Metadata extracted: ${JSON.stringify(extractedDetails)}
Raw Page Text (snippet): ${bodyText}

Please parse this raw data and return ONLY a valid JSON object with the exact keys below. Do not include markdown formatting or backticks.
{
  "brand": "Extract the brand name. Return empty string if unknown.",
  "category": "Extract or guess the best category from: Co-ord Sets, Dresses, Jeans, Kurtis & Tunics, Nightwear, Tops, Traditional Wear, Western Wear, Wrap tops. Return empty string if unsure.",
  "availableSizes": "Extract all available sizes (e.g. S, M, L, XL, 6-12M, 28, 30) and return them as a comma-separated string. Look carefully at the JSON metadata for validSizes or sizes array.",
  "colors": "Extract the base color(s) of the product and return as a comma-separated string. Look closely at the JSON metadata for color fields.",
  "clothType": "Extract the fabric or material type (e.g. Cotton, Polyester, Georgette). Look closely at the JSON metadata for fabric fields.",
  "occasion": "Guess the best occasion from: Casual, Formal, Party, Ethnic. Return Casual if unsure."
}`;

        let aiResponse = '{}';
        const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-70b-8192', 'llama-3.1-8b-instant'];
        
        for (const model of modelsToTry) {
          try {
            const chatCompletion = await groq.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              model,
              temperature: 0.1,
              response_format: { type: 'json_object' }
            });
            aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
            if (aiResponse && aiResponse !== '{}') break;
          } catch (modelErr: any) {
            console.warn(`Groq model ${model} failed, trying next:`, modelErr.message);
          }
        }
        
        const parsed = JSON.parse(aiResponse);
        
        aiData = {
          brand: parsed.brand || '',
          category: parsed.category || '',
          availableSizes: parsed.availableSizes || '',
          colors: parsed.colors || '',
          clothType: parsed.clothType || '',
          occasion: parsed.occasion?.toLowerCase() || ''
        };
      } catch(err) {
        console.error("Groq AI Error:", err);
      }
    }

    return NextResponse.json({
      title,
      price,
      description,
      images,
      ...aiData
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
