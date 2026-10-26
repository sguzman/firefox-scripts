# ChatGPT Force Text Attachment

Firefox userscript, **v1.1.0**. The **Clipboard** button is anchored immediately left of the ChatGPT `+` button, outside the composer bubble. A visible `+` suffices even if the prompt editor changes or cannot be found. If the `+` is absent, the prompt field is a fallback anchor. When there is not enough space to the left, placement prefers above or below the composer instead of covering the text box. The button also appears after delayed hydration or navigating from the ChatGPT home page.

An explicit button click or **Ctrl+Shift+V** reads clipboard text using Firefox's permission-gated `navigator.clipboard.readText()`, creates a timestamped `.txt` file, and dispatches one upload event to an unambiguous eligible file input. The script checks for the exact filename in the composer before saying "Attached". If the result is ambiguous, it reports unconfirmed and **never retries automatically** or pastes into the prompt. It also refuses to replace files already selected in the upload input.

The clipboard is read only on an explicit click or shortcut. Text is capped at 4 MiB; upload-input discovery is capped at eight 125-ms attempts, and verification at eighteen 200-ms checks. It never sends the ChatGPT message or clears an existing draft.

A bounded structural observer watches for late composer mounting and ignores streaming text updates; there is no interval or automatic drag/drop fallback. Modern Firefox may reject clipboard reads until the user grants access. If ChatGPT changes the upload DOM, the operation fails visibly rather than guessing.

Visual controls use the inverse system theme: **dark in light mode, light in dark mode**. Theme changes apply automatically without a refresh.

## Page-wide shortcut: Ctrl+Shift+V

Press **Ctrl+Shift+V anywhere in the ChatGPT page**, whether or not the message editor is focused, to attach clipboard text as a timestamped `.txt` file. The script captures the keyboard shortcut at the window level and cancels Firefox's normal **Paste without formatting** action for this chord on this page. Ordinary **Ctrl+V** remains unaffected.

Unlike v1.0.3, the shortcut does not require a native `paste` event or read `event.clipboardData`. It calls `navigator.clipboard.readText()` synchronously from the keydown gesture, just like the Clipboard button uses the same permission-gated API on click. The shortcut does **not** automatically open ChatGPT's `+` menu; it requires an already available, unambiguous file input. The button retains its guarded one-click `+` menu fallback.

If the page has no composer, Firefox denies clipboard access, text is empty/oversized, the upload input is ambiguous or occupied, or the attachment cannot be confirmed, the script **does not fall back to pasting**. It shows an error and does not send any message. A defensive paste-event guard also cancels stray paste events occurring during the shortcut itself. Repeated shortcut keydown events cannot start duplicate uploads.

This replaces Firefox's normal **Ctrl+Shift+V** paste action on `chatgpt.com`; use **Ctrl+V** for ordinary pasting. A browser-level shortcut or extension that intercepts the chord **before** the userscript receives it can still prevent the script from running. Clipboard permission and ChatGPT upload availability remain browser/site constraints.

Automated acceptance uses a **disposable, synthetic Firefox environment**, including an unfocused ChatGPT composer, a missing composer, denied clipboard access, a missing input, and an already selected file. This does not establish authenticated live-site compatibility or availability during network outages.
