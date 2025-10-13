/**
 * Upload File Stream
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig?: string; // Mongoose configuration (optional - only required for ION API)
  ido: string; // IDO name (path parameter)
  property: string; // IDO property name (query parameter)
  itemId: string; // _ItemId value (query parameter)
  body: any; // File data to upload (binary)
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {


  if (!args.ido) {
    throw new Error('Missing required parameter: ido');
  }
  if (!args.property) {
    throw new Error('Missing required parameter: property');
  }
  if (!args.itemId) {
    throw new Error('Missing required parameter: itemId');
  }

    let urlPath = `/file/${encodeURIComponent(args.ido)}`;
    const url = new URL(urlPath, baseUrl);
    
    // Add required query parameters
    url.searchParams.append('property', args.property);
    url.searchParams.append('itemId', args.itemId);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream', // Binary data
      'Accept': 'application/json',
    };
    
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
    // Handle binary data properly - don't JSON.stringify binary content
    fetchOptions.body = args.body;

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
    console.error('Error executing post_Upload_File_Stream_filestream_upload:', error);
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
      name: 'syteline_upload_file_stream',
      description: 'Upload file to IDO property. Path: POST /file/{ido}?property={prop}&itemId={id}',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (optional - only required for ION API)"
          },
          'ido': {
            "type": "string",
            "description": "IDO name (path parameter)"
          },
          'property': {
            "type": "string", 
            "description": "IDO property name for storing binary data (query parameter)"
          },
          'itemId': {
            "type": "string",
            "description": "_ItemId value (query parameter)"
          },
          'body': {
            "type": "string",
            "description": "File data to upload (binary content)"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["ido","property","itemId","body"]
      }
    }
  }
};
