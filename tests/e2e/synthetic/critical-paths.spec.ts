/**
 * Synthetic Monitoring Tests
 *
 * Critical user journey tests for production monitoring
 * These tests run periodically to verify system health
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://coopeverything.org';

test.describe('Critical User Paths', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check page loads
    await expect(page).toHaveTitle(/TogetherOS/i);

    // Check critical elements exist
    await expect(page.locator('body')).toBeVisible();

    // Check no critical errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // No critical console errors allowed
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('signup page loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    // Check page loads
    await expect(page).toHaveTitle(/Sign Up|TogetherOS/i);

    // Check form exists
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('login page loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Check page loads
    await expect(page).toHaveTitle(/Log In|Sign In|TogetherOS/i);

    // Check form exists
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check password input exists
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toMatch(/ok|degraded/);
    expect(data.checks).toBeDefined();
    expect(data.checks.database).toBeDefined();
    expect(data.checks.memory).toBeDefined();
  });

  test('metrics endpoint returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/metrics/system`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.timestamp).toBeDefined();
    expect(data.system).toBeDefined();
    expect(data.process).toBeDefined();
    expect(data.status).toMatch(/ok|warning|critical/);
  });

  test('test pages accessible', async ({ page }) => {
    // Test monitoring page
    await page.goto(`${BASE_URL}/test/monitoring`);
    await expect(page.locator('h1')).toContainText(/monitoring/i);

    // Test logs page
    await page.goto(`${BASE_URL}/test/logs`);
    await expect(page.locator('h1')).toContainText(/metrics|logs/i);
  });
});

test.describe('Performance Checks', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('API endpoints respond quickly', async ({ request }) => {
    const startTime = Date.now();

    await request.get(`${BASE_URL}/api/health`);

    const responseTime = Date.now() - startTime;

    // Should respond within 1 second
    expect(responseTime).toBeLessThan(1000);
  });
});
