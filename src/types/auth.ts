import type { AuthProvider, AuthResult, RequestContext } from '@prmichaelsen/mcp-auth';
import type { PlatformJWTProvider } from '../auth/platform-jwt-provider.js';

export interface PlatformJWTProviderConfig {
  serviceToken: string;      // Shared secret for JWT validation
  issuer?: string;           // Expected issuer (default: 'agentbase.me')
  audience?: string;         // Expected audience (default: 'mcp-server')
  cacheResults?: boolean;    // Cache auth results (default: true)
  cacheTtl?: number;         // Cache TTL in ms (default: 60000)
}

export interface CachedAuthResult {
  result: AuthResult;
  expiresAt: number;
  jwtToken: string;
}

export interface GoogleCredentialsResolverConfig {
  platformUrl: string;
  authProvider: PlatformJWTProvider;
  cacheCredentials?: boolean;
  cacheTtl?: number;
}

export interface CachedCredentials {
  email: string;
  expiresAt: number;
}

export interface CredentialsAPIResponse {
  access_token: string;  // Contains email address
  expires_at?: number;   // Optional (not used for emails)
}
