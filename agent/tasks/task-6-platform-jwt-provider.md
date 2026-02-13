# Task 6: Implement Platform JWT Provider

**Milestone**: Milestone 2 - Authentication Implementation  
**Estimated Time**: 2 hours  
**Dependencies**: Milestone 1  
**Status**: Not Started  

---

## Objective

Implement the Platform JWT Provider that validates JWTs issued by the platform and extracts user identity.

## Steps

1. **Create type definitions**
   - Create `src/types/auth.ts`
   - Define interfaces for JWT payload
   - Define configuration types
   - Define cache types

2. **Implement PlatformJWTProvider class**
   - Create `src/auth/platform-jwt-provider.ts`
   - Implement AuthProvider interface from mcp-auth
   - Add JWT validation logic
   - Add token caching
   - Add error handling

3. **Implement JWT validation**
   - Verify JWT signature
   - Check issuer and audience
   - Check expiration
   - Extract userId claim

4. **Implement caching**
   - Cache successful validations
   - Set TTL for cache entries
   - Clean up expired entries
   - Track JWT tokens by userId

5. **Add error handling**
   - Handle expired tokens
   - Handle invalid signatures
   - Handle missing claims
   - Return clear error messages

6. **Test implementation**
   - Compile TypeScript
   - Verify types are correct
   - Check error handling

## Verification

- [ ] `src/types/auth.ts` exists with type definitions
- [ ] `src/auth/platform-jwt-provider.ts` exists
- [ ] Implements AuthProvider interface
- [ ] JWT validation works correctly
- [ ] Issuer and audience checked
- [ ] Expiration checked
- [ ] userId extracted from claims
- [ ] Caching implemented
- [ ] Error handling complete
- [ ] TypeScript compiles without errors
- [ ] All types properly defined
- [ ] Code follows patterns from bootstrap.md

## Implementation Reference

See [`agent/patterns/bootstrap.md`](../patterns/bootstrap.md) lines 88-217 for complete implementation.

Key features:
- JWT validation with jsonwebtoken library
- Configurable issuer and audience
- Token caching with TTL
- userId extraction
- Error handling for all failure cases

## Code Structure

```typescript
// src/types/auth.ts
export interface PlatformJWTProviderConfig {
  serviceToken: string;
  issuer?: string;
  audience?: string;
  cacheResults?: boolean;
  cacheTtl?: number;
}

export interface CachedAuthResult {
  result: AuthResult;
  expiresAt: number;
  jwtToken: string;
}

// src/auth/platform-jwt-provider.ts
export class PlatformJWTProvider implements AuthProvider {
  private config: Required<PlatformJWTProviderConfig>;
  private authCache = new Map<string, CachedAuthResult>();
  public jwtTokenCache = new Map<string, string>();
  
  constructor(config: PlatformJWTProviderConfig) { }
  async initialize(): Promise<void> { }
  async authenticate(context: RequestContext): Promise<AuthResult> { }
  async cleanup(): Promise<void> { }
  getJWTToken(userId: string): string | undefined { }
}
```

## Notes

- Use jsonwebtoken library for validation
- Cache results to reduce validation overhead
- Store JWT token for later use by credentials resolver
- Never log JWT tokens (sensitive data)
- Return clear error messages for debugging
- Follow strict TypeScript typing

---

**Next Task**: Task 7 - Implement Google Credentials Resolver
