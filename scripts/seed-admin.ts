// scripts/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('1610422010', 12); // ✅ Augmenter le cost à 12 pour plus de sécurité

  await prisma.user.upsert({
    where: { email: 'admin@marketbook.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@marketbook.com',
      password: hashedPassword,
      role: 'ADMIN',
      isAdmin: true,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });
  console.log('✅ Admin créé ou mis à jour avec le mot de passe sécurisé.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
