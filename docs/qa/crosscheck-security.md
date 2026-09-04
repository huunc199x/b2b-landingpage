# Crosscheck Security — Secure-coding B4 (trước GATE-4)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Vai | Security Engineer (phòng thủ) | Commit | 4447a11 |
|-----------|------|------|------------|-----|-------------------------------|--------|---------|

> **Phạm vi:** kiểm chéo **secure-coding** (rà mã, KHÔNG sửa code) trên handover Làn 0+1. Đây là **secure-coding gate của GATE-4**, KHÔNG phải pentest đầy đủ (B5). Căn cứ đối chiếu: `security-engineer/references/secure-coding-index.md` → **ST.TIM.ITC.16** (Web Application Security Standards, nền Next.js). PII/PDPL theo HLD §10 / LLD §1.5 / NFR-04.
> **Nguyên tắc gate:** High/Critical **khai thác được trên đường chạy thật** = CẦN SỬA. KHÔNG tạo mã khai thác. KHÔNG tự phê duyệt cổng — kết luận trình PO.
> Nguồn rà: `src/` (POST /api/leads, auth/lockout, admin routes, adapter email, middleware, logger/env), `next.config.ts`, `.env.example`, `.gitignore`, `prisma/seed.ts`, `npm audit`.

---

## 1. Kết luận nhanh

**ĐẠT — CÓ ĐIỀU KIỆN** (conditional pass). Nền secure-coding vững: không có lỗ hổng **High/Critical khai thác được trên đường chạy thật** ở tầng mã. Còn **2 finding Medium** (hardening/cấu hình, phụ thuộc Nginx/DevOps) + vài Low/Info cần khắc phục/ghi nhận trước prod. `npm audit` (1 critical / 8 high) **không có mục nào khai thác được trên runtime path** trong cách dùng hiện tại (chi tiết §4).

| Mức | Số finding |
|-----|:----------:|
| Critical | 0 |
| High | 0 |
| Medium | 2 (SEC-01, SEC-02) |
| Low | 4 (SEC-03..06) |
| Info | 2 (SEC-07..08) |

Điều kiện đóng gate (chuyển B5/DevOps): SEC-01, SEC-02 và nâng nodemailer (runtime dep) — xác minh lại trên môi trường thật (Nginx/TLS) ở B5 pentest + Security UAT (B6).

---

## 2. Đối chiếu checklist secure-coding nền Web (ST.TIM.ITC.16)

| Hạng mục | Kết quả | Ghi chú (vị trí mã) |
|----------|:-------:|---------------------|
| **Validate đầu vào server-side** | ĐẠT | `modules/lead/validation.ts` (regex email/phone, độ dài, enum slug), `admin-content/validation.ts` (3 loại khối, STAT_VALUE_RE, link http/https). Route không tin client. |
| **Chống injection (Prisma param)** | ĐẠT | 100% truy vấn qua Prisma Client tham số hoá; **không** `$queryRawUnsafe`/raw SQL người dùng (grep sạch). |
| **XSS output encoding** | ĐẠT | Không `dangerouslySetInnerHTML`/`innerHTML`/`eval` (grep sạch); React auto-escape. Khối động render qua JSX. Xem SEC-06 (URL ảnh). |
| **CSRF** | ĐẠT (có lưu ý) | Auth.js lo CSRF form login; cookie **SameSite=Lax** chặn CSRF cross-site cho POST/PATCH/DELETE. Thiếu kiểm Origin/Referer như LLD §6.2 hứa → **SEC-04 (Low)**. |
| **Rate-limit / honeypot / Turnstile** | ĐẠT (có lưu ý) | `lib/rateLimit.ts` (sliding 60'/5), honeypot `website` → 200 giả, `lib/turnstile.ts` verify server. Nguồn IP spoofable → **SEC-01**; Turnstile fail-open → **SEC-03**. |
| **Session / cookie httpOnly** | ĐẠT | Auth.js JWT, `httpOnly + Secure + SameSite=Lax` (mặc định), `maxAge=30'` (`auth/config.ts`). Stateless, không lộ token client. |
| **Phân quyền `/admin` (không IDOR)** | ĐẠT | `middleware.ts` chặn `/{locale}/admin/*` (redirect) + `/api/admin/*` (401) **và** `requireAdmin()` defense-in-depth mọi route admin. 1 vai `admin`, 1 tài khoản → truy cập lead/khối theo id **không phải IDOR** (single-tenant, mọi admin được xem mọi lead theo thiết kế FR-11). |
| **argon2id + chính sách mật khẩu** | ĐẠT | `@node-rs/argon2` (default argon2id); `verify()` khi login; seed enforce **≥12 ký tự** (NFR-03) + hash lúc seed, không lưu thô. |
| **Không lộ secret (grep .env/hardcode)** | ĐẠT | Secret đọc qua `lib/env.ts` (fail-fast); `.env` trong `.gitignore`; `.env.example` chỉ placeholder `CHANGE_ME`; không hardcode key/token trong `src/`. |
| **Header bảo mật HTTP** | **CẦN SỬA** | `next.config.ts` chỉ `poweredByHeader:false`; **thiếu** CSP, X-Frame-Options/frame-ancestors, X-Content-Type-Options, Referrer-Policy (HSTS kỳ vọng ở Nginx) → **SEC-02 (Medium)**. |
| **Thông báo lỗi không lộ nội bộ** | ĐẠT | Envelope mã canonical (`lib/errors.ts`); non-AppError → `SYS-500` chung; login trả **AUTH-001 chung** (không lộ email tồn tại); chi tiết lỗi chỉ ở log server. |
| **Brute-force / lockout** | ĐẠT | `admin-auth/lockout.ts` khóa 5 sai/15' (thuần, có test); audit `auth.login/login_failed/locked`. |
| **Audit log (FR-18)** | ĐẠT | `lib/audit.ts` append-only, **không ghi PII/mật khẩu** (chỉ entity_id + metadata); nuốt lỗi để không hỏng nghiệp vụ chính. |

---

## 3. PII / PDPL (lead) — NFR-04

| Hạng mục | Kết quả | Ghi chú |
|----------|:-------:|---------|
| Consent bắt buộc trước khi lưu | ĐẠT | Pipeline: `decideLead` trả `LEAD-010` nếu consent≠true → **không** persist. `lead_consent` ghi trong **cùng transaction** với `lead` (`modules/lead/service.ts`), bất biến (version + IP + UA). |
| Không log PII | ĐẠT | `lib/logger.ts` redact `email/phone/contactname/companyname/message/password*/ip/useragent`. `logger.info('lead.created')` chỉ ghi `entityId + service`. |
| Không PII trên URL | ĐẠT | Đọc lead theo `id` (ULID) path param; danh sách/lọc không nhét PII vào query. |
| HTTPS-only | ĐẠT (thiết kế) | TLS tại Nginx (prod), cookie `Secure`. HSTS → cần cấu hình Nginx (gộp SEC-02). |
| UAT dữ liệu giả, chỉ prod PII thật | ĐẠT (thiết kế) | ADR-09: `EMAIL_TRANSPORT=noop` ở UAT, không đổ lead PII thật. Cần DevOps thực thi ở B6. |
| Bằng chứng consent bất biến (hash) | **Thiếu một phần** | `consentTextHash` (LLD §1.5, SHA-256 nội dung consent) **không được ghi** khi tạo consent (chỉ version/ip/UA) → **SEC-05 (Low)**. |

---

## 4. `npm audit` — phân loại runtime vs dev-only

Tổng: **14 lỗ hổng (1 critical / 8 high / 5 moderate)**, tất cả **transitive/tooling**. Phân loại theo có nằm trên **đường chạy prod** và **khai thác được trong cách dùng hiện tại** hay không:

### 4.1 KHÔNG trên đường chạy thật (build/dev-only) — không ảnh hưởng prod

| Gói | Mức | Bản chất | Vì sao không ảnh hưởng runtime |
|-----|:---:|----------|--------------------------------|
| **vitest** | **critical (9.8)** | Vitest UI server đọc/chạy file tùy ý (GHSA-5xrq-8626-4rwp) | `devDependencies`; chỉ chạy khi test cục bộ, UI server phải bật thủ công; **không** có trong `output:'standalone'` prod. |
| vite / vite-node / esbuild / @vitest/mocker | high/moderate | Path traversal `.map`, dev-server request | Transitive dưới vitest — dev/test-only. |
| **prisma** + **@prisma/config** + **deepmerge-ts** | **high** | deepmerge-ts stack exhaustion khi merge đồ thị đệ quy (GHSA-ggr8-5vv4-36mx) | Prisma **CLI** (migrate/generate) = build/dev tooling. `@prisma/client` (runtime) **không** dính advisory. |
| **postcss** (→ next) | **high (7.5)** | Đọc file `.map` / XSS `</style>` khi xử lý CSS attacker-controlled (GHSA-r28c, GHSA-qx2v) | PostCSS chạy **lúc build** CSS của dự án; app **không** xử lý CSS do người dùng cấp → vector không tới runtime. |
| **next** (→ postcss) | moderate | Kế thừa postcss | Build-time. |

### 4.2 CÓ trên đường chạy thật — nhưng vector High KHÔNG khai thác được trong usage hiện tại

| Gói | Mức | Advisory | Đánh giá khai thác thực tế |
|-----|:---:|----------|----------------------------|
| **nodemailer** (+ chuỗi `@auth/core`→`next-auth`) | **high (7.1)** | SSRF/đọc file tùy ý qua `raw`/attachment (GHSA-p6gq); CRLF header-injection qua transport name / List-* (moderate) | Trên đường gửi mail lead (`lib/email/smtp.ts` + `modules/lead/mailer.ts`). **Không khai thác được:** app chỉ dùng `to/from/subject/text`, **không** `raw`/attachment/`url`; người nhận (`LEAD_NOTIFY_TO/FROM`) **cố định từ ENV** (không do người dùng); không set header List-*/transport name theo input. Dữ liệu lead chỉ vào **body text** (server-compose), không vào header/envelope. → Vector High **không tới được**, nhưng nodemailer **vẫn là runtime dep** cần vá. |
| **next-intl** | moderate | Open redirect (GHSA-8f24-v5vv-gm5j); prototype pollution qua `experimental.messages.precompile` (không dùng) | Trên đường routing/redirect middleware. Open-redirect mức moderate; prototype-pollution cần feature không bật. Nâng khi tiện. |

### 4.3 Đề xuất xử lý (cho B5/DevOps — KHÔNG sửa ở B4)

1. **Ưu tiên có bản vá non-major** (`fixAvailable:true`): `prisma`/`@prisma/config`/`deepmerge-ts` → `npm audit fix` hoặc `overrides` lên bản đã vá. Không phá vỡ.
2. **vitest (critical, dev-only):** nâng ≥`3.2.6` (advisory `<3.2.6`) hoặc `overrides` — không cần nhảy `5.0` major nếu chỉ vá critical. Chỉ ảnh hưởng test.
3. **nodemailer (runtime):** nâng ≥`9.1.1` (semver-major) **kèm kiểm thử gửi mail** ở UAT. Usage đơn giản (to/from/subject/text) → rủi ro hồi quy thấp. **Bắt buộc trước prod.**
4. **next / next-intl / postcss:** theo lộ trình nâng **Next major** ở B5 (build-time, ưu tiên sau nodemailer). Trước mắt open-redirect next-intl: đảm bảo redirect chỉ tới path nội bộ.

**Kết luận npm audit:** không có mục **High/Critical khai thác được trên runtime path** ⇒ **không** tự động biến gate thành CẦN SỬA. nodemailer là điều kiện nâng trước prod (B5/DevOps).

---

## 5. Findings chi tiết

### SEC-01 (Medium) — Nguồn IP tin cậy leftmost X-Forwarded-For → rate-limit & consent-IP có thể bị giả mạo
- **Chuẩn:** ST.TIM.ITC.16 (kiểm soát lạm dụng / access control) + NFR-04 (bằng chứng consent) + NFR-09.
- **Mô tả:** `lib/correlation.ts#clientIpFromHeaders` lấy **IP trái nhất** của `X-Forwarded-For`. Nếu Nginx cấu hình **append** (`proxy_add_x_forwarded_for` mặc định) thay vì **ghi đè**, IP trái nhất là **do client gửi** → attacker đặt `X-Forwarded-For: <ngẫu nhiên>` để **vượt rate-limit 5/IP** (NFR-09, trần chống spam chính) và **làm sai IP** ghi vào `lead_consent.ip` (bằng chứng PDPL).
- **Khắc phục (DevOps/B5):** cấu hình Nginx `proxy_set_header X-Forwarded-For $remote_addr;` (ghi đè) **hoặc** dùng số hop proxy tin cậy để lấy IP đúng; xác minh trên UAT/prod. Rà lại `clientIpFromHeaders` khi số proxy > 1.

### SEC-02 (Medium) — Thiếu security header HTTP ở tầng app
- **Chuẩn:** ST.TIM.ITC.16 (cấu hình/hardening).
- **Mô tả:** `next.config.ts` không khai `headers()`. Thiếu: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`/CSP `frame-ancestors` (chống clickjacking, đặc biệt trang `/admin`), `Referrer-Policy`, CSP cơ bản; HSTS kỳ vọng ở Nginx nhưng chưa xác nhận.
- **Khắc phục:** thêm `async headers()` trong `next.config.ts` (nosniff, frame-ancestors 'none', referrer-policy, CSP tối thiểu) **hoặc** đặt tại Nginx (đồng bộ cả hai đích on-prem/UAT). HSTS bật ở Nginx prod.

### SEC-03 (Low) — Turnstile fail-open khi timeout/lỗi mạng
- **Chuẩn:** ST.TIM.ITC.16 (chống tự động hoá) — chấp nhận theo HLD ADR-05.
- **Mô tả:** `lib/turnstile.ts` khi verify timeout/throw → `mode:'degraded', ok:true` (cho đi tiếp). Attacker ép verify lỗi có thể bỏ qua Turnstile; còn honeypot + rate-limit đỡ (nhưng rate-limit lại chịu SEC-01).
- **Khắc phục:** giữ quyết định fail-open (không chặn khách vì lỗi bên thứ ba) nhưng **giám sát tỉ lệ `mode=degraded`** + cảnh báo; cân nhắc siết rate-limit khi degraded kéo dài.

### SEC-04 (Low) — Admin mutation API chưa kiểm Origin/Referer (LLD §6.2 hứa)
- **Chuẩn:** ST.TIM.ITC.16 (CSRF).
- **Mô tả:** Bảo vệ CSRF hiện dựa **SameSite=Lax** (đủ chặn cross-site POST/PATCH/DELETE). LLD §6.2 nêu "kiểm origin" nhưng chưa hiện thực → thiếu defense-in-depth.
- **Khắc phục:** thêm kiểm `Origin`/`Referer` khớp host cho route `/api/admin/*` mutation (hoặc CSRF token).

### SEC-05 (Low) — `consentTextHash` (bằng chứng PDPL) không được ghi
- **Chuẩn:** NFR-04 / LLD §1.5.
- **Mô tả:** `service.ts` tạo `lead_consent` chỉ set `given/consentTextVersion/ip/userAgent`, **bỏ trống `consentTextHash`** (SHA-256 nội dung consent) → bằng chứng bất biến chưa đầy đủ.
- **Khắc phục:** khi có nội dung consent (AS-07), tính hash lúc submit và lưu `consentTextHash`.

### SEC-06 (Low) — `payload.logoUrl` / `imageUrl` không kiểm scheme URL
- **Chuẩn:** ST.TIM.ITC.16 (validate đầu vào).
- **Mô tả:** `admin-content/validation.ts` kiểm `payload.link` (http/https) nhưng **không** kiểm `logoUrl`/`imageUrl` (chỉ bắt buộc non-empty với logoUrl). Rủi ro thấp: admin-trusted, render `<img src>` (`javascript:` inert). Nên validate scheme cho nhất quán.
- **Khắc phục:** áp `LINK_RE` (http/https) cho `logoUrl`/`imageUrl`.

### SEC-07 (Info) — POST /api/leads không giới hạn kích thước body tường minh
- **Mô tả:** `message` chỉ kiểm ≤1000 **sau** khi parse JSON; body tổng chưa giới hạn trước parse (DoS nhẹ). Next có default. Đề xuất `client_max_body_size` ở Nginx.

### SEC-08 (Info) — Rate-limit in-memory 1 node (đã ghi handover §5)
- **Mô tả:** `rateLimit.ts` in-memory; đa instance/serverless (UAT Vercel) → không dùng chung, giảm hiệu lực. Cần Redis khi scale (SA/DevOps quyết) — đã nêu trong handover, ghi lại để B5/B6 theo dõi.

---

## 6. Điều kiện đóng gate (chuyển B5 / DevOps)

1. **SEC-01** — cấu hình/kiểm chứng Nginx XFF (ghi đè) trước khi tin IP cho rate-limit + consent. **(bắt buộc trước prod)**
2. **SEC-02** — bổ sung security header (app hoặc Nginx) + HSTS prod. **(bắt buộc trước prod)**
3. **npm audit** — nâng **nodemailer ≥9.1.1** (runtime) + vá non-major prisma/deepmerge-ts; vitest (dev) vá critical. **(nodemailer bắt buộc trước prod)**
4. SEC-03..07 — khắc phục/ghi nhận rủi ro; xác minh ở **B5 pentest** + **Security UAT (B6)** trên môi trường thật (Nginx/TLS, Turnstile bật, DB thật).

> **Không tự phê duyệt cổng.** Kết luận **ĐẠT có điều kiện** này trình **PO** quyết GATE-4; PO gộp vào handover-report (Phần 2). Pentest đầy đủ + verify fix High/Critical thực hiện ở **B5**.
