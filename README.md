# firefox-scripts

Small, Firefox-first userscripts with independent code, tests, and permissions. This is **not** an extension repository.

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

## Firefox project index (living list)

This README is the maintained index of Firefox userscripts and extensions under active development. Keep it updated as projects are added, moved, or retired. The [userscripts above](#userscripts) live in this repository; **standalone WebExtensions stay in their own repositories** and are linked here rather than copied into this one.

### Standalone Firefox extensions

- **[Chat Signals](https://github.com/sguzman/chat-signals)** — Firefox-first ChatGPT conversation-state observation, tab identity, status indicators, and notifications; optional state-only integration with Chat Queue.
- **[Jobflick Bridge](https://github.com/sguzman/jobflick-bridge)** — Firefox Developer Edition-first bridge from ChatGPT to local Jobflick jobs, with explicit execution controls and result tracking.
- **[Chat Queue](https://github.com/sguzman/chat-queue)** — Firefox Developer Edition-first ChatGPT prompt queue and floating HUD; coordinates with authenticated Chat Signals state before advancing queued messages.

These are independent projects at different development and verification stages, **not extensions shipped by firefox-scripts**. See each repository for current status, installation instructions, and limitations. The older [script-monkey](https://github.com/sguzman/script-monkey) extension implementations are legacy reference material, not the current standalone source.

Development is directly on `main`. The original [script-monkey](https://github.com/sguzman/script-monkey) repository is left unchanged. MIT license.
