/**
 * SyteLine Security Token - Get authentication token via header-based authentication
 *
 * CRITICAL: This MUST be called first before any other SyteLine operations.
 * All other SyteLine API calls require a valid authentication token.
 *
 * Credentials are passed as HTTP headers (username, password) — never in the URL path.
 */

import { setCachedToken, getTokenInfo, validateUrl } from '../../lib/auth.js';

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  config?: string; // SyteLine configuration name (e.g., "Demo_DALS"). Defaults to DEFAULT_SITE env var.
  username?: string; // SyteLine username. Defaults to SYTELINE_USERNAME env var.
  password?: string; // SyteLine password. Defaults to SYTELINE_PASSWORD env var.
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';

  try {
    const config = args.config || process.env.DEFAULT_SITE || process.env.SYTELINE_CONFIG || 'Demo_DALS';
    const username = args.username || process.env.SYTELINE_USERNAME;
    const password = args.password || process.env.SYTELINE_PASSWORD;

    if (!username) {
      throw new Error('Missing required parameter: username (provide as argument or set SYTELINE_USERNAME env var)');
    }
    if (!password) {
      throw new Error('Missing required parameter: password (provide as argument or set SYTELINE_PASSWORD env var)');
    }

    // Check if we have a valid cached token (via centralized auth helper)
    const tokenInfo = getTokenInfo();
    if (tokenInfo.hasToken && !tokenInfo.isExpired) {
      console.error('Using cached SyteLine token');
      return {
        success: true,
        token: '***cached***', // Don't expose actual token in response
        message: 'Using cached authentication token',
        cached: true,
        expiresAt: tokenInfo.expiresAt
      };
    }

    // SyteLine IDORequestService token endpoint — credentials in headers, NOT in URL
    const urlPath = `/token/${encodeURIComponent(config)}`;
    const url = new URL(urlPath, baseUrl);

    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain',
      'username': username,
      'password': password,
    };

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers,
    };

    // Validate the URL before making any request
    validateUrl(url.toString());

    console.error(`Requesting SyteLine token for config: ${config}`);
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.text();
      } catch (e) {
        errorData = { status: response.status, statusText: response.statusText };
      }
      throw new Error(`Authentication failed: ${JSON.stringify(errorData)}`);
    }

    // SyteLine token response handling — supports both JSON and plain text formats
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty token response from SyteLine server');
    }

    let token: string;

    // Try to parse as JSON first (e.g. {"Token": "abc123", "Success": true})
    try {
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.Success === false) {
        throw new Error(`Authentication failed: ${jsonResponse.Message || 'Unknown error'}`);
      }
      if (jsonResponse.Token) {
        token = jsonResponse.Token;
      } else {
        throw new Error('JSON response missing Token field');
      }
    } catch (jsonError) {
      if (jsonError instanceof Error && jsonError.message.startsWith('Authentication failed:')) {
        throw jsonError;
      }
      // Fall back to plain text format
      token = responseText.replace(/^\"|\"/g, '').trim();
    }

    if (!token) {
      throw new Error('Invalid token received from SyteLine server');
    }

    // Cache the token using centralized auth helper (20 minutes)
    setCachedToken(token, 20);

    console.error('Successfully obtained SyteLine authentication token');

    return {
      success: true,
      token: '***authenticated***', // Don't expose actual token in response for security
      message: 'Authentication successful - token cached for 20 minutes',
      cached: false,
      expiresAt: new Date(Date.now() + (20 * 60 * 1000)).toISOString()
    };
  } catch (error) {
    console.error('Error executing syteline_get_security_token:', error);
    return {
      error: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

export const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function' as const,
    function: {
      name: 'syteline_get_security_token',
      description: `🔑 MANDATORY FIRST STEP: Get SyteLine/Mongoose authentication token

      This tool MUST be called before any other SyteLine operations. All SyteLine API calls require authentication.

      Authentication uses header-based credentials (username/password sent as HTTP headers, never in the URL).

      Endpoint: GET /token/{config}
      Headers: username, password

      The tool automatically caches tokens for 20 minutes to avoid repeated authentication calls.
      Supports both JSON and plain text token response formats.

      Config defaults to the DEFAULT_SITE environment variable. Do not hardcode config lists.
      Only discover/confirm sites if DEFAULT_SITE is not applicable or if the user explicitly references another site.

      Usage Pattern:
      1. Call this tool first with your SyteLine credentials
      2. The token is automatically cached and used by other tools
      3. You don't need to manually handle the token - it's managed automatically

      Example:
      await syteline_get_security_token({
        config: "Demo_DALS",
        username: "your_user",
        password: "your_pass"
      });`,
      parameters: {
        type: 'object' as const,
        properties: {
          'config': {
            "type": "string",
            "description": "SyteLine site/database configuration name. Defaults to DEFAULT_SITE env var. Do not hardcode a config list; use SLSites discovery if needed."
          },
          'username': {
            "type": "string",
            "description": "Your SyteLine username for authentication. Defaults to SYTELINE_USERNAME env var."
          },
          'password': {
            "type": "string",
            "description": "Your SyteLine password for authentication. Defaults to SYTELINE_PASSWORD env var."
          },
          'BASE_URL': {
            "type": "string",
            "description": "Optional: SyteLine server base URL. If not provided, uses BASE_URL env var."
          }
        },
        required: []
      }
    }
  }
};
