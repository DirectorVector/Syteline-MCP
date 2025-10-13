/**
 * Get Security Token (Header Auth)
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  username?: string; // Username
  password?: string; // Password
  config: string; // Path parameter: config
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
  if (!args.config) {
    throw new Error('Missing required path parameter: config');
  }

    let urlPath = `/token/${encodeURIComponent(args.config)}`;
    const url = new URL(urlPath, baseUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    if (args.username) {
      headers['username'] = args.username;
    }
    if (args.password) {
      headers['password'] = args.password;
    }

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers,
    };
    

    


    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { status: response.status, statusText: response.statusText, text: await response.text() };
      }
      throw new Error(JSON.stringify(errorData));
    }
    
    const responseText = await response.text();
    if (!responseText) {
        return { success: true, status: response.status };
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error executing get_Get_Security_Token_Header_Auth_token_config_:', error);
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
      name: 'get_Get_Security_Token_Header_Auth_token_config_',
      description: 'Get Security Token (Header Auth)',
      parameters: {
        type: 'object' as const,
        properties: {
          'username': {
            "type": "string",
            "description": "Username"
          },
          'password': {
            "type": "string",
            "description": "Password"
          },
          'config': {
            "type": "string",
            "description": "Path parameter: config"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["config"]
      }
    }
  }
};
