import type { AuthProvider, AuthResult, RequestContext } from '@prmichaelsen/mcp-auth';

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
