# ScamSathi — VibeX Codes 26

ScamSathi is a local-first cyber-safety prototype for people and small businesses. It checks a pasted message or call transcript and an optional URL for explainable warning signs, then shows safer next steps. It is designed for VibeX Codes Track 3. Repository: https://github.com/ada203880-boop/scamsathi-vibex26

## Run on Windows

1. Install Java 17 or later and ensure both `java` and `javac` are available in Command Prompt.
2. Double-click `run.bat`.
3. Open `http://127.0.0.1:18878` if the browser does not open automatically.
4. To stop the server, close the command window.

## Run on macOS or Linux

Install Java 17 or later, then run from a terminal in the project folder:

```sh
chmod +x run.sh
./run.sh
```

Open `http://127.0.0.1:18878`. To choose another port, set `PORT`, for example `PORT=19000 ./run.sh`.

## Demo flow

Paste a sample message or use **Try a sample message**, then select **Analyze warning signs**. Inspect the matched indicators, explanations, and safety steps. Try a UPI refund message and a suspicious link. The app parses a URL without opening it.

## Architecture

- `web/index.html` defines the checker, sample scenarios, result panel, and safety guidance.
- `web/styles.css` provides the responsive layout and visual states.
- `web/app.js` sends form-encoded content to the local API and safely renders the JSON response.
- `src/ScamSathiServer.java` uses the JDK `HttpServer` module to serve the web app and expose `GET /api/health` and `POST /api/analyze`.
- The rules engine checks for credential requests, urgency/threats, remote-access requests, refund/reward bait, UPI payment-direction tricks, and suspicious URL structure including shorteners, IP hosts, IDN normalization, and likely brand lookalikes.
- `/api/analyze` accepts a message up to 4,000 characters and a URL up to 2,048 characters. It returns HTTP 400 for empty input and HTTP 413 when either limit is exceeded.

## Privacy and limitations

The server binds to `127.0.0.1`, does not retain or log submitted message content, and does not make network requests for pasted URLs. Keep it local; do not expose the prototype publicly. The displayed score is a weighted rule signal score, not a probability, verified fraud finding, or guarantee. Rules can miss new scams and can flag legitimate content. ScamSathi does not listen to calls, block payments, verify bank accounts, or file police reports. Hindi guidance and detection cover selected phrases, not general Hindi-language understanding.

If money has been lost, contact the bank immediately. The Government of India's official cybercrime portal lists 1930 for financial cyber fraud reporting: <https://cybercrime.gov.in/>.

## Development and AI disclosure

This ScamSathi code was prepared before the VibeX Codes 26 event start listed for November 15, 2026, at 9:00 AM IST. The event page says projects should be built during the event and asks participants to disclose pre-existing code. Do not describe this repository as built entirely during the event; check with the organizers whether this pre-event prototype is eligible and disclose its timing accurately.

OpenAI Codex assisted with code review, verification, and submission-document updates. List any other AI tools used to create or modify the source code in the event submission. The Java server uses the JDK's built-in `HttpServer` and the web app has no third-party JavaScript dependencies. Disclose any other third-party resources or assets your team added.

## Submission checklist

- The judging guide requires an 8–10 slide deck and a working code link. The current deck has 8 slides.
- The [Unstop event page](https://api.unstop.com/hackathons/vibex-codes-26-globalyogacourse-1766232) asks for a short description, repository or project link, and a demo or screenshots. A 2–3 minute video is optional under the judging guide and can earn up to 15 bonus points.
- Use [`presentation/ScamSathi-VibeX-Codes-26-Repository-Linked.pptx`](presentation/ScamSathi-VibeX-Codes-26-Repository-Linked.pptx), which already has the repository URL on slide 8, and provide that URL in the event form.
- Disclose pre-event code, all AI tools used, and third-party resources accurately. Confirm eligibility with the organizers because this prototype predates the listed build window.
- Verify the app opens on the presentation device and use synthetic demo examples only.
