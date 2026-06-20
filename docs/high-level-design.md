# High-Level Design (HLD): Val's Letter Board

## 1. Purpose & Scope
Val's Letter Board is a Progressive Web App (PWA) designed to provide a highly accessible, offline-first communication interface for an iPad. The system prioritizes large touch targets, instantaneous local speech synthesis, dynamic word prediction to minimize physical keystrokes, and strict privacy by requiring zero network requests after installation.

## 2. System Architecture
The application is built entirely using standard web technologies with zero dependencies on external UI frameworks (e.g., React, Vue) or CSS libraries (e.g., Tailwind). 

* **Presentation Layer:** Vanilla HTML5 and CSS3 (utilizing Flexbox for fluid vertical scaling and CSS Grid for complex keyboard layouts).
* **Logic Layer:** Vanilla JavaScript (ES6+).
* **Storage Layer:** Browser `localStorage` (for persistent dictionaries and settings) and the Cache API (for offline assets).
* **Platform APIs:** Web Speech API (`window.speechSynthesis`) and Service Workers (`navigator.serviceWorker`).

## 3. Core Capabilities
* **100% Offline Execution:** A Cache-First Service Worker intercepts all network requests and serves the application shell locally.
* **Native Vocalization:** The app leverages the device's built-in text-to-speech engine, ensuring instant audio feedback without network latency.
* **Dynamic Predictive Dictionary:** A self-learning algorithm monitors executed speech, saves new vocabulary to local memory, and predicts words during subsequent typing to reduce physical effort.
* **Fluid & Staggered UI:** Mathematical layout constraints (e.g., a 20-column micro-grid) eliminate dead whitespace and accurately simulate staggered physical QWERTY keyboards.
* **Personalization:** Persistent toggles allow for theming (Light/Dark), layout switching (Alphabetical/QWERTY), and header name customization.

## 4. Data Architecture & State Flow

The system manages state entirely on the client side with no backend database.

```text
[User Interaction] ──────> [DOM Event Listeners]
                                 │
                                 ├──> [Speech API Module] ──> (Triggers Dict Save)
                                 │                                  │
                                 ├──> [Settings Module]             ▼
                                 │         │                 [LocalStorage]
                                 │         ▼                (comm-board-dict)
                                 │   [LocalStorage]         (comm-board-prefs)
                                 │         │                        │
                                 ▼         ▼                        ▼
                [UI Component State Updates & DOM Reordering]
```

## 5. Low-Level Design (LLD) Index
* Granular component behaviors, CSS constraints, and logic sequences are strictly governed by the following architectural blueprints:
  * LLD 01: UI Layout & Typography: Viewport boundaries, CSS Flexbox/Grid math, and native offline font stacks.
  * LLD 02: Speech Synthesis Engine: Web Speech API integration, text mutations, and accessibility focus trap defenses.
  * LLD 03: Service Worker & Offline PWA: Service Worker registration, cache-first routing lifecycle, and Web App Manifest constraints.
  * LLD 04: Word Prediction Engine: LocalStorage dictionary persistence and prediction rendering.
  * LLD 05: Settings State & Layout Reordering: User personalization, JSON preference objects, and programmatic DOM shifting.

## 6. Methodology & Quality Assurance
* The application is constructed using Linked-Intent Development (LID). No code is manually authored. Instead, intent is defined in the LLDs and proven via Test-Driven Development (TDD).
* **Testing Framework:** Playwright.
* **The Enforcement Loop:** Playwright tests are written to explicitly enforce the constraints defined in the LLDs. Autonomous agents (Hermes) only generate HTML/CSS/JS to satisfy failing tests.
* QA Scope: Tests cover DOM structure, mathematical CSS boundaries, state mutations, and forced-offline Service Worker interceptions.                