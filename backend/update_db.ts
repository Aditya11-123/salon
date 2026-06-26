import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salon_id UUID;`);
    console.log('Successfully added salon_id to profiles table.');
    
    // Also, link any existing admin profiles to their own salon
    await prisma.$executeRawUnsafe(`
      UPDATE profiles p
      SET salon_id = s.id::uuid
      FROM "Salon" s
      WHERE p.id = s."ownerId"::uuid AND p.salon_id IS NULL;
    `);
    console.log('Successfully linked existing admins to their salons.');
  } catch (error) {
    console.error('Error modifying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
