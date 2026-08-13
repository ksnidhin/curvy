(() => {
  // Utility to clean text
  const clean = (str) => {
    if (!str) return '';
    return str.replace(/\\s+/g, ' ').trim();
  };

  // Attempt to parse JSON-LD Product schema
  let schemaData = null;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.innerText);
      // Sometimes it's an array, sometimes a single object, sometimes inside a @graph
      const items = Array.isArray(json) ? json : (json['@graph'] || [json]);
      const product = items.find(item => item['@type'] === 'Product' || item['@type'] === 'ProductGroup');
      if (product) {
        schemaData = product;
        break;
      }
    } catch (e) {}
  }

  let title = '';
  let price = '';
  let description = '';
  let images = [];

  // --- Title ---
  if (schemaData && schemaData.name) {
    title = schemaData.name;
  } else {
    // Amazon specific fallback
    const amznTitle = document.querySelector('#productTitle');
    if (amznTitle) title = amznTitle.innerText;
    else title = document.querySelector('meta[property="og:title"]')?.content || document.title;
  }

  // --- Price ---
  if (schemaData && schemaData.offers) {
    const offers = Array.isArray(schemaData.offers) ? schemaData.offers[0] : (schemaData.offers.offers?.[0] || schemaData.offers);
    if (offers.price) price = offers.price.toString();
  }
  if (!price) {
    // Try Amazon price
    const amzPrice = document.querySelector('.a-price-whole');
    if (amzPrice) {
      price = amzPrice.innerText.replace(/[^0-9]/g, '');
    } else {
      // Generic price finders
      const possiblePrices = Array.from(document.querySelectorAll('.price, .Price, [class*="price"], [class*="Price"], [class*="pdp-price"], .discounted-price'));
      for (const el of possiblePrices) {
        const num = el.innerText.replace(/[^0-9.]/g, '');
        if (num && parseFloat(num) > 0) {
          price = num;
          break;
        }
      }
    }
  }

  // --- Description ---
  if (schemaData && schemaData.description) {
    description = schemaData.description;
  } else {
    const amzDesc = document.querySelector('#productDescription') || document.querySelector('#feature-bullets');
    if (amzDesc) {
      description = amzDesc.innerText;
    } else {
      description = document.querySelector('meta[property="og:description"]')?.content || document.querySelector('meta[name="description"]')?.content || '';
    }
  }

  // --- Images ---
  if (schemaData && schemaData.image) {
    if (Array.isArray(schemaData.image)) {
      images = schemaData.image.map(img => typeof img === 'string' ? img : img.url || img.contentUrl);
    } else if (typeof schemaData.image === 'string') {
      images = [schemaData.image];
    } else if (schemaData.image.url || schemaData.image.contentUrl) {
      images = [schemaData.image.url || schemaData.image.contentUrl];
    }
  }
  
  // If JSON-LD failed, try Amazon specifics
  if (images.length === 0) {
    const amzImages = document.querySelectorAll('#altImages img, .a-dynamic-image');
    amzImages.forEach(img => {
      let src = img.src || img.dataset.oldHires || img.dataset.src;
      // Strip amazon thumbnail sizing
      if (src && src.includes('._')) {
        src = src.replace(/\\._.*?_\\./, '.');
      }
      if (src && src.startsWith('http')) images.push(src);
    });
  }

  // If still empty, try Flipkart / generic OG
  if (images.length === 0) {
    const ogImg = document.querySelector('meta[property="og:image"]')?.content;
    if (ogImg) images.push(ogImg);
    
    // Fallback: grab largest images on the page
    const allImgs = Array.from(document.querySelectorAll('img')).filter(img => {
      const src = img.src;
      if (!src || src.startsWith('data:') || src.includes('logo') || src.includes('icon')) return false;
      return img.width > 200 || img.naturalWidth > 200;
    });
    
    images.push(...allImgs.map(i => i.src));
  }

  // Clean up
  title = clean(title);
  description = clean(description).substring(0, 1500); // truncate
  images = [...new Set(images.filter(Boolean))].slice(0, 5); // Unique and max 5
  
  if (!price) {
     price = price.replace(/[^0-9.]/g, ''); // Ensure only numbers
  }

  return {
    title,
    price,
    description,
    images
  };
})();
