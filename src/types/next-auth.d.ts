import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      collegeId: string;
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    collegeId: string;
    isVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    collegeId: string;
    isVerified: boolean;
  }
} 