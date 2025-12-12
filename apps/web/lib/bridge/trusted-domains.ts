/**
 * Trusted Domains Configuration for Bridge
 *
 * Allows Bridge to fetch content from trusted internal domains
 * like coopeverything.org for forum posts, articles, etc.
 */

// Get trusted domains from environment variable
const TRUSTED_DOMAINS_ENV = process.env.BRIDGE_TRUSTED_DOMAINS || '';

/**
 * Parse trusted domains from environment variable
 * Format: comma-separated domain list (e.g., "coopeverything.org,www.coopeverything.org")
 */
export function getTrustedDomains(): string[] {
  if (!TRUSTED_DOMAINS_ENV) {
    // Default trusted domains for the platform
    return ['coopeverything.org', 'www.coopeverything.org'];
  }
  return TRUSTED_DOMAINS_ENV.split(',')
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
}

/**
 * Check if a URL is from a trusted domain
 */
export function isTrustedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const trustedDomains = getTrustedDomains();

    return trustedDomains.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Extract URLs from text that match trusted domains
 */
export function extractTrustedUrls(text: string): string[] {
  // Match URLs starting with http:// or https://
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const matches = text.match(urlPattern) || [];

  return matches.filter(isTrustedUrl);
}

/**
 * Fetch content from a trusted domain URL
 * Returns the text content of the page, stripped of HTML
 */
export async function fetchTrustedContent(
  url: string,
  options: {
    maxLength?: number;
    timeout?: number;
  } = {}
): Promise<{ success: boolean; content?: string; error?: string }> {
  const { maxLength = 8000, timeout = 5000 } = options;

  // Validate URL is trusted
  if (!isTrustedUrl(url)) {
    return {
      success: false,
      error: `URL not from trusted domain: ${url}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Bridge/1.0 (TogetherOS Internal Fetcher)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch: HTTP ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    // Extract meaningful content from HTML
    let content = extractTextFromHtml(html, contentType);

    // Truncate if too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '... [truncated]';
    }

    return { success: true, content };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out' };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract text content from HTML, removing scripts, styles, and tags
 */
function extractTextFromHtml(html: string, contentType: string): string {
  // If it's JSON, return formatted
  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(html);
      return JSON.stringify(json, null, 2);
    } catch {
      return html;
    }
  }

  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Extract title
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract main content areas (article, main, or body)
  const mainMatch =
    text.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    text.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const mainContent = mainMatch ? mainMatch[1] : text;

  // Remove all remaining HTML tags
  let cleanText = mainContent.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');

  // Clean up whitespace
  cleanText = cleanText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Prepend title if found
  if (title && !cleanText.startsWith(title)) {
    cleanText = `# ${title}\n\n${cleanText}`;
  }

  return cleanText;
}

/**
 * Fetch content from multiple trusted URLs
 * Used to enrich Bridge context with live platform content
 */
export async function fetchTrustedContents(
  urls: string[],
  options: {
    maxTotalLength?: number;
    maxPerUrl?: number;
    timeout?: number;
  } = {}
): Promise<{ url: string; content: string }[]> {
  const { maxTotalLength = 12000, maxPerUrl = 4000, timeout = 5000 } = options;

  const results: { url: string; content: string }[] = [];
  let totalLength = 0;

  // Process URLs sequentially to respect rate limits
  for (const url of urls) {
    if (totalLength >= maxTotalLength) break;

    const remainingLength = Math.min(maxPerUrl, maxTotalLength - totalLength);
    const result = await fetchTrustedContent(url, {
      maxLength: remainingLength,
      timeout,
    });

    if (result.success && result.content) {
      results.push({ url, content: result.content });
      totalLength += result.content.length;
    }
  }

  return results;
}
