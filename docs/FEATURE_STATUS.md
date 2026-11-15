# Feature status

Status reflects the code in this repository, not the original pasted checklist. “Implemented” means a local user flow exists; it does not imply fraud-detection accuracy or production readiness.

| Area | Status | Evidence and limits |
|---|---|---|
| Message checks | Implemented | Explainable pattern rules, matched reasons, weighted points, and next steps in Java and browser fallback. Narrow phrase coverage; no trained model. |
| URL checks | Implemented | Parses the supplied URL text for scheme, IP host, userinfo, punycode, known shorteners, selected uncommon TLDs, and likely brand mismatch/lookalike. Never opens or resolves the link. No reputation, certificate, redirect, DNS, or attachment checks. |
| QR image and camera scanner | Implemented, hardware not verified here | Lazy-loads vendored `qr-scanner` 1.4.2, image decode, permission only after button click, rear-camera preference, camera switch, pause/resume, flashlight where supported, and stop/destroy handling. No physical camera permission was accepted in this review. |
| QR payload analysis | Implemented | Identifies UPI payment URIs, URLs, unknown schemes, and text; reports UPI fields as unverified. Never opens a destination or starts a payment. |
| English / Hindi / Odia UI | Implemented | Interface and safety actions are translated. Hindi phrase detection is partial. Odia scam-text rules are not implemented. |
| Dashboard | Implemented for the current tab | Counts checks, checks with signals, QR checks, and last three activity labels/times in memory only. Resets when the tab closes; no saved analytics or category breakdown. |
| Audio/deepfake detection | Unavailable | No upload control, inference service, model, dataset, or audio score. The product says so explicitly. |
| ML fraud prediction | Unavailable | No training data, trained model, calibration, or evaluation metrics. Rule points remain separate and are not called AI prediction. |
| Threat intelligence | Missing | No API key or provider integration. No live reputation or redirect lookups. |
| Authentication / database | Not applicable to current local prototype | No accounts or database. Java service binds to `127.0.0.1`; GitHub Pages is a static client-side demo. |
| Privacy controls | Partially implemented | No content persistence, storage, or logging; session counts are in memory. Language is selectable. No account, history, export, or theme settings. |
| Responsive and accessible UI | Implemented, manual review limited | Semantic headings, labels, live status/results, keyboard-visible focus, reduced-motion CSS, and responsive breakpoints. Dedicated device/browser accessibility audit remains future work. |
| Deployable site | Live and verified | GitHub Pages publishes the static client at `https://ada203880-boop.github.io/scamsathi-vibex26/`. The live message and pasted UPI QR flows were smoke-checked; the Java service is not deployed there. |
| Tests | Implemented | `npm test` contains ten rule tests and a Java compile/API/static smoke test. No camera hardware, automated QR image fixture, broad browser matrix, ML/audio, or real-world efficacy tests. |
| Hackathon deck | Required deck target: 10 slides | Must remain inside the official 8–10 slide limit; do not follow the pasted draft's conflicting 12–14 slide suggestion. |

## Prioritize next

1. Test camera and image scanning on a permitted HTTPS device/browser with synthetic QR content.
2. Run mobile and accessibility checks on target devices.
3. Research datasets, licensing, and evaluation design before any ML implementation.
4. Add audio detection only with a licensed model, reproducible evaluation, safe upload handling, and clear uncertainty language.
