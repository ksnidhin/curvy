import { gotScraping } from 'got-scraping';

async function testWithTunnel(platform, url) {
  console.log(`\nTesting ${platform}: ${url} through residential HTTP tunnel (127.0.0.1:8888)...`);
  try {
    const res = await gotScraping({
      url,
      method: 'GET',
      proxyUrl: 'http://127.0.0.1:8888',
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome' }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      },
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none'
      },
      timeout: { request: 15000 }
    });
    console.log(`${platform} Status: ${res.statusCode}, Length: ${res.body.length}`);
    console.log(`Is Site Maintenance: ${res.body.includes('Site Maintenance')}`);
    console.log(`Is Access Denied: ${res.body.includes('Access Denied')}`);
    console.log(`Title: ${res.body.match(/<title>(.*?)<\/title>/i)?.[1]}`);
    console.log(`Preview: ${res.body.substring(0, 150)}`);
    return { ok: true, status: res.statusCode, len: res.body.length };
  } catch (err) {
    console.log(`${platform} Error: ${err.message}, status: ${err.response?.statusCode}`);
    return { ok: false, error: err.message };
  }
}

async function run() {
  await testWithTunnel('Myntra', 'https://www.myntra.com/26500000');
  await testWithTunnel('Ajio', 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue');
  await testWithTunnel('Meesho', 'https://www.meesho.com/s/p/6h6xba');
}

run();
