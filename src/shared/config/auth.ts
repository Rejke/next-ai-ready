import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { auditLogger, authLogger } from '../lib/logger';
import { accounts, sessions, users, verificationTokens } from './db';
import { db } from './db/client';
import { env } from './env';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users,
      sessions,
      accounts,
      verificationTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }
        : undefined,
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  onRequest: (request: Request) => {
    // Log authentication requests
    authLogger.debug({
      method: request.method,
      url: request.url,
      path: new URL(request.url).pathname,
      msg: 'Auth request',
    });
  },
  onResponse: (response: Response) => {
    // Log authentication responses
    const url = response.url || '';
    const isError = !response.ok;

    if (isError) {
      authLogger.error({
        status: response.status,
        statusText: response.statusText,
        url,
        msg: 'Auth request failed',
      });
    } else {
      // Log successful auth events as audit events
      const pathname = new URL(url).pathname;
      if (pathname.includes('sign-in')) {
        auditLogger.info({
          event: 'user.signin',
          url,
          timestamp: new Date().toISOString(),
        });
      } else if (pathname.includes('sign-up')) {
        auditLogger.info({
          event: 'user.signup',
          url,
          timestamp: new Date().toISOString(),
        });
      } else if (pathname.includes('sign-out')) {
        auditLogger.info({
          event: 'user.signout',
          url,
          timestamp: new Date().toISOString(),
        });
      }

      authLogger.info({
        status: response.status,
        url,
        msg: 'Auth request successful',
      });
    }
  },
});
