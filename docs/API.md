# API Documentation

## Overview

ScamSathi provides a simple, secure REST API for scam detection that runs locally on the user's device. The API follows RESTful principles and returns structured JSON responses with explainable results.

## Base URL

`http://127.0.0.1:18878` (local development)
`https://your-repo.github.io/scamsathi-vibex26/` (GitHub Pages)

## Authentication

No authentication required. The API is designed to run locally for user privacy and security.

## Rate Limiting

- **Local API**: No artificial rate limiting (user's device controls)
- **GitHub Pages**: GitHub's standard rate limits apply

## Security

### HTTPS Required

For production deployment, ensure HTTPS is enabled:

```nginx
listen 443 ssl;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

### CORS

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Endpoints

### GET /api/health

**Purpose**: Health check and service status

**Request**:
```http
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "engine": "ScamSathi explainable rules v2",
  "privacy": "local-only"
}
```

**Headers**:
```http
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
```

**Examples**:
```bash
curl -s http://127.0.0.1:18878/api/health | jq
```

### POST /api/analyze

**Purpose**: Analyze message text and optional URL for scam indicators

**Request**:
```http
POST /api/analyze
Content-Type: application/x-www-form-urlencoded

message=Your+bank+account+will+be+blocked.+Share+your+OTP+now.&url=http%3A%2F%2Fsbi-verify.example.xyz%2Flogin
```

**Parameters**:
- `message` (string): Message or call transcript to analyze
- `url` (string, optional): Link in the message to analyze

**Validation**:
- Message: Max 4,000 characters
- URL: Max 2,048 characters  
- At least one of message or url must be provided

**Response**:
```json
{
  "score": 75,
  "level": "high",
  "title": "Multiple high-risk indicators",
  "summary": "Several warning signs matched. Do not reply, click, share a code or approve a payment before verifying.",
  "signals": [
    {
      "id": "secret",
      "label": "Request for a secret code or credential",
      "detail": "A request to disclose an OTP, PIN, CVV or password can enable account takeover. Do not tell these secrets to another person.",
      "points": 35
    },
    {
      "id": "brand_mismatch",
      "label": "Brand name appears outside its usual domain",
      "detail": "The address contains a familiar brand name, but the actual domain differs. A brand name in a URL does not prove it is official.",
      "points": 28
    }
  ],
  "actions": [
    "Do not share an OTP, PIN, CVV, password or screen access.",
    "A UPI PIN authorizes money going out. Read the recipient and amount before approving.",
    "Do not open the link from the message. Check the destination independently.",
    "If money was lost, contact your bank and call India’s cyber-fraud helpline 1930 promptly."
  ],
  "attackChain": {
    "count": 2,
    "stages": [
      {"id": "identity", "matched": true},
      {"id": "pressure", "matched": true},
      {"id": "extraction", "matched": false}
    ]
  },
  "disclaimer": "Rule-based warning score, not a probability or guarantee. A low score does not prove safety."
}
```

**Headers**:
```http
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

**Examples**:
```bash
curl -s -X POST http://127.0.0.1:18878/api/analyze \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "message=Your+bank+account+will+be+blocked.+Share+your+OTP+now.&url=http%3A%2F%2Fsbi-verify.example.xyz%2Flogin" | jq
```

### POST /api/qr/analyze

**Purpose**: Analyze decoded QR code payload for scam indicators

**Request**:
```http
POST /api/qr/analyze
Content-Type: application/x-www-form-urlencoded

payload=upi%3A%2F%2Fpay%3Fpa%3Dshop%40example%26pn%3DTea+Shop%26am%3D10%26cu%3DIR
```

**Parameters**:
- `payload` (string): Decoded QR code content to analyze

**Validation**:
- Payload: Max 4,096 characters
- Required parameter

**Response**:
```json
{
  "score": 25,
  "level": "caution",
 +pment",
    "detail": "This QR appears to start a UPI payment. Verify the recipient and amount in your trusted UPI app before entering a PIN.",
    "points": 12
  },
  "signals": [
    {
      "id": "upi_qr",
      "label": "UPI payment QR detected",
      "detail": "This QR appears to start a UPI payment. Verify the recipient and amount in your trusted UPI app before entering a PIN.",
      "points": 12
    },
    {
      "id": "upi_missing_payee",
      "label": "UPI QR has no visible payee address",
      "detail": "The decoded payload does not contain a payee address. Do not proceed unless your payment app clearly identifies the recipient.",
      "points": 16
    }
  ],
  "actions": [
    "Do not pay or open anything from the QR until you verify it independently.",
    "UPI payee address (unverified QR data): shop@example",
    "Payee display name (unverified QR data): Tea Shop",
    "Encoded amount: 10 (confirm it in your UPI app).",
    "Do not share an OTP, PIN, CVV, password or screen access.",
    "If money was lost, contact your bank and call India’s cyber-fraud helpline 1930 promptly."
  ],
  "disclaimer": "Rule-based warning score, not a probability or guarantee. A low score does not prove safety."
}
```

**Headers**:
```http
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
```

**Examples**:
```bash
curl -s -X POST http://127.0.0.1:18878/api/qr/analyze \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "payload=upi%3A%2F%2Fpay%3Fpa%3Dshop%40example%26pn%3DTea+Shop%26am%3D10%26cu%3DIR" | jq
```

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Could not analyze this input"
}
```

### 405 - Method Not Allowed
```json
{
  "error": "POST required"
}
```

### 413 - Request Too Large
```json
{
  "error": "Message limit is 4,000 characters and URL limit is 2,048 characters"
}
```

### 400 - Empty Request
```json
{
  "error": "Provide a message or link to analyze"
}
```

## Response Codes

| HTTP Code | Description |
|-----------(bottom title) | --- |
| 200 | Success - Analysis completed |
| 400 | Bad request - Invalid input |
| 405 | Method not allowed |
| 413 | Request entity too large |

## Testing

### Manual Testing

1. **Health Check**
   ```bash
   curl -s http://127.0.0.1:18878/api/health
   ```

2. **Message Analysis**
   ```bash
   curl -s -X POST http://127.0.0.1:18878/api/analyze \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "message=Your+bank+account+will+be+blocked.+Share+your+OTP+now.&url=http%3A%2F%2Fsbi-verify.example.xyz%2Flogin"
   ```

3. **QR Analysis**
   ```bash
   curl -s -X POST http://127.0.0.1:18878/api/qr/analyze \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "payload=upi%3A%2F%2Fpay%3Fpa%3Dshop%40example%26pn%3DTea+Shop%26am%3D10%26cu%3DIR"
   ```

### Automated Testing

Run existing tests with:

```bash
npm test
```

## Sample Scripts

### JavaScript Client
```javascript
// Message analysis
const analyzeMessage = async (message, url = '') => {
  const params = new URLSearchParams({ message, url });
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  return response.json();
};

// QR analysis  
const analyzeQr = async (payload) => {
  const params = new URLSearchParams({ payload });
  const response = await fetch('/api/qr/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  return response.json();
};
```

### Shell Script
```bash
analyze_message() {
  local message="$1" url="$2" port="18878"
  
  curl -s -X POST "http://127.0.0.1:${port}/api/analyze" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "message=${message}&url=${url}" \
    | jq
}

analyze_qr() {
  local payload="$1" port="18878"
  
  curl -s -X POST "http://127.0.0.1:${port}/api/qr/analyze" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "payload=${payload}" \
    | jq
}
```

## Integration Notes

### Frontend Integration

The frontend uses these API endpoints through:

```javascript
// Java backend (local)
const postToLocalApi = async (path, fields) => {
  const host = window.location.hostname.toLowerCase();
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(host)) {
    return null; // GitHub Pages uses browser fallback
  }
  
  return fetch(new URL(path, document.baseURI), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF- Informal', 
    body: new URLSearchParams(fields),
    signal: AbortSignal.timeout(700)
  };
}

// Usage
const analyzeMessage = async (message, url) => {
  const data = await postToLocalApi('api/analyze', { message, url });
  const fallback = window.ScamSathiRules.analyze(message, url);
  if (data) data.attackChain = fallback.attackChain;
  return data || fallback;
};
```

### Local Development

To run the API:

```bash
# Start Java service
cd /path/to/scamsathi-vibex26
./run.sh

# Or on Windows
run.bat
```

The API will be available at `http://127.0.0.1:18878`

## Migration Notes

### From v1.0 to v2.0

#### Breaking Changes
1. **Port**: Changed from default 18878 to ${PORT:-18878} environment variable
2. **Input Validation**: Stricter size limits enforced
3. **Error Responses**: Improved error messages

#### Backward Compatibility
- All existing API calls work
- Same JSON structure returned
- New validation features only

### Future Versions

v3.0 planned for AI integration while maintaining:
- Local-first architecture
- Explainable results
- Privacy-first approach
- Same API structure

## Contributing

### Code Contributions
- Follow existing code style
- Add tests for new functionality
- Update documentation
- Code reviews via pull requests

### Testing Contributions
- Add unit tests for new features
- Update existing test coverage
- Performance testing
- Security testing

## License

```text
MIT License (Copyright 2024-2026 scamSathi team)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit others to make derivative works of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Acknowledgments

- Java HTTPServer API (Oracle)
- QR Scanner library (MIT License)
- OCR.js (Apache 2.0)
- All contributors and testers