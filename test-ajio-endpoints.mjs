import { gotScraping } from 'got-scraping';

async function testEndpoints() {
  const code = '466579899_blue';
  const endpoints = [
    `https://www.ajio.com/api/product/${code}`,
    `https://www.ajio.com/api/products/${code}`,
    `https://www.ajio.com/api/p/466579899`,
    `https://www.ajio.com/api/product/466579899`
  ];

  for (const ep of endpoints) {
    try {
      const res = await gotScraping({
        url: ep,
        proxyUrl: 'http://127.0.0.1:8888',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://www.ajio.com/'
        },
        timeout: { request: 5000 }
      });
      console.log(`Endpoint: ${ep} -> Status: ${res.statusCode}, len: ${res.body.length}, preview: ${res.body.substring(0, 80)}`);
    } catch (e) {
      console.log(`Endpoint: ${ep} -> error: ${e.message}`);
    }
  }
}

testEndpoints();
