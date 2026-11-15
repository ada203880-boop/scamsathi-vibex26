# ScamSathi — VibeX Codes 26 submission guide

## Project

ScamSathi is a local prototype for Track 3, Cyber Safety. A person pastes a suspicious message or call transcript and may add a URL. The Java rules engine explains matched warning signs and suggests safer next steps. It does not listen to calls, monitor UPI requests, open links, or block payments.

Repository: <https://github.com/ada203880-boop/scamsathi-vibex26>

The corrected 8-slide deck with the live repository link is in [`presentation/ScamSathi-VibeX-Codes-26-Repository-Linked.pptx`](presentation/ScamSathi-VibeX-Codes-26-Repository-Linked.pptx).

## What the judging guide requires

- **Presentation deck:** Mandatory, 8–10 slides. The current ScamSathi deck has 8 slides, so it meets the slide-count range.
- **Working code link:** Mandatory. The public repository above lets judges inspect the source.
- **Video:** A 2–3 minute live screen demo is optional and can earn up to 15 bonus points. The judging guide says to show the working app, not just read the slides.
- **Unstop form:** The [VibeX Codes 26 event page](https://api.unstop.com/hackathons/vibex-codes-26-globalyogacourse-1766232) asks for a short project description, a repository or project link, and a demo or screenshots.

## Important development disclosure

The event page says projects should be built during the event and asks teams to disclose pre-existing code, third-party resources, and AI tools. The ScamSathi files in this repository were prepared before the listed event start on November 15, 2026. Do not claim that the entire project was built during the event. Disclose the pre-event work and ask the organizers whether this prototype is eligible before submitting it.

OpenAI Codex assisted with review, verification, and updates to submission materials. List any other AI tools your team used to create or modify source code. The backend uses the JDK's built-in `HttpServer`; the web app has no third-party JavaScript dependencies. Disclose any additional libraries, assets, or services your team used.

## Demo setup

1. Confirm Java 17 or later is installed.
2. Run `run.bat` on Windows or `./run.sh` on macOS/Linux.
3. Open `http://127.0.0.1:18878`.
4. Use **Try a sample message**, then **Analyze warning signs**.
5. Use the synthetic KYC and UPI examples. Do not open their fake links.

## Three-minute demo outline

- **0:00–0:20 — Problem:** Urgent KYC, refund, and payment messages pressure people into sharing codes or approving payments.
- **0:20–1:00 — KYC example:** Analyze the sample and point out the OTP request, account threat, and urgency signals.
- **1:00–1:35 — UPI refund example:** Show that a UPI PIN authorizes money going out, not money coming in.
- **1:35–2:05 — Link handling:** Explain that ScamSathi inspects URL structure locally without opening the link or checking an online reputation service.
- **2:05–2:35 — Safety and privacy:** Show safer next steps and the official reporting portal. Analysis runs locally and does not retain message content.
- **2:35–3:00 — Technology and limits:** Explain the Java rules engine, that the signal score is not a fraud probability, and that the prototype does not listen to calls or block payments.

## Submission checklist

- Upload the repository-linked deck in `presentation/` (the live repository URL is already on slide 8) and provide that URL in the Unstop form.
- Upload the 8-slide deck.
- Provide a demo or screenshots in the form; record the optional 2–3 minute video for the judging bonus if possible.
- Disclose pre-event code, AI tools, and third-party resources accurately. Confirm eligibility with the organizers.
- Keep the server bound to localhost; do not expose it to the public internet.
