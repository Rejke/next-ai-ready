// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { logApiSuccess, withLogging } from '@/shared/lib/api-logger';
import { logger } from '@/shared/lib/logger';

type Data = {
  name: string;
  timestamp: string;
  message?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // Log additional context
  logger.debug({
    query: req.query,
    headers: req.headers,
    msg: 'Processing hello request',
  });

  // Simulate some processing
  const name = (req.query.name as string) || 'John Doe';

  // Log successful operation
  logApiSuccess(req, 'hello.fetch', {
    name,
  });

  await res.status(200).json({
    name,
    timestamp: new Date().toISOString(),
    message: `Hello, ${name}!`,
  });
};

// Export with logging middleware
export default withLogging(handler);
