# Testing record

Run the current automated checks with:

```sh
npm test
```

The suite contains ten JavaScript rule tests and a Java compile/API/static-serving smoke test. It checks representative benign and suspicious message patterns, selected Hindi scam phrases, URL structure, UPI QR parsing, unknown schemes, input limits, health/static routes, response headers, Java MIME handling, and API errors.

Manual browser review covered the home screen, a synthetic OTP/urgency message, and pasted UPI QR text. The QR result bug found during review was fixed, and the result now shows the payment signal, unverified payee/name/amount, and safe actions. No link was opened and no payment was initiated.

## Not verified

- Physical camera permission, camera stream, rear-camera switching, flashlight, or camera-track cleanup on real hardware.
- QR image decoding with a real image fixture in the automated suite.
- Full mobile device/browser matrix, formal accessibility audit, or native-speaker review of translations.
- Real-world fraud recall/precision, model metrics, audio analysis, live domain reputation, or production hosting behavior.

Passing these tests means the tested examples and API paths behaved as expected. It does not establish accuracy against real scams.
