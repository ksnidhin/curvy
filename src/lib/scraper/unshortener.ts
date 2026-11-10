import { gotScraping } from 'got-scraping';

const ECOMMERCE_PATTERN = /amazon\.[a-z.]+|amzn\.[a-z]+|flipkart\.com|myntra\.com|meesho\.com|ajio\.com/i;
const SHORTENER_PATTERN = /amzn\.(?:in|to)|fkrt\.(?:it|cc)|myntr\.it|msho\.in|ajiio\.in|ekaro\.in|bitli\.in|linksredirect\.com|cuelinks\.com|cashkaro\.com|page\.link|branch\.io|bit\.ly|tinyurl\.com/i;

function extractNestedTarget(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    const candidateParams = ['url', 'dest', 'target', 'redirect', 'link', 'r', 'destination', 'redirect_url'];
    for (const p of candidateParams) {
      const val = u.searchParams.get(p);
      if (val) {
        const decoded = decodeURIComponent(val);
        if (ECOMMERCE_PATTERN.test(decoded)) {
          return decoded;
        }
      }
    }
  } catch {}
  return null;
}

/**
 * Stage 1: Universal Affiliate & Short-Link Unshortener
 * Resolves shortened URLs and affiliate redirects via a manual `followRedirect: false`
 * loop to avoid 403/400 errors from regional WAFs during redirect chains.
 */
export async function unshortenUrl(rawUrl: string, maxHops = 8): Promise<string> {
  let currentUrl = (rawUrl || '').trim();
  if (!currentUrl) return '';

  // Quick check for pre-encoded nested destination
  const initialNested = extractNestedTarget(currentUrl);
  if (initialNested) {
    currentUrl = initialNested;
  }

  for (let hop = 0; hop < maxHops; hop++) {
    // If it's already a direct canonical e-commerce product URL (not a shortener), stop early
    if (ECOMMERCE_PATTERN.test(currentUrl) && !SHORTENER_PATTERN.test(currentUrl)) {
      // Check for nested parameter one more time
      const nested = extractNestedTarget(currentUrl);
      if (nested) {
        currentUrl = nested;
        continue;
      }
      return currentUrl;
    }

    try {
      const res = await gotScraping({
        url: currentUrl,
        method: 'GET',
        followRedirect: false,
        throwHttpErrors: false,
        headerGeneratorOptions: {
          browsers: [{ name: 'chrome' }],
          devices: ['desktop'],
          operatingSystems: ['windows']
        },
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none'
        },
        timeout: { request: 6000 }
      });

      // 1. Check HTTP 3xx Redirect (Location Header)
      const location = res.headers.location;
      if (location) {
        let nextUrl = location.trim();
        try {
          nextUrl = new URL(location, currentUrl).href;
        } catch {}

        const nested = extractNestedTarget(nextUrl);
        currentUrl = nested || nextUrl;
        continue;
      }

      // 2. Check HTML Meta Refresh or JavaScript redirect
      const body = res.body || '';
      if (body) {
        // Meta refresh: <meta http-equiv="refresh" content="0;url=...">
        const metaMatch = body.match(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']?[0-9]*;\s*url=([^"'>\s]+)/i);
        if (metaMatch && metaMatch[1]) {
          const target = metaMatch[1].replace(/&amp;/g, '&').trim();
          try {
            currentUrl = new URL(target, currentUrl).href;
          } catch {
            currentUrl = target;
          }
          continue;
        }

        // JS location redirect
        const jsMatch = body.match(/(?:window\.location(?:\.href)?|location\.replace|location\.href)\s*=\s*["']([^"']+)["']/i);
        if (jsMatch && jsMatch[1]) {
          const target = jsMatch[1].replace(/&amp;/g, '&').trim();
          try {
            currentUrl = new URL(target, currentUrl).href;
          } catch {
            currentUrl = target;
          }
          continue;
        }

        // Embedded e-commerce hyperlink in HTML
        const linkMatch = body.match(/https?:\/\/(?:www\.)?(?:amazon\.[a-z.]+|amzn\.[a-z]+|flipkart\.com|myntra\.com|meesho\.com|ajio\.com)\/[^\s"'<>]+/i);
        if (linkMatch && linkMatch[0]) {
          currentUrl = linkMatch[0].replace(/&amp;/g, '&').trim();
          continue;
        }
      }

      // No redirect found
      break;
    } catch (err: any) {
      // If error response has location header, extract it anyway
      const loc = err.response?.headers?.location;
      if (loc) {
        try {
          currentUrl = new URL(loc, currentUrl).href;
          continue;
        } catch {}
      }
      break;
    }
  }

  return currentUrl;
}
