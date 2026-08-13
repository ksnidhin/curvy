const url = 'https://www.amazon.in/dp/B0CHX1W1XY';
const scraperApiKey = '17b71d086ce0859b314187fdbd489745';
const fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;

console.log('Fetching:', fetchUrl);

fetch(fetchUrl)
.then(r => r.text())
.then(html => {
  console.log('Got HTML length:', html.length);
  if (html.includes('id="productTitle"')) console.log('SUCCESS! Found Product Title.');
  else console.log(html.substring(0, 500));
})
.catch(console.error);
