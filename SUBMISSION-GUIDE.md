# ScamSathi — hackathon demo and submission

## Demo setup

1. Confirm Java 17+ is installed.
2. Run `run.bat` on Windows, or `./run.sh` on macOS/Linux.
3. Open `http://127.0.0.1:18878`.
4. Use **Try a sample message**, then **Analyze warning signs**.

## Three-minute demo script

**0:00–0:20 — Problem**  
“People get urgent messages about KYC, refunds, and payment requests. ScamSathi helps them pause and understand the warning signs before acting.”

**0:20–1:00 — Fake KYC**  
Load the KYC sample. Show how it identifies an OTP request, account threat, and urgency. Explain why each signal matters.

**1:00–1:35 — UPI refund trick**  
Load the refund sample. Show the warning that a UPI PIN authorizes money going out, not money coming in.

**1:35–2:05 — Suspicious link**  
Show the lookalike link. Explain that the app checks its structure without opening it or querying a reputation service.

**2:05–2:35 — Safety and privacy**  
Show the safe next steps and official reporting portal. Input stays on this device and is not retained by the analysis service.

**2:35–3:00 — Technology and limits**  
“A Java service uses explainable rules. Its score is not a fraud probability. It cannot listen to calls or block payments. A next step would be testing against a reviewed dataset and adding optional threat-intelligence lookups safely.”

## Submission checklist

- Publish this project to a public GitHub or GitLab repository and use the real URL in slide 8 and the event form.
- Upload the 8-slide presentation deck.
- Include the 2–3 minute demo recording if time and the form allow it; it is optional.
- Verify the actual submission deadline and event duration on the official event page. The calendar invite lists a 9:00 AM IST start on November 15, 2026, with the same start and end time.
- Do not expose the local server to the public internet.
