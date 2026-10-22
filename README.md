# firefox-scripts

Small, Firefox-first userscripts and a narrowly scoped clipboard attachment extension, with independent code, tests, and permissions.

## Userscripts

### Any website

- **[Page Snapshot ZIP](userscripts/web/page-snapshot/page-snapshot.user.js)** — Full page archive: HTML, CSS, JavaScript, images, fonts and accessible media.
- **[Source Analysis ZIP](userscripts/web/source-analysis/source-analysis.user.js)** — Faster, code-focused ZIP for Viewsource: DOM, CSS, JavaScript, maps and WASM, without downloading image, font or media binaries.

### ChatGPT

- **[Copy Entire Chat](userscripts/chatgpt.com/chatgpt-copy-entire-chat/chatgpt-copy-entire-chat.user.js)** — Copy a complete conversation from verified server history.
- **[Current Message Jump](userscripts/chatgpt.com/chatgpt-current-message-jump/chatgpt-current-message-jump.user.js)** — Navigate long conversations with up/down controls.
- **[Force Text Attachment](userscripts/chatgpt.com/chatgpt-force-text-attachment/chatgpt-force-text-attachment.user.js)** — Attach clipboard text as a `.txt` file.
- **[Sticky Copy](userscripts/chatgpt.com/chatgpt-sticky-copy/chatgpt-sticky-copy.user.js)** — Keep a Copy control accessible on long code and writing blocks.

### GitHub

- **[File Row Copy](userscripts/github.com/github-file-copy/github-file-copy.user.js)** — Copy a file's contents directly from a repository listing.

These scripts have been rebuilt and tested in isolated Firefox environments, but are **not installed in your Firefox profile or released with automatic updates**. See the [migration inventory](userscripts/README.md) and [machine-readable catalog](catalog.json) for other candidates.

## Stability contract

Each script is self-contained, with no `@require` scripts, cross-tab coordination, extension APIs, privileged browser-profile operations, or automatic install/update endpoints. Page Snapshot ZIP and Source Analysis ZIP are the only two reviewed, manual-only all-sites / cross-origin-download permission exceptions. DOM-dependent work is bounded; clipboard and network operations are explicit user actions. A failing operation must not silently modify a composer, copy an incomplete transcript, or repeat an upload.

The [safety policy](docs/SAFETY.md) describes correctness, bounded performance, and QA gates. CI runs [static/unit checks](https://github.com/sguzman/firefox-scripts/actions/workflows/ci.yml) and [isolated Firefox integration](https://github.com/sguzman/firefox-scripts/actions/workflows/firefox-isolated.yml). All five synthetic functional scenarios and combined long-conversation stress QA passed on October 21, 2026. **This does not prove compatibility with the live ChatGPT/GitHub DOM or guarantee real-profile browser stability.** No tests touch an existing Firefox profile.

Run locally with `node tools/check.mjs && node --test`. The Firefox test runner is `node tests/firefox-isolated.mjs` after installing Playwright and its Firefox browser in an isolated development environment.

## Firefox extension (same repository)

- **[ChatGPT Clipboard Attachment](extensions/chatgpt-force-text-attachment/)** — Firefox `clipboardRead` permission removes the extra paste prompt from one-click text attachments. Isolated under `extensions/`; replaces the Tampermonkey Force Text Attachment control **only if manually loaded**. The older userscript remains intact. Temporary testing via Firefox `about:debugging`; normal persistent installation may require Mozilla signing.

## Other legacy browser extensions — references only

These are references to unrelated legacy sources, not additional projects enrolled or moved here:

- [ChatGPT Tab Signal (legacy Chromium source)](https://github.com/sguzman/script-monkey/tree/main/extensions/chatgpt-tab-signal)
- [Jobflick Bridge (legacy Chromium source)](https://github.com/sguzman/script-monkey/tree/main/extensions/jobflick-bridge)

Neither legacy extension has been migrated. The clipboard extension above is developed in this repository.

Development is directly on `main`. The original [script-monkey](https://github.com/sguzman/script-monkey) repository is left unchanged. MIT license.
