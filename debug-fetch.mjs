import { gotScraping } from 'got-scraping';

async function testFetch(name, url) {
  console.log(`\n================ Testing ${name}: ${url} ================`);
  try {
    const res = await gotScraping({
      url,
      method: 'GET',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
        'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
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
  await testFetch('Myntra Direct', 'https://www.myntra.com/26500000');
  await testFetch('Meesho Direct', 'https://www.meesho.com/s/p/6h6xba');
  await testFetch('Ajio Direct', 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue');
}

run();
