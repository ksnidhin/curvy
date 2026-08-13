const cheerio = require('cheerio');
const url = 'https://link.amazon/B0dkzAqso';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
let finalUrlToScrape = url;

fetch(url, { method: 'HEAD', redirect: 'follow' }).then(res => {
  if (res.url) finalUrlToScrape = res.url;
  const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(finalUrlToScrape)}`;
  console.log('Final URL:', finalUrlToScrape);
  return fetch(fetchUrl);
}).then(r => r.text()).then(html => {
  console.log('Got HTML length:', html.length);
  if (html.includes('id="productTitle"')) console.log('SUCCESS! Found Product Title.');
  else console.log('HTML preview:', html.substring(0, 500));
}).catch(console.error);
