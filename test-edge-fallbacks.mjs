import { gotScraping } from 'got-scraping';

async function testEndpoint(label, options) {
  console.log(`\n--- Testing ${label} ---`);
  try {
    const res = await gotScraping({
      ...options,
      timeout: { request: 8000 }
    });
    console.log(`Status: ${res.statusCode}, Length: ${res.body.length}`);
    console.log(`Preview: ${res.body.substring(0, 250)}`);
    return { ok: res.statusCode === 200, length: res.body.length, body: res.body };
  } catch (err) {
    console.log(`Error: ${err.message}`);
    if (err.response) {
      console.log(`Response Status: ${err.response.statusCode}, Body: ${err.response.body?.substring(0, 150)}`);
    }
    return { ok: false, error: err.message };
  }
}

async function run() {
  // 1. Myntra Mobile App Gateway
  await testEndpoint('Myntra Mobile App Gateway', {
    url: 'https://www.myntra.com/gateway/v2/product/26500000',
    headers: {
      'User-Agent': 'Myntra/Android/14.0.0',
      'x-meta-app': 'channel=android',
      'Accept': 'application/json'
    }
  });

  // 2. Myntra via CORS / Edge proxy
  await testEndpoint('Myntra via AllOrigins', {
    url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.myntra.com/26500000')
  });

  // 3. Ajio Mobile API
  await testEndpoint('Ajio Mobile API', {
    url: 'https://www.ajio.com/api/p/466579899_blue',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.ajio.com/'
    }
  });

  // 4. Ajio via AllOrigins
  await testEndpoint('Ajio via AllOrigins', {
    url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.ajio.com/api/p/466579899_blue')
  });

  // 5. Meesho product via CorsProxy
  await testEndpoint('Meesho via AllOrigins', {
    url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.meesho.com/api/v1/products/6h6xba')
  });
}

run();
