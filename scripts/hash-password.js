// scripts/hash-password.js
import bcrypt from 'bcryptjs';

const password = '1610422010';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('✅ Hash généré pour "1610422010" :');
  console.log(hash);
  console.log('\n👉 Copiez ce hash dans Prisma Studio (colonne password de l\'user Admin).');
});   