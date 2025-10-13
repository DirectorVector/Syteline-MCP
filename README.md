# SyteLine MCP Server

🔑 **SyteLine IDORequestService MCP Server** - Enterprise ERP integration for AI assistants

## 🚨 CRITICAL: Authentication Required First!

**This server connects to SyteLine/Mongoose ERP systems. EVERY session must start with authentication!**

```typescript
// REQUIRED FIRST CALL - Nothing works without this!
await syteline_get_security_token({
  config: "SL_PROD",        // Your SyteLine configuration
  username: "your_user",    // Your SyteLine username  
  password: "your_pass"     // Your SyteLine password
});
```

This project provides:

- ✅ **Complete SyteLine IDORequestService API coverage** - All endpoints implemented
- ✅ **Intelligent token management** - Automatic caching and refresh
- ✅ **LLM-optimized tools** - Clear descriptions and usage patterns
- ✅ **Interactive help system** - Built-in usage guide tool
- ✅ **Production-ready** - Comprehensive error handling and validation

## 🚦 Getting Started

### ⚙️ Prerequisites

Before starting, please ensure you have:

- [Node.js (v18+ required)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node)

### 📥 Installation & Setup

**1. Install dependencies**

Run from your project's root directory:

```sh
npm install
```

**2. Build the TypeScript project**

```sh
npm run build
```

**3. Configure Environment Variables**

Create a `.env` file in the root of the project by copying the `.env.example` file:

```sh
cp .env.example .env
```

Open the new `.env` file and add your API credentials:

```
# The base URL for the API
BASE_URL=https://api.example.com

# Your API Key for authentication (if required)
API_KEY=your_secret_api_key_here
```

The generated tools will use these environment variables for making API calls. You can override these per-call by passing `BASE_URL` or `API_KEY` in the arguments to the tool.

### ▶️ Run the Server

You can run the server in two modes:

**1. Stdio Mode (Default - for Claude Desktop, etc.)**

This mode is ideal for MCP clients like Claude Desktop.

```sh
npm start
```

For development with auto-reload:

```sh
npm run dev
```

**2. HTTP Mode**

This mode exposes an HTTP endpoint at `/mcp` that can be called by any HTTP client.

```sh
node dist/index.js --http
```

The server will start on port 3001 by default (configurable via `PORT` env variable).

## 🚀 Quick Usage Guide

### Essential Operation Sequence

1. **Authenticate First** (MANDATORY):
   ```typescript
   await syteline_get_security_token({
     config: "SL_PROD",
     username: "your_user", 
     password: "your_pass"
   });
   ```

2. **Discover Available Data**:
   ```typescript
   // See what IDOs are available
   const idoList = await syteline_get_ido_collection_names();
   
   // Get schema for specific IDO
   const schema = await syteline_get_ido_info({ idoName: "UserNames" });
   ```

3. **Query Data**:
   ```typescript
   const data = await syteline_load_collection({
     ido: "UserNames",
     properties: ["UserId", "UserName", "UserDesc"],
     filter: "Active = 1",
     recordCap: 50
   });
   ```

4. **Get Interactive Help**:
   ```typescript
   // Complete usage guide
   await syteline_usage_guide();
   
   // Specific help sections
   await syteline_usage_guide({ section: "authentication" });
   await syteline_usage_guide({ section: "querying" });
   ```

### Key Rules for Success

- ⚠️ **ALWAYS authenticate first** - No other operations work without it
- 🔑 **Tokens are cached automatically** - No manual token management needed  
- 📋 **Use RowPointers for updates** - Get them from LoadCollection queries
- 📝 **IDO names are case-sensitive** - Usually PascalCase like "UserNames"
- 🔍 **Use single quotes in filters** - `"UserId = 'admin'"` not `"UserId = \"admin\""`

## 📊 Project Structure

```
src/
  ├── index.ts          # Main server entry point
  ├── lib/
  │   └── tools.ts      # Tool discovery logic
  └── tools/
      ├── paths.ts      # Tool registry
      └── [api_name]/   # Generated API tools
          └── *.ts      # Individual tool files
dist/                   # Compiled JavaScript (generated)
```

## 🔧 Development

**Watch mode** (auto-recompile on changes):

```sh
npm run watch
```

## 🔌 Using with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "infor-idorequestservice-api": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/project/dist/index.js"
      ]
    }
  }
}
```
