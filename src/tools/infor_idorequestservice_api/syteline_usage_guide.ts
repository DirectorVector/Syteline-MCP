/**
 * SyteLine Usage Guide - Interactive help tool for LLMs
 * 
 * This tool provides contextual help and instructions for using the SyteLine MCP server.
 * It's designed to give LLMs quick access to critical usage patterns and requirements.
 */

interface ExecuteFunctionArgs {
  section?: string; // Which section of help to display ('all', 'authentication', 'querying', 'modification', etc.)
  ido?: string; // Specific IDO to get help for
}

const executeFunction = async (args: ExecuteFunctionArgs = {}): Promise<any> => {
  const section = args.section || 'all';
  const ido = args.ido;

  try {
    const guides = {
      authentication: {
        title: "🔑 SyteLine Authentication (MANDATORY FIRST STEP)",
        content: `
**CRITICAL**: You MUST call syteline_get_security_token before ANY other SyteLine operations!

Basic Authentication:
\`\`\`typescript
await syteline_get_security_token({
  config: "SL_PROD",        // SyteLine configuration name
  username: "your_user",    // Your SyteLine username
  password: "your_pass"     // Your SyteLine password
});
\`\`\`

What happens:
• Makes GET request to /json/token/{config}/{username}/{password}
• SyteLine returns plain text token with quotes: "abc123xyz..."
• Token is automatically cached for 20 minutes
• All subsequent tools use this cached token

Common config names: SL_PROD, TEST_CONFIG, DEVELOPMENT, SL_DEMO

⚠️  NO other operations will work without authentication first!
        `
      },

      querying: {
        title: "📊 SyteLine Data Querying",
        content: `
**Load Collection** - Primary method for querying SyteLine data:

\`\`\`typescript
const result = await syteline_load_collection({
  ido: "UserNames",                    // IDO name (case-sensitive!)
  properties: ["UserId", "UserName"],  // Specific fields (optional)
  filter: "Active = 1",                // SyteLine SQL filter (optional)
  orderBy: "UserId ASC",               // Sort order (optional)
  recordCap: 50                        // Limit results (optional)
});
\`\`\`

**Get IDO Schema/Info:**
\`\`\`typescript
const schema = await syteline_get_ido_info({ idoName: "UserNames" });
\`\`\`

**Filter Syntax Examples:**
• Strings: filter: "UserId = 'admin'"
• Numbers: filter: "Qty > 100"
• Booleans: filter: "Active = 1" (1=true, 0=false)
• Dates: filter: "CreateDate >= '2024-01-01'"
• Complex: filter: "Active = 1 AND ProductCode = 'MANUFACTURED'"
        `
      },

      modification: {
        title: "✏️ SyteLine Data Modification",
        content: `
**CRITICAL**: Updates and deletes require RowPointer from LoadCollection!

**Update Pattern:**
\`\`\`typescript
// Step 1: Get current record (for RowPointer)
const current = await syteline_load_collection({
  ido: "UserNames",
  filter: "UserId = 'targetuser'"
});

// Step 2: Update using RowPointer
const updated = await syteline_update_item({
  ido: "UserNames",
  rowPointer: current.Items[0].RowPointer,  // REQUIRED!
  properties: {
    "UserDesc": "New description"
  },
  refreshAfterUpdate: true
});
\`\`\`

**Insert New Record:**
\`\`\`typescript
const inserted = await syteline_insert_item({
  ido: "UserNames",
  properties: {
    "UserId": "NEWUSER01",
    "UserName": "New User",
    "Active": 1
  }
});
\`\`\`

**Delete Record:**
\`\`\`typescript
const deleted = await syteline_delete_item({
  ido: "UserNames",
  rowPointer: "12345678-90ab-cdef-1234-567890abcdef"  // From LoadCollection
});
\`\`\`

⚠️  RowPointer is a GUID string that uniquely identifies each record!
        `
      },

      sequence: {
        title: "📋 Essential Operation Sequence",
        content: `
**Mandatory Sequence for ALL SyteLine work:**

1. **Authentication (REQUIRED FIRST):**
   \`await syteline_get_security_token({...});\`

2. **Discovery (Recommended):**
   \`await syteline_get_ido_info({idoName: "UserNames"});\`  // For known IDOs

3. **Query Data:**
   \`await syteline_load_collection({ido: "..."});\`

4. **Modify Data (if needed):**
   \`await syteline_update_item({...});\` (requires RowPointer)
   \`await syteline_insert_item({...});\`
   \`await syteline_delete_item({...});\` (requires RowPointer)

**Key Rules:**
• ALWAYS authenticate first - nothing works without it
• Use LoadCollection to get RowPointers before updates/deletes
• IDO names and property names are case-sensitive
• Use single quotes in filter strings: 'value' not "value"
        `
      },

      troubleshooting: {
        title: "🔧 Common Issues & Solutions",
        content: `
**"401 Unauthorized"**
→ Solution: Call syteline_get_security_token first
→ Check: Username/password are correct
→ Verify: Configuration name matches server setup

**"Invalid IDO name"**
→ Solution: Use common IDO names (UserNames, Items, Customers, Jobs, Vendors)
→ Check: Spelling and case (usually PascalCase like "UserNames")
→ Note: No API endpoint exists to list all available IDOs - you need to know them

**"RowPointer not found"**
→ Solution: Call syteline_load_collection to get valid RowPointers
→ Check: RowPointer is GUID with hyphens format

**"Required field missing"**
→ Solution: Call syteline_get_new_record_defaults to see required fields
→ Ensure: All required properties have values

**"Filter syntax error"**
→ Use single quotes for strings: 'admin' not "admin"
→ Use 1/0 for booleans, not true/false
→ Use ISO dates: '2024-01-01' not other formats

**"Token expired"**
→ Tokens expire after ~20 minutes
→ Just call syteline_get_security_token again
→ Token refresh is automatic on 401 responses
        `
      },

      common_idos: {
        title: "📋 Common IDO Reference",
        content: `
**Most Frequently Used IDOs:**

**UserNames** - User management
• Properties: UserId, UserName, UserDesc, Active
• Common filters: "Active = 1", "UserId <> 'admin'"

**Items** - Item master data  
• Properties: Item, Description, ProductCode, UnitOfMeasure
• Common filters: "ProductCode = 'MANUFACTURED'", "Active = 1"

**Customers** - Customer data
• Properties: CustNum, Name, CustType, Active
• Common filters: "Active = 1", "CustType = 'EXTERNAL'"

**Jobs** - Work orders
• Properties: Job, Suffix, Description, Status
• Common filters: "Status = 'R'", "Job LIKE 'J%'"

**Vendors** - Vendor information
• Properties: VendNum, Name, VendType, Active
• Common filters: "Active = 1", "VendType = 'SUPPLIER'"

**ItemLocs** - Item locations/inventory
• Properties: Item, Loc, QtyOnHand, QtyAvailable
• Common filters: "QtyOnHand > 0", "Loc = 'MAIN'"

To get complete schema for any IDO:
\`await syteline_get_ido_info({ idoName: "IDO_NAME" });\`
        `
      }
    };

    // Handle specific IDO help
    if (ido) {
      return {
        success: true,
        help_type: "ido_specific",
        ido: ido,
        content: `
🔍 **Help for IDO: ${ido}**

To get detailed information about this IDO:

\`\`\`typescript
// Get schema and properties
const schema = await syteline_get_ido_info({ 
  idoName: "${ido}" 
});

// Query sample data
const sample = await syteline_load_collection({
  ido: "${ido}",
  recordCap: 10  // Limit to 10 records for sampling
});
\`\`\`

**Remember:** 
1. Call syteline_get_security_token first!
2. IDO names are case-sensitive
3. Use the schema info to understand available properties
4. Use sample data to see actual values and RowPointer format
        `
      };
    }

    // Handle section-specific help
    if (section !== 'all') {
      const guide = guides[section as keyof typeof guides];
      if (!guide) {
        return {
          success: false,
          error: `Unknown help section: ${section}`,
          available_sections: Object.keys(guides)
        };
      }

      return {
        success: true,
        help_type: "section_specific",
        section: section,
        title: guide.title,
        content: guide.content
      };
    }

    // Return complete help
    return {
      success: true,
      help_type: "complete_guide",
      title: "🚀 SyteLine MCP Server - Complete Usage Guide",
      content: `
⚠️  **CRITICAL**: Always call syteline_get_security_token FIRST!

**Quick Start Checklist:**
1. ✅ Authenticate: syteline_get_security_token({config, username, password})
2. ✅ Discover: syteline_get_ido_info({idoName: "UserNames"}) (for known IDOs)
3. ✅ Query: syteline_load_collection({ido: "..."})
4. ✅ Modify: syteline_update_item() (needs RowPointer from step 3)

**Available Help Sections:**
• authentication - Token setup and requirements
• querying - How to load and filter data
• modification - Insert, update, delete operations
• sequence - Proper order of operations
• troubleshooting - Common errors and fixes
• common_idos - Reference for frequently used IDOs

**Get specific help:**
\`syteline_usage_guide({ section: "authentication" })\`
\`syteline_usage_guide({ section: "querying" })\`
\`syteline_usage_guide({ ido: "UserNames" })\`

**Remember the Golden Rule:** 
🔑 Authentication first, then everything else works!
      `,
      sections: Object.keys(guides)
    };

  } catch (error) {
    return {
      success: false,
      error: `Usage guide error: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

export const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function' as const,
    function: {
      name: 'syteline_usage_guide',
      description: `📚 Interactive SyteLine Usage Guide

Get comprehensive help and instructions for using SyteLine MCP tools effectively.

This tool provides:
• Critical authentication requirements
• Step-by-step operation sequences  
• Common usage patterns
• Troubleshooting guidance
• IDO-specific help

Essential for LLMs to understand SyteLine workflows and avoid common mistakes.

Usage examples:
• syteline_usage_guide() - Complete guide
• syteline_usage_guide({section: "authentication"}) - Auth help
• syteline_usage_guide({section: "querying"}) - Query help
• syteline_usage_guide({ido: "UserNames"}) - IDO-specific help`,
      parameters: {
        type: 'object' as const,
        properties: {
          'section': {
            "type": "string",
            "description": "Specific help section: 'authentication', 'querying', 'modification', 'sequence', 'troubleshooting', 'common_idos', or 'all' for complete guide",
            "enum": ["all", "authentication", "querying", "modification", "sequence", "troubleshooting", "common_idos"]
          },
          'ido': {
            "type": "string",
            "description": "Get help for a specific IDO name (e.g., 'UserNames', 'Items', 'Customers')"
          }
        },
        required: []
      }
    }
  }
};