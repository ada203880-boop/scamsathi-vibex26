const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('Android share target hands content to the app without putting it in a URL or persistent cache', async () => {
  const listeners = {};
  const scope = 'https://demo.test/scamsathi/';
  const appShell = '<!doctype html><html><head><title>ScamSathi</title></head><body><main>App shell</main></body></html>';
  let requestedShell = '';
  const context = {
    self: {
      registration: { scope },
      addEventListener(name, handler) { listeners[name] = handler; },
      skipWaiting: async () => {},
      clients: { claim: async () => {} }
    },
    URL,
    Response,
    Headers,
    fetch: async url => {
      requestedShell = String(url);
      return new Response(appShell, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "default-src 'self'; base-uri 'self'"
        }
      });
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'web/sw.js'), 'utf8'), context);

  const sample = 'Your bank account is blocked. Share your OTP now.';
  const attackText = `${sample}</textarea><script>alert(1)</script>`;
  const fields = { title: 'Bank alert', text: attackText, url: 'https://sbi-verify.example.xyz/login' };
  let responsePromise;
  listeners.fetch({
    request: {
      method: 'POST',
      url: `${scope}share-target/`,
      formData: async () => ({ get: key => fields[key] || null })
    },
    respondWith(value) { responsePromise = value; }
  });

  const response = await responsePromise;
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(requestedShell, `${scope}index.html`);
  const html = await response.text();
  assert.match(html, /<base href="https:\/\/demo\.test\/scamsathi\/">/);
  assert.match(html, /<textarea id="share-inbox" hidden data-truncated="false">/);
  assert.ok(html.includes(sample));
  assert.ok(html.includes('&lt;/textarea&gt;&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(html.includes('</textarea><script>alert(1)</script>'), false);
  assert.ok(html.includes('https://sbi-verify.example.xyz/login'));
  assert.equal(response.headers.get('location'), null);
  assert.equal(requestedShell.includes(sample), false);
});
