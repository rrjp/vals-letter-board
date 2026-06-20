# LLD 02: Web Speech API & Input State Logic

## 1. Purpose
Define the Vanilla JavaScript logic required to handle user input (letters, space, backspace, clear), manage the state of the display area, and interface with the browser's native `window.speechSynthesis` API for offline vocalization.

## 2. Parent Document
`docs/high-level-design.md`

## 3. Core Logic Requirements

### 3.1. Initialization & DOM Binding
* The JavaScript logic MUST reside within `<script>` tags at the bottom of `index.html` (before the closing `</body>` tag) to ensure the DOM is fully loaded.
* The script MUST establish references to all interactive elements defined in LLD 01 (e.g., `#display-text`, `#btn-speak`, `.letter-btn`, etc.).

### 3.2. State Management (The Display Area)
* (Satisfies [REQ-INPUT-001]) The system MUST maintain a string representing the current output text.
* **Input (Letters):** (Satisfies [REQ-INPUT-001]) Tapping any `.letter-btn` appends its `textContent` (converted to lowercase) to the display string.
* **Input (Space):** Tapping `#btn-space` appends a single whitespace character (`" "`) to the display string.
* **Backspace:** (Satisfies [REQ-INPUT-003]) Tapping `#btn-backspace` removes the final character from the display string. If the string is already empty, it does nothing.
* **Clear:** (Satisfies [REQ-INPUT-002]) Tapping `#btn-clear` completely empties the display string.
* **UI Update:** Every time the internal string is modified, the `textContent` of `#display-area` MUST be updated immediately.

### 3.3. State-Driven Button Disabling
* (Satisfies [REQ-STATE-001]) The `#btn-speak` and `#btn-backspace` buttons MUST be disabled (`disabled=true`) whenever the display string is completely empty.
* They MUST be enabled whenever the display string contains one or more characters.

### 3.4. Speech Synthesis Execution
* **Trigger:** (Satisfies [REQ-TTS-001]) Tapping `#btn-speak` executes the speech function.
* **Halt Previous:** (Satisfies [REQ-TTS-001]) Before speaking, the system MUST call `window.speechSynthesis.cancel()` to instantly stop any ongoing vocalizations.
* **Vocalization:** (Satisfies [REQ-TTS-001]) The system MUST instantiate a new `SpeechSynthesisUtterance` object containing the exact text currently in the display area.
* **Execution:** (Satisfies [REQ-TTS-001]) The system MUST call `window.speechSynthesis.speak(utterance)`.
* **Focus Management (Defensive):** The system MUST attach an `onend` event listener to the `SpeechSynthesisUtterance`. When the speech completes, the system MUST call `blur()` on `document.activeElement` (or specifically `#btn-speak`) to release system focus and prevent accidental re-triggering via hardware keyboards or assistive switches.
* **Silent Failure:** (Satisfies [REQ-TTS-002]) If `window.speechSynthesis` is entirely unavailable, the function must catch the error or `return` silently.
* Before calling `speechSynthesis.speak()`, the system MUST check LocalStorage for a saved voice preference.
* If a preference exists, the system MUST find the matching voice object from `getVoices()` and assign it to the `SpeechSynthesisUtterance.voice` property.