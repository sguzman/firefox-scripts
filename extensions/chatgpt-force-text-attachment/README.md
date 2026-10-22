# ChatGPT Clipboard Attachment — Firefox extension

One-click clipboard-to-`.txt` attachment for ChatGPT, in the **same firefox-scripts repository**.

## Why this exists

The Tampermonkey version uses a normal page clipboard read, which Firefox may gate behind a Paste prompt or reject. Firefox extensions with the explicit `clipboardRead` permission can read clipboard text without that separate prompt. This extension is a narrowly scoped alternative to the userscript, not a new repository.

- Runs only on `https://chatgpt.com/*` with `clipboardRead`, no network permissions, background scripts, or automatic clipboard access.
- The **Clipboard** button appears left of ChatGPT's `+` and uses the inverse operating-system light/dark palette.
- Clicking reads text once, creates a timestamped `.txt` file (max 4 MiB), dispatches a single file upload event to an unambiguous existing file input, and waits for confirmation.
- It does **not** open the `+` menu, click Paste, send the message, or silently claim success if the page's upload field is missing.
- No polling, external code, remote telemetry, or page refresh. Only the content script runs.

## Local QA

Use Firefox's `about:debugging#/runtime/this-firefox` > **Load Temporary Add-on**, select `manifest.json` in this directory. This is a **temporary installation**, removed after browser restart. Regular persistent installation in standard Firefox generally requires signing through Mozilla. Neither this repo nor CI installs anything in your browser.

**Disable the Tampermonkey Force Text Attachment userscript before loading this extension**, to avoid duplicate controls. The legacy userscript remains in the repository.

To exercise the extension: copy a short passage, click **Clipboard**, and verify that exactly one named `.txt` chip appears in ChatGPT's composer. If the page has no suitable upload input, an error toast will say so; this is not a guaranteed workaround for future ChatGPT DOM changes.

Node unit tests and synthetic Firefox integration tests check the behavior without personal sessions, but do not establish live authenticated site compatibility.
