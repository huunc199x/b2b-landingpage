# ĐỀ XUẤT KIẾN TRÚC (Brainstorm) — Landing B2B Mytel + Admin CMS-lite

| Phiên bản | v0.1 | Ngày | 2026-09-02 | Vai trò | Solution Architect | Trạng thái | ĐỀ XUẤT — chờ anh Bryan chốt (HITL Bước 0.5) |
|-----------|------|------|------------|---------|--------------------|-----------|---------------------------------------------|

> **Phạm vi tài liệu này:** brainstorm hướng kiến trúc + **bảng đề xuất version** để anh Bryan **xác nhận từng dòng**. **CHƯA phải HLD.** Theo HITL của kit (`solution-architect/SKILL.md` — Bước khởi đầu + Bước 0.5), chỉ khi anh Bryan chốt hướng và version mới viết `techstack.md` + `HLD.md`.
>
> **Cơ sở:** BRD v0.2 (đã có Admin CMS-lite + DB), `decisions.md` (GATE-1 APPROVED; Q7–Q10 đã chốt: Admin chỉ quản khối động · ẩn doanh thu · 1 admin · đăng thẳng), và bối cảnh anh Bryan chốt: **web app marketing = public landing + Admin CMS-lite + form lead → cần backend thật + DB + xác thực admin; KHÔNG microservices; public vẫn phải nhanh/SEO tốt.**

---

## 0. Đọc lại bối cảnh & điều đã đổi so với đánh giá SA trước

`eval-sa.md` kết luận "SSG tĩnh thuần + backend mỏng". **Kết luận đó nay KHÔNG còn đúng** vì BRD v0.2 thêm:
- **Admin CMS-lite** (đăng nhập, CRUD 3 loại khối động, đăng thẳng) → cần trang quản trị + **xác thực admin**.
- **DB thật** lưu: nội dung khối động (đa ngữ EN/VI, thứ tự, ẩn/hiện) + lead + tài khoản admin + log thao tác.
- **Public đọc DB** để render khối động → không thể build tĩnh 100% rồi quên; cần cơ chế cập nhật ≤ 10 phút không deploy (SC-09).

→ Đây là **web app có backend + DB**, nhưng **quy mô nhỏ, 1 miền nghiệp vụ, đọc-nhiều-ghi-ít, 1 admin**. Kiểu kiến trúc phù hợp là **monolith phân lớp / modular monolith** — **không** microservices (BRD §7 và anh Bryan đã chốt rõ).

**Đặc điểm định lượng (giả định để cân kiến trúc — cần anh Bryan xác nhận nếu sai):**
- Traffic: landing marketing, ước **< vài chục nghìn visit/tháng** giai đoạn đầu, peak thấp. Đọc >> ghi.
- Ghi: lead (vài chục–vài trăm/tháng) + thao tác admin (thưa). Không có giao dịch đồng thời cao.
- Dữ liệu: nhỏ (khối động vài chục bản ghi, lead tăng chậm). Không cần sharding/replica phức tạp ở MVP.

---

## 1. Ba phương án kiến trúc (đánh đổi)

### Phương án A (KHUYẾN NGHỊ) — Next.js fullstack monolith + PostgreSQL
Một app Next.js (App Router) làm **tất cả trong 1 codebase**:
- **Public**: SSR/ISR + on-demand revalidation cho landing + 18 trang chi tiết + khối động đọc từ DB.
- **API**: Route Handlers (`/api/...`) nhận form lead, phục vụ Admin.
- **Admin**: nhóm route `/admin/*` có xác thực (middleware) — CRUD khối động, xem lead.
- **DB**: PostgreSQL qua ORM (Prisma). Nội dung 18 dịch vụ giữ trong repo (Q7 đã chốt), khối động + lead + admin ở DB.

| Ưu điểm | Nhược điểm / Đánh đổi |
|---------|----------------------|
| **Ra MVP nhanh nhất** — 1 codebase, 1 pipeline, 1 đội, không hợp đồng API giữa 2 service | Public và Admin dùng chung runtime → cùng vòng đời deploy (chấp nhận được ở quy mô này) |
| **SEO/first-paint tốt** — SSR/ISR cho public, đúng nhu cầu landing marketing (Google index + OG share) | Cần kỷ luật tách lớp (module public/admin/lead) để không thành "big ball of mud" — dùng modular monolith |
| Chi phí vận hành thấp: 1 app container + 1 Postgres | Gắn với hệ sinh thái Node/JS (nếu đội mạnh Java/Spring hơn thì xem PA B) |
| i18n (next-intl), auth (Auth.js), ISR revalidate đều là giải pháp sẵn, ít tự chế | Nếu sau này tách miền lớn phải refactor (khả năng thấp với site marketing) |
| Đường mở rộng rõ: cần nữa thì tách Admin/API ra service riêng sau, DB giữ nguyên | |

### Phương án B — Tách Frontend (Next.js) + Backend API riêng (NestJS **hoặc** Spring Boot) + PostgreSQL/MySQL
FE Next.js (public + admin UI) gọi **API backend độc lập**; backend sở hữu DB, auth, business logic.

| Ưu điểm | Nhược điểm / Đánh đổi |
|---------|----------------------|
| Tách trách nhiệm rõ FE/BE; BE tái dùng cho app khác về sau | **Chậm hơn hẳn cho MVP** — 2 codebase, 2 pipeline, hợp đồng API, 2 lần deploy, CORS/auth cross-origin |
| **Hợp nếu đội backend mạnh Java/Spring** (kit có sẵn `backend-dev-java`, convention `mm.com.mytel.*`) | Overkill so với nhu cầu: 1 miền, 1 admin, đọc-nhiều — chưa xứng chi phí tách |
| Dễ đặt BE sau lớp bảo mật nội bộ Mytel (nếu chính sách yêu cầu) | Cần thêm giải pháp SSR nội dung động từ FE (gọi API lúc render) → phức tạp hơn A |
| Scale FE và BE độc lập | Vận hành nặng hơn: nhiều container, nhiều điểm hỏng |

> PA B chỉ đáng chọn nếu **(1)** đội chủ lực là Java/Spring, hoặc **(2)** chính sách Mytel bắt buộc backend nằm sau tầng bảo mật riêng, tách hẳn khỏi web tier. Nếu không, chi phí tách không được biện minh ở MVP.

### Phương án C — Public tĩnh (Astro/Next static) + Headless CMS nhẹ (Strapi/Directus) cho admin+DB
Public build gần tĩnh; **Strapi/Directus** cung cấp sẵn admin UI + DB + auth cho khối động & lead.

| Ưu điểm | Nhược điểm / Đánh đổi |
|---------|----------------------|
| Public cực nhanh/SEO tốt; **không phải tự code admin CRUD** (Strapi/Directus có sẵn) | Thêm **1 hạ tầng thứ 3** (CMS + DB của nó) → vận hành/nâng cấp/bảo mật CMS là gánh nặng mới |
| Marketing quen giao diện CMS chuẩn | BRD §Ngoài phạm vi **loại trừ "headless CMS thương mại/CMS phức tạp"**; đợt 1 muốn **CMS-lite tự xây tối giản** |
| Nhanh nếu chấp nhận đúng data-model của CMS | Ràng buộc "đăng thẳng, 3 loại khối, 1 admin, đa ngữ EN/VI" đơn giản đến mức **admin của CMS là thừa** |
| | Cập nhật ≤10 phút cần rebuild/ISR webhook từ CMS → thêm mắt xích; khó tùy biến brand cho admin |

> PA C giải quyết bài toán lớn hơn nhiều so với đề bài. Với **chỉ 3 loại khối + 1 admin + đăng thẳng**, tự xây CRUD trong PA A rẻ hơn và ít bề mặt vận hành hơn là nuôi một CMS.

---

## 2. KHUYẾN NGHỊ

**Chọn Phương án A — Next.js fullstack (App Router) dạng modular monolith + PostgreSQL.**

Lý do:
1. **Đúng quy mô & bản chất bài toán**: 1 miền nghiệp vụ nhỏ, đọc-nhiều-ghi-ít, 1 admin, đăng thẳng — monolith là lựa chọn rẻ và dễ vận hành nhất (khớp BRD §7 "không microservices").
2. **Thỏa đồng thời 2 mục tiêu xung khắc**: public cần SEO/first-paint nhanh (SSR/ISR) + admin cần backend/DB thật — Next.js App Router làm cả hai trong 1 app, không phải dựng 2 hệ.
3. **Nhanh ra MVP nhất** — yêu cầu số 1 của dự án. 1 codebase, 1 pipeline, ít điểm hỏng.
4. **Cập nhật ≤10 phút không deploy (SC-09)**: dùng **on-demand revalidation** — admin lưu khối → gọi `revalidateTag/revalidatePath` → public cập nhật ngay, vẫn giữ cache nhanh. (SSR thuần cũng đạt nếu chấp nhận render mỗi request.)
5. **Đường nâng cấp mở**: nếu sau này cần, tách `/admin` + API thành service riêng mà **không đổi DB**; hoặc bật thêm MY chỉ là thêm locale.

**Điều kiện đảo chiều sang PA B:** nếu anh Bryan xác nhận **đội chủ lực là Java/Spring** hoặc **chính sách bảo mật Mytel bắt buộc tách backend** — khi đó FE Next.js + BE Spring Boot. Đây là **câu hỏi cần chốt** (xem §5).

---

## 3. BẢNG ĐỀ XUẤT VERSION (Bước 0.5 — anh Bryan xác nhận TỪNG DÒNG)

> Ký hiệu: ⚠️ = **cần anh Bryan xác nhận** trước khi ghi vào `techstack.md`. Version tính theo mốc **2026-09-02** (ưu tiên LTS/ổn định, tránh EOL). Đổi version sau GATE-2 = Change Request.

| # | Thành phần | Version đề xuất | Lý do (LTS/EOL, phổ biến, hợp đội) | Phương án thay thế | Trạng thái |
|---|-----------|-----------------|-------------------------------------|--------------------|-----------|
| V1 | **Ngôn ngữ** | **TypeScript 5.x** (bản ổn định mới nhất) | Type-safe cho cả FE/BE trong 1 codebase; chuẩn de-facto của hệ Next.js; giảm bug runtime | JavaScript thuần (không khuyến nghị — mất type an toàn) | ⚠️ |
| V2 | **Runtime** | **Node.js 24 LTS** ("Krypton", active LTS) | LTS hiện hành, hỗ trợ dài tới ~2028; nếu đội đang chạy 22 thì giữ **Node 22 LTS** (vẫn trong hạn bảo trì) | Node 22 LTS (an toàn nếu đội đã chuẩn hóa) | ⚠️ |
| V3 | **Framework FE+API** | **Next.js 15.x (App Router)** | Dòng ổn định, App Router chín, SSR/ISR + Route Handlers + on-demand revalidate đủ cho cả public lẫn admin | Next.js 16 (nếu đội muốn mới nhất — cần kiểm breaking); Remix; Nuxt (nếu chọn Vue) | ⚠️ |
| V4 | **UI runtime** | **React 19** (đi kèm Next 15) | Bản React mà Next 15 dùng; server components giảm JS client | — (gắn theo Next) | Theo V3 |
| V5 | **Framework BE riêng** (chỉ nếu chọn PA B) | **NestJS 11** (Node) **hoặc** **Spring Boot 3.5 + Java 21 LTS** | NestJS nếu giữ hệ Node; Spring Boot nếu đội mạnh Java (convention Mytel `mm.com.mytel.*`, Maven) | Express thuần (quá mỏng cho admin) | ⚠️ (chỉ khi PA B) |
| V6 | **CSDL** | **PostgreSQL 17** | Bản rất ổn định, JSON/JSONB tốt cho nội dung đa ngữ, mã nguồn mở, phổ biến | PostgreSQL 18 (mới hơn); **MySQL 8.4 LTS** nếu Mytel chuẩn hóa MySQL | ⚠️ |
| V7 | **ORM / data layer** | **Prisma 6.x** | DX tốt nhất, migration rõ ràng, type-safe, hợp MVP nhanh | Drizzle ORM (nhẹ, SQL-first) nếu muốn sát SQL; TypeORM (nếu PA B/NestJS) | ⚠️ |
| V8 | **i18n** | **next-intl 3.x** (routing `/en` `/vi`, khung sẵn `/my`) | Chuẩn cho App Router, tách message theo locale, hỗ trợ khối động đa ngữ từ DB | next-i18next (cũ hơn); i18n routing gốc của Next | ⚠️ |
| V9 | **Auth admin** | **Auth.js v5 (NextAuth) — Credentials provider** + hash mật khẩu **argon2id** (hoặc bcrypt) | 1 admin, đăng nhập email/mật khẩu; Auth.js lo session cookie httpOnly + CSRF; argon2id chuẩn hash hiện đại | Session tự xây (JWT/cookie + argon2) — đơn giản vì chỉ 1 admin; Lucia đã ngừng phát triển → tránh | ⚠️ |
| V10 | **Chống spam form** | **Cloudflare Turnstile** + honeypot + rate-limit server-side | Nhẹ, thân thiện, không CAPTCHA phiền; kiểm ở server (không tin client) | hCaptcha; reCAPTCHA v3 | ⚠️ (phụ thuộc hosting/được dùng dịch vụ ngoài) |
| V11 | **Hosting / triển khai** | **Docker Compose on-prem** (app Node + PostgreSQL + reverse proxy Nginx/Caddy) + CDN/cache tĩnh trước | Mặc định an toàn cho telco (dữ liệu lead/PDPL nằm nội bộ Mytel); DevOps của kit dùng docker-compose | **Cloud + CDN** (Vercel + managed Postgres như Neon/Supabase) — nhanh nhất nhưng dữ liệu ra ngoài | ⚠️ **QUAN TRỌNG NHẤT** |
| V12 | **Gửi email báo Sale** (lead) | SMTP relay nội bộ Mytel (nếu có) qua Nodemailer | Q1 mặc định: lead lưu DB + email báo Sale; cần điểm gửi mail | Dịch vụ email API (SES/SendGrid) nếu được dùng cloud | ⚠️ |
| V13 | **Base image Docker** | `node:24-bookworm-slim` (hoặc `-alpine`) + `postgres:17` | Khớp V2/V6; slim giảm bề mặt tấn công | Theo version chốt ở V2/V6 | Theo V2/V6 |

> **Dòng chốt trước nhất (khóa các dòng khác):** **V11 (hosting on-prem vs cloud)** và **câu hỏi đội Node vs Java (§5)** — hai điều này quyết định phần lớn bảng trên. Đề nghị anh Bryan trả lời 2 điểm này đầu tiên.

---

## 4. Ước lượng lại effort MVP (sau khi thêm Admin + DB)

> S = nhỏ (~1–3 ngày-người), M = vừa (~1 tuần), L = lớn (~2 tuần+). Tổng đã tăng so với eval trước (từ ~M lên **L**) do thêm Admin + DB + auth + bảo mật.

| Khối | Effort | Ghi chú |
|------|--------|---------|
| Setup dự án + design system (token cam/kem, typo) + DB schema + ORM + migration | **M** | Thêm DB/ORM so với bản tĩnh trước |
| Public site: landing + sections (Hero/Why/Coverage/Capabilities/Register) + scroll-reveal | **M** | Bám style tham chiếu; animation nhẹ |
| 18 trang chi tiết dịch vụ (1 template, data từ repo — Q7) | **M** | Nội dung trong repo, không qua Admin → không tăng DB |
| Khối động public đọc DB + on-demand revalidate (SC-09 ≤10 phút) | **M** | Mắt xích mới: cache + revalidate |
| Form lead + DB + consent PDPL + chống spam + email báo Sale | **M** | Lưu DB thật thay vì backend mỏng |
| **Admin CMS-lite: auth + CRUD 3 loại khối (đa ngữ, thứ tự, ẩn/hiện) + xem lead + log** | **L** | **Khối tăng phạm vi lớn nhất** (R6/R7) |
| i18n EN + VI (khung sẵn MY) | **M** | Chủ yếu chờ bản dịch VI; kỹ thuật đã có next-intl |
| Bảo mật admin (chống brute-force, log thao tác, hardening) + chuẩn bị rà B5 | **S–M** | Bắt buộc vì admin là bề mặt tấn công |
| **Tổng MVP (EN+VI, có Admin+DB)** | **≈ L** | Ra được nếu nội dung/asset/bản dịch sẵn sàng |

---

## 5. Rủi ro kỹ thuật + Câu hỏi cần anh Bryan quyết

### 5.1 Rủi ro kỹ thuật
| # | Rủi ro | Mức | Giảm thiểu |
|---|--------|-----|-----------|
| TR1 | **Admin là bề mặt tấn công** (chiếm quyền → sửa public/lộ lead) | **Cao** | Auth.js/session chuẩn + argon2id + rate-limit đăng nhập + log thao tác + đưa vào rà bảo mật B5 (kế thừa R7 BRD) |
| TR2 | **Hosting chưa chốt (on-prem vs cloud)** làm lệch cả techstack | **Cao** | Chốt V11 sớm; on-prem thì cần DevOps dựng Postgres + reverse proxy + backup lead (PDPL) |
| TR3 | Yêu cầu **cập nhật ≤10 phút không deploy** vs cache ISR | Trung bình | On-demand revalidation khi admin lưu; fallback SSR thuần nếu cần đơn giản |
| TR4 | **PDPL**: lead là PII → lưu/truyền/xóa an toàn | **Cao** | HTTPS, mã hóa at-rest (nếu on-prem: disk/column), giới hạn quyền đọc lead, consent log, cơ chế xóa theo yêu cầu |
| TR5 | **Đội Node vs Java** chưa rõ → chọn nhầm stack | Trung bình | Chốt §5.2 câu 1; nếu Java-mạnh → PA B + Spring Boot |
| TR6 | Nội dung/bản dịch/asset trễ (kế thừa R1/R3 BRD) | **Cao** | Placeholder + bật VI khi có bản dịch duyệt; đây là rủi ro nội dung, không phải code |
| TR7 | Monolith = 1 điểm hỏng cho cả public + admin | Thấp | Chấp nhận ở MVP; healthcheck + backup DB; tách sau nếu cần |

### 5.2 Câu hỏi cần anh Bryan quyết (HITL)
1. **⚠️ Hosting:** triển khai **on-prem Docker (hạ tầng Mytel)** hay **cloud + CDN**? (quyết định lớn nhất — ảnh hưởng V10–V13, bảo mật lead, DevOps).
2. **⚠️ Năng lực đội:** đội chủ lực là **Node/JS/Next.js** (→ PA A) hay **Java/Spring** (→ cân nhắc PA B, Spring Boot backend)?
3. **⚠️ CSDL chuẩn của Mytel:** **PostgreSQL** (đề xuất) hay Mytel chuẩn hóa **MySQL/Oracle** khác?
4. **⚠️ Điểm gửi email báo Sale:** có **SMTP relay nội bộ** dùng được không (Q1 mặc định lead → DB + email Sale)?
5. **⚠️ Xác nhận các dòng version** ở §3 (đặc biệt V1–V3, V6, V9, V11).
6. Xác nhận **hướng kiến trúc = PA A (Next.js fullstack monolith)** để chuyển sang viết `techstack.md` + HLD.

---

## 6. Giả định đã nêu (không hỏi lại — chờ anh Bryan đính chính nếu sai)
- Traffic/khối lượng nhỏ như §0 → monolith đủ; không cần HA phức tạp ở MVP.
- Nội dung 18 dịch vụ giữ trong repo (Q7 đã chốt); Admin chỉ quản 3 loại khối động.
- Đăng thẳng, 1 admin (Q9/Q10) → phân quyền tối giản, không cần workflow duyệt.
- MVP EN+VI; MY chỉ chuẩn bị khung (không làm nội dung).
- Mặc định ưu tiên on-prem Docker cho dữ liệu lead (PDPL) — **nhưng chờ anh Bryan chốt V11**.

> **Bước tiếp theo (chờ chốt):** anh Bryan xác nhận hướng PA A + trả lời §5.2 → SA viết `docs/sa/techstack.md` (ghi version đã duyệt) + `docs/sa/HLD.md` + `architecture.html`, rồi PO trình **GATE-2**. **SA không tự sang bước viết HLD khi chưa được chốt.**
