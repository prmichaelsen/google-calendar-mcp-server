# Task 7: Implement Google Credentials Resolver

**Milestone**: Milestone 2 - Authentication Implementation  
**Estimated Time**: 2 hours  
**Dependencies**: Task 6  
**Status**: Not Started  

---

## Objective

Implement the Google Credentials Resolver that resolves user's Google Workspace email addresses from the platform API.

## Steps

1. **Update type definitions**
   - Add `GoogleCredentialsResolverConfig` interface
   - Add `CachedCredentials` interface
   - Add `CredentialsAPIResponse` interface

2. **Implement GoogleCredentialsResolver class**
   - Create `src/auth/google-credentials-resolver.ts`
   - Implement ResourceTokenResolver interface from mcp-auth
   - Add platform API integration
   - Add credentials caching
   - Add error handling

3. **Implement email resolution**
   - Get JWT token from PlatformJWTProvider
   - Call platform API with JWT
   - Parse response to get email
   - Validate email format

4. **Implement caching**
   - Cache resolved emails
   - Set TTL for cache entries (5 minutes default)
   - Clean up expired entries

5. **Add error handling**
   - Handle missing JWT token
   - Handle API errors (404, 500, etc.)
   - Handle invalid email format
   - Return null for failures (graceful degradation)

6. **Test implementation**
   - Compile TypeScript
   - Verify types are correct
   - Check error handling

## Verification

- [ ] Type definitions updated in `src/types/auth.ts`
- [ ] `src/auth/google-credentials-resolver.ts` exists
- [ ] Implements ResourceTokenResolver interface
- [ ] Platform API integration works
- [ ] JWT token retrieved from auth provider
- [ ] Email validation implemented
- [ ] Caching implemented with TTL
- [ ] Error handling complete
- [ ] TypeScript compiles without errors
- [ ] All types properly defined
- [ ] Code follows patterns from bootstrap.md

## Implementation Reference

See [`agent/patterns/bootstrap.md`](../patterns/bootstrap.md) lines 219-329 for complete implementation.

Key features:
- Platform API integration with fetch
- JWT token from PlatformJWTProvider
- Email validation
- Credentials caching with TTL
- Graceful error handling (returns null)

## Code Structure

```typescript
// src/types/auth.ts (additions)
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

// src/auth/google-credentials-resolver.ts
export class GoogleCredentialsResolver implements ResourceTokenResolver {
  private config: GoogleCredentialsResolverConfig;
  private credentialsCache = new Map<string, CachedCredentials>();
  
  constructor(config: GoogleCredentialsResolverConfig) { }
  async initialize(): Promise<void> { }
  async resolveToken(userId: string, resourceType: string): Promise<string | null> { }
  async cleanup(): Promise<void> { }
}
```

## Notes

- Use fetch API for platform calls
- Email is stored in `access_token` field (mcp-auth convention)
- Cache TTL should be longer than JWT cache (5 minutes default)
- Return null on errors (don't throw)
- Log warnings for missing credentials
- Never log email addresses (PII)

---

**Next Task**: Task 8 - Add Authentication Tests
