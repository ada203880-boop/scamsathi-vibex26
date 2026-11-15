# Security notes

## Current safeguards

- Java service binds to `127.0.0.1`; it is not intended for public hosting.
- Message (4,000), URL (2,048), QR (4,096), form-body, and image (10 MB) limits.
- URL text is parsed but never fetched; there is no SSRF-capable URL request path.
- Decoded QR content is displayed as text and never navigated or executed. UPI parsing never starts a payment.
- Results use DOM `textContent`, not HTML insertion, for untrusted content.
- Scanner dependency is local and lazy-loaded; no CDN request.
- CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers on Java responses.
- No credentials, user accounts, database, or content logs.

## Limits and follow-up

- This is not a production security assessment. No dynamic vulnerability scan, dependency advisory audit, broad penetration test, or hardware-camera permission test is claimed.
- The Java service has no authentication or rate limiter. Its loopback-only binding is a core assumption; do not expose it to a LAN or internet.
- The browser static site uses same-origin requests only, no CORS allowance, and no user-submitted remote data service.
- Image validation checks declared MIME and size before decoder use; browser decoder behavior depends on supported formats. No server upload endpoint exists.
- Heuristic rules can be evaded, produce false positives, and do not establish sender identity or destination reputation.
- If a reputation provider is added, obtain consent and licensing, avoid sending sensitive message content, and document the precise URL data disclosed.

Report a suspected issue through the repository's public issue tracker without including private messages, URLs containing tokens, credentials, or personal data.
