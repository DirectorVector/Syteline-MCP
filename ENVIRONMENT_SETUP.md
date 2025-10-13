# SyteLine MCP Server Environment Configuration Guide

## Required Environment Variables

The SyteLine MCP server requires the following environment variables to be set in a `.env` file:

### Core Configuration

| Variable | Description | Example | Required |
|---------|-------------|---------|----------|
| `BASE_URL` | SyteLine server base URL with IDORequestService path | `http://sytelineserver:8080/IDORequestService/ido` | ✅ Yes |
| `SYTELINE_USERNAME` | SyteLine username for authentication | `mcpuser` | ✅ Yes |
| `SYTELINE_PASSWORD` | SyteLine password for authentication | `mcppassword` | ✅ Yes |
| `SYTELINE_CONFIG` | SyteLine configuration name | `SL_PROD` | ✅ Yes |

### Optional Configuration

| Variable | Description | Example | Required |
|---------|-------------|---------|----------|
| `API_KEY` | Additional API key if required by your setup | `your-api-key` | ❌ No |
| `NODE_ENV` | Environment mode | `production` | ❌ No |

## Setup Instructions

### 1. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

### 2. Configure Your Values

Edit the `.env` file with your actual SyteLine server details:

```bash
# Example configuration
BASE_URL=http://your-syteline-server.company.com:8080/IDORequestService/ido
SYTELINE_USERNAME=your_actual_username
SYTELINE_PASSWORD=your_actual_password
SYTELINE_CONFIG=SL_PROD
```

### 3. Verify Configuration

The server will automatically load these variables on startup. You can verify the configuration by running:

```bash
npm run build
npm run start
```

## Configuration Notes

### BASE_URL Format
- Must include the full path to the IDORequestService: `/IDORequestService/ido`
- Should include protocol (`http://` or `https://`)
- Include port if non-standard (e.g., `:8080`)

### SYTELINE_CONFIG Options
Common configuration names:
- `SL_PROD` - Production environment
- `SL_TEST` - Test environment  
- `SL_DEV` - Development environment
- Custom names as configured in your SyteLine installation

### Security Best Practices
- Never commit the `.env` file to version control
- Use strong passwords for SyteLine accounts
- Consider using environment-specific service accounts
- Regularly rotate credentials

## Troubleshooting

### Common Issues

**"No SyteLine credentials provided"**
- Ensure `SYTELINE_USERNAME` and `SYTELINE_PASSWORD` are set
- Check for typos in variable names

**"No BASE_URL provided"**
- Verify `BASE_URL` is set and includes the full MGRESTService path
- Test URL accessibility from your server

**"Token acquisition failed"**
- Verify credentials are correct
- Check if the SyteLine server is accessible
- Confirm the configuration name exists in SyteLine

### Testing Configuration

You can test your configuration using the built-in authentication tools:

```typescript
// Use the syteline_usage_guide tool to verify setup
await syteline_usage_guide({
  section: "authentication"
});
```

## Environment File Template

Copy this template to create your `.env` file:

```bash
# SyteLine MCP Server Configuration
# Replace all values with your actual server details

# REQUIRED: SyteLine Server
BASE_URL=http://your-syteline-server:port/IDORequestService/ido

# REQUIRED: Authentication
SYTELINE_USERNAME=your_username
SYTELINE_PASSWORD=your_password
SYTELINE_CONFIG=SL_PROD

# OPTIONAL: Additional settings
# API_KEY=your_api_key_if_required
NODE_ENV=production
```