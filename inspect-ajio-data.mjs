import { gotScraping } from 'got-scraping';

async function checkAjioData() {
  const res = await gotScraping({
    url: 'https://www.ajio.com/api/product/466579899_blue',
    proxyUrl: 'http://127.0.0.1:8888'
  });
  const preloadedMatch = res.body.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\})(?:;|\s*<\/script>)/s);
  if (preloadedMatch) {
    const data = JSON.parse(preloadedMatch[1]);
    console.log('Top keys in __PRELOADED_STATE__:', Object.keys(data));
    console.log('Product keys:', Object.keys(data.product || {}));
    if (data.product?.productDetails) {
      console.log('Product details keys:', Object.keys(data.product.productDetails));
      console.log('Name:', data.product.productDetails.name);
      console.log('Price:', data.product.productDetails.price);
      console.log('WasPrice:', data.product.productDetails.wasPriceData);
      console.log('Images:', data.product.productDetails.images?.length);
    }
  } else {
    console.log('No preloaded match found!');
  }
}

checkAjioData();
