/**
 * SyteLine Load Collection - Query data from any IDO collection
 * 
 * ⚠️  AUTHENTICATION REQUIRED: You must call syteline_get_security_token first!
 * This tool will fail with 401 Unauthorized if no valid token is cached.
 * 
 * Based on SyteLine MGRESTService specification:
 * • Endpoint: GET /load/{ido}
 * • Returns: Set of records from specified IDO collection
 * • Supports: Filtering, sorting, pagination, property selection
 */

import { makeAuthenticatedRequest } from '../../lib/auth';

interface ExecuteFunctionArgs {
  BASE_URL?: string;
  API_KEY?: string;
  ido: string; // IDO collection name (e.g., "UserNames", "Items", "Customers")
  xInforMongooseConfig?: string; // Mongoose configuration (required for ION API)
  properties?: string; // Comma-delimited property list. Use '*' for all properties
  filter?: string; // SQL filter string
  orderBy?: string; // SQL ORDER BY value
  recordCap?: string; // Row cap: -1 = default, 0 = unlimited
  distinct?: string; // SQL DISTINCT keyword
  clm?: string; // Custom Load Method name
  clmParam?: string; // Comma-separated Custom Load Method parameters
  loadType?: string; // Load type: FIRST | NEXT | PREVIOUS | LAST
  bookmark?: string; // Bookmark ID
  pqc?: string; // Post Query Command name
  readOnly?: string; // Read Only flag
}

const executeFunction = async (args: ExecuteFunctionArgs): Promise<any> => {
  const baseUrl = args.BASE_URL || process.env.BASE_URL || 'http://example.io';
  const apiKey = args.API_KEY || process.env.API_KEY;

  try {


    // Validate required IDO parameter
    if (!args.ido) {
      throw new Error('Missing required parameter: ido (IDO collection name)');
    }

    let urlPath = `/load/${encodeURIComponent(args.ido)}`;
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
    
    if (args.properties !== undefined) url.searchParams.append('properties', args.properties);
    if (args.filter !== undefined) url.searchParams.append('filter', args.filter);
    if (args.orderBy !== undefined) url.searchParams.append('orderBy', args.orderBy);
    if (args.recordCap !== undefined) url.searchParams.append('recordCap', args.recordCap);
    if (args.distinct !== undefined) url.searchParams.append('distinct', args.distinct);
    if (args.clm !== undefined) url.searchParams.append('clm', args.clm);
    if (args.clmParam !== undefined) url.searchParams.append('clmParam', args.clmParam);
    if (args.loadType !== undefined) url.searchParams.append('loadType', args.loadType);
    if (args.bookmark !== undefined) url.searchParams.append('bookmark', args.bookmark);
    if (args.pqc !== undefined) url.searchParams.append('pqc', args.pqc);
    if (args.readOnly !== undefined) url.searchParams.append('readOnly', args.readOnly);
    


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
    console.error('Error executing get_Load_Collection_load_SLCustomerAlls_properties_filter_orderBy_recordCap_1_distinct_false_clm_clmParam_loadType_FIRST_bookmark_pqc_readOnly_false:', error);
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
      name: 'syteline_load_collection',
      description: `📊 Load Collection - Query SyteLine IDO data
      
      ⚠️  AUTHENTICATION REQUIRED: Call syteline_get_security_token first!
      
      Query data from any SyteLine IDO collection with advanced filtering and sorting.
      
      Based on SyteLine MGRESTService: GET /load/{ido}
      
      Example:
      await syteline_load_collection({
        ido: "UserNames",              // IDO collection name
        properties: "UserId,UserName", // Specific fields (optional)
        filter: "Active = 1",          // SQL WHERE clause (optional)
        orderBy: "UserId ASC",         // Sort order (optional)
        recordCap: "50"               // Limit results (optional)
      });`,
      parameters: {
        type: 'object' as const,
        properties: {
          'ido': {
            "type": "string",
            "description": "IDO collection name (e.g., 'UserNames', 'Items', 'Customers'). Case-sensitive, usually PascalCase."
          },
          'xInforMongooseConfig': {
            "type": "string",
            "description": "Mongoose configuration (required for ION API, optional for direct MGRESTService)"
          },
          'properties': {
            "type": "string",
            "description": "Comma-delimited property list. Use '*' for all properties"
          },
          'filter': {
            "type": "string",
            "description": "SQL filter string"
          },
          'orderBy': {
            "type": "string",
            "description": "SQL ORDER BY value"
          },
          'recordCap': {
            "type": "string",
            "description": "Row cap: -1 = default, 0 = unlimited"
          },
          'distinct': {
            "type": "string",
            "description": "SQL DISTINCT keyword"
          },
          'clm': {
            "type": "string",
            "description": "Custom Load Method name"
          },
          'clmParam': {
            "type": "string",
            "description": "Comma-separated Custom Load Method parameters"
          },
          'loadType': {
            "type": "string",
            "description": "Load type: FIRST | NEXT | PREVIOUS | LAST"
          },
          'bookmark': {
            "type": "string",
            "description": "Bookmark ID"
          },
          'pqc': {
            "type": "string",
            "description": "Post Query Command name"
          },
          'readOnly': {
            "type": "string",
            "description": "Read Only flag"
          },
          'BASE_URL': { "type": "string", "description": "Optional base URL to override the default." },
          'API_KEY': { "type": "string", "description": "Optional API key to override the default." }
        },
        required: ["ido"]
      }
    }
  }
};
