# Checklist deploy UAT/preview lên Vercel — Mytel B2B Landing

> **Người thực hiện:** anh Bryan (không cần rành kỹ thuật vẫn làm được — làm theo từng bước).
> **Vai trò chuẩn bị:** DevOps (nhánh `feature/scaffold-foundation`).
>
> ⚠️ **ĐÂY LÀ MÔI TRƯỜNG UAT / PREVIEW — DÙNG DỮ LIỆU GIẢ.**
> - **KHÔNG nhập lead PII thật** (tên/điện thoại/email/công ty thật của khách) — PDPL.
> - Lead PII thật **chỉ** được đổ vào **production on-prem** (Docker, sau **GATE-5**).
> - Bản này để anh Bryan **xem giao diện + luồng sớm**, KHÔNG phải production.
> - Email để chế độ **noop** (không gửi thật). Con số/nội dung khối động là **demo**.

---

## 0. Tổng quan (đọc 1 phút)

Ứng dụng là 1 codebase Next.js 15 chạy được cả **Docker on-prem** lẫn **Vercel** (cloud-agnostic).
Trên Vercel ta cần 3 thứ:

1. **Code** (đưa lên GitHub hoặc đẩy bằng Vercel CLI).
2. **1 database PostgreSQL** (miễn phí — Neon / Supabase / Vercel Postgres).
3. **Các biến môi trường** (ENV) dán vào project Vercel.

Khi Deploy, Vercel tự chạy (đã cấu hình sẵn trong `vercel.json`):

```
prisma migrate deploy   → tạo bảng trong DB
npm run db:seed         → tạo admin demo + khối nội dung demo
npm run build           → build trang
```

→ Anh Bryan **không phải gõ lệnh tạo bảng hay seed thủ công** — chỉ cần dán ENV đúng rồi bấm Deploy.

---

## A. Đưa code lên (chọn 1 trong 2 cách)

### Cách 1 — Qua GitHub (khuyến nghị, dễ theo dõi) ✅
1. Tạo 1 repo trên GitHub (Private): https://github.com/new → đặt tên vd `mytel-b2b-landing`.
2. Trong thư mục dự án `D:\projects\b2b`, đẩy nhánh lên:
   ```bash
   git push -u origin feature/scaffold-foundation
   ```
   (Nếu chưa gắn remote: `git remote add origin https://github.com/<tài-khoản>/mytel-b2b-landing.git` rồi push.)
3. Xong — sang mục **B** để Vercel kết nối repo này.

### Cách 2 — Qua Vercel CLI (không cần GitHub)
1. Cài CLI: `npm i -g vercel`
2. Đăng nhập: `vercel login`
3. Trong `D:\projects\b2b` chạy `vercel` (deploy preview) — trả lời các câu hỏi (link project mới).
   Sau khi thêm ENV (mục D) chạy lại `vercel` để deploy lại.

---

## B. Tạo project trên Vercel + kết nối repo

1. Vào https://vercel.com → **Add New… → Project**.
2. **Import** repo GitHub vừa tạo (Cách 1) — hoặc bỏ qua nếu dùng CLI (Cách 2).
3. Framework Vercel tự nhận **Next.js**. **KHÔNG cần đổi Build Command** (đã có `vercel.json` lo).
4. Khoan bấm **Deploy** — làm mục **C** (tạo DB) và **D** (dán ENV) trước.

---

## C. Tạo PostgreSQL cho UAT (miễn phí) + lấy connection string

Chọn 1 nhà cung cấp. **Neon** đơn giản nhất cho người mới.

### Neon (khuyến nghị)
1. Vào https://neon.tech → đăng ký (đăng nhập bằng GitHub).
2. **Create Project** → chọn **PostgreSQL 17**, region gần (Singapore).
3. Sau khi tạo, mục **Connection string** → copy chuỗi dạng:
   ```
   postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
   ```
4. ⚠️ **Dùng chuỗi kết nối TRỰC TIẾP (không có chữ `-pooler`)** để `prisma migrate deploy` chạy được.
   (Neon: bỏ tick "Pooled connection" khi copy. Với UAT tải nhẹ, dùng chuỗi trực tiếp cho cả app là ổn.)

### (Thay thế) Vercel Postgres
- Trong project Vercel → tab **Storage → Create Database → Postgres** → Vercel tự thêm biến `DATABASE_URL`. Vẫn cần các biến ENV còn lại ở mục D.

### (Thay thế) Supabase
- https://supabase.com → New project → **Settings → Database → Connection string**.
- Migrate: dùng chuỗi **"Direct connection" (cổng 5432)**, KHÔNG dùng cổng pooler 6543 cho `DATABASE_URL`.

---

## D. Dán biến môi trường (ENV) vào Vercel

Trong project Vercel → **Settings → Environment Variables** → thêm từng biến dưới đây
(chọn scope **Production** + **Preview** cho đủ). Với Vercel CLI: `vercel env add <TÊN>`.

| Biến | Bắt buộc | Giá trị mẫu / Ý nghĩa (UAT) |
|------|:--------:|------------------------------|
| `DATABASE_URL` | ✓ | Chuỗi kết nối Postgres ở mục C (Neon/Supabase/Vercel). **Chuỗi trực tiếp, `sslmode=require`.** |
| `AUTH_SECRET` | ✓ | Chuỗi bí mật Auth.js. Sinh: `openssl rand -base64 32` (hoặc https://generate-secret.vercel.app/32). |
| `AUTH_TRUST_HOST` | ✓ | `true` (để Auth.js tin domain Vercel). |
| `AUTH_URL` | nên có | URL deploy, vd `https://mytel-b2b.vercel.app`. Chưa biết trước → deploy lần 1, copy URL, dán lại rồi redeploy. |
| `SEED_ADMIN_EMAIL` | ✓ | Email admin demo, vd `admin@mytel.example`. |
| `SEED_ADMIN_PASSWORD` | ✓ | Mật khẩu admin demo **≥ 12 ký tự**, vd `UatDemo!2026x`. (Đây là tài khoản demo — KHÔNG dùng mật khẩu thật.) |
| `SEED_DEMO_BLOCKS` | ✓ (UAT) | `true` → seed khối nội dung demo (Highlight/Đối tác/Con số) để trang có nội dung. |
| `EMAIL_TRANSPORT` | ✓ (UAT) | `noop` → **KHÔNG gửi email thật** (UAT không cần relay, tránh lộ dữ liệu). |
| `STORAGE_DRIVER` | — | `noop` (UAT không ghi file cục bộ; Vercel filesystem chỉ đọc). |
| `TURNSTILE_SITE_KEY` | — | **Để trống** → form tự chuyển sang honeypot + rate-limit. (Muốn thử widget: dùng khóa test `1x00000000000000000000AA`.) |
| `TURNSTILE_SECRET_KEY` | — | **Để trống**. (Khóa test luôn-pass: `1x0000000000000000000000000000000AA`.) |
| `CONSENT_TEXT_VERSION` | — | `v1` (mặc định). |
| `NEXT_PUBLIC_DISPLAY_TZ` | — | `Asia/Yangon` (mặc định). |

> **KHÔNG cần** ở UAT (chỉ dùng khi `EMAIL_TRANSPORT=smtp` ở on-prem): `SMTP_*`, `LEAD_NOTIFY_*`.
> **KHÔNG commit** giá trị thật của các biến này vào code — chỉ dán trong Vercel.

---

## E. Deploy

1. Đã dán đủ ENV → bấm **Deploy** (hoặc chạy `vercel --prod` với CLI).
2. Chờ build. Trong log build sẽ thấy lần lượt:
   - `Applying migration 0001_init` (tạo bảng)
   - `[seed] admin sẵn sàng: admin@mytel.example …`
   - `[seed] khối demo UAT sẵn sàng: 9 khối …`
   - `✓ Compiled successfully` + `Generating static pages`
3. Build xong → Vercel cho 1 URL, vd `https://mytel-b2b.vercel.app`.
4. (Nếu chưa đặt `AUTH_URL`) copy URL này → dán vào ENV `AUTH_URL` → **Redeploy** để đăng nhập admin ổn định.

---

## F. Migrate + Seed (đã TỰ ĐỘNG — mục này chỉ để hiểu / xử lý sự cố)

- **Tự động:** `vercel.json` đã đặt Build Command = `prisma migrate deploy && npm run db:seed && npm run build`
  → mỗi lần Deploy sẽ tự tạo bảng + seed. Seed **idempotent** (chạy lại không tạo trùng, không đè nội dung admin đã sửa).
- **Nếu build lỗi ở bước migrate/seed:** hầu như do `DATABASE_URL` sai hoặc dùng chuỗi *pooled*.
  → Kiểm tra lại mục C (dùng chuỗi trực tiếp, có `sslmode=require`).
- **Muốn chạy tay từ máy anh Bryan** (tùy chọn): trong `D:\projects\b2b`, đặt biến `DATABASE_URL` trỏ tới DB UAT rồi:
  ```bash
  npm run prisma:deploy          # = prisma migrate deploy
  SEED_DEMO_BLOCKS=true npm run db:seed
  ```

---

## G. Đăng nhập admin demo

1. Mở `https://<url-vercel>/vi/admin` → chưa đăng nhập sẽ chuyển tới `/vi/admin/login`.
2. Đăng nhập bằng `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` đã đặt ở mục D.
3. Vào được Dashboard admin → xem **Nội dung** (khối demo) và **Lead** (trống).

> Sai mật khẩu 5 lần → khóa 15 phút (đúng thiết kế NFR-03). Chờ 15' hoặc đổi mật khẩu qua ENV + reseed.

---

## H. Checklist nghiệm thu preview (xem gì để duyệt)

Public (không cần đăng nhập):
- [ ] `/vi` và `/en` mở được; chuyển ngôn ngữ VI ↔ EN hoạt động.
- [ ] Trang chủ hiển thị **8 section** (hero, Solutions, Industries, Why Mytel, dải CTA, form, footer…).
- [ ] Khối động **demo** hiển thị: Highlight, Đối tác (logo demo), Con số (ghi rõ "(demo)").
- [ ] Trang **dịch vụ** `/vi/services` liệt kê 3 nhóm (tổng 18 dịch vụ); mở 1 dịch vụ xem chi tiết (ẩn Price Policy).
- [ ] Slug sai (vd `/vi/services/khong-ton-tai`) → trang **404**.
- [ ] **Form lead** gửi được với **dữ liệu giả**; báo thành công. (Không nhập thông tin khách thật.)
- [ ] `/api/health` trả `{"success":true,... "db":"up"}` (DB đã kết nối).

Admin (đăng nhập demo):
- [ ] Đăng nhập admin demo OK; sai mật khẩu báo lỗi chung (không lộ email tồn tại hay không).
- [ ] **Nội dung**: thấy danh sách khối demo; thử **thêm / sửa / ẩn / sắp thứ tự** 1 khối → ra trang public cập nhật.
- [ ] **Lead**: thấy lead demo vừa gửi ở mục F/H; mở chi tiết → trạng thái **Mới → Đã xem** (chỉ đọc).

Nhận diện/giao diện:
- [ ] Màu cam thương hiệu, nút CTA, responsive điện thoại → desktop.
- [ ] Không có lỗi hiển thị chặn; ảnh/logo demo tải được.

---

## I. Lưu ý quan trọng & giới hạn UAT

- **Dữ liệu giả:** đây là preview — **tuyệt đối không nhập lead PII thật**. Production (PII thật) chờ **GATE-5** rồi deploy on-prem Docker (không phải Vercel).
- **Email = noop:** UAT không gửi email báo Sale; lead vẫn lưu DB + gắn cờ `email_status`. Muốn thử gửi thật là việc của on-prem (SMTP relay nội bộ).
- **Turnstile:** để trống ở UAT → form tự degrade (honeypot + giới hạn 5 submit/IP/giờ). Không cần Cloudflare cho preview.
- **Postgres:** dùng managed miễn phí (Neon/Supabase/Vercel). **Chuỗi kết nối trực tiếp** (không pooled) để migrate chạy được; UAT tải nhẹ nên 1 chuỗi cho cả app là đủ.
- **`vercel.json`:** chỉ ảnh hưởng Vercel; Docker/on-prem **bỏ qua** file này (giữ cloud-agnostic). On-prem vẫn dùng `docker-compose` + init `prisma migrate deploy` do DevOps dựng ở B6.
- **DevOps KHÔNG tự deploy production, KHÔNG tự phê duyệt cổng.** Bản UAT này để anh Bryan tự bấm Deploy khi muốn.
