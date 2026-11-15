# Architecture

## System Overview

ScamSathi is a local-first scam safety checker that runs entirely on the user's device. The architecture separates concerns between:
- Java 17 HTTP service for local rule-based analysis
- Static web frontend with browser-based fallback
- Service worker for offline functionality and share target integration

## Components

### 1. Java Backend (ScamSathiServer.java)

**Purpose**: Core rule-based detection engine with HTTP API

**Responsibilities**:
- Message and URL analysis using explainable security rules
- QR code payload inspection
- UPI payment QR parsing
- Threat signal scoring and classification
- Attack chain visualization
- Static file serving for web interface

**Key Features**:
- No external dependencies or API calls
- Loopback-only binding (127.0.0.1:18878)
- Input validation and size limits
- Security headers (CSP, X-Frame-Options, etc.)
- No message content retention

**API Endpoints**:
- `GET /api/health` - Health check and status
- `POST /api/analyze` - Analyze message and URL
- `POST /api/qr/analyze` - Analyze QR code payload

### 2. Frontend Web Application

**Core Files**:
- `index.html` - Main application shell
- `app.js` - Application logic and state management
- `rules.js` - Browser-side rule engine (fallback)
- `qr-scanner.js` - QR code camera/image scanning
- `styles.css` - Premium responsive UI styling
- `sw.js` - Service worker for offline support

**Features**:
- Responsive mobile-first design
- Dark/light theme support
- Multi-language interface (English, Hindi, Odia)
- Real-time analysis with loading states
- Interactive attack chain visualization
- Local storage for session activity
- Clipboard integration for sharing results

### 3. Browser Fallback Engine

**rules.js Purpose**:
- Identical rule logic to Java backend
- Enables GitHub Pages static deployment
- No server dependency for core functionality
- Maintains same security guarantees

**Initialization**:
- Runs automatically when no Java backend is available
- Uses same signal definitions and scoring
- Gracefully degrades if backend unavailable

### 4. Service Worker (sw.js)

**Share Target Integration**:
- Enables Android Chrome share-to-ScamSathi
- Intercepts shared content before page load
- Clips message to 4,000 characters
- Injects content into textarea via hidden element
- Triggers analysis automatically

**Security**:
- No external network requests
- Local-only processing
- Content stays in browser memory

## Data Flow

### Message Analysis Flow

1. User enters message/URL in textarea
2. Frontend validates input size and format
3. Attempts POST to local Java API (`/api/analyze`)
4. If Java unavailable, uses browser-side rules.js
5. Backend analyzes with rule engine:
   - Lowercases and normalizes text
   - Applies regex patterns for scam indicators
   - Calculates weighted signal scores
   - Generates attack chain assessment
6. Returns structured JSON with:
   - Overall score (0-100)
   - Risk level classification
   - Individual signal details
   - Recommended actions
   - Attack chain visualization

### QR Analysis Flow

1. User provides QR content via:
   - Camera scanning (QrScanner library)
   - Image upload
   - Manual paste
2. Frontend sends to `/api/qr/analyze`
3. Backend identifies QR type:
   - UPI payment (`upi://pay?...`)
   - Web URL (`https://...`)
   - Unknown format
4. Applies specialized rules:
   - UPI: Parses payee, amount, validates structure
   - URL: Applies URL inspection rules
   - Unknown: Flags as suspicious

### Static File Serving

1. HTTP request to `http://127.0.0.1:18878/`
2. Java server serves index.html
3. Relative paths load CSS, JS, assets
4. Content-Type headers set appropriately
5. CSP and security headers applied

## Security Architecture

### Input Validation
- Max message: 4,000 characters
- Max URL: 2,048 characters
- Max QR payload: 4,096 characters
- Request body size limits
- UTF-8 encoding enforcement

### Output Security
- Content-Security-Policy headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: no-referrer
- Permissions-Policy restrictions

### Privacy
- No message content stored
- Session-only activity tracking
- No analytics or external calls
- Local-only processing

## Rule Engine Design

### Signal Scoring
Signals are weighted by risk:
- `secret` (OTP/PIN requests): 35 points
- `receive_fee` (pay-to-receive): 32 points
- `remote_access`: 34 points
- `pressure` (urgency/threats): 16 points
- `payment_direction`: 30 points
- URL issues: 10-28 points each

### Risk Classification
- **Critical** (75-100): Multiple serious indicators
- **High** (55-74): Multiple high-risk indicators
- **Caution** (30-54): One or more warning signs
- **Low** (0-29): No strong known patterns

### Explainability
Each signal includes:
- Clear label
- Detailed explanation
- Point contribution
- Recommended action

## Deployment Architecture

### Local Development
```bash
./run.sh          # Linux/macOS
run.bat           # Windows
```
- Starts Java HTTP server on port 18878
- Serves web interface from `web/` directory
- Loopback-only binding

### Static Deployment (GitHub Pages)
- Upload `web/` directory contents to GitHub Pages
- JavaScript fallback handles all analysis
- No Java runtime required
- Service worker enabled via HTTPS

### Future Production
- Docker containerization planned
- Kubernetes orchestration support
- Persistent storage for scan history
- Monitoring and logging

## Technology Stack

### Backend
- Java 17+ (standard library only)
- Built-in HTTP server (com.sun.net.httpserver)
- No external dependencies

### Frontend
- Vanilla JavaScript (no framework)
- HTML5 semantic markup
- CSS3 with CSS variables
- Web APIs (Service Worker, Clipboard, etc.)

### Development
- Node.js test runner (npm test)
- Git version control
- GitHub Actions CI/CD (planned)

## Limitations

- Rule-based coverage is limited
- No trained ML model
- No threat intelligence feeds
- Cannot verify domain reputation
- No audio/image content analysis
- Cannot block payments or transactions
- Browser fallback may differ slightly from Java version
- No persistent storage between sessions