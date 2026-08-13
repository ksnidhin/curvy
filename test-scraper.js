const cheerio = require('cheerio');
const url = 'https://amzn.in/d/OeguEH5T';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&premium=true`;

console.log('Fetching:', fetchUrl);
fetch(fetchUrl)
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const title = $('title').text();
    console.log('Got HTML length:', html.length);
    console.log('Document Title:', title);
    console.log('HTML Snippet:', html.substring(0, 100));
  })
  .catch(console.error);
