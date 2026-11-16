(function () {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const results = { message: null, qr: null };
  const activity = { checks: 0, warnings: 0, qr: 0, recent: [] };
  let language = 'en';
  let exampleIndex = 0;
  let pulseAnimationActive = true;
  let currentAnalysisKind = 'message';
  let selectedSafetyScenario = null;

  const THEME_STORAGE_KEY = 'scamsathi_theme_v1';

  function applyTheme(theme, persist = false) {
    const selected = theme === 'midnight' ? 'midnight' : 'paper';
    document.documentElement.dataset.theme = selected;
    document.documentElement.style.colorScheme = selected === 'paper' ? 'light' : 'dark';
    const toggle = $('#themeToggle');
    if (toggle) {
      toggle.textContent = selected === 'paper' ? 'Midnight Archive' : 'Paper Intelligence';
      toggle.setAttribute('aria-pressed', String(selected === 'midnight'));
      toggle.setAttribute('aria-label', `Switch to ${toggle.textContent} theme`);
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = selected === 'paper' ? '#f6f4ed' : '#080c16';
    if (persist) {
      try { localStorage.setItem(THEME_STORAGE_KEY, selected); } catch (_) {}
    }
  }

  const CHAIN_COPY = {
    en: {
      kicker: 'SCREEN 03 · EXPLAINABLE ATTACK-CHAIN MAP',
      title: 'How this message may move you',
      summary: count => count >= 2 ? 'Several linked cues appear together. Verify independently before acting.' : 'Few linked stages were found; this does not prove the message is safe.',
      count: count => `${count}/3 matched stages`, found: 'Cue detected', absent: 'Not detected',
      note: 'Transparent deterministic signal map — not a black-box AI verdict.',
      stages: ['Borrow trust (Spoof Identity)', 'Create pressure (Psychological Coercion)', 'Ask for code, money or access (Extraction)']
    },
    hi: {
      kicker: 'स्क्रीन 03 · समझने योग्य स्कैम-क्रम',
      title: 'यह संदेश आपको कैसे आगे बढ़ा सकता है',
      summary: count => count >= 2 ? 'कई चरण साथ दिखे। कार्रवाई से पहले स्वतंत्र रूप से पुष्टि करें।' : 'कम जुड़े संकेत मिले; इससे संदेश सुरक्षित साबित नहीं होता।',
      count: count => `${count}/3 मिले चरण`, found: 'संकेत मिला', absent: 'नहीं मिला',
      note: 'यह संकेतों का नक्शा है, धोखाधड़ी का फैसला या अंधा AI अनुमान नहीं।',
      stages: ['भरोसा जीतना (पहचान की चोरी)', 'दबाव बनाना (मानसिक भय)', 'कोड, पैसा या एक्सेस माँगना (नुकसान)']
    },
    or: {
      kicker: 'ସ୍କ୍ରିନ୍ 03 · ବୁଝିହେଉଥିବା ଠକେଇ-କ୍ରମ',
      title: 'ଏହି ବାର୍ତ୍ତା ଆପଣଙ୍କୁ କିପରି ଆଗକୁ ନେଇପାରେ',
      summary: count => count >= 2 ? 'ଏକାଧିକ ପର୍ଯ୍ୟାୟ ଏକାଠି ଦେଖାଯାଉଛି। କାର୍ଯ୍ୟ ପୂର୍ବରୁ ନିଜେ ଯାଞ୍ଚ କରନ୍ତୁ।' : 'କମ୍ ସଂଯୁକ୍ତ ସଙ୍କେତ ମିଳିଲା; ଏହା ସୁରକ୍ଷିତ ବୋଲି ପ୍ରମାଣ ନୁହେଁ।',
      count: count => `${count}/3 ମେଳ ଖାଇଥିବା ପର୍ଯ୍ୟାୟ`, found: 'ସଙ୍କେତ ମିଳିଲା', absent: 'ମିଳିଲା ନାହିଁ',
      note: 'ଏହା ସଙ୍କେତର ମାନଚିତ୍ର, ଠକେଇର ନିଶ୍ଚିତ ରାୟ କିମ୍ବା AI ପୂର୍ବାନୁମାନ ନୁହେଁ।',
      stages: ['ବିଶ୍ୱାସ ହାସଲ (ପରିଚୟ ଚୋରି)', 'ଚାପ ସୃଷ୍ଟି (ମାନସିକ ଭୟ)', 'କୋଡ୍, ଟଙ୍କା କିମ୍ବା ଆକ୍ସେସ୍ ମାଗିବା (କ୍ଷତି)']
    }
  };

  const UI = {
    en: {
      'brand-tag': 'CYBERSECURITY INTELLIGENCE', 'nav-check': 'Threat Analysis', 'nav-graph': 'Fraud Graph', 'nav-campaigns': 'Campaigns', 'nav-dossier': 'Dossier', 'nav-telemetry': 'Telemetry Log', 'nav-qr': 'QR Scanner', 'nav-learn': 'Threat Tactics', 'local-label': 'Sandbox Protected', 'language-label': 'Language', 'track-label': 'CYBER DEFENSE INTELLIGENCE',
      'hero-line-1': 'Intercept.', 'hero-line-2': 'Analyze.', 'hero-line-3': 'Neutralize.', 'hero-intro': 'Next-generation cybersecurity intelligence platform for explainable scam detection, SMS/URL payload analysis, and fraud relationship visualization.', 'hero-cta': 'Inspect Threat Vector', 'hero-privacy-title': 'Local-First Checks & Optional History', 'hero-privacy-copy': 'Checks run locally by default and content is not saved unless you opt in to history. Optional Gemini processing requires your explicit consent.', 'hero-art-1': 'EXPLAINABLE CUES', 'hero-art-2': 'DEFENSE PLAYBOOK',
      'session-kicker': 'SESSION TELEMETRY', 'session-title': 'Live Inspection Metrics', 'session-note': 'Metrics maintained in browser sandbox session memory.', 'metric-checks': 'SCANS COMPLETED', 'metric-checks-note': 'Evaluated in this session', 'metric-warnings': 'CRITICAL / HIGH THREATS', 'metric-warnings-note': 'Urgent warning signals', 'metric-qr': 'QR / PAYMENT CHECKS', 'metric-qr-note': 'UPI and visual payloads', 'recent-title': 'RECENT THREAT LOG', 'recent-empty': 'No checks recorded yet. Run an analysis below.',
      'checker-kicker': 'SCREEN 01 · THREAT INGESTION', 'checker-title': 'Inspect Suspicious Payload', 'checker-help': 'Start here: paste suspicious text, add a link if present, then analyze. Leave passwords, OTPs, PINs, and full card details out.', 'message-label': 'MESSAGE OR CALL TRANSCRIPT', 'message-limit': 'up to 4,000 characters', 'try-example': 'Cycle sample message ↗', 'url-label': 'SUSPICIOUS URL OR EMBEDDED LINK', 'url-note': 'checked as text only; the URL is not opened', 'url-placeholder': 'Paste link or domain (e.g., https://bank.example/login)', 'analyze-button': 'Analyze Threat Vectors', 'input-local-note': 'Evaluated in-browser or by the local ScamSathi service if running.', 'before-act': 'TACTICAL PROTOCOLS', 'three-rules': 'Golden Rules of Cyber Defense', 'rule-otp-title': 'Never disclose OTP or PIN', 'rule-otp-copy': 'Official bank personnel will NEVER request an OTP, PIN, or CVV.', 'rule-upi-title': 'Receiving money never requires a PIN', 'rule-upi-copy': 'A UPI PIN strictly authorizes funds leaving your bank account.', 'rule-pressure-title': 'Artificial urgency is a red flag', 'rule-pressure-copy': 'Scammers fabricate panic to prevent calm verification. Pause and verify.', 'report-link': 'Official Indian Cybercrime Portal (cybercrime.gov.in) ↗',
      'result-kicker': 'SCREEN 02 · THREAT VERDICT', 'score-label': 'SIGNAL SCORE', 'score-note': 'Deterministic threat weight points · 0 = Clean Baseline, 100 = Maximum Attack Indicators', 'signals-title': 'Screen 04 · Evidence Breakdown', 'actions-title': 'Defensive Containment Playbook', 'copy-result': 'Copy Incident Summary', 'copy-done': 'Incident summary copied to clipboard.', 'copy-failed': 'Clipboard is not available in this browser.', 'risk-critical': 'Critical Threat Indicators Detected', 'risk-high': 'High-Risk Warning Signs Detected', 'risk-caution': 'Caution Advised — Verify Independently', 'risk-low': 'Low Threat Density / Clean Baseline', 'no-signals': 'No known threat indicators matched. Maintain caution as new vectors emerge.',
      'qr-kicker': 'QR AND PAYMENT SAFETY', 'qr-title': 'Check before you scan or pay', 'qr-help': 'Scan with your camera, choose a QR image, or paste decoded content. ScamSathi will not open a destination or start a payment.', 'open-scanner': 'Open Live QR Scanner', 'camera-note': 'Camera access starts only after you press Start scanning. HTTPS or localhost is required.', 'qr-paste-label': 'PASTE DECODED QR CONTENT', 'qr-paste-note': 'up to 4,096 characters', 'qr-placeholder': 'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR', 'inspect-qr': 'Inspect QR content', 'upi-unverified': 'UPI details in a QR are unverified. Confirm the payee and amount in your UPI app.', 'qr-result-kicker': 'QR CHECK RESULTS',
      'learn-kicker': 'CASE EXAMPLES', 'learn-title': 'Spot the Pressure Tactic', 'learn-copy': 'Synthetic examples demonstrate the warning patterns ScamSathi explains.', 'what-notice': 'What to notice',
      'audio-kicker': 'VOICE SCAM SAFETY', 'audio-title': 'Audio deepfake analysis is not available', 'audio-copy': 'ScamSathi does not upload or analyze recordings and cannot confirm whether a voice is cloned. If a caller urgently asks for money, hang up and call the person using a number you already trust.',
      'help-kicker': 'IF MONEY HAS ALREADY LEFT YOUR ACCOUNT', 'help-title': 'Act quickly. Contact your bank and report it.', 'help-copy': 'In India, call', 'help-copy-2': 'or use the Government of India’s', 'portal-name': 'National Cyber Crime Reporting Portal', 'open-portal': 'Open official portal ↗', 'limits-title': 'What this tool can and cannot tell you', 'limits-copy': 'ScamSathi uses deterministic rules to explain patterns in message text, URL structure and decoded QR content. It does not use a black-box fraud score or proprietary bank lookup. The score indicates warning sign density, not confirmed fraud guilt; a low score does not guarantee safety. Message, URL, and QR content is not saved by default. If you enable history it is stored in this browser profile; optional Gemini processing requires explicit consent.', 'footer-tag': 'Defending users before credentials or funds leave their possession.', 'source-link': 'Source code ↗', 'footer-tech': 'ScamSathi 2.0 · Local-First Cyber Intelligence',
      'error-empty': 'Paste a message or link first.', 'error-qr-empty': 'Paste decoded QR content first.', 'error-too-long': 'The content exceeds allowed character limits.', 'error-analysis': 'Could not analyze this content. Please try again.', 'recent-message': 'Message check', 'recent-qr': 'QR check', 'recent-warning': 'threat cues', 'recent-clear': 'clean baseline', 'score-disclaimer': 'Deterministic explainable score based on matching risk indicators. Not an opaque verdict.', 'summary-critical': 'Multiple severe cyber threat indicators matched. Immediate defensive containment recommended.', 'summary-high': 'High risk warning cues identified. Do not disclose credentials, enter UPI PIN, or follow embedded URLs.', 'summary-caution': 'One or more suspicious characteristics detected. Verify independently before proceeding.', 'summary-low': 'No prominent threat vectors matched. Continue practicing standard cyber hygiene.'
    },
    hi: {
      'brand-tag': 'साइबर सुरक्षा इंटेलिजेंस', 'nav-check': 'खतरा जाँच', 'nav-graph': 'धोखाधड़ी ग्राफ', 'nav-campaigns': 'सक्रिय अभियान', 'nav-dossier': 'जाँच रिपोर्ट', 'nav-telemetry': 'ऑडिट लॉग', 'nav-qr': 'QR स्कैनर', 'nav-learn': 'हमले के तरीके', 'local-label': 'सैंडबॉक्स सुरक्षित', 'language-label': 'भाषा', 'track-label': 'साइबर रक्षा इंटेलिजेंस',
      'hero-line-1': 'रोकें।', 'hero-line-2': 'जाँचें।', 'hero-line-3': 'सुरक्षित रहें।', 'hero-intro': 'संदिग्ध संदेश, लिंक या QR पर कार्रवाई करने से पहले खतरे के संकेत जाँचें।', 'hero-cta': 'खतरे की जाँच करें', 'hero-privacy-title': 'स्थानीय जाँच, वैकल्पिक इतिहास', 'hero-privacy-copy': 'सामान्य जाँच स्थानीय रूप से होती है और सामग्री डिफ़ॉल्ट रूप से सहेजी नहीं जाती। Gemini को सामग्री केवल आपकी स्पष्ट सहमति पर भेजी जा सकती है।', 'hero-art-1': 'स्पष्ट संकेत', 'hero-art-2': 'सुरक्षित कदम',
      'session-kicker': 'सत्र टेलीमेट्री', 'session-title': 'सक्रिय जाँच मेट्रिक्स', 'session-note': 'मेट्रिक्स केवल ब्राउज़र की मेमोरी में रहते हैं।', 'metric-checks': 'पूर्ण जाँचें', 'metric-checks-note': 'इस सत्र में जाँचे गए', 'metric-warnings': 'गंभीर / उच्च खतरे', 'metric-warnings-note': 'तत्काल चेतावनी संकेत', 'metric-qr': 'QR / भुगतान जाँच', 'metric-qr-note': 'UPI व विजुअल पेलोड', 'recent-title': 'हालिया खतरा लॉग', 'recent-empty': 'अभी तक कोई जाँच दर्ज नहीं है।',
      'checker-kicker': 'स्क्रीन 01 · खतरा अंतर्ग्रहण', 'checker-title': 'संदिग्ध पेलोड की जाँच करें', 'checker-help': 'संदेश या कॉल का लिखित विवरण पेस्ट करें। लिंक हो तो अलग से जोड़ें।', 'message-label': 'संदेश या कॉल का लिखित विवरण', 'message-limit': 'अधिकतम 4,000 अक्षर', 'try-example': 'उदाहरण संदेश बदलें ↗', 'url-label': 'संदेश में दिया लिंक', 'url-note': 'खोले बिना सुरक्षित जाँच', 'url-placeholder': 'लिंक या डोमेन यहाँ पेस्ट करें', 'analyze-button': 'खतरे के संकेत जाँचें', 'input-local-note': 'इस ब्राउज़र या इसी डिवाइस की Java सेवा में जाँच।', 'before-act': 'सुरक्षा प्रोटोकॉल', 'three-rules': 'साइबर सुरक्षा के तीन नियम', 'rule-otp-title': 'OTP या PIN साझा न करें', 'rule-otp-copy': 'बैंक का कोई भी कर्मचारी कभी OTP नहीं माँगता।', 'rule-upi-title': 'पैसे पाने के लिए PIN नहीं चाहिए', 'rule-upi-copy': 'UPI PIN से केवल आपके खाते से पैसा कटता है।', 'rule-pressure-title': 'दबाव हो तो तुरंत रुकें', 'rule-pressure-copy': 'जल्दबाज़ी में गलती करवाने की चाल को पहचानें।', 'report-link': 'आधिकारिक राष्ट्रीय साइबर अपराध रिपोर्ट पोर्टल ↗',
      'result-kicker': 'स्क्रीन 02 · जाँच का नतीजा', 'score-label': 'संकेत अंक', 'score-note': 'नियमों के अंक · धोखाधड़ी की संभावना नहीं', 'signals-title': 'स्क्रीन 04 · साक्ष्य विवरण', 'actions-title': 'सुरक्षा के अगले कदम', 'copy-result': 'सुरक्षा सारांश कॉपी करें', 'copy-done': 'सुरक्षा सारांश कॉपी हो गया।', 'copy-failed': 'इस ब्राउज़र में कॉपी सुविधा उपलब्ध नहीं है।', 'risk-critical': 'गंभीर चेतावनी संकेत मिले', 'risk-high': 'उच्च जोखिम संकेत मिले', 'risk-caution': 'सावधानी बरतें और पुष्टि करें', 'risk-low': 'कोई गंभीर संकेत नहीं मिला', 'no-signals': 'पहचाना हुआ चेतावनी संकेत नहीं मिला।',
      'qr-kicker': 'QR और भुगतान सुरक्षा', 'qr-title': 'स्कैन या भुगतान करने से पहले जाँचें', 'qr-help': 'कैमरे से स्कैन करें या पाठ पेस्ट करें।', 'open-scanner': 'QR स्कैनर खोलें', 'camera-note': 'कैमरा अनुमति केवल स्कैन शुरू करने पर माँगी जाएगी।', 'qr-paste-label': 'QR से मिला पाठ पेस्ट करें', 'qr-paste-note': 'अधिकतम 4,096 अक्षर', 'qr-placeholder': 'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR', 'inspect-qr': 'QR सामग्री जाँचें', 'upi-unverified': 'QR में दिखा UPI विवरण अप्रमाणित है।', 'qr-result-kicker': 'QR जाँच का नतीजा',
      'learn-kicker': 'केस उदाहरण', 'learn-title': 'दबाव डालने की चाल पहचानें', 'learn-copy': 'उदाहरण उन चेतावनी संकेतों को दिखाते हैं जिन्हें ScamSathi समझा सकता है।', 'what-notice': 'किन बातों पर ध्यान दें',
      'audio-kicker': 'आवाज़ से जुड़े धोखों से सुरक्षा', 'audio-title': 'ऑडियो डीपफेक जाँच उपलब्ध नहीं है', 'audio-copy': 'ScamSathi रिकॉर्डिंग अपलोड या जाँच नहीं करता।',
      'help-kicker': 'अगर खाते से पैसे कट गए हैं', 'help-title': 'जल्दी कार्रवाई करें। बैंक से संपर्क करें और रिपोर्ट करें।', 'help-copy': 'भारत में कॉल करें', 'help-copy-2': 'या भारत सरकार के', 'portal-name': 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल', 'open-portal': 'आधिकारिक पोर्टल खोलें ↗', 'limits-title': 'यह टूल क्या बता सकता है और क्या नहीं', 'limits-copy': 'ScamSathi नियमों के आधार पर संकेत पहचानता है। यह कोई अंधा AI मॉडल नहीं है। संदेश, लिंक और QR सामग्री डिफ़ॉल्ट रूप से सहेजी नहीं जाती। इतिहास चालू करने पर यह इसी ब्राउज़र प्रोफ़ाइल में सहेजी जाती है। Gemini को भेजना केवल आपकी स्पष्ट सहमति से संभव है।', 'footer-tag': 'भुगतान से पहले रुककर जाँचने में मदद के लिए।', 'source-link': 'स्रोत कोड ↗', 'footer-tech': 'ScamSathi 2.0 · लोकल-फर्स्ट साइबर इंटेलिजेंस',
      'error-empty': 'पहले संदेश या लिंक पेस्ट करें।', 'error-qr-empty': 'पहले QR सामग्री पेस्ट करें।', 'error-too-long': 'सामग्री तय अक्षर सीमा से अधिक है।', 'error-analysis': 'सामग्री की जाँच नहीं हो सकी।', 'recent-message': 'संदेश जाँच', 'recent-qr': 'QR जाँच', 'recent-warning': 'चेतावनी संकेत', 'recent-clear': 'साफ़ नतीजा', 'score-disclaimer': 'नियमों पर आधारित स्पष्ट स्कोर।', 'summary-critical': 'कई गंभीर चेतावनी संकेत मिले। स्वतंत्र रूप से पुष्टि करें।', 'summary-high': 'उच्च जोखिम वाले संकेत मिले। विवरण साझा न करें।', 'summary-caution': 'संदिग्ध संकेत मिले। आधिकारिक ऐप से पुष्टि करें।', 'summary-low': 'कोई गंभीर संकेत नहीं मिला।'
    },
    or: {
      'brand-tag': 'ସାଇବର ସୁରକ୍ଷା ଇଣ୍ଟେଲିଜେନ୍ସ', 'nav-check': 'ବିପଦ ଯାଞ୍ଚ', 'nav-graph': 'ଠକେଇ ଗ୍ରାଫ୍', 'nav-campaigns': 'ଅଭିଯାନ', 'nav-dossier': 'ରିପୋର୍ଟ', 'nav-telemetry': 'ଅଡିଟ୍ ଲଗ୍', 'nav-qr': 'QR ସ୍କାନର୍', 'nav-learn': 'ଆକ୍ରମଣ କୌଶଳ', 'local-label': 'ସ୍ୟାଣ୍ଡବକ୍ସ ସୁରକ୍ଷିତ', 'language-label': 'ଭାଷା', 'track-label': 'ସାଇବର ପ୍ରତିରକ୍ଷା',
      'hero-line-1': 'ଅଟକନ୍ତୁ।', 'hero-line-2': 'ଯାଞ୍ଚନ୍ତୁ।', 'hero-line-3': 'ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।', 'hero-intro': 'ସନ୍ଦେହଜନକ ସନ୍ଦେଶ, ଲିଙ୍କ୍ କିମ୍ବା QR ଉପରେ କାର୍ଯ୍ୟ କରିବା ପୂର୍ବରୁ ବିପଦ ସଙ୍କେତ ଯାଞ୍ଚନ୍ତୁ।', 'hero-cta': 'ସନ୍ଦେଶ ଯାଞ୍ଚ', 'hero-privacy-title': 'ସ୍ଥାନୀୟ ଯାଞ୍ଚ, ବିକଳ୍ପ ଇତିହାସ', 'hero-privacy-copy': 'ସାଧାରଣ ଯାଞ୍ଚ ସ୍ଥାନୀୟ ଭାବେ ହୁଏ ଏବଂ ସାମଗ୍ରୀ ପୂର୍ବନିର୍ଦ୍ଧାରିତ ଭାବେ ସଞ୍ଚିତ ହୁଏ ନାହିଁ। ଆପଣଙ୍କ ସ୍ପଷ୍ଟ ସମ୍ମତି ପରେ ମାତ୍ର Geminiକୁ ସାମଗ୍ରୀ ପଠାଯାଇପାରେ।', 'hero-art-1': 'ସ୍ପଷ୍ଟ ସଙ୍କେତ', 'hero-art-2': 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ',
      'session-kicker': 'ସେସନ୍ ଟେଲିମେଟ୍ରି', 'session-title': 'ଲାଇଭ୍ ଯାଞ୍ଚ ମେଟ୍ରିକ୍ସ', 'session-note': 'କେବଳ ବ୍ରାଉଜର ମେମୋରୀରେ ରହେ।', 'metric-checks': 'ସମାପ୍ତ ଯାଞ୍ଚ', 'metric-checks-note': 'ଏହି ସେସନ୍‌ରେ', 'metric-warnings': 'ଗୁରୁତର ବିପଦ', 'metric-warnings-note': 'ତୁରନ୍ତ ସତର୍କ ସଙ୍କେତ', 'metric-qr': 'QR / ଦେୟ ଯାଞ୍ଚ', 'metric-qr-note': 'UPI ପାଠ୍ୟ', 'recent-title': 'ସାମ୍ପ୍ରତିକ ବିପଦ ଲଗ୍', 'recent-empty': 'କୌଣସି ରେକର୍ଡ ନାହିଁ।',
      'checker-kicker': 'ସ୍କ୍ରିନ୍ 01 · ବିପଦ ଗ୍ରହଣ', 'checker-title': 'ସନ୍ଦେହଜନକ ବିଷୟ ଯାଞ୍ଚ କରନ୍ତୁ', 'checker-help': 'ସନ୍ଦେଶ କିମ୍ବା କଲ୍ ବିବରଣୀ ଦିଅନ୍ତୁ।', 'message-label': 'ସନ୍ଦେଶ ପାଠ୍ୟ', 'message-limit': 'ସର୍ବାଧିକ 4,000 ଅକ୍ଷର', 'try-example': 'ନମୁନା ସନ୍ଦେଶ ↗', 'url-label': 'ଲିଙ୍କ୍ କିମ୍ବା ଡୋମେନ୍', 'url-note': 'ନଖୋଲି ସୁରକ୍ଷିତ ଯାଞ୍ଚ', 'url-placeholder': 'ଲିଙ୍କ୍ ଏଠାରେ ଦିଅନ୍ତୁ', 'analyze-button': 'ସଙ୍କେତ ଯାଞ୍ଚନ୍ତୁ', 'input-local-note': 'ସ୍ଥାନୀୟ ନିୟମରେ ଯାଞ୍ଚ।', 'before-act': 'ସୁରକ୍ଷା ନିୟମ', 'three-rules': 'ମନେ ରଖିବାକୁ ତିନୋଟି କଥା', 'rule-otp-title': 'OTP କିମ୍ବା PIN କାହାକୁ କୁହନ୍ତୁ ନାହିଁ', 'rule-otp-copy': 'ବ୍ୟାଙ୍କ କର୍ମଚାରୀ କେବେହେଲେ OTP ମାଗନ୍ତି ନାହିଁ।', 'rule-upi-title': 'ଟଙ୍କା ପାଇବାକୁ PIN ଦରକାର ନାହିଁ', 'rule-upi-copy': 'UPI PIN ଦେଲେ ଆପଣଙ୍କ ଖାତାରୁ ଟଙ୍କା କଟେ।', 'rule-pressure-title': 'କେହି ଚାପ ଦେଲେ ଅଟକନ୍ତୁ', 'rule-pressure-copy': 'ତରବର ହୋଇ କୌଣସି କାର୍ଯ୍ୟ କରନ୍ତୁ ନାହିଁ।', 'report-link': 'ସରକାରୀ ସାଇବର ଅପରାଧ ପୋର୍ଟାଲ୍ ↗',
      'result-kicker': 'ସ୍କ୍ରିନ୍ 02 · ଯାଞ୍ଚ ଫଳ', 'score-label': 'ସଙ୍କେତ ଅଙ୍କ', 'score-note': 'ନିୟମ ଅଙ୍କ · ଠକେଇ ସମ୍ଭାବନା ନୁହେଁ', 'signals-title': 'ସ୍କ୍ରିନ୍ 04 · ପ୍ରମାଣ ବିବରଣୀ', 'actions-title': 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ', 'copy-result': 'ସାରାଂଶ କପି', 'copy-done': 'ସାରାଂଶ କପି ହେଲା।', 'copy-failed': 'କପି ସୁବିଧା ନାହିଁ।', 'risk-critical': 'ଗୁରୁତର ସତର୍କ ସଙ୍କେତ', 'risk-high': 'ଉଚ୍ଚ ବିପଦ ସଙ୍କେତ', 'risk-caution': 'ଅଟକନ୍ତୁ ଓ ଯାଞ୍ଚନ୍ତୁ', 'risk-low': 'କୌଣସି ସ୍ପଷ୍ଟ ସଙ୍କେତ ନାହିଁ', 'no-signals': 'ପରିଚିତ ସତର୍କ ସଙ୍କେତ ମିଳିଲା ନାହିଁ।',
      'qr-kicker': 'QR ଓ ଦେୟ ସୁରକ୍ଷା', 'qr-title': 'ସ୍କାନ୍ କିମ୍ବା ଦେୟ ପୂର୍ବରୁ ଯାଞ୍ଚନ୍ତୁ', 'qr-help': 'କ୍ୟାମେରାରେ ସ୍କାନ୍ କରନ୍ତୁ କିମ୍ବା ପାଠ୍ୟ ଦିଅନ୍ତୁ।', 'open-scanner': 'QR ସ୍କାନର୍ ଖୋଲନ୍ତୁ', 'camera-note': 'କ୍ୟାମେରା ଅନୁମତି ଆବଶ୍ୟକ।', 'qr-paste-label': 'QR ପାଠ୍ୟ ଦିଅନ୍ତୁ', 'qr-paste-note': 'ସର୍ବାଧିକ 4,096 ଅକ୍ଷର', 'qr-placeholder': 'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR', 'inspect-qr': 'QR ଯାଞ୍ଚ କରନ୍ତୁ', 'upi-unverified': 'UPI ବିବରଣୀ ଅଯାଞ୍ଚିତ।', 'qr-result-kicker': 'QR ଯାଞ୍ଚ ଫଳ',
      'learn-kicker': 'ଉଦାହରଣ', 'learn-title': 'ଚାପ ପକାଇବା କୌଶଳ', 'learn-copy': 'ନମୁନା ସତର୍କ ସଙ୍କେତ।', 'what-notice': 'କ’ଣ ଧ୍ୟାନ ଦେବେ',
      'audio-kicker': 'ସ୍ୱର ଠକେଇ ସୁରକ୍ଷା', 'audio-title': 'ଅଡିଓ ଡିପ୍‌ଫେକ୍ ଯାଞ୍ଚ ଉପଲବ୍ଧ ନାହିଁ', 'audio-copy': 'ScamSathi ରେକର୍ଡିଂ ଯାଞ୍ଚ କରେ ନାହିଁ।',
      'help-kicker': 'ଯଦି ଖାତାରୁ ଟଙ୍କା କଟିଯାଇଛି', 'help-title': 'ଶୀଘ୍ର କାର୍ଯ୍ୟ କରନ୍ତୁ।', 'help-copy': 'ଭାରତରେ ଫୋନ୍ କରନ୍ତୁ', 'help-copy-2': 'କିମ୍ବା ସରକାରୀ', 'portal-name': 'ସାଇବର ଅପରାଧ ରିପୋର୍ଟ ପୋର୍ଟାଲ୍', 'open-portal': 'ପୋର୍ଟାଲ୍ ଖୋଲନ୍ତୁ ↗', 'limits-title': 'ସୀମା ଓ ନିୟମ', 'limits-copy': 'ScamSathi ନିୟମ ଆଧାରରେ ଯାଞ୍ଚ କରେ। ସନ୍ଦେଶ, ଲିଙ୍କ୍ ଓ QR ବିଷୟବସ୍ତୁ ପୂର୍ବନିର୍ଦ୍ଧାରିତ ଭାବେ ସଞ୍ଚୟ ହୁଏ ନାହିଁ। ଇତିହାସ ଚାଲୁ କଲେ ଏହା ଏହି ବ୍ରାଉଜର ପ୍ରୋଫାଇଲ୍‌ରେ ସଞ୍ଚୟ ହୁଏ। Geminiକୁ ପଠାଇବା ପାଇଁ ଆପଣଙ୍କ ସ୍ପଷ୍ଟ ସମ୍ମତି ଆବଶ୍ୟକ।', 'footer-tag': 'ଦେୟ ପୂର୍ବରୁ ଅଟକି ଯାଞ୍ଚ କରନ୍ତୁ।', 'source-link': 'ସୋର୍ସ କୋଡ୍ ↗', 'footer-tech': 'ScamSathi 2.0 · ସାଇବର ଇଣ୍ଟେଲିଜେନ୍ସ',
      'error-empty': 'ସନ୍ଦେଶ କିମ୍ବା ଲିଙ୍କ୍ ଦିଅନ୍ତୁ।', 'error-qr-empty': 'QR ପାଠ୍ୟ ଦିଅନ୍ତୁ।', 'error-too-long': 'ଅକ୍ଷର ସୀମା ଅଧିକ।', 'error-analysis': 'ଯାଞ୍ଚ ହୋଇପାରିଲା ନାହିଁ।', 'recent-message': 'ସନ୍ଦେଶ ଯାଞ୍ଚ', 'recent-qr': 'QR ଯାଞ୍ଚ', 'recent-warning': 'ସତର୍କ ସଙ୍କେତ', 'recent-clear': 'ସଫା', 'score-disclaimer': 'ନିୟମ ଆଧାରିତ ସ୍କୋର।', 'summary-critical': 'ଗୁରୁତର ସତର୍କ ସଙ୍କେତ।', 'summary-high': 'ଉଚ୍ଚ ବିପଦ। ତଥ୍ୟ ଦିଅନ୍ତୁ ନାହିଁ।', 'summary-caution': 'ସତର୍କତା ଆବଶ୍ୟକ।', 'summary-low': 'ବିପଦ ସଙ୍କେତ ନାହିଁ।'
    }
  };

  const SIGNALS = {
    hi: {
      secret: ['गुप्त कोड या क्रेडेंशियल की माँग', 'OTP, PIN, CVV या पासवर्ड साझा करने से खाते पर साइबर धोखेबाज का नियंत्रण हो सकता है। यह कभी न बताएं।'],
      receive_fee: ['पैसे पाने के लिए पहले शुल्क की माँग', 'रिफंड या लॉटरी के लिए पहले पैसे माँगना धोखाधड़ी का सामान्य संकेत है।'],
      remote_access: ['रिमोट एक्सेस या अज्ञात APK की माँग', 'AnyDesk, TeamViewer या अज्ञात ऐप आपके बैंकिंग संदेश और स्क्रीन की जानकारी चुरा सकते हैं।'],
      pressure: ['जल्दबाज़ी, धमकी या भय का निर्माण', 'तुरंत खाता बंद होने या कानूनी कार्रवाई का डर दिखाकर सही पुष्टि करने से रोका जा रहा है।'],
      bait: ['प्रलोभन या जल्दी करने का दबाव', 'समीक्षा या सत्यापन से पहले जल्दबाज़ी में कदम उठाने का दबाव।'],
      payment_direction: ['UPI कलेक्ट से पैसे कटने का खतरा', 'कलेक्ट रिक्वेस्ट या QR से पैसे मिलते नहीं, बल्कि आपके खाते से कटते हैं।'],
      malformed_url: ['संदिग्ध या विकृत लिंक संरचना', 'यह पता सामान्य वेब डोमेन नहीं लगता। संदेश के लिंक पर क्लिक न करें।'],
      unencrypted: ['असुरक्षित HTTP कनेक्शन', 'इस लिंक पर सुरक्षित एन्क्रिप्शन नहीं है। यहाँ कोई गोपनीय जानकारी न भरें।'],
      ip_host: ['डोमेन के बदले सीधा IP पता', 'संख्यात्मक IP पते से आधिकारिक बैंक या संस्था की पहचान नहीं होती।'],
      shortener: ['शॉर्टनर लिंक असली पता छुपाता है', 'bit.ly या t.co जैसे लिंक असली गंतव्य छुपाते हैं।'],
      brand_mismatch: ['ब्रांड का नाम आधिकारिक डोमेन से अलग', 'लिंक में परिचित बैंक का नाम तो है लेकिन मुख्य डोमेन फर्जी है।'],
      lookalike: ['भ्रामक स्पेलिंग वाला फ़र्ज़ी डोमेन', 'प्रसिद्ध ब्रांड से मिलती-जुलती गलत स्पेलिंग वाला पता।']
    },
    or: {
      secret: ['ଗୁପ୍ତ କୋଡ୍ କିମ୍ବା ପାସୱାର୍ଡ ମାଗିବା', 'OTP, PIN, CVV କିମ୍ବା ପାସୱାର୍ଡ କହିଦେଲେ ଆପଣଙ୍କ ଖାତାର ନିୟନ୍ତ୍ରଣ ଅନ୍ୟଙ୍କ ହାତକୁ ଯାଇପାରେ। ଏହା କାହାକୁ କୁହନ୍ତୁ ନାହିଁ।'],
      receive_fee: ['ଟଙ୍କା ପାଇବାକୁ ପ୍ରଥମେ ଦେୟ ମାଗିବା', 'ରିଫଣ୍ଡ କିମ୍ବା ପୁରସ୍କାର ପାଇଁ ପ୍ରଥମେ ଦେୟ ମାଗିବା ଠକେଇର ସାଧାରଣ ସଙ୍କେତ। UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଏ।'],
      remote_access: ['ରିମୋଟ୍ ଆକ୍ସେସ୍ କିମ୍ବା ଅଜଣା ଆପ୍ ମାଗିବା', 'ରିମୋଟ୍ କଣ୍ଟ୍ରୋଲ୍ ଟୁଲ୍, ସ୍କ୍ରିନ୍ ଶେୟାର୍ କିମ୍ବା ଅଜଣା APK ଆପଣଙ୍କ ବାର୍ତ୍ତା ଓ ବ୍ୟାଙ୍କ ସୂଚନା ଦେଖାଇପାରେ।'],
      pressure: ['ତରବର, ଧମକ କିମ୍ବା କର୍ତ୍ତୃପକ୍ଷଙ୍କ ଭୟ', 'ଠକମାନେ ଯାଞ୍ଚ ବନ୍ଦ କରିବାକୁ ଭୟ ସୃଷ୍ଟି କରନ୍ତି। ନିଜେ ଖୋଜିଥିବା ନମ୍ବରରେ ସଂସ୍ଥାକୁ ଯୋଗାଯୋଗ କରନ୍ତୁ।'],
      bait: ['ତରବରିଆ କାର୍ଯ୍ୟ କରିବାକୁ କୁହାଯାଇଛି', 'ପଠାଇଥିବା ବ୍ୟକ୍ତି କିମ୍ବା ଲିଙ୍କ୍ ଯାଞ୍ଚ ପୂର୍ବରୁ କାର୍ଯ୍ୟ କରିବାକୁ ଚାପ ଦିଆଯାଉଛି।'],
      payment_direction: ['UPI ଦେୟ ଦିଗ ନେଇ ଚାଲ୍ ହୋଇପାରେ', 'କଲେକ୍ଟ ଅନୁରୋଧ ଗ୍ରହଣ କିମ୍ବା UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଇପାରେ।'],
      malformed_url: ['ଲିଙ୍କ୍ ଠିକଣା ଅସାଧାରଣ ଦେଖାଯାଉଛି', 'ଏହି ଠିକଣାକୁ ସାଧାରଣ ୱେବ୍ ଡୋମେନ୍ ଭାବେ ପଢ଼ିହେଲା ନାହିଁ।'],
      unencrypted: ['ଲିଙ୍କ୍‌ରେ HTTPS ନାହିଁ', 'ଏହି ଲିଙ୍କ୍‌ରେ ସୁରକ୍ଷିତ HTTPS ସଂଯୋଗ ନାହିଁ।'],
      ip_host: ['ଲିଙ୍କ୍‌ରେ ସଂଖ୍ୟାତ୍ମକ ଠିକଣା ଅଛି', 'ପରିଚିତ ସଂସ୍ଥା ଡୋମେନ୍ ପରିବର୍ତ୍ତେ ସଂଖ୍ୟା ଠିକଣା ଅସାଧାରଣ।'],
      shortener: ['ସଂକ୍ଷିପ୍ତ ଲିଙ୍କ୍ ଗନ୍ତବ୍ୟ ଲୁଚାଏ', 'ଅସଲି ଗନ୍ତବ୍ୟ ଦେଖାଯାଉନାହିଁ।'],
      brand_mismatch: ['ବ୍ରାଣ୍ଡ୍ ନାମ ଅସଲି ଡୋମେନ୍‌ରେ ନାହିଁ', 'ଠିକଣାରେ ପରିଚିତ ବ୍ରାଣ୍ଡ୍ ନାମ ଅଛି, କିନ୍ତୁ ଡୋମେନ୍ ଅଲଗା।'],
      lookalike: ['ଡୋମେନ୍ ପରିଚିତ ବ୍ରାଣ୍ଡ୍ ସହ ମିଳୁନାହିଁ', 'ସନ୍ଦେହଜନକ ବନାନ।']
    }
  };

  const ACTIONS = {
    hi: {
      otp: 'OTP, PIN, CVV, पासवर्ड या स्क्रीन शेयर किसी से साझा न करें।',
      verify: 'संस्था से उसके आधिकारिक ऐप या खुद खोजे गए नंबर पर संपर्क करें।',
      payment: 'UPI PIN से पैसा कटता है। पुष्टि करने से पहले राशि व प्राप्तकर्ता जांचें।',
      link: 'संदेश में दिया लिंक न खोलें। स्वतंत्र रूप से वेबसाइट खोजें।',
      report: 'पैसे कटने पर बैंक से संपर्क करें और 1930 पर तत्काल शिकायत दर्ज करें।',
      uncertain: 'संदेह होने पर कोई भी कदम उठाने से पहले किसी विश्वसनीय व्यक्ति से सलाह लें।',
      qr: 'स्वतंत्र पुष्टि होने तक QR से भुगतान या लिंक न खोलें।'
    },
    or: {
      otp: 'OTP, PIN, CVV, ପାସୱାର୍ଡ କିମ୍ବା ସ୍କ୍ରିନ୍ ଆକ୍ସେସ୍ କାହାକୁ ଦିଅନ୍ତୁ ନାହିଁ।',
      verify: 'ନିଜେ ଖୋଜିଥିବା ନମ୍ବର କିମ୍ବା ଆପ୍‌ରେ ସଂସ୍ଥା ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।',
      payment: 'UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଏ। ଅନୁମୋଦନ ପୂର୍ବରୁ ଗ୍ରହୀତା ଓ ରାଶି ପଢ଼ନ୍ତୁ।',
      link: 'ସନ୍ଦେଶର ଲିଙ୍କ୍ ଖୋଲନ୍ତୁ ନାହିଁ। ଗନ୍ତବ୍ୟ ଅଲଗାରେ ଯାଞ୍ଚନ୍ତୁ।',
      report: 'ଟଙ୍କା ହରାଇଥିଲେ ବ୍ୟାଙ୍କକୁ ଯୋଗାଯୋଗ କରନ୍ତୁ ଓ ଭାରତରେ 1930 କୁ ଶୀଘ୍ର ଫୋନ୍ କରନ୍ତୁ।',
      uncertain: 'ନିଶ୍ଚିତ ନହେଲେ କାର୍ଯ୍ୟ ପୂର୍ବରୁ ଭରସାଯୋଗ୍ୟ ବ୍ୟକ୍ତିଙ୍କୁ ପଚାରନ୍ତୁ।',
      qr: 'ଅଲଗାରେ ଯାଞ୍ଚ ନକରିବା ପର୍ଯ୍ୟନ୍ତ QR ଦେୟ କିମ୍ବା ଲିଙ୍କ୍ ଖୋଲନ୍ତୁ ନାହିଁ।'
    }
  };

  const EXAMPLES = {
    en: [
      {
        tag: 'BANK KYC HARVESTING',
        quote: 'Your bank account will be suspended today. Click here to verify your documents and share OTP with our verification officer.',
        explain: 'Artificial panic combined with a request to reveal private verification secrets.',
        url: 'https://bank.example/login'
      },
      {
        tag: 'ELECTRICITY CUTOFF EXTORTION',
        quote: 'Dear Consumer, your electricity power supply will be disconnected tonight at 9:30 PM due to previous month unpaid bill. Call electricity officer immediately.',
        explain: 'Urgent cutoff threat coercing victims to dial a fraudulent helpline or install a malicious APK.',
        url: 'https://utility.example/notice'
      },
      {
        tag: 'UPI REVERSE REFUND TRAP',
        quote: 'Approve this UPI collect request and enter your UPI PIN to receive ₹4,500 refund in your GooglePay account.',
        explain: 'Deceptive instruction: entering a UPI PIN strictly debits your account instead of crediting.',
        url: ''
      }
    ],
    hi: [
      {
        tag: 'फर्जी बैंक KYC चेतावनी',
        quote: 'आपका बैंक खाता आज बंद हो जाएगा। तुरंत दस्तावेज सत्यापित करें और हमारे अधिकारी से अपना OTP साझा करें।',
        explain: 'खाता बंद होने का डर और गोपनीय कोड मांगने की साजिश।',
        url: 'https://bank.example/login'
      },
      {
        tag: 'बिजली बिल कटने की धमकी',
        quote: 'प्रिय उपभोक्ता, आज रात 9:30 बजे आपका बिजली कनेक्शन काट दिया जाएगा। तुरंत बिजली अधिकारी से संपर्क करें।',
        explain: 'रात में बिजली कटने की धमकी देकर फर्जी नंबर पर कॉल कराने का प्रयास।',
        url: 'https://utility.example/notice'
      },
      {
        tag: 'UPI रिफंड झांसा',
        quote: 'रिफंड पाने के लिए यह UPI कलेक्ट रिक्वेस्ट स्वीकार करें और अपना UPI PIN दर्ज करें।',
        explain: 'UPI PIN डालने से पैसा आता नहीं बल्कि आपके खाते से कट जाता है।',
        url: ''
      }
    ],
    or: [
      {
        tag: 'ନକଲି ବ୍ୟାଙ୍କ କେୱାଇସି ଚେତାବନୀ',
        quote: 'ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତା ଆଜି ବନ୍ଦ ହୋଇଯିବ। ଦଲିଲ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ଅଧିକାରୀଙ୍କୁ OTP କୁହନ୍ତୁ।',
        explain: 'ଖାତା ବନ୍ଦ ହେବାର ଭୟ ଓ ଗୁପ୍ତ କୋଡ୍ ମାଗିବା।',
        url: 'https://bank.example/login'
      },
      {
        tag: 'ବିଦ୍ୟୁତ୍ କାଟ ଧମକ',
        quote: 'ଆଜି ରାତି 9:30 ରେ ଆପଣଙ୍କ ବିଜୁଳି ସଂଯୋଗ କାଟି ଦିଆଯିବ। ତୁରନ୍ତ ବିଜୁଳି ଅଫିସରଙ୍କୁ ଫୋନ୍ କରନ୍ତୁ।',
        explain: 'ଭୟ ସୃଷ୍ଟି କରି ନକଲି ନମ୍ବରରେ ଫୋନ୍ କରାଇବା।',
        url: 'https://utility.example/notice'
      },
      {
        tag: 'UPI ରିଫଣ୍ଡ ଠକେଇ',
        quote: 'ଟଙ୍କା ପାଇବାକୁ ଏହି UPI କଲେକ୍ଟ ଅନୁରୋଧ ଗ୍ରହଣ କରି UPI PIN ଦିଅନ୍ତୁ।',
        explain: 'UPI PIN ଦେଲେ ଟଙ୍କା ଆପଣଙ୍କ ଖାତାରୁ ଯାଏ।',
        url: ''
      }
    ]
  };

  // Synthetic examples only. No live campaign or IOC claims are made here.
  const CAMPAIGN_FEED = [
    {
      id: 'EXAMPLE 01',
      sector: 'utilities',
      title: 'Urgent utility bill message',
      desc: 'Synthetic example: a message claims service will stop soon and asks the recipient to call a number or open a link.',
      severity: 'Pattern only', activeSince: 'No monitoring', impactEst: 'No incident count',
      vector: 'SMS or messaging app', iocs: 'No indicators included.', demoTag: 'SYNTHETIC EXAMPLE'
    },
    {
      id: 'EXAMPLE 02',
      sector: 'banking',
      title: 'Account verification pressure',
      desc: 'Synthetic example: an unsolicited message pressures someone to update personal or banking details through an embedded link.',
      severity: 'Pattern only', activeSince: 'No monitoring', impactEst: 'No incident count',
      vector: 'SMS or email', iocs: 'No indicators included.', demoTag: 'SYNTHETIC EXAMPLE'
    },
    {
      id: 'EXAMPLE 03',
      sector: 'law',
      title: 'Authority impersonation pressure',
      desc: 'Synthetic example: a caller claims to represent an authority, discourages independent contact, and demands secrecy or payment.',
      severity: 'Pattern only', activeSince: 'No monitoring', impactEst: 'No incident count',
      vector: 'Call or video call', iocs: 'No indicators included.', demoTag: 'SYNTHETIC EXAMPLE'
    },
    {
      id: 'EXAMPLE 04',
      sector: 'upi',
      title: 'QR code presented as a refund',
      desc: 'Synthetic example: someone says scanning a code or approving a request is required to receive money.',
      severity: 'Pattern only', activeSince: 'No monitoring', impactEst: 'No incident count',
      vector: 'QR code or payment request', iocs: 'No indicators included.', demoTag: 'SYNTHETIC EXAMPLE'
    },
    {
      id: 'EXAMPLE 05',
      sector: 'banking',
      title: 'Unsolicited task or job offer',
      desc: 'Synthetic example: a stranger offers easy earnings, then asks for a deposit, fee, or prepaid task balance.',
      severity: 'Pattern only', activeSince: 'No monitoring', impactEst: 'No incident count',
      vector: 'Social or messaging app', iocs: 'No indicators included.', demoTag: 'SYNTHETIC EXAMPLE'
    }
  ];

  function t(key) {
    return (UI[language] && UI[language][key]) || UI.en[key] || key;
  }

  function applyLanguage() {
    const strings = UI[language] || UI.en;
    document.documentElement.lang = language;
    $$('[data-i18n]').forEach(node => {
      const value = strings[node.dataset.i18n] || UI.en[node.dataset.i18n];
      if (value) node.textContent = value;
    });
    $$('[data-i18n-placeholder]').forEach(node => {
      const key = node.dataset.i18nPlaceholder;
      node.placeholder = strings[key] || UI.en[key] || '';
    });
    const select = $('#languageSelect');
    if (select) select.value = language;
    showCase();
    if (results.message) renderResult(results.message, $('#messageResult'));
    if (results.qr) renderResult(results.qr, $('#qrResult'));
    if (selectedSafetyScenario) renderSafetyScenario(selectedSafetyScenario);
    renderActivity();
    renderCampaigns('all');
  }

  function localizeSignal(signal) {
    const signalLanguage = language === 'hi' ? 'hi' : language === 'or' ? 'or' : 'en';
    const translated = SIGNALS[signalLanguage] && SIGNALS[signalLanguage][signal.id];
    return translated ? { ...signal, label: translated[0], detail: translated[1] } : signal;
  }

  function localizeAction(action, qr = false) {
    if (language === 'en') return action;
    const map = ACTIONS[language] || ACTIONS.hi;
    if (/Do not share an OTP|Never share an OTP/i.test(action)) return map.otp;
    if (/Contact the organization using a number/i.test(action)) return map.verify;
    if (/A UPI PIN authorizes/i.test(action)) return map.payment;
    if (/Do not open the link/i.test(action)) return map.link;
    if (/If money was lost/i.test(action)) return map.report;
    if (/When unsure/i.test(action)) return map.uncertain;
    if (/Do not pay or open anything from the QR/i.test(action)) return map.qr;
    if (/^UPI payee address/i.test(action)) {
      return action.replace('UPI payee address (unverified QR data):', language === 'hi' ? 'UPI प्राप्तकर्ता पता (QR में अप्रमाणित):' : 'UPI ପ୍ରାପ୍ତକର୍ତ୍ତା ଠିକଣା (ଅଯାଞ୍ଚିତ):');
    }
    if (/^Payee display name/i.test(action)) {
      return action.replace('Payee display name (unverified QR data):', language === 'hi' ? 'प्राप्तकर्ता का नाम (अप्रमाणित):' : 'ପ୍ରାପ୍ତକର୍ତ୍ତା ନାମ (ଅଯାଞ୍ଚିତ):');
    }
    if (/^Encoded amount/i.test(action)) {
      return action.replace('Encoded amount:', language === 'hi' ? 'दी गई राशि:' : 'ଥିବା ରାଶି:');
    }
    return action;
  }

  function scrollTo(node) {
    if (!node) return;
    node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function getClassification(level, signals = []) {
    const ids = new Set(signals.map(s => s.id));
    if (ids.has('upi_qr') || ids.has('payment_direction')) return 'UPI payment instruction cues';
    if (ids.has('brand_mismatch') || ids.has('lookalike')) return 'Lookalike URL indicators';
    if (ids.has('secret') && ids.has('pressure')) return 'Credential and urgency cues';
    if (ids.has('receive_fee')) return 'Upfront payment request cues';
    if (ids.has('remote_access')) return 'Remote access or app install cues';
    if (level === 'critical') return 'High-Priority Threat Vector';
    if (level === 'high') return 'Suspicious Smishing Payload';
    if (level === 'caution') return 'Unverified External Ingestion';
    return 'Low Risk / Clean Baseline';
  }

  const STAGE_SIGNAL_IDS = {
    identity: ['brand_mismatch', 'lookalike', 'idn', 'secret'],
    pressure: ['pressure', 'bait', 'unencrypted', 'shortener'],
    extraction: ['payment_direction', 'receive_fee', 'remote_access', 'secret', 'upi_qr']
  };

  const STAGE_TITLES = {
    en: { identity: 'Identity or trust cue', pressure: 'Pressure cue', extraction: 'Request for code, money, or access' },
    hi: { identity: 'पहचान या भरोसे का संकेत', pressure: 'दबाव का संकेत', extraction: 'कोड, पैसे या पहुँच का अनुरोध' },
    or: { identity: 'ପରିଚୟ କିମ୍ବା ବିଶ୍ୱାସ ସଙ୍କେତ', pressure: 'ଚାପର ସଙ୍କେତ', extraction: 'କୋଡ୍, ଟଙ୍କା କିମ୍ବା ପ୍ରବେଶ ଅନୁରୋଧ' }
  };

  const SAFETY_GUIDANCE = {
    en: {
      clicked: ['Clicked a suspicious link', [
        'Close the page. Do not enter more information, download a file, or approve a prompt.',
        'If you entered a password or payment detail, contact the relevant provider using its official app or a number you find independently.',
        'If you installed an app or shared a code, follow the matching steps below and use a trusted device for account recovery.'
      ]],
      otp: ['Shared an OTP or verification code', [
        'Contact your bank or service provider immediately through its official app or independently verified number. Ask it to secure the affected account or payment channel.',
        'From a trusted device, change affected credentials and sign out other sessions where possible.',
        'If money moved or account access changed, call 1930 promptly and report at cybercrime.gov.in. Keep transaction references; never share another OTP.'
      ]],
      credentials: ['Shared banking credentials', [
        'Call your bank using the official app, card, or bank website reached independently. Ask it to block affected access and review transactions.',
        'From a trusted device, change the password and any reused password. End other sessions if the provider offers that option.',
        'Report any unauthorized transaction to the bank immediately and call 1930 if financial cyber fraud occurred.'
      ]],
      transfer: ['Transferred money', [
        'Call your bank and payment provider now using an official channel. Ask them to register the fraud and attempt to stop or trace the transfer.',
        'Call India’s financial cyber fraud helpline 1930 promptly, then submit the report at cybercrime.gov.in. Keep the transaction reference, amount, time, and recipient details.',
        'Do not pay anyone who promises guaranteed recovery. Reporting does not guarantee that funds can be recovered.'
      ]],
      app: ['Installed an unknown application', [
        'If you suspect remote access or unusual device control, disconnect the device from the internet and do not use it to change banking passwords.',
        'Use another trusted device to contact your bank and secure accounts that were accessible from the affected phone.',
        'Remove the app and revoke accessibility, device administrator, or screen-sharing access if you can do so safely. Ask a trusted technician for help if control persists.'
      ]],
      qr: ['Scanned a suspicious QR code', [
        'Do not approve a payment, enter a UPI PIN, or open a destination from the code. A UPI PIN authorizes a debit; it is not required to receive money.',
        'If you approved a payment or see an unexpected debit, follow the money-transfer steps and contact your bank immediately.',
        'Report the code to the messaging or service platform. Verify any payee and amount in your official payment app before approving.'
      ]],
      received: ['Only received a suspicious message', [
        'Do not reply, click links, call numbers in the message, scan its code, or share a verification code.',
        'Check the claim using the organization’s official app or contact details you find independently.',
        'Use your messaging or phone provider’s report and block controls. If you already acted, choose the matching scenario above.'
      ]]
    },
    hi: {
      clicked: ['संदिग्ध लिंक खोला', [
        'पेज बंद करें। आगे जानकारी न भरें, फ़ाइल डाउनलोड न करें और कोई अनुमति स्वीकार न करें।',
        'यदि आपने पासवर्ड या भुगतान विवरण दिया है, तो संबंधित सेवा से उसके आधिकारिक ऐप या स्वयं खोजे गए नंबर से संपर्क करें।',
        'ऐप इंस्टॉल किया या कोड साझा किया हो तो नीचे दिए उपयुक्त चरण अपनाएँ और खाता ठीक करने के लिए सुरक्षित डिवाइस इस्तेमाल करें।'
      ]],
      otp: ['OTP या सत्यापन कोड साझा किया', [
        'बैंक या सेवा प्रदाता के आधिकारिक ऐप या स्वयं सत्यापित नंबर से तुरंत संपर्क करें। प्रभावित खाते या भुगतान माध्यम को सुरक्षित करने को कहें।',
        'सुरक्षित डिवाइस से प्रभावित पासवर्ड बदलें और जहाँ संभव हो अन्य सत्र बंद करें।',
        'पैसा गया हो या खाते का नियंत्रण बदला हो तो 1930 पर शीघ्र कॉल करें और cybercrime.gov.in पर रिपोर्ट करें। कोई नया OTP साझा न करें।'
      ]],
      credentials: ['बैंकिंग पासवर्ड साझा किया', [
        'आधिकारिक ऐप, कार्ड या स्वयं खोजी गई बैंक वेबसाइट के माध्यम से बैंक को कॉल करें। प्रभावित पहुँच रोकने और लेनदेन जाँचने को कहें।',
        'सुरक्षित डिवाइस से पासवर्ड बदलें; वही पासवर्ड दूसरी जगह हो तो वहाँ भी बदलें। उपलब्ध हो तो अन्य सत्र बंद करें।',
        'अनधिकृत लेनदेन की सूचना बैंक को तुरंत दें। वित्तीय साइबर धोखाधड़ी हुई हो तो 1930 पर कॉल करें।'
      ]],
      transfer: ['पैसे भेज दिए', [
        'अभी बैंक और भुगतान सेवा को उनके आधिकारिक माध्यम से कॉल करें। धोखाधड़ी दर्ज कर भुगतान रोकने या खोजने का अनुरोध करें।',
        'भारत की वित्तीय साइबर धोखाधड़ी हेल्पलाइन 1930 पर शीघ्र कॉल करें, फिर cybercrime.gov.in पर रिपोर्ट दें। लेनदेन संदर्भ, राशि, समय और प्राप्तकर्ता विवरण रखें।',
        'गारंटीड पैसे वापस दिलाने का वादा करने वाले को भुगतान न करें। रिपोर्ट करने से पैसे वापस मिलने की गारंटी नहीं होती।'
      ]],
      app: ['अज्ञात ऐप इंस्टॉल किया', [
        'रिमोट एक्सेस या असामान्य नियंत्रण का संदेह हो तो डिवाइस को इंटरनेट से काटें। उसी डिवाइस से बैंकिंग पासवर्ड न बदलें।',
        'दूसरे सुरक्षित डिवाइस से बैंक से संपर्क करें और प्रभावित फोन पर उपलब्ध खातों को सुरक्षित करें।',
        'यदि सुरक्षित हो तो ऐप हटाएँ और accessibility, device administrator या screen-sharing पहुँच रद्द करें। नियंत्रण बना रहे तो विश्वसनीय तकनीशियन से मदद लें।'
      ]],
      qr: ['संदिग्ध QR कोड स्कैन किया', [
        'भुगतान मंज़ूर न करें, UPI PIN न डालें और कोड से खुले पते पर न जाएँ। UPI PIN से पैसा जाता है; पैसा पाने के लिए इसकी ज़रूरत नहीं होती।',
        'भुगतान मंज़ूर किया हो या अनजान कटौती दिखे तो पैसे भेजने वाले चरण अपनाएँ और बैंक से तुरंत संपर्क करें।',
        'कोड की रिपोर्ट मैसेजिंग या सेवा ऐप में करें। मंज़ूरी से पहले आधिकारिक भुगतान ऐप में प्राप्तकर्ता और राशि जाँचें।'
      ]],
      received: ['केवल संदिग्ध संदेश मिला', [
        'जवाब न दें, लिंक न खोलें, संदेश के नंबर पर कॉल न करें, कोड स्कैन न करें और सत्यापन कोड साझा न करें।',
        'दावे की जाँच संस्था के आधिकारिक ऐप या स्वयं खोजे गए संपर्क से करें।',
        'फोन या मैसेजिंग सेवा के रिपोर्ट और ब्लॉक विकल्प इस्तेमाल करें। यदि कार्रवाई कर चुके हैं तो ऊपर उपयुक्त स्थिति चुनें।'
      ]]
    }
  };

  function renderEvidencePreview(container, data, target, selectedEvidence = null) {
    if (!container) return;
    container.replaceChildren();
    const allEvidence = Array.isArray(data.evidence) ? data.evidence : [];
    const sourceEvidence = selectedEvidence ? [selectedEvidence] : allEvidence;
    if (!sourceEvidence.length) return;
    const active = sourceEvidence.find(item => getEvidenceSourceText(item.source, target) !== null);
    const sourceText = active ? getEvidenceSourceText(active.source, target) : null;
    const caption = document.createElement('p');
    caption.className = 'micro';
    if (sourceText === null || sourceText === '') {
      caption.textContent = 'Source text is not available in this view; the exact API evidence snippet is listed below.';
      container.append(caption);
      return;
    }
    caption.textContent = selectedEvidence ? `Submitted ${selectedEvidence.source} content · selected evidence` : `Submitted ${active.source} content · observed matches highlighted`;
    container.append(caption);
    const line = document.createElement('div');
    line.className = 'evidence-source-text';
    const ranges = sourceEvidence
      .filter(item => item.source === active.source && Number.isInteger(item.start) && Number.isInteger(item.end))
      .map(item => ({
        start: Array.from(sourceText).slice(0, item.start).join('').length,
        end: Array.from(sourceText).slice(0, item.end).join('').length
      }))
      .filter(range => range.end > range.start && range.start < sourceText.length)
      .sort((a, b) => a.start - b.start || a.end - b.end);
    let cursor = 0;
    ranges.forEach(range => {
      const start = Math.max(cursor, range.start);
      const end = Math.min(sourceText.length, range.end);
      if (start > cursor) line.append(document.createTextNode(sourceText.slice(cursor, start)));
      if (end > start) {
        const mark = document.createElement('mark');
        mark.textContent = sourceText.slice(start, end);
        line.append(mark);
        cursor = end;
      }
    });
    if (cursor < sourceText.length) line.append(document.createTextNode(sourceText.slice(cursor)));
    container.append(line);
  }

  function getEvidenceSourceText(source, target) {
    if (source === 'message') return ($('#message')?.value || '');
    if (source === 'url') return ($('#url')?.value || '');
    if (source === 'qr') return ($('#qrPayload')?.value || '');
    if (target?.id === 'qrResult' && source === 'qr_payload') return ($('#qrPayload')?.value || '');
    return null;
  }

  function renderEvidencePanel(data, target) {
    const panel = $('[data-evidence-panel]', target);
    if (!panel) return;
    const list = $('[data-evidence-items]', panel);
    const preview = $('[data-evidence-preview]', panel);
    const search = $('[data-evidence-search]', panel);
    const evidence = Array.isArray(data.evidence) ? data.evidence : [];
    const signals = Array.isArray(data.signals) ? data.signals : [];
    const evidenceById = new Map(evidence.map(item => [item.id, item]));
    const linkedSignals = new Map();
    signals.forEach(signal => (signal.evidence_ids || []).forEach(id => {
      if (!linkedSignals.has(id)) linkedSignals.set(id, []);
      linkedSignals.get(id).push(signal);
    }));
    const summary = $('[data-confidence-summary]', panel);
    if (summary) summary.textContent = evidence.length
      ? 'Confidence labels describe match type; they are not probabilities.'
      : 'No source-linked evidence was returned by the active analyzer.';

    const renderList = query => {
      list.replaceChildren();
      const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
      renderEvidencePreview(preview, data, target);
      if (!evidence.length) {
        const note = document.createElement('p');
        note.className = 'evidence-empty';
        note.textContent = data.analysisSource === 'browser_rules'
          ? 'The browser fallback returned rule signals but no source offsets. Exact suspicious phrases cannot be highlighted in this result.'
          : 'This analysis returned no evidence items. No phrases are highlighted.';
        list.append(note);
        signals.forEach(signal => {
          const item = document.createElement('article');
          item.className = 'evidence-item';
          const title = document.createElement('h4');
          title.textContent = localizeSignal(signal).label;
          const body = document.createElement('p');
          body.textContent = `Rule interpretation only: ${localizeSignal(signal).detail || 'The analyzer reported a matching rule.'} This does not verify intent or maliciousness.`;
          const score = document.createElement('p');
          score.textContent = `Rule score contribution: +${Number(signal.points) || 0} points. These are deterministic weights, not a probability.`;
          item.append(title, body, score);
          list.append(item);
        });
        return;
      }

      const filtered = evidence.filter(item => {
        const attached = linkedSignals.get(item.id) || [];
        const text = [item.kind, item.text, item.normalized, item.source, ...attached.map(signal => `${signal.label} ${signal.detail} ${signal.id}`)].join(' ').toLocaleLowerCase();
        return !normalizedQuery || text.includes(normalizedQuery);
      });
      if (!filtered.length) {
        const empty = document.createElement('p');
        empty.className = 'evidence-empty';
        empty.textContent = 'No evidence matches this search.';
        list.append(empty);
        return;
      }
      filtered.forEach(item => {
        const linked = linkedSignals.get(item.id) || [];
        const card = document.createElement('article');
        card.className = 'evidence-item';
        const heading = document.createElement('h4');
        heading.textContent = `${item.kind || 'Observed item'}${linked.length ? ` · ${linked.map(signal => localizeSignal(signal).label).join(', ')}` : ''}`;
        const observed = document.createElement('p');
        observed.className = 'evidence-observed';
        observed.textContent = `Observed: “${item.text || ''}”`;
        const source = document.createElement('p');
        const offsets = Number.isInteger(item.start) && Number.isInteger(item.end) ? ` · zero-based offsets [${item.start}, ${item.end})` : '';
        source.textContent = `Source: ${item.source || 'unspecified'}${offsets} · match confidence: ${item.confidence || 'not provided'}`;
        card.append(heading, observed, source);
        if (linked.length) {
          linked.forEach(signal => {
            const localized = localizeSignal(signal);
            const english = document.createElement('p');
            english.textContent = `English interpretation: ${signal.detail || localized.detail || 'This phrase matched a rule.'} This is not independent verification.`;
            const hindi = document.createElement('p');
            const hiSignal = SIGNALS.hi?.[signal.id];
            hindi.lang = 'hi';
            hindi.textContent = `हिंदी व्याख्या: ${hiSignal ? hiSignal[1] : 'यह पाठ एक नियम से मेल खाता है।'} यह स्वतंत्र पुष्टि नहीं है।`;
            const points = document.createElement('p');
            points.textContent = `Rule score contribution: +${Number(signal.points) || 0} points (weight, not probability).`;
            card.append(english, hindi, points);
          });
        } else {
          const note = document.createElement('p');
          note.textContent = 'This item was extracted from submitted content. Extraction alone does not mean it is malicious.';
          card.append(note);
        }
        const jump = document.createElement('button');
        jump.type = 'button';
        jump.className = 'evidence-jump';
        jump.textContent = 'Highlight in submitted content';
        jump.addEventListener('click', () => renderEvidencePreview(preview, data, target, item));
        card.append(jump);
        list.append(card);
      });
      renderEvidencePreview(preview, data, target);
    };
    if (search) {
      search.oninput = () => renderList(search.value);
      search.value = '';
    }
    renderList('');
  }

  /* ==========================================================================
     SCREEN 2, 3, 4: RENDER RESULTS & VERDICT
     ========================================================================== */
  function renderResult(data, target) {
    if (!data || !target) return;
    target.hidden = false;
    $('[data-result-title]', target).textContent = t(`risk-${data.level}`) || data.title;
    $('[data-result-summary]', target).textContent = language === 'en' ? data.summary : t(`summary-${data.level}`);
    $('[data-result-score]', target).textContent = String(Number(data.score) || 0);

    const badge = $('[data-score-badge]', target);
    if (badge) {
      badge.className = `score-badge ${['low', 'caution', 'high', 'critical'].includes(data.level) ? data.level : 'caution'}`;
    }

    const sourceTag = $('[data-analysis-source]', target);
    if (sourceTag) sourceTag.textContent = data.analysisSource === 'fastapi_local'
      ? 'LOCAL FASTAPI · RULE BASED'
      : 'BROWSER FALLBACK · RULE BASED';

    const verdictTag = $('#verdictCategoryTag');
    if (verdictTag) {
      const category = getClassification(data.level, data.signals);
      verdictTag.textContent = category;
      verdictTag.className = `verdict-tag ${data.level || 'caution'}`;
    }

    $('[data-result-disclaimer]', target).textContent = t('score-disclaimer');

    // Attack-Chain progression map (Screen 3)
    const chainBox = $('[data-attack-chain]', target);
    if (chainBox) {
      const chain = data.attackChain;
      chainBox.hidden = !chain || !Array.isArray(chain.stages);
      if (chain && Array.isArray(chain.stages)) {
        const copy = CHAIN_COPY[language] || CHAIN_COPY.en;
        const matchedStageCount = chain.stages.filter(stage => stage.matched).length;
        chainBox.classList.toggle('is-escalating', matchedStageCount >= 2);
        $('.chain-kicker', chainBox).textContent = copy.kicker;
        $('.chain-title', chainBox).textContent = copy.title;
        $('.chain-summary', chainBox).textContent = copy.summary(matchedStageCount);
        $('.chain-count', chainBox).textContent = copy.count(matchedStageCount);
        $('.chain-note', chainBox).textContent = `${copy.note} ${data.analysisSource === 'browser_rules' ? 'Browser fallback rules are shown because the local API was unavailable.' : 'Counts refer to matched journey stages, not the API signal count.'} No downstream outcome is asserted.`;
        const stages = $('.chain-stages', chainBox);
        stages.replaceChildren();
        chain.stages.forEach((stage, index) => {
          const item = document.createElement('li');
          item.className = `chain-stage${stage.matched ? ' is-matched' : ''}`;
          item.dataset.stageId = stage.id || '';
          item.tabIndex = 0;
          item.setAttribute('role', 'button');
          item.setAttribute('aria-label', `${(STAGE_TITLES[language] || STAGE_TITLES.en)[stage.id] || stage.id}: ${stage.matched ? copy.found : copy.absent}`);
          const title = document.createElement('strong');
          const stageTitle = (STAGE_TITLES[language] || STAGE_TITLES.en)[stage.id] || copy.stages[index] || stage.id;
          title.textContent = stageTitle;
          const state = document.createElement('small');
          state.textContent = stage.matched ? `Observed rule match · ${copy.found}` : `No matching stage observed · ${copy.absent}`;
          item.append(title, state);
          const linkedSignals = (data.signals || []).filter(signal => (STAGE_SIGNAL_IDS[stage.id] || []).includes(signal.id));
          if (linkedSignals.length) {
            const stageEvidence = document.createElement('small');
            stageEvidence.className = 'stage-evidence';
            stageEvidence.textContent = linkedSignals.map(signal => localizeSignal(signal).label).join(' · ');
            item.append(stageEvidence);
          }
          const selectStage = () => {
            $$('.chain-stage', stages).forEach(node => node.classList.remove('is-selected'));
            item.classList.add('is-selected');
            const relatedIds = new Set(linkedSignals.flatMap(signal => signal.evidence_ids || []));
            const panel = $('[data-evidence-panel]', target);
            const preview = $('[data-evidence-preview]', panel);
            const related = (data.evidence || []).filter(ev => relatedIds.has(ev.id));
            renderEvidencePreview(preview, { ...data, evidence: related }, target);
          };
          item.addEventListener('click', selectStage);
          item.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectStage(); }
          });
          stages.append(item);
        });
      }
    }

    // Signals & Evidence cards (Screen 4)
    const signalBox = $('[data-result-signals]', target);
    if (signalBox) {
      signalBox.replaceChildren();
      if (!Array.isArray(data.signals) || data.signals.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'no-signals';
        empty.textContent = t('no-signals');
        signalBox.append(empty);
      } else {
        data.signals.forEach(signal => {
          const localized = localizeSignal(signal);
          const card = document.createElement('article');
          card.className = 'signal';
          const head = document.createElement('div');
          head.className = 'signal-head';
          const title = document.createElement('b');
          title.textContent = localized.label;
          const points = document.createElement('span');
          points.className = 'points';
          points.textContent = `+${Number(signal.points) || 0} pts`;
          const detail = document.createElement('p');
          detail.textContent = localized.detail;
          head.append(title, points);
          card.append(head, detail);
          signalBox.append(card);
        });
      }
    }

    renderEvidencePanel(data, target);

    // Actions & Defensive Playbook (Screen 4)
    const actionBox = $('[data-result-actions]', target);
    if (actionBox) {
      actionBox.replaceChildren();
      (data.actions || []).forEach(action => {
        const item = document.createElement('li');
        item.textContent = localizeAction(action, target.id === 'qrResult');
        actionBox.append(item);
      });
    }

    // Update Dossier (Screen 7) and Graph (Screen 5)
    if (data.scoring && data.scoring.method) {
      const scoreNote = $('[data-i18n="score-note"]', target);
      if (scoreNote) {
        scoreNote.textContent = `Scoring Method: ${data.scoring.method} (Base: ${data.scoring.base_points} pts, Interaction Bonus: ${data.scoring.interaction_bonus} pts)`;
      }
    }
    updateDossier(data);
    updateFraudGraph(data);
  }

  /* ==========================================================================
     SCREEN 5: FRAUD RELATIONSHIP GRAPH VISUALIZATION (SVG CANVAS)
     ========================================================================== */
  function updateFraudGraph(data) {
    const svg = $('#fraudGraphSvg');
    if (!svg) return;
    const entities = Array.isArray(data?.entities) ? data.entities : [];
    const relationships = Array.isArray(data?.relationships) ? data.relationships : [];
    const empty = $('#graphEmptyState');
    const supported = {
      phone: ['#b52d35', '📱'], domain: ['#1769aa', '🔗'], url: ['#1769aa', '↗'],
      email: ['#7442a8', '✉'], upi_id: ['#7442a8', '₹'], payment_id: ['#7442a8', '₹'],
      account: ['#9a5a00', '▣']
    };
    if (!entities.length) {
      svg.replaceChildren();
      if (empty) {
        empty.hidden = false;
        empty.textContent = data?.analysisSource === 'browser_rules'
          ? 'This analyzer did not return extracted entities. The graph stays empty.'
          : 'No entities were extracted from this input.';
      }
      return;
    }
    if (empty) empty.hidden = true;
    const nodes = entities.map((entity, index) => {
      const angle = (index / Math.max(entities.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const type = entity.type || entity.kind || 'entity';
      const [color, icon] = supported[type] || ['#087d8f', '◇'];
      return {
        id: String(entity.id || `unidentified-${index}`),
        label: String(entity.normalized || entity.value || entity.text || 'Extracted entity'),
        type: String(type),
        color,
        x: Math.round(450 + Math.cos(angle) * Math.min(330, 115 + entities.length * 9)),
        y: Math.round(218 + Math.sin(angle) * Math.min(155, 62 + entities.length * 4)),
        icon,
        desc: `Source: ${entity.source || 'not provided'} · ${entity.demo ? 'synthetic example' : 'extracted from submitted content'}`,
        evidenceIds: [entity.evidence_id, ...(entity.evidence_ids || [])].filter(Boolean),
        original: entity
      };
    });
    const entityIds = new Set(nodes.map(node => node.id));
    const edges = relationships
      .filter(rel => rel && entityIds.has(String(rel.from)) && entityIds.has(String(rel.to)))
      .map(rel => ({
        from: String(rel.from), to: String(rel.to),
        label: String(rel.type || rel.kind || 'Related'),
        provenance: String(rel.provenance || rel.confidence || 'not provided'),
        evidenceIds: Array.isArray(rel.evidence_ids) ? rel.evidence_ids : [],
        original: rel
      }));
    renderSvgGraph(svg, nodes, edges, Array.isArray(data.evidence) ? data.evidence : []);
  }

  function renderSvgGraph(svg, nodes, edges, evidence = []) {
    svg.replaceChildren();

    // Defs for arrows and gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
      </marker>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    svg.appendChild(defs);

    // Draw Links/Edges
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    edges.forEach(edge => {
      const source = nodeMap.get(edge.from);
      const target = nodeMap.get(edge.to);
      if (!source || !target) return;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
      const d = `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${(source.y + target.y) / 2 - 20} ${target.x} ${target.y}`;
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'var(--line-bright)');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#arrow)');
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', `Relationship ${edge.label}; provenance: ${edge.provenance || 'not supplied'}`);
      const edgeTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      edgeTitle.textContent = `${edge.label} · ${edge.provenance || 'provenance not supplied'}${edge.evidenceIds?.length ? ` · Evidence: ${edge.evidenceIds.join(', ')}` : ''}`;
      path.append(edgeTitle);
      const inspectRelationship = () => {
        const selected = evidence.filter(item => (edge.evidenceIds || []).includes(item.id));
        const text = $('#graphEvidenceText');
        if (text) {
          const sourceSummary = selected.length
            ? selected.map(item => `${item.id}: “${item.text}”`).join(' | ')
            : 'No linked evidence snippets were returned.';
          text.textContent = `${edge.label} · provenance/confidence: ${edge.provenance || 'not supplied'} · ${sourceSummary}`;
        }
      };
      path.addEventListener('click', inspectRelationship);
      path.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inspectRelationship(); }
      });
      if (pulseAnimationActive) {
        path.setAttribute('stroke-dasharray', '6 4');
        path.style.animation = 'dash-move 20s linear infinite';
      }
      svg.appendChild(path);

      // Edge Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String((source.x + target.x) / 2));
      text.setAttribute('y', String((source.y + target.y) / 2 - 24));
      text.setAttribute('class', 'edge-label');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = edge.label;
      svg.appendChild(text);
    });

    // Draw Nodes
    nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', `${node.type}: ${node.label}. Select to inspect evidence.`);
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

      // Outer glow circle
      const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      outer.setAttribute('r', '22');
      outer.setAttribute('fill', node.color);
      outer.setAttribute('fill-opacity', '0.15');
      outer.setAttribute('stroke', node.color);
      outer.setAttribute('stroke-width', '1.5');
      outer.setAttribute('filter', 'url(#glow)');

      // Inner circle
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      inner.setAttribute('r', '14');
      inner.setAttribute('fill', 'var(--bg-card)');
      inner.setAttribute('stroke', node.color);
      inner.setAttribute('stroke-width', '2');

      // Icon text
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('dominant-baseline', 'central');
      icon.setAttribute('font-size', '12');
      icon.textContent = node.icon;

      // Label below
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('y', '34');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--text-main)');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-weight', '700');
      label.textContent = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;

      // Subtitle
      const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sub.setAttribute('y', '46');
      sub.setAttribute('text-anchor', 'middle');
      sub.setAttribute('fill', 'var(--text-muted)');
      sub.setAttribute('font-size', '9');
      sub.textContent = node.type;

      g.append(outer, inner, icon, label, sub);

      // Tooltip interaction
      g.addEventListener('mouseenter', () => showGraphTooltip(node, evidence));
      g.addEventListener('focus', () => showGraphTooltip(node, evidence));
      g.addEventListener('click', () => showGraphTooltip(node, evidence));
      g.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showGraphTooltip(node, evidence);
        }
      });

      svg.appendChild(g);
    });
  }

  function showGraphTooltip(node, evidence = []) {
    const tooltip = $('#graphNodeTooltip');
    if (!tooltip) return;
    tooltip.hidden = false;
    $('#tooltipIcon').textContent = node.icon;
    $('#tooltipTitle').textContent = `${node.label} (${node.type})`;
    $('#tooltipDesc').textContent = node.desc;
    const selectedEvidence = evidence.filter(item => (node.evidenceIds || []).includes(item.id));
    const evidenceText = $('#graphEvidenceText');
    if (evidenceText) {
      evidenceText.textContent = selectedEvidence.length
        ? selectedEvidence.map(item => `${item.id}: “${item.text}” · ${item.source || 'source unavailable'}${Number.isInteger(item.start) ? ` [${item.start}, ${item.end})` : ''}`).join(' | ')
        : node.demo ? 'Synthetic example only; no real evidence.' : 'No linked evidence reference was returned for this entity.';
    }
  }

  /* ==========================================================================
     SCREEN 6: SCAM CAMPAIGN MONITORING [DEMO]
     ========================================================================== */
  function renderCampaigns(filterSector = 'all') {
    const grid = $('#campaignGrid');
    if (!grid) return;
    grid.replaceChildren();

    const filtered = filterSector === 'all'
      ? CAMPAIGN_FEED
      : CAMPAIGN_FEED.filter(c => c.sector === filterSector);

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'campaign-card';

      const header = document.createElement('div');
      header.className = 'campaign-card-header';
      const idSpan = document.createElement('span');
      idSpan.className = 'campaign-id';
      idSpan.textContent = item.id;
      const demoTag = document.createElement('span');
      demoTag.className = 'campaign-demo-tag';
      demoTag.textContent = item.demoTag;
      header.append(idSpan, demoTag);

      const title = document.createElement('h4');
      title.textContent = item.title;

      const desc = document.createElement('p');
      desc.textContent = item.desc;

      const meta = document.createElement('div');
      meta.className = 'campaign-meta-grid';
      meta.innerHTML = `
        <div class="campaign-meta-item"><small>STATUS</small><strong>${item.severity}</strong></div>
        <div class="campaign-meta-item"><small>EXAMPLE VECTOR</small><strong>${item.vector}</strong></div>
        <div class="campaign-meta-item"><small>MONITORING</small><strong>${item.activeSince}</strong></div>
        <div class="campaign-meta-item"><small>INCIDENT DATA</small><strong>${item.impactEst}</strong></div>
      `;

      const iocBlock = document.createElement('div');
      iocBlock.className = 'campaign-iocs';
      iocBlock.textContent = `Indicators: ${item.iocs}`;

      card.append(header, title, desc, meta, iocBlock);
      grid.append(card);
    });
  }

  /* ==========================================================================
     SCREEN 7: INCIDENT INVESTIGATION REPORT DOSSIER
     ========================================================================== */
  function renderSafetyScenario(id) {
    const titleNode = $('[data-safety-title]');
    const stepsNode = $('[data-safety-steps]');
    const reportButton = $('#createIncidentReportBtn');
    const selected = SAFETY_GUIDANCE[language === 'hi' ? 'hi' : 'en'][id];
    if (!selected || !titleNode || !stepsNode) return;
    selectedSafetyScenario = id;
    titleNode.textContent = selected[0];
    stepsNode.replaceChildren();
    selected[1].forEach(text => {
      const step = document.createElement('li');
      step.textContent = text;
      stepsNode.append(step);
    });
    $$('[data-safety-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.safetyScenario === id)));
    if (reportButton) reportButton.disabled = false;
  }

  function createSafetyIncidentReport() {
    if (!selectedSafetyScenario) return;
    const locale = language === 'hi' ? 'hi' : 'en';
    const [scenario, steps] = SAFETY_GUIDANCE[locale][selectedSafetyScenario];
    const report = {
      format: 'scamsathi.safety-incident.v1',
      createdAt: new Date().toISOString(),
      locale,
      selectedScenario: { id: selectedSafetyScenario, label: scenario },
      suggestedActions: steps,
      officialResources: [
        { label: 'Financial cyber fraud helpline (India)', value: '1930', url: 'tel:1930' },
        { label: 'National Cyber Crime Reporting Portal', url: 'https://cybercrime.gov.in/' },
        { label: 'RBI guidance on unauthorized electronic transactions', url: 'https://www.rbi.org.in/commonman/english/Scripts/SMSLimitedliability.aspx' }
      ],
      limitations: ['This is a user-selected response checklist, not a verified incident finding.', 'It contains no passwords, OTPs, PINs, card numbers, contact details, or uploaded evidence.', 'Reporting does not guarantee recovery of funds.']
    };
    const filename = `scamsathi-incident-${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }), filename);
    showToast('Incident checklist downloaded to this device.');
  }

  function updateDossier(data) {
    const dateStr = data.analyzedAt ? new Date(data.analyzedAt).toLocaleString() : 'not supplied';
    const message = currentAnalysisKind === 'qr' ? ($('#qrPayload')?.value || '').trim() : ($('#message')?.value || '').trim();
    const url = ($('#url')?.value || '').trim();
    const references = (data.entities || []).map(entity => entity.normalized || entity.value || entity.text).filter(Boolean);

    $('#dossierDate').textContent = `Analysis timestamp: ${dateStr}`;
    $('#dossierScore').textContent = `Risk Score: ${data.score || 0}/100 (${(data.level || 'low').toUpperCase()})`;
    $('#dossierClassification').textContent = `Rule summary: ${getClassification(data.level, data.signals)}`;
    $('#dossierSignalsCount').textContent = `${(data.signals || []).length} rule signals · ${(data.evidence || []).length} evidence items · ${(data.entities || []).length} extracted entities`;

    $('#dossierVector').textContent = currentAnalysisKind === 'qr'
      ? 'Input type: user-submitted QR payload'
      : url ? 'Input type: message and user-submitted URL' : 'Input type: user-submitted message';
    $('#dossierImpersonation').textContent = `Extracted items (unverified): ${references.join(', ') || 'none'}`;

    const preview = message.length > 90 ? message.slice(0, 90) + '…' : (message || url || 'None');
    $('#dossierPayloadPreview').textContent = `Payload Preview: "${preview}"`;
    const dossierId = $('#dossierId');
    if (dossierId && data.analyzedAt) dossierId.textContent = `DOSSIER-${data.analyzedAt.replace(/[-:TZ.]/g, '').slice(0, 14)}`;
  }

  function exportDossier(format = 'json') {
    const message = currentAnalysisKind === 'qr' ? '' : ($('#message')?.value || '').trim();
    const url = currentAnalysisKind === 'qr' ? '' : ($('#url')?.value || '').trim();
    const qrPayload = currentAnalysisKind === 'qr' ? ($('#qrPayload')?.value || '').trim() : '';
    const data = (currentAnalysisKind === 'qr' ? results.qr : results.message) || { score: 0, level: 'low', signals: [], evidence: [], entities: [], relationships: [], actions: [] };
    const matchedStages = (data.attackChain?.stages || []).filter(stage => stage.matched).length;
    const dossierObj = {
      format: 'scamsathi.investigation-dossier.v2',
      dossierId: $('#dossierId')?.textContent || `DOSSIER-${Date.now()}`,
      analysisTimestamp: data.analyzedAt || null,
      exportTimestamp: new Date().toISOString(),
      analysisSource: data.analysisSource || 'unknown',
      evaluationEngine: data.provenance?.analysis || 'deterministic browser rules; provenance unavailable',
      payload: { type: currentAnalysisKind, message, url, qrPayload },
      threatAssessment: {
        score: Number(data.score) || 0,
        level: data.level || 'low',
        ruleSummary: getClassification(data.level, data.signals),
        scoreInterpretation: 'Deterministic rule weight, not a probability of fraud.',
        scoring: data.scoring || null
      },
      evidenceSignals: data.signals || [],
      observedEvidence: data.evidence || [],
      extractedEntities: data.entities || [],
      relationships: data.relationships || [],
      attackJourney: {
        matchedStageCount: matchedStages,
        totalStages: (data.attackChain?.stages || []).length,
        stages: data.attackChain?.stages || [],
        countNote: 'Matched journey stages are counted here; this is separate from the backend signal count.',
        inferredOutcomes: []
      },
      recommendedActions: data.actions || [],
      confidence: {
        numericProbability: null,
        note: 'Evidence confidence values, when present, describe match/provenance type. They are not probabilities.',
        evidenceLabels: (data.evidence || []).map(item => ({ id: item.id, confidence: item.confidence || null }))
      },
      provenance: data.provenance || { analysis: 'browser rules fallback', threat_intelligence: false, external_network_requests: false },
      safetyScenario: selectedSafetyScenario,
      limitations: [
        'This is a deterministic rule analysis of user-supplied content, not proof of malicious intent.',
        'Extracted URLs, phone numbers and payment identifiers are unverified and are not labelled malicious by extraction alone.',
        'No external threat intelligence or campaign attribution is included in this dossier.',
        data.analysisSource === 'browser_rules' ? 'The local API was unavailable; browser fallback may not provide evidence snippets, offsets, entities, or provenance.' : 'Rules can miss new or context-dependent scam patterns.',
        'This report is not an official police, bank, or forensic finding.'
      ],
      officialResources: [
        { label: 'Financial cyber fraud helpline (India)', value: '1930', url: 'tel:1930' },
        { label: 'National Cyber Crime Reporting Portal', url: 'https://cybercrime.gov.in/' }
      ]
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dossierObj, null, 2)], { type: 'application/json' });
      downloadFile(blob, `${dossierObj.dossierId}.json`);
      showToast('Investigation JSON dossier exported.');
    } else {
      const md = `# ${dossierObj.dossierId} — ScamSathi investigation dossier\n\n` +
        `**Analysis time:** ${dossierObj.analysisTimestamp || 'not supplied'}\n` +
        `**Export time:** ${dossierObj.exportTimestamp}\n` +
        `**Risk Score:** ${dossierObj.threatAssessment.score}/100 (${dossierObj.threatAssessment.level.toUpperCase()})\n` +
        `**Rule summary:** ${dossierObj.threatAssessment.ruleSummary}\n` +
        `**Score meaning:** ${dossierObj.threatAssessment.scoreInterpretation}\n\n` +
        `## User-submitted payload\n\n\`\`\`json\n${JSON.stringify(dossierObj.payload, null, 2)}\n\`\`\`\n\n` +
        `## Signals and score contributions\n\n\`\`\`json\n${JSON.stringify(dossierObj.evidenceSignals, null, 2)}\n\`\`\`\n\n` +
        `## Observed evidence and offsets\n\n\`\`\`json\n${JSON.stringify(dossierObj.observedEvidence, null, 2)}\n\`\`\`\n\n` +
        `## Extracted entities and relationships\n\n\`\`\`json\n${JSON.stringify({ entities: dossierObj.extractedEntities, relationships: dossierObj.relationships }, null, 2)}\n\`\`\`\n\n` +
        `## Attack journey stages\n\n\`\`\`json\n${JSON.stringify(dossierObj.attackJourney, null, 2)}\n\`\`\`\n\n` +
        `## Recommended protective actions\n\n${dossierObj.recommendedActions.map(action => `- ${action}`).join('\n') || '- No action was returned.'}\n\n` +
        `## Confidence and limitations\n\n${dossierObj.confidence.note}\n\n${dossierObj.limitations.map(note => `- ${note}`).join('\n')}\n\n` +
        `## Provenance\n\n\`\`\`json\n${JSON.stringify(dossierObj.provenance, null, 2)}\n\`\`\`\n\n` +
        `Official reporting resources: [1930](tel:1930) · [cybercrime.gov.in](https://cybercrime.gov.in/)`;

      const blob = new Blob([md], { type: 'text/markdown' });
      downloadFile(blob, `${dossierObj.dossierId}.md`);
      showToast('Investigation Markdown dossier exported.');
    }
  }

  function downloadFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ==========================================================================
     SCREEN 8: RECENT REPORTS DASHBOARD (TELEMETRY LOG)
     ========================================================================== */
  const STORAGE_KEY = 'scamsathi_telemetry_v2';
  const CONSENT_STORAGE_KEY = 'scamsathi_consent_history_v2';
  const AI_CONSENT_KEY = 'scamsathi_consent_external_ai_v2';

  function isHistoryOptedIn() {
    try {
      return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function purgeUnconsentedLegacyHistory() {
    if (isHistoryOptedIn()) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function setHistoryOptIn(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }

  function isAiConsentGranted() {
    try {
      return localStorage.getItem(AI_CONSENT_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function setAiConsent(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(AI_CONSENT_KEY, 'true');
      } else {
        localStorage.removeItem(AI_CONSENT_KEY);
      }
    } catch (_) {}
  }

  function getStoredLogs() {
    if (!isHistoryOptedIn()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveLogEntry(entry) {
    // Zero-retention by default: only persist if user explicitly opted in
    if (!isHistoryOptedIn()) return;
    try {
      const logs = getStoredLogs();
      const id = globalThis.crypto?.randomUUID?.() || `case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      logs.unshift({ ...entry, id });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
      renderTelemetryTable();
    } catch (_) {}
  }

  function deleteStoredLog(log) {
    try {
      const logs = getStoredLogs();
      const index = log.id ? logs.findIndex(item => item.id === log.id) : logs.indexOf(log);
      if (index >= 0) {
        logs.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      }
      renderTelemetryTable();
    } catch (_) {}
  }

  function clearStoredLogs() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      renderTelemetryTable();
    } catch (_) {}
  }

  function renderTelemetryTable(filter = 'all', searchQuery = '') {
    const tbody = $('#telemetryTableBody');
    if (!tbody) return;
    const logs = getStoredLogs();

    let filtered = logs;
    if (filter === 'critical') {
      filtered = filtered.filter(l => l.level === 'critical' || l.level === 'high');
    } else if (filter === 'qr') {
      filtered = filtered.filter(l => l.type === 'QR');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        (l.text || '').toLowerCase().includes(q) ||
        (l.classification || '').toLowerCase().includes(q) ||
        (l.level || '').toLowerCase().includes(q)
      );
    }

    if (!filtered.length) {
      tbody.replaceChildren();
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'telemetry-empty-row';
      cell.textContent = !isHistoryOptedIn()
        ? 'History is off. Enable the opt-in above before new investigation content can be saved.'
        : 'No saved investigations match this search.';
      row.append(cell);
      tbody.append(row);
      return;
    }

    tbody.replaceChildren();
    filtered.forEach(log => {
      const tr = document.createElement('tr');
      const values = [log.time, log.type, log.level, log.score, log.classification, `${log.signalsCount} cues`];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = String(value ?? '');
        if (index === 0) cell.className = 'telemetry-time';
        if (index === 2) {
          const badge = document.createElement('span');
          badge.className = `verdict-tag ${['low', 'caution', 'high', 'critical'].includes(log.level) ? log.level : 'caution'}`;
          badge.textContent = String(log.level || 'unknown');
          cell.replaceChildren(badge);
        }
        tr.append(cell);
      });
      const actionCell = document.createElement('td');
      const view = document.createElement('button');
      view.className = 'graph-btn';
      view.type = 'button';
      view.textContent = 'View';
      view.addEventListener('click', () => {
        if (log.type === 'QR') {
          $('#qrPayload').value = log.text;
          runQrCheck(log.text);
          scrollTo($('#qrResult'));
        } else {
          $('#message').value = log.text;
          $('#url').value = log.url || '';
          runMessageCheck();
          scrollTo($('#messageResult'));
        }
      });
      const remove = document.createElement('button');
      remove.className = 'telemetry-delete-btn';
      remove.type = 'button';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete saved ${log.type || 'investigation'} from ${log.time || 'unknown time'}`);
      remove.addEventListener('click', () => deleteStoredLog(log));
      actionCell.append(view, remove);
      tr.append(actionCell);
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     API INTEGRATION (LOCAL BACKEND & BROWSER FALLBACK)
     ========================================================================== */
  async function postToLocalApi(path, fields) {
    const host = window.location.hostname.toLowerCase();
    // GitHub Pages is static; keep submitted content in-browser instead of POSTing it to the host.
    if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const endpoint = new URL(path, document.baseURI);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(fields),
        signal: controller.signal,
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer'
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!data || !Array.isArray(data.signals) || !Array.isArray(data.actions)) return null;
      return data;
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function checkAgentHealth() {
    const badge = $('#aiStatusBadge');
    if (!badge) return;
    try {
      const res = await fetch(new URL('api/agent/health', document.baseURI), { signal: AbortSignal.timeout(600) });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_status === 'available') {
          badge.textContent = 'GEMINI AVAILABLE · CONSENT REQUIRED';
          badge.style.background = 'var(--green-soft)';
          badge.style.color = 'var(--green-safe)';
          badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          return;
        }
      }
    } catch (_) {}
    badge.textContent = 'LOCAL RULES MODE';
  }

  async function askAiCopilot(query) {
    const chatBox = $('#copilotChatBox');
    if (!chatBox) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble user';
    userMsg.textContent = query;
    chatBox.appendChild(userMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Assistant message placeholder
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'chat-bubble assistant';
    chatBox.appendChild(assistantMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Consent-gated external AI, with in-browser rules as the fallback.
    const consentGranted = isAiConsentGranted() || $('#aiConsentCheckbox')?.checked === true;

    const host = window.location.hostname.toLowerCase();
    const localService = ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host);
    if (consentGranted && localService) {
      assistantMsg.textContent = 'Sending your question and scan context to the local ScamSathi service. It may forward them to Gemini if configured…';
      try {
          const res = await fetch(new URL('api/agent/chatWithContext', document.baseURI), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              message: query,
              conversationHistory: 'User asked for guidance on threat vector.',
              scanResults: JSON.stringify((currentAnalysisKind === 'qr' ? results.qr : results.message) || {}),
              externalAiConsent: 'true'
            }),
            signal: AbortSignal.timeout(4000)
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.agentResponse) {
              assistantMsg.textContent = data.agentResponse;
              chatBox.scrollTop = chatBox.scrollHeight;
              return;
            }
          }
      } catch (_) {}
    } else {
      assistantMsg.textContent = consentGranted
        ? 'The local ScamSathi service is unavailable at this address. Nothing was sent; using the in-browser guidance fallback.'
        : 'Using in-browser guidance. No Copilot request is sent without your consent.';
    }

    // Local rule-based defensive analysis (works offline without external AI)
    setTimeout(() => {
      let reply = 'Here is defensive guidance: If you revealed an OTP, immediately freeze your account via official banking app and call National Cyber Helpline 1930. Never approve unexpected UPI collect requests.';
      if (/otp|pin|password/i.test(query)) {
        reply = 'CRITICAL DEFENSE: Never share an OTP, PIN, or CVV. Bank officials and automated systems will never ask for them. If shared, immediately change your NetBanking credentials and call 1930.';
      } else if (/link|url|click/i.test(query)) {
        reply = 'URL SAFETY: If you clicked a link without entering credentials, close the browser tab and clear cache. Do NOT download any APK or profile. Check official bank portals separately.';
      } else if (/upi|refund|money/i.test(query)) {
        reply = 'UPI RULE: You do NOT pay to receive money. Entering a UPI PIN always debits funds from your account. Immediately report fraudulent VPA handles in your UPI app.';
      }
      assistantMsg.textContent = reply;
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 400);
  }

  async function analyzeMessage(message, url) {
    const data = await postToLocalApi('api/analyze', { message, url });
    const analyzedAt = new Date().toISOString();
    if (data) return { ...data, analysisSource: 'fastapi_local', analyzedAt };
    return { ...window.ScamSathiRules.analyze(message, url), analysisSource: 'browser_rules', analyzedAt };
  }

  async function analyzeQr(payload) {
    const data = await postToLocalApi('api/qr/analyze', { payload });
    const analyzedAt = new Date().toISOString();
    if (data) return { ...data, analysisSource: 'fastapi_local', analyzedAt };
    return { ...window.ScamSathiRules.analyzeQr(payload), analysisSource: 'browser_rules', analyzedAt };
  }

  function recordActivity(kind, data) {
    activity.checks += 1;
    if (kind === 'qr') activity.qr += 1;
    if (Array.isArray(data.signals) && data.signals.length) activity.warnings += 1;
    activity.recent.unshift({
      kind,
      level: data.level || 'low',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      warning: Boolean(data.signals && data.signals.length)
    });
    activity.recent = activity.recent.slice(0, 3);
    renderActivity();

    // Log to persistent telemetry (Screen 8)
    const logItem = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: kind === 'qr' ? 'QR' : 'SMS/URL',
      level: data.level || 'low',
      score: data.score || 0,
      classification: getClassification(data.level, data.signals),
      signalsCount: (data.signals || []).length,
      text: kind === 'qr' ? ($('#qrPayload')?.value || '') : ($('#message')?.value || ''),
      url: kind === 'qr' ? '' : ($('#url')?.value || '')
    };
    saveLogEntry(logItem);
  }

  function renderActivity() {
    const checks = $('#metricChecks');
    if (!checks) return;
    checks.textContent = String(activity.checks);
    $('#metricWarnings').textContent = String(activity.warnings);
    $('#metricQr').textContent = String(activity.qr);
    const recent = $('#recentActivity');
    if (!activity.recent.length) {
      recent.textContent = t('recent-empty');
      recent.classList.remove('recent-list');
      return;
    }
    recent.classList.add('recent-list');
    recent.replaceChildren();
    activity.recent.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'recent-row';
      const label = document.createElement('span');
      label.textContent = `${entry.kind === 'qr' ? t('recent-qr') : t('recent-message')} · ${entry.warning ? t('recent-warning') : t('recent-clear')}`;
      const time = document.createElement('small');
      time.textContent = entry.time;
      row.append(label, time);
      recent.append(row);
    });
  }

  function showError(node, message) {
    if (!node) return;
    node.textContent = message || '';
    node.hidden = !message;
  }

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function renderForCopy(data) {
    const labels = (data.signals || []).map(signal => localizeSignal(signal).label);
    return `${data.title || ''} (${Number(data.score) || 0}/100 rule points)\n${data.summary || ''}\n${labels.length ? labels.join('; ') : t('no-signals')}\n${(data.actions || [])[0] || ''}\nScamSathi 2.0 Defensive Intelligence`;
  }

  function showCase() {
    const examples = EXAMPLES[language] || EXAMPLES.en;
    const example = examples[exampleIndex];
    if (!example) return;
    const number = $('#caseNum');
    if (number) number.textContent = String(exampleIndex + 1).padStart(2, '0');
    const tag = $('#caseTag'); if (tag) tag.textContent = example.tag;
    const quote = $('#caseQuote'); if (quote) quote.textContent = example.quote;
    const explain = $('#caseExplain'); if (explain) explain.textContent = example.explain;
  }

  async function runMessageCheck() {
    const message = ($('#message')?.value || '').trim();
    const url = ($('#url')?.value || '').trim();
    const error = $('#error');
    if (!message && !url) return showError(error, t('error-empty'));
    if (message.length > 4000 || url.length > 2048) return showError(error, t('error-too-long'));
    showError(error, '');
    const button = $('#analyzeBtn');
    currentAnalysisKind = 'message';
    button.disabled = true;
    $('[data-i18n="analyze-button"]', button).textContent = language === 'en' ? 'Scanning Threat Vectors…' : 'जाँच हो रही है…';
    try {
      results.message = await analyzeMessage(message, url);
      renderResult(results.message, $('#messageResult'));
      recordActivity('message', results.message);
      scrollTo($('#messageResult'));
    } catch (_) {
      showError(error, t('error-analysis'));
    } finally {
      button.disabled = false;
      $('[data-i18n="analyze-button"]', button).textContent = t('analyze-button');
    }
  }

  async function runQrCheck(payload, shouldScroll = true) {
    const value = String(payload || '').trim();
    const error = $('#qrError');
    if (!value) throw new TypeError(t('error-qr-empty'));
    if (value.length > 4096) throw new RangeError(t('error-too-long'));
    showError(error, '');
    currentAnalysisKind = 'qr';
    results.qr = await analyzeQr(value);
    const resultTarget = $('#qrResult') || $('#scanResult');
    renderResult(results.qr, resultTarget);
    recordActivity('qr', results.qr);
    if (shouldScroll) scrollTo(resultTarget);
    return results.qr;
  }

  async function handleQrButton() {
    const button = $('#qrAnalyzeBtn');
    const payload = $('#qrPayload')?.value || '';
    try {
      button.disabled = true;
      $('[data-i18n="inspect-qr"]', button).textContent = 'Checking QR…';
      await runQrCheck(payload);
    } catch (error) {
      showError($('#qrError'), error.message || t('error-analysis'));
    } finally {
      button.disabled = false;
      $('[data-i18n="inspect-qr"]', button).textContent = t('inspect-qr');
    }
  }

  async function registerShareTargetWorker() {
    const status = $('#shareReady');
    if (!('serviceWorker' in navigator)) {
      if (status) status.textContent = 'Share target unavailable in this browser; use manual inspection.';
      return;
    }
    try {
      await navigator.serviceWorker.register(new URL('sw.js', document.baseURI));
      await navigator.serviceWorker.ready;
      if (status) {
        status.textContent = 'Private sandbox share receiver is ready on this device.';
        status.classList.add('is-ready');
      }
    } catch (_) {
      if (status) status.textContent = 'Share target unavailable in this browser; use manual inspection.';
    }
  }

  async function consumeSharedMessage() {
    const inbox = $('#share-inbox');
    if (!inbox) return;
    const message = String(inbox.value || '').trim().slice(0, 4000);
    const truncated = inbox.dataset.truncated === 'true';
    inbox.remove();
    if (!message) return showToast('No message text was shared.');
    $('#message').value = message;
    const sharedUrl = message.match(/https?:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;!?]+$/, '') || '';
    $('#url').value = sharedUrl;
    $('#charCount').textContent = `${message.length.toLocaleString()} / 4,000`;
    if (truncated) showToast('Shared text shortened to 4,000 characters.');
    void runMessageCheck();
  }

  /* ==========================================================================
     INITIALIZATION & EVENT HANDLERS
     ========================================================================== */
  function setupVoiceInput() {
    const button = $('#startVoiceBtn');
    const note = $('#voiceSupportNote');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (button) button.disabled = true;
      if (note) note.textContent = 'Speech recognition is not available in this browser. Type or paste text into the message box.';
      return;
    }
    button?.addEventListener('click', () => {
      const consent = $('#voiceConsent');
      if (!consent?.checked) {
        if (note) note.textContent = 'Check the consent box before requesting browser speech recognition.';
        consent?.focus();
        return;
      }
      const transcript = $('#voiceTranscript');
      const actions = $('#voiceTranscriptActions');
      const status = $('#voiceStatus');
      transcript.hidden = false;
      actions.hidden = false;
      transcript.value = '';
      status.textContent = 'Listening. Speak clearly; nothing is submitted automatically.';
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = event => {
          transcript.value = Array.from(event.results || []).map(result => result[0]?.transcript || '').join(' ').slice(0, 4000);
          status.textContent = transcript.value ? 'Transcript ready. Review and edit it before choosing Use this transcript.' : 'No speech was transcribed; type or paste text instead.';
        };
        recognition.onerror = event => {
          status.textContent = event.error === 'not-allowed' ? 'Microphone permission was denied. You can type or paste text instead.' : `Speech recognition ended (${event.error || 'unavailable'}). You can type or paste text instead.`;
        };
        recognition.onend = () => {
          if (status.textContent.startsWith('Listening')) status.textContent = transcript.value ? 'Transcript ready to review.' : 'No transcript received. Type or paste text instead.';
        };
        recognition.start();
      } catch (_) {
        status.textContent = 'Speech recognition could not start. Type or paste text instead.';
      }
    });
    $('#useVoiceTranscriptBtn')?.addEventListener('click', () => {
      const transcript = ($('#voiceTranscript')?.value || '').trim();
      if (!transcript) return;
      $('#message').value = transcript.slice(0, 4000);
      $('#charCount').textContent = `${$('#message').value.length.toLocaleString()} / 4,000`;
      $('#message').focus();
      showToast('Transcript added for review. Press Analyze when ready.');
    });
  }

  function init() {
    // Older builds stored payloads without an explicit opt-in. Remove those legacy entries.
    purgeUnconsentedLegacyHistory();
    let savedTheme = 'paper';
    try { savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'paper'; } catch (_) {}
    applyTheme(savedTheme);
    $('#themeToggle')?.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'paper' ? 'midnight' : 'paper';
      applyTheme(nextTheme, true);
    });

    const navToggle = $('#mobileNavToggle');
    navToggle?.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.textContent = open ? 'Close' : 'Menu';
      $('.top')?.classList.toggle('nav-open', open);
    });
    $$('#mainNav a').forEach(link => link.addEventListener('click', () => {
      navToggle?.setAttribute('aria-expanded', 'false');
      if (navToggle) navToggle.textContent = 'Menu';
      $('.top')?.classList.remove('nav-open');
    }));

    setupVoiceInput();
    $$('[data-safety-scenario]').forEach(button => button.addEventListener('click', () => renderSafetyScenario(button.dataset.safetyScenario)));
    $('#createIncidentReportBtn')?.addEventListener('click', createSafetyIncidentReport);

    // Language change
    $('#languageSelect')?.addEventListener('change', event => {
      language = event.target.value;
      applyLanguage();
    });

    // Character count
    $('#message')?.addEventListener('input', event => {
      $('#charCount').textContent = `${event.target.value.length.toLocaleString()} / 4,000`;
    });

    // Example button
    $('#exampleBtn')?.addEventListener('click', () => {
      const example = (EXAMPLES[language] || EXAMPLES.en)[exampleIndex];
      $('#message').value = example.quote;
      $('#url').value = example.url;
      $('#charCount').textContent = `${example.quote.length.toLocaleString()} / 4,000`;
      $('#message').focus();
    });

    // Clear inputs
    $('#clearBtn')?.addEventListener('click', () => {
      $('#message').value = '';
      $('#url').value = '';
      $('#charCount').textContent = '0 / 4,000';
      $('#error').hidden = true;
      $('#voiceTranscript').value = '';
      $('#message').focus();
    });

    // Quick Sample Threat Vector chips
    $$('.threat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sampleKey = chip.dataset.sample;
        if (sampleKey === 'kyc') {
          $('#message').value = 'Your SBI bank account will be blocked today due to expired KYC. Update immediately to prevent suspension.';
          $('#url').value = 'https://bank.example/login';
        } else if (sampleKey === 'electricity') {
          $('#message').value = 'Dear customer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately.';
          $('#url').value = 'https://utility.example/notice';
        } else if (sampleKey === 'upi') {
          $('#message').value = 'Approve this UPI collect request and enter your UPI PIN to receive ₹4,500 refund in your account.';
          $('#url').value = '';
        } else if (sampleKey === 'neutral') {
          $('#message').value = 'Dear customer, OTP for your transaction at ABC Mart is 482910. Do not share this OTP with anyone.';
          $('#url').value = '';
        }
        $('#charCount').textContent = `${$('#message').value.length.toLocaleString()} / 4,000`;
        runMessageCheck();
      });
    });

    // Screen Tabs Switcher
    $$('.screen-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.screen-tab-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const target = btn.dataset.screenTarget;
        if (target === 'screen-1') scrollTo($('#check'));
        else if (target === 'screen-2') { if (results.message) scrollTo($('#messageResult')); else scrollTo($('#check')); }
        else if (target === 'screen-3') { if (results.message) scrollTo($('[data-attack-chain]')); else scrollTo($('#check')); }
        else if (target === 'screen-4') { if (results.message) scrollTo($('.result-columns')); else scrollTo($('#check')); }
        else if (target === 'screen-5') scrollTo($('#graph-view'));
        else if (target === 'screen-6') scrollTo($('#campaigns-view'));
        else if (target === 'screen-7') scrollTo($('#dossier-view'));
        else if (target === 'screen-8') scrollTo($('#telemetry-view'));
      });
    });

    // Analyze buttons
    $('#analyzeBtn')?.addEventListener('click', runMessageCheck);
    $('#qrAnalyzeBtn')?.addEventListener('click', handleQrButton);

    // Case study navigation
    $('#prevCase')?.addEventListener('click', () => { exampleIndex = (exampleIndex + 2) % 3; showCase(); });
    $('#nextCase')?.addEventListener('click', () => { exampleIndex = (exampleIndex + 1) % 3; showCase(); });

    // Copy safety summary
    document.addEventListener('click', async event => {
      const button = event.target.closest('[data-copy-result]');
      if (!button) return;
      const target = button.closest('[data-result]');
      const data = target === $('#qrResult') || target === $('#scanResult') ? results.qr : results.message;
      if (!data) return;
      try {
        await navigator.clipboard.writeText(renderForCopy(data));
        showToast(t('copy-done'));
      } catch (_) {
        showToast(t('copy-failed'));
      }
    });

    // Enter key submits URL input
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && event.target.matches('#url')) {
        event.preventDefault();
        runMessageCheck();
      }
    });

    // Graph controls
    $('#graphResetBtn')?.addEventListener('click', () => {
      updateFraudGraph(currentAnalysisKind === 'qr' ? results.qr : results.message);
      showToast('Graph reset to the current analysis.');
    });

    $('#graphPulseBtn')?.addEventListener('click', () => {
      pulseAnimationActive = !pulseAnimationActive;
      updateFraudGraph(currentAnalysisKind === 'qr' ? results.qr : results.message);
      showToast(pulseAnimationActive ? 'Data flow pulse enabled.' : 'Data flow pulse paused.');
    });

    $('#graphSampleBtn')?.addEventListener('click', () => {
      const sampleData = {
        demo: true,
        entities: [
          { id: 'demo-domain-1', type: 'domain', value: 'example.test', normalized: 'example.test', source: 'synthetic example', demo: true, evidence_id: 'demo-ev-1' },
          { id: 'demo-email-1', type: 'email', value: 'contact@example.test', normalized: 'contact@example.test', source: 'synthetic example', demo: true, evidence_id: 'demo-ev-2' }
        ],
        relationships: [{ from: 'demo-domain-1', to: 'demo-email-1', type: 'synthetic example link', provenance: 'hypothetical demo relationship', confidence: 'demo_only', evidence_ids: ['demo-ev-1', 'demo-ev-2'] }],
        evidence: [
          { id: 'demo-ev-1', text: 'example.test', source: 'synthetic example', start: null, end: null },
          { id: 'demo-ev-2', text: 'contact@example.test', source: 'synthetic example', start: null, end: null }
        ]
      };
      updateFraudGraph(sampleData);
      showToast('Loaded a synthetic example; no real intelligence is shown.');
    });

    // Campaign filter buttons
    $$('.campaign-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.campaign-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderCampaigns(btn.dataset.filter || 'all');
      });
    });

    // Dossier action buttons
    $('#exportJsonBtn')?.addEventListener('click', () => exportDossier('json'));
    $('#exportMdBtn')?.addEventListener('click', () => exportDossier('md'));
    $('#printDossierBtn')?.addEventListener('click', () => window.print());

    // Telemetry log filters & search
    $('#telemetrySearchInput')?.addEventListener('input', e => {
      renderTelemetryTable('all', e.target.value);
    });

    $$('[data-log-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-log-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderTelemetryTable(btn.dataset.logFilter, $('#telemetrySearchInput')?.value || '');
      });
    });

    // Opt-In History & Telemetry controls
    const optInCheckbox = $('#optInHistoryCheckbox');
    if (optInCheckbox) {
      optInCheckbox.checked = isHistoryOptedIn();
      optInCheckbox.addEventListener('change', () => {
        setHistoryOptIn(optInCheckbox.checked);
        renderTelemetryTable();
        showToast(optInCheckbox.checked ? 'Local history logging enabled (Opt-In).' : 'Local history logging disabled and cleared.');
      });
    }

    const deleteBtn = $('#deleteTelemetryBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Delete all saved investigation records from browser storage?')) {
          clearStoredLogs();
          showToast('Investigation history deleted.');
        }
      });
    }

    $('#clearTelemetryBtn')?.addEventListener('click', () => {
      if (confirm('Clear all stored telemetry logs from local sandbox storage?')) {
        clearStoredLogs();
        showToast('Telemetry log cleared.');
      }
    });

    // AI External Consent controls
    const aiConsentCb = $('#aiConsentCheckbox');
    if (aiConsentCb) {
      aiConsentCb.checked = isAiConsentGranted();
      aiConsentCb.addEventListener('change', () => {
        setAiConsent(aiConsentCb.checked);
        showToast(aiConsentCb.checked ? 'External AI analysis enabled.' : 'External AI analysis disabled (Local Rules active).');
      });
    }

    $('#useLocalRulesBtn')?.addEventListener('click', () => {
      if (aiConsentCb) aiConsentCb.checked = false;
      setAiConsent(false);
      showToast('Switched to local rule-based guidance (No data sent to external AI).');
    });

    // AI Copilot input
    $('#copilotSendBtn')?.addEventListener('click', () => {
      const input = $('#copilotInput');
      const val = (input?.value || '').trim();
      if (!val) return;
      input.value = '';
      askAiCopilot(val);
    });

    $('#copilotInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('#copilotSendBtn')?.click();
      }
    });

    // Initial render
    applyLanguage();
    renderCampaigns('all');
    renderTelemetryTable();
    updateFraudGraph(null);
    void checkAgentHealth();
  }

  window.ScamSathi = {
    analyzeQr: runQrCheck,
    renderResult,
    text: t,
    localizeSignal,
    showToast,
    updateFraudGraph,
    renderCampaigns,
    exportDossier,
    isHistoryOptedIn,
    setHistoryOptIn,
    clearStoredLogs,
    isAiConsentGranted,
    setAiConsent,
    askAiCopilot
  };

  init();
  void registerShareTargetWorker();
  void consumeSharedMessage();
})();
