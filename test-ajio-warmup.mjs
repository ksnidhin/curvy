import { gotScraping } from 'got-scraping';
import { CookieJar } from 'tough-cookie';

async function testAjio() {
  const jar = new CookieJar();
  console.log('Testing Ajio warmup through residential proxy...');
  try {
    // 1. Warmup homepage
    await gotScraping({
      url: 'https://www.ajio.com/',
      method: 'GET',
      proxyUrl: 'http://127.0.0.1:8888',
      cookieJar: jar,
      timeout: { request: 8000 }
    });
    console.log('Homepage warmed up, cookies in jar:', await jar.getCookies('https://www.ajio.com/'));

    // 2. Product API fetch with warmed-up cookies
    const res = await gotScraping({
      url: 'https://www.ajio.com/api/p/466579899_blue',
      method: 'GET',
      proxyUrl: 'http://127.0.0.1:8888',
      cookieJar: jar,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.ajio.com/'
      },
      timeout: { request: 12000 }
    });
    console.log(`Ajio API Status: ${res.statusCode}, len: ${res.body.length}`);
    console.log(`Preview: ${res.body.substring(0, 300)}`);
  } catch (e) {
    console.log(`Error: ${e.message}, status: ${e.response?.statusCode}`);
  }
}

testAjio();
