# Security Documentation

## SQL Injection Protection

### Prisma ORM Built-in Protection

The consciousness MCP server uses **Prisma ORM**, which provides **robust protection against SQL injection** by design:

#### ✅ **Automatic Protection Mechanisms:**

1. **Prepared Statements**: All Prisma queries use prepared statements under the hood
2. **Type-Safe Query Builder**: No raw SQL concatenation possible
3. **Parameter Escaping**: All user inputs are automatically escaped
4. **Schema Validation**: TypeScript types prevent malformed queries

#### ✅ **Safe Query Examples:**

```typescript
// ✅ SAFE - Prisma handles escaping automatically
const memory = await prisma.memory.findUnique({
  where: { key: userInput }  // Prisma sanitizes this
});

// ✅ SAFE - Parameters passed as objects
const memories = await prisma.memory.findMany({
  where: {
    OR: [
      { content: { contains: searchQuery } },  // Prisma escapes
      { key: { contains: searchQuery } }
    ]
  }
});
```

#### 🚫 **What We Avoid:**

```typescript
// ❌ NEVER USED - Raw SQL concatenation
const query = `SELECT * FROM memories WHERE key = '${userInput}'`; // VULNERABLE

// ❌ NEVER USED - Unescaped raw queries  
await prisma.$executeRaw`SELECT * FROM memories WHERE key = ${userInput}`; // VULNERABLE
```

### Additional Input Validation

Beyond Prisma's protection, we implement **defense-in-depth** with input validation:

#### **InputValidator Class:**

```typescript
class InputValidator {
  // Validates memory keys (alphanumeric, dashes, underscores only)
  static validateKey(key: string): string
  
  // Sanitizes search queries (removes SQL keywords, special chars)
  static sanitizeSearchQuery(query: string): string
  
  // Validates importance levels against enum
  static validateImportanceLevel(importance: string): ImportanceLevel
  
  // Sanitizes and validates entity names
  static validateEntityName(name: string): string
  
  // General string sanitization with length limits
  static sanitizeString(input: string, maxLength: number): string
}
```

#### **Protection Features:**

- **Length Limits**: Prevent DoS attacks with oversized inputs
- **Character Filtering**: Remove potentially dangerous characters
- **SQL Keyword Removal**: Strip SQL keywords as defense-in-depth
- **XSS Prevention**: Remove script tags and javascript: URLs
- **Type Validation**: Ensure inputs match expected data types

## Database Security Best Practices

### ✅ **Current Implementation:**

1. **No Raw SQL**: All queries use Prisma's type-safe query builder
2. **Input Validation**: Multi-layer validation before database operations
3. **Type Safety**: TypeScript prevents type-related vulnerabilities
4. **Enum Constraints**: Importance levels constrained to valid values
5. **Length Limits**: All inputs have reasonable size constraints

### ✅ **Prisma Security Features in Use:**

- **Prepared Statements**: Automatic SQL injection prevention
- **Connection Pooling**: Prevents connection exhaustion attacks
- **Query Optimization**: Prevents inefficient queries
- **Schema Validation**: Runtime type checking

### 🛡️ **If Raw SQL is Ever Needed:**

```typescript
// ✅ SAFE - Parameterized raw query (if absolutely necessary)
const result = await prisma.$queryRaw`
  SELECT * FROM memories 
  WHERE key = ${sanitizedKey} 
  AND importance = ${validImportance}
`;

// ❌ DANGEROUS - String concatenation
const result = await prisma.$queryRaw`
  SELECT * FROM memories 
  WHERE key = '${userInput}'  // NEVER DO THIS
`;
```

## Container Security

### Docker Security Measures:

- **Non-root User**: Container runs as `mcpserver` user (UID 1001)
- **Read-only Filesystem**: Minimal write permissions
- **Volume Isolation**: Database isolated to specific volume mount
- **Network Isolation**: No unnecessary port exposure

## Environment Security

### Configuration Security:

- **Environment Variables**: Sensitive config in `.env` (gitignored)
- **Database URL**: Configurable connection string
- **Debug Logging**: Controllable via `DB_DEBUG` flag
- **Production Defaults**: Secure defaults for production deployment

## Dependency Security

### Automated Security Scanning:

- **Dependabot**: Automated dependency updates
- **GitHub Actions**: Security vulnerability scanning
- **Audit Commands**: `npm audit` in CI/CD pipeline

### Key Dependencies:

- **Prisma**: Actively maintained, security-focused ORM
- **TypeScript**: Compile-time type safety
- **Node.js LTS**: Long-term support with security patches

## Monitoring and Logging

### Security Logging:

```typescript
// Database operations logged (if DB_DEBUG=true)
const prisma = new PrismaClient({
  log: process.env.DB_DEBUG === 'true' ? ['query', 'info', 'warn', 'error'] : []
});
```

### Error Handling:

- **Input Validation Errors**: Clear error messages without data exposure
- **Database Errors**: Sanitized error responses
- **Graceful Degradation**: Safe fallbacks for edge cases

## Security Checklist

- ✅ SQL Injection: Protected by Prisma ORM + input validation
- ✅ XSS Prevention: Content sanitization for stored data
- ✅ DoS Protection: Input length limits and query optimization
- ✅ Type Safety: TypeScript compile-time validation
- ✅ Access Control: Non-root container execution
- ✅ Data Validation: Multi-layer input sanitization
- ✅ Dependency Security: Automated scanning and updates
- ✅ Configuration Security: Environment-based secrets management

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email the maintainers directly (see `package.json` for contact)
3. Include detailed reproduction steps
4. Allow time for patching before public disclosure

---

**Remember**: Security is a layered approach. Prisma provides excellent baseline protection, but defense-in-depth with input validation creates a more robust security posture. 