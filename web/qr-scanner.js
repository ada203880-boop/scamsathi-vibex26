let QrScannerModule;
let scanner;
let paused = false;
let switchedCameraIndex = 0;
let cameras = [];
let scanProcessed = false;

const byId = id => document.getElementById(id);
const scanStatus = byId('scanStatus');
const video = byId('cameraVideo');

function text(key) {
  return window.ScamSathi?.text(key) || key;
}

function setStatus(message, kind = 'idle') {
  scanStatus.textContent = message;
  scanStatus.dataset.kind = kind;
}

function setCameraUi(active) {
  byId('startScan').disabled = active;
  byId('pauseScan').disabled = !active;
  byId('switchCamera').disabled = !active || cameras.length < 2;
  byId('stopScan').disabled = !active;
  byId('cameraEmpty').hidden = active;
  byId('scanOverlay').hidden = !active;
}

async function loadScanner() {
  if (QrScannerModule) return QrScannerModule;
  const module = await import('./vendor/qr-scanner/qr-scanner.min.js');
  QrScannerModule = module.default;
  QrScannerModule.WORKER_PATH = new URL('./vendor/qr-scanner/qr-scanner-worker.min.js', import.meta.url).href;
  return QrScannerModule;
}

async function handleDecoded(result) {
  if (scanProcessed) return;
  const payload = typeof result === 'string' ? result : result?.data;
  if (!payload) return;
  scanProcessed = true;
  byId('decodedValue').textContent = payload;
  byId('decodedValue').hidden = false;
  setStatus(text('qr-analysis-loading'), 'success');
  await stopCamera();
  window.ScamSathi.analyzeQr(payload)
    .then(() => setStatus(text('scan-complete'), 'success'))
    .catch(error => setStatus(error.message || text('error-analysis'), 'error'));
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus(text('scan-no-camera'), 'error');
    return;
  }
  byId('startScan').disabled = true;
  setStatus(text('scan-starting'));
  try {
    const Reader = await loadScanner();
    if (!scanner) {
      scanner = new Reader(video, handleDecoded, {
        preferredCamera: 'environment',
        maxScansPerSecond: 12,
        onDecodeError: () => {},
        returnDetailedScanResult: true
      });
    }
    // start() is called only after the user presses the scan button.
    await scanner.start();
    paused = false;
    setCameraUi(true);
    setStatus(text('scan-active'));
    try {
      cameras = await Reader.listCameras(true);
    } catch (_) {
      cameras = [];
    }
    byId('switchCamera').disabled = cameras.length < 2;
    byId('toggleFlash').disabled = !(await scanner.hasFlash().catch(() => false));
  } catch (error) {
    byId('startScan').disabled = false;
    setCameraUi(false);
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      setStatus(text('scan-camera-blocked'), 'error');
    } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      setStatus(text('scan-no-camera'), 'error');
    } else {
      setStatus(text('scan-camera-failed'), 'error');
    }
  }
}

async function togglePause() {
  if (!scanner) return;
  try {
    if (paused) {
      await scanner.start();
      paused = false;
      byId('pauseScan').textContent = text('pause-scan');
      setStatus(text('scan-active'));
    } else {
      await scanner.stop();
      paused = true;
      byId('pauseScan').textContent = text('resume-scan');
      setStatus(text('scan-paused'));
    }
  } catch (_) {
    setStatus(text('scan-camera-failed'), 'error');
  }
}

async function switchCamera() {
  if (!scanner || cameras.length < 2) return;
  switchedCameraIndex = (switchedCameraIndex + 1) % cameras.length;
  try {
    await scanner.setCamera(cameras[switchedCameraIndex].id);
    setStatus(text('scan-active'));
  } catch (_) {
    setStatus(text('scan-camera-failed'), 'error');
  }
}

async function toggleFlash() {
  if (!scanner) return;
  try {
    await scanner.toggleFlash();
    byId('toggleFlash').setAttribute('aria-pressed', String(await scanner.isFlashOn()));
  } catch (_) {
    setStatus(text('flash-unavailable'), 'error');
  }
}

async function stopCamera() {
  if (scanner) {
    try { await scanner.stop(); } catch (_) { /* The stream may already be stopped. */ }
  }
  paused = false;
  byId('pauseScan').textContent = text('pause-scan');
  setCameraUi(false);
  byId('startScan').disabled = false;
}

async function inspectImage(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  scanProcessed = false;
  if (!file.type.startsWith('image/')) {
    setStatus(text('file-invalid'), 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setStatus(text('file-too-large'), 'error');
    return;
  }
  setStatus(text('image-checking'));
  try {
    const Reader = await loadScanner();
    const result = await Reader.scanImage(file, { returnDetailedScanResult: true });
    handleDecoded(result);
  } catch (_) {
    setStatus(text('scan-no-code'), 'error');
  }
}

async function inspectPasted() {
  const value = byId('manualPayload').value.trim();
  if (!value) {
    setStatus(text('error-qr-empty'), 'error');
    return;
  }
  if (value.length > 4096) {
    setStatus(text('error-too-long'), 'error');
    return;
  }
  scanProcessed = true;
  byId('decodedValue').textContent = value;
  byId('decodedValue').hidden = false;
  setStatus(text('qr-analysis-loading'));
  try {
    await window.ScamSathi.analyzeQr(value);
    setStatus(text('scan-complete'), 'success');
  } catch (error) {
    setStatus(error.message || text('error-analysis'), 'error');
  }
}

byId('startScan').addEventListener('click', () => {
  scanProcessed = false;
  startCamera();
});
byId('pauseScan').addEventListener('click', togglePause);
byId('switchCamera').addEventListener('click', switchCamera);
byId('toggleFlash').addEventListener('click', toggleFlash);
byId('stopScan').addEventListener('click', stopCamera);
byId('qrImage').addEventListener('change', inspectImage);
byId('manualAnalyze').addEventListener('click', inspectPasted);
byId('languageSelect')?.addEventListener('change', () => {
  if (!scanner) setStatus(text('scan-idle'));
});
setStatus(text('scan-idle'));

document.addEventListener('visibilitychange', () => {
  if (document.hidden && scanner && !paused) {
    scanner.stop().then(() => {
      paused = true;
      byId('pauseScan').textContent = text('resume-scan');
      setStatus(text('scan-paused'));
    }).catch(() => {});
  }
});

window.addEventListener('pagehide', () => {
  scanner?.destroy();
  scanner = null;
});
