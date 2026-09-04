/**
 * Seed dữ liệu khởi tạo — 1 tài khoản admin (AS-14).
 * Mật khẩu lấy từ ENV (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD), hash argon2id.
 * KHÔNG hardcode secret thật. Chạy: `npm run db:seed`.
 * Idempotent: dùng upsert theo email — chạy lại không tạo trùng.
 */
import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Thiếu SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong môi trường. Xem .env.example.',
    );
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD phải ≥ 12 ký tự (NFR-03).');
  }

  // argon2id là default của @node-rs/argon2.
  const passwordHash = await hash(password);

  const admin = await prisma.adminAccount.upsert({
    where: { email },
    update: {}, // không đổi mật khẩu nếu đã tồn tại (reset chủ động qua DevOps)
    create: {
      id: ulid(),
      email,
      passwordHash,
      status: 'active',
    },
  });

  console.log(`[seed] admin sẵn sàng: ${admin.email} (id=${admin.id})`);
}

main()
  .catch((e) => {
    console.error('[seed] lỗi:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
