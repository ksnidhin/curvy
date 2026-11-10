import { gotScraping } from 'got-scraping';
import fs from 'fs';

async function testWithCookies() {
  const cookiesData = JSON.parse(fs.readFileSync('/home/azureuser/curvy/data/cookies.json', 'utf-8'));

  // Test Myntra
  console.log('Testing Myntra with synced browser cookies...');
  try {
    const res = await gotScraping({
      url: 'https://www.myntra.com/26500000',
      headers: {
        'cookie': cookiesData.myntra || '',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
        'referer': 'https://www.myntra.com/'
      },
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome' }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      },
      timeout: { request: 12000 }
    });
    console.log(`Myntra Status: ${res.statusCode}, Body Length: ${res.body.length}`);
    console.log(`Myntra Title: ${res.body.match(/<title>(.*?)<\/title>/i)?.[1]}`);
    console.log(`Myntra window.__myx present: ${res.body.includes('window.__myx')}`);
  } catch (err) {
    console.log(`Myntra Error: ${err.message}, status: ${err.response?.statusCode}`);
  }

  // Test Ajio
  console.log('\nTesting Ajio with synced browser cookies...');
  try {
    const res = await gotScraping({
      url: 'https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue',
      headers: {
        'cookie': cookiesData.ajio || '',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
        'referer': 'https://www.ajio.com/'
      },
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome' }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      },
      timeout: { request: 12000 }
    });
    console.log(`Ajio Status: ${res.statusCode}, Body Length: ${res.body.length}`);
    console.log(`Ajio Title: ${res.body.match(/<title>(.*?)<\/title>/i)?.[1]}`);
  } catch (err) {
    console.log(`Ajio Error: ${err.message}, status: ${err.response?.statusCode}`);
  }
}

testWithCookies();
