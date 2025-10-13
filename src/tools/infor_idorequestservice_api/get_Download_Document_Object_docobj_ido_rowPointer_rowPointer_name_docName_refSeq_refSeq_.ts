/**
 * Download Document Object
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig: string; // Mongoose configuration (required for ION API)
  name?: string; // Document name
  ido: string; // Path parameter: ido
  rowPointer: string; // Path parameter: rowPointer
  docName: string; // Path parameter: docName
  refSeq: string; // Path parameter: refSeq
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {
  if (!args.ido) {
    throw new Error('Missing required path parameter: ido');
  }
  if (!args.rowPointer) {
    throw new Error('Missing required path parameter: rowPointer');
  }
  if (!args.docName) {
    throw new Error('Missing required path parameter: docName');
  }
  if (!args.refSeq) {
    throw new Error('Missing required path parameter: refSeq');
  }

    let urlPath = `/docobj/${encodeURIComponent(args.ido)}`;
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
      method: 'GET',
      headers,
    };
    
    if (args.rowPointer !== undefined) url.searchParams.append('rowPointer', args.rowPointer);
    if (args.name !== undefined) url.searchParams.append('name', args.name);
    if (args.refSeq !== undefined) url.searchParams.append('refSeq', args.refSeq);
    


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
    console.error('Error executing get_Download_Document_Object_docobj_ido_rowPointer_rowPointer_name_docName_refSeq_refSeq_:', error);
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
      name: 'get_Download_Document_Object_docobj_ido_rowPointer_rowPointer_name_docName_refSeq_refSeq_',
      description: 'Download Document Object',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (required for ION API)"
          },
          'name': {
            "type": "string",
            "description": "Document name"
          },
          'ido': {
            "type": "string",
            "description": "Path parameter: ido"
          },
          'rowPointer': {
            "type": "string",
            "description": "Path parameter: rowPointer"
          },
          'docName': {
            "type": "string",
            "description": "Path parameter: docName"
          },
          'refSeq': {
            "type": "string",
            "description": "Path parameter: refSeq"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["xInforMongooseConfig","rowPointer","ido","rowPointer","docName","refSeq"]
      }
    }
  }
};
