# Verification record

Verified on November 15, 2026 in the ScamSathi repository.

- `npm test` — **11 passed, 0 failed**: ten rule tests and one Java API/static-serving smoke test.
- Java 17 compile — passed as part of the API smoke test.
- API smoke coverage — health route, root page, security headers, no CORS allowance, QR page, local worker MIME, synthetic KYC/URL result, UPI QR result, empty input, and oversized message/QR inputs.
- Manual browser review — synthetic English and Hindi OTP/urgency messages returned explanations and safe next steps; pasted synthetic UPI QR displayed the payment signal and unverified payee, name, and amount. The UI did not open a URL or initiate payment.
- GitHub Pages — the public page, style, rules, app, QR page/module, and vendored QR decoder returned HTTP 200. Live message and pasted-UPI QR checks produced the expected explained signals. Hosted analysis stays in browser rules and does not POST content to a static host.
- Presentation — 10 slides; Artifact Tool import, package integrity, slide geometry, and font-policy validation passed with no layout findings or warnings. Slides were rendered and reviewed individually; flow and architecture connector direction was corrected during review.
- Source hygiene — `git diff --check` passed; focused credential-pattern scan found no matches.

## Not tested or not established

- Camera permission, live camera stream, camera switching, flashlight, and device cleanup on physical hardware.
- QR image decode with an automated image fixture.
- Accuracy, precision/recall, or any ML/audio metrics.
- Full mobile/browser matrix, formal screen-reader audit, and native-speaker translation review.

These checks cover expected behavior for the listed synthetic cases; they do not establish real-world fraud-detection accuracy or production security.
