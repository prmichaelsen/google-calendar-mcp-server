# Google Calendar MCP Server - Requirements

**Created**: 2026-02-13  
**Status**: Initial Draft  
**Project Type**: Multi-tenant MCP Server Wrapper  

---

## Overview

Create a multi-tenant wrapper for the Google Calendar MCP server that enables Platform JWT authentication and per-user Google Calendar/Gmail access via service account impersonation.

## Core Requirements

### 1. Authentication
- ✅ **Platform JWT Authentication**: Validate JWTs issued by platform (agentbase.me)
- ✅ **User Identification**: Extract userId from JWT claims
- ✅ **Token Caching**: Cache authentication results to reduce overhead
- ✅ **Security**: Validate issuer, audience, and expiration

### 2. Credentials Resolution
- ✅ **Email Resolution**: Resolve user's Google Workspace email from platform API
- ✅ **Service Account Impersonation**: Use service account to impersonate users
- ✅ **Credentials Caching**: Cache email addresses to reduce API calls
- ✅ **Error Handling**: Handle missing or invalid credentials gracefully

### 3. Multi-Tenancy
- ✅ **Per-User Isolation**: Each user gets isolated server instance
- ✅ **Resource Naming**: All tools prefixed with `google_*`
- ✅ **Rate Limiting**: Per-user rate limits (100 req/hour)
- ✅ **Audit Logging**: Log all operations with userId

### 4. Server Infrastructure
- ✅ **SSE Transport**: Server-Sent Events for MCP communication
- ✅ **CORS Support**: Enable cross-origin requests from platform
- ✅ **Health Checks**: Endpoint for monitoring
- ✅ **Graceful Shutdown**: Clean shutdown on SIGTERM/SIGINT

### 5. Deployment
- ✅ **Docker Support**: Containerized deployment
- ✅ **Cloud Run Ready**: Deploy to Google Cloud Run
- ✅ **Environment Configuration**: All config via environment variables
- ✅ **Secret Management**: Secure handling of service account keys

## Technical Constraints

### Google Workspace Requirements
- Must use **service account with domain-wide delegation**
- Users must have Google Workspace accounts (not personal Gmail)
- Service account must be authorized for Calendar and Gmail scopes
- All users must be in the same Google Workspace domain

### Platform Requirements
- Platform must provide JWT with `userId` claim
- Platform must implement `/api/credentials/google` endpoint
- Platform must store user's Google Workspace email addresses
- Platform must use shared secret for JWT signing

### Dependencies
- `@prmichaelsen/mcp-auth` ^7.0.0 - Authentication framework
- `@prmichaelsen/google-calendar-mcp` ^2.0.0 - Base MCP server
- `@modelcontextprotocol/sdk` ^1.0.4 - MCP SDK
- `jsonwebtoken` ^9.0.2 - JWT validation

## Success Criteria

### Functional
- [ ] User can authenticate with Platform JWT
- [ ] Server resolves user's Google Workspace email
- [ ] Server creates per-user Calendar/Gmail instances
- [ ] All Calendar operations work (list, create, update, delete events)
- [ ] All Gmail operations work (list, send, search emails)
- [ ] Rate limiting prevents abuse
- [ ] Errors are handled gracefully

### Non-Functional
- [ ] Server starts in < 5 seconds
- [ ] Authentication latency < 100ms (cached)
- [ ] Email resolution latency < 500ms (cached)
- [ ] Supports 100+ concurrent users
- [ ] 99.9% uptime on Cloud Run
- [ ] All operations logged for audit

### Security
- [ ] JWT validation prevents unauthorized access
- [ ] Service account key never exposed
- [ ] Users can only access their own data
- [ ] All API calls authenticated
- [ ] Rate limiting prevents DoS

## Out of Scope

### Phase 1 (Current)
- ❌ OAuth-based authentication (using service account instead)
- ❌ Personal Gmail accounts (Workspace only)
- ❌ Multiple Google Workspace domains
- ❌ Token refresh logic (emails don't expire)
- ❌ User management UI
- ❌ Analytics dashboard

### Future Phases
- 📋 Support for multiple service accounts
- 📋 Advanced rate limiting strategies
- 📋 Metrics and monitoring dashboard
- 📋 Webhook support for Calendar events
- 📋 Batch operations

## Reference Architecture

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

## Key Design Decisions

### Why Service Account Instead of OAuth?
- **Centralized Management**: One service account for all users
- **No Token Refresh**: Email addresses don't expire
- **Domain Control**: IT admins control access via domain-wide delegation
- **Simpler Flow**: No OAuth redirect flow needed

### Why Platform API for Email Resolution?
- **Single Source of Truth**: Platform manages user data
- **Flexibility**: Platform can change email without server changes
- **Security**: Server doesn't need database access
- **Audit**: Platform logs all credential access

### Why Per-User Server Instances?
- **Isolation**: Users can't access each other's data
- **Simplicity**: Each instance is independent
- **Scalability**: Instances created on-demand
- **Resource Management**: Instances cleaned up when idle

## Environment Variables

```env
# Required
PLATFORM_SERVICE_TOKEN=<shared-secret>
PLATFORM_URL=<platform-url>
GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account-key>

# Optional
GOOGLE_CALENDAR_ID=primary
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://agentbase.me
```

## Testing Strategy

### Unit Tests
- JWT validation logic
- Email resolution logic
- Server factory logic
- Error handling

### Integration Tests
- End-to-end authentication flow
- Calendar operations with real API
- Gmail operations with real API
- Rate limiting behavior

### Manual Tests
- Deploy to Cloud Run
- Test with real platform JWT
- Verify multi-user isolation
- Check logs and monitoring

---

**Status**: Initial requirements defined  
**Next Steps**: Create milestones and break into tasks
