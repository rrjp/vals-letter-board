// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 03: PWA Manifest & Offline Service Worker — Verification Tests
 *
 * Covers:
 *   - manifest.json linked in <head>
 *   - apple-touch-icon linked in <head>
 *   - Service Worker registered on page load
 *   - App loads offline via Cache-First SW strategy
 */

test.describe('[REQ-PWA-001] PWA Manifest & Meta Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('<link rel="manifest"> points to manifest.json', async ({ page }) => {
    const link = page.locator('link[rel="manifest"]');
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBe('manifest.json');
  });

  test('<link rel="apple-touch-icon"> points to icon-180.png', async ({ page }) => {
    const link = page.locator('link[rel="apple-touch-icon"]');
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBe('icon-180.png');
  });
});

test.describe('[REQ-PWA-001] Service Worker Registration', () => {
  test('service worker is registered on page load', async ({ page }) => {
    await page.goto('/');

    // Wait for the service worker registration to complete
    const registration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return null;
      try {
        const reg = await navigator.serviceWorker.ready;
        return { active: !!reg.active, scope: reg.scope };
      } catch {
        return null;
      }
    });

    expect(registration).not.toBeNull();
    expect(registration.active).toBe(true);
  });
});

test.describe('[REQ-PWA-001] Offline Loading', () => {
  test('app renders #app-container when browser is offline', async ({ browser }) => {
    // Use a fresh context so we can control connectivity
    const context = await browser.newContext();

    // Step 1: Load online so SW can install and cache
    const onlinePage = await context.newPage();
    await onlinePage.goto('http://localhost:8080/');

    // Wait for the service worker to activate
    await onlinePage.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.ready;
      if (!reg.active) {
        // Wait up to 5s for activation
        await new Promise((resolve) => {
          const check = () => {
            if (reg.active) resolve(null);
            else setTimeout(check, 200);
          };
          check();
        });
      }
    });

    // Give the SW a moment to finish caching
    await onlinePage.waitForTimeout(500);
    await onlinePage.close();

    // Step 2: Go offline
    await context.setOffline(true);

    // Step 3: Load the page offline — SW should serve from cache
    const offlinePage = await context.newPage();
    await offlinePage.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });

    // #app-container should be visible even offline
    const container = offlinePage.locator('#app-container');
    await expect(container).toHaveCount(1);
    await expect(container).toBeVisible();

    await context.close();
  });
});
