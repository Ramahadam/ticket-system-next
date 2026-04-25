import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = bcrypt.hashSync('changeme123', 12);

  const fixtures = [
    {
      email: 'admin@ticket.local',
      firstname: 'Platform',
      lastname: 'Admin',
      userrole: 'admin' as const,
    },
    {
      email: 'analyst@ticket.local',
      firstname: 'Alex',
      lastname: 'Analyst',
      userrole: 'analyst' as const,
    },
    {
      email: 'user@ticket.local',
      firstname: 'Sam',
      lastname: 'Standard',
      userrole: 'standard' as const,
    },
  ];

  for (const f of fixtures) {
    await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: { ...f, passwordHash, isActive: true },
    });
    console.log(`Seeded ${f.userrole}: ${f.email} / changeme123`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
