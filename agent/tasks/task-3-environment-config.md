# Task 3: Create Environment Configuration Files

**Milestone**: Milestone 1 - Project Setup  
**Estimated Time**: 30 minutes  
**Dependencies**: Task 1, Task 2  
**Status**: Not Started  

---

## Objective

Create environment configuration template (`.env.example`) with all required variables for Platform JWT authentication and Google service account setup.

## Steps

1. **Create .env.example**
   - Document all required environment variables
   - Add descriptions for each variable
   - Include example values (non-sensitive)
   - Group variables by category

2. **Document Platform JWT variables**
   - `PLATFORM_SERVICE_TOKEN` - Shared secret for JWT validation
   - `PLATFORM_URL` - Platform API URL for credential resolution
   - `CORS_ORIGIN` - Allowed CORS origin (optional)

3. **Document Google service account variables**
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key
   - `GOOGLE_CALENDAR_ID` - Calendar ID (default: primary)

4. **Document server variables**
   - `PORT` - Server port (default: 8080)
   - `NODE_ENV` - Environment (development/production)
   - `LOG_LEVEL` - Logging level (info/debug/error)

5. **Add usage instructions**
   - How to copy and configure
   - Where to get credentials
   - Security warnings

## Verification

- [ ] `.env.example` exists
- [ ] All required variables documented
- [ ] Each variable has description
- [ ] Example values provided (non-sensitive)
- [ ] Variables grouped logically
- [ ] Usage instructions included
- [ ] Security warnings present
- [ ] File is well-formatted and readable

## Expected Output

```
google-calendar-mcp-server/
├── .env.example              # Environment variables template
├── src/
├── package.json
├── tsconfig.json
└── .gitignore
```

## .env.example Template

```env
# ============================================
# Platform JWT Authentication
# ============================================

# Shared secret for validating Platform JWTs
# This must match the secret used by the platform to sign JWTs
# SECURITY: Keep this secret! Never commit to version control.
PLATFORM_SERVICE_TOKEN=your-shared-secret-here

# Platform API URL for resolving user credentials
# The server calls this API to get user's Google Workspace email
PLATFORM_URL=https://your-platform.com

# ============================================
# Google Service Account
# ============================================

# Path to Google service account key JSON file
# This service account must have domain-wide delegation enabled
# SECURITY: Never commit this file to version control!
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Google Calendar ID to access (default: primary)
# Use 'primary' for user's primary calendar
GOOGLE_CALENDAR_ID=primary

# ============================================
# Server Configuration
# ============================================

# Server port (default: 8080)
PORT=8080

# Node environment (development/production)
NODE_ENV=development

# Logging level (debug/info/warn/error)
LOG_LEVEL=info

# ============================================
# CORS Configuration (Optional)
# ============================================

# Allowed CORS origin (default: https://agentbase.me)
# Set to your platform's URL
CORS_ORIGIN=https://agentbase.me

# ============================================
# Setup Instructions
# ============================================
#
# 1. Copy this file to .env:
#    cp .env.example .env
#
# 2. Fill in your actual values (never commit .env!)
#
# 3. Get Platform JWT secret from your platform admin
#
# 4. Create Google service account:
#    - Go to Google Cloud Console
#    - Create service account
#    - Enable domain-wide delegation
#    - Download key JSON file
#    - Add scopes: calendar, gmail
#
# 5. Configure platform to store user Google Workspace emails
#
# 6. Test locally:
#    npm run dev
#
# SECURITY WARNINGS:
# - Never commit .env to version control
# - Never share service account keys
# - Rotate secrets regularly
# - Use separate keys per environment
```

## Notes

- `.env` files are already in `.gitignore`
- Only `.env.example` should be committed
- Service account key must have domain-wide delegation
- Platform must implement `/api/credentials/google` endpoint
- All users must have Google Workspace accounts (not personal Gmail)

---

**Next Task**: Task 4 - Create Docker and Cloud Build Configurations
