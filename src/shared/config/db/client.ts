import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';
// biome-ignore lint/performance/noNamespaceImport: drizzle requirements
import * as schema from './schema';

const connectionString =
  env.DATABASE_URL ||
  `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

// For query purposes
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
