# 📊 Logging System Documentation

## Overview

This project uses **Pino** - a high-performance, production-ready logging library for Node.js. The logging system is designed for structured logging, security, and observability in production environments.

## Features

- 🚀 **High Performance** - Pino is one of the fastest Node.js loggers
- 📝 **Structured Logging** - JSON format for easy parsing and analysis
- 🔒 **Security** - Automatic redaction of sensitive data
- 🎨 **Pretty Printing** - Colorized output in development
- 📊 **Request Tracking** - Automatic API request/response logging
- 🔍 **Context Preservation** - Child loggers for component isolation
- ⚡ **Performance Monitoring** - Built-in timing utilities
- 🛡️ **Audit Logging** - Security event tracking

## Architecture

### File Structure

```
src/shared/lib/
├── logger.ts       # Core logging configuration and utilities
├── api-logger.ts   # API middleware for request/response logging
└── index.ts        # Public exports
```

## Core Logger Configuration

### Environment-Based Configuration

The logger automatically adjusts its behavior based on the environment:

```typescript
// Development: Pretty-printed, colorized output
LOG_LEVEL=debug npm run dev

// Production: Structured JSON output
LOG_LEVEL=info npm run start

// Test: Silent mode
NODE_ENV=test npm test
```

### Log Levels

| Level   | Value | Use Case                                |
| ------- | ----- | --------------------------------------- |
| `fatal` | 60    | Application crash, unrecoverable errors |
| `error` | 50    | Errors that need immediate attention    |
| `warn`  | 40    | Warning conditions, potential issues    |
| `info`  | 30    | General informational messages          |
| `debug` | 20    | Debug information for development       |
| `trace` | 10    | Very detailed debugging information     |

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=debug          # Override default log level
LOG_PRETTY=true          # Force pretty printing in production
```

## Usage Examples

### Basic Logging

```typescript
import { logger } from '@/shared/lib/logger';

// Simple logging
logger.info('Application started');
logger.error('Database connection failed');
logger.debug({ userId: 123 }, 'User logged in');

// Structured logging with context
logger.info({
  operation: 'user.create',
  userId: 123,
  email: 'user@example.com',
  duration: 145,
  msg: 'User created successfully',
});
```

### Component-Specific Loggers

```typescript
import { createAppLogger, dbLogger, authLogger } from '@/shared/lib/logger';

// Pre-configured loggers
dbLogger.info('Database connected');
authLogger.warn('Invalid login attempt');

// Create custom component logger
const paymentLogger = createAppLogger('payment');
paymentLogger.info({
  orderId: 'order-123',
  amount: 99.99,
  currency: 'USD',
  msg: 'Payment processed',
});
```

### Error Logging

```typescript
import { logError } from '@/shared/lib/logger';

try {
  // Some operation
} catch (error) {
  logError(error, {
    operation: 'database.query',
    query: 'SELECT * FROM users',
    userId: 123,
  });
}
```

### Performance Logging

```typescript
import { createPerformanceLogger } from '@/shared/lib/logger';

// Start performance tracking
const perfLogger = createPerformanceLogger('api.users.list');

// Do some work...
const users = await fetchUsers();

// End tracking and log duration
perfLogger.end({
  userCount: users.length,
  cacheHit: false,
});
// Logs: { operation: 'api.users.list', duration: 234, userCount: 50, ... }
```

### Audit Logging

```typescript
import { logAuditEvent } from '@/shared/lib/logger';

// Log security-relevant events
logAuditEvent('user.login', userId, {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
});

logAuditEvent('admin.permission.grant', adminId, {
  targetUserId,
  permission: 'write',
  resource: 'users',
});
```

## API Logging Middleware

### Automatic Request/Response Logging

```typescript
import { withLogging } from '@/shared/lib/api-logger';

const handler = async (req, res) => {
  // Your API logic
  res.json({ message: 'Success' });
};

// Wrap with logging middleware
export default withLogging(handler);
```

**Automatically logs:**

- Request method, URL, headers
- Request body (for non-GET requests)
- Response status code
- Response time
- Errors with stack traces

### Manual API Logging

```typescript
import { logApiSuccess, logApiError } from '@/shared/lib/api-logger';

export default async function handler(req, res) {
  try {
    const result = await processRequest(req);

    // Log successful operation
    logApiSuccess(req, 'order.create', {
      orderId: result.id,
      amount: result.total,
    });

    res.json(result);
  } catch (error) {
    // Log API error
    logApiError(req, error, {
      operation: 'order.create',
      customerId: req.body.customerId,
    });

    res.status(500).json({ error: 'Internal error' });
  }
}
```

## Security Features

### Automatic Redaction

Sensitive data is automatically redacted in production:

```typescript
// Input
logger.info({
  user: 'john@example.com',
  password: 'secret123',
  token: 'jwt-token-here',
  data: 'safe-data'
});

// Output in production
{
  "user": "john@example.com",
  "password": "***REDACTED***",
  "token": "***REDACTED***",
  "data": "safe-data"
}
```

**Redacted fields:**

- `password`
- `token`
- `secret`
- `authorization`
- `cookie`
- Request/response headers containing auth data

### Audit Trail

Security events are logged with timestamps and context:

```typescript
{
  "level": "info",
  "time": "2024-01-15T10:30:45.123Z",
  "type": "audit",
  "event": "user.permission.change",
  "userId": "user-123",
  "adminId": "admin-456",
  "oldRole": "viewer",
  "newRole": "editor",
  "msg": "User permission changed"
}
```

## Integration Examples

### With Authentication

The authentication system automatically logs:

- Sign-in attempts (success/failure)
- Sign-up events
- Sign-out events
- OAuth flows

```typescript
// Automatically logged by auth configuration
// See src/shared/config/auth.ts
```

### With Database Operations

```typescript
import { dbLogger } from '@/shared/lib/logger';
import { db } from '@/shared/config/db/client';

// Log database queries
export async function getUser(id: string) {
  const perfLogger = createPerformanceLogger('db.user.get');

  try {
    const user = await db.select().from(users).where(eq(users.id, id));

    perfLogger.end({ found: !!user });
    return user;
  } catch (error) {
    dbLogger.error({
      operation: 'user.get',
      userId: id,
      error: error.message,
    });
    throw error;
  }
}
```

### With Frontend Errors

```typescript
// pages/api/log-error.ts
import { withLogging, logApiError } from '@/shared/lib/api-logger';

const handler = async (req, res) => {
  const { error, context } = req.body;

  // Log frontend errors to backend
  logApiError(req, new Error(error.message), {
    ...context,
    source: 'frontend',
    userAgent: req.headers['user-agent'],
  });

  res.json({ logged: true });
};

export default withLogging(handler);
```

## Production Deployment

### Log Management

For production, pipe logs to a log management service:

```bash
# Send to file
node app.js | tee -a app.log

# Send to log service (e.g., Datadog, LogDNA, etc.)
node app.js | datadog-logs

# Parse JSON logs with jq
node app.js | jq '.level >= 40'
```

### Monitoring Setup

```typescript
// Monitor error rates
logger.error({ metric: 'api.error.rate', value: 1 });

// Monitor performance
logger.info({
  metric: 'api.response.time',
  value: responseTime,
  endpoint: '/api/users',
});
```

### Docker Configuration

```dockerfile
# Dockerfile
ENV LOG_LEVEL=info
ENV NODE_ENV=production

# Output logs to stdout for container logging
CMD ["node", "server.js"]
```

## Debugging

### Enable Debug Logs

```bash
# Enable all debug logs
LOG_LEVEL=debug npm run dev

# Enable specific component
DEBUG=auth,db npm run dev
```

### Analyzing Logs

```bash
# Filter by level
cat app.log | jq 'select(.level >= 50)'

# Filter by component
cat app.log | jq 'select(.component == "auth")'

# Get request timings
cat app.log | jq 'select(.duration != null) | {url: .url, duration: .duration}'
```

### Common Issues

1. **Missing logs in production**

   - Check LOG_LEVEL environment variable
   - Ensure stdout is not redirected
   - Verify logger initialization

2. **Performance impact**

   - Use appropriate log levels
   - Avoid logging large objects
   - Consider sampling for high-traffic endpoints

3. **Sensitive data in logs**
   - Review redaction paths
   - Add custom redaction rules
   - Audit log output regularly

## Best Practices

### 1. Use Structured Logging

```typescript
// ❌ Bad
logger.info(`User ${userId} logged in`);

// ✅ Good
logger.info({
  event: 'user.login',
  userId,
  timestamp: new Date().toISOString(),
  msg: 'User logged in',
});
```

### 2. Add Meaningful Context

```typescript
// ❌ Bad
logger.error('Failed');

// ✅ Good
logger.error({
  operation: 'payment.process',
  orderId,
  amount,
  error: error.message,
  msg: 'Payment processing failed',
});
```

### 3. Use Appropriate Levels

```typescript
// Guidelines
logger.fatal('Unrecoverable error, app will crash');
logger.error('Error that needs investigation');
logger.warn('Potential issue, but app continues');
logger.info('Important business events');
logger.debug('Detailed debugging information');
logger.trace('Very verbose debugging');
```

### 4. Avoid Over-Logging

```typescript
// ❌ Bad - logs on every request
logger.info('Checking auth header');
logger.info('Parsing JWT token');
logger.info('Validating token signature');

// ✅ Good - log summary
logger.debug({
  operation: 'auth.validate',
  hasToken: !!token,
  isValid,
  duration: endTime - startTime,
});
```

## Testing

### Silence Logs in Tests

```typescript
// vitest.config.ts
export default {
  test: {
    env: {
      NODE_ENV: 'test', // Automatically silences logs
    },
  },
};
```

### Test Log Output

```typescript
import { logger } from '@/shared/lib/logger';
import { vi } from 'vitest';

test('logs user creation', () => {
  const infoSpy = vi.spyOn(logger, 'info');

  createUser({ name: 'Test User' });

  expect(infoSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      operation: 'user.create',
      userName: 'Test User',
    }),
  );
});
```

---

_Last updated: 28.07.2025_  
_Pino Version: 9.7.0_  
_Framework: Next.js 15.4_
