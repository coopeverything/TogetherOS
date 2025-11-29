/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent:
 * - XSS attacks
 * - SQL injection (though we use parameterized queries)
 * - Log injection
 * - Path traversal
 */

/**
 * HTML entity map for encoding
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize string for safe logging (prevent log injection)
 * Removes newlines and control characters
 */
export function sanitizeForLog(input: unknown): string {
  if (input === null || input === undefined) {
    return 'null';
  }

  const str = typeof input === 'string' ? input : JSON.stringify(input);

  // Remove control characters and newlines
  return str
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\r\n]/g, ' ') // Replace newlines with space
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*\x00-\x1F]/g, '') // Remove invalid chars
    .substring(0, 255); // Limit length
}

/**
 * Sanitize path to prevent traversal attacks
 */
export function sanitizePath(path: string): string {
  if (typeof path !== 'string') {
    return '';
  }

  // Normalize and remove dangerous patterns
  return path
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/^\//, '') // Remove leading slash
    .substring(0, 500); // Limit length
}

/**
 * Sanitize URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"]/g, '') // Remove potential XSS chars
    .substring(0, 254); // Max email length per RFC
}

/**
 * Sanitize username/display name
 */
export function sanitizeUsername(username: string): string {
  if (typeof username !== 'string') {
    return '';
  }

  return username
    .trim()
    .replace(/[<>'"&]/g, '') // Remove HTML-sensitive chars
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .substring(0, 100); // Reasonable length limit
}

/**
 * Sanitize generic text input (preserves most formatting)
 */
export function sanitizeText(text: string, maxLength = 10000): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove most control chars (keep tab, newline, carriage return)
    .substring(0, maxLength);
}

/**
 * Sanitize rich text/markdown content
 * Less aggressive than escapeHtml, allows markdown formatting
 */
export function sanitizeMarkdown(markdown: string, maxLength = 50000): string {
  if (typeof markdown !== 'string') {
    return '';
  }

  return markdown
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=/gi, 'data-removed=') // Remove event handlers
    .substring(0, maxLength);
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJson<T>(
  jsonString: string,
  maxSize = 1000000 // 1MB default
): T | null {
  if (typeof jsonString !== 'string') {
    return null;
  }

  if (jsonString.length > maxSize) {
    return null;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Create a safe object for logging (redacts sensitive fields)
 */
export function redactSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: string[] = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'session',
    'creditCard',
    'credit_card',
    'ssn',
    'socialSecurity',
  ]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(
      (sensitive) =>
        lowerKey.includes(sensitive.toLowerCase()) ||
        lowerKey === sensitive.toLowerCase()
    );

    if (isSensitive) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveFields(value as Record<string, unknown>, sensitiveKeys);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  if (typeof uuid !== 'string') {
    return false;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  // Basic email validation (not exhaustive but catches most invalid formats)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string, allowedProtocols = ['http:', 'https:']): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}
