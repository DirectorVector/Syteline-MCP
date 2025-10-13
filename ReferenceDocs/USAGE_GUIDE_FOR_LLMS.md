# SyteLine MCP Server - LLM Usage Guide

## Overview

This document provides comprehensive instructions for AI assistants and LLMs on how to effectively use the SyteLine MGRESTService MCP Server. The server provides access to SyteLine/Mongoose ERP system through a RESTful API with intelligent token management.

## 🔑 Authentication Requirements

**CRITICAL**: Every SyteLine operation MUST start with authentication. No other operations will work without a valid token.

### Step 1: Always Authenticate First

```typescript
const authResult = await syteline_get_security_token({
  configName: "SL_PROD",      // Configuration name (typically SL_PROD, TEST_CONFIG, etc.)
  username: "your_username",   // SyteLine user account
  password: "your_password"    // User password
});
```

**Token Management**: The server automatically caches and refreshes tokens. You don't need to manually handle tokens between calls.

## 📊 Core Data Operations

### 1. Querying Data (LoadCollection)

The primary method for retrieving data from SyteLine is `syteline_load_collection`.

#### Basic Query Pattern
```typescript
const result = await syteline_load_collection({
  ido: "IDO_NAME",                    // Required: IDO collection name
  properties: ["Field1", "Field2"],   // Optional: Specific fields to retrieve
  filter: "FieldName = 'Value'",      // Optional: Filter criteria
  orderBy: "FieldName ASC",           // Optional: Sort order
  recordCap: 100                      // Optional: Limit number of records
});
```

#### Response Structure
```typescript
{
  success: true,
  ido: "UserNames",
  recordCount: 5,
  data: {
    Items: [
      {
        RowPointer: "GUID-STRING",  // IMPORTANT: Required for updates/deletes
        Properties: {
          "UserId": "admin",
          "UserName": "Administrator",
          "UserDesc": "System Administrator"
        }
      }
    ]
  }
}
```

### 2. Discovery Operations

#### Find Available IDOs
```typescript
const idoList = await syteline_get_ido_collection_names();
// Returns: { success: true, idoNames: ["UserNames", "Items", "Customers", ...] }
```

#### Get IDO Schema
```typescript
const schema = await syteline_get_ido_info({
  idoName: "UserNames"
});
// Returns detailed property information, data types, constraints
```

### 3. Data Modification Operations

#### Insert New Record
```typescript
const insertResult = await syteline_insert_item({
  ido: "UserNames",
  properties: {
    "UserId": "NEWUSER01",
    "UserName": "New User",
    "UserDesc": "New user description",
    "Active": 1
  }
});
```

#### Update Existing Record
**REQUIRES RowPointer from a LoadCollection query**:

```typescript
// Step 1: Get current data to obtain RowPointer
const current = await syteline_load_collection({
  ido: "UserNames",
  filter: "UserId = 'TARGETUSER'"
});

// Step 2: Update using the RowPointer
const updateResult = await syteline_update_item({
  ido: "UserNames",
  rowPointer: current.data.Items[0].RowPointer,  // CRITICAL: Use RowPointer from query
  properties: {
    "UserDesc": "Updated description"
  },
  refreshAfterUpdate: true  // Returns updated record
});
```

#### Delete Record
```typescript
const deleteResult = await syteline_delete_item({
  ido: "UserNames",
  rowPointer: current.data.Items[0].RowPointer  // CRITICAL: Use RowPointer
});
```

## 🎯 Common Usage Patterns

### Pattern 1: Data Exploration
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Discover available IDOs
const idoList = await syteline_get_ido_collection_names();

// 3. Get schema for specific IDO
const schema = await syteline_get_ido_info({
  idoName: "Items"
});

// 4. Query sample data
const sampleData = await syteline_load_collection({
  ido: "Items",
  recordCap: 10
});
```

### Pattern 2: Targeted Data Query
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Query with specific criteria
const filteredData = await syteline_load_collection({
  ido: "Items",
  properties: ["Item", "Description", "ProductCode", "UnitOfMeasure"],
  filter: "ProductCode = 'MANUFACTURED'",
  orderBy: "Item ASC",
  recordCap: 50
});
```

### Pattern 3: Record Modification
```typescript
// 1. Authenticate
await syteline_get_security_token({...});

// 2. Find record to modify
const currentRecord = await syteline_load_collection({
  ido: "UserNames",
  filter: "UserId = 'admin'"
});

// 3. Update the record
const updateResult = await syteline_update_item({
  ido: "UserNames",
  rowPointer: currentRecord.data.Items[0].RowPointer,
  properties: {
    "UserDesc": "Updated Administrator Description"
  },
  refreshAfterUpdate: true
});
```

## 🔍 Filter Syntax Guide

SyteLine uses specific syntax for filtering data:

### String Comparisons
```typescript
filter: "UserId = 'admin'"              // Exact match
filter: "UserName LIKE 'John%'"         // Starts with
filter: "UserName LIKE '%Smith'"        // Ends with  
filter: "UserName LIKE '%John%'"        // Contains
```

### Numeric Comparisons
```typescript
filter: "Qty > 100"                     // Greater than
filter: "Qty >= 100"                    // Greater than or equal
filter: "Price BETWEEN 10 AND 50"       // Range
```

### Boolean Values
```typescript
filter: "Active = 1"                    // True
filter: "Active = 0"                    // False
```

### Date Comparisons
```typescript
filter: "CreateDate >= '2024-01-01'"    // Date comparison
filter: "CreateDate BETWEEN '2024-01-01' AND '2024-12-31'"  // Date range
```

### Multiple Conditions
```typescript
filter: "Active = 1 AND ProductCode = 'MANUFACTURED'"       // AND condition
filter: "UserId = 'admin' OR UserId = 'supervisor'"         // OR condition
filter: "Active = 1 AND (ProductCode = 'MANUFACTURED' OR ProductCode = 'PURCHASED')"  // Complex
```

## 📋 Common IDO Reference

| IDO Name | Purpose | Key Properties | Common Filters |
|----------|---------|----------------|----------------|
| `UserNames` | User management | `UserId`, `UserName`, `UserDesc`, `Active` | `Active = 1`, `UserId <> 'admin'` |
| `Items` | Item master data | `Item`, `Description`, `ProductCode`, `UnitOfMeasure` | `ProductCode = 'MANUFACTURED'`, `Active = 1` |
| `Customers` | Customer data | `CustNum`, `Name`, `CustType`, `Active` | `Active = 1`, `CustType = 'INTERNAL'` |
| `Jobs` | Work orders | `Job`, `Suffix`, `Description`, `Status` | `Status = 'R'`, `Job LIKE 'J%'` |
| `Vendors` | Vendor information | `VendNum`, `Name`, `VendType`, `Active` | `Active = 1`, `VendType = 'SUPPLIER'` |
| `ItemLocs` | Item locations | `Item`, `Loc`, `QtyOnHand`, `QtyAvailable` | `QtyOnHand > 0`, `Loc = 'MAIN'` |

## ⚠️ Critical Reminders for LLMs

### 1. Authentication is Mandatory
- **ALWAYS** call `syteline_get_security_token` first
- No other operations will work without authentication
- Token is automatically cached and refreshed

### 2. RowPointer Requirements
- Update and Delete operations **REQUIRE** a RowPointer
- RowPointer comes from LoadCollection queries
- RowPointer is a GUID string that uniquely identifies a record

### 3. Case Sensitivity
- IDO names are case-sensitive: Use `UserNames` not `usernames`
- Property names are case-sensitive: Use `UserId` not `userid`
- Filter values for strings should be in single quotes

### 4. Error Handling
- All operations return structured responses with `success` boolean
- Check `success` field before processing data
- Error details are in the `error` field when `success` is false

### 5. Data Types
- Strings: Use single quotes in filters `'value'`
- Numbers: No quotes `123` or `123.45`
- Booleans: Use `1` for true, `0` for false
- Dates: Use ISO format `'2024-01-01'` or `'2024-01-01 10:30:00'`

## 🚀 Advanced Operations

### Business Logic Methods
```typescript
const methodResult = await syteline_invoke_ido_method({
  ido: "Items",
  method: "ValidateItem",
  parameters: {
    "Item": "ITEM001",
    "CheckInventory": 1
  }
});
```

### Batch Operations
```typescript
const batchResult = await syteline_execute_batch({
  operations: [
    {
      type: "insert",
      ido: "Items",
      properties: { "Item": "NEW001", "Description": "New Item" }
    },
    {
      type: "update", 
      ido: "Items",
      rowPointer: "existing-row-pointer",
      properties: { "Description": "Updated Item" }
    }
  ]
});
```

### Property Validation
```typescript
const validationResult = await syteline_validate_property({
  ido: "Items",
  property: "Item",
  value: "NEWITEM001"
});
```

## 🔧 Troubleshooting Common Issues

### Authentication Failures
- Verify configuration name matches SyteLine setup
- Check username/password credentials
- Ensure MGRESTService is enabled on SyteLine server

### Query Failures
- Verify IDO name exists using `syteline_get_ido_collection_names`
- Check property names using `syteline_get_ido_info`
- Validate filter syntax

### Update/Delete Failures
- Ensure you have a valid RowPointer from LoadCollection
- Verify the record still exists
- Check user permissions for the operation

This guide provides the essential patterns and knowledge needed for LLMs to effectively interact with SyteLine through this MCP server. Always start with authentication, use proper syntax, and handle RowPointers correctly for data modifications.