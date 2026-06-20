# Agent Governance & Execution Rules

## 1. Project Philosophy
This is a zero-dependency, ultra-accessible Progressive Web Application built using high-quality modern HTML5, CSS3, and Vanilla JavaScript (ES6+). The architecture strictly consists of three core executable files: `index.html`, `manifest.json`, and `sw.js`. Build steps, bundlers (Webpack/Vite), or external framework libraries are completely prohibited.

## 2. The Unidirectional Arrow of Intent
You must strictly follow the Arrow of Intent. You are forbidden from modifying upstream design documents (`docs/ears-requirements.md` or files in `docs/llds/`) to match implementation compromises. Any changes to functional behavior must be updated in the requirements documents first.

## 3. Strict TDD Workflow (Red/Green/Refactor)
To prevent incomplete generation or hallucinated success, you must execute every component using a rigid Test-Driven Development framework:
1. **Write the Test First (Red):** Before writing a single line of production application code, you must draft automated unit/functional tests (e.g., using a lightweight headless test runner like Playwright, Puppeteer, or a basic node-based DOM layout test) that explicitly fail against the missing feature.
2. **Implement Minimal Code (Green):** Write only the specific HTML, CSS, or JavaScript required to make that automated test pass.
3. **Refactor & Validate:** Clean up the implementation to ensure it meets modern ES6+ standards, semantic DOM structures, and perfect CSS layout isolation.
4. Do not move to the next LLD document until all previous tests report 100% success.

## 4. Quality Guardrails & Hallucination Prevention
* **No Code Stubs:** Do not use `// TODO`, placeholders, or truncated code snippets. You must output completely fully realized, functional, production-ready code blocks.
* **Verification Duty:** You have not completed a task simply by writing code. You must execute the test suite and verify that the DOM elements match the interactive and accessible sizes specified in the requirements.

## 5. Environment & Commands
* **Test Command:** `npx playwright test`
* **Local Run:** `python3 -m http.server 8080`