import { gotScraping } from 'got-scraping';

async function testProxies() {
  const target = 'https://www.myntra.com/26500000';
  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
    `https://proxy.cors.sh/${target}`,
    `https://r.jina.ai/${target}`
  ];

  for (const p of proxies) {
    try {
      console.log(`\nTesting: ${p.substring(0, 60)}...`);
      const res = await gotScraping({
        url: p,
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: { request: 8000 }
      });
      console.log(`Status: ${res.statusCode}, Length: ${res.body.length}`);
      console.log(`Has myx: ${res.body.includes('window.__myx')}`);
      console.log(`Has Maintenance: ${res.body.includes('Site Maintenance')}`);
      console.log(`Preview: ${res.body.substring(0, 200)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testProxies();
