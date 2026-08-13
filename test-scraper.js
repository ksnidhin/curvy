const cheerio = require('cheerio');
const url = 'https://link.amazon/B0dkzAqso';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;

fetch(fetchUrl)
.then(r => r.text())
.then(html => {
  const $ = cheerio.load(html);
  const possiblePrices = $('.a-price-whole, .a-price, .apexPriceToPay, .priceToPay, [class*="price"]').map((_, el) => $(el).text()).get();
  console.log('Got HTML length:', html.length, 'Prices found:', possiblePrices.slice(0, 10));
})
.catch(console.error);
