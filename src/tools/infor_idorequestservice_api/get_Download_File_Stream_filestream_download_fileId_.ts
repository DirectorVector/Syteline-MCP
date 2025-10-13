/**
 * Download File Stream
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig?: string; // Mongoose configuration (optional - only required for ION API)
  ido: string; // IDO name (path parameter)
  property: string; // IDO property name (query parameter)
  rowPointer: string; // IDO row pointer (query parameter)
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
  if (!args.rowPointer) {
    throw new Error('Missing required parameter: rowPointer');
  }

    let urlPath = `/file/${encodeURIComponent(args.ido)}`;
    const url = new URL(urlPath, baseUrl);
    
    // Add required query parameters
    url.searchParams.append('property', args.property);
    url.searchParams.append('rowPointer', args.rowPointer);
    
    const headers: Record<string, string> = {
      'Accept': 'application/octet-stream', // Expect binary data
    };
    
    if (args.xInforMongooseConfig) {
      headers['X-Infor-MongooseConfig'] = args.xInforMongooseConfig;
    }

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers,
    };
    

    


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
    
    // Return binary data as-is, don't try to parse as text
    const responseBuffer = await response.arrayBuffer();
    return {
      success: true,
      data: Buffer.from(responseBuffer).toString('base64'), // Convert to base64 for transport
      contentType: response.headers.get('content-type') || 'application/octet-stream'
    };
  } catch (error) {
    console.error('Error executing get_Download_File_Stream_filestream_download_fileId_:', error);
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
      name: 'syteline_download_file_stream',
      description: 'Download file from IDO property. Path: GET /file/{ido}?property={prop}&rowPointer={ptr}',
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
            "description": "IDO property name for binary data (query parameter)"
          },
          'rowPointer': {
            "type": "string",
            "description": "IDO row pointer (query parameter)"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["ido","property","rowPointer"]
      }
    }
  }
};
