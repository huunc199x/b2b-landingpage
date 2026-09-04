/**
 * Seed dữ liệu khởi tạo.
 *
 * (1) LUÔN LUÔN: 1 tài khoản admin (AS-14) — mật khẩu lấy từ ENV
 *     (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD), hash argon2id. KHÔNG hardcode secret thật.
 *
 * (2) TUỲ CHỌN (chỉ khi ENV `SEED_DEMO_BLOCKS=true`): vài khối động MẪU cho UAT/preview
 *     (Highlight / Đối tác / Con số) — NỘI DUNG GIẢ, con số ghi rõ "(demo)". Giúp trang
 *     preview có nội dung để nghiệm thu. KHÔNG bật ở production on-prem (để prod sạch dữ liệu giả).
 *
 * Chạy: `npm run db:seed`. Idempotent: dùng upsert theo email / id cố định — chạy lại KHÔNG tạo trùng
 * và KHÔNG ghi đè nội dung admin đã sửa (update: {}).
 */
import { PrismaClient, Prisma, type BlockType, type Locale } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

/** Sinh id CHAR(26) cố định, ổn định theo nhãn → upsert idempotent cho khối demo. */
function demoId(tag: string): string {
  const base = ('DEMO' + tag).toUpperCase().replace(/[^0-9A-Z]/g, '0');
  return base.padEnd(26, '0').slice(0, 26);
}

async function seedAdmin(): Promise<string> {
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
  return admin.id;
}

/** Định nghĩa 1 khối demo: block gốc + bản dịch EN/VI. */
interface DemoBlock {
  tag: string;
  blockType: BlockType;
  sortOrder: number;
  payload: Record<string, unknown>;
  i18n: Record<Locale, { title: string; description?: string }>;
}

// Logo đối tác placeholder (data URI — hợp CSP img-src 'self' data:), tránh phụ thuộc asset ngoài.
const DEMO_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60"><rect width="160" height="60" rx="8" fill="#EEE"/><text x="80" y="36" font-family="sans-serif" font-size="14" fill="#999" text-anchor="middle">DEMO LOGO</text></svg>`,
  );

const DEMO_BLOCKS: DemoBlock[] = [
  // --- Highlight (yêu cầu title + description ở mỗi locale) ---
  {
    tag: 'HL1',
    blockType: 'highlight',
    sortOrder: 1,
    payload: { link: '#' },
    i18n: {
      en: {
        title: 'Demo Highlight — Cloud & ICT',
        description: 'Sample dynamic block (demo data). Edit or hide it in Admin > Content.',
      },
      vi: {
        title: 'Khối Demo — Điện toán đám mây & ICT',
        description: 'Khối động mẫu (dữ liệu demo). Sửa hoặc ẩn trong Admin > Nội dung.',
      },
    },
  },
  {
    tag: 'HL2',
    blockType: 'highlight',
    sortOrder: 2,
    payload: { link: '#' },
    i18n: {
      en: {
        title: 'Demo Highlight — Managed Connectivity',
        description: 'Second sample highlight (demo data). Not real Mytel content.',
      },
      vi: {
        title: 'Khối Demo — Kết nối được quản lý',
        description: 'Khối highlight mẫu thứ hai (dữ liệu demo). Không phải nội dung Mytel thật.',
      },
    },
  },
  // --- Partner (yêu cầu title; logoUrl ở payload) ---
  {
    tag: 'PT1',
    blockType: 'partner',
    sortOrder: 1,
    payload: { logoUrl: DEMO_LOGO, link: '#' },
    i18n: { en: { title: 'Demo Partner A' }, vi: { title: 'Đối tác Demo A' } },
  },
  {
    tag: 'PT2',
    blockType: 'partner',
    sortOrder: 2,
    payload: { logoUrl: DEMO_LOGO, link: '#' },
    i18n: { en: { title: 'Demo Partner B' }, vi: { title: 'Đối tác Demo B' } },
  },
  {
    tag: 'PT3',
    blockType: 'partner',
    sortOrder: 3,
    payload: { logoUrl: DEMO_LOGO, link: '#' },
    i18n: { en: { title: 'Demo Partner C' }, vi: { title: 'Đối tác Demo C' } },
  },
  // --- Stat (yêu cầu title + payload.value; con số ghi rõ "(demo)") ---
  {
    tag: 'ST1',
    blockType: 'stat',
    sortOrder: 1,
    payload: { value: '99+ (demo)' },
    i18n: {
      en: { title: 'Enterprise customers', description: 'demo figure' },
      vi: { title: 'Khách hàng doanh nghiệp', description: 'số liệu demo' },
    },
  },
  {
    tag: 'ST2',
    blockType: 'stat',
    sortOrder: 2,
    payload: { value: '24/7 (demo)' },
    i18n: {
      en: { title: 'Support', description: 'demo figure' },
      vi: { title: 'Hỗ trợ', description: 'số liệu demo' },
    },
  },
  {
    tag: 'ST3',
    blockType: 'stat',
    sortOrder: 3,
    payload: { value: '1,234 (demo)' },
    i18n: {
      en: { title: 'Projects delivered', description: 'demo figure' },
      vi: { title: 'Dự án đã triển khai', description: 'số liệu demo' },
    },
  },
  {
    tag: 'ST4',
    blockType: 'stat',
    sortOrder: 4,
    payload: { value: '5★ (demo)' },
    i18n: {
      en: { title: 'Service rating', description: 'demo figure' },
      vi: { title: 'Đánh giá dịch vụ', description: 'số liệu demo' },
    },
  },
];

async function seedDemoBlocks(adminId: string): Promise<void> {
  for (const b of DEMO_BLOCKS) {
    const blockId = demoId(b.tag);
    await prisma.contentBlock.upsert({
      where: { id: blockId },
      update: {}, // idempotent: KHÔNG ghi đè nếu admin đã sửa khối demo này
      create: {
        id: blockId,
        blockType: b.blockType,
        status: 'visible', // hiển thị ngay để preview có nội dung
        sortOrder: b.sortOrder,
        payload: b.payload as Prisma.InputJsonValue,
        createdBy: adminId,
      },
    });

    for (const locale of Object.keys(b.i18n) as Locale[]) {
      const tr = b.i18n[locale];
      await prisma.contentBlockI18n.upsert({
        where: { blockId_locale: { blockId, locale } },
        update: {}, // idempotent
        create: {
          id: demoId(b.tag + locale),
          blockId,
          locale,
          title: tr.title,
          description: tr.description ?? null,
        },
      });
    }
  }
  console.log(`[seed] khối demo UAT sẵn sàng: ${DEMO_BLOCKS.length} khối (Highlight/Đối tác/Con số).`);
}

async function main() {
  const adminId = await seedAdmin();

  if (process.env.SEED_DEMO_BLOCKS === 'true') {
    await seedDemoBlocks(adminId);
  } else {
    console.log('[seed] SEED_DEMO_BLOCKS != "true" → bỏ qua khối demo (giữ DB sạch cho prod).');
  }
}

main()
  .catch((e) => {
    console.error('[seed] lỗi:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
