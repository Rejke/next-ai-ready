import pino from 'pino';
import { env } from '@/shared/config/env';

// Log levels configuration
export const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

// Create Pino logger configuration
const createLoggerConfig = () => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isProduction = env.NODE_ENV === 'production';
  const isTest = env.NODE_ENV === 'test';

  // Determine log level based on environment
  const getLogLevel = () => {
    if (env.LOG_LEVEL) {
      return env.LOG_LEVEL;
    }

    if (isDevelopment) {
      return 'debug';
    }

    if (isProduction) {
      return 'info';
    }

    return 'silent';
  };

  const baseConfig: pino.LoggerOptions = {
    name: 'next-ai-ready',
    level: getLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
      log: (object) => {
        // Remove undefined values and clean object
        const cleaned = Object.fromEntries(
          Object.entries(object).filter(([, value]) => value !== undefined),
        );
        return cleaned;
      },
    },
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'localhost',
      service: 'next-ai-ready',
      version: process.env.npm_package_version || '0.1.0',
      env: env.NODE_ENV,
    },
  };

  // Development configuration - pretty print to console
  if (isDevelopment) {
    return {
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          messageFormat: '[{service}] {msg}',
          levelFirst: true,
          singleLine: false,
        },
      },
    };
  }

  // Test configuration - silent
  if (isTest) {
    return {
      ...baseConfig,
      level: 'silent',
    };
  }

  // Production configuration - structured JSON
  return {
    ...baseConfig,
    redact: {
      paths: [
        'password',
        'token',
        'secret',
        'authorization',
        'cookie',
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      censor: '***REDACTED***',
    },
  };
};

// Create logger instance
export const logger = pino(createLoggerConfig());

// Helper functions for structured logging
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

// Request logger for API routes
export const createRequestLogger = (req: {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
}) => {
  return logger.child({
    req: {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
    },
  });
};

// Database logger
export const dbLogger = createChildLogger({ component: 'database' });

// Auth logger
export const authLogger = createChildLogger({ component: 'auth' });

// Application logger with component context
export const createAppLogger = (component: string) => {
  return createChildLogger({ component });
};

// Performance logger for timing operations
export const createPerformanceLogger = (operation: string) => {
  const startTime = Date.now();
  const perfLogger = createChildLogger({ operation, type: 'performance' });

  return {
    logger: perfLogger,
    end: (additionalContext?: Record<string, unknown>) => {
      const duration = Date.now() - startTime;
      perfLogger.info({
        ...additionalContext,
        duration,
        message: `Operation ${operation} completed`,
      });
      return duration;
    },
  };
};

// Error logger with stack trace
export const logError = (
  error: Error | unknown,
  context?: Record<string, unknown>,
) => {
  const errorContext = {
    ...context,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  logger.error(errorContext, 'Error occurred');
};

// Success operation logger
export const logSuccess = (
  operation: string,
  context?: Record<string, unknown>,
) => {
  logger.info({
    ...context,
    operation,
    status: 'success',
  });
};

// Audit logger for security events
export const auditLogger = createChildLogger({ type: 'audit' });

export const logAuditEvent = (
  event: string,
  userId?: string,
  context?: Record<string, unknown>,
) => {
  auditLogger.info({
    event,
    userId,
    ...context,
    timestamp: new Date().toISOString(),
  });
};

// Export types
export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof createChildLogger>;

// Default export
export default logger;
