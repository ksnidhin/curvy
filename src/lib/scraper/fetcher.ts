import { gotScraping } from 'got-scraping';
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
  'user-agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
};

function isBotBlocked(html: string): boolean {
  if (!html || html.length < 300) return true;
  const lower = html.toLowerCase();
  return (
    lower.includes('api-services-support@amazon.com') ||
    lower.includes('type the characters you see in this image') ||
    lower.includes('robot check') ||
    (lower.includes('access denied') && lower.includes('you don\'t have permission')) ||
    (lower.includes('site maintenance') && html.length < 1000)
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
 * Only use fresh guest session cookies obtained via Tier 2 warmup, or Tier 3 API/proxy fallbacks.
 */
export async function fetchWithFallback(
  canonicalUrl: string,
  platform: SupportedPlatform,
  productId?: string,
  optionalAmazonCookie?: string
): Promise<FetchResult> {
  const timeoutMs = 8000;
  const configuredProxy = process.env.RESIDENTIAL_PROXY_URL || process.env.PROXY_URL;

  // --------------------------------------------------------------------------
  // TIER 1: Fast Direct TLS Fetch with Chrome Impersonation
  // --------------------------------------------------------------------------
  try {
    const headers: Record<string, string> = { ...DESKTOP_CHROME_HEADERS };
    
    // Only Amazon uses optional user cookies when bot-challenge occurs
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
    // Proceed seamlessly to Tier 2
  }

  // --------------------------------------------------------------------------
  // TIER 2: Platform Homepage Warmup (Fresh Guest Session Tokens & Referer)
  // --------------------------------------------------------------------------
  const homepage = getHomepageForPlatform(platform);
  if (homepage) {
    try {
      const jar = new CookieJar();

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
        timeout: { request: 5000 }
      }).catch(() => {});

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
      // Proceed to Tier 3
    }
  }

  // --------------------------------------------------------------------------
  // TIER 3: Public JSON State API, Edge Endpoints & Proxy Fallbacks
  // --------------------------------------------------------------------------

  // 3A. Ajio Internal API endpoint
  if (platform === 'ajio' && productId) {
    const ajioCandidates = [
      `https://www.ajio.com/api/product/${productId}`,
      `https://www.ajio.com/api/products/${productId}`,
      `https://www.ajio.com/api/p/${productId}`
    ];
    for (const apiUrl of ajioCandidates) {
      try {
        const res = await gotScraping({
          url: apiUrl,
          headers: {
            'accept': 'application/json, text/html, */*',
            'referer': 'https://www.ajio.com/'
          },
          ...(configuredProxy ? { proxyUrl: configuredProxy } : {}),
          timeout: { request: 6000 }
        });

        if (res.statusCode === 200 && !isBotBlocked(res.body) && res.body.length > 500) {
          return {
            html: res.body,
            tierUsed: 'TIER_3_API_FALLBACK',
            statusCode: 200,
            finalUrl: apiUrl,
            isJsonPayload: res.body.trim().startsWith('{')
          };
        }
      } catch {}
    }
  }

  // 3B. Myntra Gateway endpoint
  if (platform === 'myntra' && productId) {
    const apiUrl = `https://www.myntra.com/gateway/v2/product/${productId}`;
    try {
      const res = await gotScraping({
        url: apiUrl,
        headers: {
          'accept': 'application/json',
          'x-meta-app': 'channel=web',
          'referer': 'https://www.myntra.com/'
        },
        ...(configuredProxy ? { proxyUrl: configuredProxy } : {}),
        timeout: { request: 6000 }
      });

      if (res.statusCode === 200 && res.body.startsWith('{') && !isBotBlocked(res.body)) {
        return {
          html: res.body,
          tierUsed: 'TIER_3_API_FALLBACK',
          statusCode: 200,
          finalUrl: apiUrl,
          isJsonPayload: true
        };
      }
    } catch {}
  }

  // 3C. Configured Proxy Fallback (Residential / Custom)
  if (configuredProxy) {
    try {
      const res = await gotScraping({
        url: canonicalUrl,
        proxyUrl: configuredProxy,
        headers: { ...DESKTOP_CHROME_HEADERS },
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
    } catch {}
  }

  // 3D. ScraperAPI Fallback (if key is valid)
  const scraperKey = process.env.SCRAPERAPI_KEY;
  if (scraperKey && scraperKey !== 'your_scraper_api_key_here' && scraperKey.length > 10) {
    try {
      const proxyUrl = `http://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(canonicalUrl)}&country_code=in`;
      const res = await gotScraping({
        url: proxyUrl,
        timeout: { request: 12000 }
      });

      if (res.statusCode === 200 && !isBotBlocked(res.body)) {
        return {
          html: res.body,
          tierUsed: 'TIER_3_API_FALLBACK',
          statusCode: 200,
          finalUrl: canonicalUrl
        };
      }
    } catch {}
  }

  // 3E. Mobile User-Agent Fallback
  try {
    const res = await gotScraping({
      url: canonicalUrl,
      method: 'GET',
      headers: MOBILE_HEADERS,
      timeout: { request: 6000 }
    });

    if (res.statusCode === 200 && !isBotBlocked(res.body)) {
      return {
        html: res.body,
        tierUsed: 'TIER_3_API_FALLBACK',
        statusCode: 200,
        finalUrl: res.url || canonicalUrl
      };
    }
  } catch {}

  throw new Error(`Failed to retrieve page for ${canonicalUrl} across all 3 tiers.`);
}
