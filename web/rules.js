(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  if (root) root.ScamSathiRules = rules;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';

  const SIGNALS = {
    secret: {
      label: 'Request for a secret code or credential', points: 35,
      detail: 'A request to disclose an OTP, PIN, CVV or password can enable account takeover. Do not tell these secrets to another person.'
    },
    receive_fee: {
      label: 'Payment requested to receive money', points: 32,
      detail: 'A demand to pay first to receive a refund or reward is a common fraud pattern. A UPI PIN authorizes an outgoing payment.'
    },
    remote_access: {
      label: 'Remote access or unknown app request', points: 34,
      detail: 'Remote-control tools, screen sharing or unknown APKs can expose messages, credentials and banking activity.'
    },
    pressure: {
      label: 'Urgency, threat or authority pressure', points: 16,
      detail: 'Scammers create fear to stop people verifying. Contact the organization through a number you find independently.'
    },
    bait: {
      label: 'High-pressure call to action', points: 10,
      detail: 'The wording encourages action before checking the sender or destination.'
    },
    payment_direction: {
      label: 'Possible payment-direction trick', points: 30,
      detail: 'Approving a collect request or entering a UPI PIN may send money out. Read the payment screen before approving.'
    },
    malformed_url: {
      label: 'Link format is unusual', points: 24,
      detail: 'The address could not be read as a normal web domain. Do not open it from the message.'
    },
    unencrypted: {
      label: 'Link does not use HTTPS', points: 10,
      detail: 'The link does not use an encrypted HTTPS connection. Do not enter personal or payment details there.'
    },
    ip_host: {
      label: 'Link uses a numeric address', points: 22,
      detail: 'A numeric address instead of a recognizable organization domain is unusual in an account or payment message.'
    },
    shortener: {
      label: 'Shortened link hides its destination', points: 16,
      detail: 'The final destination is hidden. Check it independently instead of opening the shortened address.'
    },
    brand_mismatch: {
      label: 'Brand name appears outside its usual domain', points: 28,
      detail: 'The address contains a familiar brand name, but the actual domain differs. A brand name in a URL does not prove it is official.'
    },
    lookalike: {
      label: 'Domain resembles a familiar brand', points: 25,
      detail: 'A domain label is similar to a known brand but is not the same. Read the complete domain carefully.'
    },
    idn: {
      label: 'Internationalized domain needs extra care', points: 12,
      detail: 'This domain uses encoded or non-ASCII characters. Similar-looking characters can make a destination hard to recognize.'
    },
    userinfo: {
      label: 'Link contains misleading sign-in text', points: 24,
      detail: 'Text before an @ sign can make a URL look as if it belongs to a trusted site. The actual host is after the @ sign.'
    },
    uncommon_tld: {
      label: 'Uncommon domain ending', points: 10,
      detail: 'This domain ending is less common for banks and payment services. Treat it cautiously, especially with a request for money or credentials.'
    },
    unknown_scheme: {
      label: 'QR contains an unsupported destination type', points: 28,
      detail: 'This QR payload uses a destination type ScamSathi does not inspect. Do not open or approve it unless you understand it.'
    },
    upi_qr: {
      label: 'UPI payment QR detected', points: 12,
      detail: 'This QR appears to start a UPI payment. Verify the recipient and amount in your trusted UPI app before entering a PIN.'
    },
    upi_missing_payee: {
      label: 'UPI QR has no visible payee address', points: 16,
      detail: 'The decoded payload does not contain a payee address. Do not proceed unless your payment app clearly identifies the recipient.'
    },
    qr_url: {
      label: 'QR contains a web destination', points: 8,
      detail: 'A QR can hide a phishing link. Inspect the destination and verify the domain independently; ScamSathi will not open it.'
    },
    qr_unknown: {
      label: 'QR contains text or an unsupported payload', points: 5,
      detail: 'The decoded data is not a recognized UPI payment or web link. Do not trust it just because it is a QR code.'
    },
    qr_parse: {
      label: 'UPI QR format is unusual', points: 12,
      detail: 'The payment fields could not be interpreted reliably. Do not proceed until your UPI app shows the details.'
    }
  };

  const BRANDS = [
    ['sbi', 'sbi.co.in'], ['hdfcbank', 'hdfcbank.com'], ['icicibank', 'icicibank.com'],
    ['axisbank', 'axisbank.com'], ['paytm', 'paytm.com'], ['phonepe', 'phonepe.com'],
    ['googlepay', 'google.com'], ['npci', 'npci.org.in'], ['amazon', 'amazon.in']
  ];
  const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'cutt.ly', 'is.gd', 'ow.ly', 'buff.ly']);
  const UNCOMMON_TLDS = new Set(['xyz', 'top', 'click', 'buzz', 'work', 'zip', 'mov']);

  function add(result, id) {
    if (result.signals.some(signal => signal.id === id)) return;
    const signal = SIGNALS[id];
    if (!signal) return;
    result.signals.push({ id, label: signal.label, detail: signal.detail, points: signal.points });
    result.score += signal.points;
  }

  function editDistance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return row[b.length];
  }

  function hostIsIp(host) {
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.startsWith('[');
  }

  function inspectUrl(result, raw) {
    const value = String(raw || '').trim();
    if (!value) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) {
      add(result, 'unknown_scheme');
      return;
    }
    let url;
    try {
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (!/^https?:$/.test(url.protocol) || !url.hostname || /\s/.test(value)) throw new Error('invalid URL');
    } catch (_) {
      add(result, 'malformed_url');
      return;
    }

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const labels = host.split('.');
    const rootDomain = labels.slice(-2).join('.');
    if (url.protocol === 'http:') add(result, 'unencrypted');
    if (url.username || url.password || /\/\/[^/]*@/.test(value)) add(result, 'userinfo');
    if (hostIsIp(host)) add(result, 'ip_host');
    if (host.split('.').some(label => label.startsWith('xn--'))) add(result, 'idn');
    if (SHORTENERS.has(host)) add(result, 'shortener');
    if (UNCOMMON_TLDS.has(labels.at(-1))) add(result, 'uncommon_tld');

    for (const [brand, officialDomain] of BRANDS) {
      if (host.includes(brand) && host !== officialDomain && !host.endsWith(`.${officialDomain}`)) {
        add(result, 'brand_mismatch');
        break;
      }
      const similar = labels.some(label => label !== brand && label.length >= brand.length - 1 &&
        label.length <= brand.length + 1 && editDistance(label, brand) === 1);
      if (similar && rootDomain !== officialDomain) add(result, 'lookalike');
    }
  }

  function finalize(result) {
    const details = result.actions;
    if (result.signals.length > 1) result.score += 8;
    result.score = Math.min(100, result.score);
    if (result.score >= 75) {
      result.level = 'critical';
      result.title = 'Several serious warning signs';
      result.summary = 'Stop and verify through an official app or a number you find independently before acting.';
    } else if (result.score >= 55) {
      result.level = 'high';
      result.title = 'Multiple high-risk indicators';
      result.summary = 'Several warning signs matched. Do not reply, click, share a code or approve a payment before verifying.';
    } else if (result.score >= 30) {
      result.level = 'caution';
      result.title = 'Pause and verify';
      result.summary = 'One or more warning signs matched. Verify through an official app or contact channel before acting.';
    } else {
      result.level = 'low';
      result.title = 'No strong known pattern found';
      result.summary = 'This checker did not find strong known patterns. That does not prove the message or link is safe.';
    }
    result.actions = [
      'Do not share an OTP, PIN, CVV, password or screen access.',
      'Contact the organization using a number or app you find independently.'
    ];
    if (result.signals.some(signal => signal.id === 'receive_fee' || signal.id === 'payment_direction' || signal.id === 'upi_qr')) {
      result.actions.unshift('A UPI PIN authorizes money going out. Read the recipient and amount before approving.');
    }
    if (result.hasUrl) result.actions.push('Do not open the link from the message. Check the destination independently.');
    result.actions.push('If money was lost, contact your bank and call India’s cyber-fraud helpline 1930 promptly.');
    if (result.signals.length === 0) result.actions.unshift('When unsure, ask someone you trust to review it before acting.');
    result.actions.push(...details);
    result.disclaimer = 'Rule-based warning score, not a probability or guarantee. A low score does not prove safety.';
    delete result.hasUrl;
    return result;
  }

  function analyze(message, url) {
    const text = String(message || '').trim();
    const link = String(url || '').trim();
    if (text.length > 4000 || link.length > 2048) throw new RangeError('Message limit is 4,000 characters and URL limit is 2,048 characters.');
    if (!text && !link) throw new TypeError('Provide a message or link to analyze.');
    const lower = text.toLowerCase();
    const result = { score: 0, level: 'low', title: '', summary: '', signals: [], actions: [], hasUrl: Boolean(link) };
    const education = /(?:never|don't|do not|avoid|beware)\s+(?:share|tell|send|give).{0,24}(?:otp|pin|password|cvv)|(?:otp|pin|password|cvv).{0,24}(?:never|don't|do not)\s+(?:share|tell|send|give)/iu.test(lower);
    if (!education && /\b(otp|one[ -]?time password|verification code|cvv|card pin|upi pin|atm pin|password|passcode)\b|ओटीपी|पासवर्ड|पिन बताएं/iu.test(lower)) add(result, 'secret');
    if (/(receive|get|claim|unlock|release).{0,35}(money|refund|reward|cashback|prize|payment)|pay.{0,30}(to receive|to claim|for refund)|पैसे.{0,25}(पाने|प्राप्त)|रिफंड.{0,20}(लेने|पाने)|शुल्क.{0,15}(जमा|भुगतान)|जमा.{0,10}शुल्क/iu.test(lower)) add(result, 'receive_fee');
    if (/\b(anydesk|teamviewer|quick.?support|remote access|screen share|install this app|download.*apk)\b|स्क्रीन शेयर|ऐप इंस्टॉल/iu.test(lower)) add(result, 'remote_access');
    if (/(account|card|kyc|sim|wallet).{0,30}(block|suspend|expire|close|deactivat)|police.{0,25}(arrest|case)|digital arrest|immediately|within \d+ hours|last warning|तुरंत|खाता बंद|खाता.{0,20}(बंद|रोक|निलंबित|अवरुद्ध)|केवाईसी|पुलिस.{0,15}(गिरफ्तार|केस)|आज ही/iu.test(lower)) add(result, 'pressure');
    if (/\b(urgent|verify now|click here|claim now|limited time|winner|lottery|prize money|kyc update|refund pending)\b|अभी क्लिक|इनाम|लॉटरी/iu.test(lower)) add(result, 'bait');
    if (/\b(upi collect|collect request|approve.{0,20}upi|enter.{0,20}upi pin|scan.{0,20}qr.{0,20}receive|qr code.{0,20}receive)\b|collect request|पैसे पाने के लिए.{0,10}qr|upi pin डाल/iu.test(lower)) add(result, 'payment_direction');
    if (link) inspectUrl(result, link);
    return finalize(result);
  }

  function analyzeQr(payload) {
    const value = String(payload || '').trim();
    if (!value || value.length > 4096) throw new RangeError('QR content must contain 1 to 4,096 characters.');
    const result = { score: 0, level: 'low', title: '', summary: '', signals: [], actions: [], hasUrl: false };
    if (/^upi:\/\/pay(?:\?|$)/i.test(value)) {
      add(result, 'upi_qr');
      try {
        const params = new URL(value).searchParams;
        const payee = params.get('pa') || '';
        const name = params.get('pn') || '';
        const amount = params.get('am') || '';
        if (payee) result.actions.push(`UPI payee address (unverified QR data): ${payee}`);
        if (name) result.actions.push(`Payee display name (unverified QR data): ${name}`);
        if (amount) result.actions.push(`Encoded amount: ${amount} (confirm it in your UPI app).`);
        if (!payee) add(result, 'upi_missing_payee');
      } catch (_) {
        add(result, 'qr_parse');
      }
    } else if (/^https?:\/\//i.test(value) || /^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(value)) {
      add(result, 'qr_url');
      result.hasUrl = true;
      inspectUrl(result, value);
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      add(result, 'unknown_scheme');
    } else {
      add(result, 'qr_unknown');
    }
    const final = finalize(result);
    final.actions.unshift('Do not pay or open anything from the QR until you verify it independently.');
    return final;
  }

  return { analyze, analyzeQr, inspectUrl, SIGNALS };
});
