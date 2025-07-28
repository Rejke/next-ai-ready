import { createPerformanceLogger, dbLogger, logError } from '../../lib/logger';
import { db } from './client';
import { users } from './schema';

async function seed() {
  dbLogger.info('Starting database seed...');
  const perfLogger = createPerformanceLogger('db.seed');

  try {
    // Create test user
    const [testUser] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      })
      .returning();

    dbLogger.info({
      operation: 'user.create',
      email: testUser.email,
      userId: testUser.id,
      msg: 'Created test user',
    });

    const duration = perfLogger.end({
      usersCreated: 1,
      status: 'success',
    });

    dbLogger.info({
      duration,
      msg: 'Database seed completed successfully',
    });
  } catch (error) {
    logError(error, {
      operation: 'db.seed',
      context: 'Database seeding failed',
    });
    process.exit(1);
  }

  process.exit(0);
}

seed();
