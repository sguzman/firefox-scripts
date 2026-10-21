# Firefox userscripts

The first five source scripts were selected for Firefox rebuilding and have code and tests in this repository. They are **rebuilt and tested in disposable Firefox on synthetic pages**, not installed or released. Actual authenticated ChatGPT/GitHub interaction remains unverified. The remaining five are still only candidates.

| # | Status | Script | Description |
|---|---|---|---|
| 1 | Rebuilt | [ChatGPT Copy Entire Chat](chatgpt.com/chatgpt-copy-entire-chat/) | Proven-complete history API export; rejects partial history instead of scrolling the live tab |
| 2 | Rebuilt | [ChatGPT Current Message Jump](chatgpt.com/chatgpt-current-message-jump/) | Bounded long-reply navigation with nonoverlapping gutter controls |
| 3 | Rebuilt | [ChatGPT Force Text Attachment](chatgpt.com/chatgpt-force-text-attachment/) | Explicit clipboard-to-file attachment and visible upload confirmation |
| 4 | Rebuilt | [ChatGPT Sticky Copy](chatgpt.com/chatgpt-sticky-copy/) | Single copy proxy for long code/writing blocks, away from composer |
| 5 | Rebuilt | [GitHub File Row Copy](github.com/github-file-copy/) | Same-origin raw-file copy, bounded request and cache |
| 6 | Candidate | [YouTube Play All](https://github.com/sguzman/script-monkey/tree/main/userscripts/youtube.com/youtube-play-all) | Make a channel playlist |
| 7 | Candidate | [Duolingo QoL](https://github.com/sguzman/script-monkey/tree/main/userscripts/duolingo.com/duolingo-qol) | Select and copy practice text |
| 8 | Candidate | [Backloggd Export](https://github.com/sguzman/script-monkey/tree/main/userscripts/backloggd.com/backloggd-export) | Export game library as CSV |
| 9 | Candidate | [Libgen Filter](https://github.com/sguzman/script-monkey/tree/main/userscripts/libgen/libgen-filter) | Filter search results |
| 10 | Candidate | [Scribd Downloader](https://github.com/sguzman/script-monkey/tree/main/userscripts/scribd.com/scribd-downloader) | Legacy document helper |

## Source versus new implementation

All five were **rewritten**, not copied verbatim. Their local READMEs describe deliberately dropped legacy behaviors and limitations. Preserve the original source in `script-monkey`; only maintain the selected rebuilds here.

Each script resides under `userscripts/<site>/<project>/` with its own `.user.js`, `README.md`, and `.test.mjs`. The metadata restricts hosts and grants. No remote `@require`, no `@updateURL` or `@downloadURL` before explicit release, and no automatic installation in Firefox.

Use [the catalog](../catalog.json) for machine-readable status and [the safety rules](../docs/SAFETY.md) for verification. Firefox live-site compatibility remains subject to testing, especially because ChatGPT and GitHub DOM structures change.
