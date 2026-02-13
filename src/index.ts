#!/usr/bin/env node

import { wrapServer } from '@prmichaelsen/mcp-auth';
import { createGoogleCalendarServer } from '@prmichaelsen/google-calendar-mcp/factory';
import { PlatformJWTProvider } from './auth/platform-jwt-provider.js';

// Configuration from environment
const config = {
  platform: {
    url: process.env.PLATFORM_URL!,
    serviceToken: process.env.PLATFORM_SERVICE_TOKEN!
  },
  google: {
    serviceAccountKeyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    // Shared service account email for all users (e.g., support@agentbase.me)
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'support@agentbase.me'
  },
  server: {
    port: parseInt(process.env.PORT || '8080')
  }
};

// Validate configuration
if (!config.platform.serviceToken) {
  console.error('Error: PLATFORM_SERVICE_TOKEN environment variable is required');
  process.exit(1);
}

if (!config.platform.url) {
  console.error('Error: PLATFORM_URL environment variable is required');
  process.exit(1);
}

if (!config.google.serviceAccountKeyPath) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
  process.exit(1);
}

// Create authentication provider
const authProvider = new PlatformJWTProvider({
  serviceToken: config.platform.serviceToken,
  issuer: 'agentbase.me',
  audience: 'mcp-server',
  cacheResults: true,
  cacheTtl: 60000 // 1 minute
});

// Wrap the Google Calendar server factory with authentication
const wrappedServer = wrapServer({
  // Server factory: creates a new Google Calendar server per user
  // All users share the same service account email
  serverFactory: (_token: string, userId: string) => {
    return createGoogleCalendarServer(config.google.serviceAccountEmail, userId, {
      serviceAccountKey: config.google.serviceAccountKeyPath, // Can be path, JSON string, or object
      calendarId: config.google.calendarId
    });
  },
  
  // Authentication
  authProvider,
  tokenResolver: undefined, // No token resolver needed - using shared email
  resourceType: 'google-calendar',
  
  // Transport
  transport: {
    type: 'sse',
    port: config.server.port,
    host: '0.0.0.0',
    basePath: '/mcp',
    cors: true,
    corsOrigin: process.env.CORS_ORIGIN || 'https://agentbase.me'
  },
  
  // Optional middleware
  middleware: {
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60 * 60 * 1000 // 1 hour per user
    },
    logging: {
      enabled: true,
      level: (process.env.LOG_LEVEL as 'info' | 'debug' | 'warn' | 'error') || 'info'
    }
  }
});

// Start server
async function main() {
  try {
    await wrappedServer.start();
    console.log(`Google Calendar MCP Server running on port ${config.server.port}`);
    console.log(`Using shared service account: ${config.google.serviceAccountEmail}`);
    console.log(`Endpoint: http://0.0.0.0:${config.server.port}/mcp`);
    console.log('Ready to accept requests');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await wrappedServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await wrappedServer.stop();
  process.exit(0);
});

// Start the server
main();
