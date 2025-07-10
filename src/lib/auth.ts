import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { SupabaseAdapter } from '@auth/supabase-adapter';
// import { supabaseAdmin } from './supabase'; // Currently unused - adapter uses env vars directly

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account: any;
    }) {
      console.log('JWT callback - account:', account); // TODO: Remove in production
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any;
    }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
