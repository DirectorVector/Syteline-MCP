# SyteLine MCP Server - Critical LLM Instructions

## 🚨 MANDATORY AUTHENTICATION FIRST

## Environment Setup

Before using this MCP server, ensure the `.env` file is configured with your SyteLine server details:

```bash
# Required SyteLine server configuration
BASE_URL=http://your-syteline-server:port/IDORequestService/ido
SYTELINE_USERNAME=your_username
SYTELINE_PASSWORD=your_password
DEFAULT_SITE=Demo_DALS
```

## Quick Start for LLMs

### CRITICAL: Authentication Required First

**Every SyteLine operation requires a valid authentication token.** You must get a token before calling any other functions.

### Step 1: Always Authenticate First

```typescript
// REQUIRED FIRST CALL - No other SyteLine operations work without this
// Credentials are sent as HTTP headers — never in the URL.
const authResult = await syteline_get_security_token({
  config: "Demo_DALS",       // Defaults to DEFAULT_SITE env var
  username: "your_user",     // Defaults to SYTELINE_USERNAME env var
  password: "your_pass"      // Defaults to SYTELINE_PASSWORD env var
});
```

**What happens:**
- Makes GET request to `/token/{config}` with username/password as HTTP headers
- SyteLine returns token (JSON format: `{"Token": "abc123xyz", "Success": true}` or plain text)
- Token is automatically cached for 20 minutes
- All subsequent tools use this cached token automatically via the raw Authorization header (no Bearer prefix)

## 📋 Essential Operation Sequence

### 1. Authentication (MANDATORY)
```typescript
await syteline_get_security_token({
  config: "Demo_DALS",       // Defaults to DEFAULT_SITE env var
  username: "admin", 
  password: "password"
});
```

### 2. Discovery (Recommended)
```typescript
// Note: No API exists to list all IDOs - you must know IDO names\n// Common IDOs: UserNames, Items, Customers, Jobs, Vendors

// Get schema for specific IDO
const schema = await syteline_get_ido_info({
  idoName: "UserNames"
});
```

### 3. Query Data
```typescript
const data = await syteline_load_collection({
  ido: "UserNames",
  properties: ["UserId", "UserName", "UserDesc"],
  filter: "Active = 1",
  recordCap: 50
});
```

### 4. Modify Data (if needed)
```typescript
// CRITICAL: Updates require RowPointer from query results
const updateResult = await syteline_update_item({
  ido: "UserNames",
  rowPointer: data.Items[0].RowPointer,  // From LoadCollection result
  properties: {
    "UserDesc": "Updated description"
  }
});
```

## 🔑 Authentication Details

### Token Lifecycle
- **Acquisition**: GET `/token/{config}` with username/password as HTTP headers
- **Response**: JSON `{"Token": "...", "Success": true}` or plain text
- **Caching**: Automatically cached for 20 minutes
- **Usage**: All tools use raw `Authorization: {token}` header (no Bearer prefix)
- **Expiry**: Auto-refresh on 401 responses

### Configuration Names
- Config defaults to `DEFAULT_SITE` environment variable
- Do not hardcode config lists — config names are environment-specific
- Use SLSites discovery (after authenticating) to list available sites when needed

## 📊 Core Data Operations

### Load Collection (Query Data)
```typescript
const result = await syteline_load_collection({
  ido: "Items",                          // IDO name (case-sensitive)
  properties: ["Item", "Description"],   // Specific fields (optional)
  filter: "ProductCode = 'MANUFACTURED'", // SyteLine SQL filter
  orderBy: "Item ASC",                   // Sort order
  recordCap: 100                         // Limit results
});
```

### Update Records
```typescript
// Step 1: Get current record (for RowPointer)
const current = await syteline_load_collection({
  ido: "UserNames",
  filter: "UserId = 'targetuser'"
});

// Step 2: Update using RowPointer
const updated = await syteline_update_item({
  ido: "UserNames",
  rowPointer: current.Items[0].RowPointer,  // REQUIRED from query
  properties: {
    "UserDesc": "New description"
  },
  refreshAfterUpdate: true
});
```

### Insert Records  
```typescript
const inserted = await syteline_insert_item({
  ido: "UserNames",
  properties: {
    "UserId": "NEWUSER01",
    "UserName": "New User",
    "UserDesc": "Description",
    "Active": 1
  }
});
```

### Delete Records
```typescript
const deleted = await syteline_delete_item({
  ido: "UserNames",
  rowPointer: "12345678-90ab-cdef-1234-567890abcdef"  // From LoadCollection
});
```

## 🔍 SyteLine Filter Syntax

### String Filters
```sql
UserId = 'admin'                    -- Exact match
UserName LIKE 'John%'               -- Starts with
UserName LIKE '%Smith'              -- Ends with
UserName LIKE '%John%'              -- Contains
```

### Numeric Filters
```sql
Qty > 100                           -- Greater than
Qty >= 100                          -- Greater or equal
Price BETWEEN 10 AND 50             -- Range
```

### Boolean Filters
```sql
Active = 1                          -- True
Active = 0                          -- False
```

### Date Filters
```sql
CreateDate >= '2024-01-01'          -- Date comparison
CreateDate BETWEEN '2024-01-01' AND '2024-12-31'  -- Date range
```

### Complex Filters
```sql
Active = 1 AND ProductCode = 'MANUFACTURED'
UserId = 'admin' OR UserId = 'supervisor'
Active = 1 AND (ProductCode = 'MANUFACTURED' OR ProductCode = 'PURCHASED')
```

## 📋 Common IDOs Reference

| IDO Name | Purpose | Key Properties | Common Filters |
|----------|---------|----------------|----------------|
| `UserNames` | User management | `UserId`, `UserName`, `UserDesc`, `Active` | `Active = 1` |
| `Items` | Item master | `Item`, `Description`, `ProductCode` | `ProductCode = 'MANUFACTURED'` |
| `Customers` | Customer data | `CustNum`, `Name`, `CustType`, `Active` | `Active = 1` |
| `Jobs` | Work orders | `Job`, `Suffix`, `Description`, `Status` | `Status = 'R'` |
| `Vendors` | Vendor info | `VendNum`, `Name`, `VendType`, `Active` | `Active = 1` |

## ⚠️ Critical Rules for LLMs

### 1. Authentication is MANDATORY
- **ALWAYS** call `syteline_get_security_token` first
- **NO** other operations work without authentication
- Token is automatically cached and managed

### 2. RowPointer Requirements
- **Update/Delete** operations REQUIRE RowPointer
- **RowPointer** comes from LoadCollection queries only
- **RowPointer** is a GUID string that uniquely identifies records

### 3. Case Sensitivity
- **IDO names** are case-sensitive: `UserNames` not `usernames`
- **Property names** are case-sensitive: `UserId` not `userid`
- **Filter strings** need single quotes: `'value'` not `"value"`

### 4. Data Types in Filters
- **Strings**: Use single quotes `'admin'`
- **Numbers**: No quotes `123` or `123.45`
- **Booleans**: Use `1` for true, `0` for false
- **Dates**: ISO format `'2024-01-01'` or `'2024-01-01 10:30:00'`

### 5. Error Handling
- All operations return `{ success: boolean, ... }`
- **Always check** `success` field before processing data
- Error details in `error` field when `success` is `false`

## 🚀 Common Usage Patterns

### Pattern 1: Data Exploration
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Get schema for known IDO
const schema = await syteline_get_ido_info({ 
  idoName: "Items"  // Must know IDO name - no listing endpoint exists
});

// 4. Query sample data
const sample = await syteline_load_collection({
  ido: "Items",
  recordCap: 10
});
```

### Pattern 2: Targeted Query
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Query with criteria
const filtered = await syteline_load_collection({
  ido: "Items",
  properties: ["Item", "Description", "ProductCode"],
  filter: "ProductCode = 'MANUFACTURED'",
  orderBy: "Item ASC",
  recordCap: 50
});
```

### Pattern 3: Record Update
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Find record
const current = await syteline_load_collection({
  ido: "UserNames",
  filter: "UserId = 'admin'"
});

// 3. Update record
const updated = await syteline_update_item({
  ido: "UserNames",
  rowPointer: current.Items[0].RowPointer,
  properties: { "UserDesc": "Updated Description" },
  refreshAfterUpdate: true
});
```

## 🔧 Troubleshooting

### "401 Unauthorized"
- **Solution**: Call `syteline_get_security_token` first
- **Check**: Username/password credentials
- **Verify**: Configuration name is correct

### "Invalid IDO name"
- **Solution**: Use common IDO names (UserNames, Items, Customers, Jobs, Vendors)
- **Check**: Spelling and case sensitivity (usually PascalCase)

### "RowPointer not found" 
- **Solution**: Call `syteline_load_collection` to get valid RowPointers
- **Check**: RowPointer format (GUID with hyphens)

### "Required field missing"
- **Solution**: Call `syteline_get_new_record_defaults` to see required fields
- **Ensure**: All required properties have values

---

## 📚 Quick Reference Card

| Step | Tool | Purpose |
|------|------|---------|
| 1. | `syteline_get_security_token` | **MANDATORY FIRST** |
| 2. | `syteline_get_ido_info` | Get IDO schema/properties (for known IDOs) |
| 3. | `syteline_get_ido_info` | Get IDO schema/properties |
| 4. | `syteline_load_collection` | Query data |
| 5. | `syteline_update_item` | Update records (needs RowPointer) |
| 6. | `syteline_insert_item` | Create new records |
| 7. | `syteline_delete_item` | Delete records (needs RowPointer) |

**Remember: Authentication first, then everything else works!**