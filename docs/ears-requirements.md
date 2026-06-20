# Communication Board Requirements (EARS Syntax)

## 1. Ubiquitous Requirements (Always active)
* [REQ-PWA-001] The system shall operate completely offline after the initial installation.
* [REQ-UI-001] The system shall utilize touch targets with a minimum height of 8vh to accommodate limited fine motor control.
* [REQ-UI-002] The system shall prevent native mobile browser behaviors including double-tap-to-zoom and text highlighting.
* [REQ-PREF-001] The system shall load configuration state (Theme, Layout) from web LocalStorage upon initialization.
* [REQ-PREF-002] The system shall default to a Light Mode theme and an Alphabetical keyboard layout if no configuration LocalStorage values are found.
* [REQ-DICT-001] The system shall load the custom user dictionary from web LocalStorage upon initialization.
* [REQ-PREF-003] The system shall load the configured user name from LocalStorage upon initialization and default to "User" if none exists.

## 2. Event-Driven Requirements (When <trigger>, the system shall <response>)
* **When** the user taps a letter button, **the system shall** [REQ-INPUT-001] append that specific letter to the end of the text in the display area.
* **When** the user taps the 'Speak' button, **the system shall** [REQ-TTS-001] immediately halt any ongoing speech synthesis and then vocalize the exact text currently in the display area.
* **When** the user taps the 'Speak' button, **the system shall** [REQ-DICT-002] extract all formatted words from the display area and save any previously unknown words to the custom dictionary in LocalStorage.
* **When** the user taps the 'Clear' button, **the system shall** [REQ-INPUT-002] completely empty the display area and immediately halt any ongoing speech synthesis.
* **When** the user taps the 'Backspace' button, **the system shall** [REQ-INPUT-003] delete the last character from the display area.
* **When** the user taps the 'Settings' button, **the system shall** [REQ-SET-001] display the settings panel overlay.
* **When** the user interacts with the Theme Toggle, **the system shall** [REQ-SET-002] apply the selected visual theme (Light/Dark) immediately and persist the choice to LocalStorage.
* **When** the user interacts with the Layout Toggle, **the system shall** [REQ-SET-003] rearrange the keyboard strictly to the selected layout (Alphabetical/QWERTY) immediately and persist the choice to LocalStorage.
* **When** the user types in the Name setting input, **the system shall** [REQ-SET-004] immediately update the header title to display "[Name]'s Letter Board" and persist the name to LocalStorage.

## 3. State-Driven Requirements (While <state>, the system shall <response>)
* **While** the display area is empty, **the system shall** [REQ-STATE-001] disable the 'Speak' and 'Backspace' buttons.
* **While** the Dark Mode setting is active, **the system shall** [REQ-STATE-002] utilize an inverted, high-contrast color palette for all UI elements.
* **While** the settings panel is open, **the system shall** [REQ-STATE-003] prevent interaction with the background keyboard and output display.

## 4. Unwanted Behavior Requirements (If <trigger>, then the system shall <response>)
* **If** a text-to-speech voice is unavailable locally on the device, **then the system shall** [REQ-TTS-002] silently fail without crashing the visual interface.

## 5. Optional Features / Stretch Goals (Where <feature is included>, the system shall <response>)
* **Where** the word prediction module is active, **the system shall** [REQ-PRED-001] evaluate the current string being typed against the custom dictionary in LocalStorage.
* **Where** the word prediction module is active, **the system shall** [REQ-PRED-002] display up to 5 matching word suggestions in a dedicated prediction bar.
* **When** the user taps a suggested word, **the system shall** [REQ-PRED-003] replace the current partial string with the fully completed word and append a trailing space.
