# Handover Report — Dev → Tester (B4 · Làn 1 tính năng)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Nhánh | `feature/scaffold-foundation` | Vai | Senior Fullstack Dev |
|-----------|------|------|------------|-------|-------------------------------|-----|----------------------|

> **Phạm vi handover này = PHẦN 1 (dev tự khai).** Phần 2 (Tester kiểm chéo) để trống cho QA. Dev **KHÔNG tự phê duyệt GATE-4**, **KHÔNG handover thẳng anh Bryan** — báo PO.
> Nền: Làn 0 (scaffold, build xanh) + Làn 1 (tính năng G1–G5) trên cùng nhánh. Nguồn đối chiếu: `docs/sa/api-spec.md`, `docs/ba/FSD.md`, `docs/ba/SRS.md` (FR-07), `docs/sa/LLD.md`, `docs/design/design.md`, `docs/_eval/{brief,decisions}.md`.

---

## 1. Đã làm gì (theo G1–G5)

### G2 — Service catalog (18 dịch vụ)
- `src/content/services/*.json` — **18 file** song ngữ EN/VI, map 8 trường Excel, **hiển thị 7 / ẩn `pricePolicy`** (FR-05/Q3). VI là **bản dịch tạm của dev** (chưa qua Legal/BA — điểm cần PO xác nhận).
- `src/content/services/index.ts` — đăng ký + **validate build-time**: đủ 18 slug duy nhất, đủ 7 trường EN, số lượng nhóm **7/8/3** (connectivity/ict_service/mobile_ict). Sinh `SERVICE_SLUGS` dùng cho validate form + lọc lead.
- `src/modules/service-catalog/loader.ts` — `listByGroup`/`getBySlug` + **fallback VI→EN từng trường** (FR-05 1b).

### G1 — Public landing (SCR-01) + SCR-02/03/05
- `src/app/[locale]/page.tsx` — **8 section** (header sticky + toggle VI/EN, hero 2 CTA, Solutions 3 card + chip 7/8/3, Industries 6, Why Mytel 5 số, CTA band gradient, form đăng ký, footer 4 cột). Animation `fadeUp` nhẹ; `prefers-reduced-motion` tắt toàn bộ (globals.css Làn 0).
- **Số Why Mytel:** `18` (số thật từ catalog) + **4 số "—"** chờ AS-04/08/13 (KHÔNG bịa số Mytel).
- **Khối động** (Highlight/Partner/Stat) đọc DB qua `src/modules/public-site/blocks.ts` — `visible` + đúng locale + `sortOrder`, **BR-DYN-01** (ẩn khối thiếu trường bắt buộc của locale); **empty-state**: ẩn cả cụm khi rỗng (FR-01); lỗi DB → `[]` không chặn trang (FSD SCR-01 1b). Cache `unstable_cache` tag `content-blocks`, revalidate 600s.
- SCR-02 `src/app/[locale]/services/page.tsx` — 18 card / 3 nhóm.
- SCR-03 `src/app/[locale]/services/[slug]/page.tsx` — **template 7 trường + CTA prefill `serviceInterest=slug`**, `notFound()` khi slug sai (FR-05 1a), `generateMetadata` + `generateStaticParams` (SEO NFR-07: 18 slug × 2 locale).
- SCR-05 `src/components/layout/LocaleSwitcher.tsx` — toggle VI/EN, MY ẩn (BR-11).

### G3 — Lead (`POST /api/leads`)
- Pipeline `src/modules/lead/service.ts` **đúng thứ tự api-spec §3.1**: honeypot(`website`) → rate-limit → Turnstile verify → validate 6 trường → consent → **persist tx** (`lead` + `lead_consent`) → email Sale.
- `src/lib/rateLimit.ts` — sliding window **60'/5 per IP** (`X-Forwarded-For` trái nhất). `src/lib/turnstile.ts` — verify server (timeout 3s, degrade khi chưa cấu hình secret). `src/modules/lead/validation.ts` — validate FR-07 + bảng quyết định. `src/modules/lead/mailer.ts` — email fallback (`email_status=failed`, **không mất lead**, FR-09/2f).
- Honeypot → **200 giả** (không tạo lead, không lộ cơ chế). Form UI `src/components/lead/LeadForm.tsx` — **4 trạng thái**, errorCode→message (i18n `form.errors`), prefill từ CTA, giữ dữ liệu khi lỗi.

### G4 — Admin content (CRUD 3 khối)
- Service `src/modules/admin-content/service.ts` — create/update/list/get + `setVisibility` (**publishGuard CB-010**) + `reorderBlocks` + `softDeleteBlock`; mỗi mutation ghi **audit_log** + **`revalidateTag('content-blocks')`** (public cập nhật ≤10' — thực tế ≤ revalidate 600s + on-demand tức thì).
- API: `/api/admin/content-blocks` (GET/POST), `/[id]` (GET/PATCH/DELETE), `/[id]/visibility` (PATCH), `/reorder` (PATCH).
- UI SCR-07 `content/page.tsx` (badge/nút theo status, toggle, xóa), SCR-08 `BlockEditor.tsx` (3 loại đa ngữ EN/VI, Lưu nháp / Lưu & Bật hiển thị).

### G5 — Admin auth + lead view
- `src/lib/auth/index.ts` — Credentials + argon2id + **LockoutPolicy 5 sai/15'** (`src/modules/admin-auth/lockout.ts`) → AUTH-010, ghi audit `auth.login/login_failed/locked`. Đăng xuất qua Auth.js `events.signOut` → audit `auth.logout`. Phiên JWT 30' (Làn 0). SCR-06 login map AUTH-001 (chung) / AUTH-010 (khóa).
- Lead view: `src/modules/lead/adminLeads.ts` — list + `getLeadAndMarkViewed` (**Mới→Đã xem**, audit `lead.view`, chỉ đọc BR-18). API `/api/admin/leads` + `/[id]`. UI SCR-09 `leads/page.tsx` — list + filter + empty-state (rỗng/lọc rỗng) + panel chi tiết.

### Cross-cutting
- `src/lib/audit.ts` (FR-18, không ghi PII), `requireAdmin()` guard (defense-in-depth), envelope/errors Làn 0 tái dùng nguyên (mã canonical).

---

## 2. Đối chiếu FR / SCR / API

| Nhóm | FR phủ | SCR | Endpoint |
|------|--------|-----|----------|
| G1 | FR-01, FR-02, FR-03, FR-06 | SCR-01, SCR-05 | SSR + `GET /api/public/content-blocks` |
| G2 | FR-04, FR-05, FR-06 | SCR-02, SCR-03 | repo (SSR, không endpoint DB) |
| G3 lead | FR-07, FR-08, FR-09, FR-10 | SCR-04 | `POST /api/leads` |
| G3 view | FR-11 | SCR-09 | `GET /api/admin/leads`, `/{id}` |
| G4 | FR-12, FR-13, FR-14, FR-15 | SCR-07, SCR-08 | `/api/admin/content-blocks*` (6 endpoint) |
| G5 | FR-16, FR-17, FR-18 | SCR-06, SHELL-ADMIN | `/api/auth/*` (Auth.js) |

- **14/14 endpoint api-spec** hiện thực. Envelope HLD §7 (`{success,data,meta.correlationId}`), mã lỗi canonical LEAD/AUTH/CB/SYS khớp `LLD §8`. Tên trường form lead khớp `contactName/email/phone/companyName/serviceInterest/message/consent/website`.
- **18/18 FR** có mã hiện thực (FR-09/17/18 là side-effect backend, đúng FSD).

## 3. Unit test (Vitest) — 56 pass / 7 file

| File | Phủ |
|------|-----|
| `modules/lead/validation.test.ts` (21) | validate FR-07 từng trường + honeypot + **bảng quyết định 8 tổ hợp** |
| `lib/rateLimit.test.ts` (4) | cửa sổ trượt 5/60', ví dụ tính tay SRS, đếm theo IP |
| `modules/admin-auth/lockout.test.ts` (6) | khóa 5/15', reject khi khóa, hết hạn reset |
| `modules/admin-content/validation.test.ts` (19) | validate 3 loại khối, `STAT_VALUE_RE`, `canPublish` (CB-010) |
| `modules/admin-content/revalidate.test.ts` (3) | `setVisibility` gọi `revalidateTag`, chặn CB-010, CB-404 (mock DB/cache) |
| `lib/errors.test.ts` (2) · `lib/email/noop.test.ts` (1) | Làn 0, giữ xanh |

- **Trạng thái:** `npm run build` **XANH** (53 trang, landing SSG revalidate 600s), `npx tsc --noEmit` sạch, `npm test` **56/56 pass**, ESLint 0 error (còn warning `<img>` cho ảnh khối động do URL động — chấp nhận, không dùng next/image để giữ cloud-agnostic).

## 4. Secure-coding tự rà (OWASP nhẹ)
- **Injection:** Prisma tham số hoá; không raw SQL người dùng. Zod/validate thủ công mọi input.
- **AuthN/Z:** argon2id; middleware + `requireAdmin()` chặn `/api/admin/*` (AUTH-401); lockout 5/15; báo lỗi login **chung** (không lộ email tồn tại).
- **PII/PDPL (NFR-04):** logger redact email/phone/name/ip; không đưa PII lên URL; consent lưu bất biến `lead_consent` (version + ip + UA); email lead chỉ tới hộp Sale cấu hình qua ENV.
- **Anti-abuse:** honeypot + rate-limit + Turnstile; honeypot trả 200 giả (không lộ cơ chế).
- **Secrets:** không hardcode; đọc qua `src/lib/env.ts`; `.env` không commit.
- **Audit (FR-18):** mọi mutation admin + auth event ghi `audit_log`, không chứa PII.

## 5. Giới hạn đã biết / cần Postgres để verify
- **Cần Postgres (chưa verify runtime):** áp `prisma migrate deploy` + `db:seed` + đăng nhập thật + submit lead lưu DB + CRUD khối + revalidate lan sang public + mark-viewed. Môi trường build **không có Postgres** → khối động render rỗng (đúng empty-state), test tích hợp DB **hoãn cho Tester trên UAT có DB**. Logic đã phủ bằng unit test (mock).
- **Rate-limit in-memory** (1 instance on-prem OK). Đa instance/serverless (UAT Vercel) cần store dùng chung (Redis) — **cần SA/DevOps quyết**.
- **AUTH-010 ở UI:** phân biệt "khóa" vs "sai" phụ thuộc `res.code` mà Auth.js trả khi `redirect:false`; nếu runtime không mang `code` → degrade về thông báo chung. Server vẫn khóa + audit đúng.

## 6. Điểm cần PO / SA / anh Bryan làm rõ (không tự đoán)
1. **Turnstile fail cứng** (secret bật + token sai): api-spec **không định mã lỗi riêng** → dev xử lý như honeypot (200 giả, không lộ cơ chế). **Cần SA xác nhận** hay muốn mã lỗi riêng.
2. **Bảng quyết định FR-07 vs pipeline:** khi vừa lỗi-trường vừa vượt rate-limit, SRS bảng ưu tiên LEAD-001 nhưng **api-spec §3.1 (thứ tự cổng) → LEAD-021 nổi trước**. Dev theo **api-spec (thắng)**; ghi để SA/BA đồng bộ tài liệu.
3. **Bản dịch VI 18 dịch vụ + nhãn nhóm** ("Connectivity/ICT Solutions/Mobile" canvas vs "Mobile ICT/ICT Service" FSD): dev dùng nhãn canvas qua i18n key + VI tạm — **cần BA/Legal duyệt bản dịch, anh Bryan chốt nhãn**.
4. **Asset chờ:** AS-04/08/13 (số Why Mytel) hiển thị "—"; AS-03 hero/ảnh, AS-09 SMTP relay + hộp Sale, AS-07 nội dung consent (`CONSENT_TEXT_VERSION`). Chưa cấp → dùng placeholder/ENV mặc định.
5. **Session 30' + "Đổi mật khẩu admin"** đã HOÃN (GATE-2) — giữ nguyên.

---

## Phần 2 — Tester kiểm chéo *(để trống cho QA)*
- [ ] Chạy migrate + seed trên môi trường có Postgres; verify 14 endpoint theo api-spec.
- [ ] Test chéo API sai trình tự nghiệp vụ (submit spam, bật hiển thị thiếu EN, mở lead 2 lần).
- [ ] Đối chiếu 4 trạng thái UI mỗi màn; empty-state landing + lead.
- [ ] Xác nhận điểm §6 với PO trước khi trình GATE-4.
