import { chromium } from 'playwright';

async function testUrl(url, name) {
  console.log(`\n================ Testing Playwright on ${name}: ${url} ================`);
  const start = Date.now();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8'
      }
    });

    const page = await context.newPage();

    // Stealth scripts
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });

    console.log('Navigating...');
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`HTTP Status: ${response?.status()}`);

    // Wait a brief moment for dynamic hydration/challenge resolution
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log(`Page Title: ${title}`);

    const content = await page.content();
    console.log(`Page Content Length: ${content.length}`);
    console.log(`Is Site Maintenance: ${content.includes('Site Maintenance')}`);
    console.log(`Is Access Denied: ${content.includes('Access Denied')}`);
    console.log(`Contains window.__myx: ${content.includes('window.__myx')}`);
    console.log(`Contains window.__PRELOADED_STATE__: ${content.includes('window.__PRELOADED_STATE__')}`);
    console.log(`Elapsed: ${Date.now() - start}ms`);

  } catch (err) {
    console.error(`Playwright error: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function run() {
  await testUrl('https://www.myntra.com/26500000', 'Myntra');
  await testUrl('https://www.ajio.com/kotty-men-washed-slim-fit-jeans/p/466579899_blue', 'Ajio');
  await testUrl('https://www.meesho.com/s/p/6h6xba', 'Meesho');
}

run();
