# LLD 04: Word Prediction & Dynamic Dictionary

## 1. Purpose
Define the Vanilla JavaScript logic required to maintain a self-learning dictionary in the browser's LocalStorage, evaluate user input to generate word suggestions, and render those suggestions as interactive touch targets.

## 2. Parent Document
`docs/high-level-design.md`

## 3. Storage & Initialization
* (Satisfies [REQ-DICT-001]) The system MUST maintain a `customDictionary` array in memory.
* (Satisfies [REQ-DICT-001]) On application load, the system MUST attempt to retrieve this array from `localStorage.getItem('comm-board-dict')`.
* (Satisfies [REQ-DICT-001]) If no dictionary exists, it MUST initialize with an empty array `[]` (or a small set of default seed words, e.g., ["yes", "no", "please", "thanks"]).

## 4. The Learning Engine (Triggered by Speech)
* **Extraction:** (Satisfies [REQ-DICT-002]) When the `#btn-speak` event is triggered, the system MUST parse the current text in the `#display-area`.
* **Sanitization:** (Satisfies [REQ-DICT-002]) The text MUST be split into individual words, converted to lowercase, and stripped of punctuation.
* **Evaluation:** (Satisfies [REQ-DICT-002]) The system MUST check if each word already exists in the `customDictionary`.
* **Storage:** (Satisfies [REQ-DICT-002]) If a word is new, it MUST be pushed to the `customDictionary` array. The updated array MUST immediately be serialized to JSON and saved back to `localStorage.setItem('comm-board-dict')`.

## 5. The Prediction Engine (Triggered by Typing)
* **State Tracking:** (Satisfies [REQ-PRED-001]) The system MUST identify the "current word" being typed (the string of characters following the last space).
* **Matching:** (Satisfies [REQ-PRED-001]) Every time a `.letter-btn` or `#btn-backspace` is tapped, the system MUST filter the `customDictionary` for words that strictly begin with the "current word" string.
* **Limiting:** (Satisfies [REQ-PRED-002]) The system MUST select a maximum of 5 matching words.
* **Clearing:** If the "current word" is empty (e.g., after a space or clearing the board), the prediction list MUST be cleared.

## 6. UI Integration & Interaction
* **Rendering:** (Satisfies [REQ-PRED-002]) For each matching word, the system MUST generate a `<button>` element and append it inside the `#prediction-bar` `div`.
* **Styling:** (Satisfies [REQ-UI-001]) These prediction buttons MUST inherit the standard `min-height: 8vh`, `touch-action: manipulation`, and `user-select: none` properties to maintain accessibility.
* **Execution:** (Satisfies [REQ-PRED-003]) When a prediction button is tapped, the system MUST:
    1. Replace the partial "current word" in the `#display-area` with the fully predicted word.
    2. Append a single trailing space (`" "`).
    3. Clear the `#prediction-bar` entirely (which will cause it to collapse per LLD 01 rules).
