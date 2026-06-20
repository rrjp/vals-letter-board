// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 04: Word Prediction & Dynamic Dictionary — Verification Tests
 *
 * Covers:
 *   - Speak saves new words to localStorage
 *   - Partial typing generates prediction buttons in #prediction-bar
 *   - Clicking a prediction replaces partial word + space, clears bar
 *   - Prediction buttons have proper touch-target sizing
 */

test.describe('[REQ-DICT-002] Dictionary — Speak Saves Words to localStorage', () => {
  test.beforeEach(async ({ page }) => {
    // Seed the dictionary with a small starter set
    await page.addInitScript(() => {
      localStorage.setItem('comm-board-dict', JSON.stringify(['yes', 'no', 'please', 'thanks']));
    });
    await page.goto('/');
  });

  test('new words typed and spoken are saved to localStorage', async ({ page }) => {
    // Type "hello world"
    const word1 = ['h', 'e', 'l', 'l', 'o'];
    for (const letter of word1) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }
    await page.locator('#btn-space').click();
    const word2 = ['w', 'o', 'r', 'l', 'd'];
    for (const letter of word2) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }

    // Click Speak
    await page.locator('#btn-speak').click();

    // localStorage should now contain the new words
    const dict = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-dict') || '[]')
    );
    expect(dict).toContain('hello');
    expect(dict).toContain('world');
  });

  test('seed words are not duplicated when spoken', async ({ page }) => {
    // Type "yes" (already in seed dictionary)
    const letters = ['y', 'e', 's'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }

    await page.locator('#btn-speak').click();

    const dict = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-dict') || '[]')
    );
    // 'yes' should appear exactly once
    const yesCount = dict.filter(w => w === 'yes').length;
    expect(yesCount).toBe(1);
  });
});

test.describe('[REQ-PRED-001] [REQ-PRED-002] Prediction — Dynamic Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    // Seed a richer dictionary for prediction tests
    await page.addInitScript(() => {
      localStorage.setItem('comm-board-dict', JSON.stringify([
        'hello', 'help', 'hero', 'hey', 'hi',
        'world', 'word', 'work', 'wonder', 'wow'
      ]));
    });
    await page.goto('/');
  });

  test('typing a partial word shows matching predictions', async ({ page }) => {
    // Type "he"
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    // #prediction-bar should not be empty — it should have prediction buttons
    const buttons = page.locator('#prediction-bar button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // All buttons should contain text starting with "he"
    const texts = await buttons.evaluateAll(els => els.map(el => el.textContent));
    for (const text of texts) {
      expect(text.toLowerCase()).toMatch(/^he/);
    }
  });

  test('prediction bar clears when current word is empty (after space)', async ({ page }) => {
    // Type "he" then space
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    // Should have predictions
    let buttons = page.locator('#prediction-bar button');
    let count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // Press space — current word becomes empty
    await page.locator('#btn-space').click();

    // Prediction bar should collapse (empty)
    buttons = page.locator('#prediction-bar button');
    count = await buttons.count();
    expect(count).toBe(0);
  });

  test('prediction bar clears after clear button', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    // Should have predictions
    let buttons = page.locator('#prediction-bar button');
    expect(await buttons.count()).toBeGreaterThan(0);

    await page.locator('#btn-clear').click();

    // Prediction bar should be empty
    buttons = page.locator('#prediction-bar button');
    expect(await buttons.count()).toBe(0);
  });

  test('max 5 predictions are shown', async ({ page }) => {
    // Seed many words starting with "a"
    await page.evaluate(() => {
      localStorage.setItem('comm-board-dict', JSON.stringify([
        'aaa', 'aab', 'aac', 'aad', 'aae', 'aaf', 'aag', 'aah'
      ]));
    });
    // Reload to pick up new dict
    await page.reload();

    await page.locator('.letter-btn[data-letter="a"]').click();
    await page.locator('.letter-btn[data-letter="a"]').click();

    const buttons = page.locator('#prediction-bar button');
    const count = await buttons.count();
    expect(count).toBeLessThanOrEqual(5);
  });
});

test.describe('[REQ-PRED-003] Prediction Click — Word Replacement', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('comm-board-dict', JSON.stringify([
        'hello', 'help', 'hero', 'hey', 'hi'
      ]));
    });
    await page.goto('/');
  });

  test('clicking a prediction replaces partial word and appends a space', async ({ page }) => {
    // Type "he"
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    // Click the first prediction button (should be "hello")
    const firstPrediction = page.locator('#prediction-bar button').first();
    await firstPrediction.click();

    // Display should now be "hello " (full word + trailing space)
    const displayText = await page.locator('#display-text').textContent();
    expect(displayText).toBe('hello ');
  });

  test('clicking a prediction clears the prediction bar', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    await page.locator('#prediction-bar button').first().click();

    // Prediction bar should collapse (prediction-bar:empty { display: none })
    const barHeight = await page.locator('#prediction-bar').evaluate(el =>
      el.getBoundingClientRect().height
    );
    expect(barHeight).toBe(0);
  });

  test('prediction buttons have minimum touch target height of 8vh', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();

    const eightVhPx = 844 * 0.08;

    const buttons = page.locator('#prediction-bar button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const height = await buttons.nth(i).evaluate(el =>
        el.getBoundingClientRect().height
      );
      expect(height).toBeGreaterThanOrEqual(eightVhPx - 0.5);
    }
  });
});
