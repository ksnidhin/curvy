import { gotScraping } from 'got-scraping';

async function testAjioVariants() {
  const ids = ['466579899_blue', '466579899', '466579899001'];
  for (const id of ids) {
    try {
      const res = await gotScraping({
        url: `https://www.ajio.com/api/p/${id}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.ajio.com/'
        },
        timeout: { request: 5000 }
      });
      console.log(`Ajio id=${id} status: ${res.statusCode}, len: ${res.body.length}, preview: ${res.body.substring(0, 150)}`);
    } catch (e) {
      console.log(`Ajio id=${id} error: ${e.message}`);
    }
  }
}

testAjioVariants();
