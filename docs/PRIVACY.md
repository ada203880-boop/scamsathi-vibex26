# Privacy and data handling

## What the prototype processes

Message text, an optional URL, or decoded QR text is processed only to produce an on-screen result. In local run mode, the browser posts text to the Java service on the same device. In static mode, browser JavaScript analyzes the text locally. The QR camera preview is processed in the browser by the QR decoder; the image/camera feed is not uploaded.

## What it stores or shares

- The Java service does not write submitted content to disk or log it.
- The dashboard keeps only counters and recent activity labels/times in the current tab's memory. It does not keep message text and resets on tab close/reload.
- No database, analytics, account, telemetry, model provider, reputation provider, or third-party content API is used.
- URLs are not opened or sent to a domain reputation service.
- The copied summary contains the analysis result and is copied only when the user presses the copy button.

## User guidance

Use synthetic examples for demos. Avoid pasting real messages containing account details, authentication codes, personal data, or one-time links. A “low” score is not evidence that content is safe. The prototype is not an emergency reporting service and does not submit reports.

## Hosting note

GitHub Pages serves the static app. Standard hosting access logs may be controlled by the host; this application does not add analytics or transmit analysis content to the host beyond normal asset requests. Review GitHub's current privacy terms for hosting details.
