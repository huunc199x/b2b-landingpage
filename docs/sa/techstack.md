# Techstack — Landing page dịch vụ B2B Mytel (+ Admin CMS-lite)

| Phiên bản | v1.0 | Ngày | 2026-09-02 | Trạng thái | DONE — **version đã được anh Bryan DUYỆT 2026-09-02** (chờ GATE-2) |
|-----------|------|------|------------|------------|--------------------------------------------------------------------|

> **Nguồn chốt:** `docs/_eval/decisions.md` §"B2 — Kiến trúc & version" (anh Bryan chốt 2026-09-02, SA Bước 0.5 HITL): Kiến trúc **Phương án A — Next.js fullstack (App Router) modular monolith**; DB **PostgreSQL**; **duyệt toàn bộ** bảng version V1–V13 ở `arch-proposal.md`.
> **Điều chỉnh V11 hosting** (`decisions.md` §"B3 — Điều chỉnh hosting", anh Bryan chốt 2026-09-04): **Production on-prem Docker · UAT Vercel · code cloud-agnostic** (xem dòng V11 bảng công nghệ + mục Ràng buộc build).
> **Khớp kiến trúc:** modular monolith, chung 1 CSDL PostgreSQL (HLD mục 1).
> **NFR:** cột "NFR liên quan" đã đối chiếu và trỏ tới **ID NFR-01..NFR-10 thật của `docs/ba/SRS.md v0.1`** (2026-09-02).

## Nguyên tắc lựa chọn
Ưu tiên: phù hợp NFR > thế mạnh đội ngũ > chi phí vận hành > độ trưởng thành. Bài toán = web app marketing (public SEO nhanh + Admin CMS-lite + form lead), quy mô nhỏ, 1 miền, đọc-nhiều-ghi-ít, 1 admin → **không microservices**.

## Bảng công nghệ *(SA đề xuất → anh Bryan đã xác nhận từng dòng 2026-09-02)*

| Lớp | Lựa chọn | **Version** | Lý do (chọn & chọn version) | Phương án thay thế đã cân nhắc | NFR liên quan | Xác nhận |
|-----|----------|-------------|------------------------------|-------------------------------|---------------|:--------:|
| Ngôn ngữ | **TypeScript** | 5.x (ổn định mới nhất) | Type-safe cho cả public/API/admin trong 1 codebase; chuẩn de-facto hệ Next.js; giảm bug runtime | JavaScript thuần (mất an toàn kiểu) | NFR-03 | ✅ |
| Runtime | **Node.js** | 24 LTS ("Krypton") | Active LTS, hỗ trợ dài ~2028; hợp Next.js 15 | Node 22 LTS (giữ nếu đội đã chuẩn hóa) | NFR-01 | ✅ |
| Framework FE+API | **Next.js (App Router)** | 15.x | SSR/ISR + on-demand revalidate cho public (SEO/first-paint), Route Handlers cho API, `/admin/*` cùng app → ra MVP nhanh nhất, 1 pipeline | Next.js 16 (mới, cần kiểm breaking); Remix; Nuxt (Vue) | NFR-01, NFR-07 | ✅ |
| UI runtime | **React** | 19 (đi kèm Next 15) | Server Components giảm JS client, tốt cho LCP mobile | — (gắn theo Next) | NFR-01, NFR-02 | ✅ |
| CSDL vận hành | **PostgreSQL** | 17 | ACID; JSONB tiện lưu nội dung đa ngữ EN/VI; mã nguồn mở, chạy tốt on-prem Docker; 17 rất ổn định | PostgreSQL 18 (mới hơn); MySQL 8.4 LTS (yếu JSON hơn) | NFR-05, NFR-06 | ✅ |
| ORM / data layer | **Prisma** | 6.x | DX tốt, migration rõ ràng, type-safe, hợp MVP nhanh; giao dịch nguyên tử cho lưu lead (FR-08) | Drizzle (nhẹ, SQL-first); TypeORM | NFR-06 | ✅ |
| i18n | **next-intl** | 3.x | Chuẩn cho App Router; routing `/en` `/vi` (khung `/my`); nội dung động đa ngữ từ DB; thiếu bản dịch → ẩn khối (BR-DYN-01) | next-i18next (cũ hơn); i18n routing gốc Next | NFR-05 | ✅ |
| Auth admin | **Auth.js v5 (NextAuth) — Credentials** + hash **argon2id** | Auth.js 5.x | 1 admin đăng nhập email/mật khẩu; Auth.js lo session cookie httpOnly + CSRF; argon2id ≥12 ký tự; session 30 phút; khóa 5 sai/15 phút | Session tự xây (JWT+argon2); Lucia (đã ngừng phát triển → loại) | NFR-03 | ✅ |
| Chống spam form | **Cloudflare Turnstile** + honeypot + rate-limit server-side | Turnstile (widget hiện hành) | Kiểm server-side ≤5 submit/IP/giờ + honeypot; không tin client | hCaptcha; reCAPTCHA v3 | NFR-09 | ✅ |
| Gửi email (lead → Sale) | **Nodemailer** qua **SMTP relay nội bộ Mytel** | Nodemailer 6.x | Q1: lead lưu DB + email báo Sale ≤1h; relay nội bộ (dữ liệu không ra ngoài); retry ≤3 | Email API (SES/SendGrid) nếu được dùng cloud | NFR-06 | ✅ (kèm fallback — xem Ràng buộc) |
| Hạ tầng/Triển khai (V11) | **Production: on-prem Docker Compose (Nginx + Postgres); UAT: Vercel; code cloud-agnostic** | Compose v2; `node:24-bookworm-slim`; `postgres:17` (prod); Vercel + Postgres managed/tạm (UAT) | **Prod on-prem** giữ lead PII thật nội bộ (PDPL); **UAT Vercel** để deploy nhanh anh Bryan xem sớm (dữ liệu giả, KHÔNG đổ lead PII thật); 1 codebase chạy cả 2 đích → **code cloud-agnostic** (`output:'standalone'`, không khóa cứng Vercel) | ~~Chỉ on-prem~~ (bỏ UAT nhanh); ~~chỉ Cloud+CDN~~ (loại vì prod cần PII nội bộ) | NFR-04, NFR-10 | ✅ **anh Bryan chốt 2026-09-04 (điều chỉnh V11 — delta GATE-2)** |
| Reverse proxy / TLS | **Nginx** (hoặc Caddy) | Nginx 1.27 (stable) | Chấm dứt TLS (HTTPS bắt buộc), phục vụ static/asset, đặt trước app Node; hardening | Caddy (auto-TLS, đơn giản hơn) | NFR-03, NFR-04 | ✅ |
| Cache | **ISR / cache tầng Next** (data cache + `revalidateTag`) | Theo Next 15 | Đạt TTFB P95<500ms + cache TTL khối động ≤60s; cập nhật khối ≤10 phút không deploy | Redis (chưa cần ở MVP; mở đường sau) | NFR-01 | ✅ |
| Mobile | **Không áp dụng** | — | Là web landing responsive (360px→desktop, NFR-08), không có app mobile riêng | — | NFR-08 | ✅ |
| Hàng đợi/Streaming | **Không áp dụng** | — | Không có xử lý bất đồng bộ quy mô; email gửi trực tiếp (fallback `email_status=failed` nếu relay lỗi) | Kafka/RabbitMQ (over-engineering) | — | ✅ |
| CSDL/kho phân tích | **Không áp dụng** | — | Không có nhu cầu analytics/warehouse ở MVP | — | — | ✅ |
| Quan sát (obs) | Log ứng dụng (JSON, `correlationId`, redact PII) + healthcheck + **audit log thao tác admin (FR-18)** | — | Đủ cho MVP; DevOps dựng monitoring ở B6 | ELK/Prometheus+Grafana (bổ sung sau) | NFR-03, NFR-04 | ✅ |

> **Backend Java — Không áp dụng:** dự án dùng Node/TypeScript (Next.js fullstack), không phải Java/Spring → bỏ mục "Chuẩn dự án backend Java".

## Ràng buộc & Rủi ro công nghệ
- **PDPL:** lead PII thật **chỉ nằm ở production on-prem** → lưu on-prem, truyền HTTPS (TLS ở Nginx), giới hạn quyền đọc lead (chỉ admin đã xác thực), consent log, có cơ chế xóa theo yêu cầu. Không đặt PII trên URL/log rõ. **UAT Vercel dùng dữ liệu giả — KHÔNG đổ lead PII thật.**
- **Ràng buộc build cloud-agnostic (bắt buộc từ B4 — hệ quả điều chỉnh V11):**
  - Next.js cấu hình **`output: 'standalone'`** (chạy được trong Docker on-prem lẫn Vercel).
  - **KHÔNG dùng primitive khóa cứng Vercel** (không edge-only runtime, không `@vercel/*` API) → giữ 1 codebase chạy cả 2 đích.
  - **Bọc email / lưu file / config qua interface** (dependency inversion): on-prem = SMTP relay nội bộ (Nodemailer); UAT Vercel = email-API hoặc **tắt gửi thật**. Lưu file/asset và đọc config cũng qua abstraction để không phụ thuộc filesystem cục bộ.
  - **DB Postgres 17** cho cả 2 đích: prod on-prem; UAT có thể Postgres managed/tạm (schema/migration Prisma dùng chung).
- **SMTP relay nội bộ (V12) — cần xác nhận vận hành:** thiết kế gửi email báo Sale kèm **fallback**: nếu chưa có/relay lỗi → lead **vẫn lưu DB an toàn** + gắn cờ `email_status=failed` để Admin thấy trong danh sách lead; không mất lead. Địa chỉ relay + hộp thư Sale đích: **[cần anh Bryan/DevOps cung cấp trước B4]**.
- **Turnstile:** phụ thuộc gọi dịch vụ Cloudflare từ server on-prem (outbound HTTPS). Nếu chính sách chặn outbound → fallback honeypot + rate-limit + kiểm heuristic server-side (đã có sẵn).
- **Auth.js v5:** vẫn đang hoàn thiện API v5; khóa version minor cụ thể khi scaffold (B3/B4) để tránh breaking.
- **Vendor lock-in:** thấp — mã cloud-agnostic (`output:'standalone'`, không khóa cứng Vercel); prod self-host on-prem; UAT chạy Vercel nhưng có thể rời bất kỳ lúc nào vì không dùng primitive độc quyền.
- **Dải port on-prem UAT/prod:** chưa cấp — DevOps hỏi anh Bryan trước khi deploy (PROJECT_STATE §Thông số môi trường).

---

## ✅ Checklist trước GATE-2
- [x] Mọi lựa chọn có Lý do bám NFR + ≥1 phương án thay thế đã cân nhắc.
- [x] Mọi dòng có VERSION cụ thể + đã được anh Bryan xác nhận (cột ✅).
- [x] Backend Java: **Không áp dụng** (ghi rõ lý do — stack Node/TS).
- [x] Cột NFR liên quan trỏ đúng **ID NFR-01..NFR-10 của SRS v0.1** (đã đối chiếu 2026-09-02).
- [x] Techstack khớp kiểu kiến trúc (modular monolith, 1 CSDL) ở HLD mục 1.
- [x] Ô không dùng ghi rõ "Không áp dụng" + lý do.
- [x] Nêu ràng buộc & rủi ro (PDPL, SMTP fallback, Turnstile outbound, lock-in).
- [x] Đã xóa khối hướng dẫn/ví dụ của template.
