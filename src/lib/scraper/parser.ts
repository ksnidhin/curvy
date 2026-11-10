import * as cheerio from 'cheerio';
import { SupportedPlatform } from './canonicalizer';

export interface ParsedProduct {
  title: string;
  price: string;
  originalPrice?: string;
  description: string;
  images: string[];
  inStock: boolean;
  brand?: string;
  rawDetails: Record<string, any>;
}

/**
 * Stage 4: Resilient Data Extraction (JSON-First, DOM-Second)
 * Priority Order:
 * 1. Embedded State JSON (window.__myx, window.__PRELOADED_STATE__, __NEXT_DATA__, __INITIAL_STATE__)
 * 2. Schema.org JSON-LD (@type: "Product")
 * 3. OpenGraph & Meta Tags (og:title, og:image, product:price:amount)
 * 4. Resilient CSS / DOM Selectors
 */
export function parseProductData(
  content: string,
  platform: SupportedPlatform,
  isJsonPayload = false
): ParsedProduct {
  let title = '';
  let price = '';
  let originalPrice = '';
  let description = '';
  let images: string[] = [];
  let inStock = true;
  let brand = '';
  const rawDetails: Record<string, any> = {};

  // --------------------------------------------------------------------------
  // 1. Direct JSON Payload Parsing (Tier 3 API Response)
  // --------------------------------------------------------------------------
  if (isJsonPayload || (content.trim().startsWith('{') && content.trim().endsWith('}'))) {
    try {
      const data = JSON.parse(content.trim());
      
      // Myntra Gateway JSON
      if (data?.pdpData || data?.style || data?.sizes) {
        const p = data.pdpData || data;
        title = p.name || p.title || '';
        brand = p.brand?.name || p.brand || '';
        price = p.price?.discounted?.toString() || p.price?.mrp?.toString() || '';
        originalPrice = p.price?.mrp?.toString() || '';
        description = p.description || p.productDetails?.map((d: any) => `${d.title}: ${d.description}`).join(' ') || '';
        
        if (p.media?.albums?.[0]?.images) {
          images = p.media.albums[0].images.map((img: any) => img.imageURL || img.src);
        }
        
        rawDetails.myntra = {
          sizes: Array.isArray(p.sizes) ? p.sizes.map((s: any) => s.label || s.size).join(', ') : '',
          color: p.baseColour || '',
          category: p.articleType?.typeName || '',
          attributes: p.articleAttributes
        };
        return sanitizeParsed({ title, price, originalPrice, description, images, inStock, brand, rawDetails });
      }

      // Ajio API JSON
      if (data?.code || data?.productDetails || data?.fnlColorVariantData) {
        const p = data.productDetails || data;
        title = p.name || '';
        brand = p.brandName || '';
        price = p.price?.value?.toString() || '';
        originalPrice = p.wasPriceData?.value?.toString() || '';
        description = p.description || '';
        if (p.images && Array.isArray(p.images)) {
          images = p.images.map((im: any) => im.url).filter(Boolean);
        }
        rawDetails.ajio = {
          brand: p.brandName,
          sizes: Array.isArray(p.variantOptions) ? p.variantOptions.map((v: any) => v.variantOptionQualifiers?.[0]?.value).filter(Boolean).join(', ') : '',
          features: p.featureData
        };
        return sanitizeParsed({ title, price, originalPrice, description, images, inStock, brand, rawDetails });
      }

      // Meesho API JSON
      if (data?.name && (data?.price || data?.validSizes)) {
        title = data.name || '';
        price = data.price?.toString() || '';
        description = data.description || '';
        if (data.images && Array.isArray(data.images)) {
          images = data.images.map((u: string) => u.replace(/_\d+\.(jpg|jpeg|png)$/i, '.$1'));
        }
        rawDetails.meesho = {
          validSizes: Array.isArray(data.validSizes) ? data.validSizes.join(', ') : '',
          attributes: data.product_attributes
        };
        return sanitizeParsed({ title, price, originalPrice, description, images, inStock, brand, rawDetails });
      }
    } catch {}
  }

  const $ = cheerio.load(content);

  // --------------------------------------------------------------------------
  // 2. Embedded State JSON Extraction (Platform Specific)
  // --------------------------------------------------------------------------
  if (platform === 'myntra') {
    const myxMatch = content.match(/window\.__myx\s*=\s*(\{.*?\});/s) || content.match(/<script>window\.__myx\s*=\s*(.*?)<\/script>/s);
    if (myxMatch && myxMatch[1]) {
      try {
        const myxData = JSON.parse(myxMatch[1]);
        const p = myxData?.pdpData;
        if (p) {
          title = p.name || $('title').text();
          brand = p.brand || '';
          price = p.price?.discounted?.toString() || p.price?.mrp?.toString() || '';
          originalPrice = p.price?.mrp?.toString() || '';
          description = p.description || '';
          if (p.media?.albums?.[0]?.images) {
            images = p.media.albums[0].images.map((im: any) => im.imageURL);
          }
          rawDetails.myntra = {
            sizes: Array.isArray(p.sizes) ? p.sizes.map((s: any) => s.label || s.size).join(', ') : '',
            color: p.baseColour || '',
            category: p.articleType?.typeName || '',
            attributes: p.articleAttributes
          };
        }
      } catch {}
    }
  } else if (platform === 'ajio') {
    const preloadedMatch = content.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});/s);
    if (preloadedMatch && preloadedMatch[1]) {
      try {
        const ajioState = JSON.parse(preloadedMatch[1]);
        const p = ajioState?.product?.productDetails;
        if (p) {
          title = p.name || '';
          brand = p.brandName || '';
          price = p.price?.value?.toString() || '';
          originalPrice = p.wasPriceData?.value?.toString() || '';
          description = p.description || '';
          if (p.images && Array.isArray(p.images)) {
            images = p.images.map((im: any) => im.url).filter(Boolean);
          }
          rawDetails.ajio = {
            sizes: Array.isArray(p.variantOptions) ? p.variantOptions.map((v: any) => v.variantOptionQualifiers?.[0]?.value).filter(Boolean).join(', ') : '',
            features: p.featureData
          };
        }
      } catch {}
    }
  } else if (platform === 'meesho') {
    const nextDataMatch = content.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const details = nextData?.props?.pageProps?.initialState?.product?.details?.data;
        if (details) {
          title = details.name || details.description?.substring(0, 80) || '';
          price = details.price?.toString() || '';
          description = details.description || '';
          if (Array.isArray(details.images)) {
            images = details.images.map((u: string) => u.replace(/_\d+\.(jpg|jpeg|png)$/i, '.$1'));
          }
          rawDetails.meesho = {
            validSizes: Array.isArray(details.validSizes) ? details.validSizes.join(', ') : '',
            category: details.category_name || details.catalog_name || '',
            attributes: details.product_attributes
          };
        }
      } catch {}
    }
  } else if (platform === 'flipkart') {
    const initialStateMatch = content.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);
    if (initialStateMatch && initialStateMatch[1]) {
      try {
        const fkState = JSON.parse(initialStateMatch[1]);
        // Extract from initialState if present
        const pageData = fkState?.pageDataV4?.page?.data;
        if (pageData) {
          rawDetails.flipkartState = true;
        }
      } catch {}
    }
  }

  // --------------------------------------------------------------------------
  // 3. Schema.org JSON-LD Extraction (@type: "Product")
  // --------------------------------------------------------------------------
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).text().trim();
      const ld = JSON.parse(text);
      const items = Array.isArray(ld) ? ld : [ld];
      for (const item of items) {
        if (item['@type'] === 'Product') {
          if (!title && item.name) title = item.name;
          if (!description && item.description) description = item.description;
          if (!brand && item.brand) {
            brand = typeof item.brand === 'string' ? item.brand : (item.brand.name || '');
          }
          if (item.image) {
            const ldImages = Array.isArray(item.image) ? item.image : [item.image];
            images.push(...ldImages.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean));
          }
          if (item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer?.price && !price) price = offer.price.toString();
            if (offer?.availability) {
              inStock = !offer.availability.toLowerCase().includes('outofstock');
            }
          }
        }
      }
    } catch {}
  });

  // --------------------------------------------------------------------------
  // 4. OpenGraph & Meta Tags Fallback
  // --------------------------------------------------------------------------
  if (!title) {
    title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text().trim();
  }

  if (!description) {
    description = $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') || '';
  }

  if (!images.length) {
    const ogImg = $('meta[property="og:image"]').attr('content');
    if (ogImg) images.push(ogImg);
  }

  if (!price) {
    const metaPrice = $('meta[property="product:price:amount"]').attr('content') ||
                      $('meta[property="og:price:amount"]').attr('content');
    if (metaPrice) price = metaPrice.replace(/[^0-9.]/g, '');
  }

  // --------------------------------------------------------------------------
  // 5. Resilient CSS / DOM Selectors
  // --------------------------------------------------------------------------
  if (platform === 'amazon') {
    if (!title) title = $('#productTitle').text().trim();
    
    // Price
    if (!price) {
      let amznPrice = $('.a-price-whole').map((_, el) => $(el).text()).get().find(t => t.trim().length > 0) || '';
      amznPrice = amznPrice.replace(/[^0-9]/g, '');
      if (!amznPrice) {
        amznPrice = $('.apexPriceToPay .a-offscreen, #priceblock_ourprice, #priceblock_dealprice').first().text().replace(/[^0-9]/g, '');
      }
      price = amznPrice;
    }

    // High-Res Images from Amazon scripts
    $('#altImages img, .a-dynamic-image').each((_, el) => {
      let src = ($(el).attr('src') || $(el).data('old-hires') || $(el).attr('data-src')) as string | undefined;
      if (typeof src === 'string' && src.startsWith('http')) {
        src = src.replace(/\._.*?\_\./, '.');
        images.push(src);
      }
    });

    if (!images.length) {
      const imgScript = $('script').filter((_, el) => $(el).text().includes('ImageBlockATF') || $(el).text().includes('colorImages')).text();
      const match = imgScript.match(/"hiRes":"(.*?)"/g);
      if (match) {
        images = match.map(m => m.replace(/"hiRes":"/, '').replace(/"$/, ''));
      }
    }

    // Amazon Brand, Sizes, Colors, Specs
    const amznBrand = $('.po-brand .po-break-word').first().text().trim() ||
                      $('#bylineInfo').text().replace(/Visit the\s+|Brand:\s+|Store/gi, '').trim();
    if (amznBrand && !brand) brand = amznBrand;

    const amznSizes: string[] = [];
    const selectedSize = $('#variation_size_name .selection').text().trim();
    if (selectedSize) amznSizes.push(selectedSize);

    $('#variation_size_name ul li, #variation_size_name select option, #native_dropdown_selected_size_name option, select#dropdown_selected_size_name option').each((_, el) => {
      const txt = $(el).text().replace(/select/i, '').trim();
      if (txt && !txt.toLowerCase().includes('select') && txt.length < 25) {
        amznSizes.push(txt);
      }
    });

    rawDetails.amazon = {
      brand: amznBrand,
      material: $('.po-material .po-break-word, .po-fabric .po-break-word').first().text().trim(),
      color: $('#variation_color_name .selection').text().trim() || $('.po-color .po-break-word').first().text().trim(),
      sizes: [...new Set(amznSizes)].join(', '),
      breadcrumbs: $('#wayfinding-breadcrumbs_feature_div').text().replace(/\s+/g, ' ').trim(),
      specs: $('#productOverview_feature_div, #detailBullets_feature_div').text().replace(/\s+/g, ' ').trim()
    };
  } else if (platform === 'flipkart') {
    if (!title) title = $('.B_NuCI, .VU-ZEz, h1').first().text().trim();
    if (!price) price = $('.Nx9bqj, ._30jeq3').first().text().replace(/[^0-9]/g, '');

    $('img._396cs4, img._2r_T1I, img.DByuf4').each((_, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src.replace('128/128', '832/832'));
    });

    const fkSizes: string[] = [];
    $('._1fGeJ5, .CDDvd_ li, ul._1q8vST li').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) fkSizes.push(txt);
    });

    rawDetails.flipkart = {
      brand: $('span.G6XhRU, .mEh187').first().text().trim(),
      sizes: [...new Set(fkSizes)].join(', '),
      color: $('._3V2wfe').first().text().trim(),
      specs: $('table._14cfVK').text().replace(/\s+/g, ' ').trim(),
      breadcrumbs: $('._1MR4o5').text().replace(/\s+/g, ' ').trim()
    };
  } else if (platform === 'ajio') {
    if (!title) title = $('.prod-name').first().text().trim();
    if (!price) price = $('.prod-sp').first().text().replace(/[^0-9]/g, '');
    if (!brand) brand = $('.brand-name').first().text().trim();

    $('img.preview-img, img.prod-img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.startsWith('http')) images.push(src);
    });

    const ajioSizes: string[] = [];
    $('.size-variant-item, .size-swatch').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) ajioSizes.push(txt);
    });

    rawDetails.ajioDom = {
      sizes: [...new Set(ajioSizes)].join(', '),
      breadcrumbs: $('.breadcrumb').text().replace(/\s+/g, ' ').trim()
    };
  }

  // Generic fallback for any remaining missing price / images
  if (!price) {
    const possiblePrices = $('.price, .Price, [class*="price"], [class*="Price"], [class*="pdp-price"], .discounted-price, h4').map((_, el) => $(el).text()).get();
    for (const p of possiblePrices) {
      if (p.includes('₹') || p.includes('Rs') || /\d+/.test(p)) {
        const num = p.replace(/[^0-9]/g, '');
        if (num && parseInt(num, 10) > 0) {
          price = num;
          break;
        }
      }
    }
  }

  return sanitizeParsed({ title, price, originalPrice, description, images, inStock, brand, rawDetails });
}

function sanitizeParsed(data: ParsedProduct): ParsedProduct {
  const cleanTitle = (data.title || '').replace(/\s+/g, ' ').trim();
  const cleanDesc = (data.description || '').replace(/\s+/g, ' ').trim().substring(0, 1500);
  const cleanImages = [...new Set(data.images || [])]
    .filter(u => typeof u === 'string' && u.startsWith('http') && !u.includes('icon') && !u.includes('logo') && !u.includes('transparent'))
    .slice(0, 5);

  return {
    title: cleanTitle,
    price: data.price || '',
    originalPrice: data.originalPrice || '',
    description: cleanDesc,
    images: cleanImages,
    inStock: data.inStock ?? true,
    brand: (data.brand || '').trim(),
    rawDetails: data.rawDetails || {}
  };
}
