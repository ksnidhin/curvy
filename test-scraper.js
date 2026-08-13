const cheerio = require('cheerio');
const url = 'https://amzn.in/d/0e9R1qLq';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;

fetch(fetchUrl)
.then(r => r.text())
.then(html => {
  const $ = cheerio.load(html);
  const possiblePrices = $('.a-price-whole, .a-price, .apexPriceToPay, .priceToPay, [class*="price"]').map((_, el) => $(el).text()).get();
  console.log('Prices found:', possiblePrices.slice(0, 10));
})
.catch(console.error);
