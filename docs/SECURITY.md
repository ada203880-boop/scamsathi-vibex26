# Security and Privacy

## Security Approach

ScamSathi follows a security-first approach focused on user privacy and data protection:

### Core Principles

- **Local Processing**: All analysis happens locally on the user's device
- **No External Network Requests**: Unlike many fraud detection services, ScamSathi never sends URLs, messages, or data to external servers
- **Explicit Disclosure**: Clear documentation of capabilities and limitations
- **Input Validation**: Strict size and format limits
- **Security Headers**: CSP, security headers for browser protection

### Security Features

#### 1. Content Security Policy (CSP)
```http
Content-Security-Policy:
  default-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
  img-src 'self' data: blob:;
  media-src 'self' blob:;
  script-src 'self';
  style-src 'self';
  connect-src 'self';
  worker-src 'self' blob:;
  font-src 'self' data:;
```

#### 2. Input Validation
- Message: Max 4,000 characters
- URL: Max 2,048 characters  
- QR payload: Max 4,096 characters
- All requests validated before processing

#### 3. Request Size Limits
```java
// Java backend limits
private static final int MAX_MESSAGE = 4_000;
private static final int MAX_URL = 2_048;
private static final int MAX_QR = 4_096;
```

#### 4. URL and Link Security
- Never opens external URLs
- Static analysis of link structure
- Punycode and lookalike detection
- Brand impersonation detection
- No click-through tracking

#### 5. QR Code Security
- Never auto-opens decoded destinations
- Camera-only processing
- Image upload with sanitization
- UPI parameter verification

## Privacy

### Data Handling

#### What Happens Locally
- Message text analysis
- URL structure inspection
- QR code parsing
- Threat signal calculation
- Result generation

#### What Does NOT Happen
- No data uploaded to external servers
- No server-side API calls
- No model training
- No persistent storage (session-only)
- No third-party tracking

### Service Worker Architecture

#### Share-to-Device Integration
```javascript
// Android Chrome share target
self.addEventListener('fetch', event => {
  if (event.request.method === 'POST' && url.pathname === shareTargetPath) {
    event.respondWith(receiveShare(event.request));
  }
});
```

#### Security Controls
- Headers set to `no-store`
- Content sanitized (HTML escaping)
- Script injection prevention
- Base URL isolation

### Browser Storage

#### Session-Only Data
```javascript
// No localStorage persistence
// Activity tracking for UI only
// Current session results
```

#### Memory Management
- Session reset on tab close
- Camera stream cleanup
- Worker destruction

## API Security

### Local API Endpoints

#### Health Check
```http
GET /api/health
Response: {"status":"ok","engine":"ScamSathi explainable rules v2","privacy":"local-only"}
```

#### Message Analysis
```http
POST /api/analyze
Content-Type: application/x-www-form-urlencoded
Body: message=...,url=...
```

#### QR Analysis
```http
POST /api/qr/analyze
Content-Type: application/x-www-form-urlencoded
Body: payload=...
```

### CORS and Security Headers

All responses include:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(self), microphone=(), geolocation=()
```

## Limitations and Disclosure

### Honest Limitations

#### 1. Rule-Based Coverage
- Coverage is narrow and may miss scams
- Heuristic detection, not machine learning
- No probabilistic predictions
- Limited to known scam patterns

#### 2. Technology Gaps
- No audio analysis
- No visual content analysis  
- No domain reputation checking
- No bank/payee verification
- Cannot block transactions

#### 3. Browser Fallback
- Static GitHub Pages version may have minor differences from Java API
- All core security controls remain

### Required Disclaimer

```html
<div class="result-bottom">
  <span data-result-disclaimer>
    Rule-based warning score, not a probability or guarantee. A low score does not prove safety.
  </span>
</div>
```

## Deployment Security

### GitHub Pages (Static)

#### Security Controls
- HTTPS enabled
- No server-side processing
- Browser-only execution
- CSP headers enforced
- No secret in repository

### Local Development

#### Process Security
- Loopback-only binding (`127.0.0.1`)
- No network exposure
- File permissions respected
- Clean environment

#### Development Practices
- `javac` with JDK 17+
- `--add-modules jdk.httpserver`
- Size limits enforced
- Security headers applied

## Future Security Considerations

### Planned Enhancements

#### 1. AI Integration (Carefully Managed)
- Server-side AI with local fallback
- Environment variable security
- Input sanitization before AI
- Explainable AI requirements

#### 2. Intelligence Sources (Future)
- Trusted threat intelligence providers
- No secrets in source code
- Bounded timeouts
- Explicit user consent required

#### 3. Production Controls (If Expanding)
- Authentication mechanisms
- Rate limiting
- Abuse detection
- Incident response
- Privacy reviews

## Compliance

### Regulatory Considerations

#### GDPR/CCPA
- No personal data collection
- Session-only processing
- No persistent identifiers
- Clear consent for data collection

#### Industry Standards
- OWASP Top 10 addressed
- Input validation implemented
- Output encoding applied
- Session management

### Ethical AI Guidelines

#### Responsible Development
- Transparency about capabilities
- Honest limitations documentation
- User education focus
- No surveillance claims

#### User Rights
- Clear explanation of processing
- No false security claims
- Emergency information provided
- Choice to use

## Security Testing

### Automated Tests
```bash
# Run security-focused tests
npm test
```

Tests verify:
- Input size limits
- Error handling
- Header security
- No external requests

### Manual Security Review

#### Key Areas Checked
- CSP header effectiveness
- No debug information leakage
- Input sanitization
- Browser storage safety
- Share target security

## Emergency Procedures

### If Security Issues Found

#### Immediate Actions
1. Document the issue
2. Create security ticket
3. Disable affected feature
4. Notify stakeholders

#### Long-term Resolution
1. Root cause analysis
2. Fix with security in mind
3. Add tests
4. Documentation update

### User Notification

#### When to Notify
- Critical security vulnerability discovered
- Data exposure risk identified
- System compromise detected

#### How to Notify
- Secure channels only
- Clear explanation
- Fix timeline
- Mitigation steps

## Conclusion

ScamSathi prioritizes user security and privacy through:

1. **Local Processing**: No external data transmission
2. **Explicit Transparency**: Clear documentation of capabilities
3. **Security-First Design**: Input validation, output encoding
4. **Honest Limitations**: No false security claims
5. **Future-Proof Architecture**: Modular, extensible with security controls

The tool is designed for cyber safety education and protection, not as a production fraud detection service. Users are encouraged to treat all suspicious communications cautiously and seek official verification.