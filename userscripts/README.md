# Userscript migration inventory

Nothing listed below is installed, enabled, or approved for migration. Choose entries by number. Rebuilding means inspecting the current feature, implementing a smaller Firefox-first version, testing it in an isolated Firefox profile, and publishing it **only after explicit approval**.

| # | Source userscript | Purpose | Review concerns |
| --- | --- | --- | --- |
| 1 | [ChatGPT Copy Entire Chat](https://github.com/sguzman/script-monkey/blob/main/userscripts/chatgpt.com/chatgpt-copy-entire-chat/chatgpt-copy-entire-chat.user.js) | Copy the complete conversation | Large history and API pagination; bounded retrieval and private data |
| 2 | [ChatGPT Current Message Jump](https://github.com/sguzman/script-monkey/blob/main/userscripts/chatgpt.com/chatgpt-current-message-jump/chatgpt-current-message-jump.user.js) | Jump within the current long exchange | Existing DOM observer, scroll hooks, and interval; avoid permanent work |
| 3 | [ChatGPT Force Text Attachment](https://github.com/sguzman/script-monkey/blob/main/userscripts/chatgpt.com/chatgpt-force-text-attachment/chatgpt-force-text-attachment.user.js) | Attach clipboard text as .txt | Clipboard access, attachment controls, bounded retry logic |
| 4 | [ChatGPT Sticky Copy](https://github.com/sguzman/script-monkey/blob/main/userscripts/chatgpt.com/chatgpt-sticky-copy/chatgpt-sticky-copy.user.js) | Copy control for long code/writing blocks | Existing DOM scans and observer; no unbounded traversal |
| 5 | [GitHub File Row Copy](https://github.com/sguzman/script-monkey/blob/main/userscripts/github.com/github-file-copy/github-file-copy.user.js) | Copy a file from repository listings | Remote raw-file access and permission scope |
| 6 | [YouTube Play All](https://github.com/sguzman/script-monkey/blob/main/userscripts/youtube.com/youtube-play-all/youtube-play-all.user.js) | Assemble/reuse a private channel playlist | Write operations on YouTube; explicit activation and bounded requests |
| 7 | [Duolingo QoL](https://github.com/sguzman/script-monkey/blob/main/userscripts/duolingo.com/duolingo-qol/duolingo-qol.user.js) | Select and copy practice text | Old jQuery dependency and repeating interval; rebuild without them |
| 8 | [Backloggd Export](https://github.com/sguzman/script-monkey/blob/main/userscripts/backloggd.com/backloggd-export/backloggd-export.user.js) | Export library to CSV | Authenticated page requests, pagination, safe download |
| 9 | [Libgen Filter](https://github.com/sguzman/script-monkey/blob/main/userscripts/libgen/libgen-filter/libgen-filter.user.js) | Filter search results by title/language/format | Many mirror domains; strict host scoping |
| 10 | [Scribd Downloader](https://github.com/sguzman/script-monkey/blob/main/userscripts/scribd.com/scribd-downloader/scribd-downloader.user.js) | Legacy Scribd reader/download helper | Outdated reader DOM, download behavior and access authorization |

## On approval

A selected userscript goes in `userscripts/<site>/<script-id>/<script-id>.user.js`, with a local README and dependency-free tests. It must pass [safety review](../docs/SAFETY.md) and static checks before browser testing. No scripts are activated automatically, and no existing Firefox profile is touched by development or automated QA.

Source is preserved in `script-monkey`. The new implementation must have its own metadata, precise `@match` hosts, documented grants, and a fresh Firefox-specific QA result. `catalog.json` is the authoritative status register. Candidate status does **not** mean the old code is safe, compatible, or approved.
