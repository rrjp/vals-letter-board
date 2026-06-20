// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * LLD 01: User Interface & Layout Architecture — Verification Tests (v2)
 *
 * Covers updated LLD:
 *   - DOM structure (incl. #btn-space)
 *   - Flexbox fluid layout (zero dead whitespace)
 *   - CSS Grid layout (letter-grid, action-grid)
 *   - #display-area min-height: 24vh
 *   - Touch target sizes (8vh minimum)
 *   - Theming CSS variables
 *   - Viewport & safety styles
 *   - Default state (light mode, alphabetical layout)
 */

test.describe('[REQ-UI-002] DOM Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('app-container exists and wraps all content', async ({ page }) => {
    const container = page.locator('#app-container');
    await expect(container).toHaveCount(1);
  });

  test('header section with title and settings button', async ({ page }) => {
    const header = page.locator('#app-header');
    await expect(header).toHaveCount(1);
    const appTitle = header.locator('#app-title');
    await expect(appTitle).toHaveCount(1);
    const btnSettings = header.locator('#btn-settings');
    await expect(btnSettings).toHaveCount(1);
  });

  test('output section with display area and prediction bar', async ({ page }) => {
    const outputSection = page.locator('#output-section');
    await expect(outputSection).toHaveCount(1);
    const displayArea = outputSection.locator('#display-area');
    await expect(displayArea).toHaveCount(1);
    const predictionBar = outputSection.locator('#prediction-bar');
    await expect(predictionBar).toHaveCount(1);
  });

  test('keyboard section with letter grid, space bar, and action grid in order', async ({ page }) => {
    const keyboardSection = page.locator('#keyboard-section');
    await expect(keyboardSection).toHaveCount(1);

    // All three children must be direct children of #keyboard-section
    const letterGrid = keyboardSection.locator('> #letter-grid');
    await expect(letterGrid).toHaveCount(1);

    const btnSpace = keyboardSection.locator('> #btn-space');
    await expect(btnSpace).toHaveCount(1);

    const actionGrid = keyboardSection.locator('> #action-grid');
    await expect(actionGrid).toHaveCount(1);

    // Verify DOM order: letter-grid → btn-space → action-grid
    const childIds = await keyboardSection.evaluate(el =>
      Array.from(el.children).map(c => c.id)
    );
    expect(childIds).toEqual(['letter-grid', 'btn-space', 'action-grid']);
  });

  test('26 letter buttons with data-letter attribute and class .letter-btn', async ({ page }) => {
    const letterButtons = page.locator('#letter-grid .letter-btn');
    await expect(letterButtons).toHaveCount(26);

    const count = await letterButtons.count();
    for (let i = 0; i < count; i++) {
      const dataLetter = await letterButtons.nth(i).getAttribute('data-letter');
      expect(dataLetter).toBeTruthy();
      expect(dataLetter).toMatch(/^[a-z]$/);
    }
  });

  test('each letter button has unique data-letter values a through z', async ({ page }) => {
    const letters = await page.locator('#letter-grid .letter-btn')
      .evaluateAll(els => els.map(el => el.getAttribute('data-letter')).sort());
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    expect(letters).toEqual(alphabet);
  });

  test('action grid contains Speak, Clear, and Backspace buttons', async ({ page }) => {
    const btnSpeak = page.locator('#btn-speak');
    const btnClear = page.locator('#btn-clear');
    const btnBackspace = page.locator('#btn-backspace');

    await expect(btnSpeak).toHaveCount(1);
    await expect(btnClear).toHaveCount(1);
    await expect(btnBackspace).toHaveCount(1);
  });

  test('settings panel dialog with user name input, toggles, and close', async ({ page }) => {
    const dialog = page.locator('#settings-panel');
    await expect(dialog).toHaveCount(1);

    // User name input (first row)
    const inputUserName = dialog.locator('#input-user-name');
    await expect(inputUserName).toHaveCount(1);

    // Theme toggle
    const toggleTheme = dialog.locator('#toggle-theme');
    await expect(toggleTheme).toHaveCount(1);

    // Layout toggle
    const toggleLayout = dialog.locator('#toggle-layout');
    await expect(toggleLayout).toHaveCount(1);

    // Close button
    const btnClose = dialog.locator('#btn-close-settings');
    await expect(btnClose).toHaveCount(1);

    // Four setting rows
    const settingRows = dialog.locator('.setting-row');
    await expect(settingRows).toHaveCount(4);
  });

  test('display text element exists', async ({ page }) => {
    const displayText = page.locator('#display-text');
    await expect(displayText).toHaveCount(1);
  });
});

test.describe('[REQ-SET-004] Header Layout — LLD §4.1.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#app-header uses relative positioning, flex centering, min-height 8vh', async ({ page }) => {
    const styles = await page.locator('#app-header').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        position: s.position,
        display: s.display,
        justifyContent: s.justifyContent,
        alignItems: s.alignItems,
        minHeight: s.minHeight,
      };
    });
    expect(styles.position).toBe('relative');
    expect(styles.display).toBe('flex');
    expect(styles.justifyContent).toBe('center');
    expect(styles.alignItems).toBe('center');

    // min-height: 8vh
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVh = viewport.height * 0.08;
    const actualMinHeight = parseFloat(styles.minHeight);
    expect(Math.abs(actualMinHeight - eightVh)).toBeLessThanOrEqual(1);
  });

  test('#app-title is centered within the header', async ({ page }) => {
    const headerRect = await page.locator('#app-header').evaluate(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });
    const titleRect = await page.locator('#app-title').evaluate(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right };
    });

    // Distance from left edge of header to left edge of title
    // should equal distance from right edge of title to right edge of header
    const leftGap = titleRect.left - headerRect.left;
    const rightGap = headerRect.right - titleRect.right;
    // Allow 1px subpixel tolerance
    expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(1);
  });

  test('#btn-settings is absolutely positioned to the right', async ({ page }) => {
    const styles = await page.locator('#btn-settings').evaluate(el => {
      const s = getComputedStyle(el);
      return { position: s.position, right: s.right };
    });
    expect(styles.position).toBe('absolute');

    // right: 0 in computed px — should be small (0px or close, allowing for
    // potential browser-specific padding on the header)
    const rightPx = parseFloat(styles.right);
    expect(rightPx).toBeLessThanOrEqual(16);
  });

  test('#app-title uses offline-safe serif font stack (Georgia, italic, normal weight)', async ({ page }) => {
    const styles = await page.locator('#app-title').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
      };
    });
    expect(styles.fontFamily).toMatch(/Georgia/);
    expect(styles.fontWeight).toBe('400');
    expect(styles.fontStyle).toBe('italic');
  });
});

test.describe('[REQ-UI-002] CSS Layout & Viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('body has height: 100vh, width: 100vw, margin: 0, overflow: hidden', async ({ page }) => {
    const bodyStyles = await page.locator('body').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        height: s.height,
        width: s.width,
        margin: s.margin,
        overflow: s.overflow,
      };
    });

    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const vp = viewport;
    const expectedHeight = `${vp.height}px`;
    const expectedWidth = `${vp.width}px`;

    expect(bodyStyles.height).toBe(expectedHeight);
    expect(bodyStyles.width).toBe(expectedWidth);
    expect(bodyStyles.margin).toBe('0px');
    expect(bodyStyles.overflow).toBe('hidden');
  });

  test('#app-container has height: 100vh, width: 100vw, overflow: hidden', async ({ page }) => {
    const styles = await page.locator('#app-container').evaluate(el => {
      const s = getComputedStyle(el);
      return { height: s.height, width: s.width, overflow: s.overflow };
    });

    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    expect(styles.height).toBe(`${viewport.height}px`);
    expect(styles.width).toBe(`${viewport.width}px`);
    expect(styles.overflow).toBe('hidden');
  });

  test('all buttons have touch-action: manipulation and user-select: none', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const touchAction = await btn.evaluate(el => getComputedStyle(el).touchAction);
      const userSelect = await btn.evaluate(el => getComputedStyle(el).userSelect);
      expect(touchAction).toBe('manipulation');
      expect(userSelect).toBe('none');
    }
  });
});

test.describe('[REQ-UI-002] Flexbox Fluid Layout (Whitespace Elimination)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#app-container uses box-sizing: border-box, padding: 10px, flex column, gap: 10px', async ({ page }) => {
    const styles = await page.locator('#app-container').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        boxSizing: s.boxSizing,
        padding: s.padding,
        display: s.display,
        flexDirection: s.flexDirection,
        gap: s.gap,
      };
    });
    expect(styles.boxSizing).toBe('border-box');
    expect(styles.padding).toBe('10px');
    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
    expect(styles.gap).toBe('10px');
  });

  test('#output-section has flex-shrink: 0', async ({ page }) => {
    const flexShrink = await page.locator('#output-section')
      .evaluate(el => getComputedStyle(el).flexShrink);
    expect(flexShrink).toBe('0');
  });

  test('#keyboard-section uses flex column, flex-grow: 1, gap: 10px', async ({ page }) => {
    const styles = await page.locator('#keyboard-section').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        display: s.display,
        flexDirection: s.flexDirection,
        flexGrow: s.flexGrow,
        gap: s.gap,
      };
    });
    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
    expect(styles.flexGrow).toBe('1');
    expect(styles.gap).toBe('10px');
  });

  test('#letter-grid stretches to fill vertical space between output section and space bar', async ({ page }) => {
    // #letter-grid has flex-grow: 1. It should absorb all remaining vertical
    // space within #keyboard-section after accounting for gap (10px × 2)
    // and the fixed heights of #btn-space (8vh) and #action-grid (8vh).
    const kbd = await page.locator('#keyboard-section').evaluate(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        contentHeight: r.height - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom),
      };
    });
    const letterHeight = await page.locator('#letter-grid')
      .evaluate(el => el.getBoundingClientRect().height);
    const btnSpaceHeight = await page.locator('#btn-space')
      .evaluate(el => el.getBoundingClientRect().height);
    const actionGridHeight = await page.locator('#action-grid')
      .evaluate(el => el.getBoundingClientRect().height);

    // Expected: letter-grid height = kbd content height - gaps(20px) - btn-space - action-grid
    const expected = kbd.contentHeight - 20 - btnSpaceHeight - actionGridHeight;
    expect(Math.abs(letterHeight - expected)).toBeLessThanOrEqual(1);
  });

  test('#prediction-bar collapses to 0px height when empty', async ({ page }) => {
    // The #prediction-bar starts empty (no children). It must use
    // :empty { display: none } to consume zero space.
    const rect = await page.locator('#prediction-bar').evaluate(el => {
      const r = el.getBoundingClientRect();
      return { height: r.height, width: r.width };
    });
    expect(rect.height).toBe(0);
  });

  test('vertical gap between #display-area and #letter-grid equals 10px', async ({ page }) => {
    // With prediction-bar collapsed and no padding on #output-section,
    // the only vertical space between display-area and letter-grid
    // should be the 10px gap on #app-container.
    const displayBottom = await page.locator('#display-area')
      .evaluate(el => el.getBoundingClientRect().bottom);
    const letterTop = await page.locator('#letter-grid')
      .evaluate(el => el.getBoundingClientRect().top);

    const gap = letterTop - displayBottom;
    expect(Math.abs(gap - 10)).toBeLessThanOrEqual(1);
  });

  test('#app-container fills the entire viewport (children + gaps + padding = 100vh)', async ({ page }) => {
    // With box-sizing: border-box, padding: 10px, and gap: 10px,
    // childrenHeights + gaps = contentHeight, and contentHeight + 2×padding = containerHeight
    const container = await page.locator('#app-container').evaluate(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        height: r.height,
        paddingV: parseFloat(s.paddingTop) + parseFloat(s.paddingBottom),
      };
    });
    const childCount = await page.locator('#app-container > *').count();
    const childrenHeights = await page.locator('#app-container > *').evaluateAll(els =>
      els.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0)
    );
    const gapTotal = (childCount - 1) * 10; // 10px gap between each pair

    // children + gaps = content area; content area + padding = container
    const expectedContainer = childrenHeights + gapTotal + container.paddingV;
    expect(Math.abs(container.height - expectedContainer)).toBeLessThanOrEqual(1);
  });
});

test.describe('[REQ-UI-002] Display Area', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#display-area has fixed height of exactly 24vh', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const twentyFourVh = viewport.height * 0.24;

    const actualHeight = await page.locator('#display-area').evaluate(el =>
      el.getBoundingClientRect().height
    );

    expect(Math.abs(actualHeight - twentyFourVh)).toBeLessThanOrEqual(1);
  });

  test('#display-area has box-sizing: border-box, padding: 2vh 2vw, line-height: 1.2', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();

    const styles = await page.locator('#display-area').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        boxSizing: s.boxSizing,
        paddingTop: s.paddingTop,
        paddingRight: s.paddingRight,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        lineHeight: s.lineHeight,
        fontSize: s.fontSize,
      };
    });

    // box-sizing
    expect(styles.boxSizing).toBe('border-box');

    // padding: 2vh 2vw → top/bottom = 2vh, left/right = 2vw
    const twoVh = viewport.height * 0.02;
    const twoVw = viewport.width * 0.02;
    expect(Math.abs(parseFloat(styles.paddingTop) - twoVh)).toBeLessThanOrEqual(1);
    expect(Math.abs(parseFloat(styles.paddingBottom) - twoVh)).toBeLessThanOrEqual(1);
    expect(Math.abs(parseFloat(styles.paddingLeft) - twoVw)).toBeLessThanOrEqual(1);
    expect(Math.abs(parseFloat(styles.paddingRight) - twoVw)).toBeLessThanOrEqual(1);

    // line-height: 1.2 → computed pixel value ≈ fontSize * 1.2
    const resolvedLineHeight = parseFloat(styles.lineHeight);
    const resolvedFontSize = parseFloat(styles.fontSize);
    expect(Math.abs(resolvedLineHeight - resolvedFontSize * 1.2)).toBeLessThanOrEqual(1);
  });

  test('#display-area has white-space: pre-wrap', async ({ page }) => {
    const whiteSpace = await page.locator('#display-area')
      .evaluate(el => getComputedStyle(el).whiteSpace);
    expect(whiteSpace).toBe('pre-wrap');
  });

  test('#display-area ::after pseudo-element renders a pipe cursor with defensive alignment', async ({ page }) => {
    const styles = await page.locator('#display-area').evaluate(el => {
      const s = getComputedStyle(el, '::after');
      return {
        content: s.content,
        animationName: s.animationName,
        verticalAlign: s.verticalAlign,
      };
    });

    // content is the pipe character
    expect(styles.content).toMatch(/\|/);
    // animation is active
    expect(styles.animationName).not.toBe('none');
    // LLD §4.2.1: defensive alignment — must use baseline or bottom
    expect(['baseline', 'bottom']).toContain(styles.verticalAlign);
  });
});

test.describe('[REQ-UI-001] [REQ-PREF-002] [REQ-SET-003] Keyboard Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#letter-grid uses display: grid with gap: 10px and flex-grow: 1', async ({ page }) => {
    const letterGrid = page.locator('#letter-grid');
    const display = await letterGrid.evaluate(el => getComputedStyle(el).display);
    const gap = await letterGrid.evaluate(el => getComputedStyle(el).gap);
    const flexGrow = await letterGrid.evaluate(el => getComputedStyle(el).flexGrow);

    expect(display).toBe('grid');
    expect(gap).toBe('10px');
    expect(flexGrow).toBe('1');
  });

  test('default alphabetical layout uses grid-template-columns: repeat(7, 1fr)', async ({ page }) => {
    const columnList = await page.locator('#letter-grid')
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(c => c.length > 0));

    expect(columnList.length).toBe(7);
  });

  test('QWERTY layout uses 20-column staggered grid', async ({ page }) => {
    await page.locator('#letter-grid').evaluate(el => el.classList.add('layout-qwerty'));

    const columnList = await page.locator('#letter-grid')
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(c => c.length > 0));
    expect(columnList.length).toBe(20);
  });

  test('QWERTY layout: 11th button (a) starts at grid column 2', async ({ page }) => {
    // Activate QWERTY and reorder DOM to match QWERTY sequence
    await page.locator('#letter-grid').evaluate(el => el.classList.add('layout-qwerty'));
    // Simulate the JS reorder: set DOM to QWERTY order for nth-child to work
    await page.evaluate(() => {
      var grid = document.getElementById('letter-grid');
      var order = 'qwertyuiopasdfghjklzxcvbnm'.split('');
      var map = {};
      grid.querySelectorAll('.letter-btn').forEach(function (b) {
        map[b.getAttribute('data-letter')] = b;
      });
      grid.querySelectorAll('.letter-btn').forEach(function (b) { b.remove(); });
      order.forEach(function (l) { if (map[l]) grid.appendChild(map[l]); });
    });

    // 11th child = 'a', grid-column should be '2'
    const colStart = await page.locator('#letter-grid .letter-btn').nth(10)
      .evaluate(el => getComputedStyle(el).gridColumnStart);
    expect(colStart).toBe('2');
  });

  test('QWERTY layout: 20th button (z) starts at grid column 4', async ({ page }) => {
    await page.locator('#letter-grid').evaluate(el => el.classList.add('layout-qwerty'));
    await page.evaluate(() => {
      var grid = document.getElementById('letter-grid');
      var order = 'qwertyuiopasdfghjklzxcvbnm'.split('');
      var map = {};
      grid.querySelectorAll('.letter-btn').forEach(function (b) {
        map[b.getAttribute('data-letter')] = b;
      });
      grid.querySelectorAll('.letter-btn').forEach(function (b) { b.remove(); });
      order.forEach(function (l) { if (map[l]) grid.appendChild(map[l]); });
    });

    // 20th child = 'z', grid-column should be '4'
    const colStart = await page.locator('#letter-grid .letter-btn').nth(19)
      .evaluate(el => getComputedStyle(el).gridColumnStart);
    expect(colStart).toBe('4');
  });
});

test.describe('[REQ-UI-001] Space Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#btn-space is full-width (width: 100%)', async ({ page }) => {
    // Compare #btn-space width to the content area of #keyboard-section
    // (bounding rect includes padding; width: 100% fills content area only)
    const parentBox = await page.locator('#keyboard-section').evaluate(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        contentWidth: rect.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      };
    });
    const spaceWidth = await page.locator('#btn-space').evaluate(el =>
      el.getBoundingClientRect().width
    );

    expect(Math.abs(spaceWidth - parentBox.contentWidth)).toBeLessThanOrEqual(1);
  });

  test('#btn-space has height: 8vh, flex-shrink: 0, no margin', async ({ page }) => {
    const styles = await page.locator('#btn-space').evaluate(el => {
      const s = getComputedStyle(el);
      return {
        height: s.height,
        flexShrink: s.flexShrink,
        marginTop: s.marginTop,
      };
    });

    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVh = viewport.height * 0.08;

    // Fixed height = 8vh (tolerance for subpixel rounding)
    const actualHeight = parseFloat(styles.height);
    expect(Math.abs(actualHeight - eightVh)).toBeLessThanOrEqual(1);
    expect(styles.flexShrink).toBe('0');
    expect(styles.marginTop).toBe('0px');
  });
});

test.describe('[REQ-UI-001] Action Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('#action-grid uses display: grid, 3 columns, gap: 10px, height: 8vh, flex-shrink: 0', async ({ page }) => {
    const actionGrid = page.locator('#action-grid');
    const styles = await actionGrid.evaluate(el => {
      const s = getComputedStyle(el);
      return {
        display: s.display,
        gap: s.gap,
        height: s.height,
        flexShrink: s.flexShrink,
        gridTemplateColumns: s.gridTemplateColumns,
      };
    });

    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVh = viewport.height * 0.08;

    expect(styles.display).toBe('grid');
    expect(styles.gap).toBe('10px');
    expect(Math.abs(parseFloat(styles.height) - eightVh)).toBeLessThanOrEqual(1);
    expect(styles.flexShrink).toBe('0');

    const columnList = styles.gridTemplateColumns.split(' ').filter(c => c.length > 0);
    expect(columnList.length).toBe(3);
  });
});

test.describe('[REQ-UI-001] Touch Target Sizes', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('all letter buttons have min-height of at least 8vh', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVhPx = viewport.height * 0.08;

    const letterButtons = page.locator('#letter-grid .letter-btn');
    const count = await letterButtons.count();
    expect(count).toBe(26);

    for (let i = 0; i < count; i++) {
      const height = await letterButtons.nth(i).evaluate(el => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThanOrEqual(eightVhPx - 0.5);
    }
  });

  test('#btn-space has min-height of at least 8vh', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVhPx = viewport.height * 0.08;

    const height = await page.locator('#btn-space')
      .evaluate(el => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(eightVhPx - 0.5);
  });

  test('action buttons meet 8vh minimum', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const eightVhPx = viewport.height * 0.08;

    const actionButtons = ['#btn-speak', '#btn-clear', '#btn-backspace'];
    for (const id of actionButtons) {
      const height = await page.locator(id).evaluate(el => el.getBoundingClientRect().height);
      expect(height, `${id} height ${height} should be >= ${eightVhPx}`)
        .toBeGreaterThanOrEqual(eightVhPx - 0.5);
    }
  });
});

test.describe('[REQ-PREF-002] [REQ-STATE-002] Theming CSS Variables', () => {
  test('light mode (default) uses light theme colors', async ({ page }) => {
    await page.goto('/');

    const bgColor = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--bg-color').trim()
    );
    const textColor = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--text-color').trim()
    );
    const btnBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--btn-bg').trim()
    );

    expect(bgColor).toBe('#ffffff');
    expect(textColor).toBe('#000000');
    expect(btnBg).toBe('#f0f0f0');
  });

  test('dark mode overrides CSS variables', async ({ page }) => {
    await page.goto('/');
    await page.locator('html').evaluate(el => el.setAttribute('data-theme', 'dark'));

    const bgColor = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--bg-color').trim()
    );
    const textColor = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--text-color').trim()
    );
    const btnBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--btn-bg').trim()
    );

    expect(bgColor).toBe('#121212');
    expect(textColor).toBe('#ffffff');
    expect(btnBg).toBe('#333333');
  });
});

test.describe('[REQ-STATE-003] Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('settings panel is a native <dialog> element', async ({ page }) => {
    const tagName = await page.locator('#settings-panel').evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('dialog');
  });

  test('color variables for action buttons exist', async ({ page }) => {
    const btnClearBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--btn-clear-bg').trim()
    );
    const btnSpeakBg = await page.locator('body').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--btn-speak-bg').trim()
    );

    expect(btnClearBg.length).toBeGreaterThan(0);
    expect(btnSpeakBg.length).toBeGreaterThan(0);
  });
});
