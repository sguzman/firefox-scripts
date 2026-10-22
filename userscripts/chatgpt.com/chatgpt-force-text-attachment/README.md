# ChatGPT Force Text Attachment

Firefox userscript, **v1.0.3**. The **Clipboard** button is anchored immediately left of the ChatGPT `+` button, outside the composer bubble. A visible `+` suffices even if the prompt editor changes or cannot be found. If the `+` is absent, the prompt field is a fallback anchor. When there is not enough space to the left, placement prefers above or below the composer instead of covering the text box. The button also appears after delayed hydration or navigating from the ChatGPT home page.

A click reads clipboard text under the browser's clipboard permission model, creates a timestamped `.txt` file, and dispatches one upload event to an eligible text-file input. The script checks for the exact filename in the composer before saying "Attached". If the result is ambiguous, it reports unconfirmed and **never retries automatically** or pastes into the prompt.

The clipboard is read only on an explicit click. Text is capped at 4 MiB; upload-input discovery is capped at eight 125-ms attempts, and verification at eighteen 200-ms checks. It never sends the ChatGPT message and never automatically reads clipboard contents.

A bounded structural observer watches for late composer mounting and ignores streaming text updates; there is no interval or automatic drag/drop fallback. Modern Firefox may reject clipboard reads until the user grants access. If ChatGPT changes the upload DOM, the operation fails visibly rather than guessing.

Visual controls use the inverse system theme: **dark in light mode, light in dark mode**. Theme changes apply automatically without a refresh.

## Keyboard shortcut: Ctrl+Shift+V

With focus in the ChatGPT message editor, press **Ctrl+Shift+V** to attach the clipboard's **plain text** as a timestamped `.txt` file. This intentionally replaces Firefox's usual **Paste without formatting** shortcut *in the ChatGPT composer only*. Ordinary **Ctrl+V** and pasting elsewhere work normally.

The shortcut waits for a genuine browser `paste` event and reads `event.clipboardData`; it does **not** call `navigator.clipboard.readText()`, `execCommand('paste')`, or trigger the ChatGPT `+` menu. Empty or unavailable paste data leaves browser paste untouched. It attempts at most one upload through an existing unambiguous file input; if ChatGPT provides no eligible input, it displays an error. It never sends your message.

The **Clipboard** button is preserved and still uses Firefox's normal clipboard permission model. If Firefox or ChatGPT consumes Ctrl+Shift+V without delivering a paste event, the shortcut cannot work on that browser configuration; no userscript can force the browser to generate a trusted paste event. This behavior is covered by synthetic Firefox tests, not yet confirmed in an authenticated ChatGPT session.
