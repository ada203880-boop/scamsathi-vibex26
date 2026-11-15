const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function waitForHealth(base, child) {
  const end = Date.now() + 6000;
  while (Date.now() < end) {
    if (child.exitCode !== null) throw new Error(`Java service exited with code ${child.exitCode}`);
    try {
      const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(400) });
      if (response.ok) return response;
    } catch (_) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error('Java service did not become ready within 6 seconds');
}

test('Java API and static QR page work locally', { timeout: 20000 }, async t => {
  execFileSync('javac', ['--add-modules', 'jdk.httpserver', '-encoding', 'UTF-8', '-d', 'build', 'src/ScamSathiServer.java'], { cwd: root, stdio: 'ignore' });
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn('java', ['--add-modules', 'jdk.httpserver', '-cp', 'build', 'ScamSathiServer', String(port)], {
    cwd: root,
    windowsHide: true,
    stdio: 'ignore'
  });
  t.after(() => { if (child.exitCode === null) child.kill(); });

  const health = await waitForHealth(base, child);
  const healthData = await health.json();
  assert.equal(healthData.status, 'ok');
  assert.equal(healthData.privacy, 'local-only');

  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(home.headers.get('access-control-allow-origin'), null);

  const qrPage = await fetch(`${base}/qr-scanner.html`);
  assert.equal(qrPage.status, 200);
  assert.match(await qrPage.text(), /Scan and inspect a QR/);
  const worker = await fetch(`${base}/vendor/qr-scanner/qr-scanner-worker.min.js`);
  assert.equal(worker.status, 200);
  assert.match(worker.headers.get('content-type'), /javascript/);

  const kyc = await fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message: 'Your account will be blocked. Share your OTP now.', url: 'http://sbi-verify.example.xyz/login' })
  });
  assert.equal(kyc.status, 200);
  const kycData = await kyc.json();
  assert.ok(kycData.signals.some(signal => signal.id === 'secret'));
  assert.ok(kycData.signals.some(signal => signal.id === 'brand_mismatch'));

  const hindi = await fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message: 'आपका बैंक खाता आज बंद हो जाएगा। OTP बताएं और सत्यापन शुल्क जमा करें।', url: '' })
  });
  assert.equal(hindi.status, 200);
  const hindiData = await hindi.json();
  const hindiIds = hindiData.signals.map(signal => signal.id);
  assert.ok(hindiIds.includes('secret'));
  assert.ok(hindiIds.includes('pressure'));
  assert.ok(hindiIds.includes('receive_fee'));

  const upi = await fetch(`${base}/api/qr/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ payload: 'upi://pay?pa=shop%40example&pn=Tea%20Shop&am=10&cu=INR' })
  });
  assert.equal(upi.status, 200);
  const upiData = await upi.json();
  assert.ok(upiData.signals.some(signal => signal.id === 'upi_qr'));
  assert.ok(upiData.actions.some(action => action.includes('shop@example')));

  const empty = await fetch(`${base}/api/analyze`, { method: 'POST', body: new URLSearchParams({ message: '', url: '' }) });
  assert.equal(empty.status, 400);
  const tooLong = await fetch(`${base}/api/analyze`, { method: 'POST', body: new URLSearchParams({ message: 'x'.repeat(4001), url: '' }) });
  assert.equal(tooLong.status, 413);
  const longQr = await fetch(`${base}/api/qr/analyze`, { method: 'POST', body: new URLSearchParams({ payload: 'x'.repeat(4097) }) });
  assert.equal(longQr.status, 413);
});
