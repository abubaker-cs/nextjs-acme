import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Why to use Proxy:
// The advantage of employing Proxy for this task is that the protected routes will not even start rendering until
// the Proxy verifies the authentication, enhancing both the security and performance of your application.

// Here you're initializing NextAuth.js with the authConfig object and exporting the auth property
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};