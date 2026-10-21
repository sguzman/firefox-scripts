# ChatGPT Force Text Attachment

Firefox userscript, **v1.0.0 rebuild**. A small **Clipboard** button floats beside the ChatGPT composer `+` control when safe to place.

A click reads clipboard text under the browser's clipboard permission model, creates a timestamped `.txt` file, and dispatches one upload event to an eligible text-file input. The script checks for the exact filename in the composer before saying "Attached". If the result is ambiguous, it reports unconfirmed and **never retries automatically** or pastes into the prompt.

The clipboard is read only on an explicit click. Text is capped at 4 MiB; upload-input discovery is capped at eight 125-ms attempts, and verification at eighteen 200-ms checks. It never sends the ChatGPT message and never automatically reads clipboard contents.

No document-wide observer or automatic drag/drop fallback. Modern Firefox may reject clipboard reads until the user grants access. If ChatGPT changes the upload DOM, the operation fails visibly rather than guessing.
