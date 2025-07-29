import { dbLogger } from '../../lib/logger';
import { db } from './client';
import { users } from './schema';

async function seed() {
  dbLogger.info('Starting database seed...');
  const timer = dbLogger.startTimer('db.seed');

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

    const duration = timer.done({
      usersCreated: 1,
      status: 'success',
    });

    dbLogger.info({
      duration,
      msg: 'Database seed completed successfully',
    });
  } catch (error) {
    dbLogger.error(
      {
        operation: 'db.seed',
        context: 'Database seeding failed',
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      'Error occurred'
    );
    process.exit(1);
  }

  process.exit(0);
}

seed();
