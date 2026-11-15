# ScamSathi demo script (about 2 minutes 40 seconds)

Use only the app's synthetic examples and a synthetic QR payload. This script matches the implemented product. It does not present audio or ML as completed.

## 0:00–0:20 · Problem

**Show:** Home screen.
**Say:** “An urgent bank, refund, or delivery message can pressure someone to share a code or approve a payment before they verify it. ScamSathi helps people pause and inspect the warning signs.”

## 0:20–0:55 · Message analysis

**Do:** Select **Try a sample message**, then **Analyze warning signs**.
**Say:** “This synthetic KYC message threatens an account block and asks for an OTP. ScamSathi shows the exact patterns it matched and safer next steps. Its points are a rule tally, not a probability or proof of fraud.”

## 0:55–1:25 · UPI reminder

**Show:** The UPI example in **Learn the signs**, or the UPI reminder beside the checker.
**Say:** “A UPI PIN approves money going out. It is not needed to receive a refund. If you receive a payment request, read the payee and amount in your own payment app before you approve anything.”

## 1:25–1:55 · QR safety

**Do:** Open **Scan a QR** and paste a synthetic URI such as `upi://pay?pa=demo%40bank&pn=Demo%20Merchant&am=10&cu=INR`, then choose **Inspect pasted content**.
**Say:** “The checker identifies a UPI payment QR and displays encoded details as unverified. It does not open the destination or initiate payment. Never approve based on the QR alone.”

## 1:55–2:20 · Privacy and URL handling

**Show:** Session dashboard and the privacy statement.
**Say:** “The local app does not keep message text or send links to a reputation service. The dashboard keeps only counts in this browser tab, and clears when the tab closes. URL checks inspect the text; they never visit it.”

## 2:20–2:40 · Limits and close

**Show:** Limitations note and reporting link.
**Say:** “This prototype uses narrow explainable rules. It has no validated ML model or audio detector, and a low result does not prove safety. If money has already left an account in India, contact your bank and report promptly through the official portal or 1930.”

## Recording notes

- Aim for 2–3 minutes; keep text readable and use captions if narration is not recorded.
- Use synthetic messages, links, names, and payment data only.
- If demonstrating the camera, use a device/browser where the presenter grants permission; manual paste works without camera permission.
- Verify the public site before recording from the hosted build. No recording file is included in this repository.
- Disclose the project’s pre-event source history, AI assistance, and `qr-scanner` dependency. Confirm event eligibility with the organizer.
