import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    };

    const response = await fetch(url, { headers, next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch from url (status: ${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let title = '';
    let price = '';
    let description = '';
    let images: string[] = [];

    const finalUrl = response.url || url;
    const domain = new URL(finalUrl).hostname;

    if (domain.includes('amazon') || domain.includes('amzn')) {
      title = $('#productTitle').text().trim() || $('meta[property="og:title"]').attr('content') || $('title').text();
      const priceWhole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
      price = priceWhole;
      description = $('#productDescription').text().trim() || $('#feature-bullets').text().trim() || $('meta[property="og:description"]').attr('content') || '';
      
      // Amazon images are often in a script tag
      const imageScript = $('script').filter((_, el) => $(el).text().includes('ImageBlockATF')).text();
      const match = imageScript.match(/"colorImages":\s*{\s*"initial":\s*(\[.*?\])/);
      if (match) {
        try {
          const imgData = JSON.parse(match[1]);
          images = imgData.map((img: any) => img.hiRes || img.large).filter(Boolean);
        } catch(e) {}
      }
      if (!images.length) {
        images = [$('#landingImage').attr('src'), $('meta[property="og:image"]').attr('content')].filter(Boolean) as string[];
      }
      
      if (!price && (title.includes('Amazon.in') || title.includes('Robot Check') || title === '')) {
        throw new Error('Amazon anti-bot protection prevented scraping. Please enter details manually.');
      }
    } else if (domain.includes('flipkart')) {
      title = $('.B_NuCI').text().trim() || $('.VU-ZEz').text().trim();
      price = $('._30jeq3').first().text().replace(/[^0-9]/g, '') || $('.Nx9bqj').first().text().replace(/[^0-9]/g, '');
      description = $('._1mXcCf').text().trim();
      
      $('img._396cs4, img._2r_T1I').each((_, el) => {
        const src = $(el).attr('src');
        if (src) images.push(src.replace('128/128', '832/832').replace('128/128', '832/832'));
      });
    } else {
      // Generic fallback (Myntra, Ajio, Meesho, etc)
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push(ogImage);
      
      // Try generic price classes
      const possiblePrices = $('.price, .Price, [class*="price"], [class*="Price"], [class*="pdp-price"], .discounted-price').map((_, el) => $(el).text()).get();
      for (const p of possiblePrices) {
        const num = p.replace(/[^0-9.]/g, '');
        if (num && parseFloat(num) > 0) {
          price = num;
          break;
        }
      }

      // Try finding more images generically
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        // Only get reasonably sized images
        if (src && !src.includes('icon') && !src.includes('logo') && src.startsWith('http')) {
          images.push(src);
        }
      });
    }

    // Clean up
    title = title.replace(/\s+/g, ' ').trim();
    description = description.replace(/\s+/g, ' ').trim().substring(0, 1000); // Truncate description

    return NextResponse.json({
      title,
      price,
      description,
      images: [...new Set(images)].slice(0, 5) // Max 5 images
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
