import type { AuthProvider, AuthResult, RequestContext } from '@prmichaelsen/mcp-auth';
import jwt from 'jsonwebtoken';
import type { PlatformJWTProviderConfig, CachedAuthResult } from '../types/auth.js';

/**
 * Platform JWT Provider
 * 
 * Validates JWTs issued by the platform and extracts user identity.
 * Implements caching to reduce validation overhead.
 */
export class PlatformJWTProvider implements AuthProvider {
  private config: Required<PlatformJWTProviderConfig>;
  private authCache = new Map<string, CachedAuthResult>();
  public jwtTokenCache = new Map<string, string>();
  
  constructor(config: PlatformJWTProviderConfig) {
    this.config = {
      issuer: 'agentbase.me',
      audience: 'mcp-server',
      cacheResults: true,
      cacheTtl: 60000, // 1 minute
      ...config
    };
  }
  
  async initialize(): Promise<void> {
    console.log('[PlatformJWTProvider] Initialized');
  }
  
  async authenticate(context: RequestContext): Promise<AuthResult> {
    try {
      const authHeader = context.headers?.['authorization'];
      
      if (!authHeader || Array.isArray(authHeader)) {
        return {
          authenticated: false,
          error: 'No authorization header provided'
        };
      }
      
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return {
          authenticated: false,
          error: 'Invalid authorization header format'
        };
      }
      
      const token = parts[1];
      
      // Check cache
      if (this.config.cacheResults) {
        const cached = this.authCache.get(token);
        if (cached && Date.now() < cached.expiresAt) {
          return cached.result;
        }
      }
      
      // Verify JWT
      const decoded = jwt.verify(token, this.config.serviceToken, {
        issuer: this.config.issuer,
        audience: this.config.audience
      }) as jwt.JwtPayload & { userId: string };
      
      if (!decoded.userId) {
        return {
          authenticated: false,
          error: 'Invalid token: missing userId claim'
        };
      }
      
      const result: AuthResult = {
        authenticated: true,
        userId: decoded.userId,
        metadata: {
          issuer: decoded.iss,
          audience: decoded.aud,
          issuedAt: decoded.iat,
          expiresAt: decoded.exp
        }
      };
      
      // Cache result and JWT token
      if (this.config.cacheResults) {
        this.authCache.set(token, {
          result,
          expiresAt: Date.now() + this.config.cacheTtl,
          jwtToken: token
        });
      }
      
      this.jwtTokenCache.set(decoded.userId, token);
      return result;
      
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { authenticated: false, error: 'Token expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { authenticated: false, error: `Invalid token: ${error.message}` };
      }
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }
  
  async cleanup(): Promise<void> {
    this.authCache.clear();
    this.jwtTokenCache.clear();
  }
  
  /**
   * Get the JWT token for a given user ID
   * Used by credentials resolver to call platform API
   */
  getJWTToken(userId: string): string | undefined {
    return this.jwtTokenCache.get(userId);
  }
}
