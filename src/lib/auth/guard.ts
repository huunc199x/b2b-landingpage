/**
 * requireAdmin() — defense-in-depth cho route /api/admin/* (ngoài middleware).
 * Trả adminId từ phiên; ném AUTH-020 (hết phiên / không phiên) nếu chưa xác thực (DISC-03) —
 * đồng bộ với middleware + SRS/FSD SHELL-ADMIN 2a / api-spec §3.4.
 */
import { auth } from './index';
import { AppError } from '@/lib/errors';

export async function requireAdmin(): Promise<{ id: string }> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !id) {
    throw new AppError('AUTH-020');
  }
  return { id };
}
