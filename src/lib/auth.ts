import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: '', // Will be set during onboarding
          collegeId: "", // Will be set during onboarding
          isVerified: false, // New Google users start as unverified
        };
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // Supabase query for user by email
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();
        if (!user || error) {
          return null;
        }
        // Password check
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        );
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          collegeId: user.college_id,
          isVerified: user.is_verified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in
      if (account?.provider === 'google') {
        try {
          // Check if user already exists
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            // Existing user - update their info and return true
            user.id = existingUser.id;
            user.role = existingUser.role || '';
            user.collegeId = existingUser.college_id || '';
            user.isVerified = existingUser.is_verified || false;
            return true;
          } else {
            // New user - create them in database
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                email: user.email,
                name: user.name,
                avatar: user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                is_verified: false, // New Google users need approval
                role: 'STUDENT', // Default role, can be changed during onboarding
                profile_completed: false, // New users start with incomplete profiles
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating Google user:', createError);
              return false;
            }

            user.id = newUser.id;
            user.role = newUser.role || '';
            user.collegeId = newUser.college_id || '';
            user.isVerified = newUser.is_verified || false;
            return true;
          }
        } catch (error) {
          console.error('Error in Google sign-in callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || '';
        token.collegeId = user.collegeId || '';
        token.isVerified = user.isVerified || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as string) || '';
        session.user.collegeId = (token.collegeId as string) || '';
        session.user.isVerified = (token.isVerified as boolean) || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  events: {
    async signIn({ user, account }) {
      try {
        // Update user's last active time in Supabase
        await supabase
          .from('users')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating user last active time:', error);
        // Don't fail the sign-in if this fails
      }
    },
  },
}; 