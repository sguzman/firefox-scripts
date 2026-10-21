# Firefox userscript safety gates

Three separate requirements apply to every rebuilt userscript.

## Correctness

A script must perform only the selected feature, with a clear activation condition and a tested cancel/failure path. User-visible state must follow confirmed evidence, not a guessed network outcome. No hidden downloads, submissions, clicks or clipboard reads. No features or permissions may be silently inherited from the old implementation.

## Performance

Use narrowly scoped event listeners or user-initiated work, not idle periodic scans. No `setInterval`, remote `@require`, dynamic `eval`, or whole-document scraping in the default implementation. If DOM observation is essential, limit its subtree, filter relevant changes, budget processing and dispose the observer at the end of the operation. Each bulk operation needs a maximum count, rate limit, cancellation and timeout. Avoid expensive selectors and repeated allocations against long ChatGPT conversations.

## Browser stability

No injection across tabs, extension management, browser-profile access, or process control. Minimize site matches and `@grant` permissions. Prefer direct Firefox-compatible browser APIs. Scripts must not run on unrelated hosts. No auto-installation or `@updateURL` / `@downloadURL` until that specific script is approved for release. A script failure must not block the site or leave endless timers.

## Acceptance and evidence

Each selected script requires source and permission review, a small README explaining its behavior, unit/invariant tests, and isolated Firefox QA using a disposable temporary profile with synthetic data. Check long pages, rapid navigation, cancellation and simultaneous normal browsing, as relevant. Never open or automate the user's actual Firefox profile.

CI provides static evidence only. Browser behavior and performance are **unverified** until isolated Firefox testing passes; even isolated QA cannot guarantee stability in the user's real profile.

No code, migration, Firefox settings, or installed userscript is changed merely because an item is in the catalog. Work directly on `main`; preserve the original source repository untouched.
