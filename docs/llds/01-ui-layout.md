# LLD 01: User Interface & Layout Architecture

## 1. Purpose
Define the DOM structure and CSS layout strategy for the communication board, accommodating both Alphabetical and QWERTY layouts, light/dark themes, and maximizing touch target accessibility while strictly eliminating dead vertical whitespace.

## 2. Parent Document
`docs/high-level-design.md`

## 3. DOM Structure (HTML)
The HTML will be contained within a single `index.html` file. 

* `main#app-container`
    * `header#app-header`
        * `h1#app-title` 
        * `button#btn-settings`
    * `section#output-section` 
        ... (keep existing)
    * `section#keyboard-section` 
        ... (keep existing)
* `dialog#settings-panel`
    * `div.setting-row` (Text Input: `#input-user-name`) (Satisfies [REQ-SET-004])
    * `div.setting-row` (Theme Toggle: `#toggle-theme`) (Satisfies [REQ-SET-002])
    * `div.setting-row` (Layout Toggle: `#toggle-layout`) (Satisfies [REQ-SET-003])
    * `button#btn-close-settings`
## 4. Layout Strategy (CSS)

### 4.1. Theming & CSS Variables
* (Satisfies [REQ-STATE-002]) Use `:root` for Light Mode variables.
* (Satisfies [REQ-STATE-002]) Use `[data-theme="dark"]` on the `body` to override variables for Dark Mode.

### 4.1.1 Header Layout
* (Satisfies [REQ-SET-004]) `#app-header` MUST utilize `position: relative; display: flex; align-items: center; justify-content: center; min-height: 8vh;`
* (Satisfies [REQ-SET-004]) `#app-title` MUST be perfectly centered within the header.
* **Typography:** (Satisfies [REQ-SET-004]) To provide an elegant aesthetic while maintaining 100% offline compatibility (no external font requests), `#app-title` MUST use a native elegant serif font stack (`font-family: "Georgia", "Garamond", "Times New Roman", serif; font-weight: normal; font-style: italic;`).
* (Satisfies [REQ-SET-001]) `#btn-settings` MUST utilize `position: absolute; right: 0;` to anchor it to the right edge.

### 4.2. Viewport, Safety & Global Spacing
* (Satisfies [REQ-UI-002]) The `body` and `#app-container` MUST have `height: 100vh`, `width: 100vw`, `margin: 0`, and `overflow: hidden`.
* (Satisfies [REQ-UI-002]) All structural elements (`section`, `header`, `div`) MUST default to `margin: 0; padding: 0;` to prevent browser stylesheet interference.
* `#app-container` MUST use `box-sizing: border-box`, `padding: 10px`, `display: flex`, `flex-direction: column`, and a strict `gap: 10px`.
* `#output-section` MUST NOT shrink (`flex-shrink: 0`). 
* The `#display-area` MUST have a fixed height (`height: 24vh`), MUST use `box-sizing: border-box`, and MUST include internal padding (`padding: 2vh 2vw`) and a `line-height: 1.2` to ensure tall characters (ascenders/descenders) are never cut off by the container boundary.
* (Satisfies [REQ-PRED-002]) The `#prediction-bar` MUST completely collapse when empty (`:empty { display: none; }`).
* `#keyboard-section` MUST utilize `display: flex`, `flex-direction: column`, `flex-grow: 1`, and a strict `gap: 10px`.
* (Satisfies [REQ-UI-001] [REQ-UI-002]) All buttons MUST have `touch-action: manipulation` and `user-select: none`.

### 4.2.1 Text Rendering & Cursor Simulation
* (Satisfies [REQ-UI-002]) The `#display-area` MUST utilize `white-space: pre-wrap;` to ensure spaces are rendered.
* The `#display-area` MUST feature a simulated, blinking cursor (`::after` pseudo-element with `content: '|';`).
* **Defensive Alignment:** The cursor MUST inherit the exact `font-size` and `line-height` of the text, and utilize `vertical-align: baseline` or `vertical-align: bottom` to ensure it never drops below the standard letter baseline.
* The cursor MUST blink continuously using a CSS `@keyframes` animation toggling opacity.

### 4.3. Keyboard Grid (`#letter-grid`)
* **Base CSS:** (Satisfies [REQ-UI-001]) `display: grid; gap: 10px; flex-grow: 1;` 
* (Satisfies [REQ-UI-001]) Buttons must stretch to fill their grid cells entirely. 
* **Alphabetical Layout (Default):** (Satisfies [REQ-PREF-002])
    * `grid-template-columns: repeat(7, 1fr);` 
    * All `.letter-btn` elements span exactly 1 column by default (`grid-column: span 1;`).
* **QWERTY Layout (State variation):** (Satisfies [REQ-SET-003])
    * Apply `.layout-qwerty` class to `#letter-grid`.
    * To achieve an authentic staggered keyboard visual without nested HTML rows, the grid MUST use `grid-template-columns: repeat(20, 1fr);`.
    * Every `.letter-btn` MUST stretch to span 2 columns (`grid-column: span 2;`).
    * The 11th button ('a') MUST be staggered inwards (`grid-column: 2 / span 2;`).
    * The 20th button ('z') MUST be staggered further inwards (`grid-column: 4 / span 2;`).

### 4.4. Space Bar & Action Grid
* (Satisfies [REQ-UI-001]) Both the `#btn-space` and `#action-grid` MUST use a fixed height (`height: 8vh; flex-shrink: 0;`). 
* No margins are permitted anywhere on these elements. Spacing is strictly handled by the parent container's `gap: 10px`.
* `#action-grid`: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;`

### 4.5. Settings Panel
* (Satisfies [REQ-STATE-003] [REQ-SET-001]) Utilize the native HTML `<dialog>` element. Center the content and use large touch targets for the toggles.

## 5. Element Identifiers for JavaScript Bindings
* `#display-text` 
* `#btn-speak` (Satisfies [REQ-TTS-001])
* `#btn-clear` (Satisfies [REQ-INPUT-002])
* `#btn-backspace` (Satisfies [REQ-INPUT-003])
* `#btn-space`
* `#btn-settings` (Satisfies [REQ-SET-001])
* `#settings-panel` (Satisfies [REQ-SET-001])
* `#btn-close-settings`
* `#toggle-theme` (Satisfies [REQ-SET-002])
* `#toggle-layout` (Satisfies [REQ-SET-003])
* `.letter-btn` (Satisfies [REQ-INPUT-001])
* `#app-title` (Satisfies [REQ-SET-004])
* `#input-user-name` (Satisfies [REQ-SET-004])
