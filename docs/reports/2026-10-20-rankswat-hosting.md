# RankSWAT hosting/security headers — read-only evidence

Observed via curl GET (not HEAD), 2026-10-20 00:33 UTC. No hosting/account/source changes.

| URL | Status | Selected actual response headers |
| --- | --- | --- |
| http://eng-asl.com/ | 301 | Location: https://eng-asl.com/; Server: GitHub.com; Via: 1.1 varnish |
| http://eng-asl.com/tools/gradify/ | 301 | Location: https://eng-asl.com/tools/gradify/; Server: GitHub.com |
| https://eng-asl.com/ | 200 | Content-Type: text/html; charset=utf-8; Content-Length: 56649; Server: GitHub.com; Cache-Control: max-age=600; Last-Modified: Sun, 11 Oct 2026 10:09:28 GMT; Via: 1.1 varnish; X-Served-By: cache-fra-etou8220149-FRA; X-Fastly-Request-ID present |
| https://eng-asl.com/tools/gradify/ | 200 | Content-Type: text/html; charset=utf-8; Content-Length: 52264; Server: GitHub.com; Cache-Control: max-age=600; Last-Modified: Sun, 11 Oct 2026 10:09:28 GMT; Via: 1.1 varnish; X-Served-By: cache-fra-etou8220043-FRA; X-Fastly-Request-ID present |

Both HTTPS GET responses lack Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy and X-Frame-Options. Access-Control-Allow-Origin is `*` on both HTML responses. These are live response observations; HTML meta policies, if any, are a separate question.

## Hosting conclusion and verification limits

GitHub Pages serving through a Fastly/Varnish edge is strongly evidenced by GitHub/Fastly response headers, generated deployment branch and local CNAME `eng-asl.com`. No evidence here identifies Cloudflare as an active proxy; do not infer a Cloudflare account or DNS access. Unauthenticated GET of repository Pages API followed its repository redirect but returned 404, so source branch/settings and `https_enforced` were not independently confirmed through API. Actual HTTP redirect is working.

GitHub documents Pages HTTPS enforcement as HTTP-to-HTTPS redirection; it does not promise HSTS on every custom domain. HTTPS redirect and HSTS are distinct: HSTS is an HTTPS response policy remembered by browsers. See [GitHub HTTPS documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) and [MDN HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).

## Practical options

1. Keep current Pages hosting and working HTTPS redirect. Native Pages exposes no supported arbitrary response-header configuration; adding Next `headers()`, `.htaccess` or `_headers` to this static export will not cause GitHub Pages to emit these headers. GitHub's own product discussion contains a maintainer statement that custom headers are unsupported: [GitHub discussion 54257](https://github.com/orgs/community/discussions/54257). HTML referrer meta can enforce page referrer behavior; CSP meta supports a subset, but cannot supply HSTS, nosniff, X-Frame-Options, frame-ancestors or CSP report-only headers.
2. Optional GitHub Support request for HSTS on eng-asl.com. [GitHub-hosted discussion 113716](https://github.com/orgs/community/discussions/113716) includes first-hand reports through July 2026 that support enabled HSTS for specific custom domains and asked whether preload/subdomains were desired. This is community-reported support behavior, not a documented self-service guarantee. No request was sent. Verify actual headers after any support change, separately on apex and any www host.
3. If all response headers are required, use an explicitly approved configurable edge proxy or static host. A proxy could preserve GitHub Pages origin; a host move would require deployment/DNS planning. Cloudflare documents [response-header transformation](https://developers.cloudflare.com/rules/transform/response-header-modification/) and [Pages header files](https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/). These are available capabilities, not evidence of an existing connection or a recommendation to migrate automatically.

## Candidate values and constraints

- `X-Content-Type-Options: nosniff`: verify JavaScript/CSS/WASM/PDF and worker asset MIME types first, since wrong types will become blocking failures.
- `Referrer-Policy: strict-origin-when-cross-origin`: conservative candidate; page meta equivalent can be applied in source while a response header remains hosting-dependent.
- `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'`: candidate only after deciding whether third-party embedding is intended. `frame-ancestors` requires an HTTP header.
- HSTS: start with `max-age=300` on HTTPS when host control is available; verify, then increase gradually, ultimately e.g. `max-age=31536000`. Do not add `includeSubDomains` or `preload` without auditing all affected subdomains and committing to their HTTPS availability. HSTS cannot be delivered with a meta tag and browsers ignore it on HTTP.
- CSP: do not ship an untested strict default. Inventory Next inline bootstrap scripts, tool workers/blob URLs, PDF/WASM processing, fonts, media, external fetches, embeds and downloads. Start with header `Content-Security-Policy-Report-Only` in a configurable host and test key tools before enforcement; a complete safe allowlist cannot be derived from header observations alone. A small meta policy such as `base-uri 'self'; object-src 'none'` is only appropriate after verifying no object-based viewers; it is not a replacement for full header CSP. [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) describes directives and delivery limitations.

## Release status

HTTPS redirect is verified. HSTS, nosniff, response-header referrer policy, frame protection and response-header CSP remain hosting-dependent unless an approved supported delivery path is configured. Do not mark these audit items fixed by shipping a static config file alone. No automatic migration, DNS update, support message, or account mutation was performed.
