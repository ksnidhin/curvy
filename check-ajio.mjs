import { gotScraping } from 'got-scraping';

async function check() {
  const res = await gotScraping({
    url: 'https://www.ajio.com/api/product/466579899_blue',
    proxyUrl: 'http://127.0.0.1:8888'
  });
  console.log('Ajio Has preloaded state:', res.body.includes('__PRELOADED_STATE__'));
  console.log('Ajio Title:', res.body.match(/<title>(.*?)<\/title>/i)?.[1]);
}

check();
