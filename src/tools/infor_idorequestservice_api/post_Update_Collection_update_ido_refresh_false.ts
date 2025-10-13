/**
 * Update Collection
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig?: string; // Mongoose configuration (optional - only required for ION API)
  refresh?: string; // Refresh after update flag
  ido: string; // Path parameter: ido
  body: any; // The request body.
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
  if (!args.ido) {
    throw new Error('Missing required path parameter: ido');
  }

    let urlPath = `/update/${encodeURIComponent(args.ido)}`;
    const url = new URL(urlPath, baseUrl);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (args.xInforMongooseConfig) {
      headers['X-Infor-MongooseConfig'] = args.xInforMongooseConfig;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
    };
    
    if (args.refresh !== undefined) url.searchParams.append('refresh', args.refresh);
    
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
    console.error('Error executing post_Update_Collection_update_ido_refresh_false:', error);
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
      name: 'syteline_update_collection',
      description: 'Insert, update, or delete IDO records. Path: POST /update/{ido}?refresh={mode}. Body: array of operations with Action (1=Insert, 2=Update, 4=Delete), Properties array, and RowPointer for updates/deletes.',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (optional - only required for ION API)"
          },
          'refresh': {
            "type": "string",
            "description": "Refresh mode after operation: 'ALL' or 'PROPS'",
            "enum": ["ALL", "PROPS"]
          },
          'ido': {
            "type": "string",
            "description": "IDO name (path parameter)"
          },
          'body': {
            "type": "array",
            "description": "Array of operations. Each operation: {Action: 1|2|4, Properties: [{Name: string, Value: any}], RowPointer?: string}",
            "items": {
              "type": "object",
              "properties": {
                "Action": {"type": "integer", "enum": [1, 2, 4], "description": "1=Insert, 2=Update, 4=Delete"},
                "Properties": {"type": "array", "description": "Array of property name/value pairs"},
                "RowPointer": {"type": "string", "description": "Required for Update/Delete operations"}
              }
            }
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["xInforMongooseConfig","ido","body"]
      }
    }
  }
};
