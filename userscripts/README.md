# Firefox userscripts

The five selected migrations have been tested with synthetic Firefox pages. Page Snapshot ZIP and Source Analysis ZIP are separate, manually launched tools with their own tests. They have not been installed or released, and live authenticated site behavior remains unverified.

## Rebuilt

| Script | Purpose |
| --- | --- |
| [Page Snapshot ZIP](web/page-snapshot/) | Full page ZIP, including accessible images and media |
| [Source Analysis ZIP](web/source-analysis/) | Lean code-only ZIP for Viewsource: DOM, CSS, JS, maps and WASM |
| [ChatGPT Copy Entire Chat](chatgpt.com/chatgpt-copy-entire-chat/) | Export server-proven complete conversation history |
| [ChatGPT Current Message Jump](chatgpt.com/chatgpt-current-message-jump/) | Navigate long exchanges without covering content |
| [ChatGPT Force Text Attachment](chatgpt.com/chatgpt-force-text-attachment/) | Attach clipboard text as a file after explicit user action |
| [ChatGPT Sticky Copy](chatgpt.com/chatgpt-sticky-copy/) | Access Copy on long code or writing blocks |
| [GitHub File Row Copy](github.com/github-file-copy/) | Copy file contents from repository listings |

## Not yet selected

| Source userscript | Purpose |
| --- | --- |
| [YouTube Play All](https://github.com/sguzman/script-monkey/tree/main/userscripts/youtube.com/youtube-play-all) | Create a channel playlist |
| [Duolingo QoL](https://github.com/sguzman/script-monkey/tree/main/userscripts/duolingo.com/duolingo-qol) | Select and copy practice text |
| [Backloggd Export](https://github.com/sguzman/script-monkey/tree/main/userscripts/backloggd.com/backloggd-export) | Export a game library as CSV |
| [Libgen Filter](https://github.com/sguzman/script-monkey/tree/main/userscripts/libgen/libgen-filter) | Filter search results |
| [Scribd Downloader](https://github.com/sguzman/script-monkey/tree/main/userscripts/scribd.com/scribd-downloader) | Legacy document helper |

## Source versus new implementation

All five were **rewritten**, not copied verbatim. Their local READMEs describe deliberately dropped legacy behaviors and limitations. Preserve the original source in `script-monkey`; only maintain the selected rebuilds here.

Each script resides under `userscripts/<site>/<project>/` with its own `.user.js`, `README.md`, and `.test.mjs`. The metadata restricts hosts and grants. No remote `@require`, no `@updateURL` or `@downloadURL` before explicit release, and no automatic installation in Firefox.

Use [the catalog](../catalog.json) for machine-readable status and [the safety rules](../docs/SAFETY.md) for verification. Firefox live-site compatibility remains subject to testing, especially because ChatGPT and GitHub DOM structures change.
