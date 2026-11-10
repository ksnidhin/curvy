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

const AI_CATALOG_PROMPT = `You are an expert fashion catalog editor for the brand "Curvy Girls".
Analyze the scraped product data and accurately structure the fashion catalog fields.

ALLOWED CATEGORIES (Pick EXACTLY ONE):
["Co-ord Sets", "Dresses", "Jeans", "Kurtis & Tunics", "Nightwear", "Tops", "Traditional Wear", "Western Wear", "Wrap tops"]

ALLOWED OCCASIONS (Pick EXACTLY ONE, lowercase):
["casual", "formal", "party", "ethnic"]

RULES:
1. "title": A clean product title without seller spam, pipes ("|"), or typos (e.g. fix "Lool" -> "Look", remove "Amazon.in: Fashion", remove size/color in parentheses). Max 65 characters.
2. "brand": Brand name (e.g. "KOTTY", "FREX", "Zara").
3. "category": Pick ONE EXACT string from ALLOWED CATEGORIES.
4. "availableSizes": Comma-separated sizes (e.g. "28, 30, 32, 34, 36" for pants/jeans, or "S, M, L, XL" for tops/dresses).
5. "colors": Comma-separated primary colors (e.g. "Blue", "Black", "Maroon").
6. "clothType": Fabric or material (e.g. "Denim", "Cotton", "Silk", "Georgette", "Polyester", "Rayon").
7. "occasion": ONE from ALLOWED OCCASIONS ("casual", "formal", "party", "ethnic").
8. "description": An appealing, boutique-style 2-3 sentence description highlighting fit, style, and comfort.

Respond STRICTLY with a valid JSON object matching this schema:
{
  "title": "Clean Product Title",
  "brand": "Brand Name",
  "category": "Jeans",
  "availableSizes": "28, 30, 32, 34, 36",
  "colors": "Blue",
  "clothType": "Denim",
  "occasion": "casual",
  "description": "Attractive boutique description."
}`;

async function extractWithAi(
  title: string,
  description: string,
  rawDetails: Record<string, any>,
  bodyText: string
): Promise<StructuredProductExtraction | null> {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';

  const inputSnippet = `
Scraped Title: ${title}
Scraped Description: ${description}
Extracted Details: ${JSON.stringify(rawDetails)}
Page Snippet: ${bodyText.substring(0, 2500)}
`.trim();

  // 1. Try Gemini 3.8 Flash (with strict 3.5s timeout)
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${AI_CATALOG_PROMPT}\n\n${inputSnippet}` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        })
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return JSON.parse(rawText.trim());
        }
      }
    } catch {}
  }

  // 2. Fast Fallback: Groq (Llama 3.3 70B, ~300ms response time)
  if (groqKey) {
    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: groqKey });
      const comp = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: AI_CATALOG_PROMPT },
          { role: 'user', content: inputSnippet }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });
      const content = comp.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content.trim());
      }
    } catch {}
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, cookies: reqCookies, rawHtml } = body;

    if (!url && !rawHtml) {
      return NextResponse.json({ success: false, error: 'URL or HTML is required' }, { status: 400 });
    }

    const rawUrl = (url || '').trim();

    // ------------------------------------------------------------------------
    // STAGE 1: Universal Affiliate & Short-Link Unshortener
    // ------------------------------------------------------------------------
    const resolvedUrl = rawUrl ? await unshortenUrl(rawUrl) : '';

    // ------------------------------------------------------------------------
    // STAGE 2: Strict URL Canonicalization
    // ------------------------------------------------------------------------
    const { canonicalUrl, platform, productId } = canonicalizeUrl(resolvedUrl || rawUrl);

    // ------------------------------------------------------------------------
    // STAGE 3: 3-Tier Zero-Failure Fetching Engine (or direct HTML from client)
    // ------------------------------------------------------------------------
    let htmlContent = '';
    let tierUsed: string = 'TIER_1_DIRECT_TLS';
    let isJsonPayload = false;

    if (rawHtml && typeof rawHtml === 'string' && rawHtml.length > 100) {
      htmlContent = rawHtml;
      tierUsed = 'CLIENT_ASSISTED_HTML';
    } else {
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

      try {
        const fetchResult = await fetchWithFallback(
          canonicalUrl,
          platform,
          productId,
          optionalAmazonCookie
        );
        htmlContent = fetchResult.html;
        tierUsed = fetchResult.tierUsed;
        isJsonPayload = !!fetchResult.isJsonPayload;

        console.log(
          `[SCRAPER_PIPELINE] [RAW_URL]: ${rawUrl} -> [RESOLVED_URL]: ${resolvedUrl} -> [CANONICAL_URL]: ${canonicalUrl} -> [TIER_USED]: ${fetchResult.tierUsed} -> [STATUS]: SUCCESS (${fetchResult.statusCode})`
        );
      } catch (fetchErr: any) {
        // If server-side fetch is blocked by Akamai on Azure Dubai IP, notify client for assist
        console.warn(`[SCRAPER_WARN] Server fetch blocked for ${canonicalUrl}: ${fetchErr.message}`);
        return NextResponse.json({
          success: false,
          needsClientFetch: true,
          canonicalUrl: canonicalUrl || rawUrl,
          platform,
          productId,
          error: `Platform edge security restricted server IP for ${platform.toUpperCase()}. Use client-assisted fetch or paste browser cookies.`,
          status: 'NEEDS_CLIENT_FETCH'
        }, { status: 200 });
      }
    }

    // ------------------------------------------------------------------------
    // STAGE 4: Resilient Data Extraction (JSON-First, DOM-Second)
    // ------------------------------------------------------------------------
    const parsedData = parseProductData(htmlContent, platform, isJsonPayload);

    const bodySnippet = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 3000);

    const aiResult = await extractWithAi(
      parsedData.title,
      parsedData.description,
      parsedData.rawDetails,
      bodySnippet
    );

    const fullTextSearch = `${parsedData.title} ${parsedData.description} ${JSON.stringify(parsedData.rawDetails)}`;

    let brand = aiResult?.brand || parsedData.brand || '';
    if (!brand) {
      const brandMatch = parsedData.title.match(/^([A-Za-z0-9&]+)(?:\s+Men|\s+Women|\s+'s|\s+Solid|\s+Regular|\s+Slim)/i);
      if (brandMatch && brandMatch[1]) brand = brandMatch[1].trim();
    }

    let clothType = aiResult?.clothType || '';
    if (!clothType) {
      const fabricMatch = fullTextSearch.match(/\b(Denim|Cotton Blend|Cotton|Linen|Silk|Georgette|Chiffon|Rayon|Polyester|Satin|Crepe|Lycra)\b/i);
      if (fabricMatch && fabricMatch[1]) {
        clothType = fabricMatch[1].charAt(0).toUpperCase() + fabricMatch[1].slice(1).toLowerCase();
      }
    }

    let colors = aiResult?.colors || '';
    if (!colors) {
      const colorMatch = fullTextSearch.match(/\b(Navy Blue|Light Blue|Dark Blue|Blue|Black|White|Grey|Red|Pink|Yellow|Green|Olive|Maroon)\b/i);
      if (colorMatch && colorMatch[1]) {
        colors = colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1).toLowerCase();
      }
    }

    let availableSizes = aiResult?.availableSizes || '';
    if (!availableSizes) {
      const sizeMatch = fullTextSearch.match(/[\(,]\s*(?:Size:\s*)?([2-4][0-9]|XXS|XS|S|M|L|XL|[2-8]XL)\s*[\),]/i) ||
                        fullTextSearch.match(/\b(?:size|waist|)\s*([2-4][0-9]|XXS|XS|S|M|L|XL|[2-8]XL)\b/i);
      if (sizeMatch && sizeMatch[1]) availableSizes = sizeMatch[1].toUpperCase();
    }

    let category = aiResult?.category || '';
    if (!category) {
      const lower = fullTextSearch.toLowerCase();
      if (lower.includes('jean') || lower.includes('denim')) category = 'Jeans';
      else if (lower.includes('dress')) category = 'Dresses';
      else if (lower.includes('kurti') || lower.includes('kurta')) category = 'Kurtis & Tunics';
      else if (lower.includes('night') || lower.includes('sleepwear')) category = 'Nightwear';
      else if (lower.includes('co-ord') || lower.includes('set')) category = 'Co-ord Sets';
      else if (lower.includes('top') || lower.includes('tee') || lower.includes('shirt')) category = 'Tops';
      else category = 'Western Wear';
    }

    let occasion = (aiResult?.occasion || 'casual').toLowerCase();
    const validOccasions = ['casual', 'formal', 'party', 'ethnic'];
    if (!validOccasions.includes(occasion)) occasion = 'casual';

    let description = aiResult?.description || parsedData.description || '';
    if (!description || description.includes('Amazon.in:') || description.includes('Robot Check')) {
      const cBrand = brand || 'This';
      const cCloth = clothType ? `${clothType} ` : '';
      const cCat = category || 'piece';
      description = `Elevate your wardrobe with this stylish ${cBrand} ${cCloth}${cCat.toLowerCase()}. Designed for all-day comfort and effortless styling, offering the perfect balance of fit and fashion.`;
    }

    let finalTitle = aiResult?.title || parsedData.title || '';
    finalTitle = finalTitle
      .replace(/\bLool\b/g, 'Look')
      .replace(/\|+/g, ' - ')
      .replace(/\s*:\s*Amazon\.in\s*:\s*Fashion/gi, '')
      .replace(/\([^\)]+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({
      success: true,
      title: finalTitle,
      price: parsedData.price || '0',
      originalPrice: parsedData.originalPrice || undefined,
      description,
      images: parsedData.images || [],
      inStock: parsedData.inStock ?? true,
      brand,
      category,
      availableSizes,
      colors,
      clothType,
      occasion,
      debug: {
        rawUrl,
        resolvedUrl,
        canonicalUrl,
        tierUsed,
        status: 'SUCCESS'
      }
    });

  } catch (error: any) {
    console.error('[SCRAPER_ERROR]', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Scraping failed',
      status: 'FAILED'
    }, { status: 200 });
  }
}
