import { gotScraping } from 'got-scraping';

async function testHomepage(name, url) {
  console.log(`\n================ Testing Homepage ${name}: ${url} ================`);
  try {
    const res = await gotScraping({
      url,
      method: 'GET',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
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
    console.log(`Set-Cookie: ${JSON.stringify(res.headers['set-cookie'])}`);
    console.log(`Body Length: ${res.body.length}`);
    console.log(`Preview: ${res.body.substring(0, 300)}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    if (err.response) {
      console.log(`Status: ${err.response.statusCode}`);
      console.log(`Body Preview: ${err.response.body?.substring(0, 300)}`);
    }
  }
}

async function run() {
  await testHomepage('Myntra Homepage', 'https://www.myntra.com/');
  await testHomepage('Ajio Homepage', 'https://www.ajio.com/');
  await testHomepage('Meesho Homepage', 'https://www.meesho.com/');
  await testHomepage('Flipkart Homepage', 'https://www.flipkart.com/');
}

run();