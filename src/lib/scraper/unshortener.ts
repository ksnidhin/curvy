import { gotScraping } from 'got-scraping';

const ECOMMERCE_PATTERN = /amazon\.[a-z.]+|amzn\.[a-z]+|flipkart\.com|fkrt\.it|myntra\.com|myntr\.it|meesho\.com|msho\.in|ajio\.com|ajiio\.in/i;

/**
 * Stage 1: Universal Affiliate & Short-Link Unshortener
 * Resolves any shortened URL, affiliate link, or mobile deep link (amzn.in, fkrt.it,
 * myntr.it, msho.in, ajiio.in, ekaro.in, bitli.in, linksredirect.com, cuelinks, etc.)
 * using an isolated cookie-free client, following both HTTP 3xx and JS/Meta redirects.
 */
export async function unshortenUrl(rawUrl: string, maxDepth = 5): Promise<string> {
  let currentUrl = (rawUrl || '').trim();
  if (!currentUrl) return '';

  for (let depth = 0; depth < maxDepth; depth++) {
    let finalHttpUrl = currentUrl;
    let responseBody = '';

    try {
      // Step A: HTTP 3xx redirect resolution with clean Chrome TLS impersonation and no cookies
      const res = await gotScraping({
        url: currentUrl,
        method: 'GET',
        followRedirect: true,
        maxRedirects: 10,
        headerGeneratorOptions: {
          browsers: [{ name: 'chrome' }],
          devices: ['desktop'],
          operatingSystems: ['windows']
        },
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none'
        },
        timeout: { request: 12000 }
      });

      finalHttpUrl = res.url || currentUrl;
      responseBody = res.body || '';
    } catch (err: any) {
      if (err.response && err.response.url) {
        finalHttpUrl = err.response.url;
        responseBody = err.response.body || '';
      }
    }

    currentUrl = finalHttpUrl;

    // If we've already reached a supported e-commerce domain, check if it contains a nested deep affiliate redirect
    if (ECOMMERCE_PATTERN.test(currentUrl)) {
      // Some affiliate links wrap the target in a query param, e.g. ?url=https%3A%2F%2Fwww.flipkart.com%2F...
      try {
        const u = new URL(currentUrl);
        const nested = u.searchParams.get('url') || u.searchParams.get('dest') || u.searchParams.get('target');
        if (nested && ECOMMERCE_PATTERN.test(nested)) {
          currentUrl = decodeURIComponent(nested);
          continue;
        }
      } catch {}
      return currentUrl;
    }

    // Step B: HTML Meta / JavaScript Redirect Fallback
    // Used by affiliate networks (EarnKaro, Cuelinks, CashKaro, Firebase page.link, Branch.io)
    if (responseBody) {
      // 1. Meta refresh tag: <meta http-equiv="refresh" content="0;url=...">
      const metaMatch = responseBody.match(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']?[0-9]*;\s*url=([^"'>\s]+)/i);
      if (metaMatch && metaMatch[1]) {
        currentUrl = metaMatch[1].replace(/&amp;/g, '&').trim();
        continue;
      }

      // 2. JavaScript location redirect: window.location.href = "...", location.replace("...")
      const jsMatch = responseBody.match(/(?:window\.location(?:\.href)?|location\.replace|location\.href)\s*=\s*["']([^"']+)["']/i);
      if (jsMatch && jsMatch[1]) {
        currentUrl = jsMatch[1].replace(/&amp;/g, '&').trim();
        continue;
      }

      // 3. Embedded e-commerce hyperlink in HTML body
      const linkMatch = responseBody.match(/https?:\/\/(?:www\.)?(?:amazon\.[a-z.]+|amzn\.[a-z]+|flipkart\.com|fkrt\.it|myntra\.com|myntr\.it|meesho\.com|msho\.in|ajio\.com|ajiio\.in)\/[^\s"'<>]+/i);
      if (linkMatch && linkMatch[0]) {
        currentUrl = linkMatch[0].replace(/&amp;/g, '&').trim();
        continue;
      }
    }

    break;
  }

  return currentUrl;
}
