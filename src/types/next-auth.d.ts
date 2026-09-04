import type { DefaultSession } from 'next-auth';

// Mở rộng kiểu session/JWT để mang id + role admin.
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    role?: string;
  }
}
