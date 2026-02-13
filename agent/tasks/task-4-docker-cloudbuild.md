# Task 4: Create Docker and Cloud Build Configurations

**Milestone**: Milestone 1 - Project Setup  
**Estimated Time**: 1 hour  
**Dependencies**: Task 1, Task 2, Task 3  
**Status**: Not Started  

---

## Objective

Create Docker configuration for containerization and Cloud Build configuration for automated deployment to Google Cloud Run.

## Steps

1. **Create Dockerfile**
   - Use Node 18 Alpine for small image size
   - Multi-stage build (build + runtime)
   - Copy only production dependencies
   - Set proper working directory
   - Expose port 8080
   - Run as non-root user

2. **Create .dockerignore**
   - Exclude node_modules
   - Exclude development files
   - Exclude .env files
   - Exclude git files

3. **Create cloudbuild.yaml**
   - Build TypeScript
   - Build Docker image
   - Push to Container Registry
   - Deploy to Cloud Run
   - Configure environment variables
   - Configure secrets

4. **Test Docker build locally**
   - Build image
   - Verify image size
   - Test container runs

## Verification

- [ ] `Dockerfile` exists with multi-stage build
- [ ] Uses Node 18 Alpine base image
- [ ] `.dockerignore` exists with proper exclusions
- [ ] `cloudbuild.yaml` exists with complete pipeline
- [ ] Docker image builds successfully
- [ ] Image size is reasonable (<200MB)
- [ ] Container starts without errors
- [ ] All files properly structured

## Expected Output

```
google-calendar-mcp-server/
├── Dockerfile                # Docker configuration
├── .dockerignore             # Docker ignore rules
├── cloudbuild.yaml           # GCP build pipeline
├── .env.example
├── src/
├── package.json
└── tsconfig.json
```

## Dockerfile Template

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Run as non-root user
USER node

# Start server
CMD ["node", "dist/index.js"]
```

## .dockerignore Template

```
# Dependencies
node_modules
npm-debug.log

# Build output
dist

# Environment files
.env
.env.*
!.env.example

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Documentation
*.md
!README.md

# Agent files
agent/

# Tests
*.test.ts
*.spec.ts
coverage/

# Misc
.DS_Store
Thumbs.db
```

## cloudbuild.yaml Template

```yaml
steps:
  # Install dependencies
  - name: 'node:18'
    entrypoint: npm
    args: ['ci']
  
  # Build TypeScript
  - name: 'node:18'
    entrypoint: npm
    args: ['run', 'build']
  
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:latest'
      - '.'
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:$COMMIT_SHA'
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'google-calendar-mcp-server'
      - '--image'
      - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production,PORT=8080,LOG_LEVEL=info'
      - '--update-secrets'
      - 'PLATFORM_SERVICE_TOKEN=platform-service-token:latest,GOOGLE_APPLICATION_CREDENTIALS=google-service-account-key:latest'

images:
  - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/google-calendar-mcp-server:latest'

options:
  machineType: 'N1_HIGHCPU_8'
```

## Notes

- Multi-stage build reduces final image size
- Alpine Linux provides minimal base image
- Production dependencies only in runtime stage
- Secrets managed via Google Cloud Secret Manager
- Cloud Run auto-scales based on demand
- Build uses high-CPU machine for faster compilation

---

**Next Task**: Task 5 - Create Project Documentation (README)
