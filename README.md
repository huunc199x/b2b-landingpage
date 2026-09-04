# Mytel B2B Landing (+ Admin CMS-lite)

Landing page hệ sinh thái dịch vụ B2B Mytel (18 dịch vụ) + Admin CMS-lite quản lý khối nội dung động và lead.

**Stack:** TypeScript 5 · Node 24 LTS · Next.js 15 (App Router) · React 19 · PostgreSQL 17 · Prisma 6 · next-intl (en/vi) · Auth.js v5 (Credentials + argon2id) · Turnstile + honeypot.

> Đây là **NỀN (Làn 0)** — scaffold + hạ tầng chung để Làn 1 lắp tính năng public/admin. Chi tiết thiết kế: `docs/sa/LLD.md`, `docs/sa/api-spec.md`, `docs/design/design.md`.

## Ràng buộc cloud-agnostic (V11)

- `output: 'standalone'` trong `next.config.ts` → chạy được cả **Docker on-prem** lẫn **Vercel**.
- KHÔNG dùng primitive khóa cứng Vercel (edge-only / `@vercel/*`).
- Email + lưu file + config bọc qua **interface** (adapter chọn theo ENV): `src/lib/email`, `src/lib/storage`.
- 1 codebase + PostgreSQL 17 cho cả 2 đích; schema/migration Prisma dùng chung.

## Chạy local

```bash
cp .env.example .env        # điền DATABASE_URL, AUTH_SECRET, SEED_ADMIN_*
npm install                 # postinstall tự chạy `prisma generate`
npm run prisma:migrate      # tạo schema (migrate dev) — cần Postgres đang chạy
npm run db:seed             # seed 1 admin từ SEED_ADMIN_EMAIL/PASSWORD (argon2id)
npm run dev                 # http://localhost:3000  (redirect → /vi)
```

- Public: `http://localhost:3000/vi` · `http://localhost:3000/en`
- Admin: `http://localhost:3000/vi/admin` (chưa đăng nhập → `/vi/admin/login`)
- Healthcheck: `http://localhost:3000/api/health` (kiểm DB)

## Biến môi trường (xem `.env.example` đầy đủ)

| Biến | Bắt buộc | Ý nghĩa |
|------|:--------:|---------|
| `DATABASE_URL` | ✓ | Kết nối PostgreSQL 17 (Prisma) |
| `AUTH_SECRET` | ✓ | Secret Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` / `AUTH_TRUST_HOST` | ✓ (prod sau proxy) | URL gốc + tin cậy host sau Nginx |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | ✓ (seed) | Admin đầu tiên (mật khẩu ≥12 ký tự) |
| `EMAIL_TRANSPORT` | — | `smtp` (on-prem relay) \| `noop` (UAT/dev) |
| `SMTP_*`, `LEAD_NOTIFY_*` | khi `smtp` | Cấu hình relay + hộp thư Sale |
| `STORAGE_DRIVER` | — | `local` \| `noop` |
| `TURNSTILE_*` | — | Chống spam form (trống → degrade honeypot+rate-limit) |

**KHÔNG commit `.env` thật.** Placeholder trong `.env.example` phải thay bằng giá trị thật khi deploy.

## Lệnh chính

| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy dev server |
| `npm run build` | `prisma generate` + `next build` (standalone) |
| `npm start` | Chạy bản build |
| `npm run lint` | ESLint (next) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit) |
| `npm run prisma:migrate` | Migration dev |
| `npm run prisma:deploy` | Migration production (`migrate deploy`) |
| `npm run db:seed` | Seed admin |

## Migrate DB

- Dev: `npm run prisma:migrate` (tạo + áp migration, cập nhật client).
- Prod/UAT: `npm run prisma:deploy` (chỉ áp migration đã commit — không sinh mới).

## Chạy bằng Docker (production on-prem)

```bash
docker build -t mytel-b2b .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/b2b?schema=public" \
  -e AUTH_SECRET="<32-byte base64>" \
  -e AUTH_TRUST_HOST="true" \
  -e EMAIL_TRANSPORT="smtp" \
  mytel-b2b
```

- Image multi-stage, chạy **non-root** (`nextjs:nodejs`), có `HEALTHCHECK` gọi `/api/health`.
- Đặt sau **Nginx** (TLS, `X-Forwarded-For`). `docker-compose.yml` (Nginx + Postgres + app) do **DevOps** dựng ở B6.
- Chạy `prisma migrate deploy` trước khi khởi động app (bước init trong compose).

## Chạy trên Vercel (UAT)

- Cùng codebase, `output:'standalone'` không cản Vercel. Set biến môi trường trong project settings.
- **UAT dùng dữ liệu giả — KHÔNG đổ lead PII thật** (PDPL). Đặt `EMAIL_TRANSPORT=noop`.
- Postgres managed/tạm; chạy `prisma migrate deploy` trong build/hook.

## Cấu trúc thư mục

```
prisma/schema.prisma        # 6 model + enum canonical (LLD §1–§2)
prisma/seed.ts              # seed 1 admin (argon2id, mật khẩu từ ENV)
src/
  app/
    [locale]/               # next-intl (en|vi; khung my) — public + admin localized
      page.tsx              # SCR-01 Landing (khung)
      admin/login/          # SCR-06 (khung)
      admin/(protected)/    # SHELL-ADMIN + dashboard (khung, bảo vệ session)
    api/
      health/route.ts       # healthcheck DB
      auth/[...nextauth]/    # Auth.js v5 handler
  components/ui/            # Button · Input · Card · Badge (token-hoá)
  components/layout/        # Header · Footer (khung)
  i18n/                     # routing · request · navigation · messages/{en,vi}.json
  lib/
    db.ts envelope.ts errors.ts logger.ts correlation.ts env.ts
    email/                  # interface + smtp(nodemailer) + noop + factory theo ENV
    storage/                # interface + local + noop
    auth/                   # config (edge-safe) + index (Credentials + argon2id)
  app/globals.css          # design tokens 3 lớp (primitive→semantic→component)
  middleware.ts            # i18n + bảo vệ /admin/* + /api/admin/*
```

## Việc Làn 1 lắp tiếp

- G1 Public site: 8 section landing + khối động (FR-01/02), SCR-02/03 dịch vụ, catalog 18 dịch vụ (`src/content/services`).
- G3 Lead: `POST /api/leads` (validate → honeypot → rate-limit → Turnstile → persist tx → email), admin lead list/detail.
- G4 Admin content: CRUD khối + visibility + reorder + revalidateTag.
- G5 Admin auth: lockout 5/15', audit_log (append-only), đổi thông điệp lỗi AUTH-001/010.
