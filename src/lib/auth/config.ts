import type { NextAuthConfig } from 'next-auth';

/**
 * Cấu hình Auth.js dùng CHUNG — edge-safe (KHÔNG import argon2/prisma).
 * Middleware dùng file này để đọc JWT; providers thật khai ở ./index.ts (Node runtime).
 * Session JWT stateless, hết hạn 30 phút (FR-17). Cookie httpOnly + SameSite=Lax do Auth.js lo.
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 phút
  },
  pages: {
    signIn: '/vi/admin/login',
  },
  providers: [], // khai ở index.ts để giữ config edge-safe
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id?: string }).id;
        token.role = 'admin';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: string }).role = (token.role as string) ?? 'admin';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
