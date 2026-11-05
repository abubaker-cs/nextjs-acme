import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
callbacks: {

    // The authorized callback is used to verify if the request is authorized to access a page with Next.js Proxy
    authorized({ 
        
        // The auth property contains the user's session
        auth, 
        
        // The request property contains the incoming request.
        request: { nextUrl } }) {
     
      const isLoggedIn = !!auth?.user;
     
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },

  },

  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;