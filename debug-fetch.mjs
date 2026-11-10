import { gotScraping } from 'got-scraping';

async function testApi(name, url, headers = {}) {
  console.log(`\n================ Testing API ${name}: ${url} ================`);
  try {
    const res = await gotScraping({
      url,
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        ...headers
      },
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome' }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      },
      timeout: { request: 10000 }
    });
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body Length: ${res.body.length}`);
    console.log(`Preview: ${res.body.substring(0, 300)}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    if (err.response) {
      console.log(`Response Status: ${err.response.statusCode}`);
      console.log(`Response Body Preview: ${err.response.body?.substring(0, 300)}`);
    }
  }
}

async function run() {
  await testApi('Myntra Gateway API', 'https://www.myntra.com/gateway/v2/product/26500000', {
    'x-meta-app': 'channel=web',
    'referer': 'https://www.myntra.com/'
  });
  await testApi('Ajio API', 'https://www.ajio.com/api/p/466579899_blue', {
    'referer': 'https://www.ajio.com/'
  });
  await testApi('Meesho API', 'https://www.meesho.com/api/v1/products/6h6xba', {
    'referer': 'https://www.meesho.com/'
  });
}

run();
