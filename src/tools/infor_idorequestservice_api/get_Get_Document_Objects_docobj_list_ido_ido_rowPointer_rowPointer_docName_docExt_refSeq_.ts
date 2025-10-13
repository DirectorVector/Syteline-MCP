/**
 * Get Document Objects
 */

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig: string; // Mongoose configuration (required for ION API)
  docName?: string; // Document name
  docExt?: string; // Document extension
  refSeq?: string; // Document RefSequence
  ido: string; // Path parameter: ido
  rowPointer: string; // Path parameter: rowPointer
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

    let urlPath = `/docobj/list`;
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
    
    if (args.ido !== undefined) url.searchParams.append('ido', args.ido);
    if (args.rowPointer !== undefined) url.searchParams.append('rowPointer', args.rowPointer);
    if (args.docName !== undefined) url.searchParams.append('docName', args.docName);
    if (args.docExt !== undefined) url.searchParams.append('docExt', args.docExt);
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
    console.error('Error executing get_Get_Document_Objects_docobj_list_ido_ido_rowPointer_rowPointer_docName_docExt_refSeq_:', error);
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
      name: 'get_Get_Document_Objects_docobj_list_ido_ido_rowPointer_rowPointer_docName_docExt_refSeq_',
      description: 'Get Document Objects',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (required for ION API)"
          },
          'ido': {
            "type": "string",
            "description": "IDO name (optional - for specific IDO documents only)"
          },
          'rowPointer': {
            "type": "string",
            "description": "Referenced IDO row pointer"
          },
          'docName': {
            "type": "string",
            "description": "Document name"
          },
          'docExt': {
            "type": "string",
            "description": "Document extension"
          },
          'refSeq': {
            "type": "string",
            "description": "Document RefSequence"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["xInforMongooseConfig","ido","rowPointer"]
      }
    }
  }
};
