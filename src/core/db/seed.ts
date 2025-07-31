import { seedConfiguration } from './seed-configuration.js';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await seedConfiguration();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();








