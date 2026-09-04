/**
 * requireAdmin() — defense-in-depth cho route /api/admin/* (ngoài middleware).
 * Trả adminId từ phiên; ném AUTH-401 nếu chưa xác thực.
 */
import { auth } from './index';
import { AppError } from '@/lib/errors';

export async function requireAdmin(): Promise<{ id: string }> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !id) {
    throw new AppError('AUTH-401');
  }
  return { id };
}
