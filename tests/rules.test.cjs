const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../web/rules.js');

test('neutral text does not trigger a known warning rule', () => {
  const result = rules.analyze('Your receipt is ready. Thank you for your purchase.', 'https://example.com/receipt');
  assert.equal(result.level, 'low');
  assert.equal(result.score, 0);
  assert.deepEqual(result.signals, []);
  assert.equal(result.attackChain.count, 0);
});

test('educational OTP warning is not mistaken for a request', () => {
  const result = rules.analyze('Never share your OTP or PIN with anyone.', '');
  assert.equal(result.level, 'low');
  assert.equal(result.signals.some(signal => signal.id === 'secret'), false);
});

test('selected Hindi KYC, urgency, and fee phrases return warning signals', () => {
  const result = rules.analyze('आपका बैंक खाता आज बंद हो जाएगा। OTP बताएं और सत्यापन शुल्क जमा करें।', '');
  const ids = result.signals.map(signal => signal.id);
  assert.ok(ids.includes('secret'));
  assert.ok(ids.includes('pressure'));
  assert.ok(ids.includes('receive_fee'));
});

test('fake KYC example explains credential, pressure, and suspicious URL signals', () => {
  const result = rules.analyze(
    'Your bank account will be blocked in 2 hours. Update KYC now and share your OTP with our agent.',
    'http://sbi-verify.example.xyz/login'
  );
  const ids = result.signals.map(signal => signal.id);
  assert.ok(ids.includes('secret'));
  assert.ok(ids.includes('pressure'));
  assert.ok(ids.includes('brand_mismatch'));
  assert.equal(result.attackChain.count, 3);
  assert.equal(result.level, 'critical');
  assert.ok(result.actions.some(action => action.includes('Do not open')));
});

test('attack-chain map explains linked pressure without claiming a verdict', () => {
  const result = rules.analyze('Your account will be suspended today. Click here to verify now.', '');
  assert.equal(result.attackChain.count, 2);
  assert.deepEqual(result.attackChain.stages.map(stage => stage.matched), [true, true, false]);
});

test('UPI collect instructions are described as an outgoing-payment risk', () => {
  const result = rules.analyze('Approve this UPI collect request and enter your UPI PIN to receive a refund.', '');
  assert.ok(result.signals.some(signal => signal.id === 'payment_direction'));
  assert.ok(result.actions.some(action => action.includes('money going out')));
});

test('lookalike and shortened links are flagged without being fetched', () => {
  const lookalike = rules.analyze('', 'https://paytmm-login.example.xyz/claim');
  const shortener = rules.analyze('', 'https://bit.ly/claim');
  assert.ok(lookalike.signals.some(signal => signal.id === 'brand_mismatch' || signal.id === 'lookalike'));
  assert.ok(shortener.signals.some(signal => signal.id === 'shortener'));
});

test('UPI QR inspection returns payee and amount as unverified data', () => {
  const result = rules.analyzeQr('upi://pay?pa=shop%40example&pn=Tea%20Shop&am=10&cu=INR');
  assert.ok(result.signals.some(signal => signal.id === 'upi_qr'));
  assert.ok(result.actions.some(action => action.includes('shop@example')));
  assert.ok(result.actions.some(action => action.includes('Encoded amount: 10')));
  assert.ok(result.actions.some(action => action.includes('Do not pay or open')));
});

test('UPI QR without a payee is flagged', () => {
  const result = rules.analyzeQr('upi://pay?pn=Unknown&am=10');
  assert.ok(result.signals.some(signal => signal.id === 'upi_missing_payee'));
});

test('QR links are analyzed as text and unknown schemes are not executed', () => {
  const link = rules.analyzeQr('https://paytm-login.example.xyz/verify');
  assert.ok(link.signals.some(signal => signal.id === 'qr_url'));
  assert.ok(link.signals.some(signal => signal.id === 'brand_mismatch'));
  const scheme = rules.analyzeQr('javascript:alert(1)');
  assert.ok(scheme.signals.some(signal => signal.id === 'unknown_scheme'));
});

test('input limits and empty values fail closed', () => {
  assert.throws(() => rules.analyze('', ''), { name: 'TypeError' });
  assert.throws(() => rules.analyze('x'.repeat(4001), ''), { name: 'RangeError' });
  assert.throws(() => rules.analyzeQr('x'.repeat(4097)), { name: 'RangeError' });
});
