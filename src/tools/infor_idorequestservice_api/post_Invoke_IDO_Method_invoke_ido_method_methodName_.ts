/**
 * Invoke IDO Method
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig: string; // Mongoose configuration (required for ION API)
  method?: string; // IDO method name
  ido: string; // Path parameter: ido
  methodName: string; // Path parameter: methodName
  body: any; // The request body.
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
  if (!args.ido) {
    throw new Error('Missing required path parameter: ido');
  }
  if (!args.methodName) {
    throw new Error('Missing required path parameter: methodName');
  }

    let urlPath = `/invoke/${encodeURIComponent(args.ido)}`;
    const url = new URL(urlPath, baseUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    if (args.xInforMongooseConfig) {
      headers['X-Infor-MongooseConfig'] = args.xInforMongooseConfig;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
    };
    
    if (args.method !== undefined) url.searchParams.append('method', args.method);
    
    if (!args.body) {
      throw new Error('Request body is required for this POST operation');
    }
    fetchOptions.body = JSON.stringify(args.body);

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
      name: 'post_Invoke_IDO_Method_invoke_ido_method_methodName_',
      description: 'Invoke IDO Method',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (required for ION API)"
          },
          'method': {
            "type": "string",
            "description": "IDO method name"
          },
          'ido': {
            "type": "string",
            "description": "Path parameter: ido"
          },
          'methodName': {
            "type": "string",
            "description": "Path parameter: methodName"
          },
          'body': {
            "type": "object",
            "description": "The request body."
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["xInforMongooseConfig","ido","methodName","body"]
      }
    }
  }
};
