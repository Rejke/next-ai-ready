import type { NextApiRequest, NextApiResponse } from 'next';
import { createRequestLogger } from './logger';

interface LoggedRequest extends NextApiRequest {
  id?: string;
  startTime?: number;
}

// Generate unique request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Simple response interceptor
const interceptResponse = (
  res: NextApiResponse,
  onComplete: (statusCode: number, body?: unknown) => void,
) => {
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;

  // Override json method
  res.json = function (body: unknown) {
    onComplete(res.statusCode, body);
    return originalJson.call(this, body);
  };

  // Override send method
  res.send = function (body: unknown) {
    onComplete(res.statusCode, body);
    return originalSend.call(this, body);
  };

  // Override end method for edge cases
  res.end = function (
    this: NextApiResponse,
    ...args: Parameters<typeof originalEnd>
  ) {
    onComplete(res.statusCode);
    return originalEnd.apply(this, args);
  } as typeof res.end;
};

// API logging middleware
export const withLogging = <T = unknown>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<T>,
  ) => Promise<void> | void,
) => {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: _
  return async (req: LoggedRequest, res: NextApiResponse<T>) => {
    // Skip logging for health checks
    if (req.url === '/api/health') {
      return handler(req, res);
    }

    // Assign request ID and start time
    req.id = generateRequestId();
    req.startTime = Date.now();

    // Create request-specific logger
    const requestLogger = createRequestLogger(req);

    // Log incoming request
    requestLogger.info({
      requestId: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      msg: 'Incoming request',
    });

    // Set up response interceptor
    interceptResponse(res, (statusCode, responseBody) => {
      const duration = req.startTime ? Date.now() - req.startTime : 0;

      requestLogger.info({
        requestId: req.id,
        statusCode,
        duration,
        responseBody: statusCode >= 400 ? responseBody : undefined,
        msg: 'Request completed',
      });
    });

    try {
      // Execute the actual handler
      await handler(req, res);
    } catch (error) {
      // Calculate duration on error
      const duration = req.startTime ? Date.now() - req.startTime : 0;

      // Log error
      requestLogger.error({
        requestId: req.id,
        duration,
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        msg: 'Request failed',
      });

      // Re-throw to let Next.js handle the error
      throw error;
    }
  };
};

// Utility to log API errors consistently
export const logApiError = (
  req: LoggedRequest,
  error: Error | unknown,
  context?: Record<string, unknown>,
) => {
  const requestLogger = createRequestLogger(req);

  requestLogger.error({
    requestId: req.id,
    method: req.method,
    url: req.url,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    ...context,
    msg: 'API error',
  });
};

// Utility to log successful API operations
export const logApiSuccess = (
  req: LoggedRequest,
  operation: string,
  context?: Record<string, unknown>,
) => {
  const requestLogger = createRequestLogger(req);

  requestLogger.info({
    requestId: req.id,
    method: req.method,
    url: req.url,
    operation,
    ...context,
    msg: 'API operation successful',
  });
};

// Export types
export type { LoggedRequest };
