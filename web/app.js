(function () {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const results = { message: null, qr: null };
  const activity = { checks: 0, warnings: 0, qr: 0, recent: [] };
  let language = 'en';
  let exampleIndex = 0;
  const CHAIN_COPY = {
    en: {
      kicker: 'EXPLAINABLE ATTACK-CHAIN MAP', title: 'How this message may move you',
      summary: count => count >= 2 ? 'Several stages appear together. Verify independently before acting.' : 'Few linked stages were found; this does not prove the message is safe.',
      count: count => `${count}/3 cues`, found: 'Cue found', absent: 'Not found',
      note: 'A transparent signal map, not a fraud verdict or a trained AI prediction.',
      stages: ['Borrow trust', 'Create pressure', 'Ask for code, money or access']
    },
    hi: {
      kicker: 'समझने योग्य स्कैम-क्रम', title: 'यह संदेश आपको कैसे आगे बढ़ा सकता है',
      summary: count => count >= 2 ? 'कई चरण साथ दिखे। कार्रवाई से पहले स्वतंत्र रूप से पुष्टि करें।' : 'कम जुड़े संकेत मिले; इससे संदेश सुरक्षित साबित नहीं होता।',
      count: count => `${count}/3 संकेत`, found: 'संकेत मिला', absent: 'नहीं मिला',
      note: 'यह संकेतों का नक्शा है, धोखाधड़ी का फैसला या प्रशिक्षित AI का अनुमान नहीं।',
      stages: ['भरोसा जीतना', 'दबाव बनाना', 'कोड, पैसा या एक्सेस माँगना']
    },
    or: {
      kicker: 'ବୁଝିହେଉଥିବା ଠକେଇ-କ୍ରମ', title: 'ଏହି ବାର୍ତ୍ତା ଆପଣଙ୍କୁ କିପରି ଆଗକୁ ନେଇପାରେ',
      summary: count => count >= 2 ? 'ଏକାଧିକ ପର୍ଯ୍ୟାୟ ଏକାଠି ଦେଖାଯାଉଛି। କାର୍ଯ୍ୟ ପୂର୍ବରୁ ନିଜେ ଯାଞ୍ଚ କରନ୍ତୁ।' : 'କମ୍ ସଂଯୁକ୍ତ ସଙ୍କେତ ମିଳିଲା; ଏହା ସୁରକ୍ଷିତ ବୋଲି ପ୍ରମାଣ ନୁହେଁ।',
      count: count => `${count}/3 ସଙ୍କେତ`, found: 'ସଙ୍କେତ ମିଳିଲା', absent: 'ମିଳିଲା ନାହିଁ',
      note: 'ଏହା ସଙ୍କେତର ମାନଚିତ୍ର, ଠକେଇର ନିଶ୍ଚିତ ରାୟ କିମ୍ବା AI ପୂର୍ବାନୁମାନ ନୁହେଁ।',
      stages: ['ବିଶ୍ୱାସ ହାସଲ', 'ଚାପ ସୃଷ୍ଟି', 'କୋଡ୍, ଟଙ୍କା କିମ୍ବା ଆକ୍ସେସ୍ ମାଗିବା']
    }
  };

  const UI = {
    en: {
      'brand-tag':'COMMUNITY CYBER SAFETY','nav-check':'Check a message','nav-qr':'Scan a QR','nav-learn':'Learn the signs','local-label':'Private checks','language-label':'Language','track-label':'CYBER SAFETY',
      'hero-line-1':'Pause.','hero-line-2':'Check.','hero-line-3':'Protect.','hero-intro':'Check the warning signs in a suspicious message, link or QR code before you act.','hero-cta':'Check a message','hero-privacy-title':'Your content stays in this browser','hero-privacy-copy':'Rules check the text; messages are not saved.','hero-art-1':'CHECK THE SIGNS','hero-art-2':'CHOOSE A SAFE NEXT STEP',
      'session-kicker':'THIS BROWSER TAB','session-title':'Your checks','session-note':'Counts reset when this tab closes. No message text is kept.','metric-checks':'CHECKS','metric-checks-note':'Completed in this tab','metric-warnings':'CHECKS WITH WARNING SIGNS','metric-warnings-note':'A warning is not a verdict','metric-qr':'QR CHECKS','metric-qr-note':'Camera, image or pasted text','recent-title':'RECENT ACTIVITY','recent-empty':'Nothing yet. Run a check to see activity for this tab.',
      'checker-kicker':'MESSAGE AND LINK CHECK','checker-title':'What did they send you?','checker-help':'Paste a message or call transcript. Add a link separately if there is one.','message-label':'MESSAGE OR CALL TRANSCRIPT','message-limit':'up to 4,000 characters','try-example':'Try a sample message ↗','url-label':'LINK IN THE MESSAGE','url-note':'optional · checked without opening it','url-placeholder':'Paste a link or domain here','analyze-button':'Analyze warning signs','input-local-note':'Checked in this browser or by the local Java service.','before-act':'BEFORE YOU ACT','three-rules':'Three things to remember','rule-otp-title':'Never share an OTP or PIN','rule-otp-copy':'Not even with someone claiming to be from your bank.','rule-upi-title':'You do not pay to receive money','rule-upi-copy':'A UPI PIN authorizes money going out.','rule-pressure-title':'Pause if someone pressures you','rule-pressure-copy':'Call the organization on a number you find yourself.','report-link':'Official cybercrime reporting portal ↗',
      'result-kicker':'YOUR CHECK RESULTS','score-label':'SIGNAL SCORE','score-note':'Rule points · not a probability of fraud','signals-title':'Why it was flagged','actions-title':'Safer next steps','copy-result':'Copy safety summary','copy-done':'Safety summary copied.','copy-failed':'Clipboard is not available in this browser.','risk-critical':'Critical warning signs','risk-high':'High warning signs','risk-caution':'Pause and verify','risk-low':'No strong known pattern found','no-signals':'No known warning pattern matched. This does not prove the content is safe.',
      'qr-kicker':'QR AND PAYMENT SAFETY','qr-title':'Check before you scan or pay','qr-help':'Scan with your camera, choose a QR image, or paste decoded content. ScamSathi will not open a destination or start a payment.','open-scanner':'Open QR scanner','camera-note':'Camera access starts only after you press Start scanning. HTTPS or localhost is required.','qr-paste-label':'PASTE DECODED QR CONTENT','qr-paste-note':'up to 4,096 characters','qr-placeholder':'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR','inspect-qr':'Inspect QR content','upi-unverified':'UPI details in a QR are unverified. Confirm the payee and amount in your UPI app.','qr-result-kicker':'QR CHECK RESULTS',
      'learn-kicker':'A MOMENT TO VERIFY','learn-title':'Spot the pressure tactic','learn-copy':'Synthetic examples show the warning patterns ScamSathi can explain.','what-notice':'What to notice',
      'audio-kicker':'VOICE SCAM SAFETY','audio-title':'Audio deepfake analysis is not available','audio-copy':'ScamSathi does not upload or analyze recordings and cannot confirm whether a voice is cloned. If a caller urgently asks for money, hang up and call the person using a number you already trust.',
      'help-kicker':'IF MONEY HAS ALREADY LEFT YOUR ACCOUNT','help-title':'Act quickly. Contact your bank and report it.','help-copy':'In India, call','help-copy-2':'or use the Government of India’s','portal-name':'National Cyber Crime Reporting Portal','open-portal':'Open official portal ↗','limits-title':'What this tool can and cannot tell you','limits-copy':'ScamSathi uses rules to flag patterns in message text, URL structure and decoded QR content. It does not use a trained fraud model, threat-intelligence feed or bank lookup. The score is not a probability or confirmed verdict; a low score does not prove safety. It does not listen to calls, open links, block payments or submit reports. Message content is not retained.','footer-tag':'Built to help people pause before they pay.','source-link':'Source code ↗','footer-tech':'Prototype · explainable rules',
      'error-empty':'Paste a message or link first.','error-qr-empty':'Paste decoded QR content first.','error-too-long':'The content is over the allowed character limit.','error-analysis':'Could not analyze this content. Please try again.','recent-message':'Message check','recent-qr':'QR check','recent-warning':'warning signs','recent-clear':'no warning signs found','score-disclaimer':'Rule-based warning score, not a probability or guarantee. A low score does not prove safety.','summary-critical':'Several serious warning signs matched. Stop and verify independently before acting.','summary-high':'Several warning signs matched. Do not reply, click, share a code or approve a payment before verifying.','summary-caution':'One or more warning signs matched. Verify through an official app or contact channel before acting.','summary-low':'No strong known pattern was found. This does not prove the content is safe.',
      'scanner-back':'← Back to ScamSathi','scanner-title':'Scan and inspect a QR','scanner-desc':'The scanner reads the QR and explains its contents. It never opens a link, shares camera footage, or starts a payment.','scan-idle':'Your camera remains off until you choose Start scanning.','start-scan':'Start scanning','pause-scan':'Pause scanning','resume-scan':'Resume scanning','switch-camera':'Switch camera','flashlight':'Flashlight','stop-scan':'Stop camera','scan-starting':'Starting the camera…','scan-active':'Camera is on. Hold the QR inside the frame.','scan-paused':'Scanning paused. Resume when ready.','scan-no-camera':'No camera is available. Try a QR image or paste the decoded text.','scan-camera-blocked':'Camera permission was denied. Allow it in your browser settings, or use an image or pasted text.','scan-camera-failed':'Could not start the camera. Check that it is available and try again.','flash-unavailable':'Flashlight is not available on this camera.','image-title':'Use a QR image','image-help':'Choose an image saved on this device. It is decoded in the browser and is not uploaded.','file-label':'Choose QR image','file-limit':'Images up to 10 MB. If scanning fails, try a clearer, tightly framed image.','manual-title':'Paste QR content','manual-help':'If another QR reader decoded it, paste the text here.','manual-button':'Inspect pasted content','decoded-title':'QR content inspected','scanner-safe-note':'Camera access requires a secure page (HTTPS or localhost). Video is processed in your browser and is not uploaded. Check every payment detail in your UPI app.','qr-analysis-loading':'QR decoded. Checking warning signs…','scan-complete':'QR inspected. No link was opened and no payment was started.','file-invalid':'Choose a valid image file.','file-too-large':'This image is over the 10 MB limit.','image-checking':'Checking this image for a QR code…','scan-no-code':'No QR code was found. Try a sharper image or paste its decoded text.'
    },
    hi: {
      'brand-tag':'सामुदायिक साइबर सुरक्षा','nav-check':'संदेश जाँचें','nav-qr':'QR जाँचें','nav-learn':'संकेत जानें','local-label':'निजी जाँच','language-label':'भाषा','track-label':'साइबर सुरक्षा',
      'hero-line-1':'रुकें।','hero-line-2':'जाँचें।','hero-line-3':'सुरक्षित रहें।','hero-intro':'संदिग्ध संदेश, लिंक या QR पर कार्रवाई करने से पहले खतरे के संकेत जाँचें।','hero-cta':'संदेश जाँचें','hero-privacy-title':'आपकी जानकारी इसी ब्राउज़र में रहती है','hero-privacy-copy':'नियम संदेश जाँचते हैं; संदेश सहेजे नहीं जाते।','hero-art-1':'संकेत जाँचें','hero-art-2':'सुरक्षित अगला कदम चुनें',
      'session-kicker':'यह ब्राउज़र टैब','session-title':'आपकी जाँचें','session-note':'टैब बंद होने पर गिनती रीसेट हो जाती है। संदेश का पाठ सहेजा नहीं जाता।','metric-checks':'जाँचें','metric-checks-note':'इस टैब में पूरी हुई','metric-warnings':'चेतावनी वाले नतीजे','metric-warnings-note':'चेतावनी पक्का निष्कर्ष नहीं है','metric-qr':'QR जाँचें','metric-qr-note':'कैमरा, चित्र या पेस्ट किया पाठ','recent-title':'हाल की गतिविधि','recent-empty':'अभी कुछ नहीं। इस टैब की गतिविधि देखने के लिए जाँच करें।',
      'checker-kicker':'संदेश और लिंक की जाँच','checker-title':'आपको क्या भेजा गया?','checker-help':'संदेश या कॉल का लिखित विवरण पेस्ट करें। लिंक हो तो अलग से जोड़ें।','message-label':'संदेश या कॉल का लिखित विवरण','message-limit':'अधिकतम 4,000 अक्षर','try-example':'उदाहरण संदेश देखें ↗','url-label':'संदेश में दिया लिंक','url-note':'वैकल्पिक · खोले बिना जाँच','url-placeholder':'लिंक या डोमेन यहाँ पेस्ट करें','analyze-button':'खतरे के संकेत जाँचें','input-local-note':'इस ब्राउज़र या इसी डिवाइस की Java सेवा में जाँच।','before-act':'कुछ करने से पहले','three-rules':'तीन बातें याद रखें','rule-otp-title':'OTP या PIN साझा न करें','rule-otp-copy':'बैंक का कर्मचारी कहे तब भी नहीं।','rule-upi-title':'पैसे पाने के लिए भुगतान नहीं करना पड़ता','rule-upi-copy':'UPI PIN से आपके खाते से पैसा जाता है।','rule-pressure-title':'दबाव हो तो रुकें','rule-pressure-copy':'कंपनी का नंबर खुद खोजकर उस पर कॉल करें।','report-link':'आधिकारिक साइबर अपराध रिपोर्ट पोर्टल ↗',
      'result-kicker':'जाँच का नतीजा','score-label':'संकेत अंक','score-note':'नियमों के अंक · धोखाधड़ी की संभावना नहीं','signals-title':'चेतावनी क्यों मिली','actions-title':'सुरक्षित अगले कदम','copy-result':'सुरक्षा सारांश कॉपी करें','copy-done':'सुरक्षा सारांश कॉपी हो गया।','copy-failed':'इस ब्राउज़र में कॉपी सुविधा उपलब्ध नहीं है।','risk-critical':'कई गंभीर चेतावनी संकेत','risk-high':'खतरे के कई संकेत','risk-caution':'रुकें और जाँचें','risk-low':'खतरे का स्पष्ट संकेत नहीं मिला','no-signals':'पहचाना हुआ चेतावनी संकेत नहीं मिला। इसका अर्थ यह नहीं कि सामग्री सुरक्षित है।',
      'qr-kicker':'QR और भुगतान सुरक्षा','qr-title':'स्कैन या भुगतान करने से पहले जाँचें','qr-help':'कैमरे से स्कैन करें, QR चित्र चुनें या उसका पाठ पेस्ट करें। ScamSathi लिंक नहीं खोलेगा और भुगतान शुरू नहीं करेगा।','open-scanner':'QR स्कैनर खोलें','camera-note':'कैमरा अनुमति केवल “स्कैन शुरू करें” दबाने पर माँगी जाएगी। HTTPS या localhost ज़रूरी है।','qr-paste-label':'QR से मिला पाठ पेस्ट करें','qr-paste-note':'अधिकतम 4,096 अक्षर','qr-placeholder':'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR','inspect-qr':'QR सामग्री जाँचें','upi-unverified':'QR में दिखा UPI विवरण अप्रमाणित है। अपने UPI ऐप में प्राप्तकर्ता और राशि जाँचें।','qr-result-kicker':'QR जाँच का नतीजा',
      'learn-kicker':'रुककर जाँचें','learn-title':'दबाव डालने की चाल पहचानें','learn-copy':'उदाहरण उन चेतावनी संकेतों को दिखाते हैं जिन्हें ScamSathi समझा सकता है।','what-notice':'किन बातों पर ध्यान दें',
      'audio-kicker':'आवाज़ से जुड़े धोखों से सुरक्षा','audio-title':'ऑडियो डीपफेक जाँच उपलब्ध नहीं है','audio-copy':'ScamSathi रिकॉर्डिंग अपलोड या जाँच नहीं करता और यह पुष्टि नहीं कर सकता कि आवाज़ नकली है। कोई कॉलर तुरंत पैसे माँगे तो कॉल काटें और पहले से भरोसेमंद नंबर पर उस व्यक्ति को फोन करें।',
      'help-kicker':'अगर खाते से पैसे कट गए हैं','help-title':'जल्दी कार्रवाई करें। बैंक से संपर्क करें और रिपोर्ट करें।','help-copy':'भारत में कॉल करें','help-copy-2':'या भारत सरकार के','portal-name':'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल','open-portal':'आधिकारिक पोर्टल खोलें ↗','limits-title':'यह टूल क्या बता सकता है और क्या नहीं','limits-copy':'ScamSathi संदेश, URL की बनावट और QR के पाठ में कुछ संकेत पहचानने के नियमों का उपयोग करता है। इसमें प्रशिक्षित धोखाधड़ी मॉडल, ऑनलाइन खतरा-जाँच या बैंक खाता जाँच नहीं है। अंक धोखाधड़ी की संभावना या पक्का निष्कर्ष नहीं हैं; कम अंक सुरक्षा साबित नहीं करते। यह कॉल नहीं सुनता, लिंक नहीं खोलता, भुगतान नहीं रोकता और रिपोर्ट दर्ज नहीं करता। संदेश सहेजे नहीं जाते।','footer-tag':'भुगतान से पहले रुककर जाँचने में मदद के लिए।','source-link':'स्रोत कोड ↗','footer-tech':'प्रोटोटाइप · स्पष्ट नियम',
      'error-empty':'पहले संदेश या लिंक पेस्ट करें।','error-qr-empty':'पहले QR से मिला पाठ पेस्ट करें।','error-too-long':'सामग्री तय अक्षर सीमा से अधिक है।','error-analysis':'सामग्री की जाँच नहीं हो सकी। फिर कोशिश करें।','recent-message':'संदेश जाँच','recent-qr':'QR जाँच','recent-warning':'चेतावनी संकेत','recent-clear':'कोई चेतावनी संकेत नहीं','score-disclaimer':'यह नियमों पर आधारित चेतावनी है, संभावना या गारंटी नहीं। कम अंक सुरक्षा साबित नहीं करते।','summary-critical':'कई गंभीर चेतावनी संकेत मिले। कुछ करने से पहले रुकें और अलग से पुष्टि करें।','summary-high':'कई चेतावनी संकेत मिले। पुष्टि किए बिना जवाब, क्लिक, कोड साझा या भुगतान मंज़ूर न करें।','summary-caution':'एक या अधिक चेतावनी संकेत मिले। आधिकारिक ऐप या संपर्क से पुष्टि करें।','summary-low':'कोई प्रबल जाना-पहचाना संकेत नहीं मिला। इससे सामग्री सुरक्षित साबित नहीं होती।',
      'scanner-back':'← ScamSathi पर वापस जाएँ','scanner-title':'QR स्कैन करें और जाँचें','scanner-desc':'स्कैनर QR पढ़कर उसकी सामग्री समझाता है। यह लिंक नहीं खोलता, कैमरा वीडियो साझा नहीं करता और भुगतान शुरू नहीं करता।','scan-idle':'आपके स्कैन शुरू करने तक कैमरा बंद रहेगा।','start-scan':'स्कैन शुरू करें','pause-scan':'स्कैन रोकें','resume-scan':'फिर शुरू करें','switch-camera':'कैमरा बदलें','flashlight':'फ्लैशलाइट','stop-scan':'कैमरा बंद करें','scan-starting':'कैमरा शुरू हो रहा है…','scan-active':'कैमरा चालू है। QR को फ्रेम के अंदर रखें।','scan-paused':'स्कैन रुका है। तैयार हों तो फिर शुरू करें।','scan-no-camera':'कैमरा उपलब्ध नहीं है। QR चित्र या पेस्ट किया पाठ इस्तेमाल करें।','scan-camera-blocked':'कैमरा अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें, या चित्र/पेस्ट किया पाठ इस्तेमाल करें।','scan-camera-failed':'कैमरा शुरू नहीं हुआ। जाँचें कि वह उपलब्ध है और फिर कोशिश करें।','flash-unavailable':'इस कैमरे पर फ्लैशलाइट उपलब्ध नहीं है।','image-title':'QR चित्र इस्तेमाल करें','image-help':'इस डिवाइस में सहेजा चित्र चुनें। यह ब्राउज़र में पढ़ा जाएगा, अपलोड नहीं होगा।','file-label':'QR चित्र चुनें','file-limit':'10 MB तक के चित्र। न पढ़े तो साफ़ और पास से लिया चित्र चुनें।','manual-title':'QR सामग्री पेस्ट करें','manual-help':'दूसरे QR रीडर से मिला पाठ यहाँ पेस्ट करें।','manual-button':'पेस्ट की गई सामग्री जाँचें','decoded-title':'QR सामग्री की जाँच हुई','scanner-safe-note':'कैमरे के लिए सुरक्षित पेज (HTTPS या localhost) चाहिए। वीडियो ब्राउज़र में ही पढ़ा जाता है, अपलोड नहीं होता। UPI ऐप में हर भुगतान विवरण जाँचें।','qr-analysis-loading':'QR पढ़ लिया। चेतावनी संकेत जाँचे जा रहे हैं…','scan-complete':'QR की जाँच हुई। कोई लिंक नहीं खोला और भुगतान शुरू नहीं किया।','file-invalid':'सही चित्र फ़ाइल चुनें।','file-too-large':'यह चित्र 10 MB की सीमा से बड़ा है।','image-checking':'चित्र में QR खोजा जा रहा है…','scan-no-code':'चित्र में QR नहीं मिला। साफ़ चित्र चुनें या पाठ पेस्ट करें।'
    },
    or: {
      'brand-tag':'ସାମୁଦାୟିକ ସାଇବର ସୁରକ୍ଷା','nav-check':'ସନ୍ଦେଶ ଯାଞ୍ଚ','nav-qr':'QR ଯାଞ୍ଚ','nav-learn':'ସଙ୍କେତ ଜାଣନ୍ତୁ','local-label':'ଗୋପନୀୟ ଯାଞ୍ଚ','language-label':'ଭାଷା','track-label':'ସାଇବର ସୁରକ୍ଷା',
      'hero-line-1':'ଅଟକନ୍ତୁ।','hero-line-2':'ଯାଞ୍ଚନ୍ତୁ।','hero-line-3':'ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।','hero-intro':'ସନ୍ଦେହଜନକ ସନ୍ଦେଶ, ଲିଙ୍କ୍ କିମ୍ବା QR ଉପରେ କାର୍ଯ୍ୟ କରିବା ପୂର୍ବରୁ ବିପଦ ସଙ୍କେତ ଯାଞ୍ଚନ୍ତୁ।','hero-cta':'ସନ୍ଦେଶ ଯାଞ୍ଚ','hero-privacy-title':'ଆପଣଙ୍କ ବିଷୟବସ୍ତୁ ଏହି ବ୍ରାଉଜରରେ ରହେ','hero-privacy-copy':'ନିୟମ ସନ୍ଦେଶ ଯାଞ୍ଚ କରେ; ସନ୍ଦେଶ ସଞ୍ଚୟ ହୁଏ ନାହିଁ।','hero-art-1':'ସଙ୍କେତ ଯାଞ୍ଚ','hero-art-2':'ସୁରକ୍ଷିତ ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ ବାଛନ୍ତୁ',
      'session-kicker':'ଏହି ବ୍ରାଉଜର ଟ୍ୟାବ୍','session-title':'ଆପଣଙ୍କ ଯାଞ୍ଚ','session-note':'ଟ୍ୟାବ୍ ବନ୍ଦ ହେଲେ ଗଣନା ପୁନଃ ଆରମ୍ଭ ହୁଏ। ସନ୍ଦେଶ ପାଠ୍ୟ ରଖାଯାଏ ନାହିଁ।','metric-checks':'ଯାଞ୍ଚ','metric-checks-note':'ଏହି ଟ୍ୟାବ୍‌ରେ ସମାପ୍ତ','metric-warnings':'ସତର୍କ ସଙ୍କେତ ଥିବା ଯାଞ୍ଚ','metric-warnings-note':'ସତର୍କ ସଙ୍କେତ ନିଶ୍ଚିତ ରାୟ ନୁହେଁ','metric-qr':'QR ଯାଞ୍ଚ','metric-qr-note':'କ୍ୟାମେରା, ଛବି କିମ୍ବା ପାଠ୍ୟ','recent-title':'ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ','recent-empty':'ଏପର୍ଯ୍ୟନ୍ତ କିଛି ନାହିଁ। ଏହି ଟ୍ୟାବ୍‌ର କାର୍ଯ୍ୟକଳାପ ପାଇଁ ଯାଞ୍ଚ କରନ୍ତୁ।',
      'checker-kicker':'ସନ୍ଦେଶ ଓ ଲିଙ୍କ୍ ଯାଞ୍ଚ','checker-title':'ସେମାନେ ଆପଣଙ୍କୁ କ’ଣ ପଠାଇଲେ?','checker-help':'ସନ୍ଦେଶ କିମ୍ବା କଲ୍‌ର ଲିଖିତ ବିବରଣୀ ଦିଅନ୍ତୁ। ଲିଙ୍କ୍ ଥିଲେ ଅଲଗାରେ ଦିଅନ୍ତୁ।','message-label':'ସନ୍ଦେଶ କିମ୍ବା କଲ୍‌ର ଲିଖିତ ବିବରଣୀ','message-limit':'ସର୍ବାଧିକ 4,000 ଅକ୍ଷର','try-example':'ନମୁନା ସନ୍ଦେଶ ଦେଖନ୍ତୁ ↗','url-label':'ସନ୍ଦେଶରେ ଥିବା ଲିଙ୍କ୍','url-note':'ଇଚ୍ଛାଧୀନ · ନଖୋଲି ଯାଞ୍ଚ','url-placeholder':'ଲିଙ୍କ୍ କିମ୍ବା ଡୋମେନ୍ ଏଠାରେ ଦିଅନ୍ତୁ','analyze-button':'ବିପଦ ସଙ୍କେତ ଯାଞ୍ଚ','input-local-note':'ଏହି ବ୍ରାଉଜର କିମ୍ବା ସ୍ଥାନୀୟ Java ସେବାରେ ଯାଞ୍ଚ।','before-act':'କାର୍ଯ୍ୟ ପୂର୍ବରୁ','three-rules':'ମନେ ରଖିବାକୁ ତିନୋଟି କଥା','rule-otp-title':'OTP କିମ୍ବା PIN କାହାକୁ କୁହନ୍ତୁ ନାହିଁ','rule-otp-copy':'ବ୍ୟାଙ୍କରୁ ବୋଲି କହୁଥିଲେ ମଧ୍ୟ ନୁହେଁ।','rule-upi-title':'ଟଙ୍କା ପାଇବାକୁ ଟଙ୍କା ଦେବାକୁ ପଡ଼େ ନାହିଁ','rule-upi-copy':'UPI PIN ଦେଲେ ଆପଣଙ୍କ ଖାତାରୁ ଟଙ୍କା ଯାଏ।','rule-pressure-title':'କେହି ଚାପ ଦେଲେ ଅଟକନ୍ତୁ','rule-pressure-copy':'ନିଜେ ଖୋଜିଥିବା ନମ୍ବରରେ ସଂସ୍ଥାକୁ ଫୋନ୍ କରନ୍ତୁ।','report-link':'ସରକାରୀ ସାଇବର ଅପରାଧ ରିପୋର୍ଟ ପୋର୍ଟାଲ୍ ↗',
      'result-kicker':'ଆପଣଙ୍କ ଯାଞ୍ଚ ଫଳ','score-label':'ସଙ୍କେତ ଅଙ୍କ','score-note':'ନିୟମ ଅଙ୍କ · ଠକେଇର ସମ୍ଭାବନା ନୁହେଁ','signals-title':'କାହିଁକି ସତର୍କ କରାଗଲା','actions-title':'ସୁରକ୍ଷିତ ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ','copy-result':'ସୁରକ୍ଷା ସାରାଂଶ କପି','copy-done':'ସୁରକ୍ଷା ସାରାଂଶ କପି ହେଲା।','copy-failed':'ଏହି ବ୍ରାଉଜରରେ କପି ସୁବିଧା ନାହିଁ।','risk-critical':'ଗୁରୁତର ସତର୍କ ସଙ୍କେତ','risk-high':'ଅନେକ ବିପଦ ସଙ୍କେତ','risk-caution':'ଅଟକନ୍ତୁ ଓ ଯାଞ୍ଚନ୍ତୁ','risk-low':'କୌଣସି ସ୍ପଷ୍ଟ ପରିଚିତ ସଙ୍କେତ ମିଳିଲା ନାହିଁ','no-signals':'ପରିଚିତ ସତର୍କ ସଙ୍କେତ ମିଳିଲା ନାହିଁ। ଏହା ବିଷୟବସ୍ତୁ ସୁରକ୍ଷିତ ବୋଲି ପ୍ରମାଣ ନୁହେଁ।',
      'qr-kicker':'QR ଓ ଦେୟ ସୁରକ୍ଷା','qr-title':'ସ୍କାନ୍ କିମ୍ବା ଦେୟ ପୂର୍ବରୁ ଯାଞ୍ଚନ୍ତୁ','qr-help':'କ୍ୟାମେରାରେ ସ୍କାନ୍ କରନ୍ତୁ, QR ଛବି ବାଛନ୍ତୁ କିମ୍ବା ଡିକୋଡ୍ ପାଠ୍ୟ ଦିଅନ୍ତୁ। ScamSathi ଲିଙ୍କ୍ ଖୋଲିବ ନାହିଁ କିମ୍ବା ଦେୟ ଆରମ୍ଭ କରିବ ନାହିଁ।','open-scanner':'QR ସ୍କାନର୍ ଖୋଲନ୍ତୁ','camera-note':'“ସ୍କାନ୍ ଆରମ୍ଭ” ଦବାଇଲେ ମାତ୍ର କ୍ୟାମେରା ଅନୁମତି ମଗାଯିବ। HTTPS କିମ୍ବା localhost ଆବଶ୍ୟକ।','qr-paste-label':'QR ରୁ ଡିକୋଡ୍ ହୋଇଥିବା ପାଠ୍ୟ ଦିଅନ୍ତୁ','qr-paste-note':'ସର୍ବାଧିକ 4,096 ଅକ୍ଷର','qr-placeholder':'upi://pay?pa=merchant@example&pn=Merchant&am=10&cu=INR','inspect-qr':'QR ବିଷୟବସ୍ତୁ ଯାଞ୍ଚ','upi-unverified':'QR ର UPI ବିବରଣୀ ଯାଞ୍ଚ ହୋଇନାହିଁ। ଆପଣଙ୍କ UPI ଆପ୍‌ରେ ଗ୍ରହୀତା ଓ ରାଶି ଯାଞ୍ଚନ୍ତୁ।','qr-result-kicker':'QR ଯାଞ୍ଚ ଫଳ',
      'learn-kicker':'ଅଟକି ଯାଞ୍ଚନ୍ତୁ','learn-title':'ଚାପ ପକାଇବା କୌଶଳ ଚିହ୍ନନ୍ତୁ','learn-copy':'ନମୁନାଗୁଡ଼ିକ ScamSathi ବୁଝାଇପାରୁଥିବା ସତର୍କ ସଙ୍କେତ ଦେଖାଏ।','what-notice':'କ’ଣ ଧ୍ୟାନ ଦେବେ',
      'audio-kicker':'ସ୍ୱର ଠକେଇରୁ ସୁରକ୍ଷା','audio-title':'ଅଡିଓ ଡିପ୍‌ଫେକ୍ ଯାଞ୍ଚ ଉପଲବ୍ଧ ନାହିଁ','audio-copy':'ScamSathi ରେକର୍ଡିଂ ଅପଲୋଡ୍ କିମ୍ବା ଯାଞ୍ଚ କରେ ନାହିଁ ଏବଂ ସ୍ୱର ନକଲି କି ନୁହେଁ ପ୍ରମାଣ କରିପାରେ ନାହିଁ। କଲ୍‌ରେ ତୁରନ୍ତ ଟଙ୍କା ମାଗିଲେ, କଲ୍ କାଟି ପୂର୍ବରୁ ଭରସା କରୁଥିବା ନମ୍ବରରେ ସେହି ବ୍ୟକ୍ତିଙ୍କୁ ଫୋନ୍ କରନ୍ତୁ।',
      'help-kicker':'ଯଦି ଖାତାରୁ ଟଙ୍କା କଟିଯାଇଛି','help-title':'ଶୀଘ୍ର କାର୍ଯ୍ୟ କରନ୍ତୁ। ବ୍ୟାଙ୍କ ସହ ଯୋଗାଯୋଗ ଓ ରିପୋର୍ଟ କରନ୍ତୁ।','help-copy':'ଭାରତରେ ଫୋନ୍ କରନ୍ତୁ','help-copy-2':'କିମ୍ବା ଭାରତ ସରକାରଙ୍କ','portal-name':'ଜାତୀୟ ସାଇବର ଅପରାଧ ରିପୋର୍ଟିଂ ପୋର୍ଟାଲ୍','open-portal':'ସରକାରୀ ପୋର୍ଟାଲ୍ ଖୋଲନ୍ତୁ ↗','limits-title':'ଏହି ଟୁଲ୍ କ’ଣ କହିପାରେ ଓ କ’ଣ ନୁହେଁ','limits-copy':'ScamSathi ସନ୍ଦେଶ ପାଠ୍ୟ, URL ଗଠନ ଓ ଡିକୋଡ୍ QR ବିଷୟବସ୍ତୁର ସଙ୍କେତ ଚିହ୍ନିବାକୁ ନିୟମ ବ୍ୟବହାର କରେ। ଏଥିରେ ପ୍ରଶିକ୍ଷିତ ଠକେଇ ମଡେଲ୍, ଅନଲାଇନ୍ ବିପଦ ଫିଡ୍ କିମ୍ବା ବ୍ୟାଙ୍କ ଯାଞ୍ଚ ନାହିଁ। ଅଙ୍କ ସମ୍ଭାବନା କିମ୍ବା ନିଶ୍ଚିତ ରାୟ ନୁହେଁ; କମ୍ ଅଙ୍କ ସୁରକ୍ଷା ପ୍ରମାଣ କରେ ନାହିଁ। ଏହା କଲ୍ ଶୁଣେ ନାହିଁ, ଲିଙ୍କ୍ ଖୋଲେ ନାହିଁ, ଦେୟ ଅଟକାଏ ନାହିଁ କିମ୍ବା ରିପୋର୍ଟ ଦାଖଲ କରେ ନାହିଁ। ସନ୍ଦେଶ ବିଷୟବସ୍ତୁ ରଖାଯାଏ ନାହିଁ।','footer-tag':'ଦେୟ ପୂର୍ବରୁ ଅଟକି ଯାଞ୍ଚ କରିବାରେ ସହାୟତା।','source-link':'ସୋର୍ସ କୋଡ୍ ↗','footer-tech':'ପ୍ରୋଟୋଟାଇପ୍ · ବୁଝାଯୋଗ୍ୟ ନିୟମ',
      'error-empty':'ପ୍ରଥମେ ସନ୍ଦେଶ କିମ୍ବା ଲିଙ୍କ୍ ଦିଅନ୍ତୁ।','error-qr-empty':'ପ୍ରଥମେ QR ରୁ ମିଳିଥିବା ପାଠ୍ୟ ଦିଅନ୍ତୁ।','error-too-long':'ବିଷୟବସ୍ତୁ ଅନୁମତି ଅକ୍ଷର ସୀମାଠାରୁ ଅଧିକ।','error-analysis':'ଏହି ବିଷୟବସ୍ତୁ ଯାଞ୍ଚ ହୋଇପାରିଲା ନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।','recent-message':'ସନ୍ଦେଶ ଯାଞ୍ଚ','recent-qr':'QR ଯାଞ୍ଚ','recent-warning':'ସତର୍କ ସଙ୍କେତ','recent-clear':'କୌଣସି ସତର୍କ ସଙ୍କେତ ନାହିଁ','score-disclaimer':'ଏହା ନିୟମ ଆଧାରିତ ସତର୍କତା, ସମ୍ଭାବନା କିମ୍ବା ଗ୍ୟାରେଣ୍ଟି ନୁହେଁ। କମ୍ ଅଙ୍କ ସୁରକ୍ଷା ପ୍ରମାଣ କରେ ନାହିଁ।','summary-critical':'ଅନେକ ଗୁରୁତର ସତର୍କ ସଙ୍କେତ ମିଳିଛି। କିଛି କରିବା ପୂର୍ବରୁ ଅଟକି ଅଲଗାରେ ଯାଞ୍ଚନ୍ତୁ।','summary-high':'ଅନେକ ସତର୍କ ସଙ୍କେତ ମିଳିଛି। ଯାଞ୍ଚ ପୂର୍ବରୁ ଉତ୍ତର, କ୍ଲିକ୍, କୋଡ୍ ସେୟାର୍ କିମ୍ବା ଦେୟ ଅନୁମୋଦନ କରନ୍ତୁ ନାହିଁ।','summary-caution':'ଏକ କିମ୍ବା ଅଧିକ ସତର୍କ ସଙ୍କେତ ମିଳିଛି। ସରକାରୀ ଆପ୍ କିମ୍ବା ସଂପର୍କ ମାଧ୍ୟମରେ ଯାଞ୍ଚନ୍ତୁ।','summary-low':'କୌଣସି ଶକ୍ତିଶାଳୀ ପରିଚିତ ସଙ୍କେତ ମିଳିଲା ନାହିଁ। ଏହା ବିଷୟବସ୍ତୁ ସୁରକ୍ଷିତ ବୋଲି ପ୍ରମାଣ ନୁହେଁ।',
      'scanner-back':'← ScamSathi କୁ ଫେରନ୍ତୁ','scanner-title':'QR ସ୍କାନ୍ କରି ଯାଞ୍ଚନ୍ତୁ','scanner-desc':'ସ୍କାନର୍ QR ପଢ଼ି ତାହାର ବିଷୟବସ୍ତୁ ବୁଝାଏ। ଏହା ଲିଙ୍କ୍ ଖୋଲେ ନାହିଁ, କ୍ୟାମେରା ଭିଡିଓ ସେୟାର୍ କରେ ନାହିଁ କିମ୍ବା ଦେୟ ଆରମ୍ଭ କରେ ନାହିଁ।','scan-idle':'ଆପଣ ସ୍କାନ୍ ଆରମ୍ଭ ନକରିବା ପର୍ଯ୍ୟନ୍ତ କ୍ୟାମେରା ବନ୍ଦ ରହିବ।','start-scan':'ସ୍କାନ୍ ଆରମ୍ଭ','pause-scan':'ସ୍କାନ୍ ବିରତି','resume-scan':'ପୁଣି ଆରମ୍ଭ','switch-camera':'କ୍ୟାମେରା ବଦଳାନ୍ତୁ','flashlight':'ଫ୍ଲାସଲାଇଟ୍','stop-scan':'କ୍ୟାମେରା ବନ୍ଦ','scan-starting':'କ୍ୟାମେରା ଆରମ୍ଭ ହେଉଛି…','scan-active':'କ୍ୟାମେରା ଚାଲୁ ଅଛି। QR କୁ ଫ୍ରେମ୍ ଭିତରେ ରଖନ୍ତୁ।','scan-paused':'ସ୍କାନ୍ ବିରତି ହୋଇଛି। ପ୍ରସ୍ତୁତ ହେଲେ ପୁଣି ଆରମ୍ଭ କରନ୍ତୁ।','scan-no-camera':'କ୍ୟାମେରା ମିଳିଲା ନାହିଁ। QR ଛବି କିମ୍ବା ପାଠ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ।','scan-camera-blocked':'କ୍ୟାମେରା ଅନୁମତି ମିଳିଲା ନାହିଁ। ବ୍ରାଉଜର ସେଟିଂରେ ଅନୁମତି ଦିଅନ୍ତୁ କିମ୍ବା ଛବି/ପାଠ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ।','scan-camera-failed':'କ୍ୟାମେରା ଆରମ୍ଭ ହୋଇପାରିଲା ନାହିଁ। କ୍ୟାମେରା ଉପଲବ୍ଧ ଅଛି କି ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।','flash-unavailable':'ଏହି କ୍ୟାମେରାରେ ଫ୍ଲାସଲାଇଟ୍ ନାହିଁ।','image-title':'QR ଛବି ବ୍ୟବହାର କରନ୍ତୁ','image-help':'ଏହି ଡିଭାଇସ୍‌ରେ ସଞ୍ଚିତ ଛବି ବାଛନ୍ତୁ। ବ୍ରାଉଜରରେ ପଢ଼ାଯିବ, ଅପଲୋଡ୍ ହେବ ନାହିଁ।','file-label':'QR ଛବି ବାଛନ୍ତୁ','file-limit':'10 MB ପର୍ଯ୍ୟନ୍ତ ଛବି। ପଢ଼ି ନହେଲେ ସ୍ପଷ୍ଟ ନିକଟ ଛବି ବାଛନ୍ତୁ।','manual-title':'QR ପାଠ୍ୟ ଦିଅନ୍ତୁ','manual-help':'ଅନ୍ୟ QR ରିଡର୍ ପଢ଼ିଥିଲେ ସେହି ପାଠ୍ୟ ଏଠାରେ ଦିଅନ୍ତୁ।','manual-button':'ଦିଆଯାଇଥିବା ପାଠ୍ୟ ଯାଞ୍ଚ','decoded-title':'QR ବିଷୟବସ୍ତୁ ଯାଞ୍ଚ ହେଲା','scanner-safe-note':'କ୍ୟାମେରା ପାଇଁ ସୁରକ୍ଷିତ ପେଜ୍ (HTTPS କିମ୍ବା localhost) ଦରକାର। ଭିଡିଓ ବ୍ରାଉଜରରେ ପଢ଼ାଯାଏ, ଅପଲୋଡ୍ ହୁଏ ନାହିଁ। UPI ଆପ୍‌ରେ ସମସ୍ତ ଦେୟ ବିବରଣୀ ଯାଞ୍ଚନ୍ତୁ।','qr-analysis-loading':'QR ପଢ଼ାଗଲା। ସତର୍କ ସଙ୍କେତ ଯାଞ୍ଚ ହେଉଛି…','scan-complete':'QR ଯାଞ୍ଚ ହେଲା। କୌଣସି ଲିଙ୍କ୍ ଖୋଲା କିମ୍ବା ଦେୟ ଆରମ୍ଭ ହେଲା ନାହିଁ।','file-invalid':'ଠିକ୍ ଛବି ଫାଇଲ୍ ବାଛନ୍ତୁ।','file-too-large':'ଏହି ଛବି 10 MB ସୀମାଠାରୁ ବଡ଼।','image-checking':'ଛବିରେ QR ଖୋଜାଯାଉଛି…','scan-no-code':'ଛବିରେ QR ମିଳିଲା ନାହିଁ। ସ୍ପଷ୍ଟ ଛବି ବାଛନ୍ତୁ କିମ୍ବା ପାଠ୍ୟ ଦିଅନ୍ତୁ।'
    }
  };

  const SIGNALS = {
    hi: {
      secret:['ଗୁପ୍ତ କୋଡ୍ କିମ୍ବା ପାସୱାର୍ଡ ମାଗିବା','OTP, PIN, CVV କିମ୍ବା ପାସୱାର୍ଡ କହିଦେଲେ ଆପଣଙ୍କ ଖାତାର ନିୟନ୍ତ୍ରଣ ଅନ୍ୟଙ୍କ ହାତକୁ ଯାଇପାରେ। ଏହା କାହାକୁ କୁହନ୍ତୁ ନାହିଁ।'],
      receive_fee:['ଟଙ୍କା ପାଇବାକୁ ପ୍ରଥମେ ଦେୟ ମାଗିବା','ରିଫଣ୍ଡ କିମ୍ବା ପୁରସ୍କାର ପାଇଁ ପ୍ରଥମେ ଦେୟ ମାଗିବା ଠକେଇର ସାଧାରଣ ସଙ୍କେତ। UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଏ।'],
      remote_access:['ରିମୋଟ୍ ଆକ୍ସେସ୍ କିମ୍ବା ଅଜଣା ଆପ୍ ମାଗିବା','ରିମୋଟ୍ କଣ୍ଟ୍ରୋଲ୍ ଟୁଲ୍, ସ୍କ୍ରିନ୍ ଶେୟାର୍ କିମ୍ବା ଅଜଣା APK ଆପଣଙ୍କ ବାର୍ତ୍ତା ଓ ବ୍ୟାଙ୍କ ସୂଚନା ଦେଖାଇପାରେ।'],
      pressure:['ତରବର, ଧମକ କିମ୍ବା କର୍ତ୍ତୃପକ୍ଷଙ୍କ ଭୟ','ଠକମାନେ ଯାଞ୍ଚ ବନ୍ଦ କରିବାକୁ ଭୟ ସୃଷ୍ଟି କରନ୍ତି। ନିଜେ ଖୋଜିଥିବା ନମ୍ବରରେ ସଂସ୍ଥାକୁ ଯୋଗାଯୋଗ କରନ୍ତୁ।'],
      bait:['ତରବରିଆ କାର୍ଯ୍ୟ କରିବାକୁ କୁହାଯାଇଛି','ପଠାଇଥିବା ବ୍ୟକ୍ତି କିମ୍ବା ଲିଙ୍କ୍ ଯାଞ୍ଚ ପୂର୍ବରୁ କାର୍ଯ୍ୟ କରିବାକୁ ଚାପ ଦିଆଯାଉଛି।'],
      payment_direction:['UPI ଦେୟ ଦିଗ ନେଇ ଚାଲ୍ ହୋଇପାରେ','କଲେକ୍ଟ ଅନୁରୋଧ ଗ୍ରହଣ କିମ୍ବା UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଇପାରେ। ଅନୁମୋଦନ ପୂର୍ବରୁ ପେମେଣ୍ଟ୍ ସ୍କ୍ରିନ୍ ପଢ଼ନ୍ତୁ।'],
      malformed_url:['ଲିଙ୍କ୍ ଠିକଣା ଅସାଧାରଣ ଦେଖାଯାଉଛି','ଏହି ଠିକଣାକୁ ସାଧାରଣ ୱେବ୍ ଡୋମେନ୍ ଭାବେ ପଢ଼ିହେଲା ନାହିଁ। ସନ୍ଦେଶରୁ ଏହା ଖୋଲନ୍ତୁ ନାହିଁ।'],
      unencrypted:['ଲିଙ୍କ୍‌ରେ HTTPS ନାହିଁ','ଏହି ଲିଙ୍କ୍‌ରେ ସୁରକ୍ଷିତ HTTPS ସଂଯୋଗ ନାହିଁ। ଏଠାରେ ବ୍ୟକ୍ତିଗତ କିମ୍ବା ଦେୟ ସୂଚନା ଦିଅନ୍ତୁ ନାହିଁ।'],
      ip_host:['ଲିଙ୍କ୍‌ରେ ସଂଖ୍ୟାତ୍ମକ ଠିକଣା ଅଛି','ପରିଚିତ ସଂସ୍ଥା ଡୋମେନ୍ ପରିବର୍ତ୍ତେ ସଂଖ୍ୟା ଠିକଣା ଅସାଧାରଣ।'],
      shortener:['ସଂକ୍ଷିପ୍ତ ଲିଙ୍କ୍ ଗନ୍ତବ୍ୟ ଲୁଚାଏ','ଅସଲି ଗନ୍ତବ୍ୟ ଦେଖାଯାଉନାହିଁ। ଖୋଲିବା ପରିବର୍ତ୍ତେ ଅଲଗାରେ ଯାଞ୍ଚନ୍ତୁ।'],
      brand_mismatch:['ବ୍ରାଣ୍ଡ୍ ନାମ ଅସଲି ଡୋମେନ୍‌ରେ ନାହିଁ','ଠିକଣାରେ ପରିଚିତ ବ୍ରାଣ୍ଡ୍ ନାମ ଅଛି, କିନ୍ତୁ ଡୋମେନ୍ ଅଲଗା। URL ରେ ବ୍ରାଣ୍ଡ୍ ନାମ ଥିଲେ ମଧ୍ୟ ଏହା ସରକାରୀ ନୁହେଁ।'],
      lookalike:['ଡୋମେନ୍ ପରିଚିତ ବ୍ରାଣ୍ଡ୍ ପରି ଦେଖାଯାଏ','ଏକ ଡୋମେନ୍ ଅଂଶ ପରିଚିତ ବ୍ରାଣ୍ଡ୍ ପରି, କିନ୍ତୁ ଠିକ୍ ସେହି ନୁହେଁ। ପୂରା ଡୋମେନ୍ ପଢ଼ନ୍ତୁ।'],
      idn:['ଆନ୍ତର୍ଜାତୀୟ ଅକ୍ଷର ଥିବା ଡୋମେନ୍‌ରେ ସତର୍କ ରୁହନ୍ତୁ','ଏହି ଡୋମେନ୍‌ରେ ଏନକୋଡ୍ କିମ୍ବା ଅଣ-ASCII ଅକ୍ଷର ଅଛି। ଦେଖିବାକୁ ସମାନ ଅକ୍ଷର ଠିକଣାକୁ ଭ୍ରମିତ କରିପାରେ।'],
      userinfo:['ଲିଙ୍କ୍‌ରେ ଭ୍ରମିତ କରୁଥିବା ସାଇନ୍-ଇନ୍ ଲେଖା ଅଛି','@ ଚିହ୍ନ ପୂର୍ବର ଲେଖା ଲିଙ୍କ୍‌କୁ ଭରସାଯୋଗ୍ୟ ଦେଖାଇପାରେ। ଅସଲି ସାଇଟ୍ @ ପରେ ଥାଏ।'],
      uncommon_tld:['ଅସାଧାରଣ ଡୋମେନ୍ ଶେଷ ଅଂଶ','ବ୍ୟାଙ୍କ ଓ ପେମେଣ୍ଟ୍ ସେବା ପାଇଁ ଏହି ଶେଷ ଅଂଶ କମ୍ ସାଧାରଣ। ଟଙ୍କା କିମ୍ବା ଗୁପ୍ତ ସୂଚନା ମାଗିଲେ ସତର୍କ ରୁହନ୍ତୁ।'],
      unknown_scheme:['QR ରେ ଅଜଣା ପ୍ରକାରର ଗନ୍ତବ୍ୟ ଅଛି','ଏହି QR ବିଷୟବସ୍ତୁକୁ ScamSathi ଯାଞ୍ଚ କରେ ନାହିଁ। ନବୁଝିଲେ ଏହା ଖୋଲନ୍ତୁ କିମ୍ବା ଅନୁମୋଦନ କରନ୍ତୁ ନାହିଁ।'],
      upi_qr:['UPI ଦେୟ QR ଚିହ୍ନଟ ହେଲା','ଏହି QR UPI ଦେୟ ଆରମ୍ଭ କରିପାରେ। PIN ଦେବା ପୂର୍ବରୁ ନିଜ UPI ଆପ୍‌ରେ ଗ୍ରହୀତା ଓ ରାଶି ଯାଞ୍ଚନ୍ତୁ।'],
      upi_missing_payee:['UPI QR ରେ ଗ୍ରହୀତା ଠିକଣା ଦେଖାଯାଉନାହିଁ','ଆପ୍‌ରେ ଗ୍ରହୀତା ସ୍ପଷ୍ଟ ଦେଖାନଦେଲେ ଆଗକୁ ବଢ଼ନ୍ତୁ ନାହିଁ।'],
      qr_url:['QR ରେ ୱେବ୍ ଲିଙ୍କ୍ ଅଛି','QR ଭିତରେ ଫିସିଂ ଲିଙ୍କ୍ ଲୁଚିଥାଇପାରେ। ଏହା ଖୋଲିବା ପରିବର୍ତ୍ତେ ଡୋମେନ୍ ଅଲଗାରେ ଯାଞ୍ଚନ୍ତୁ।'],
      qr_unknown:['QR ରେ ପାଠ୍ୟ କିମ୍ବା ଅଜଣା ବିଷୟବସ୍ତୁ ଅଛି','QR ତଥ୍ୟ ଜଣା UPI ଦେୟ କିମ୍ବା ୱେବ୍ ଲିଙ୍କ୍ ନୁହେଁ। କେବଳ QR ଥିବାରୁ ଭରସା କରନ୍ତୁ ନାହିଁ।'],
      qr_parse:['UPI QR ଫର୍ମାଟ୍ ଅସାଧାରଣ','ଦେୟ ବିବରଣୀ ଭରସାଯୋଗ୍ୟ ଭାବେ ପଢ଼ିହେଲା ନାହିଁ। ଆପ୍‌ରେ ସବୁ ବିବରଣୀ ଦେଖାନଦେଲେ ଆଗକୁ ଯାଆନ୍ତୁ ନାହିଁ।']
    },
    or: {
      secret:['गुप्त कोड या पासवर्ड की मांग','OTP, PIN, CVV या पासवर्ड बताने से कोई आपके खाते का नियंत्रण पा सकता है। ये राज़ किसी को न बताएं।'],
      receive_fee:['पैसे पाने के लिए पहले भुगतान की मांग','रिफंड या इनाम पाने के लिए पहले भुगतान मांगना धोखाधड़ी का आम संकेत है। UPI PIN से पैसा बाहर जाता है।'],
      remote_access:['रिमोट एक्सेस या अनजान ऐप की मांग','रिमोट कंट्रोल टूल, स्क्रीन शेयरिंग या अनजान APK से संदेश और बैंक गतिविधि देखी जा सकती है।'],
      pressure:['जल्दी करने का दबाव, धमकी या अधिकार का डर','धोखेबाज़ जांच रोकने के लिए डर पैदा करते हैं। संस्था से उस नंबर पर संपर्क करें जिसे आपने खुद खोजा हो।'],
      bait:['जल्दी कार्रवाई के लिए उकसाया गया','भेजने वाले या लिंक की जांच से पहले कार्रवाई करने का दबाव दिया जा रहा है।'],
      payment_direction:['UPI भुगतान की दिशा से जुड़ी चाल हो सकती है','कलेक्ट अनुरोध स्वीकार करने या PIN डालने से पैसा बाहर जा सकता है। मंज़ूरी से पहले भुगतान स्क्रीन पढ़ें।'],
      malformed_url:['लिंक का पता असामान्य है','इसे सामान्य वेब डोमेन की तरह पढ़ा नहीं जा सका। इसे संदेश से न खोलें।'],
      unencrypted:['लिंक में HTTPS नहीं है','इस लिंक में सुरक्षित HTTPS कनेक्शन नहीं है। यहाँ निजी या भुगतान जानकारी न डालें।'],
      ip_host:['लिंक में संख्यात्मक पता है','पहचाने जाने वाले संस्था डोमेन की जगह संख्यात्मक पता असामान्य है।'],
      shortener:['छोटा लिंक असली गंतव्य छिपाता है','असली गंतव्य दिखाई नहीं देता। खोलने के बजाय अलग से जांचें।'],
      brand_mismatch:['ब्रांड नाम उसके असली डोमेन पर नहीं है','पते में जाना-पहचाना ब्रांड है, लेकिन डोमेन अलग है। URL में ब्रांड नाम होना आधिकारिक होने का प्रमाण नहीं है।'],
      lookalike:['डोमेन जाना-पहचाना ब्रांड जैसा दिखता है','एक डोमेन हिस्सा किसी ब्रांड जैसा है, लेकिन बिल्कुल वही नहीं। पूरा डोमेन ध्यान से पढ़ें।'],
      idn:['अंतरराष्ट्रीय अक्षरों वाले डोमेन पर ध्यान दें','इस डोमेन में एन्कोड किए या गैर-ASCII अक्षर हैं। मिलते-जुलते अक्षर गंतव्य को पहचानना कठिन बना सकते हैं।'],
      userinfo:['लिंक में भ्रमित करने वाला साइन-इन पाठ है','@ से पहले का पाठ लिंक को भरोसेमंद दिखा सकता है। असली साइट @ के बाद होती है।'],
      uncommon_tld:['डोमेन का अंत असामान्य है','बैंक और भुगतान सेवाओं के लिए यह अंत कम आम है। पैसे या गोपनीय जानकारी मांगे जाने पर सतर्क रहें।'],
      unknown_scheme:['QR में असमर्थित प्रकार का गंतव्य है','ScamSathi इस QR सामग्री की जांच नहीं करता। समझ न आए तो इसे न खोलें या मंज़ूर न करें।'],
      upi_qr:['UPI भुगतान QR मिला','यह QR UPI भुगतान शुरू कर सकता है। PIN डालने से पहले अपने UPI ऐप में प्राप्तकर्ता और राशि जांचें।'],
      upi_missing_payee:['UPI QR में प्राप्तकर्ता का पता नहीं दिखता','अगर ऐप प्राप्तकर्ता को साफ़ नहीं दिखाता तो आगे न बढ़ें।'],
      qr_url:['QR में वेब लिंक है','QR में फ़िशिंग लिंक छिपा हो सकता है। खोलने के बजाय डोमेन अलग से जांचें।'],
      qr_unknown:['QR में पाठ या असमर्थित सामग्री है','QR डेटा पहचाना गया UPI भुगतान या वेब लिंक नहीं है। सिर्फ़ QR होने से भरोसा न करें।'],
      qr_parse:['UPI QR का प्रारूप असामान्य है','भुगतान जानकारी भरोसे से पढ़ी नहीं जा सकी। ऐप में सभी विवरण दिखने तक आगे न बढ़ें।']
    }
  };

  const EXAMPLES = {
    en: [
      { tag:'FAKE KYC ALERT', quote:'“Your account will be blocked in 2 hours. Update KYC now and share your OTP with our agent.”', explain:'Urgency, an account threat, and a request for an OTP. A real bank will not ask you to tell someone your OTP.', url:'http://sbi-verify.example.xyz/login' },
      { tag:'UPI REFUND TRICK', quote:'“Scan this QR to receive your refund, then enter your UPI PIN to confirm.”', explain:'A UPI PIN authorizes money going out. It is not needed to receive a refund or payment.', url:'' },
      { tag:'FAKE DELIVERY FEE', quote:'“Your parcel is on hold. Pay a small redelivery fee using this link today.”', explain:'Unexpected delivery fees and short deadlines are a reason to check the courier using its official app.', url:'https://delivery-fee.example.xyz/track' }
    ],
    hi: [
      { tag:'नकली KYC चेतावनी', quote:'“2 घंटे में आपका खाता बंद हो जाएगा। अभी KYC अपडेट करें और एजेंट को OTP बताएं।”', explain:'जल्दबाज़ी, खाते की धमकी और OTP की मांग। असली बैंक आपसे OTP बताने को नहीं कहेगा।', url:'http://sbi-verify.example.xyz/login' },
      { tag:'UPI रिफंड की चाल', quote:'“रिफंड पाने के लिए यह QR स्कैन करें और पुष्टि के लिए UPI PIN डालें।”', explain:'UPI PIN से पैसा खाते से बाहर जाता है। रिफंड पाने के लिए PIN की ज़रूरत नहीं होती।', url:'' },
      { tag:'नकली डिलीवरी शुल्क', quote:'“आपका पार्सल रुका है। आज ही इस लिंक से दोबारा भेजने का शुल्क दें।”', explain:'अचानक मांगा गया डिलीवरी शुल्क और जल्दी की समय-सीमा हो तो कूरियर के आधिकारिक ऐप में जांचें।', url:'https://delivery-fee.example.xyz/track' }
    ],
    or: [
      { tag:'ନକଲି KYC ସତର୍କତା', quote:'“2 ଘଣ୍ଟାରେ ଆପଣଙ୍କ ଖାତା ବନ୍ଦ ହେବ। ଏବେ KYC କରନ୍ତୁ ଓ ଏଜେଣ୍ଟ୍‌ଙ୍କୁ OTP କୁହନ୍ତୁ।”', explain:'ତରବର, ଖାତା ବନ୍ଦ ଧମକ ଓ OTP ମାଗିବା। ଅସଲି ବ୍ୟାଙ୍କ OTP କହିବାକୁ କହେ ନାହିଁ।', url:'http://sbi-verify.example.xyz/login' },
      { tag:'UPI ରିଫଣ୍ଡ ଚାଲ୍', quote:'“ରିଫଣ୍ଡ ପାଇଁ ଏହି QR ସ୍କାନ୍ କରନ୍ତୁ ଏବଂ UPI PIN ଦିଅନ୍ତୁ।”', explain:'UPI PIN ଦେଲେ ଖାତାରୁ ଟଙ୍କା ଯାଏ। ରିଫଣ୍ଡ ପାଇବା ପାଇଁ PIN ଦରକାର ନାହିଁ।', url:'' },
      { tag:'ନକଲି ଡେଲିଭରି ଫି', quote:'“ଆପଣଙ୍କ ପାର୍ସଲ୍ ଅଟକିଛି। ଆଜି ଏହି ଲିଙ୍କ୍‌ରେ ପୁନଃ ଡେଲିଭରି ଶୁଳ୍କ ଦିଅନ୍ତୁ।”', explain:'ହଠାତ୍ ଡେଲିଭରି ଶୁଳ୍କ ଓ ତରବରିଆ ସମୟ ଥିଲେ ସରକାରୀ କୁରିଅର୍ ଆପ୍‌ରେ ଯାଞ୍ଚନ୍ତୁ।', url:'https://delivery-fee.example.xyz/track' }
    ]
  };

  const ACTIONS = {
    hi: {
      otp:'OTP, PIN, CVV, पासवर्ड या स्क्रीन एक्सेस साझा न करें।',
      verify:'उस संस्था से ऐसे नंबर या ऐप पर संपर्क करें जिसे आपने खुद खोजा हो।',
      payment:'UPI PIN से पैसा बाहर जाता है। मंज़ूरी से पहले प्राप्तकर्ता और राशि पढ़ें।',
      link:'संदेश में दिया लिंक न खोलें। गंतव्य अलग से जांचें।',
      report:'पैसा खो गया हो तो बैंक से संपर्क करें और भारत में 1930 पर तुरंत कॉल करें।',
      uncertain:'समझ न आए तो कार्रवाई से पहले किसी भरोसेमंद व्यक्ति से पूछें।',
      qr:'अलग से पुष्टि करने तक QR से भुगतान या लिंक न खोलें।'
    },
    or: {
      otp:'OTP, PIN, CVV, ପାସୱାର୍ଡ କିମ୍ବା ସ୍କ୍ରିନ୍ ଆକ୍ସେସ୍ କାହାକୁ ଦିଅନ୍ତୁ ନାହିଁ।',
      verify:'ନିଜେ ଖୋଜିଥିବା ନମ୍ବର କିମ୍ବା ଆପ୍‌ରେ ସଂସ୍ଥା ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।',
      payment:'UPI PIN ଦେଲେ ଟଙ୍କା ବାହାରକୁ ଯାଏ। ଅନୁମୋଦନ ପୂର୍ବରୁ ଗ୍ରହୀତା ଓ ରାଶି ପଢ଼ନ୍ତୁ।',
      link:'ସନ୍ଦେଶର ଲିଙ୍କ୍ ଖୋଲନ୍ତୁ ନାହିଁ। ଗନ୍ତବ୍ୟ ଅଲଗାରେ ଯାଞ୍ଚନ୍ତୁ।',
      report:'ଟଙ୍କା ହରାଇଥିଲେ ବ୍ୟାଙ୍କକୁ ଯୋଗାଯୋଗ କରନ୍ତୁ ଓ ଭାରତରେ 1930 କୁ ଶୀଘ୍ର ଫୋନ୍ କରନ୍ତୁ।',
      uncertain:'ନିଶ୍ଚିତ ନହେଲେ କାର୍ଯ୍ୟ ପୂର୍ବରୁ ଭରସାଯୋଗ୍ୟ ବ୍ୟକ୍ତିଙ୍କୁ ପଚାରନ୍ତୁ।',
      qr:'ଅଲଗାରେ ଯାଞ୍ଚ ନକରିବା ପର୍ଯ୍ୟନ୍ତ QR ଦେୟ କିମ୍ବା ଲିଙ୍କ୍ ଖୋଲନ୍ତୁ ନାହିଁ।'
    }
  };

  function t(key) { return (UI[language] && UI[language][key]) || UI.en[key] || key; }

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
    renderActivity();
  }

  function localizeSignal(signal) {
    const signalLanguage = language === 'hi' ? 'or' : language === 'or' ? 'hi' : language;
    const translated = SIGNALS[signalLanguage] && SIGNALS[signalLanguage][signal.id];
    return translated ? { ...signal, label: translated[0], detail: translated[1] } : signal;
  }

  function localizeAction(action, qr = false) {
    if (language === 'en') return action;
    const map = ACTIONS[language];
    if (/Do not share an OTP|Never share an OTP/i.test(action)) return map.otp;
    if (/Contact the organization using a number/i.test(action)) return map.verify;
    if (/A UPI PIN authorizes/i.test(action)) return map.payment;
    if (/Do not open the link/i.test(action)) return map.link;
    if (/If money was lost/i.test(action)) return map.report;
    if (/When unsure/i.test(action)) return map.uncertain;
    if (/Do not pay or open anything from the QR/i.test(action)) return map.qr;
    if (/^UPI payee address/i.test(action)) return action.replace('UPI payee address (unverified QR data):', language === 'hi' ? 'UPI प्राप्तकर्ता पता (QR में अप्रमाणित जानकारी):' : 'UPI ପ୍ରାପ୍ତକର୍ତ୍ତା ଠିକଣା (QR ର ଅଯାଞ୍ଚିତ ତଥ୍ୟ):');
    if (/^Payee display name/i.test(action)) return action.replace('Payee display name (unverified QR data):', language === 'hi' ? 'प्राप्तकर्ता का नाम (QR में अप्रमाणित जानकारी):' : 'ପ୍ରାପ୍ତକର୍ତ୍ତା ନାମ (QR ର ଅଯାଞ୍ଚିତ ତଥ୍ୟ):');
    if (/^Encoded amount/i.test(action)) return action.replace('Encoded amount:', language === 'hi' ? 'QR में दी गई राशि:' : 'QR ରେ ଥିବା ରାଶି:');
    return qr ? action : action;
  }

  function scrollTo(node) {
    if (!node) return;
    node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function renderResult(data, target) {
    if (!data || !target) return;
    target.hidden = false;
    $('[data-result-title]', target).textContent = t(`risk-${data.level}`) || data.title;
    $('[data-result-summary]', target).textContent = language === 'en' ? data.summary : t(`summary-${data.level}`);
    $('[data-result-score]', target).textContent = String(Number(data.score) || 0);
    const badge = $('[data-score-badge]', target);
    badge.className = `score-badge ${['low','caution','high','critical'].includes(data.level) ? data.level : 'caution'}`;
    $('[data-result-disclaimer]', target).textContent = t('score-disclaimer');

    const chainBox = $('[data-attack-chain]', target);
    if (chainBox) {
      const chain = data.attackChain;
      chainBox.hidden = !chain;
      if (chain) {
        const copy = CHAIN_COPY[language] || CHAIN_COPY.en;
        chainBox.classList.toggle('is-escalating', chain.count >= 2);
        $('.chain-kicker', chainBox).textContent = copy.kicker;
        $('.chain-title', chainBox).textContent = copy.title;
        $('.chain-summary', chainBox).textContent = copy.summary(chain.count);
        $('.chain-count', chainBox).textContent = copy.count(chain.count);
        $('.chain-note', chainBox).textContent = copy.note;
        const stages = $('.chain-stages', chainBox);
        stages.replaceChildren();
        chain.stages.forEach((stage, index) => {
          const item = document.createElement('li');
          item.className = `chain-stage${stage.matched ? ' is-matched' : ''}`;
          const title = document.createElement('strong');
          title.textContent = copy.stages[index];
          const state = document.createElement('small');
          state.textContent = stage.matched ? copy.found : copy.absent;
          item.append(title, state);
          stages.append(item);
        });
      }
    }

    const signalBox = $('[data-result-signals]', target);
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
        points.textContent = `+${Number(signal.points) || 0}`;
        const detail = document.createElement('p');
        detail.textContent = localized.detail;
        head.append(title, points);
        card.append(head, detail);
        signalBox.append(card);
      });
    }
    const actionBox = $('[data-result-actions]', target);
    actionBox.replaceChildren();
    (data.actions || []).forEach(action => {
      const item = document.createElement('li');
      item.textContent = localizeAction(action, target.id === 'qrResult');
      actionBox.append(item);
    });
  }

  async function postToLocalApi(path, fields) {
    const host = window.location.hostname.toLowerCase();
    // GitHub Pages is static; keep submitted content in-browser instead of POSTing it to the host.
    if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 700);
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

  async function analyzeMessage(message, url) {
    const data = await postToLocalApi('api/analyze', { message, url });
    const fallback = window.ScamSathiRules.analyze(message, url);
    if (data) data.attackChain = fallback.attackChain;
    return data || fallback;
  }

  async function analyzeQr(payload) {
    const data = await postToLocalApi('api/qr/analyze', { payload });
    return data || window.ScamSathiRules.analyzeQr(payload);
  }

  function recordActivity(kind, data) {
    activity.checks += 1;
    if (kind === 'qr') activity.qr += 1;
    if (Array.isArray(data.signals) && data.signals.length) activity.warnings += 1;
    activity.recent.unshift({ kind, level: data.level || 'low', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), warning: Boolean(data.signals && data.signals.length) });
    activity.recent = activity.recent.slice(0, 3);
    renderActivity();
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
    return `${data.title || ''} (${Number(data.score) || 0}/100 rule points)\n${data.summary || ''}\n${labels.length ? labels.join('; ') : t('no-signals')}\n${(data.actions || [])[0] || ''}\nRule-based warning, not proof of fraud.`;
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
    button.disabled = true;
    $('[data-i18n="analyze-button"]', button).textContent = language === 'en' ? 'Checking patterns…' : (language === 'hi' ? 'संकेत जाँचे जा रहे हैं…' : 'ସଙ୍କେତ ଯାଞ୍ଚ ହେଉଛି…');
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

  async function registerShareTargetWorker() {
    const status = $('#shareReady');
    if (!('serviceWorker' in navigator)) {
      if (status) status.textContent = 'Share-to-check is unavailable here; use the manual check below.';
      return;
    }
    try {
      await navigator.serviceWorker.register(new URL('sw.js', document.baseURI));
      await navigator.serviceWorker.ready;
      if (status) {
        status.textContent = 'Private share receiver is ready on this device.';
        status.classList.add('is-ready');
      }
    } catch (_) {
      if (status) status.textContent = 'Share-to-check is unavailable here; use the manual check below.';
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

  async function runQrCheck(payload, shouldScroll = true) {
    const value = String(payload || '').trim();
    const error = $('#qrError');
    if (!value) throw new TypeError(t('error-qr-empty'));
    if (value.length > 4096) throw new RangeError(t('error-too-long'));
    showError(error, '');
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
      $('[data-i18n="inspect-qr"]', button).textContent = language === 'en' ? 'Checking QR…' : (language === 'hi' ? 'QR जाँचा जा रहा है…' : 'QR ଯାଞ୍ଚ ହେଉଛି…');
      await runQrCheck(payload);
    } catch (error) {
      showError($('#qrError'), error.message || t('error-analysis'));
    } finally {
      button.disabled = false;
      $('[data-i18n="inspect-qr"]', button).textContent = t('inspect-qr');
    }
  }

  function init() {
    $('#languageSelect')?.addEventListener('change', event => { language = event.target.value; applyLanguage(); });
    $('#message')?.addEventListener('input', event => { $('#charCount').textContent = `${event.target.value.length.toLocaleString()} / 4,000`; });
    $('#exampleBtn')?.addEventListener('click', () => {
      const example = (EXAMPLES[language] || EXAMPLES.en)[exampleIndex];
      $('#message').value = example.quote;
      $('#url').value = example.url;
      $('#charCount').textContent = `${example.quote.length.toLocaleString()} / 4,000`;
      $('#message').focus();
    });
    $('#analyzeBtn')?.addEventListener('click', runMessageCheck);
    $('#qrAnalyzeBtn')?.addEventListener('click', handleQrButton);
    $('#prevCase')?.addEventListener('click', () => { exampleIndex = (exampleIndex + 2) % 3; showCase(); });
    $('#nextCase')?.addEventListener('click', () => { exampleIndex = (exampleIndex + 1) % 3; showCase(); });
    document.addEventListener('click', async event => {
      const button = event.target.closest('[data-copy-result]');
      if (!button) return;
      const target = button.closest('[data-result]');
      const data = target === $('#qrResult') || target === $('#scanResult') ? results.qr : results.message;
      if (!data) return;
      try { await navigator.clipboard.writeText(renderForCopy(data)); showToast(t('copy-done')); }
      catch (_) { showToast(t('copy-failed')); }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && event.target.matches('#url')) { event.preventDefault(); runMessageCheck(); }
    });
    applyLanguage();
  }

  window.ScamSathi = {
    analyzeQr: runQrCheck,
    renderResult,
    text: t,
    localizeSignal,
    showToast
  };
  init();
  void registerShareTargetWorker();
  void consumeSharedMessage();
})();
