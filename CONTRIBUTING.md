# Contributing to Val's Letter Board

Thank you for your interest in contributing to Val's Letter Board! This project is an offline-first, highly accessible assistive communication board built using Progressive Web App (PWA) standards. 

To maintain the absolute highest quality of software, accessibility, and reliability, we follow a strict development methodology. Please review these guidelines before making any changes.

---

## Table of Contents
1. [Core Architectural Constraints](#1-core-architectural-constraints)
2. [Our Methodology: Linked-Intent Development (LID)](#2-our-methodology-linked-intent-development-lid)
3. [Local Development Environment Setup](#3-local-development-environment-setup)
4. [The Contribution Process (Step-by-Step)](#4-the-contribution-process-step-by-step)
5. [Testing Guidelines](#5-testing-guidelines)
6. [Code of Conduct](#6-code-of-conduct)

---

## 1. Core Architectural Constraints

This project is built to be ultra-accessible, lightning-fast, and load instantly on lightweight tablets. Because of this, we enforce a **strict zero-dependency constraint**:

* **No Frameworks or Libraries:** The use of React, Vue, Angular, jQuery, Tailwind, Bootstrap, Sass/SCSS, Webpack, Vite, or any other build system/bundler is strictly prohibited.
* **Three Executable Files:** The entire runtime application shell must reside in exactly three files:
  1. `index.html` (Semantic HTML5, CSS3, and ES6+ Vanilla JavaScript)
  2. `manifest.json` (Web App Manifest specifications)
  3. `sw.js` (Offline Service Worker utilizing Stale-While-Revalidate caching)
* **Offline-First:** All assets, scripts, and typography stacks must run 100% offline. No external HTTP API requests, fonts, or CDNs are allowed at runtime.

---

## 2. Our Methodology: Linked-Intent Development (LID)

This repository is engineered using a strict **Linked-Intent Development (LID)** and **Test-Driven Development (TDD)** loop. We enforce a unidirectional "Arrow of Intent":

```
  Requirements ──> Low-Level Design (LLD) ──> Playwright Tests ──> Production Code
```

You are forbidden from writing production code or patching files directly without updating the upstream intentions first:
1. **Requirements Update:** Any change in functional behavior must be updated in `docs/ears-requirements.md` first.
2. **Design Update:** The exact layout, CSS, and JS bindings must be documented inside the corresponding file in `docs/llds/`.
3. **Traceability Tags:** We utilize trace tags (e.g., `@spec [REQ-XXX]`) inside CSS comments, JS functions, requirements, and test suites to bind our intents together. Always preserve and update these tags.

---

## 3. Local Development Environment Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python 3** (for local web server)

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/[your-username]/vals-letter-board.git
   cd vals-letter-board
   ```
2. **Install Playwright test dependencies:**
   ```bash
   npm install
   npx playwright install
   ```
3. **Start the local server:**
   ```bash
   python3 -m http.server 8080
   ```
4. Open your browser and navigate to `http://localhost:8080`.

---

## 4. The Contribution Process (Step-by-Step)

We use the strict **Red-Green-Refactor** loop for all contributions:

### Step 1: Document Your Intent (RED)
If you are adding a feature or fixing a bug, first modify or add the corresponding low-level design rules inside `docs/llds/`.

### Step 2: Write the Automated Test First
Draft automated Playwright unit or functional tests inside the `tests/` directory verifying the new layout, styling, or logic requirements. 

Run the test suite to confirm the tests **fail**:
```bash
npx playwright test
```

### Step 3: Implement Minimal Production Code (GREEN)
Write only the specific, clean HTML, CSS, or Vanilla JS inside `index.html` or `sw.js` required to make your tests pass. Do not add speculative "future-proof" code or stubs (e.g., `// TODO`). All code blocks must be fully realized and production-ready.

### Step 4: Verify Success
Confirm that 100% of the tests pass:
```bash
# Run all tests
npx playwright test

# Or run a specific test suite
npx playwright test tests/ui-layout.spec.js
```

### Step 5: Submit a Pull Request
Commit your changes with clear, descriptive commit messages, push to your branch, and submit a Pull Request.

---

## 5. Testing Guidelines

We use **Playwright** to assert visual layouts, touch target dimensions, state transitions, speech mock behaviors, and service worker caching logic.

* All visual buttons must be asserted to have a height of **at least 8vh** (8% of the viewport height) to accommodate limited motor control.
* Contrast ratios must comply with **WCAG 2.1 AA/AAA** guidelines.
* Do not leave any hanging processes or servers running on port `8080` after test execution.

---

## 6. Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, background, or physical ability. 

Please respect all maintainers and fellow contributors, communicate with kindness, and align your goals with the primary focus of this project: building a reliable, high-quality assistive communication board for individuals who need it most.
