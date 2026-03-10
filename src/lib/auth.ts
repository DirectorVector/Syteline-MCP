// SyteLine IDORequestService Authentication Helper
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Validate that a URL uses an allowed scheme (http or https only).
 * Throws an error for disallowed schemes to prevent SSRF attacks.
 * Emits a warning when plain HTTP is used instead of HTTPS.
 */
export function validateUrl(urlString: string): void {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Disallowed URL scheme "${parsed.protocol}". Only http: and https: are permitted.`
    );
  }
  if (parsed.protocol === 'http:') {
    console.error(
      'WARNING: Using plain HTTP for SyteLine API requests. Credentials may be exposed in transit. Use HTTPS in production.'
    );
  }
}

/**
 * Get or refresh SyteLine authentication token
 * This implements the SyteLine IDORequestService authentication pattern
 */
export async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token (valid for 20 minutes)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  // Check if token is provided directly in environment (for testing/development)
  const envToken = process.env.SYTELINE_TOKEN || process.env.API_TOKEN || process.env.ACCESS_TOKEN;
  if (envToken) {
    cachedToken = envToken;
    // Don't set expiry for environment tokens (assumed to be managed externally)
    return cachedToken;
  }
  
  // Attempt to acquire token using SyteLine credentials
  try {
    const token = await acquireSyteLineToken();
    if (token) {
      cachedToken = token;
      // SyteLine tokens typically expire in 20-30 minutes, cache for 20 minutes
      tokenExpiry = Date.now() + (20 * 60 * 1000);
      return token;
    }
  } catch (error) {
    console.error('Failed to acquire SyteLine auth token:', error);
  }
  
  throw new Error('No valid SyteLine authentication token available. Please call syteline_get_security_token first or set SYTELINE_TOKEN environment variable.');
}

/**
 * Acquire SyteLine authentication token using IDORequestService API
 * Implements: GET /token/{config} with username/password in headers
 */
async function acquireSyteLineToken(): Promise<string | null> {
  const username = process.env.SYTELINE_USERNAME || process.env.USERNAME;
  const password = process.env.SYTELINE_PASSWORD || process.env.PASSWORD;
  const config = process.env.DEFAULT_SITE || process.env.SYTELINE_CONFIG || process.env.CONFIG_NAME || 'Demo_DALS';
  const baseUrl = process.env.BASE_URL;
  
  if (!username || !password) {
    console.warn('No SyteLine credentials provided for token acquisition (SYTELINE_USERNAME, SYTELINE_PASSWORD)');
    return null;
  }
  
  if (!baseUrl) {
    console.warn('No BASE_URL provided for SyteLine server');
    return null;
  }
  
  // SyteLine IDORequestService token endpoint - header-based authentication
  // Swagger spec: "/token/{config}" with username/password in headers
  const tokenEndpoint = `${baseUrl}/token/${encodeURIComponent(config)}`;
  
  try {
    validateUrl(tokenEndpoint);
    const response = await fetch(tokenEndpoint, {
      method: 'GET',
      headers: {
        'username': username,
        'password': password,
        'Accept': 'application/json, text/plain' // Support both JSON and plain text responses
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SyteLine token acquisition failed (${response.status}): ${errorText}`);
    }
    
    // Handle both JSON and plain text token responses
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty token response from SyteLine server');
    }

    let token: string;
    
    // Try to parse as JSON first (Swagger spec format)
    try {
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.Token) {
        token = jsonResponse.Token;
      } else {
        throw new Error('JSON response missing Token field');
      }
    } catch (jsonError) {
      // Fall back to plain text format (Coverage report format)
      token = responseText.replace(/^\"|\"/g, '').trim();
    }
    
    if (!token) {
      throw new Error('Invalid token received from SyteLine server');
    }

    console.error('Successfully acquired SyteLine authentication token via IDORequestService');
    return token;
  } catch (error) {
    console.error('Error acquiring SyteLine token:', error);
    return null;
  }
}

/**
 * Make authenticated request to SyteLine IDORequestService API
 * Uses raw token in Authorization header (no Bearer prefix) as expected by SyteLine
 */
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  validateUrl(url);
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  if (token) {
    headers['Authorization'] = token;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // If we get 401 Unauthorized, try to refresh token once
  if (response.status === 401 && cachedToken) {
    console.error('SyteLine token expired, attempting to refresh...');
    cachedToken = null;
    tokenExpiry = null;
    
    try {
      const newToken = await getAuthToken();
      if (newToken) {
        headers['Authorization'] = newToken;
        return fetch(url, {
          ...options,
          headers
        });
      }
    } catch (refreshError) {
      console.error('SyteLine token refresh failed:', refreshError);
    }
  }
  
  return response;
}

/**
 * Set cached token directly (used by syteline_get_security_token tool)
 * This allows tools to cache tokens obtained through the MCP interface
 */
export function setCachedToken(token: string, expirationMinutes: number = 20): void {
  cachedToken = token;
  tokenExpiry = Date.now() + (expirationMinutes * 60 * 1000);
  console.error(`SyteLine token cached for ${expirationMinutes} minutes`);
}

/**
 * Get current cached token info (for debugging)
 */
export function getTokenInfo(): { hasToken: boolean; expiresAt: string | null; isExpired: boolean } {
  return {
    hasToken: !!cachedToken,
    expiresAt: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    isExpired: tokenExpiry ? Date.now() > tokenExpiry : true
  };
}

export async function clearAuthCache() {
  cachedToken = null;
  tokenExpiry = null;
}
