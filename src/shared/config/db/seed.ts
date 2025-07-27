import { db } from './client';
import { users } from './schema';

async function seed() {
  console.log('🌱 Starting database seed...');

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

    console.log('✅ Created test user:', testUser.email);

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
