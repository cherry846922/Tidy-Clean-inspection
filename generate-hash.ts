import { hashPassword } from './server/auth';

async function generateHash() {
  const password = 'password123';
  const hashedPassword = await hashPassword(password);
  console.log('Hashed password:', hashedPassword);
}

generateHash().catch(console.error);