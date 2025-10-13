/**
 * Invoke IDO Method
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig?: string; // Mongoose configuration (optional - only required for ION API)
  method?: string; // IDO method name (query parameter)
  ido: string; // Path parameter: ido
  body: any; // The request body - array of method parameters
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
  if (!args.ido) {
    throw new Error('Missing required path parameter: ido');
  }

    let urlPath = `/invoke/${encodeURIComponent(args.ido)}`;
    const url = new URL(urlPath, baseUrl);
    
    // Add method as query parameter if provided
    if (args.method) {
      url.searchParams.append('method', args.method);
    }
    
    const headers: Record<string, string> = {};
    
    if (args.xInforMongooseConfig) {
      headers['X-Infor-MongooseConfig'] = args.xInforMongooseConfig;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
    };
    
    if (!args.body) {
      throw new Error('Request body is required for this POST operation');
    }
    fetchOptions.body = JSON.stringify(args.body);

    // Use makeAuthenticatedRequest for proper token handling
    const { makeAuthenticatedRequest } = await import('../../lib/auth.js');
    const response = await makeAuthenticatedRequest(url.toString(), fetchOptions);
    
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
    console.error('Error executing post_Invoke_IDO_Method_invoke_ido_method_methodName_:', error);
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
      name: 'syteline_invoke_ido_method', 
      description: 'Invoke an IDO method with parameters. Path: POST /invoke/{ido}?method={methodName}',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (optional - only required for ION API)"
          },
          'method': {
            "type": "string", 
            "description": "IDO method name (query parameter)"
          },
          'ido': {
            "type": "string",
            "description": "IDO name (path parameter)"
          },
          'body': {
            "type": "array",
            "description": "Array of method parameters (strings)",
            "items": {
              "type": "string"
            }
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["ido","body"]
      }
    }
  }
};
