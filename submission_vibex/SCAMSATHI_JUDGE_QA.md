# ScamSathi 2.0 — Hackathon Judge Q&A Preparation

This guide equips the presenting team with technically grounded, concise, and credible answers to challenging questions likely to be asked by technical, product, and cybersecurity judges.

**Solo Participant:** Adarsh Panda
**Event:** VibeX Codes Final Hackathon Submission (November 16, 2026)

---

## 🏛️ Category 1: Architecture & Technical Implementation

### Q1: "Why did you build both a Java server and a Python FastAPI backend? Isn't that redundant?"
**Answer:**
> *"That separation is deliberate and provides high architectural resilience.
> 1. **Security & Gateway Tier (Java):** The Java 17 server acts as our lightweight, high-performance edge gateway. It serves static assets, enforces strict Content Security Policy headers, and reverse-proxies `/api/*` calls using HTTP/1.1 to prevent cross-origin issues.
> 2. **Heuristic Tier (Python FastAPI):** FastAPI excels at rapid regex parsing, Pydantic data validation, entity extraction, and potential future integrations with machine learning pipelines.
> 3. **Autonomous Offline Resilience:** If the Python service ever crashes or is unavailable, the Java gateway does not fail closed with a blank screen—it immediately activates an embedded offline fallback engine that scores threats directly in Java. The user is never left without defense."*

---

### Q2: "How does the Java reverse proxy handle HTTP/1.1 and streaming?"
**Answer:**
> *"Our initial audit revealed that early Java implementations did not explicitly enforce the protocol version, causing some ASGI servers like Uvicorn to complain about unsupported upgrade headers.
> In ScamSathi 2.0, we configured `HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1)` with explicit connect and read timeouts. We stream request body bytes unchanged, forward headers including `Content-Type`, and preserve FastAPI’s exact response status codes (such as HTTP 400, 413, or 422) back to the client."*

---

## ⚖️ Category 2: Scoring Philosophy & Detection Heuristics

### Q3: "Why do you use 'Risk Score: X/100' instead of a machine learning percentage probability like '85% scam'?"
**Answer:**
> *"In fraud prevention, calling a score an '85% probability' is scientifically dishonest and confusing to non-technical users. A probability implies a statistical distribution over repeated trials, which does not exist for a single isolated SMS message.
> Instead, ScamSathi uses an **explainable additive risk score**:
> - `secret` demand: +35 points
> - `receive_fee` trick: +32 points
> - `payment_direction` inversion: +30 points
> - `brand_mismatch`: +28 points
> - `pressure` / urgency: +16 points
> - Plus an 8-point interaction bonus when multiple independent vectors combine.
> This allows the user to see exactly why a score was generated. If a user asks 'Why is this 91?', we can point to the exact words and rules that contributed to that number."*

---

### Q4: "How do you avoid false positives on legitimate banking messages, like a real OTP notification?"
**Answer:**
> *"This was a critical engineering challenge we solved in our latest release.
> Legitimate banking OTP notices often say: '123456 is your verification code for login. Do not share this code with anyone.'
> A naive regex for 'verification code' or 'OTP' would flag this as credential risk (+35 points).
> ScamSathi implements a multi-layer exemption check:
> 1. It checks whether the message follows a routine delivery pattern (digits preceding or following the keyword).
> 2. It checks whether the phrase contains negative-share advisories ('do not share', 'never share this code').
> 3. Crucially, it verifies that there is **no direct request** asking the recipient to send or disclose the code to an agent or phone number.
> If an educational advisory is present without an outbound disclosure request, the secret signal is suppressed, resulting in a clean score of 0/100."*

---

### Q5: "Why does a valid UPI QR code receive a score of 12/100 and a 'LOW' classification rather than 0?"
**Answer:**
> *"Under ScamSathi's 4-tier model (`Critical >= 75`, `High >= 55`, `Caution >= 30`, `Low < 30`), a clean UPI payment string with valid payee VPA and amount triggers the `upi_qr` rule (+12 points).
> Because the score is 12 (< 30), its classification level is strictly **LOW**.
> This slight elevation above zero is deliberate: it indicates that an active payment intent is detected. It avoids panicking the user while providing an essential safety prompt: 'A UPI PIN strictly authorizes money leaving your account. Read the payee and amount before approving.' If the QR payload lacks a visible payee VPA, it triggers an additional `upi_missing_payee` indicator (+16 points), elevating the risk."*

---

## 🔒 Category 3: Privacy, Data Protection & Consent (P0)

### Q6: "Most caller ID and fraud apps upload data to the cloud. How does ScamSathi guarantee privacy?"
**Answer:**
> *"ScamSathi 2.0 was designed under a strict **Zero-Retention Default** policy:
> - **Zero Server Storage:** Neither FastAPI nor Java writes scan text, URLs, or QR payloads to disk or any database. Processing occurs strictly in transient memory.
> - **Zero Cookie & Tracking:** Our browser audit verified 0 cookies, 0 sessionStorage, and 0 IndexedDB storage.
> - **Opt-In Telemetry:** The client-side history dashboard is strictly null by default. It only logs entries if the user explicitly checks an opt-in toggle in the UI. If the user ever opts out, all existing records are instantly wiped from `localStorage`.
> We believe user security should never come at the cost of mass surveillance."*

---

### Q7: "How do you protect users when using Google Gemini?"
**Answer:**
> *"Gemini integration is completely optional and strictly consent-gated.
> 1. **Zero Key Exposure:** The Gemini API key is never placed in client-side code; it resides solely in the server environment.
> 2. **Dual-Gate Enforcement:** The frontend checkbox must be enabled, AND the server validates that `externalAiConsent === 'true'`. If unconsented, the server rejects the request with HTTP 403 Forbidden.
> 3. **Offline Defense Fallback:** If the user does not grant consent or if the environment lacks an API key, ScamSathi’s Copilot automatically falls back to deterministic, on-device defensive playbooks with zero network requests."*

---

## 📱 Category 4: Real-World Usability & Hardware Constraints

### Q8: "What happens if a user is on a device without a camera, or permissions are denied for the QR scanner?"
**Answer:**
> *"In our testing harness and in real-world locked-down enterprise browsers, webcams are often inaccessible.
> ScamSathi handles this through graceful degradation:
> - If `getUserMedia` fails or permissions are blocked, the page transitions immediately from `scan-idle` to `scan-camera-failed` with clear troubleshooting text.
> - Right below the camera viewport, an integrated **manual payload input** allows users to paste raw QR text or UPI strings (`upi://pay?...`) for immediate parsing and safety evaluation."*

---

### Q9: "How does ScamSathi protect against Hindi or regional language scams?"
**Answer:**
> *"India has over 20 official languages, and attackers exploit linguistic blind spots.
> ScamSathi 2.0 features native Hindi heuristic tokenization. We extract terms like 'खाता बंद' (account closure), 'तुरंत' (urgency), 'ओटीपी बताएं' (share OTP), and 'सत्यापन शुल्क' (verification fee).
> In our verified test suite, the Hindi threat message scored 91/100, proving that our tokenization effectively bridges the vernacular gap."*

---

## 🚀 Category 5: Business Model, Scalability & Roadmap

### Q10: "What is the go-to-market and deployment model for ScamSathi?"
**Answer:**
> *"ScamSathi 2.0 is designed for three deployment horizons:
> 1. **Consumer Direct (B2C / Public Good):** An open-source, local-first PWA accessible directly in mobile browsers without requiring intrusive app store permissions. Built for India's digital citizens.
> 2. **Banking & FinTech SDK (B2B):** Licensing our deterministic heuristic engine to banking apps and neo-banks to embed pre-transaction safety checks directly inside payment flows.
> 3. **Enterprise & Telco Integration:** Partnering with telecom providers and government agencies (like CERT-In) to run our heuristic rules at SMS gateways for network-level phishing triage."*

---

### Q11: "What are the current limitations of ScamSathi 2.0?"
**Answer:**
> *"We maintain complete transparency regarding our boundaries:
> 1. **Audio Deepfakes:** ScamSathi explicitly discloses on Screen 1 and in the footer that it does not analyze audio recordings and cannot detect voice clones. If an urgent call arrives, our guidance is always to hang up and verify via a trusted number.
> 2. **Network Reachability:** ScamSathi inspects structural indicators in URLs (lookalikes, IP hosts, uncommon TLDs, shorteners) without executing remote HTTP requests to avoid triggering drive-by downloads or alerting attackers.
> 3. **Language Scope:** ScamSathi 2.0 currently supports English and Hindi; expanding to Tamil, Telugu, and Bengali is our immediate Horizon 1 objective.
> 4. **Hardware Testing Disclosures:** Core heuristic algorithms are 100% verified via automated unit and integration tests. Live Gemini inference and physical camera testing remain pending user API credentials and physical hardware."*

---

### Q12: "Who participated in the development of this project?"
**Answer:**
> *"**Adarsh Panda** is the sole participant and architect of ScamSathi 2.0 for the VibeX Codes hackathon. The system architecture, Java reverse proxy, FastAPI backend, PWA frontend, test harnesses, and documentation were conceived, implemented, tested, and audited by Adarsh Panda."*
