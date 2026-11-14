# ScamSathi verification record

Verified on November 15, 2026 on Windows with the packaged `outputs/scamsathi` project.

- `javac --add-modules jdk.httpserver -encoding UTF-8 -d build src\ScamSathiServer.java` — passed.
- `cmd.exe /c run.bat --no-browser` — compiled and started the Java server on `127.0.0.1:18878`.
- `GET /` — HTTP 200; checker page returned.
- `GET /styles.css` and `GET /app.js` — HTTP 200.
- `GET /api/health` — returned `status: ok` and engine name.
- Synthetic KYC/OTP threat with a suspicious bank-lookalike URL — high-risk signals returned, including credential request and brand mismatch.
- Synthetic UPI refund/QR/PIN message — payment-direction and credential signals returned.
- Synthetic remote-access request — remote-access signal returned.
- Benign receipt message — score 0 and no warning signals.
- Empty API input — HTTP 400.
- 4,001-character message — HTTP 413.
- `node --check web/app.js` — passed.

The mobile layout was not separately inspected in a mobile browser. These checks confirm app and API behavior using the current synthetic examples; they do not establish real-world scam-detection accuracy.
