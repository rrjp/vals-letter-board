# LLD 03: PWA Manifest & Offline Service Worker

## 1. Purpose
Define the configuration required to make the application installable as a standalone native app on iOS/Android, and implement a strict Service Worker caching strategy to guarantee 100% offline functionality.

## 2. Parent Document
`docs/high-level-design.md`

## 3. The Web App Manifest (`manifest.json`)
* (Satisfies [REQ-PWA-001]) The system MUST include a `manifest.json` file in the root directory.
* **Display Mode:** MUST be set to `"standalone"` to hide the browser UI (URL bar, navigation buttons).
* **Identity:** MUST include a `"name"` and `"short_name"`.
* **Colors:** MUST define a `"background_color"` and `"theme_color"` that match the Light Mode CSS variables.
* **Icons:** MUST define an array of icons referencing the generated PNG assets (e.g., `icon-192.png`, `icon-512.png`).

## 4. The Service Worker (`sw.js`)
* (Satisfies [REQ-PWA-001]) The system MUST include a `sw.js` file in the root directory.
* **Cache Name:** MUST establish a distinct cache version (e.g., `comm-board-v1`).
* **Install Event:** (Satisfies [REQ-PWA-001]) Upon installation, the Service Worker MUST aggressively cache the core application shell: `index.html`, `manifest.json`, and the icon PNGs.
* **Activate Event:** (Satisfies [REQ-PWA-001]) Upon activation, the Service Worker MUST delete any previous, outdated cache versions.
* **Fetch Event (Stale-While-Revalidate Strategy):** (Satisfies [REQ-ACC-005]) The Service Worker MUST intercept every network request and serve the cached file immediately for instantaneous, offline-capable loading. Simultaneously, it MUST fetch the file from the network in the background to update the cache for the next load, ensuring users receive updates without requiring manual cache busting.
* **Automated Update Lifecycle:**
    * **Service Worker:** The `sw.js` file MUST include a `message` event listener. If it receives a message with the data `'SKIP_WAITING'`, it MUST execute `self.skipWaiting()` to immediately activate.
    * **Client Initialization:** The main application script MUST listen for the Service Worker's `updatefound` event. 
    * When a new worker successfully reaches the `installed` state, the client MUST immediately send the `'SKIP_WAITING'` message to the new worker.
    * The client MUST listen for the `controllerchange` event and execute a single `window.location.reload()` to instantly boot the new application version, utilizing a boolean flag to prevent infinite reload loops.

## 5. HTML Integration (`index.html`)
* The `<head>` MUST contain an explicit relative link to the manifest: `<link rel="manifest" href="./manifest.json">`.
* The `<head>` MUST contain the Apple-specific meta tag for the icon using an explicit relative link: `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`.
* (Satisfies [REQ-PWA-001]) The bottom of the HTML file (inside the `<script>` block) MUST register the Service Worker if the browser supports it (`if ('serviceWorker' in navigator) { ... }`).
