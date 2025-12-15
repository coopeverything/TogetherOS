/**
 * Authentication Setup for E2E Verification Tests
 *
 * Provides helpers to authenticate as a test user for verified testing.
 * Uses a dedicated test account that exists in production.
 */

import { Page, expect } from '@playwright/test';

// Test user credentials - should exist in production
// Create via: INSERT INTO users (email, password_hash, name) VALUES (...)
const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'e2e-test@coopeverything.org',
  password: process.env.E2E_TEST_PASSWORD || 'E2ETestPassword123!',
};

const BASE_URL = process.env.BASE_URL || 'https://coopeverything.org';

/**
 * Log in as the test user via the login form
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);

  // Fill login form
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  // Submit and wait for navigation
  await page.click('button[type="submit"]');

  // Wait for redirect (successful login redirects away from /login)
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });

  // Verify we're logged in by checking for auth cookie or user menu
  const cookies = await page.context().cookies();
  const hasAuthCookie = cookies.some(c =>
    c.name.includes('auth') || c.name.includes('session') || c.name.includes('token')
  );

  if (!hasAuthCookie) {
    // Alternative: check for user-specific UI element
    const userMenu = page.locator('[data-testid="user-menu"], .user-avatar, .user-name');
    await expect(userMenu.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // If no user menu, check we're not on login page
      expect(page.url()).not.toContain('/login');
    });
  }
}

/**
 * Log in via API (faster, for tests that don't need to verify login UI)
 */
export async function loginViaAPI(page: Page): Promise<string | null> {
  const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });

  if (!response.ok()) {
    console.error('API login failed:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.user?.id || data.userId || null;
}

/**
 * Check if currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const response = await page.request.get(`${BASE_URL}/api/auth/me`);
  return response.ok();
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(page: Page): Promise<string | null> {
  const response = await page.request.get(`${BASE_URL}/api/auth/me`);
  if (!response.ok()) return null;

  const data = await response.json();
  return data.user?.id || null;
}

/**
 * Log out
 */
export async function logout(page: Page): Promise<void> {
  await page.request.post(`${BASE_URL}/api/auth/logout`);
  await page.context().clearCookies();
}

export { TEST_USER, BASE_URL };
