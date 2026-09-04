import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verify } from '@node-rs/argon2';
import { z } from 'zod';
import { authConfig } from './config';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { writeAudit } from '@/lib/audit';
import { evaluateLogin } from '@/modules/admin-auth/lockout';

/**
 * Auth.js v5 — Credentials + argon2id (Node runtime).
 * G5/FR-16: xác thực email/mật khẩu + khóa 5 sai/15' (LockoutPolicy) + ghi audit_log auth.* (FR-18).
 * Sai thông tin → CredentialsSignin (UI ánh xạ AUTH-001, thông báo chung — không lộ trường nào sai).
 * Tài khoản đang khóa → LockedError (code 'AUTH-010') để UI báo "Tài khoản tạm khóa".
 */
class LockedError extends CredentialsSignin {
  code = 'AUTH-010';
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  events: {
    async signOut(message) {
      // FR-17/18: ghi audit khi đăng xuất (token mang uid).
      const uid =
        'token' in message && message.token
          ? ((message.token as { uid?: string }).uid ?? null)
          : null;
      await writeAudit({ adminId: uid, action: 'auth.logout', entityType: 'admin_account', entityId: uid });
    },
  },
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
        if (!account) return null; // không tiết lộ email không tồn tại

        const now = Date.now();
        // Verify mật khẩu trước để LockoutPolicy quyết định trạng thái kế.
        const passwordOk = await verify(account.passwordHash, password);
        const outcome = evaluateLogin(
          {
            failedAttempts: account.failedAttempts,
            status: account.status as 'active' | 'locked',
            lockedUntil: account.lockedUntil,
          },
          passwordOk,
          now,
        );

        if (outcome.action === 'reject_locked') {
          await writeAudit({
            adminId: account.id,
            action: 'auth.login_failed',
            entityType: 'admin_account',
            entityId: account.id,
            result: 'failed',
            detail: { reason: 'locked' },
          });
          throw new LockedError();
        }

        if (outcome.action === 'reject_bad') {
          await prisma.adminAccount.update({
            where: { id: account.id },
            data: {
              failedAttempts: outcome.next.failedAttempts,
              status: outcome.next.status,
              lockedUntil: outcome.next.lockedUntil,
            },
          });
          await writeAudit({
            adminId: account.id,
            action: outcome.locked ? 'auth.locked' : 'auth.login_failed',
            entityType: 'admin_account',
            entityId: account.id,
            result: 'failed',
          });
          if (outcome.locked) throw new LockedError();
          return null; // → AUTH-001
        }

        // outcome.action === 'allow'
        await prisma.adminAccount.update({
          where: { id: account.id },
          data: {
            failedAttempts: 0,
            status: 'active',
            lockedUntil: null,
            lastLoginAt: new Date(now),
          },
        });
        await writeAudit({
          adminId: account.id,
          action: 'auth.login',
          entityType: 'admin_account',
          entityId: account.id,
        });
        logger.info('auth.login', { entityId: account.id });
        return { id: account.id, email: account.email };
      },
    }),
  ],
});
