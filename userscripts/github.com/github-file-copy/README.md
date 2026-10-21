# GitHub File Row Copy

Firefox userscript, **v1.0.0 rebuild**. Adds an inline **Copy** button before the filename in GitHub repository directory rows, not directories or issue/PR views.

A click converts a same-origin `/blob/` URL into GitHub's `/raw/` route, uses the userscript-manager `GM_xmlhttpRequest` permission for an explicit 12-second request, and copies successful text with `GM_setClipboard`.

Bounded resources: 400 directory rows per scan, 2 MiB maximum file text, eight recently fetched files cached per page. Navigation clears the cache; in-flight requests are aborted on pagehide. React directory changes trigger event-based rescans, never timer polling.

Granted hosts are restricted to `github.com`. No GitHub token or external endpoints; a failed download cannot overwrite the clipboard. Firefox userscript-manager support for both GM APIs is required.
