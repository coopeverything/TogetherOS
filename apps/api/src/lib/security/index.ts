/**
 * Security Library
 * Centralized security validation and protection utilities
 *
 * Usage:
 *   import { validateEmail, validateUrl } from '@/lib/security'
 *
 * All user-provided inputs should pass through these validation functions
 * before being used in database queries, fetch requests, or business logic.
 */

// URL validation and SSRF protection
export {
  validateUrl,
  validateSocialMediaUrl,
  URLValidationError,
  SOCIAL_MEDIA_DOMAINS,
  type URLValidationOptions,
} from './url-validation'

// Input validation and sanitization
export {
  validateEmail,
  validatePassword,
  validateResetToken,
  requireNonEmptyString,
  requireMatch,
  validateLength,
  sanitizeInput,
  ValidationError,
} from './input-validation'
