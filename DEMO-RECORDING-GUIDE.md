# ScamSathi — 3-minute demo recording guide

This script is designed to show the working local app, two useful scam scenarios, its safety guidance, and its limits. Keep the recording between 2 and 3 minutes and use only synthetic examples.

## Before recording

1. On Windows, open the ScamSathi project folder and double-click `run.bat`.
2. Open `http://127.0.0.1:18878` in Chrome and maximize the browser.
3. Confirm the page loads and that the **Try a sample message** and **Analyze warning signs** controls are visible.
4. Close unrelated tabs and notifications. Do not put real messages, phone numbers, account details, or personal links in the demo.
5. For screen capture on Windows 11, press **Win + Shift + R**, select the browser area, and start recording. Enable the microphone if you want to narrate live; otherwise record silently and add captions. Stop the capture, preview it, then save it as `ScamSathi-Demo.mp4` in the submission `outputs` folder.

## Narration and actions

### 0:00–0:18 — Introduce the problem

**Show:** ScamSathi home screen.

**Say:** “Urgent messages about KYC, refunds, or account blocks can pressure people into sharing an OTP or approving a payment. ScamSathi helps people pause and inspect warning signs before they act.”

### 0:18–0:40 — Explain what the app checks

**Do:** Click **Check a message**. Point out the message box and optional link field.

**Say:** “A person can paste a suspicious message or call transcript, and add a link separately. The checker sends it only to the Java service running on this device. It does not open the pasted link.”

### 0:40–1:15 — Analyze a fake KYC alert

**Do:** Click **Try a sample message ↗**, then **Analyze warning signs**. Let the results appear. Point to the matched signals and safer next steps.

**Say:** “This synthetic KYC example asks for an OTP and threatens an account block. ScamSathi explains the patterns it matched, instead of giving an unexplained verdict. The sample link is deliberately fake; do not open it.”

### 1:15–1:50 — Show a UPI refund trick

**Do:** Click **Learn the signs** in the top navigation. Click the right-arrow once to reach **UPI COLLECT TRICK**. Click **Check a message**, then **Try a sample message ↗**, then **Analyze warning signs**.

**Say:** “This refund message asks someone to scan a QR code and enter a UPI PIN. A UPI PIN authorizes money going out; it is not needed to receive money. The result shows the relevant warning signs and what to do next.”

### 1:50–2:15 — Explain link handling

**Show:** The suspicious sample URL in the optional link field or the result explanation.

**Say:** “The URL check looks at its structure, such as a misleading domain. It parses the text locally and never visits the link, so the demo does not contact the suspicious site.”

### 2:15–2:38 — Show safety guidance

**Show:** The three reminders beside the checker, then the help/reporting section if time permits.

**Say:** “The main actions are simple: never share an OTP or PIN, pause when someone creates pressure, and contact the organization using a number you find independently. If money has already been lost in India, contact your bank and call 1930 promptly.”

### 2:38–3:00 — Technology and honest limits

**Show:** The result score note or the **What this tool can and cannot tell you** section.

**Say:** “ScamSathi is a local Java HTTP service with a browser interface and explainable rules. Its signal score is not a probability or proof of fraud. It can miss new scams or flag legitimate messages, so people should verify independently. This prototype does not monitor calls or block payments.”

## Final review before submission

- The recording shows the real running app and both analysis results.
- The video is 2–3 minutes, readable, and has clear narration or captions.
- Only synthetic text and fake URLs appear; no private notifications or account information are visible.
- The saved file plays from start to finish and is named `ScamSathi-Demo.mp4`.
- Follow the event form's current rules for video size, format, and upload location.
