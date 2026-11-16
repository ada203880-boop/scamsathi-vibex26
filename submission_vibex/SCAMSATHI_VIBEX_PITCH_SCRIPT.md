# ScamSathi 2.0 — VibeX Codes Official Pitch Script (6-Slide Deck)

**Presenter / Participant:** Adarsh Panda (Sole Participant)
**Hackathon Event:** VibeX Codes Final Hackathon Submission (November 16, 2026)
**Target Duration:** 4 to 6 Minutes
**Deck Structure:** Exactly 6 Slides
**Visual Theme:** Midnight Archive (Cybersecurity Operations Dark Aesthetic)

---

## ⏱️ 6-Slide Presentation Timing Roadmap

| Slide # | Slide Title | Allotted Time | Cumulative Time |
| :---: | :--- | :---: | :---: |
| **01** | Project Introduction — ScamSathi 2.0 (Adarsh Panda) | 0:45 | 0:45 |
| **02** | The Problem — Digital Scams & User Vulnerabilities | 0:55 | 1:40 |
| **03** | Our Solution — Explainable, Bilingual Scam Detection | 1:00 | 2:40 |
| **04** | Technology & Architecture — Local-First Processing & Consent-Gated AI | 1:05 | 3:45 |
| **05** | Product Demonstration & Verified Results | 1:10 | 4:55 |
| **06** | Privacy Sovereignty, Public Impact & The Road Ahead | 0:50 | 5:45 |

---

## 🎤 Slide-by-Slide Speaking Script

---

### Slide 1: Project Introduction — ScamSathi 2.0
*(Time: 0:00 – 0:45)*
**Visual Display:** Midnight Archive title slide featuring electric cyan and violet branding, prominent participant credit: **SOLO PARTICIPANT: ADARSH PANDA**, and key architectural pillars.

> *"Good morning, esteemed judges and organizers of VibeX Codes.*
>
> *My name is **Adarsh Panda**, and I am honored to present **ScamSathi 2.0** — an explainable, AI-assisted scam intelligence platform designed specifically for India's digital public infrastructure.*
>
> *Over the past decade, instant digital payments have transformed our nation's economic landscape. But along with unprecedented convenience has come an epidemic of social engineering fraud.*
>
> *ScamSathi 2.0 was engineered around one fundamental principle: **Defending citizens before credentials or funds ever leave their hands.** Let's look at why conventional defenses are failing."*

---

### Slide 2: The Problem — Digital Scams & User Vulnerabilities
*(Time: 0:45 – 1:40)*
**Visual Display:** 4 distinct challenge cards: Phishing & Urgency, Credential Theft & Impersonation, UPI Direction Tricks, and The Black-Box Detection Dilemma.

> *"Digital scams succeed not because attackers crack encryption algorithms, but because they manipulate human psychology.*
>
> *First, attackers manufacture **high-urgency panic**—threats of immediate power disconnection, frozen bank accounts, or fabricated legal arrests—forcing citizens to react in minutes before they can verify.*
>
> *Second, they carry out **credential theft**—impersonating bank managers or police officers to steal OTPs, PINs, and passwords via lookalike domains like `sbi-verify.xyz`.*
>
> *Third, they exploit **UPI direction tricks**—sending QR codes or collect requests claiming 'Scan or enter your PIN to receive a lottery or tax refund', when entering a PIN actually debits money from the victim.*
>
> *And fourth, existing defenses suffer from **The Black-Box Dilemma**. Telling a panicked user that a message has a '78% risk score' explains nothing. Users ignore warnings they don't understand, and conventional tools miss vernacular Hindi phrasing entirely.*
>
> *Users don't need opaque percentages—they need instant, explainable, on-device defense."*

---

### Slide 3: Our Solution — Explainable, Bilingual Scam Detection
*(Time: 1:40 – 2:40)*
**Visual Display:** 4 core solution quadrants: Structural Analysis, Native Bilingual Detection, Standardized Risk Scoring (`Risk Score: X/100`), and Standalone UPI QR Scanner.

> *"ScamSathi 2.0 solves this crisis by transforming confusion into transparent, explainable defense.*
>
> *First, we perform **Real-Time Payload Analysis** of both messages and URLs. We inspect link structures, lookalike domains, brand mismatches, and URL shorteners without visiting external sites, eliminating drive-by risks.*
>
> *Second, we provide **Native Bilingual Detection**. ScamSathi natively tokenizes Hindi threat cues—such as 'खाता बंद' (account closure), 'ओटीपी बताएं' (share OTP), and 'सत्यापन शुल्क' (verification fee)—bridging the vernacular blind spot that attackers exploit against English-only filters.*
>
> *Third, our risk scoring is completely explainable. We adhere strictly to the standard: **`Risk Score: X/100`**—never an opaque probability percentage. Scores are calculated by summing transparent heuristic weights: +35 for credential requests, +32 for fee tricks, and +16 for urgency, mapped across a 3-Stage Attack Journey: Identity Spoofing, Pressure Tactics, and Financial Extraction.*
>
> *And fourth, our dedicated **UPI QR Safety Scanner** decodes payment strings without executing unverified URLs, validating payee addresses and amounts while enforcing the golden rule: **A UPI PIN strictly authorizes money leaving your account; you never enter a PIN to receive funds.**"*

---

### Slide 4: Technology & Architecture — Local-First Processing & Consent-Gated AI
*(Time: 2:40 – 3:45)*
**Visual Display:** 4-tier system diagram (PWA Client, Java 17 Gateway, FastAPI Python Engine, Gemini Cloud Layer) alongside the verified technical integrity standards card.

> *"Let's examine how ScamSathi 2.0 is engineered under the hood.*
>
> *At **Tier 1** is our responsive Progressive Web App, supporting both Paper Intelligence and Midnight Archive themes across desktop, tablet, and mobile.*
>
> *All traffic routes through **Tier 2**: a secure Java 17 gateway on port 18878. It enforces strict Content Security Policy headers and reverse-proxies `/api/*` requests via HTTP/1.1 to our Python backend.*
>
> *If the Python service is ever offline, the Java gateway's **autonomous offline fallback engine** immediately takes over, ensuring zero service disruption.*
>
> *At **Tier 3** is our FastAPI Python engine on port 8000, executing bilingual tokenization, entity extraction for phone numbers, domains, and UPI VPAs, and multi-report campaign clustering.*
>
> *At **Tier 4** is Google Gemini 1.5 Flash. We maintain strict technical credibility: Gemini is strictly **opt-in and consent-gated** on both the frontend and server, returning an HTTP 403 Forbidden code if unconsented. In our offline test environment without API keys, ScamSathi automatically falls back to deterministic on-device defensive playbooks with zero network requests."*

---

### Slide 5: Product Demonstration & Verified Test Results
*(Time: 3:45 – 4:55)*
**Visual Display:** 100% automated test pass rate card (36/36 JS + 14/14 Python) paired with actual application screenshots of the Desktop Dashboard and Standalone QR Scanner.

> *"We believe in empirical verification over fabricated claims. Every capability in ScamSathi 2.0 is backed by automated tests and genuine execution.*
>
> *Our test harness confirms **100% test integrity**:*
> - **36 out of 36 Node.js integration tests passed** covering rules, UI workflows, proxy integration, and privacy gates.
> - **14 out of 14 Python FastAPI unit tests passed** validating heuristics, OpenAPI schemas, and entity extraction.
> - **100% clean Java compilation** with zero warnings, verified across Desktop, Tablet, and Mobile viewports with zero horizontal overflow.*
>
> *On the left, you see our verified detection scores:*
> - English Bank Phishing with lookalike URL scores **100/100 (CRITICAL)**.
> - Hindi account closure fraud scores **91/100 (CRITICAL)**.
> - Suspicious shortened URLs score **34/100 (CAUTION)**.
> - UPI collect QR payloads score **12/100 (LOW)**: triggering the 12-point `upi_qr` indicator, placing it in the Low risk tier (< 30) while delivering immediate payment direction advice: 'A UPI PIN authorizes outgoing payments.'
> - And crucially: **Legitimate banking OTP notifications score a clean 0/100 (LOW / BENIGN)**. Our calibrated engine suppresses false positives on routine security advisories.*
>
> *On the right are actual screenshots of our operational dashboard and QR safety scanner."*

---

### Slide 6: Privacy Sovereignty, Public Impact & The Road Ahead
*(Time: 4:55 – 5:45)*
**Visual Display:** 3-column closing card: Privacy Sovereignty (Zero Retention), Future Roadmap (Horizons 1–3), and The Mission / Sole Participant credit: **Built for India's Digital Citizens**.

> *"To conclude, let's address data sovereignty and our future roadmap.*
>
> *ScamSathi 2.0 enforces a **Zero-Retention Default**:
> - We set **zero cookies**.
> - We use **zero IndexedDB** and **zero sessionStorage**.
> - All scan text and QR payloads are evaluated strictly in transient memory.
> - Local history logging is strictly opt-in with an instant one-click purge button.
> - Voice dictation explicitly discloses that audio is processed by the browser provider before microphone activation.*
>
> *Our **Future Roadmap** expands this defense:
> - In **Horizon 1**, we will add heuristic tokenizers for Tamil, Telugu, Bengali, and Marathi, and compile our rules to WebAssembly for 100% serverless browser execution.
> - In **Horizon 2**, we will launch an Android Accessibility shield to alert users inside third-party payment apps before confirming suspicious collect requests.
> - In **Horizon 3**, we will introduce federated threat clustering using local cryptographic hashes to map nationwide scam rings without surveilling citizens.*
>
> *ScamSathi 2.0 proves that empowering India's digital citizens with cybersecurity does not require black boxes or mass surveillance. It is explainable, local-first, rigorously tested, and ready for evaluation right now.*
>
> *Thank you, judges! I am Adarsh Panda, and I look forward to your questions."*
