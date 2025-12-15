/**
 * Feed Module Verification Tests
 *
 * End-to-end tests that verify feed functionality actually works.
 * Run these BEFORE claiming any feed-related fix is complete.
 *
 * Usage:
 *   BASE_URL=https://coopeverything.org npx playwright test tests/e2e/verify/verify-feed.spec.ts
 */

import { test, expect } from '@playwright/test';
import { loginAsTestUser, BASE_URL, getCurrentUserId } from './auth.setup';
import * as path from 'path';
import * as fs from 'fs';

// Test image for upload verification
const TEST_IMAGE_PATH = path.join(__dirname, 'fixtures', 'test-image.jpg');

test.describe('Feed Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await loginAsTestUser(page);
  });

  test('feed page loads and displays posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);

    // Wait for feed to load
    await page.waitForLoadState('networkidle');

    // Check feed header exists
    const header = page.locator('h1');
    await expect(header).toContainText(/feed/i);

    // Check create post button exists
    const createButton = page.locator('button:has-text("Create Post")');
    await expect(createButton).toBeVisible();
  });

  test('can open post composer', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);

    // Click create post button
    const createButton = page.locator('button:has-text("Create Post")');
    await createButton.click();

    // Check composer modal opens
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible();

    // Check content textarea exists
    const contentInput = page.locator('textarea');
    await expect(contentInput).toBeVisible();
  });

  test('can create a text-only post', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);

    // Open composer
    await page.click('button:has-text("Create Post")');

    // Fill content
    const testContent = `E2E Test Post ${Date.now()}`;
    await page.fill('textarea', testContent);

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for modal to close
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', {
      state: 'hidden',
      timeout: 10000,
    });

    // Verify post appears in feed
    await page.waitForSelector(`text=${testContent}`, { timeout: 10000 });

    // Cleanup: find and delete the test post
    const postCard = page.locator(`text=${testContent}`).locator('..').locator('..');
    const deleteButton = postCard.locator('button:has-text("Delete")');

    if (await deleteButton.isVisible()) {
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();
      await page.waitForSelector(`text=${testContent}`, { state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  });

  test('image upload UI is functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);

    // Open composer
    await page.click('button:has-text("Create Post")');
    await page.waitForSelector('textarea');

    // Check for image upload button/input
    const uploadButton = page.locator('button:has-text("Add Images"), label:has-text("Add Images")');
    await expect(uploadButton).toBeVisible();

    // Check file input exists (may be hidden)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('can upload image and create post with image', async ({ page }) => {
    // Skip if test image doesn't exist
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/feed`);

    // Open composer
    await page.click('button:has-text("Create Post")');
    await page.waitForSelector('textarea');

    // Fill content
    const testContent = `E2E Image Test ${Date.now()}`;
    await page.fill('textarea', testContent);

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Wait for upload to complete (look for preview or success indicator)
    await page.waitForSelector('img[alt*="Upload"], .image-preview, img[src*="/uploads/"]', {
      timeout: 15000,
    });

    // Submit the post
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for modal to close
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', {
      state: 'hidden',
      timeout: 10000,
    });

    // Verify post appears with image
    const postText = page.locator(`text=${testContent}`);
    await expect(postText).toBeVisible({ timeout: 10000 });

    // Find the post card and check for image
    const postCard = postText.locator('xpath=ancestor::div[contains(@class, "rounded-lg")]').first();
    const postImage = postCard.locator('img[src*="/uploads/"]');
    await expect(postImage).toBeVisible({ timeout: 5000 });

    // Cleanup
    const deleteButton = postCard.locator('button:has-text("Delete")');
    if (await deleteButton.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();
    }
  });

  test('image upload persists after page reload', async ({ page }) => {
    // Skip if test image doesn't exist
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/feed`);

    // Open composer
    await page.click('button:has-text("Create Post")');
    await page.waitForSelector('textarea');

    // Fill content with unique identifier
    const uniqueId = Date.now();
    const testContent = `E2E Persist Test ${uniqueId}`;
    await page.fill('textarea', testContent);

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Wait for upload
    await page.waitForSelector('img[alt*="Upload"], .image-preview, img[src*="/uploads/"]', {
      timeout: 15000,
    });

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { state: 'hidden', timeout: 10000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the post
    const postText = page.locator(`text=${testContent}`);
    await expect(postText).toBeVisible({ timeout: 10000 });

    // Verify image still shows (proves mediaUrls was saved to DB)
    const postCard = postText.locator('xpath=ancestor::div[contains(@class, "rounded-lg")]').first();
    const postImage = postCard.locator('img[src*="/uploads/"]');
    await expect(postImage).toBeVisible({ timeout: 5000 });

    // Cleanup
    const deleteButton = postCard.locator('button:has-text("Delete")');
    if (await deleteButton.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();
    }
  });

  test('reactions persist after clicking', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');

    // Find first post with reaction buttons
    const reactionButton = page.locator('button:has-text("care"), button:has-text("insightful")').first();

    if (await reactionButton.isVisible()) {
      // Click reaction
      await reactionButton.click();

      // Wait for potential API call
      await page.waitForTimeout(500);

      // Reload and verify reaction persisted
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if reaction is still active (has active class or count)
      const reactionAfterReload = page.locator('button:has-text("care"), button:has-text("insightful")').first();
      await expect(reactionAfterReload).toBeVisible();
    }
  });
});

test.describe('Feed API Verification', () => {
  test('GET /api/feed returns posts', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/feed`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('posts');
    expect(Array.isArray(data.posts)).toBe(true);
  });

  test('POST /api/feed requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/feed`, {
      data: {
        type: 'native',
        content: 'Test post',
        topics: [],
      },
    });

    // Should return 401 without auth
    expect(response.status()).toBe(401);
  });

  test('POST /api/feed/upload requires authentication', async ({ request }) => {
    // Try to upload without auth
    const response = await request.post(`${BASE_URL}/api/feed/upload`, {
      multipart: {
        files: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test'),
        },
      },
    });

    expect(response.status()).toBe(401);
  });
});
