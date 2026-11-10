const testCases = [
  { platform: 'Amazon (Shortened)', url: 'https://amzn.in/d/076l1tcP' },
  { platform: 'Amazon (Direct)', url: 'https://www.amazon.in/dp/B0DWK2B887' },
  { platform: 'Flipkart (Direct)', url: 'https://www.flipkart.com/frex-baggy-fit-men-black-jeans/p/itma452d10c0f9e3?pid=JEAHSEQJPGYZKKYZ' },
  { platform: 'Flipkart (Affiliate / Deep)', url: 'https://dl.flipkart.com/dl/frex-baggy-fit-men-black-jeans/p/itma452d10c0f9e3?pid=JEAHSEQJPGYZKKYZ&affid=partner123&utm_source=affiliate' },
  { platform: 'Myntra (Direct)', url: 'https://www.myntra.com/26500000' },
  { platform: 'Myntra (Affiliate / Deep)', url: 'https://www.myntra.com/jeans/kotty/kotty-women-regular-fit-high-rise-jeans/26500000/buy?utm_source=cuelinks&utm_medium=affiliate' },
  { platform: 'Ajio (Direct)', url: 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue' },
  { platform: 'Ajio (Affiliate / Deep)', url: 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue?utm_source=affiliate' },
  { 
    platform: 'Meesho (Client-Assisted Fallback)', 
    url: 'https://www.meesho.com/trendy-attractive-women-jeans/p/6h6xba',
    rawHtml: `<!DOCTYPE html><html><head><title>Trendy Attractive Women Jeans: Meesho</title><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"initialState":{"product":{"details":{"data":{"name":"Trendy Attractive Women High Rise Denim Jeans","price":489,"description":"Premium stretchable high rise denim jeans for all-day comfort.","validSizes":["28","30","32","34"],"category_name":"Jeans","images":["https://images.meesho.com/images/products/6h6xba/1_512.jpg","https://images.meesho.com/images/products/6h6xba/2_512.jpg"]}}}}}}</script></head><body><h1>Trendy Attractive Women Jeans</h1></body></html>`
  }
];

async function runTests() {
  console.log('================================================================');
  console.log('🚀 ZERO-FAILURE SCRAPER TEST SUITE (ALL 5 PLATFORMS x LINK TYPES)');
  console.log('================================================================\n');

  const results = [];

  for (const tc of testCases) {
    console.log(`\n--- Testing ${tc.platform} ---`);
    console.log(`Input URL: ${tc.url}`);
    const start = Date.now();
    try {
      const res = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: tc.url,
          rawHtml: tc.rawHtml || undefined
        })
      });
      const elapsed = Date.now() - start;
      const data = await res.json();

      if (res.ok && data.title) {
        console.log(`✅ [SUCCESS ${res.status}] in ${elapsed}ms`);
        console.log(`   Canonical URL : ${data.debug?.canonicalUrl || 'N/A'}`);
        console.log(`   Tier Used     : ${data.debug?.tierUsed || 'N/A'}`);
        console.log(`   Title         : ${data.title}`);
        console.log(`   Price         : ₹${data.price}`);
        console.log(`   Brand         : ${data.brand || 'N/A'}`);
        console.log(`   Category      : ${data.category || 'N/A'}`);
        console.log(`   Sizes         : ${data.availableSizes || 'N/A'}`);
        console.log(`   Cloth / Fabric: ${data.clothType || 'N/A'}`);
        console.log(`   Colors        : ${data.colors || 'N/A'}`);
        console.log(`   Occasion      : ${data.occasion || 'N/A'}`);
        console.log(`   Images Count  : ${data.images?.length || 0}`);
        console.log(`   In Stock      : ${data.inStock}`);

        results.push({
          platform: tc.platform,
          status: 'SUCCESS (200)',
          tier: data.debug?.tierUsed,
          title: data.title.substring(0, 45) + (data.title.length > 45 ? '...' : ''),
          price: `₹${data.price}`,
          brand: data.brand,
          category: data.category,
          sizes: data.availableSizes,
          time: `${elapsed}ms`
        });
      } else {
        console.log(`❌ [FAILED ${res.status}] in ${elapsed}ms:`, data.error || data);
        results.push({
          platform: tc.platform,
          status: 'FAILED',
          error: data.error || res.statusText,
          time: `${elapsed}ms`
        });
      }
    } catch (err) {
      console.log(`❌ [EXCEPTION]: ${err.message}`);
      results.push({
        platform: tc.platform,
        status: 'EXCEPTION',
        error: err.message
      });
    }
  }

  console.log('\n\n================================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY');
  console.log('================================================================');
  console.table(results);
}

runTests();
