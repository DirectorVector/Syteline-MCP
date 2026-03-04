/**
 * SyteLine Security Token - Get authentication token for MGRESTService API
 * 
 * CRITICAL: This MUST be called first before any other SyteLine operations.
 * All other SyteLine API calls require a valid authentication token.
 */

import { setCachedToken, getTokenInfo, validateUrl } from '../../lib/auth';

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  config: string; // SyteLine configuration name (e.g., "SL_PROD", "TEST_CONFIG")
  username: string; // SyteLine username
  password: string; // SyteLine password
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
    // Validate required parameters
    if (!args.config) {
      throw new Error('Missing required parameter: config (SyteLine configuration name)');
    }
    if (!args.username) {
      throw new Error('Missing required parameter: username (SyteLine username)');
    }
    if (!args.password) {
      throw new Error('Missing required parameter: password (SyteLine password)');
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

    // SyteLine MGRESTService token endpoint - EXACT match to Swagger specification
    // Swagger spec clearly shows: "/token/{config}/{username}/{password}"
    // Base path from Swagger: "/IDORequestService/ido"
    let urlPath = `/token/${encodeURIComponent(args.config)}/${encodeURIComponent(args.username)}/${encodeURIComponent(args.password)}`;
    const url = new URL(urlPath, baseUrl);
    
    const headers: Record<string, string> = {
      'Accept': 'text/plain', // SyteLine returns plain text, not JSON
    };
    
    // Note: Don't send Authorization header for token request
    // This IS the authentication step

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers,
    };

    // Validate the URL before making any request
    validateUrl(url.toString());

    console.error(`Requesting SyteLine token for config: ${args.config}`);
    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.text(); // SyteLine errors are also plain text
      } catch (e) {
        errorData = { status: response.status, statusText: response.statusText };
      }
      throw new Error(`Authentication failed: ${JSON.stringify(errorData)}`);
    }
    
    // SyteLine token response handling - supports both JSON and plain text formats
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
      // Remove surrounding quotes from plain text token string
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
    console.error('Error executing get_Get_Security_Token_Path_Params_token_config_username_password_:', error);
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
      
      Based on SyteLine MGRESTService specification:
      • Endpoint: GET /json/token/{config}/{username}/{password}
      • Returns: Mongoose token for authenticated requests
      • Usage: Bearer token in Authorization header for all subsequent calls
      
      The tool automatically caches tokens for 20 minutes to avoid repeated authentication calls.
      Supports both JSON and plain text token response formats.
      
      Usage Pattern:
      1. Call this tool first with your SyteLine credentials
      2. The token is automatically cached and used by other tools
      3. You don't need to manually handle the token - it's managed automatically
      
      Example:
      await syteline_get_security_token({
        config: "SL_PROD",        // Your SyteLine configuration name
        username: "your_user",    // Your SyteLine username  
        password: "your_pass"     // Your SyteLine password
      });`,
      parameters: {
        type: 'object' as const,
        properties: {
          'config': {
            "type": "string",
            "description": "SyteLine configuration name (e.g., 'SL_PROD', 'TEST_CONFIG', 'DEVELOPMENT'). This is the configuration defined in your SyteLine server."
          },
          'username': {
            "type": "string",
            "description": "Your SyteLine username for authentication"
          },
          'password': {
            "type": "string",
            "description": "Your SyteLine password for authentication"
          },
          'BASE_URL': { 
            "type": "string", 
            "description": "Optional: SyteLine server base URL (e.g., 'http://server:port/IDORequestService/MGRESTService.svc'). If not provided, uses environment variable BASE_URL." 
          }
        },
        required: ["config","username","password"]
      }
    }
  }
};
