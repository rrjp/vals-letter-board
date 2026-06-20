// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 02: Web Speech API & Input State Logic — Verification Tests
 *
 * Covers:
 *   - Letter button clicks append text to display
 *   - Space bar appends space
 *   - Backspace removes last character
 *   - Clear empties display
 *   - Speak/Backspace disabled when display empty
 *   - Speak button invokes speechSynthesis.cancel() + speak()
 *
 * Note: We read #display-text (the span) instead of #display-area
 * because #display-area.textContent includes whitespace from HTML
 * indentation. The JS updates #display-text.textContent.
 */

test.describe('[REQ-INPUT-001] Text Input — Letters and Space', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking a letter button appends its lowercase text to the display', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="h"]').click();
    let text = await page.locator('#display-text').textContent();
    expect(text).toBe('h');

    await page.locator('.letter-btn[data-letter="i"]').click();
    text = await page.locator('#display-text').textContent();
    expect(text).toBe('hi');
  });

  test('clicking the space bar appends a space character', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="i"]').click();
    await page.locator('#btn-space').click();
    await page.locator('.letter-btn[data-letter="y"]').click();
    await page.locator('.letter-btn[data-letter="o"]').click();
    await page.locator('.letter-btn[data-letter="u"]').click();

    const text = await page.locator('#display-text').textContent();
    expect(text).toBe('hi you');
  });

  test('multiple letter clicks build up a word', async ({ page }) => {
    const letters = ['h', 'e', 'l', 'l', 'o'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }
    const text = await page.locator('#display-text').textContent();
    expect(text).toBe('hello');
  });
});

test.describe('[REQ-INPUT-003] Backspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('backspace removes the last character', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="a"]').click();
    await page.locator('.letter-btn[data-letter="b"]').click();
    let text = await page.locator('#display-text').textContent();
    expect(text).toBe('ab');

    await page.locator('#btn-backspace').click();
    text = await page.locator('#display-text').textContent();
    expect(text).toBe('a');
  });

  test('backspace on empty string does nothing (button is disabled)', async ({ page }) => {
    // On initial load, display is empty, so backspace is disabled
    const isDisabled = await page.locator('#btn-backspace').isDisabled();
    expect(isDisabled).toBe(true);

    const text = await page.locator('#display-text').textContent();
    expect(text).toBe('');
  });

  test('backspace removes a space character', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="a"]').click();
    await page.locator('#btn-space').click();
    await page.locator('.letter-btn[data-letter="b"]').click();
    let text = await page.locator('#display-text').textContent();
    expect(text).toBe('a b');

    await page.locator('#btn-backspace').click();
    text = await page.locator('#display-text').textContent();
    expect(text).toBe('a ');
  });
});

test.describe('[REQ-INPUT-002] Clear', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clear empties the display completely', async ({ page }) => {
    const letters = ['h', 'e', 'l', 'l', 'o'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }
    let text = await page.locator('#display-text').textContent();
    expect(text).toBe('hello');

    await page.locator('#btn-clear').click();
    text = await page.locator('#display-text').textContent();
    expect(text).toBe('');
  });

  test('clear on already empty display stays empty', async ({ page }) => {
    await page.locator('#btn-clear').click();
    const text = await page.locator('#display-text').textContent();
    expect(text).toBe('');
  });
});

test.describe('[REQ-STATE-001] Button Disable States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Speak and Backspace are disabled when display is empty (initial state)', async ({ page }) => {
    const speakDisabled = await page.locator('#btn-speak').isDisabled();
    const backspaceDisabled = await page.locator('#btn-backspace').isDisabled();

    expect(speakDisabled).toBe(true);
    expect(backspaceDisabled).toBe(true);
  });

  test('Speak and Backspace are enabled after typing a letter', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="a"]').click();

    const speakDisabled = await page.locator('#btn-speak').isDisabled();
    const backspaceDisabled = await page.locator('#btn-backspace').isDisabled();

    expect(speakDisabled).toBe(false);
    expect(backspaceDisabled).toBe(false);
  });

  test('Speak and Backspace become disabled again after clearing', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="a"]').click();
    await page.locator('#btn-clear').click();

    const speakDisabled = await page.locator('#btn-speak').isDisabled();
    const backspaceDisabled = await page.locator('#btn-backspace').isDisabled();

    expect(speakDisabled).toBe(true);
    expect(backspaceDisabled).toBe(true);
  });

  test('Backspace becomes disabled after removing last character', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="x"]').click();
    await page.locator('#btn-backspace').click();

    const speakDisabled = await page.locator('#btn-speak').isDisabled();
    const backspaceDisabled = await page.locator('#btn-backspace').isDisabled();

    expect(speakDisabled).toBe(true);
    expect(backspaceDisabled).toBe(true);
  });

  test('Clear button is never disabled', async ({ page }) => {
    let clearDisabled = await page.locator('#btn-clear').isDisabled();
    expect(clearDisabled).toBe(false);

    await page.locator('.letter-btn[data-letter="a"]').click();
    clearDisabled = await page.locator('#btn-clear').isDisabled();
    expect(clearDisabled).toBe(false);
  });
});

test.describe('[REQ-TTS-001] [REQ-TTS-002] Speech Synthesis', () => {
  test.beforeEach(async ({ page }) => {
    // Mock window.speechSynthesis before the page scripts execute
    await page.addInitScript(() => {
      window.__speechCalls = { cancelCount: 0, speakTexts: [] };

      window.SpeechSynthesisUtterance = function (text) {
        this.text = text;
      };

      // window.speechSynthesis is a native read-only property —
      // must use defineProperty to override it
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          cancel: () => {
            window.__speechCalls.cancelCount++;
          },
          speak: (utterance) => {
            window.__speechCalls.speakTexts.push(utterance.text);
            // Simulate speech ending — fires onend so the app can blur
            if (typeof utterance.onend === 'function') {
              utterance.onend();
            }
          },
        },
        writable: true,
        configurable: true,
      });
    });

    await page.goto('/');
  });

  test('clicking Speak calls speechSynthesis.cancel() then speak() with display text', async ({ page }) => {
    const letters = ['h', 'e', 'l', 'l', 'o'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }

    await page.locator('#btn-speak').click();

    const calls = await page.evaluate(() => window.__speechCalls);
    expect(calls.cancelCount).toBe(1);
    expect(calls.speakTexts).toEqual(['hello']);
  });

  test('speak button does nothing when display is empty (disabled, not clicked)', async ({ page }) => {
    const calls = await page.evaluate(() => window.__speechCalls);
    expect(calls.cancelCount).toBe(0);
    expect(calls.speakTexts.length).toBe(0);
  });

  test('clicking Speak on new text cancels previous and speaks current', async ({ page }) => {
    await page.locator('.letter-btn[data-letter="h"]').click();
    await page.locator('.letter-btn[data-letter="i"]').click();
    await page.locator('#btn-speak').click();

    await page.locator('#btn-clear').click();
    await page.locator('.letter-btn[data-letter="b"]').click();
    await page.locator('.letter-btn[data-letter="y"]').click();
    await page.locator('.letter-btn[data-letter="e"]').click();
    await page.locator('#btn-speak').click();

    const calls = await page.evaluate(() => window.__speechCalls);
    expect(calls.cancelCount).toBe(2);
    expect(calls.speakTexts).toEqual(['hi', 'bye']);
  });

  test('#btn-speak is blurred after speech completes (onend focus trap guard)', async ({ page }) => {
    // Type "hello" and click Speak
    const letters = ['h', 'e', 'l', 'l', 'o'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }

    // Clicking Speak makes it document.activeElement
    await page.locator('#btn-speak').click();

    // After speech onend fires (simulated synchronously in the mock),
    // the button should no longer be the active element
    const activeId = await page.evaluate(() =>
      document.activeElement ? document.activeElement.id : null
    );
    expect(activeId).not.toBe('btn-speak');
  });
});
