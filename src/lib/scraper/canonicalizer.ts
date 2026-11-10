export type SupportedPlatform = 'amazon' | 'flipkart' | 'myntra' | 'meesho' | 'ajio' | 'generic';

export interface CanonicalResult {
  canonicalUrl: string;
  platform: SupportedPlatform;
  productId?: string;
  originalDomain?: string;
}

/**
 * Stage 2: Strict URL Canonicalization
 * Strips all affiliate tracking parameters (affid, utm_*, cmpid, tag, linkCode, ref, etc.)
 * and converts mobile deep links to canonical desktop URLs across all 5 platforms.
 */
export function canonicalizeUrl(resolvedUrl: string): CanonicalResult {
  const trimmed = (resolvedUrl || '').trim();
  if (!trimmed) {
    return { canonicalUrl: '', platform: 'generic' };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. Amazon
    if (host.includes('amazon') || host.includes('amzn')) {
      const asinMatch = trimmed.match(/(?:dp|gp\/product|aw\/d|d)\/([A-Z0-9]{10})/i);
      if (asinMatch && asinMatch[1]) {
        const asin = asinMatch[1].toUpperCase();
        return {
          canonicalUrl: `https://www.amazon.in/dp/${asin}`,
          platform: 'amazon',
          productId: asin,
          originalDomain: host
        };
      }
      return {
        canonicalUrl: `https://www.amazon.in${pathname}`,
        platform: 'amazon',
        originalDomain: host
      };
    }

    // 2. Flipkart
    if (host.includes('flipkart') || host.includes('fkrt')) {
      // Strip /dl/ mobile deep link prefix
      let cleanPath = pathname.replace(/^\/dl\//, '/');
      const pid = parsed.searchParams.get('pid') || (trimmed.match(/[?&]pid=([A-Z0-9]+)/i)?.[1]);
      if (pid) {
        return {
          canonicalUrl: `https://www.flipkart.com${cleanPath}?pid=${pid}`,
          platform: 'flipkart',
          productId: pid,
          originalDomain: host
        };
      }
      return {
        canonicalUrl: `https://www.flipkart.com${cleanPath}`,
        platform: 'flipkart',
        originalDomain: host
      };
    }

    // 3. Myntra
    if (host.includes('myntra') || host.includes('myntr')) {
      // Extract 6 to 12 digit numeric style ID
      const myntraMatch = pathname.match(/(?:.*[/-])?(\d{6,12})(?:[/?#]|$)/) || trimmed.match(/\b(\d{6,12})\b/);
      if (myntraMatch && myntraMatch[1]) {
        const styleId = myntraMatch[1];
        return {
          canonicalUrl: `https://www.myntra.com/${styleId}`,
          platform: 'myntra',
          productId: styleId,
          originalDomain: host
        };
      }
      return {
        canonicalUrl: `https://www.myntra.com${pathname}`,
        platform: 'myntra',
        originalDomain: host
      };
    }

    // 4. Meesho
    if (host.includes('meesho') || host.includes('msho')) {
      // Extract /p/<ID> or /s/p/<ID>
      const meeshoMatch = pathname.match(/(.*?\/p\/[a-zA-Z0-9]+)/i);
      if (meeshoMatch && meeshoMatch[1]) {
        const fullSlugPath = meeshoMatch[1].startsWith('/') ? meeshoMatch[1] : `/${meeshoMatch[1]}`;
        const pIdMatch = pathname.match(/\/p\/([a-zA-Z0-9]+)/i);
        return {
          canonicalUrl: `https://www.meesho.com${fullSlugPath}`,
          platform: 'meesho',
          productId: pIdMatch ? pIdMatch[1] : undefined,
          originalDomain: host
        };
      }
      return {
        canonicalUrl: `https://www.meesho.com${pathname}`,
        platform: 'meesho',
        originalDomain: host
      };
    }

    // 5. Ajio
    if (host.includes('ajio') || host.includes('ajiio')) {
      // Extract /p/<ID> and strip query strings
      const ajioMatch = pathname.match(/(.*?\/p\/[a-zA-Z0-9_-]+)/i);
      if (ajioMatch && ajioMatch[1]) {
        const cleanPath = ajioMatch[1].startsWith('/') ? ajioMatch[1] : `/${ajioMatch[1]}`;
        const pIdMatch = pathname.match(/\/p\/([a-zA-Z0-9_-]+)/i);
        return {
          canonicalUrl: `https://www.ajio.com${cleanPath}`,
          platform: 'ajio',
          productId: pIdMatch ? pIdMatch[1] : undefined,
          originalDomain: host
        };
      }
      return {
        canonicalUrl: `https://www.ajio.com${pathname}`,
        platform: 'ajio',
        originalDomain: host
      };
    }

    // 6. Generic: strip all affiliate & marketing tracking queries
    const cleanParams = new URLSearchParams();
    for (const [key, val] of parsed.searchParams.entries()) {
      if (!/^(utm_|aff|cmpid|fbclid|gclid|ref|subid|tag|linkCode)/i.test(key)) {
        cleanParams.append(key, val);
      }
    }
    const query = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    return {
      canonicalUrl: `${parsed.protocol}//${parsed.host}${parsed.pathname}${query}`,
      platform: 'generic',
      originalDomain: host
    };

  } catch (err) {
    return { canonicalUrl: trimmed, platform: 'generic' };
  }
}
