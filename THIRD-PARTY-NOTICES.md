# Third-party notices

## QR Scanner

- Package: `qr-scanner` 1.4.2
- Project: [nimiq/qr-scanner](https://github.com/nimiq/qr-scanner)
- License: MIT
- Included files: `web/vendor/qr-scanner/qr-scanner.min.js` and `web/vendor/qr-scanner/qr-scanner-worker.min.js`
- License text: [`web/vendor/qr-scanner/LICENSE`](web/vendor/qr-scanner/LICENSE)

ScamSathi lazy-loads this browser library only when the camera or QR image scanner is used. The library uses the browser's `BarcodeDetector` where supported and a local worker decoder otherwise. It runs in the browser; QR images and camera frames are not uploaded.
