# LLD 05: Settings State & Personalization

## 1. Purpose
Define the logic for opening/closing the settings dialog, applying UI preferences (Theme, Layout), and persisting user configurations to LocalStorage.

## 2. Parent Document
`docs/high-level-design.md`

## 3. Dialog Management
* **Open:** (Satisfies [REQ-SET-001]) Tapping `#btn-settings` MUST call the native `showModal()` method on the `#settings-panel` `<dialog>` element.
* **Close:** Tapping `#btn-close-settings` MUST call the native `close()` method on the `#settings-panel`.

## 4. State Persistence & Initialization
* (Satisfies [REQ-PREF-001]) The system MUST maintain a single JSON object in `localStorage.getItem('comm-board-prefs')`.
* (Satisfies [REQ-PREF-001]) The object schema MUST be: `{ userName: string, theme: 'light' | 'dark', layout: 'alpha' | 'qwerty' }`.
* **Initialization:** (Satisfies [REQ-PREF-002] [REQ-PREF-003]) On page load, the system MUST retrieve this object. If it does not exist, it defaults to `{ userName: 'User', theme: 'light', layout: 'alpha' }`.
* (Satisfies [REQ-PREF-001]) The system MUST immediately apply these saved settings to the UI upon load.

## 5. Interaction Logic
* **User Name (Defensive State):** (Satisfies [REQ-SET-004]) Whenever `#input-user-name` triggers an `input` event, the system MUST update `#app-title` to read `"[Name]'s Letter Board"`. 
    * If the input is completely empty (`""`), `#app-title` MUST default to displaying `"User's Letter Board"`. 
    * **CRITICAL:** (Satisfies [REQ-SET-004]) The system MUST NOT force the `<input>` value itself back to "User" while the user is actively clearing the field. The input box must be allowed to remain empty so the user can type.
* **Theme:** (Satisfies [REQ-SET-002]) Toggling `#toggle-theme` MUST apply or remove the `data-theme="dark"` attribute on the `document.body` and save the preference.
* **Layout (DOM Reordering):** (Satisfies [REQ-SET-003]) Toggling `#toggle-layout` MUST apply or remove the `.layout-qwerty` class on `#letter-grid` and save the preference. 
    * **CRITICAL:** (Satisfies [REQ-SET-003]) When QWERTY is activated, the system MUST programmatically reorder the `.letter-btn` DOM elements within `#letter-grid` to match the standard QWERTY sequence (`q, w, e, r, t, y, u, i, o, p, a, s, d, f, g, h, j, k, l, z, x, c, v, b, n, m`). When deactivated, it MUST restore them to alphabetical order.
* **Voice Selection & Initialization:** 
    * The system MUST populate `#select-voice` with `<option>` elements using `speechSynthesis.getVoices()`. 
    * **CRITICAL:** Immediately after populating (and upon any `voiceschanged` event), the system MUST explicitly set the `<select>` element's value using the following strict cascade:
        1. **Preference:** The user's saved voice preference from LocalStorage.
        2. **Browser Language:** A voice where the base language code of `voice.lang` matches the base language code of `navigator.language`.
        3. **System Default:** A voice where `voice.default === true`.
        4. **Array Fallback:** The very first voice in the retrieved array.
    * The UI MUST accurately reflect the voice that will actually be used for synthesis.
* Changing the selection MUST update the preference object in LocalStorage with the selected voice's `name` or `voiceURI`.