# Google Calendar MCP Server

Multi-tenant Google Calendar MCP server with Platform JWT authentication and service account impersonation.

## Overview

This is a wrapper for the Google Calendar MCP server that enables multi-tenant access through Platform JWT authentication. Unlike traditional OAuth-based services, this server uses **Google service account authentication with domain-wide delegation** to provide per-user access to Google Calendar and Gmail.

## Architecture

```
Client (Platform JWT)
  ↓
Platform JWT Provider (validates JWT → userId)
  ↓
Google Credentials Resolver (userId → email via platform API)
  ↓
Google Calendar MCP Server Factory (creates per-user instance)
  ↓
Google Calendar/Gmail APIs (via service account impersonation)
```

### Key Components

1. **Platform JWT Provider**: Validates JWTs issued by the platform and extracts user identity
2. **Google Credentials Resolver**: Resolves user's Google Workspace email from platform API
3. **MCP Server Factory**: Creates isolated server instances per user
4. **Service Account Impersonation**: Uses domain-wide delegation to access user data

### Key Differences from OAuth

| Aspect | OAuth Services | Google Calendar (Service Account) |
|--------|----------------|-----------------------------------|
| **Credentials** | Per-user OAuth tokens | Shared service account key |
| **Platform Stores** | OAuth access/refresh tokens | User email addresses |
| **Authentication** | OAuth token per user | Service account impersonates user |
| **Token Expiry** | Yes (need refresh) | No (email doesn't expire) |
| **Setup** | OAuth app per service | One service account for all users |
| **Domain Restriction** | No | Yes (Google Workspace only) |

## Features

- ✅ Multi-tenant architecture with per-user isolation
- ✅ Platform JWT authentication
- ✅ Service account impersonation for Google Workspace
- ✅ Access to Google Calendar and Gmail APIs
- ✅ Rate limiting (100 requests/hour per user)
- ✅ Audit logging with user tracking
- ✅ Docker containerization
- ✅ Cloud Run deployment ready
- ✅ Secret management via Google Cloud Secret Manager

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Docker** (for containerization)
- **Google Cloud Project** with:
  - Service account with domain-wide delegation
  - Calendar and Gmail API enabled
  - Secret Manager API enabled
- **Google Workspace** domain (personal Gmail not supported)
- **Platform** that:
  - Issues JWTs with `userId` claim
  - Implements `/api/credentials/google` endpoint
  - Stores user Google Workspace email addresses

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/prmichaelsen/google-calendar-mcp-server.git
cd google-calendar-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

### Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

**Required Variables:**

```env
# Platform JWT Authentication
PLATFORM_SERVICE_TOKEN=your-shared-secret
PLATFORM_URL=https://your-platform.com

# Google Service Account
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CALENDAR_ID=primary

# Server
PORT=8080
NODE_ENV=development
```

### Google Service Account Setup

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to IAM & Admin → Service Accounts
   - Create new service account
   - Download JSON key file

2. **Enable Domain-Wide Delegation**:
   - Edit service account
   - Check "Enable Google Workspace Domain-wide Delegation"
   - Note the Client ID

3. **Configure Domain-Wide Delegation**:
   - Go to [Google Workspace Admin Console](https://admin.google.com)
   - Navigate to Security → API Controls → Domain-wide Delegation
   - Add new API client with Client ID
   - Add scopes:
     ```
     https://www.googleapis.com/auth/calendar
     https://www.googleapis.com/auth/gmail.readonly
     https://www.googleapis.com/auth/gmail.send
     ```

4. **Enable APIs**:
   - Enable Google Calendar API
   - Enable Gmail API

### Platform API Requirements

The platform must implement a credentials endpoint:

```typescript
// GET /api/credentials/google
// Headers: { Authorization: Bearer <jwt-token>, X-User-ID: <user-id> }

export async function GET(request: Request) {
  const userId = request.headers.get('X-User-ID');
  
  // Query database for user's Google Workspace email
  const user = await db.query(
    'SELECT google_workspace_email FROM users WHERE id = $1',
    [userId]
  );
  
  if (!user.rows[0]?.google_workspace_email) {
    return Response.json(
      { error: 'Google Workspace email not configured' },
      { status: 404 }
    );
  }
  
  // Return email in access_token field
  return Response.json({
    access_token: user.rows[0].google_workspace_email
  });
}
```

## Development

### Local Development

```bash
# Start in development mode with hot reload
npm run dev
```

### Build

```bash
# Compile TypeScript
npm run build

# Run compiled code
npm start
```

### Docker

```bash
# Build Docker image
docker build -t google-calendar-mcp-server .

# Run container
docker run -p 8080:8080 \
  -e PLATFORM_SERVICE_TOKEN=your-secret \
  -e PLATFORM_URL=https://your-platform.com \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json \
  -v /path/to/service-account-key.json:/app/service-account-key.json \
  google-calendar-mcp-server
```

## Deployment

### Deploy to Google Cloud Run

#### Using Cloud Build

1. **Set up secrets**:
   ```bash
   # Create secrets with google-calendar-* prefix
   echo -n "your-service-token" | gcloud secrets create google-calendar-platform-service-token --data-file=-
   gcloud secrets create google-calendar-service-account-key --data-file=/path/to/key.json
   ```

2. **Deploy via Cloud Build**:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

#### Manual Deployment

```bash
# Build and push image
docker build -t gcr.io/PROJECT_ID/google-calendar-mcp-server .
docker push gcr.io/PROJECT_ID/google-calendar-mcp-server

# Deploy to Cloud Run
gcloud run deploy google-calendar-mcp-server \
  --image gcr.io/PROJECT_ID/google-calendar-mcp-server \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars PLATFORM_URL=https://your-platform.com \
  --update-secrets PLATFORM_SERVICE_TOKEN=google-calendar-platform-service-token:latest,GOOGLE_APPLICATION_CREDENTIALS=google-calendar-service-account-key:latest
```

## Usage

### Authentication

All requests must include a Platform JWT in the Authorization header:

```bash
curl -X POST https://your-server.run.app/mcp/message \
  -H "Authorization: Bearer <platform-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Generate Test JWT

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'test-user-123' },
  'your-service-token',
  {
    issuer: 'agentbase.me',
    audience: 'mcp-server',
    expiresIn: '1h'
  }
);

console.log(token);
```

### Available Tools

All tools are prefixed with `google_*`:

- `google_calendar_list_events` - List calendar events
- `google_calendar_create_event` - Create calendar event
- `google_calendar_update_event` - Update calendar event
- `google_calendar_delete_event` - Delete calendar event
- `google_gmail_list_messages` - List Gmail messages
- `google_gmail_send_message` - Send Gmail message
- `google_gmail_search_messages` - Search Gmail messages

## Security

### Best Practices

1. **Never commit secrets**:
   - `.env` files are in `.gitignore`
   - Use Secret Manager for production
   - Rotate secrets regularly

2. **Service Account Key**:
   - Store securely (Secret Manager)
   - Use separate keys per environment
   - Limit scope to necessary APIs
   - Monitor usage and audit logs

3. **Platform JWT**:
   - Use strong shared secret (32+ characters)
   - Validate issuer and audience
   - Check expiration
   - Rotate service token periodically

4. **Rate Limiting**:
   - Per-user limits prevent abuse
   - Monitor for unusual patterns
   - Adjust limits based on usage

5. **Audit Logging**:
   - All operations logged with userId
   - Monitor for unauthorized access
   - Set up alerts for anomalies

### Security Warnings

⚠️ **IMPORTANT**:
- This server requires Google Workspace (not personal Gmail)
- Service account has domain-wide delegation (powerful permissions)
- Only deploy in trusted environments
- Ensure platform properly validates users
- Monitor all access and operations

## Troubleshooting

### Common Issues

**"Invalid JWT"**:
- Check `PLATFORM_SERVICE_TOKEN` matches platform
- Verify JWT issuer and audience
- Check JWT expiration

**"No Google credentials"**:
- Ensure platform returns user email
- Verify `/api/credentials/google` endpoint works
- Check user has Google Workspace email configured

**"Permission denied"**:
- Verify service account has domain-wide delegation
- Check scopes are configured in Workspace Admin
- Ensure user is in authorized domain

**"Service account key not found"**:
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify file exists and is readable
- Ensure key is valid JSON

## Project Structure

```
google-calendar-mcp-server/
├── src/
│   ├── index.ts                      # Main entry point
│   └── auth/
│       ├── platform-jwt-provider.ts  # JWT validation
│       └── google-credentials-resolver.ts  # Email resolution
├── dist/                             # Compiled JavaScript
├── agent/                            # ACP documentation
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── Dockerfile                        # Docker configuration
├── cloudbuild.yaml                   # GCP build pipeline
├── .env.example                      # Environment template
└── README.md                         # This file
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/prmichaelsen/google-calendar-mcp-server/issues
- Documentation: See `agent/` directory for detailed design docs

## Related Projects

- [@prmichaelsen/google-calendar-mcp](https://github.com/prmichaelsen/google-calendar-mcp) - Base MCP server
- [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth) - Authentication framework
- [agentbase-mcp-server](https://github.com/prmichaelsen/agentbase-mcp-server) - Reference implementation

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
