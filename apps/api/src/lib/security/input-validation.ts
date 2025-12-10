/**
 * Input Validation and Sanitization
 * Centralized security validation for user inputs
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validates email format
 *
 * SECURITY: This regex uses linear time O(n) - no nested quantifiers, no exponential backtracking.
 * This is a pre-check for fast-fail; actual authentication requires database verification.
 *
 * @param email - Email address to validate
 * @throws {ValidationError} If email format is invalid
 */
export function validateEmail(email: string): void {
  // Reject excessively long emails (DoS protection)
  if (email.length > 255) {
    throw new ValidationError('Email address too long')
  }

  // Regex with linear time complexity (no nested quantifiers)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format')
  }
}

/**
 * Validates password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - Contains both letters and numbers
 * - Maximum 72 characters (bcrypt limit)
 *
 * @param password - Password to validate
 * @throws {ValidationError} If password doesn't meet requirements
 */
export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters')
  }

  if (password.length > 72) {
    throw new ValidationError('Password too long (max 72 characters for bcrypt)')
  }

  // Must contain both letters and numbers
  const hasLetters = /[a-zA-Z]/.test(password)
  const hasNumbers = /\d/.test(password)

  if (!hasLetters || !hasNumbers) {
    throw new ValidationError('Password must contain both letters and numbers')
  }
}

/**
 * Validates that input is a non-empty string
 * SECURITY: This is a pre-check, not a security boundary.
 *
 * @param value - Value to check
 * @param fieldName - Name of the field (for error messages)
 * @throws {ValidationError} If value is not a non-empty string
 */
export function requireNonEmptyString(value: unknown, fieldName: string): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`)
  }

  if (value.trim() === '') {
    throw new ValidationError(`${fieldName} is required`)
  }
}

/**
 * Validates that input is a valid reset token format
 *
 * @param token - Token to validate
 * @throws {ValidationError} If token format is invalid
 */
export function validateResetToken(token: string): void {
  // Reject empty or whitespace-only tokens
  if (!token || token.trim() === '') {
    throw new ValidationError('Reset token is required')
  }

  // Reject tokens that are too short (likely invalid)
  if (token.length < 16) {
    throw new ValidationError('Invalid reset token format')
  }

  // Reject tokens with special characters that could indicate injection attempts
  const dangerousChars = /[<>"';\x00]/
  if (dangerousChars.test(token)) {
    throw new ValidationError('Invalid characters in reset token')
  }
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 *
 * IMPORTANT: This is a defense-in-depth layer. Always use parameterized queries
 * for database operations and Content-Security-Policy headers for XSS protection.
 *
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')  // Must escape & FIRST to prevent entity bypass
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates that two values match (e.g., password confirmation)
 *
 * @param value1 - First value
 * @param value2 - Second value
 * @param fieldName - Name of the field (for error messages)
 * @throws {ValidationError} If values don't match
 */
export function requireMatch(value1: string, value2: string, fieldName: string): void {
  if (value1 !== value2) {
    throw new ValidationError(`${fieldName} values do not match`)
  }
}

/**
 * Validates input length is within bounds
 *
 * @param input - Input string to validate
 * @param fieldName - Name of the field (for error messages)
 * @param min - Minimum length (default: 0)
 * @param max - Maximum length (default: 1000)
 * @throws {ValidationError} If length is out of bounds
 */
export function validateLength(
  input: string,
  fieldName: string,
  min: number = 0,
  max: number = 1000
): void {
  if (input.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`)
  }

  if (input.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`)
  }
}
