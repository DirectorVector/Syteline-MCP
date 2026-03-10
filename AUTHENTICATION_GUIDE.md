# SyteLine IDORequestService Authentication Guide

## ✅ Header-Based Authentication

The SyteLine MCP server uses **header-based authentication** — credentials are passed as HTTP headers, never in the URL path. This prevents credentials from being logged in access logs, browser history, or proxy logs.

## 🔧 How Authentication Works

### Token Endpoint

```
GET /token/{config}
Headers:
  username: {USERNAME}
  password: {PASSWORD}
```

The `{config}` selects which SyteLine site/database to authenticate against. It defaults to the `DEFAULT_SITE` environment variable.

### Working Example (curl):
```bash
SITE_CONFIG="${DEFAULT_SITE:-Demo_DALS}"
TOKEN=$(curl -s "$SYTELINE_BASE_URL/token/$SITE_CONFIG" \
  -H "username: $SYTELINE_USERNAME" \
  -H "password: $SYTELINE_PASSWORD" | jq -r '.Token')
```

### MCP Server Implementation:
```typescript
// Current implementation in src/lib/auth.ts
const tokenEndpoint = `${baseUrl}/token/${encodeURIComponent(config)}`;

const response = await fetch(tokenEndpoint, {
  method: 'GET',
  headers: {
    'username': username,        // From SYTELINE_USERNAME env var
    'password': password,        // From SYTELINE_PASSWORD env var
    'Accept': 'application/json, text/plain'
  }
});
```

## 🔄 Security Improvement

| **Before (Path-based — removed)** | **After (Header-based)** |
|-----------------------------------|--------------------------|
| URL: `/token/{config}/{username}/{password}` | URL: `/token/{config}` |
| Credentials in URL path (logged in access logs) | Credentials in headers (not logged) |
| Security risk: URLs are logged by proxies, servers, browsers | Secure: headers are not included in logs |

## Config Selection

Do **not** hardcode a config list in scripts or documentation. Config names are environment-specific.

- Default to `DEFAULT_SITE` from `.env`.
- Only discover/confirm sites if `DEFAULT_SITE` is not applicable, or if the user explicitly references another site.
- Use `SLSites` discovery (after authenticating) to list available sites and validate names when needed.

## 🌐 Environment Configuration

Your `.env` file should look like this:

```bash
# SyteLine IDORequestService endpoint
BASE_URL=https://your-syteline-server.company.com/IDORequestService/ido

# Authentication credentials (passed as headers — never in URL)
SYTELINE_USERNAME=your_username
SYTELINE_PASSWORD=your_password

# Site/database configuration — defaults for /token/{config}
DEFAULT_SITE=Demo_DALS
```

## 🔑 Authentication Flow

1. **Token Request**: 
   - `GET {BASE_URL}/token/{DEFAULT_SITE}`
   - Headers: `username: {SYTELINE_USERNAME}`, `password: {SYTELINE_PASSWORD}`

2. **Token Response** (JSON):
   ```json
   {
     "Message": null,
     "Success": true,
     "Token": "b/XdI6IQzCviZOGJ0E+002DoKUFOPm..."
   }
   ```
   - `Success: true` — token is valid
   - `Success: false` — check `Message` for details (bad credentials, unlicensed user, etc.)

3. **API Usage**: 
   - All subsequent calls use the raw token in the `Authorization` header (no `Bearer` prefix):
   ```
   Authorization: {token}
   ```

4. **Auto-Refresh**: 
   - Tokens cached for 20 minutes
   - Automatically refreshed on 401 responses

## ✅ Verification

- ✅ Credentials passed in HTTP headers (not URL path)
- ✅ Config defaults to `DEFAULT_SITE` env var
- ✅ No hardcoded config lists
- ✅ Token used as raw value in `Authorization` header (no Bearer prefix)
- ✅ Works with HTTPS endpoints
- ✅ Automatic token caching and refresh