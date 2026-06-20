// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 05: Settings State & Personalization — Verification Tests
 *
 * Covers:
 *   - Dialog open via showModal(), close via close()
 *   - Name input updates #app-title and saves to localStorage
 *   - Theme toggle applies data-theme="dark" to body
 *   - Layout toggle applies .layout-qwerty to #letter-grid
 *   - Preferences persist across page reloads
 */

test.describe('[REQ-SET-001] Dialog Open & Close', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking Settings opens the dialog via showModal()', async ({ page }) => {
    // Dialog should start hidden (not open)
    let isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(false);

    // Click settings button
    await page.locator('#btn-settings').click();

    // Dialog should be open
    isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(true);
  });

  test('clicking Close dismisses the dialog', async ({ page }) => {
    // Open first
    await page.locator('#btn-settings').click();
    let isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(true);

    // Click close
    await page.locator('#btn-close-settings').click();

    isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(false);
  });

  test('clicking outside settings dialog dismisses it (backdrop click)', async ({ page }) => {
    // Open settings dialog
    await page.locator('#btn-settings').click();
    let isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(true);

    // Get the bounding box of the dialog content
    const bbox = await page.locator('#settings-panel').boundingBox();
    expect(bbox).not.toBeNull();

    // Click slightly to the left and top of the dialog box (backdrop area)
    await page.mouse.click(bbox.x - 10, bbox.y - 10);

    // Dialog should now be closed
    isOpen = await page.locator('#settings-panel').evaluate(el => el.open);
    expect(isOpen).toBe(false);
  });
});

test.describe('[REQ-SET-004] User Name Personalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('updating name input changes header title to "[Name]\'s Letter Board"', async ({ page }) => {
    // Open settings
    await page.locator('#btn-settings').click();

    // Type a name
    await page.locator('#input-user-name').fill('Reyes');

    // Title should update
    const title = await page.locator('#app-title').textContent();
    expect(title).toBe("Reyes's Letter Board");
  });

  test('name preference is saved to localStorage', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#input-user-name').fill('Reyes');

    const prefs = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-prefs') || '{}')
    );
    expect(prefs.userName).toBe('Reyes');
  });

  test('clearing name input keeps it empty but title defaults to "User\'s Letter Board"', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#input-user-name').fill('Reyes');
    let title = await page.locator('#app-title').textContent();
    expect(title).toBe("Reyes's Letter Board");

    // Clear the input
    await page.locator('#input-user-name').fill('');

    // Input must remain empty — not forced back
    const inputValue = await page.locator('#input-user-name').inputValue();
    expect(inputValue).toBe('');

    // Title must default to "User's Letter Board"
    title = await page.locator('#app-title').textContent();
    expect(title).toBe("User's Letter Board");
  });
});

test.describe('[REQ-SET-002] Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('default theme is light (no data-theme attribute on body)', async ({ page }) => {
    const hasDark = await page.locator('body').evaluate(el =>
      el.getAttribute('data-theme') === 'dark'
    );
    expect(hasDark).toBe(false);
  });

  test('toggling theme sets data-theme="dark" on body', async ({ page }) => {
    await page.locator('#btn-settings').click();

    // Check the toggle (should be unchecked initially)
    await page.locator('#toggle-theme').check();

    // Body should now have data-theme="dark"
    const theme = await page.locator('body').getAttribute('data-theme');
    expect(theme).toBe('dark');
  });

  test('untoggling theme removes data-theme from body', async ({ page }) => {
    // Enable dark mode first
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-theme').check();
    await page.locator('#btn-close-settings').click();

    // Re-open and uncheck
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-theme').uncheck();

    const hasDark = await page.locator('body').evaluate(el =>
      el.hasAttribute('data-theme')
    );
    expect(hasDark).toBe(false);
  });

  test('theme preference is saved to localStorage', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-theme').check();

    const prefs = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-prefs') || '{}')
    );
    expect(prefs.theme).toBe('dark');
  });
});

test.describe('[REQ-SET-003] Layout Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('default layout is alphabetical (no layout-qwerty class)', async ({ page }) => {
    const hasQwerty = await page.locator('#letter-grid').evaluate(el =>
      el.classList.contains('layout-qwerty')
    );
    expect(hasQwerty).toBe(false);
  });

  test('toggling layout adds .layout-qwerty class to #letter-grid', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').check();

    const hasQwerty = await page.locator('#letter-grid').evaluate(el =>
      el.classList.contains('layout-qwerty')
    );
    expect(hasQwerty).toBe(true);
  });

  test('untoggling layout removes .layout-qwerty class', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').check();
    await page.locator('#btn-close-settings').click();

    // Re-open and uncheck
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').uncheck();

    const hasQwerty = await page.locator('#letter-grid').evaluate(el =>
      el.classList.contains('layout-qwerty')
    );
    expect(hasQwerty).toBe(false);
  });

  test('layout preference is saved to localStorage', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').check();

    const prefs = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-prefs') || '{}')
    );
    expect(prefs.layout).toBe('qwerty');
  });

  test('activating QWERTY reorders letter buttons to QWERTY sequence', async ({ page }) => {
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').check();
    await page.locator('#btn-close-settings').click();

    // Read data-letter attributes in DOM order
    const order = await page.locator('#letter-grid .letter-btn').evaluateAll(els =>
      els.map(el => el.getAttribute('data-letter'))
    );
    const qwerty = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    expect(order).toEqual(qwerty);
  });

  test('deactivating QWERTY restores alphabetical order', async ({ page }) => {
    // Activate QWERTY first
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').check();
    await page.locator('#btn-close-settings').click();

    // Deactivate
    await page.locator('#btn-settings').click();
    await page.locator('#toggle-layout').uncheck();
    await page.locator('#btn-close-settings').click();

    const order = await page.locator('#letter-grid .letter-btn').evaluateAll(els =>
      els.map(el => el.getAttribute('data-letter'))
    );
    const alpha = 'abcdefghijklmnopqrstuvwxyz'.split('');
    expect(order).toEqual(alpha);
  });
});

test.describe('[REQ-PREF-001] Persistence Across Reloads', () => {
  test('settings survive page reload and are re-applied', async ({ page }) => {
    await page.goto('/');

    // Open settings, set name, enable dark mode, enable qwerty
    await page.locator('#btn-settings').click();
    await page.locator('#input-user-name').fill('Reyes');
    await page.locator('#toggle-theme').check();
    await page.locator('#toggle-layout').check();
    await page.locator('#btn-close-settings').click();

    // Reload the page
    await page.reload();

    // All settings should be restored
    const title = await page.locator('#app-title').textContent();
    expect(title).toBe("Reyes's Letter Board");

    const theme = await page.locator('body').getAttribute('data-theme');
    expect(theme).toBe('dark');

    const hasQwerty = await page.locator('#letter-grid').evaluate(el =>
      el.classList.contains('layout-qwerty')
    );
    expect(hasQwerty).toBe(true);

    // QWERTY DOM order must be restored after reload
    const order = await page.locator('#letter-grid .letter-btn').evaluateAll(els =>
      els.map(el => el.getAttribute('data-letter'))
    );
    const qwertyOrder = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    expect(order).toEqual(qwertyOrder);

    // Dialog toggles should reflect saved state
    await page.locator('#btn-settings').click();
    const themeChecked = await page.locator('#toggle-theme').isChecked();
    const layoutChecked = await page.locator('#toggle-layout').isChecked();
    const userName = await page.locator('#input-user-name').inputValue();

    expect(themeChecked).toBe(true);
    expect(layoutChecked).toBe(true);
    expect(userName).toBe('Reyes');
  });
});
