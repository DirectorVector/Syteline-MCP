#!/usr/bin/env node
import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { discoverTools } from './lib/tools.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Server metadata following MCP best practices
const SERVER_NAME = 'syteline-mcp-server';
const SERVER_VERSION = '1.0.0';

/**
 * Register all discovered tools with the MCP server following best practices
 */
async function registerTools(server: McpServer, tools: any[]) {
  console.error(`Registering ${tools.length} SyteLine tools...`);
  
  for (const tool of tools) {
    const definition = tool.definition?.function;
    if (!definition) {
      console.error(`Skipping tool without definition:`, tool);
      continue;
    }

    server.tool(
      definition.name,
      definition.description || 'SyteLine MGRESTService API tool',
      definition.parameters,
      async (args: any) => {
        try {
          // Log tool execution to stderr (safe for STDIO)
          console.error(`Executing tool: ${definition.name}`);
          
          const result = await tool.function(args);
          
          // Return structured response following MCP patterns
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          console.error(`Tool execution failed for ${definition.name}:`, error);
          throw error;
        }
      }
    );
  }
  
  console.error(`Successfully registered ${tools.length} tools`);
}

// HTTP transport removed - focusing on STDIO as per MCP best practices
// STDIO is the primary transport for MCP servers integrating with Claude Desktop

async function setupStdio(tools: any[]) {
  // Create MCP server with proper metadata
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    capabilities: {
      tools: {},  // Enable tools capability
    },
  });

  // Register all discovered tools
  await registerTools(server, tools);

  // Setup graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  // Connect to STDIO transport (primary MCP transport)
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (safe for STDIO - stdout reserved for JSON-RPC)
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
  console.error(`Registered tools: ${tools.map(t => t.definition?.function?.name).join(', ')}`);
}

async function main() {
  try {
    console.error('Starting SyteLine MCP Server...');
    
    // Discover all available tools
    const tools = await discoverTools();
    console.error(`Discovered ${tools.length} tools`);
    
    // Setup STDIO transport (primary MCP transport for Claude Desktop)
    await setupStdio(tools);
    
  } catch (error) {
    console.error('Failed to start SyteLine MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('Fatal error in SyteLine MCP Server:', error);
  process.exit(1);
});
