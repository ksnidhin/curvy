const cheerio = require('cheerio');
const url = 'https://www.amazon.in/dp/B0CHX1W1XY';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;

fetch(fetchUrl)
.then(r => r.text())
.then(html => {
  const $ = cheerio.load(html);
  let images = [];
  // Try finding high-res images in the DOM
  $('#altImages img, .a-dynamic-image').each((_, el) => {
    let src = $(el).attr('src') || $(el).data('old-hires') || $(el).attr('data-src');
    if (src && src.startsWith('http')) {
      // Remove Amazon thumbnail resizing parameters e.g. ._AC_US40_.jpg -> .jpg
      src = src.replace(/\._.*?\_\./, '.');
      images.push(src);
    }
  });

  if (!images.length) {
    const imageScript = $('script').filter((_, el) => $(el).text().includes('ImageBlockATF') || $(el).text().includes('colorImages')).text();
    const match = imageScript.match(/"hiRes":"(.*?)"/g);
    if (match) {
      images = match.map(m => m.replace(/"hiRes":"/, '').replace(/"$/, ''));
    }
  }

  if (!images.length) {
    images = [$('#landingImage').attr('src'), $('meta[property="og:image"]').attr('content')].filter(Boolean);
  }
  
  images = [...new Set(images)].filter(img => !img.includes('icon') && !img.includes('transparent'));
  console.log('Images found:', images);
})
.catch(console.error);
