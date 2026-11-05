import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// The Credentials provider allows users to log in with a username and a password.
import Credentials from 'next-auth/providers/credentials';

// We can use zod to validate the email and password before checking if the user exists in the database:
import { z } from 'zod';

import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// When seeding your database, you used a package called bcrypt to hash the user's password before storing
// it in the database. You will use it again later in this chapter to compare that the password entered 
// by the user matches the one in the database. However, you will need to create a separate file for the bcrypt package. 
// This is because bcrypt relies on Node.js APIs not available in Next.js Proxy.
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) return user;
        }
 
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});