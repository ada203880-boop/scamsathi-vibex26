# Implementation roadmap

This roadmap prioritizes the judging guide's working technology, safety, simplicity, and demo readiness. It does not promise a hackathon result.

## Completed for this branch

- Run the project from the real upstream repository history on `feature/scamsathi-vibex-final`.
- Build local Java API endpoints for message/URL and QR analysis with bounded input sizes.
- Add explainable rules and a client-side fallback for static hosting.
- Add browser-side camera/image/paste QR decode integration with lazy local library loading; never auto-open decoded data.
- Fix scanner results so QR payload analysis is visible on the scanner page.
- Add responsive UI, three language choices, session-only dashboard, emergency reporting path, honest capability notes, and synthetic examples.
- Add unit/API smoke tests, GitHub Pages workflow, technical/privacy/security docs, third-party notices, and submission materials.
- Prepare a ten-slide deck and demo narration aligned with the official guide.

## Before a live judging demo

- Confirm GitHub Actions deploys the static site and verify the expected Pages URL.
- Exercise camera start/deny/retry, pause/resume, rear-camera switch, flashlight, stop, and page-close cleanup on hardware where the user accepts permission.
- Decode a synthetic QR image on at least two supported browsers; include malformed and unsupported payload cases.
- Check mobile layout and keyboard-only flow on target devices. Ask a native Hindi and Odia speaker to review translations.
- Keep the demo on synthetic content and confirm the displayed link stays unopened.
- Disclose pre-event code, third-party decoder, and AI assistance accurately; ask the organizer to confirm eligibility.

## Future research and production work

1. **ML:** identify legally usable datasets; record provenance and license; deduplicate and use time/domain-aware splits; train a simple baseline; reserve a held-out test set; report precision, recall, F1, PR-AUC, ROC-AUC, confusion matrix, and calibration; publish model card and reproducible scripts only after the pipeline is reproducible.
2. **Audio:** choose a licensed deepfake model and dataset; build isolated preprocessing/inference with strict size, duration, MIME, and retention limits; evaluate across unseen speakers/generators and recording conditions before enabling uploads.
3. **Intelligence providers:** define a no-secret-in-source adapter; obtain provider permission and credential storage; add bounded timeouts, caching, rate limits, safe failures, and explicit disclosure before sending a URL to a third party.
4. **Operational controls:** if moving beyond localhost, add authentication, deployment-specific rate limiting, monitoring, abuse response, privacy review, incident response, and a security assessment.
5. **UX:** native-speaker review, screen-reader audit, wider device/browser checks, optional themes, and privacy settings only when those controls have real behavior behind them.
