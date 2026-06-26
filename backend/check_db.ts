import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const salons = await prisma.salon.findMany();
  console.log('Salons:', salons);
  
  const branches = await prisma.branch.findMany();
  console.log('Branches:', branches);
  
  const result = await prisma.$queryRaw`SELECT * FROM profiles`;
  console.log('Profiles:', result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
