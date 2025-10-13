# SyteLine IDORequestService Authentication Guide

## ✅ Updated Authentication Method

The SyteLine MCP server now uses the **IDORequestService header-based authentication** as requested, matching your working curl example.

## 🔧 How Authentication Works

### **Your Working Example:**
```bash
curl --location 'https://your-syteline-server.company.com/IDORequestService/ido/token/SL_PROD' \
--header 'username: your_username' \
--header 'password: your_password'
```

### **MCP Server Implementation:**
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

## 🔄 What Changed

| **Before (MGRESTService)** | **After (IDORequestService)** |
|---------------------------|-------------------------------|
| URL: `/token/{config}/{username}/{password}` | URL: `/token/{config}` |
| Method: Credentials in URL path | Method: Credentials in headers |
| Security: Less secure (URLs logged) | Security: More secure (headers) |
| Example: `/token/SL_PROD/user/pass` | Example: `/token/ujax` + headers |

## 🌐 Environment Configuration

Your `.env` file should now look like this (matching your example):

```bash
# SyteLine IDORequestService endpoint
BASE_URL=https://your-syteline-server.company.com/IDORequestService/ido

# Authentication credentials (passed as headers)
SYTELINE_USERNAME=your_username
SYTELINE_PASSWORD=your_password
SYTELINE_CONFIG=ujax
```

## 🔑 Authentication Flow

1. **Token Request**: 
   - `GET {BASE_URL}/token/{SYTELINE_CONFIG}`
   - Headers: `username: {SYTELINE_USERNAME}`, `password: {SYTELINE_PASSWORD}`

2. **Token Response**: 
   - Plain text token (may be quoted): `"abc123xyz..."`

3. **API Usage**: 
   - All subsequent calls use: `Authorization: Bearer {token}`

4. **Auto-Refresh**: 
   - Tokens cached for 20 minutes
   - Automatically refreshed on 401 responses

## 🛠 Available Authentication Tools

The MCP server provides both authentication methods for compatibility:

1. **Header-based** (Recommended): `get_Get_Security_Token_Header_Auth_token_config_`
2. **Path-based** (Legacy): `get_Get_Security_Token_Path_Params_token_config_username_password_`

## ✅ Verification

The server now matches your working curl example exactly:
- ✅ Uses IDORequestService endpoint structure
- ✅ Passes credentials in headers (not URL)
- ✅ Supports your configuration format (`ujax` vs `SL_PROD`)
- ✅ Works with HTTPS endpoints
- ✅ More secure authentication pattern

## 🚀 Ready to Use

Your SyteLine MCP server is now configured to use the exact same authentication method as your working curl example. Just update your `.env` file with your actual server details and you're ready to go!