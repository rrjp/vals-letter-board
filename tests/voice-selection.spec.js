// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 02+05: Voice Selection — Verification Tests
 *
 * Covers:
 *   - #select-voice dropdown exists in settings panel
 *   - getVoices() populates <option> elements
 *   - Voice selection saves to localStorage preferences
 *   - Voice preference persists across reloads
 *   - utterance.voice is assigned before speak()
 */

// Helper: mock speechSynthesis with fake voices
async function mockVoices(page, voices) {
  await page.addInitScript((v) => {
    window.__mockVoices = v;

    // Store utterance for inspection
    window.__lastUtterance = null;
    window.__speechCalls = { cancelCount: 0, speakTexts: [] };

    window.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.voice = null;
      window.__lastUtterance = this;
    };

    // getVoices — return mock voices
    var voiceList = v.map(function (item) {
      return {
        name: item.name,
        lang: item.lang,
        voiceURI: item.voiceURI,
        default: item.default || false,
      };
    });

    var mockSynth = {
      getVoices: function () { return voiceList; },
      cancel: function () { window.__speechCalls.cancelCount++; },
      speak: function (utterance) {
        window.__speechCalls.speakTexts.push(utterance.text);
        if (typeof utterance.onend === 'function') utterance.onend();
      },
    };

    // Override native speechSynthesis with our mock
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSynth,
      writable: true,
      configurable: true,
    });

    // Add onvoiceschanged property that fires immediately
    Object.defineProperty(mockSynth, 'onvoiceschanged', {
      set: function (fn) { fn(); },
      get: function () { return null; },
      configurable: true,
    });
  }, voices);
}

test.describe('[REQ-SET-005] Voice Selection UI', () => {
  test('settings panel contains #select-voice dropdown', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-settings').click();

    const select = page.locator('#select-voice');
    await expect(select).toHaveCount(1);
    expect(await select.evaluate(el => el.tagName.toLowerCase())).toBe('select');
  });
});

test.describe('[REQ-SET-005] Voice Population', () => {
  test('getVoices() populates #select-voice with option elements', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex' },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha' },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'Daniel' },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    const options = page.locator('#select-voice option');
    const count = await options.count();
    expect(count).toBe(3);

    const names = await options.evaluateAll(els => els.map(el => el.textContent));
    expect(names).toContain('Alex (en-US)');
    expect(names).toContain('Samantha (en-US)');
    expect(names).toContain('Daniel (en-GB)');
  });
});

test.describe('[REQ-SET-005] Voice Selection Persistence', () => {
  test('selecting a voice saves its name to localStorage prefs', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex' },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha' },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    // Select "Samantha" by value (voiceURI)
    await page.locator('#select-voice').selectOption('Samantha');

    const prefs = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-prefs') || '{}')
    );
    expect(prefs.voiceName).toBe('Samantha');
    expect(prefs.voiceURI).toBe('Samantha');
  });

  test('voice preference persists across page reload', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex' },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha' },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();
    await page.locator('#select-voice').selectOption('Samantha');
    await page.locator('#btn-close-settings').click();

    // Reload
    await page.reload();

    // Re-open settings and check which voice is selected
    await page.locator('#btn-settings').click();
    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Samantha');

    const prefs = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('comm-board-prefs') || '{}')
    );
    expect(prefs.voiceName).toBe('Samantha');
  });

  test('saved voice is explicitly selected on page load', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Pre-seed localStorage with a saved voice
    await page.addInitScript(() => {
      localStorage.setItem('comm-board-prefs', JSON.stringify({
        userName: 'User', theme: 'light', layout: 'alpha',
        voiceName: 'Daniel', voiceURI: 'Daniel'
      }));
    });

    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex' },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'Daniel' },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Daniel');
  });

  test('browser language match takes priority over system default', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Mock navigator.language to 'en-US'
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
    });

    // German voice flagged default, en-US voice matches browser language
    await mockVoices(page, [
      { name: 'Klaus', lang: 'de-DE', voiceURI: 'Klaus', default: true },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha', default: false },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    // Should select Samantha (language match) over Klaus (system default)
    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Samantha');
  });

  test('system default voice is selected when no language match exists', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Mock navigator.language to 'fr-FR' (no voice matches)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });
    });

    // No voice matches fr-FR, but Samantha is default
    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex', default: false },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha', default: true },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    // Should select Samantha (system default, since no language match)
    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Samantha');
  });

  test('falls back to navigator.language when no default voice exists', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Mock navigator.language to 'en-GB'
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true,
      });
    });

    // No voice has default: true
    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex', default: undefined },
      { name: 'Pierre', lang: 'fr-FR', voiceURI: 'Pierre', default: undefined },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'Daniel', default: undefined },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    // Both Alex (en-US) and Daniel (en-GB) match base 'en';
    // Alex comes first in the array, so it gets selected.
    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Alex');
  });

  test('matches base language when regional tags differ (en-US vs en-GB)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Mock navigator.language to 'en-US'
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
    });

    // No voice has default: true; no voice has en-US
    await mockVoices(page, [
      { name: 'Klaus', lang: 'de-DE', voiceURI: 'Klaus', default: undefined },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'Daniel', default: undefined },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();

    // Should select en-GB (Daniel) — base language 'en' matches
    const selected = await page.locator('#select-voice').evaluate(el => el.value);
    expect(selected).toBe('Daniel');
  });
});

test.describe('[REQ-TTS-003] Voice Assignment on Speak', () => {
  test('utterance.voice is assigned the saved voice before speak()', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await mockVoices(page, [
      { name: 'Alex', lang: 'en-US', voiceURI: 'Alex' },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha' },
    ]);

    await page.goto('/');
    await page.locator('#btn-settings').click();
    await page.locator('#select-voice').selectOption('Samantha');
    await page.locator('#btn-close-settings').click();

    // Type and speak
    const letters = ['h', 'i'];
    for (const letter of letters) {
      await page.locator(`.letter-btn[data-letter="${letter}"]`).click();
    }
    await page.locator('#btn-speak').click();

    const utteranceVoice = await page.evaluate(() =>
      window.__lastUtterance ? window.__lastUtterance.voice : null
    );
    expect(utteranceVoice).not.toBeNull();
    expect(utteranceVoice.name).toBe('Samantha');
    expect(utteranceVoice.voiceURI).toBe('Samantha');
  });
});
