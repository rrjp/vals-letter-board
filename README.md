# Val's Letter Board

An offline-first, Progressive Web App (PWA) communication board featuring local text-to-speech, dynamic word prediction, and highly accessible touch targets. 

Designed specifically for tablets, this application requires zero network connectivity once installed, prioritizing speed, reliability, and privacy.

## Table of Contents
- [Background & Inspiration](#background--inspiration)
- [Features](#features)
- [Methodology: Linked-Intent Development (LID)](#methodology-linked-intent-development-lid)
- [Installation](#installation--cross-platform-support)
- [Local Development & Testing](#local-development--testing)
- [Architecture & Design Documents](#architecture--design-documents)

## Background & Inspiration

In October 2025 my wife suffered a stroke and is relearning how to speak. Day to day she uses a paper letter board. I looked into other letter board apps but they either cost money (in some cases a subscription) or were free or open source but didn't work at all or were full of bugs. I've been writing software since the late 1970s so I figured I'd take a crack at it. I also wanted to learn some spec driven development (SDD) using the linked intent development strategy and figured this would be a good small project to try it on. I wanted the app to be able to work on a tablet totally offline so that it could be used in places where the patient didn't have WiFi like a doctors office.  

## Features

* **100% Offline Execution:** Powered by a robust **Stale-While-Revalidate Service Worker**, the board loads instantly and functions completely offline. Updates are silently fetched in the background and applied on subsequent reloads.
* **Native Vocalization:** Utilizes the browser's native `window.speechSynthesis` API for instantaneous, on-device audio without external API latency. Includes deep defense-in-depth fixes to prevent the iOS Safari WebKit speech freezing bug.
* **Offline Voice Suffix Markers:** Automatically identifies on-device vs. cloud-based voices (`localService`), appending `(offline)` or `(cloud)` to the dropdown options so users can easily select a voice that functions without an active internet connection.
* **Dynamic Word Prediction:** A self-learning dictionary runs entirely in local memory (`localStorage`), predicting vocabulary based on frequency and usage to reduce keystrokes.
* **Accessible Fluid UI:** Built with CSS Flexbox and Grid to completely eliminate dead whitespace. Features massive, mathematically sized touch targets (`8vh` minimum) and an elegant, offline-safe serif typography stack.
* **Switch-Access & Keyboard Compatibility:** Includes high-contrast `:focus-visible` focus outlines (`4px solid #4dabf7`) to support users navigating via assistive hardware switch controllers, mouth-puff switches, or Bluetooth controllers. **Crucially**, it is designed to prevent mobile on-screen virtual keyboards from ever popping up and covering the board.
* **Screen Reader Friendly:** Incorporates `role="status"` and `aria-live="polite"` tags so screen reader devices dynamically announce letters and words as they are typed.
* **WCAG-Compliant Visual Contrast:** Features high-contrast typography and buttons exceeding WCAG 2.1 AA/AAA guidelines, including darker high-contrast styling for the Action Grid (Speak, Clear, and Backspace) across both Light and Dark themes.
* **Customization:** Includes persistent toggles for Light/Dark mode and Alphabetical/Staggered QWERTY layouts. Touch/mouse-clicks outside the settings panel bounds naturally dismisses the modal backdrop.

## Methodology: Linked-Intent Development (LID)

This project was engineered using a strict **Linked-Intent Development (LID)** and Test-Driven Development (TDD) loop, orchestrated alongside AI development agents (e.g. Hermes using DeepSeek V4 Pro with a total cost of 50 cents). 

No code was manually "hacked" or patched. Instead, the application was built by enforcing an "Arrow of Intent":
1. **Architectural Blueprints:** Every feature was first meticulously defined in Low-Level Design (LLD) Markdown documents, establishing strict rules for the DOM structure, CSS constraints, and JavaScript state logic.
2. **Automated Enforcement:** Playwright test suites were written to explicitly verify these LLD constraints.
3. **The Red/Green Loop:** Code was only generated to satisfy failing tests. If a bug was discovered (e.g., focus traps, ascender clipping, or flexbox clumping), the foundational LLD was updated, the test was rewritten to assert the fix, and the agent re-compiled the implementation to achieve a passing state.

This methodology resulted in highly defensive CSS, zero reliance on external UI frameworks, and mathematically verifiable layout constraints.

I did not use the official LID skills though so anything that doesn't correspond to the official LID methodology is an oversight on my side.

## Installation & Cross-Platform Support

Because this application is built as a Progressive Web App (PWA), it bypasses traditional app stores completely. It can be installed directly from the browser onto almost any modern operating system (iOS, Android, Windows, Mac, and Linux) and will run as a standalone, offline-capable native application.

### Apple (iPad / iPhone)
1. Open Safari and navigate to the securely hosted [application URL](https://rrjp.github.io/vals-letter-board/).
2. Tap the **Share** button (the square with an arrow pointing up) in the Safari toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm the addition. 

### Android (Tablets / Phones)
1. Open Google Chrome and navigate to the [application URL](https://rrjp.github.io/vals-letter-board/).
2. A banner may appear at the bottom of the screen prompting you to **"Add Valerie's Letter Board to Home screen"**. 
3. If the banner does not appear, tap the three-dot menu icon in the top right corner.
4. Select **Install app** (or "Add to Home screen") and confirm.

### Desktop (Windows / Mac / Linux)
1. Open a Chromium-based browser (Google Chrome, Microsoft Edge, Brave) and navigate to the [application URL](https://rrjp.github.io/vals-letter-board/).
2. Look at the far right side of the URL address bar.
3. Click the **Install** icon (it typically looks like a computer monitor with a downward arrow).
4. The application will install and immediately open in a standalone window, adding an icon to your desktop or application launcher.

*Note: Once installed on any device, the app will boot into a full-screen or windowed mode without browser chrome. You can safely disable Wi-Fi/enable Airplane Mode to verify the offline Service Worker.*

## Local Development & Testing

To run the project locally or execute the Playwright test suite:

### Prerequisites
* Node.js
* Python 3 (for the local server)
* *Note: Playwright WebKit testing may require specific dependencies on rolling-release Linux distributions (like Arch/Manjaro).*

### Running the App Locally
```bash
# Start a simple HTTP server in the root directory
python3 -m http.server 8080
```
Navigate to http://localhost:8080 in native Chromium or Firefox.

Running the Test Suite
The Playwright suite verifies DOM structure, CSS Flexbox mathematical constraints, state logic, and offline Service Worker interception.

```Bash
# Run all tests headlessly
npx playwright test

# Run tests with the UI visualizer
npx playwright test --ui
```

## Architecture & Design Documents

The complete intent and logic constraints for this application are preserved in the /docs directory.

- llds/01-ui-layout.md - Viewport, CSS Grid, and Font constraints.
- llds/02-speech-api.md - State management and Focus Trap defenses.
- llds/03-service-worker-offline.md - PWA Manifest and Cache-First routing.
- llds/04-word-prediction-dynamic.md - LocalStorage read/write logic.
- llds/05-settings.md - Personalization and DOM reordering logic.
