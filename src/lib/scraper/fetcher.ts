import { gotScraping, Response } from 'got-scraping';
import { CookieJar } from 'tough-cookie';
import { SupportedPlatform } from './canonicalizer';

export interface FetchResult {
  html: string;
  tierUsed: 'TIER_1_DIRECT_TLS' | 'TIER_2_HOMEPAGE_WARMUP' | 'TIER_3_API_FALLBACK';
  statusCode: number;
  finalUrl: string;
  isJsonPayload?: boolean;
}

const DESKTOP_CHROME_HEADERS = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8,hi;q=0.7',
  'cache-control': 'max-age=0',
  'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
};

const MOBILE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
};

function isBotBlocked(html: string): boolean {
  if (!html || html.length < 500) return true;
  const lower = html.toLowerCase();
  return (
    lower.includes('api-services-support@amazon.com') ||
    lower.includes('type the characters you see in this image') ||
    lower.includes('robot check') ||
    (lower.includes('access denied') && lower.includes('you don\'t have permission')) ||
    (lower.includes('cloudflare') && lower.includes('challenge')) ||
    lower.includes('site maintenance')
  );
}

function getHomepageForPlatform(platform: SupportedPlatform): string {
  switch (platform) {
    case 'amazon': return 'https://www.amazon.in/';
    case 'flipkart': return 'https://www.flipkart.com/';
    case 'myntra': return 'https://www.myntra.com/';
    case 'meesho': return 'https://www.meesho.com/';
    case 'ajio': return 'https://www.ajio.com/';
    default: return '';
  }
}

/**
 * Stage 3: 3-Tier Zero-Failure Fetching Engine
 * Strict Rule: Never send static/stale auth cookies to Flipkart, Myntra, Meesho, or Ajio.
 * Only use fresh guest session cookies obtained via Tier 2 warmup, or Tier 3 API fallbacks.
 */
export async function fetchWithFallback(
  canonicalUrl: string,
  platform: SupportedPlatform,
  productId?: string,
  optionalAmazonCookie?: string
): Promise<FetchResult> {
  const timeoutMs = 12000;

  // --------------------------------------------------------------------------
  // TIER 1: Fast Direct TLS Fetch with Chrome Impersonation & Zero Stale Cookies
  // --------------------------------------------------------------------------
  try {
    const headers: Record<string, string> = { ...DESKTOP_CHROME_HEADERS };
    
    // STRICT RULE: Only Amazon can accept optional cookies; NEVER send to other platforms
    if (platform === 'amazon' && optionalAmazonCookie) {
      headers['cookie'] = optionalAmazonCookie;
    }

    const res = await gotScraping({
      url: canonicalUrl,
      method: 'GET',
      headers,
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome' }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      },
      timeout: { request: timeoutMs }
    });

    if (res.statusCode === 200 && !isBotBlocked(res.body)) {
      return {
        html: res.body,
        tierUsed: 'TIER_1_DIRECT_TLS',
        statusCode: 200,
        finalUrl: res.url || canonicalUrl
      };
    }
  } catch (err: any) {
    // If Tier 1 failed or blocked, proceed seamlessly to Tier 2
  }

  // --------------------------------------------------------------------------
  // TIER 2: Platform Homepage Warmup (Fresh Guest Cookies & Referer Injection)
  // --------------------------------------------------------------------------
  const homepage = getHomepageForPlatform(platform);
  if (homepage) {
    try {
      const jar = new CookieJar();

      // Step A: Warmup homepage to acquire fresh guest session tokens (bm_sz, _abck, etc.)
      await gotScraping({
        url: homepage,
        method: 'GET',
        cookieJar: jar,
        headers: { ...DESKTOP_CHROME_HEADERS },
        headerGeneratorOptions: {
          browsers: [{ name: 'chrome' }],
          devices: ['desktop'],
          operatingSystems: ['windows']
        },
        timeout: { request: 8000 }
      }).catch(() => {});

      // Step B: Request product URL with fresh guest cookie jar and same-origin referer
      const res = await gotScraping({
        url: canonicalUrl,
        method: 'GET',
        cookieJar: jar,
        headers: {
          ...DESKTOP_CHROME_HEADERS,
          'referer': homepage,
          'sec-fetch-site': 'same-origin'
        },
        headerGeneratorOptions: {
          browsers: [{ name: 'chrome' }],
          devices: ['desktop'],
          operatingSystems: ['windows']
        },
        timeout: { request: timeoutMs }
      });

      if (res.statusCode === 200 && !isBotBlocked(res.body)) {
        return {
          html: res.body,
          tierUsed: 'TIER_2_HOMEPAGE_WARMUP',
          statusCode: 200,
          finalUrl: res.url || canonicalUrl
        };
      }
    } catch (err: any) {
      // Tier 2 failed, proceed to Tier 3
    }
  }

  // --------------------------------------------------------------------------
  // TIER 3: Public JSON State API, Mobile UA, or ScraperAPI Fallback
  // --------------------------------------------------------------------------
  // 3A. Platform-Specific Public APIs
  if (productId) {
    try {
      if (platform === 'myntra') {
        // Myntra Gateway API
        const apiUrl = `https://www.myntra.com/gateway/v2/product/${productId}`;
        const res = await gotScraping({
          url: apiUrl,
          headers: {
            'accept': 'application/json',
            'x-meta-app': 'channel=web',
            'referer': 'https://www.myntra.com/'
          },
          timeout: { request: 10000 }
        });
        if (res.statusCode === 200 && res.body.startsWith('{')) {
          return {
            html: res.body,
            tierUsed: 'TIER_3_API_FALLBACK',
            statusCode: 200,
            finalUrl: apiUrl,
            isJsonPayload: true
          };
        }
      } else if (platform === 'ajio') {
        // Ajio Product API
        const apiUrl = `https://www.ajio.com/api/p/${productId}`;
        const res = await gotScraping({
          url: apiUrl,
          headers: {
            'accept': 'application/json, text/plain, */*',
            'referer': 'https://www.ajio.com/'
          },
          timeout: { request: 10000 }
        });
        if (res.statusCode === 200 && res.body.startsWith('{')) {
          return {
            html: res.body,
            tierUsed: 'TIER_3_API_FALLBACK',
            statusCode: 200,
            finalUrl: apiUrl,
            isJsonPayload: true
          };
        }
      } else if (platform === 'meesho') {
        // Meesho Product API
        const apiUrl = `https://www.meesho.com/api/v1/products/${productId}`;
        const res = await gotScraping({
          url: apiUrl,
          headers: {
            'accept': 'application/json',
            'referer': 'https://www.meesho.com/'
          },
          timeout: { request: 10000 }
        });
        if (res.statusCode === 200 && res.body.startsWith('{')) {
          return {
            html: res.body,
            tierUsed: 'TIER_3_API_FALLBACK',
            statusCode: 200,
            finalUrl: apiUrl,
            isJsonPayload: true
          };
        }
      }
    } catch (apiErr) {}
  }

  // 3B. Mobile User-Agent Fallback (Bypasses desktop WAF signatures)
  try {
    const res = await gotScraping({
      url: canonicalUrl,
      method: 'GET',
      headers: MOBILE_HEADERS,
      timeout: { request: 10000 }
    });

    if (res.statusCode === 200 && !isBotBlocked(res.body)) {
      return {
        html: res.body,
        tierUsed: 'TIER_3_API_FALLBACK',
        statusCode: 200,
        finalUrl: res.url || canonicalUrl
      };
    }
  } catch (mobileErr) {}

  // 3C. ScraperAPI Fallback (if valid key is set in environment)
  const scraperKey = process.env.SCRAPERAPI_KEY;
  if (scraperKey && scraperKey !== 'your_scraper_api_key_here') {
    try {
      const isAmzn = platform === 'amazon';
      const proxyUrl = `http://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(canonicalUrl)}${isAmzn ? '&premium=true' : ''}&country_code=in`;
      const res = await gotScraping({
        url: proxyUrl,
        timeout: { request: 20000 }
      });

      if (res.statusCode === 200 && !isBotBlocked(res.body)) {
        return {
          html: res.body,
          tierUsed: 'TIER_3_API_FALLBACK',
          statusCode: 200,
          finalUrl: canonicalUrl
        };
      }
    } catch (proxyErr) {}
  }

  // 3D. Residential / Custom Proxy Fallback (e.g. for datacenter unblocking)
  const customProxy = process.env.RESIDENTIAL_PROXY_URL || process.env.PROXY_URL;
  if (customProxy) {
    try {
      const res = await gotScraping({
        url: canonicalUrl,
        proxyUrl: customProxy,
        headers: { ...DESKTOP_CHROME_HEADERS },
        timeout: { request: 15000 }
      });

      if (res.statusCode === 200 && !isBotBlocked(res.body)) {
        return {
          html: res.body,
          tierUsed: 'TIER_3_API_FALLBACK',
          statusCode: 200,
          finalUrl: res.url || canonicalUrl
        };
      }
    } catch (customProxyErr) {}
  }

  throw new Error(`Failed to retrieve page for ${canonicalUrl} across all 3 tiers.`);
}
