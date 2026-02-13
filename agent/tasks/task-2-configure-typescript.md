# Task 2: Configure TypeScript and Build System

**Milestone**: Milestone 1 - Project Setup  
**Estimated Time**: 30 minutes  
**Dependencies**: Task 1  
**Status**: Not Started  

---

## Objective

Configure TypeScript compiler settings and verify the build system works correctly for the Google Calendar MCP server wrapper.

## Steps

1. **Create tsconfig.json**
   - Target ES2022 for modern JavaScript features
   - Use Node16 module resolution for ESM
   - Enable strict mode for type safety
   - Configure output directory to `dist/`
   - Enable source maps for debugging
   - Generate declaration files

2. **Verify TypeScript configuration**
   - Check that tsconfig.json is valid
   - Ensure module resolution works
   - Verify strict mode is enabled

3. **Create stub index.ts**
   - Create minimal `src/index.ts` file
   - Add shebang for CLI execution
   - Add basic console.log for testing

4. **Test build system**
   - Run `npm run build` to compile TypeScript
   - Verify `dist/` directory is created
   - Check that compiled JavaScript is valid
   - Verify source maps are generated

5. **Test dev mode**
   - Run `npm run dev` briefly to verify tsx watch works
   - Confirm hot reload functionality

## Verification

- [ ] `tsconfig.json` exists with correct configuration
- [ ] TypeScript target is ES2022
- [ ] Module resolution is Node16
- [ ] Strict mode is enabled
- [ ] Output directory is `dist/`
- [ ] Source maps are enabled
- [ ] `src/index.ts` exists with stub code
- [ ] `npm run build` completes without errors
- [ ] `dist/index.js` is created
- [ ] `dist/index.d.ts` is created (declaration file)
- [ ] `dist/index.js.map` is created (source map)
- [ ] `npm run dev` starts without errors
- [ ] TypeScript compilation is fast (<5 seconds)

## Expected Output

```
google-calendar-mcp-server/
├── src/
│   ├── index.ts              # Stub entry point
│   └── auth/
├── dist/                      # Created by build
│   ├── index.js
│   ├── index.d.ts
│   └── index.js.map
├── tsconfig.json              # TypeScript configuration
├── package.json
└── node_modules/
```

## tsconfig.json Template

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## src/index.ts Stub

```typescript
#!/usr/bin/env node

console.log('Google Calendar MCP Server - Starting...');

// TODO: Implement server in next tasks
```

## Notes

- Use Node16 module resolution for proper ESM support
- Strict mode catches type errors early
- Source maps enable debugging of TypeScript in production
- Declaration files enable TypeScript consumers to use this package
- tsx watch provides fast development iteration

---

**Next Task**: Task 3 - Create Environment Configuration Files
