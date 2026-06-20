# Val's Letter Board

An offline-first, Progressive Web App (PWA) communication board featuring local text-to-speech, dynamic word prediction, and highly accessible touch targets. 

Designed specifically for the iPad, this application requires zero network connectivity once installed, prioritizing speed, reliability, and privacy.

## Table of Contents
- [Background & Inspiration](#background--inspiration)
- [Features](#features)
- [Methodology: Linked-Intent Development (LID)](#methodology-linked-intent-development-lid)
- [Installation (iPad / iOS)](#installation-ipad--ios)
- [Local Development & Testing](#local-development--testing)
- [Architecture & Design Documents](#architecture--design-documents)

## Background & Inspiration

[Insert Backstory Here: Explain the motivation for the project, the specific needs it addresses, and the journey of building it.]

## Features

* **100% Offline Execution:** Powered by a strict cache-first Service Worker, the board functions completely without Wi-Fi or cellular data after initial installation.
* **Native Vocalization:** Utilizes the browser's native `window.speechSynthesis` API for instantaneous, on-device audio without external API latency.
* **Dynamic Word Prediction:** A self-learning dictionary runs entirely in local memory (`localStorage`), predicting vocabulary based on frequency and usage to reduce keystrokes.
* **Accessible Fluid UI:** Built with CSS Flexbox and Grid to completely eliminate dead whitespace. Features massive, mathematically sized touch targets (`8vh` minimum) and an elegant, offline-safe serif typography stack.
* **Customization:** Includes persistent toggles for Light/Dark mode and Alphabetical/Staggered QWERTY layouts.

## Methodology: Linked-Intent Development (LID)

This project was engineered using a strict **Linked-Intent Development (LID)** and Test-Driven Development (TDD) loop, orchestrated alongside AI development agents (e.g. Hermes using DeepSeek V4 Pro with a total cost of 50 cents). 

No code was manually "hacked" or patched. Instead, the application was built by enforcing an "Arrow of Intent":
1. **Architectural Blueprints:** Every feature was first meticulously defined in Low-Level Design (LLD) Markdown documents, establishing strict rules for the DOM structure, CSS constraints, and JavaScript state logic.
2. **Automated Enforcement:** Playwright test suites were written to explicitly verify these LLD constraints.
3. **The Red/Green Loop:** Code was only generated to satisfy failing tests. If a bug was discovered (e.g., focus traps, ascender clipping, or flexbox clumping), the foundational LLD was updated, the test was rewritten to assert the fix, and the agent re-compiled the implementation to achieve a passing state.

This methodology resulted in highly defensive CSS, zero reliance on external UI frameworks, and mathematically verifiable layout constraints.

## Installation & Cross-Platform Support

Because this application is built as a Progressive Web App (PWA), it bypasses traditional app stores completely. It can be installed directly from the browser onto almost any modern operating system (iOS, Android, Windows, Mac, and Linux) and will run as a standalone, offline-capable native application.

### Apple (iPad / iPhone)
1. Open Safari and navigate to the securely hosted application URL.
2. Tap the **Share** button (the square with an arrow pointing up) in the Safari toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm the addition. 

### Android (Tablets / Phones)
1. Open Google Chrome and navigate to the application URL.
2. A banner may appear at the bottom of the screen prompting you to **"Add Valerie's Letter Board to Home screen"**. 
3. If the banner does not appear, tap the three-dot menu icon in the top right corner.
4. Select **Install app** (or "Add to Home screen") and confirm.

### Desktop (Windows / Mac / Linux)
1. Open a Chromium-based browser (Google Chrome, Microsoft Edge, Brave) and navigate to the application URL.
2. Look at the far right side of the URL address bar.
3. Click the **Install** icon (it typically looks like a computer monitor with a downward arrow).
4. The application will install and immediately open in a standalone window, adding an icon to your desktop or application launcher.

*Note: Once installed on any device, the app will boot into a full-screen or windowed mode without browser chrome. You can safely disable Wi-Fi/enable Airplane Mode to verify the offline Service Worker.*

[Insert Screenshots Here: Safari Share Sheet -> Add to Home Screen -> Final Installed Icon]

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
