# ScamSathi 2.0 — Live Demonstration Script

**Target Duration:** Exactly 3 Minutes (180 Seconds)
**Presenter Setup:** Browser open to `http://127.0.0.1:18878/` and `http://127.0.0.1:18878/qr-scanner.html` in adjacent tabs.
**Presenter:** Adarsh Panda (Solo Participant)
**Preparation Checklist:**
- [x] FastAPI running on port 8000 (`cd backend && python run.py`)
- [x] Java server running on port 18878 (`java -cp build ScamSathiServer 18878`)
- [x] Browser zoomed to 100% or 110% for screen clarity
- [x] Clipboard ready with sample payloads below

---

## ⏱️ 3-Minute Demo Timeline

```text
[00:00 - 00:25]  Intro & Theme / Architecture
[00:25 - 00:55]  Demo 1: English KYC Phishing Message + Lookalike URL (Score: 100/100)
[00:55 - 01:25]  Demo 2: Hindi Vernacular Threat + Attack Journey (Score: 91/100)
[01:25 - 01:45]  Demo 3: Calibrated Legitimate Login OTP (Score: 0/100)
[01:45 - 02:15]  Demo 4: Standalone UPI QR Code Safety Scanner (Score: 12/100 [LOW])
[02:15 - 02:45]  Demo 5: Forensic Dossier Export & Law Enforcement Readiness
[02:45 - 03:00]  Demo 6: P0 Privacy Architecture & Zero-Retention Proof
```

---

## 🎬 Step-by-Step Live Walkthrough

---

### Step 1: Interface & Dual-Theme Overview (0:00 – 0:25)
1. **Action:** Click the **Theme Toggle** button in the top navigation bar.
2. **Talk Track:**
   > *"Judges, this is ScamSathi 2.0 running locally on our machine. Notice our dual-theme system: 'Paper Intelligence' for high-contrast accessibility, and 'Midnight Archive' for a professional cybersecurity operations experience. Everything is responsive across desktop, tablet, and mobile with zero horizontal overflow."*

---

### Step 2: English KYC Phishing Attack (0:25 – 0:55)
1. **Action:** Click the **Quick Sample Chip: Fake Bank KYC** or paste:
   - **Message:**
     ```text
     Your bank account has been locked. Share your OTP with support immediately to restore access.
     ```
   - **URL:**
     ```text
     http://sbi-verify.example.xyz/login
     ```
2. **Action:** Click **Analyze Threat**.
3. **UI Elements to Highlight:**
   - The prominent score badge: **`Risk Score: 100/100 (CRITICAL)`**.
   - Note the deterministic breakdown: `secret` (+35), `pressure` (+16), `unencrypted` (+10), `uncommon_tld` (+8), `brand_mismatch` (+28), plus multi-signal interaction bonus (+8).
   - Scroll to **Screen 3: Attack Journey**. Point out that all three stages are illuminated: Identity Spoofing, Pressure Tactics, and Financial Extraction.
   - Scroll to **Screen 5: Entity Graph**. Show the SVG nodes connecting the spoofed SBI brand to the deceptive `.xyz` domain.
4. **Talk Track:**
   > *"In under 20 milliseconds, ScamSathi deconstructs the threat. It gives an explainable Risk Score of 100 out of 100, maps the kill-chain across all three stages, and visually links the spoofed brand to the phishing domain in an interactive graph."*

---

### Step 3: Hindi Vernacular Threat Analysis (0:55 – 1:25)
1. **Action:** Click **Clear**, select **हिंदी (Hindi)** in the language dropdown, and paste:
   ```text
   आपका बैंक खाता आज बंद हो जाएगा। OTP बताएं और सत्यापन शुल्क जमा करें।
   ```
2. **Action:** Click **Analyze Threat**.
3. **UI Elements to Highlight:**
   - **`Risk Score: 91/100 (CRITICAL)`**.
   - Show the extracted signals:
     - `secret` (ओटीपी बताएं)
     - `receive_fee` (सत्यापन शुल्क जमा करें)
     - `pressure` (खाता आज बंद हो जाएगा)
4. **Talk Track:**
   > *"Scammers in India deliberately evade English-only filters using Hindi. ScamSathi natively parses vernacular threat cues, identifying the threat of account closure and fee fraud to award an explainable score of 91 out of 100."*

---

### Step 4: Calibrated Benign OTP Handling (1:25 – 1:45)
1. **Action:** Switch back to English, clear fields, and paste a routine login OTP:
   ```text
   123456 is your verification code for login. Do not share this code with anyone.
   ```
2. **Action:** Click **Analyze Threat**.
3. **UI Elements to Highlight:**
   - **`Risk Score: 0/100 (LOW / CLEAN BASELINE)`**.
   - Verdict: *"No strong known pattern found."*
4. **Talk Track:**
   > *"Crucially, a security tool must not cry wolf. Notice that this legitimate OTP message containing a 'do not share' advisory receives a clean baseline score of 0 out of 100. We don't panic the user on legitimate bank communications."*

---

### Step 5: Standalone UPI QR Safety Scanner (1:45 – 2:15)
1. **Action:** Switch to the second browser tab: `http://127.0.0.1:18878/qr-scanner.html`.
2. **Action:** In the Manual QR Payload box, paste:
   ```text
   upi://pay?pa=fake-merchant@icici&pn=Refund%20Desk&am=5000&cu=INR
   ```
3. **Action:** Click **Analyze Payload**.
4. **UI Elements to Highlight:**
   - Decoded Payee VPA: `fake-merchant@icici`.
   - Decoded Payee Name: `Refund Desk`.
   - Decoded Amount: `₹5,000`.
   - Score & Classification: **`Risk Score: 12/100 [LOW]`** — triggering the `upi_qr` indicator (+12), placing it in the Low tier while attaching explicit payment direction guidance.
   - The Golden Rule Warning: *"A UPI PIN authorizes an outgoing payment. Never enter your UPI PIN to receive money or refunds."*
5. **Talk Track:**
   > *"Now for India's biggest payment blind spot: the UPI collect scam. Our standalone QR scanner decodes the payload without executing it, parses the payee and requested amount of ₹5,000, and classifies it at 12 out of 100 in our Low tier. Crucially, it surfaces our golden rule: Entering a UPI PIN always debits funds from your account."*

---

### Step 6: Forensic Dossier Export & Law Enforcement Links (2:15 – 2:45)
1. **Action:** Return to the main tab, scroll to **Screen 7: Investigation Report**.
2. **Action:** Click **Export Markdown Report** (or **Export JSON Dossier**).
3. **UI Elements to Highlight:**
   - Pre-formatted incident report with exact timestamp, payload, signal weights, and offsets.
   - Clickable links to India's **National Cyber Crime Reporting Portal (cybercrime.gov.in)** and Helpline **1930**.
4. **Talk Track:**
   > *"When a citizen is targeted, Screen 7 converts raw data into an immediate, law-enforcement ready forensic dossier in JSON or Markdown. Victims can immediately share this with their bank fraud desk or submit it to the National Cyber Crime Portal at cybercrime.gov.in."*

---

### Step 7: P0 Privacy & Zero-Retention Proof (2:45 – 3:00)
1. **Action:** Scroll to **Screen 8: Recent Reports (Telemetry Log)**.
2. **Action:** Open Chrome DevTools (`F12`) -> **Application** -> **Storage**.
3. **UI Elements to Highlight:**
   - Show that **Cookies = 0**.
   - Show that **IndexedDB = 0**.
   - Show that the audit table is empty unless the user explicitly checks the opt-in box.
   - Click the **AI Copilot** drawer: point out the `"LOCAL RULES MODE"` badge confirming zero unconsented network transmission.
4. **Talk Track:**
   > *"Finally, privacy. Notice DevTools: zero cookies, zero IndexedDB, zero tracking. Our processing is 100% in-memory with zero retention by default. ScamSathi 2.0 is fast, explainable, and built for India's digital citizens. Thank you!"*

---

## 🚨 Troubleshooting & Fallback Protocols

| Issue During Live Demo | Immediate Fallback Action |
| :--- | :--- |
| **Accidental port conflict / Java closed** | Open terminal and run `java -cp build ScamSathiServer 18878`. Takes < 1.5 seconds to bind. |
| **Webcam not detected in QR scanner** | The page automatically falls back to the manual payload input with status `scan-camera-failed`. Paste the UPI sample payload into the input box. |
| **FastAPI backend process stopped** | The Java server will automatically handle `/api/analyze` and `/api/qr/analyze` via its **built-in offline fallback engine** without throwing browser errors. |
| **Accidental typo in input payload** | Click any of the four **Quick Sample Chips** (KYC Scam, Power Bill, UPI Collect, Legitimate OTP) on Screen 1 to repopulate validated strings instantly. |
