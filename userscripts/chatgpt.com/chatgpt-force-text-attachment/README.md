# ChatGPT Force Text Attachment

Firefox userscript, **v1.2.0**. The **Clipboard** button remains immediately left of ChatGPT's `+` button, outside the composer. When space is limited, it appears above or below the composer instead of covering the message editor. The script mounts on late hydration.

## Clipboard access

- **Ctrl+Shift+V**, anywhere on the ChatGPT page: uses Firefox's **native paste event** to read `event.clipboardData`, avoiding the Firefox paste-permission prompt. The script briefly focuses a disposable offscreen textarea and restores the previous focus/selection. It cancels the native paste before text reaches the draft; **Ctrl+V** still works normally. There is no programmatic clipboard read on this shortcut.
- **Clipboard button**: one-click attachment remains available. This path calls `navigator.clipboard.readText()`, which may require Firefox's **Paste** approval. This browser security prompt cannot be removed for a normal webpage userscript while retaining a one-click programmatic read.

Both routes create one timestamped plain-text `.txt` file from up to 4 MiB of clipboard text. The script never sends a ChatGPT message or alters the existing draft.

## Upload selection and failure handling

ChatGPT can have several upload inputs simultaneously (documents, images, or other controls). The script chooses a compatible document input deterministically: canonical `#upload-files` or `data-testid="upload-files"` first, then inputs associated with the current composer, labeled file/document inputs, multiple-file inputs, and explicit text-file acceptance. Indistinguishable candidates cause a visible error instead of a blind guess.

If the document input is initially unavailable, either control can click ChatGPT's `+` **once** and perform eight bounded 125-ms discovery attempts. The script does not select unknown menu items. It refuses to overwrite an already occupied input. It dispatches `input` and `change` once and waits up to eighteen 200-ms checks for the exact new filename in the composer. It never retries an unconfirmed upload automatically, inserts copied text into the prompt, or submits a message.

If the shortcut cannot obtain a native paste event, its offscreen sink and focus are cleaned up and a visible failure message appears. No clipboard API fallback is attempted, so the shortcut never suddenly produces a permission prompt.

## Updating and verification

**Installed userscripts do not update automatically in this repository.** Replace the installed script in your Firefox userscript manager with the [current `.user.js`](chatgpt-force-text-attachment.user.js). Keep the same `@name` and `@namespace`; do not leave an older version enabled alongside it.

Static/unit checks and isolated Firefox regression fixtures cover native paste interception, no clipboard permission call on the shortcut, preserving drafts and occupied file inputs, missing composer/upload input, and the canonical document input among multiple candidates. Synthetic tests do not prove authenticated live-site compatibility or actual clipboard behavior in your Firefox profile.

Styles follow the inverse theme: **dark in light mode, light in dark mode**.
