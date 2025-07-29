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

// Base logger configuration
const baseLogger = pino(createLoggerConfig());

// Helper to create child logger
export const createChildLogger = (context: Record<string, unknown>) => {
  return baseLogger.child(context);
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

// Application logger with component context
export const createAppLogger = (component: string) => {
  return enhanceLogger(createChildLogger({ component }));
};

// Enhanced logger with performance timing
interface TimerResult {
  done: (additionalContext?: Record<string, unknown>) => number;
}

// Extend the logger with a startTimer method
export function enhanceLogger<T extends pino.Logger>(
  loggerToEnhance: T,
): T & {
  startTimer: (operation: string) => TimerResult;
} {
  const enhanced = loggerToEnhance as T & {
    startTimer: (operation: string) => TimerResult;
  };

  enhanced.startTimer = (operation: string) => {
    const startTime = Date.now();
    const timerLogger = loggerToEnhance.child({
      operation,
      type: 'performance',
    });

    return {
      done: (additionalContext?: Record<string, unknown>) => {
        const duration = Date.now() - startTime;
        timerLogger.info({
          ...additionalContext,
          duration,
          msg: `Operation ${operation} completed`,
        });
        return duration;
      },
    };
  };

  return enhanced;
}

// Create enhanced main logger
export const logger = enhanceLogger(baseLogger);

// Create enhanced child loggers
export const dbLogger = enhanceLogger(
  createChildLogger({ component: 'database' }),
);
export const authLogger = enhanceLogger(
  createChildLogger({ component: 'auth' }),
);
export const auditLogger = enhanceLogger(createChildLogger({ type: 'audit' }));

// Performance logger factory for backward compatibility
export const createPerformanceLogger = (operation: string) => {
  return logger.startTimer(operation);
};

// Export types
export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof createChildLogger>;

// Default export
export default logger;
