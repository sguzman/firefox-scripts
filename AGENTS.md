# Development boundaries

This repository contains independent Firefox userscripts and explicitly approved Firefox extensions in separate directories **within this same repository**. Keep each independent; do not combine entrypoints, permissions, or automatic installation.

- Work directly on the existing `main` branch unless a repo-specific instruction explicitly says otherwise.
- Preserve the legacy `sguzman/script-monkey` repository. Migrate only explicitly selected userscripts.
- Do not automate, launch, close, refresh, change settings in, or inject into the user's real Firefox profile.
- Use disposable synthetic Firefox profiles for QA. Never copy personal conversations, session tokens, browser history, or private diagnostic text into public sources, fixtures, logs, or Git history.
- Prefer a simple event-driven design. No background polling, unrestricted DOM scans, bulk tab work, remote executable dependencies, speculative browser APIs, or unreviewed permissions.
- Bound scans, requests, retries, memory, work queues and timeouts. Fail visibly without claiming success when evidence is incomplete.
- Keep the five userscripts independent. Each has a self-contained `.user.js`, README, and test file.
- Do not add `@updateURL` or `@downloadURL` or auto-install scripts until an explicit release request.
- On changes: run Node static checks and isolated Firefox integration tests. Do not call actual-site behavior verified unless it has been observed there.
- Do not infer that passing CI proves browser crash-safety; always state test environment and remaining limits.
