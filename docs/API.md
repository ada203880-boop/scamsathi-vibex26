# API

The local Java server listens on `127.0.0.1` (default port `18878`). All request bodies are `application/x-www-form-urlencoded`. No endpoint visits or resolves submitted URLs.

## `GET /api/health`

Returns `200` JSON when the process is available:

```json
{"status":"ok","engine":"ScamSathi explainable rules v2","privacy":"local-only"}
```

## `POST /api/analyze`

Fields:

| Field | Required | Limit |
|---|---:|---:|
| `message` | One of `message` or `url` | 4,000 characters |
| `url` | One of `message` or `url` | 2,048 characters |

Returns `200` with `score`, `level`, `title`, `summary`, `disclaimer`, `signals`, and `actions`. Empty input is `400`; an oversized field/request is `413`; unsupported methods are `405`.

## `POST /api/qr/analyze`

Field `payload` is required and limited to 4,096 characters. It recognizes UPI payment URIs, ordinary web URLs, unsupported URI schemes, and plain text. UPI payee/name/amount are echoed as unverified data; the endpoint never initiates a payment. Empty input is `400`; oversized payload/request is `413`; unsupported methods are `405`.

## Example response

```json
{
  "score": 51,
  "level": "high",
  "title": "Multiple high-risk indicators",
  "summary": "Several warning signs matched. Do not reply, click, share a code or approve a payment before verifying.",
  "disclaimer": "Rule-based warning score, not a probability or guarantee. A low score does not prove safety.",
  "signals": [{"id":"secret","label":"Request for a secret code or credential","detail":"...","points":35}],
  "actions": ["Do not share an OTP, PIN, CVV, password or screen access."]
}
```

This is illustrative schema only; labels, values, and score depend on submitted input. The static GitHub Pages build runs equivalent browser rules and does not call these endpoints.
