import { gotScraping } from 'got-scraping';

async function checkMeesho() {
  const urls = [
    'https://www.meesho.com/s/p/6h6xba',
    'https://www.meesho.com/api/v1/products/6h6xba',
    'https://www.meesho.com/trendy-attractive-women-jeans/p/6h6xba'
  ];

  for (const u of urls) {
    try {
      const res = await gotScraping({
        url: u,
        proxyUrl: 'http://127.0.0.1:8888',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
          'referer': 'https://www.meesho.com/'
        },
        timeout: { request: 10000 }
      });
      console.log(`Meesho ${u} -> Status: ${res.statusCode}, len: ${res.body.length}, preview: ${res.body.substring(0, 150)}`);
      console.log(`Has __NEXT_DATA__: ${res.body.includes('__NEXT_DATA__')}`);
    } catch (e) {
      console.log(`Meesho ${u} -> error: ${e.message}`);
    }
  }
}

checkMeesho();
