# Task 1: Initialize Node.js Project and Install Dependencies

**Milestone**: Milestone 1 - Project Setup  
**Estimated Time**: 30 minutes  
**Dependencies**: None  
**Status**: Not Started  

---

## Objective

Initialize a new Node.js project with TypeScript and install all required dependencies for the Google Calendar MCP server wrapper.

## Steps

1. **Create project structure**
   ```bash
   mkdir -p src/auth
   ```

2. **Initialize package.json**
   - Create package.json with project metadata
   - Set "type": "module" for ES modules
   - Add main entry point: "dist/index.js"
   - Configure scripts: build, dev, start

3. **Install production dependencies**
   ```bash
   npm install @modelcontextprotocol/sdk@^1.0.4
   npm install @prmichaelsen/google-calendar-mcp@^2.0.0
   npm install @prmichaelsen/mcp-auth@^7.0.0
   npm install jsonwebtoken@^9.0.2
   ```

4. **Install development dependencies**
   ```bash
   npm install -D @types/jsonwebtoken@^9.0.5
   npm install -D @types/node@^22.10.2
   npm install -D tsx@^4.7.0
   npm install -D typescript@^5.7.2
   ```

5. **Create .gitignore**
   - Ignore node_modules/
   - Ignore dist/
   - Ignore .env files
   - Ignore IDE files

## Verification

- [ ] `src/` and `src/auth/` directories exist
- [ ] `package.json` exists with correct metadata
- [ ] `package.json` has "type": "module"
- [ ] All production dependencies installed
- [ ] All development dependencies installed
- [ ] `node_modules/` directory exists
- [ ] `package-lock.json` created
- [ ] `.gitignore` exists with proper rules
- [ ] `npm list` shows no dependency errors

## Expected Output

```
google-calendar-mcp-server/
├── src/
│   └── auth/
├── node_modules/
├── package.json
├── package-lock.json
└── .gitignore
```

## Notes

- Use exact versions from bootstrap pattern
- Ensure Node 18+ compatibility
- Don't install unnecessary dependencies
- Keep package.json clean and organized

---

**Next Task**: Task 2 - Configure TypeScript and Build System
