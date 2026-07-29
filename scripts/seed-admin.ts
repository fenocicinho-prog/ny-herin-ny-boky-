// scripts/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('1610422010', 10);

  await prisma.user.upsert({
    where: { email: 'admin@marketbook.com' },
    update: {},
    create: {
      email: 'admin@marketbook.com',
      password: hashedPassword, // Le hash est généré ici une seule fois lors du seed
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
    },
  });
  console.log('✅ Admin créé ou mis à jour avec le mot de passe sécurisé.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());   