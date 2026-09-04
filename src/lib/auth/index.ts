import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verify } from '@node-rs/argon2';
import { z } from 'zod';
import { authConfig } from './config';
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Auth.js v5 — Credentials + argon2id (Node runtime).
 * Làn 0: xác thực email/mật khẩu + chặn tài khoản đang khóa.
 * TODO Làn 1 (G5): đếm 5 sai/15' → set locked_until; ghi audit_log auth.* (FR-16/18).
 */
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null; // → AUTH-001 (thông báo chung)

        const { email, password } = parsed.data;
        const account = await prisma.adminAccount.findUnique({ where: { email } });
        if (!account) return null;

        // Tài khoản đang khóa (5 sai/15' — FR-16).
        if (
          account.status === 'locked' &&
          account.lockedUntil &&
          account.lockedUntil > new Date()
        ) {
          throw new AppError('AUTH-010');
        }

        const okPassword = await verify(account.passwordHash, password);
        if (!okPassword) return null;

        logger.info('auth.login', { entityId: account.id });
        return { id: account.id, email: account.email };
      },
    }),
  ],
});
