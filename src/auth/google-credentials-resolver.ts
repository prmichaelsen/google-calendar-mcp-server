import type { ResourceTokenResolver } from '@prmichaelsen/mcp-auth';
import type { 
  GoogleCredentialsResolverConfig, 
  CachedCredentials, 
  CredentialsAPIResponse 
} from '../types/auth.js';

/**
 * Google Credentials Resolver
 * 
 * Resolves Google Workspace user email addresses from platform API.
 * Unlike OAuth tokens, we just need the user's email for service account impersonation.
 * 
 * The platform API returns the user's Google Workspace email address,
 * which the service account uses to impersonate the user via domain-wide delegation.
 */
export class GoogleCredentialsResolver implements ResourceTokenResolver {
  private config: GoogleCredentialsResolverConfig;
  private credentialsCache = new Map<string, CachedCredentials>();
  
  constructor(config: GoogleCredentialsResolverConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    console.log('[GoogleCredentialsResolver] Initialized');
  }
  
  async resolveToken(userId: string, resourceType: string): Promise<string | null> {
    try {
      const cacheKey = `${userId}:${resourceType}`;
      
      // Check cache
      if (this.config.cacheCredentials !== false) {
        const cached = this.credentialsCache.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
          return cached.email;
        }
      }
      
      // Get JWT token from auth provider
      const jwtToken = this.config.authProvider.getJWTToken(userId);
      if (!jwtToken) {
        console.warn(`[GoogleCredentialsResolver] No JWT token for user ${userId}`);
        return null;
      }
      
      // Call platform API to get user's Google Workspace email
      const url = `${this.config.platformUrl}/api/credentials/${resourceType}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'X-User-ID': userId,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`[GoogleCredentialsResolver] No Google credentials for user ${userId}`);
          return null;
        }
        throw new Error(`Platform API error: ${response.status}`);
      }
      
      const data = await response.json() as CredentialsAPIResponse;
      
      // For Google, the "access_token" field contains the user's email address
      const email = data.access_token;
      
      if (!email || !email.includes('@')) {
        console.warn('[GoogleCredentialsResolver] Invalid email address from platform');
        return null;
      }
      
      // Cache email
      if (this.config.cacheCredentials !== false) {
        const ttl = this.config.cacheTtl || 300000; // 5 minutes
        this.credentialsCache.set(cacheKey, {
          email,
          expiresAt: Date.now() + ttl
        });
      }
      
      console.log(`[GoogleCredentialsResolver] Resolved email for user ${userId}`);
      return email;
      
    } catch (error) {
      console.error('[GoogleCredentialsResolver] Failed to resolve credentials:', error);
      return null;
    }
  }
  
  async cleanup(): Promise<void> {
    this.credentialsCache.clear();
  }
}
