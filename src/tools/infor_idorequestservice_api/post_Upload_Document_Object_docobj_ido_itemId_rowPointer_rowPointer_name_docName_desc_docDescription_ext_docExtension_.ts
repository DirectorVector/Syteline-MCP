/**
 * Upload Document Object
 */

import { validateUrl } from '../../lib/auth.js';

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  xInforMongooseConfig: string; // Mongoose configuration (required for ION API)
  itemId?: string; // _ItemId value (for updating existing document)
  name?: string; // Document name
  desc?: string; // Document description
  ext?: string; // Document extension
  ido: string; // Path parameter: ido
  rowPointer: string; // Path parameter: rowPointer
  docName: string; // Path parameter: docName
  docDescription: string; // Path parameter: docDescription
  docExtension: string; // Path parameter: docExtension
  body: any; // The request body.
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
  if (!args.docDescription) {
    throw new Error('Missing required path parameter: docDescription');
  }
  if (!args.docExtension) {
    throw new Error('Missing required path parameter: docExtension');
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
      method: 'POST',
      headers,
    };
    
    if (args.itemId !== undefined) url.searchParams.append('itemId', args.itemId);
    if (args.rowPointer !== undefined) url.searchParams.append('rowPointer', args.rowPointer);
    if (args.name !== undefined) url.searchParams.append('name', args.name);
    if (args.desc !== undefined) url.searchParams.append('desc', args.desc);
    if (args.ext !== undefined) url.searchParams.append('ext', args.ext);
    
    if (!args.body) {
      throw new Error('Request body is required for this POST operation');
    }
    fetchOptions.body = JSON.stringify(args.body);

    validateUrl(url.toString());

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
    console.error('Error executing post_Upload_Document_Object_docobj_ido_itemId_rowPointer_rowPointer_name_docName_desc_docDescription_ext_docExtension_:', error);
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
      name: 'post_Upload_Document_Object_docobj_ido_itemId_rowPointer_rowPointer_name_docName_desc_docDescription_ext_docExtension_',
      description: 'Upload Document Object',
      parameters: {
        type: 'object' as const,
        properties: {
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (required for ION API)"
          },
          'itemId': {
            "type": "string",
            "description": "_ItemId value (for updating existing document)"
          },
          'name': {
            "type": "string",
            "description": "Document name"
          },
          'desc': {
            "type": "string",
            "description": "Document description"
          },
          'ext': {
            "type": "string",
            "description": "Document extension"
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
          'docDescription': {
            "type": "string",
            "description": "Path parameter: docDescription"
          },
          'docExtension': {
            "type": "string",
            "description": "Path parameter: docExtension"
          },
          'body': {
            "type": "object",
            "description": "The request body."
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["xInforMongooseConfig","ido","rowPointer","docName","docDescription","docExtension","body"]
      }
    }
  }
};
