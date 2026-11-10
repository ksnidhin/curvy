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

    // 2. Product fetch
    const res = await gotScraping({
      url: 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue',
      method: 'GET',
      proxyUrl: 'http://127.0.0.1:8888',
      cookieJar: jar,
      headers: {
        'referer': 'https://www.ajio.com/',
        'sec-fetch-site': 'same-origin'
      },
      timeout: { request: 12000 }
    });
    console.log(`Ajio Status: ${res.statusCode}, len: ${res.body.length}`);
    console.log(`Title: ${res.body.match(/<title>(.*?)<\/title>/i)?.[1]}`);
    console.log(`Has __PRELOADED_STATE__: ${res.body.includes('__PRELOADED_STATE__')}`);
  } catch (e) {
    console.log(`Error: ${e.message}, status: ${e.response?.statusCode}`);
  }
}

testAjio();
