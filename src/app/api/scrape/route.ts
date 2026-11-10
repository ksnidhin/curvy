import { NextResponse } from 'next/server';
import { unshortenUrl } from '@/lib/scraper/unshortener';
import { canonicalizeUrl } from '@/lib/scraper/canonicalizer';
import { fetchWithFallback } from '@/lib/scraper/fetcher';
import { parseProductData } from '@/lib/scraper/parser';

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
      const timeout = setTimeout(() => controller.abort(), 25000);
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

    const rawUrl = url.trim();

    // ------------------------------------------------------------------------
    // STAGE 1: Universal Affiliate & Short-Link Unshortener
    // ------------------------------------------------------------------------
    const resolvedUrl = await unshortenUrl(rawUrl);

    // ------------------------------------------------------------------------
    // STAGE 2: Strict URL Canonicalization
    // ------------------------------------------------------------------------
    const { canonicalUrl, platform, productId } = canonicalizeUrl(resolvedUrl);

    // ------------------------------------------------------------------------
    // STAGE 3: 3-Tier Zero-Failure Fetching Engine
    // STRICT RULE: Never pass static cookies to Flipkart, Myntra, Meesho, Ajio!
    // ------------------------------------------------------------------------
    let optionalAmazonCookie: string | undefined;
    if (platform === 'amazon') {
      if (reqCookies && typeof reqCookies === 'string' && reqCookies.trim()) {
        optionalAmazonCookie = reqCookies.trim();
      } else {
        try {
          const fs = (await import('fs/promises')).default;
          const path = (await import('path')).default;
          const filePath = path.join(process.cwd(), 'data/cookies.json');
          const content = await fs.readFile(filePath, 'utf-8');
          const stored = JSON.parse(content);
          if (stored.amazon) optionalAmazonCookie = stored.amazon;
        } catch {}
      }
    }

    const fetchResult = await fetchWithFallback(
      canonicalUrl,
      platform,
      productId,
      optionalAmazonCookie
    );

    // STRUCTURED LOGGING: [RAW_URL] -> [RESOLVED_URL] -> [CANONICAL_URL] -> [TIER_USED] -> [STATUS]
    console.log(
      `[SCRAPER_PIPELINE] [RAW_URL]: ${rawUrl} -> [RESOLVED_URL]: ${resolvedUrl} -> [CANONICAL_URL]: ${canonicalUrl} -> [TIER_USED]: ${fetchResult.tierUsed} -> [STATUS]: SUCCESS (${fetchResult.statusCode})`
    );

    // ------------------------------------------------------------------------
    // STAGE 4: Resilient Data Extraction (JSON-First, DOM-Second)
    // ------------------------------------------------------------------------
    const parsedData = parseProductData(
      fetchResult.html,
      platform,
      fetchResult.isJsonPayload
    );

    // Context snippet for AI
    const bodySnippet = fetchResult.html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                                       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                                       .replace(/\s+/g, ' ')
                                       .substring(0, 3500);

    // AI Classification (Gemini 3.8 Flash primary)
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
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

    if (geminiApiKey) {
      try {
        const geminiResult = await extractWithGemini(geminiApiKey, {
          title: parsedData.title,
          description: parsedData.description,
          extractedDetails: parsedData.rawDetails,
          bodyText: bodySnippet
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

    // Heuristic Fallback for any missing fields
    const fullTextSearch = `${parsedData.title} ${parsedData.description} ${JSON.stringify(parsedData.rawDetails)}`;

    if (!aiData.brand) {
      aiData.brand = parsedData.brand || '';
      if (!aiData.brand) {
        const brandMatch = parsedData.title.match(/^([A-Za-z0-9&]+)(?:\s+Men|\s+Women|\s+'s|\s+Solid|\s+Regular|\s+Slim|\s+Cotton|\s+Denim)/i);
        if (brandMatch && brandMatch[1]) aiData.brand = brandMatch[1].trim();
      }
    }

    if (!aiData.clothType) {
      const fabricMatch = fullTextSearch.match(/\b(Denim|Cotton Blend|Cotton|Linen|Silk|Georgette|Chiffon|Rayon|Polyester|Satin|Velvet|Crepe|Lycra|Spandex|Elastane|Khadi)\b/i);
      if (fabricMatch && fabricMatch[1]) {
        aiData.clothType = fabricMatch[1].charAt(0).toUpperCase() + fabricMatch[1].slice(1).toLowerCase();
      }
    }

    if (!aiData.colors) {
      const colorMatch = fullTextSearch.match(/\b(Navy Blue|Light Blue|Dark Blue|Blue|Black|White|Grey|Gray|Red|Pink|Yellow|Green|Olive|Brown|Beige|Maroon|Purple|Orange)\b/i);
      if (colorMatch && colorMatch[1]) {
        aiData.colors = colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1).toLowerCase();
      }
    }

    if (!aiData.availableSizes) {
      const sizeMatch = fullTextSearch.match(/[\(,]\s*(?:Size:\s*)?([2-4][0-9]|XXS|XS|S|M|L|XL|[2-8]XL)\s*[\),]/i) ||
                        fullTextSearch.match(/\b(?:size|waist|)\s*([2-4][0-9]|XXS|XS|S|M|L|XL|[2-8]XL)\b/i);
      if (sizeMatch && sizeMatch[1]) {
        aiData.availableSizes = sizeMatch[1].toUpperCase();
      }
    }

    if (!aiData.category) {
      const lowerAll = fullTextSearch.toLowerCase();
      if (lowerAll.includes('jean') || lowerAll.includes('denim')) aiData.category = 'Jeans';
      else if (lowerAll.includes('dress')) aiData.category = 'Dresses';
      else if (lowerAll.includes('kurti') || lowerAll.includes('kurta') || lowerAll.includes('anarkali')) aiData.category = 'Kurtis & Tunics';
      else if (lowerAll.includes('night') || lowerAll.includes('pyjama') || lowerAll.includes('sleepwear')) aiData.category = 'Nightwear';
      else if (lowerAll.includes('co-ord') || lowerAll.includes('coord') || lowerAll.includes('set')) aiData.category = 'Co-ord Sets';
      else if (lowerAll.includes('top') || lowerAll.includes('tee') || lowerAll.includes('shirt') || lowerAll.includes('blouse')) aiData.category = 'Tops';
      else if (lowerAll.includes('saree') || lowerAll.includes('lehenga') || lowerAll.includes('ethnic')) aiData.category = 'Traditional Wear';
      else aiData.category = 'Western Wear';
    }

    // Clean up boutique description
    if (!aiData.description || aiData.description.includes('Amazon.in:') || aiData.description.includes('Robot Check')) {
      const cleanBrand = aiData.brand || 'This';
      const cleanCloth = aiData.clothType ? `${aiData.clothType} ` : '';
      const cleanCat = aiData.category || 'piece';
      aiData.description = `Elevate your wardrobe with this stylish ${cleanBrand} ${cleanCloth}${cleanCat.toLowerCase()}. Designed for all-day comfort and effortless styling, it offers the perfect balance of fit and fashion.`;
    }

    // Clean up title
    let finalTitle = aiData.title || parsedData.title;
    finalTitle = finalTitle
      .replace(/\bLool\b/g, 'Look')
      .replace(/\|+/g, ' - ')
      .replace(/\s*:\s*Amazon\.in\s*:\s*Fashion/gi, '')
      .replace(/\([^\)]+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({
      title: finalTitle,
      price: parsedData.price,
      originalPrice: parsedData.originalPrice || undefined,
      description: aiData.description,
      images: parsedData.images,
      inStock: parsedData.inStock,
      brand: aiData.brand || '',
      category: aiData.category || '',
      availableSizes: aiData.availableSizes || '',
      colors: aiData.colors || '',
      clothType: aiData.clothType || '',
      occasion: aiData.occasion || 'casual',
      debug: {
        rawUrl,
        resolvedUrl,
        canonicalUrl,
        tierUsed: fetchResult.tierUsed,
        status: 'SUCCESS'
      }
    });

  } catch (error: any) {
    console.error('[SCRAPER_ERROR]', error);
    return NextResponse.json({
      error: error.message || 'Scraping failed',
      status: 'FAILED'
    }, { status: 500 });
  }
}
