# GitHub File Row Copy

Firefox userscript, **v1.0.2** (original rebuild started at v1.0.0). Adds an inline **Copy** button before the filename in GitHub repository directory rows, not directories or issue/PR views.

A click converts a same-origin `/blob/` URL into GitHub's `/raw/` route. GitHub redirects that route to `raw.githubusercontent.com`. Both `github.com` and `raw.githubusercontent.com` are explicitly whitelisted with `@connect`, without a wildcard. The request uses `GM_xmlhttpRequest` with a 12-second timeout and copies only successful text with `GM_setClipboard`.

Idle rows show an inline copy icon; while downloading they show **Copying…**, followed briefly by **Copied** or **Error**, and then return to the icon. No remote icon library is loaded.

Bounded resources: 400 directory rows per scan, 2 MiB maximum file text, eight recently fetched files cached per page. Navigation clears the cache; in-flight requests are aborted on pagehide. React directory changes trigger event-based rescans, never timer polling.

Granted hosts are restricted to `github.com` and `raw.githubusercontent.com`. No GitHub token or external endpoints; a failed download cannot overwrite the clipboard. Firefox userscript-manager support for both GM APIs is required.

### Updating in Tampermonkey

The previous v1.0.0 script does not automatically track new GitHub commits (no `@updateURL` or `@downloadURL`). Replace its contents with [the current `.user.js`](github-file-copy.user.js) in Tampermonkey, then save. Confirm the metadata shows **v1.0.2** and grants the new `raw.githubusercontent.com` permission. If Tampermonkey previously blocked the redirected domain even after updating the metadata, check this script's **Settings → XHR Security** blacklist and remove an existing entry for that host; do not disable XHR security globally.

Visual controls use the inverse system theme: **dark in light mode, light in dark mode**. Theme changes apply automatically without a refresh.
