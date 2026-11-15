# VibeX Codes 26 submission guide

## Project summary

**ScamSathi — Pause. Check. Protect.** is a local-first cyber-safety prototype for Track 3. It checks suspicious messages, URLs, and decoded QR data using explainable rules, then suggests safer actions. It does not claim a trained AI model, listen to calls, visit links, verify the payee, or stop payments.

## Required materials

- **Working repository:** https://github.com/ada203880-boop/scamsathi-vibex26
- **Demo site, once verified live:** https://ada203880-boop.github.io/scamsathi-vibex26/
- **Deck:** [presentation/ScamSathi_VibeX_Final.pptx](presentation/ScamSathi_VibeX_Final.pptx) (10 slides).
- **Demo narration:** [presentation/DEMO_SCRIPT.md](presentation/DEMO_SCRIPT.md).
- **Short description:** “ScamSathi helps people pause before they pay by explaining warning signs in suspicious messages, links, and QR payment content. Checks use local, explainable rules; the score is not a verdict, and the prototype never opens destinations or starts payments.”

The official judging guide requires an 8–10 slide presentation and working GitHub/GitLab code link. Keep the final deck at 10 slides. The optional 2–3 minute live demo video may earn bonus points; the repository includes a script, but no recorded video is claimed.

## Accurate development disclosure

The source history shows the project existed before the listed event start on November 15, 2026. Disclose the pre-event code and ask the organizer to confirm eligibility before submitting. Do not describe this as a project created entirely during the event.

OpenAI Codex assisted with implementation, code review, verification, and submission materials in this completion. Report other AI tools used by the team. `qr-scanner` 1.4.2 (MIT) is vendored for browser QR decoding; see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Disclose any additional assets/tools supplied by the team.

## Demo setup

For the static hosted demo, open the Pages URL only after verifying the successful deployment. For local mode, use Java 17+, run `run.bat` or `./run.sh`, and open `http://127.0.0.1:18878`. Use synthetic examples only. A camera demonstration requires HTTPS or localhost and the operator's camera permission; manual QR paste is available without camera access.

## Suggested flow (2–3 minutes)

1. Introduce the pressure pattern: fake KYC, refunds, and urgent payment requests.
2. Analyze the synthetic KYC message and point to the OTP request and urgency indicators.
3. Show the UPI safety reminder: a UPI PIN authorizes an outgoing payment.
4. Paste a synthetic UPI URI or scan a synthetic QR. Explain that the visible payee and amount are unverified and the app starts no payment.
5. Show that the URL check parses supplied text without visiting the site.
6. Explain privacy: message content is not retained and the dashboard resets with the tab.
7. Close with limits: rules are not a probability; audio and ML are unavailable; low risk does not prove safety.

## Before submission

- Confirm the public URL loads and the code link points to the intended branch/repository.
- Open the deck and confirm all slides render correctly on the presentation device.
- Test with synthetic content only; do not expose private notifications in a recording.
- Disclose pre-event code, AI tools, and the QR decoder accurately.
- Check the current Unstop form for exact fields, file limits, and submission deadline.
