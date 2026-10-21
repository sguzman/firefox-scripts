# firefox-scripts

Firefox-first userscripts, maintained as small **independent scripts**, not browser extensions.

This repository is a clean start. **No userscript has been copied, installed, enabled, or approved.** The ten candidates in [the inventory](userscripts/README.md) are references to source material in [script-monkey](https://github.com/sguzman/script-monkey); each must be explicitly selected and rebuilt for Firefox before it appears here.

## Structure

- [userscripts/](userscripts/README.md) — candidate inventory and, after approval, one self-contained project directory per userscript, grouped by site
- [catalog.json](catalog.json) — machine-readable source inventory and migration state
- [docs/SAFETY.md](docs/SAFETY.md) — correctness, performance, browser-stability and QA requirements
- [tools/check.mjs](tools/check.mjs) — dependency-free repository and userscript safety checks
- [tests/](tests/) — static safety-check tests; each future script will have its own tests

Only explicitly selected userscripts will be rebuilt. An entry in the inventory is **not** permission to port or activate it. The GitHub workflow performs static checks without running scripts in any browser.

## Browser extensions — links only

Extensions have their own source, release, permissions, and QA lifecycle. **No extension code or shared extension build lives in this repository.**

The existing extensions have **not yet been extracted into their own repositories**. Until that happens, these are clearly marked links to legacy source locations, not standalone extension repos:

| Extension | Existing source (pending independent repository) |
| --- | --- |
| ChatGPT Tab Signal | [Legacy source in script-monkey](https://github.com/sguzman/script-monkey/tree/main/extensions/chatgpt-tab-signal) |
| Jobflick Bridge | [Legacy source in script-monkey](https://github.com/sguzman/script-monkey/tree/main/extensions/jobflick-bridge) |

When separate public repositories are actually created and verified, replace the legacy links with those repository URLs. Firefox extension development is **not part of this migration**.

## Rule of operation

**Correctness, bounded performance, and browser stability are release gates.** No mass tab injection, no broad site permissions, no permanent high-frequency polling, no unbounded transcript scans, and no update-time operations on an active browser profile. A test suite passing is not proof of compatibility with a user's live Firefox profile.

Work directly on `main`. Do not modify or delete the legacy `script-monkey` source while rebuilding selected scripts here.

MIT license; see [LICENSE](LICENSE).
