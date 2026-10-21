# firefox-scripts

Small, Firefox-first userscripts with independent code, tests, and permissions. This is **not** an extension repository.

## Selected rebuilds (1–5)

The following source scripts were selected and rebuilt here. They are **not installed** into any Firefox profile and are **not yet released** with automatic updates.

| Script | Firefox implementation |
| --- | --- |
| 1. ChatGPT Copy Entire Chat | [Code and documentation](userscripts/chatgpt.com/chatgpt-copy-entire-chat/) |
| 2. ChatGPT Current Message Jump | [Code and documentation](userscripts/chatgpt.com/chatgpt-current-message-jump/) |
| 3. ChatGPT Force Text Attachment | [Code and documentation](userscripts/chatgpt.com/chatgpt-force-text-attachment/) |
| 4. ChatGPT Sticky Copy | [Code and documentation](userscripts/chatgpt.com/chatgpt-sticky-copy/) |
| 5. GitHub File Row Copy | [Code and documentation](userscripts/github.com/github-file-copy/) |

The unselected five remain candidates. See the [complete inventory](userscripts/README.md) and machine-readable [catalog](catalog.json).

## Stability contract

Each script is self-contained, with no `@require` scripts, cross-tab coordination, extension APIs, privileged browser-profile operations, or automatic install/update endpoints. DOM-dependent work is bounded; clipboard and network operations are explicit user actions. A failing operation must not silently modify a composer, copy an incomplete transcript, or repeat an upload.

The [safety policy](docs/SAFETY.md) describes correctness, bounded performance, and QA gates. CI runs [static/unit checks](https://github.com/sguzman/firefox-scripts/actions/workflows/ci.yml) and [isolated Firefox integration](https://github.com/sguzman/firefox-scripts/actions/workflows/firefox-isolated.yml). All five synthetic functional scenarios and combined long-conversation stress QA passed on October 21, 2026. **This does not prove compatibility with the live ChatGPT/GitHub DOM or guarantee real-profile browser stability.** No tests touch an existing Firefox profile.

Run locally with `node tools/check.mjs && node --test`. The Firefox test runner is `node tests/firefox-isolated.mjs` after installing Playwright and its Firefox browser in an isolated development environment.

## Browser extensions — external links only

Extensions remain separate projects, never contained here. Independent extension repositories have not been confirmed, so the verified links below point to their **legacy source only**:

- [ChatGPT Tab Signal (legacy Chromium source)](https://github.com/sguzman/script-monkey/tree/main/extensions/chatgpt-tab-signal)
- [Jobflick Bridge (legacy Chromium source)](https://github.com/sguzman/script-monkey/tree/main/extensions/jobflick-bridge)

When an independent public repo exists for an extension, replace its legacy link. Firefox extension development is a later, separate task.

Development is directly on `main`. The original [script-monkey](https://github.com/sguzman/script-monkey) repository is left unchanged. MIT license.
