# API Specification — Landing page dịch vụ B2B Mytel (+ Admin CMS-lite)

| Phiên bản | v1.0 | Ngày | 2026-09-02 | Trạng thái | DONE (chờ GATE-3) |
|-----------|------|------|------------|------------|-------------------|

> **Hợp đồng API (contract-first).** SA viết → dev code theo (B4) → tester phủ test theo. Tên trường khớp **`LLD.md`** (nguồn sự thật data model); mã lỗi khớp **`LLD.md §8`**. **Không viết OpenAPI YAML tay** — OpenAPI sinh từ code Next.js (route handler) ở B4 để đối chiếu file này khi nghiệm thu GATE-4; mâu thuẫn → **file .md đã duyệt thắng**.
> **Nền tảng:** dự án chỉ có **Web** (public + Admin CMS). Không có app mobile (techstack). Cột "Nền tảng" ghi Web-public / Web-admin.

---

## 1. Quy ước chung *(khai MỘT LẦN — endpoint không lặp lại)*

- **Base URL:** dev `http://localhost:3000` · UAT `<chờ cấp>` · prod on-prem `<chờ cấp>`. Prefix API: `/api`. (Public pages render server-side theo `[locale]`; API chỉ cho submit lead, admin, auth.)
- **Envelope (theo HLD §7 — KHÔNG dùng `TransactionResponse`):**
  - **Thành công:** `{ "success": true, "data": <payload>, "meta": { "correlationId": "<ulid>" } }`
  - **Lỗi:** `{ "success": false, "error": { "code": "<MÃ>", "message": "<mô tả>" }, "meta": { "correlationId": "<ulid>" } }`
  - Lỗi validate nhiều trường: `error.details[]` = `[{ field, message }]` (tùy chọn, để FE hiển thị lỗi từng ô).
- **Định dạng:** JSON UTF-8. Thời gian trả về **ISO-8601 UTC** (`2026-09-02T08:15:00Z`); UI đổi sang Asia/Yangon. Id = **ULID** (chuỗi 26 ký tự).
- **Auth admin:** **Auth.js JWT cookie** (httpOnly, Secure, SameSite=Lax) — **không** dùng Bearer header. Middleware bảo vệ `/api/admin/*` (chưa đăng nhập → `AUTH-401`; sai quyền → `AUTH-403`). Endpoint public: `POST /api/leads`, `GET /api/public/content-blocks`, `/api/auth/*`.
- **CorrelationId:** server sinh mỗi request, trả trong `meta.correlationId`, ghi log để truy vết (HLD §7).
- **Rate-limit (public):** `POST /api/leads` áp rolling 60 phút / 5 submit / IP (`X-Forwarded-For` trái nhất) → `LEAD-021` (429).
- **Phân trang (danh sách admin):** query `page` (từ 1, mặc định 1), `pageSize` (mặc định 20, tối đa 100); `data` gồm `items[]`, `total`, `page`, `pageSize`, `totalPages` (HLD §7 offset pagination).
- **Mã lỗi chung mọi endpoint admin** *(không lặp ở từng endpoint):* `AUTH-401` (401 chưa xác thực) · `AUTH-403` (403 không quyền) · `AUTH-020` (401 phiên hết hạn) · `SYS-500` (500 lỗi hệ thống). Bảng mã đầy đủ: **`LLD.md §8`**.

---

## 2. Danh mục endpoint

| # | Method | Path | Mô tả | FR | Nền tảng | Auth admin? |
|---|--------|------|-------|----|----------|:-----------:|
| 1 | POST | /api/leads | Submit lead (consent + Turnstile) | FR-07/08/09/10 | Web-public | Không |
| 2 | GET | /api/public/content-blocks | Khối động `visible` theo locale (tùy chọn; public chủ yếu render SSR) | FR-02 | Web-public | Không |
| 3 | POST | /api/auth/callback/credentials | Đăng nhập admin (Auth.js) | FR-16 | Web-admin | Không (tạo phiên) |
| 4 | POST | /api/auth/signout | Đăng xuất (Auth.js) | FR-17 | Web-admin | **Có** |
| 5 | GET | /api/auth/session | Trạng thái phiên hiện tại | FR-17 | Web-admin | — |
| 6 | GET | /api/admin/content-blocks | Danh sách khối (lọc loại/trạng thái) | FR-12/13/14/15 | Web-admin | **Có** |
| 7 | POST | /api/admin/content-blocks | Tạo khối (đa ngữ) | FR-12/13/14 | Web-admin | **Có** |
| 8 | GET | /api/admin/content-blocks/{id} | Chi tiết 1 khối | FR-12/13/14 | Web-admin | **Có** |
| 9 | PATCH | /api/admin/content-blocks/{id} | Cập nhật khối (đa ngữ) | FR-12/13/14 | Web-admin | **Có** |
| 10 | PATCH | /api/admin/content-blocks/{id}/visibility | Bật/ẩn khối | FR-15 | Web-admin | **Có** |
| 11 | PATCH | /api/admin/content-blocks/reorder | Sắp thứ tự | FR-15 | Web-admin | **Có** |
| 12 | DELETE | /api/admin/content-blocks/{id} | Soft-delete khối | FR-12 | Web-admin | **Có** |
| 13 | GET | /api/admin/leads | Danh sách lead (lọc/phân trang) | FR-11 | Web-admin | **Có** |
| 14 | GET | /api/admin/leads/{id} | Chi tiết lead + đánh dấu `viewed` | FR-11 | Web-admin | **Có** |

> **Ghi chú render public:** khối động và trang dịch vụ **chủ yếu render server-side** (RSC đọc DB/repo trực tiếp, ADR-04) — không bắt buộc gọi REST. Endpoint #2 cung cấp để client hydrate / dùng lại khi cần; hành vi lọc **giống** logic SSR (BR-DYN-01).

---

## 3. Đặc tả từng endpoint

### 3.1 `POST /api/leads` — Submit lead *(FR-07/08/09/10)*
- **Nền tảng:** Web-public · **Quyền:** ẩn danh (không đăng nhập). Áp honeypot + rate-limit + Turnstile + consent.
- **Request** (JSON body):
  | Trường | Kiểu | Bắt buộc | Ràng buộc (ref SRS FR-07) | Mô tả |
  |--------|------|:--------:|----------------------------|-------|
  | contactName | string | ✓ | 2–100, chữ + khoảng trắng + dấu TV | Họ tên người liên hệ |
  | email | string | ✓ | `^[^@\s]+@[^@\s]+\.[^@\s]+$`, ≤150 | Email công việc |
  | phone | string | ✓ | 8–15 chữ số, cho phép `+` đầu | Số điện thoại |
  | companyName | string | ✓ | 2–150 | Tên doanh nghiệp |
  | serviceInterest | string | ✓ | slug ∈ 18 dịch vụ hoặc `general` | Dịch vụ quan tâm (prefill từ trang dịch vụ) |
  | message | string | ✗ | ≤1000 | Lời nhắn/nhu cầu |
  | consent | boolean | ✓ | phải = `true` | Đồng ý xử lý dữ liệu (PDPL) |
  | consentTextVersion | string | ✓ | vd `v1` | Phiên bản văn bản consent đã hiển thị |
  | turnstileToken | string | ✓* | token widget Cloudflare | Verify server-side (timeout 3s; degrade nếu lỗi) |
  | website | string | ✗ | **honeypot** — phải rỗng | Ẩn với người thật; ≠ rỗng → xử lý như bot |
- **Response `data`** (200 thành công):
  | Trường | Kiểu | Mô tả |
  |--------|------|-------|
  | leadId | string | ULID lead vừa tạo |
  | status | string | `new` |
- **Mã lỗi nghiệp vụ** (chi tiết `LLD.md §8`):
  | code | HTTP | Ý nghĩa | message (vi) |
  |------|:----:|---------|--------------|
  | LEAD-001 | 400 | Lỗi validate trường (kèm `error.details[]`) | "Vui lòng kiểm tra lại thông tin đã nhập" |
  | LEAD-010 | 400 | Chưa tick consent | "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" |
  | LEAD-021 | 429 | Vượt rate-limit 5/IP/60' | "Bạn đã gửi quá số lần cho phép, vui lòng thử lại sau 1 giờ" |
  | LEAD-030 | 500 | Lỗi lưu DB (rollback) | "Hệ thống đang bận, vui lòng thử lại" |
- **Honeypot (bot):** nếu `website` ≠ rỗng → trả **200 với `data` giả** (giống thành công), **không tạo lead**, ghi cờ spam (SRS FR-07 2c). Không trả mã lỗi để không lộ cơ chế.
- **Ví dụ:**
  ```json
  // Request
  { "contactName": "Le Van A", "email": "a@cty.example", "phone": "0912345678",
    "companyName": "Cong ty A", "serviceInterest": "dia", "message": "Can bao gia DIA",
    "consent": true, "consentTextVersion": "v1", "turnstileToken": "0x4AAA...", "website": "" }
  // 200 — thành công
  { "success": true, "data": { "leadId": "01JBQ7...", "status": "new" },
    "meta": { "correlationId": "01JBQ7Z..." } }
  // 400 — thiếu consent
  { "success": false, "error": { "code": "LEAD-010",
    "message": "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" },
    "meta": { "correlationId": "01JBQ7Z..." } }
  // 429 — vượt rate-limit
  { "success": false, "error": { "code": "LEAD-021",
    "message": "Bạn đã gửi quá số lần cho phép, vui lòng thử lại sau 1 giờ" },
    "meta": { "correlationId": "01JBQ7Z..." } }
  ```

### 3.2 `GET /api/public/content-blocks` — Khối động public *(FR-02)*
- **Nền tảng:** Web-public · **Quyền:** ẩn danh. Chỉ trả khối `visible` **đủ trường bắt buộc của locale** (BR-DYN-01).
- **Request** (query):
  | Trường | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
  |--------|------|:--------:|-----------|-------|
  | locale | string | ✓ | `en`·`vi` | Ngôn ngữ hiển thị |
  | type | string | ✗ | `highlight`·`partner`·`stat` | Lọc theo loại (bỏ trống = tất cả) |
- **Response `data`:** mảng khối đã lọc + đổ i18n theo locale, sắp `sortOrder` tăng dần:
  | Trường | Kiểu | Mô tả |
  |--------|------|-------|
  | items[].id | string | ULID khối |
  | items[].blockType | string | `highlight`·`partner`·`stat` |
  | items[].sortOrder | number | thứ tự |
  | items[].title | string | tiêu đề/tên/nhãn theo locale |
  | items[].description | string\|null | mô tả/đơn vị theo locale |
  | items[].payload | object | `imageUrl`·`logoUrl`·`link`·`value` (không dịch) |
- **Mã lỗi:** không có lỗi nghiệp vụ riêng (locale sai → coi mặc định); `SYS-500` nếu lỗi hệ thống.
- **Ví dụ:**
  ```json
  // GET /api/public/content-blocks?locale=vi&type=stat
  { "success": true, "data": { "items": [
      { "id": "01JB...", "blockType": "stat", "sortOrder": 1,
        "title": "Khách hàng doanh nghiệp", "description": "khách hàng",
        "payload": { "value": "1.200+" } } ] },
    "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.3 `POST /api/auth/callback/credentials` — Đăng nhập admin *(FR-16)*
- **Nền tảng:** Web-admin · **Quyền:** ẩn danh (tạo phiên). **Do Auth.js v5 quản lý** — client gọi qua `signIn('credentials', ...)`. Đặc tả hành vi hợp đồng (không phải route tự viết).
- **Request:**
  | Trường | Kiểu | Bắt buộc | Ràng buộc (ref FR-16) | Mô tả |
  |--------|------|:--------:|------------------------|-------|
  | email | string | ✓ | định dạng email | Email admin (seed AS-14) |
  | password | string | ✓ | ≥12 ký tự | Mật khẩu (verify argon2id) |
- **Response thành công:** set **JWT cookie** (30 phút); redirect `/admin` (hoặc `data: { ok: true }` với `signIn redirect:false`).
- **Mã lỗi nghiệp vụ:**
  | code | HTTP | Ý nghĩa | message (vi) |
  |------|:----:|---------|--------------|
  | AUTH-001 | 401 | Sai email/mật khẩu (thông báo chung) | "Email hoặc mật khẩu không đúng" |
  | AUTH-010 | 423 | Tài khoản tạm khóa (5 sai/15') | "Tài khoản tạm khóa, thử lại sau 15 phút" |
- **Ví dụ:**
  ```json
  // Request (qua Auth.js signIn)
  { "email": "admin@mytel.example", "password": "•••••••••••• (≥12)" }
  // 401 — sai thông tin
  { "success": false, "error": { "code": "AUTH-001", "message": "Email hoặc mật khẩu không đúng" },
    "meta": { "correlationId": "01JBQ..." } }
  // 423 — đang khóa
  { "success": false, "error": { "code": "AUTH-010", "message": "Tài khoản tạm khóa, thử lại sau 15 phút" },
    "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.4 `POST /api/auth/signout` — Đăng xuất *(FR-17)*
- **Nền tảng:** Web-admin · **Quyền:** admin đã đăng nhập. Hủy JWT cookie, ghi audit `auth.logout`. Trả `data: { ok: true }`. Phiên hết hạn 30 phút không thao tác → thao tác kế trả `AUTH-020` (401) → redirect login.

### 3.5 `GET /api/admin/content-blocks` — Danh sách khối *(FR-12/13/14/15)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Không trả khối `deleted`.
- **Request** (query): `type` (✗ `highlight`·`partner`·`stat`), `status` (✗ `draft`·`visible`·`hidden`), `page`, `pageSize`.
- **Response `data`:** `items[]` (mỗi khối gồm id, blockType, status, sortOrder, payload, i18n `{en, vi}` đủ 2 bản, createdAt/updatedAt) + `total`, `page`, `pageSize`, `totalPages`.
- **Mã lỗi:** chung (AUTH-401/403).
- **Ví dụ:**
  ```json
  { "success": true, "data": { "items": [
      { "id": "01JB...", "blockType": "highlight", "status": "visible", "sortOrder": 0,
        "payload": { "imageUrl": "/img/x.webp", "link": "https://ex.example" },
        "i18n": { "en": { "title": "New DIA", "description": "Dedicated Internet" },
                  "vi": { "title": "DIA mới", "description": "Internet chuyên biệt" } } } ],
      "total": 1, "page": 1, "pageSize": 20, "totalPages": 1 },
    "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.6 `POST /api/admin/content-blocks` — Tạo khối *(FR-12/13/14)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Tạo ở `draft`. Validate theo `blockType` (bảng SRS FR-12/13/14). Ghi audit `block.create`.
- **Request:**
  | Trường | Kiểu | Bắt buộc | Ràng buộc (ref SRS) | Mô tả |
  |--------|------|:--------:|----------------------|-------|
  | blockType | string | ✓ | `highlight`·`partner`·`stat` | Loại khối |
  | sortOrder | number | ✗ | integer ≥0 (mặc định cuối) | Thứ tự |
  | payload | object | ✓/tùy loại | Highlight `{imageUrl?,link?}` · Partner `{logoUrl✓,link?}` · Stat `{value✓ regex FR-14}` | Phần không dịch |
  | i18n | object | ✓ | `{ en:{title,description}, vi?:{...} }` — EN bắt buộc theo loại | Bản dịch |
- **payload.value (Stat):** regex `^(?=.*[0-9])[0-9.,]{1,19}[+%]?$`, 1–20 (FR-14).
- **Response `data`:** `{ id, status: "draft" }`.
- **Mã lỗi:**
  | code | HTTP | Ý nghĩa | message (vi) |
  |------|:----:|---------|--------------|
  | CB-001 | 400 | Lỗi validate trường (kèm `details[]`) | *(theo bảng validate SRS từng loại)* |
- **Ví dụ:**
  ```json
  // Request — Stat
  { "blockType": "stat", "sortOrder": 1, "payload": { "value": "1.200+" },
    "i18n": { "en": { "title": "Enterprise customers", "description": "customers" },
              "vi": { "title": "Khách hàng doanh nghiệp", "description": "khách hàng" } } }
  // 201/200 — thành công
  { "success": true, "data": { "id": "01JB...", "status": "draft" }, "meta": { "correlationId": "01JBQ..." } }
  // 400 — value sai định dạng
  { "success": false, "error": { "code": "CB-001",
    "message": "Giá trị chỉ gồm chữ số và dấu ngăn cách, hậu tố + hoặc %",
    "details": [ { "field": "payload.value", "message": "Sai định dạng (vd 1.200+, 63, 99%)" } ] },
    "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.7 `GET /api/admin/content-blocks/{id}` — Chi tiết khối *(FR-12/13/14)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Trả 1 khối đầy đủ (payload + i18n en/vi). `CB-404` (404) nếu không tồn tại/đã xóa.

### 3.8 `PATCH /api/admin/content-blocks/{id}` — Cập nhật khối *(FR-12/13/14)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Cập nhật payload/i18n/sortOrder (partial). Validate như tạo. Ghi audit `block.update`. `CB-001` (400) validate, `CB-404` (404).
- **Ví dụ 400 giống §3.6.**

### 3.9 `PATCH /api/admin/content-blocks/{id}/visibility` — Bật/ẩn khối *(FR-15)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Đổi `status` giữa `visible`↔`hidden`. **Bật hiển thị (`visible`) chặn nếu thiếu trường EN bắt buộc → `CB-010`** (SRS FR-15 bảng quyết định). Ghi audit `block.visibility`. Kích hoạt `revalidateTag("content-blocks")`.
- **Request:** `{ "action": "show" | "hide" }`.
- **Response `data`:** `{ id, status }`.
- **Mã lỗi:**
  | code | HTTP | Ý nghĩa | message (vi) |
  |------|:----:|---------|--------------|
  | CB-010 | 422 | Bật hiển thị khi thiếu trường EN bắt buộc | "Cần đủ trường tiếng Anh bắt buộc trước khi hiển thị" |
  | CB-404 | 404 | Khối không tồn tại | "Không tìm thấy nội dung" |
- **Ví dụ:**
  ```json
  // Request
  { "action": "show" }
  // 200
  { "success": true, "data": { "id": "01JB...", "status": "visible" }, "meta": { "correlationId": "01JBQ..." } }
  // 422 — thiếu EN
  { "success": false, "error": { "code": "CB-010",
    "message": "Cần đủ trường tiếng Anh bắt buộc trước khi hiển thị" }, "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.10 `PATCH /api/admin/content-blocks/reorder` — Sắp thứ tự *(FR-15)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Nhận danh sách id→sortOrder mới; trùng thứ tự → sắp phụ theo `updatedAt` giảm dần (SRS FR-15). Ghi audit `block.reorder` + revalidate.
- **Request:** `{ "items": [ { "id": "01JB...", "sortOrder": 0 }, { "id": "01JC...", "sortOrder": 1 } ] }`
- **Response `data`:** `{ updated: <số khối> }`.
- **Ví dụ:**
  ```json
  { "success": true, "data": { "updated": 3 }, "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.11 `DELETE /api/admin/content-blocks/{id}` — Soft-delete khối *(FR-12)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Đặt `deleted_at` (không xóa cứng); biến khỏi public + list. Ghi audit `block.delete` + revalidate. `CB-404` (404) nếu không tồn tại.
- **Response `data`:** `{ id, deleted: true }`.

### 3.12 `GET /api/admin/leads` — Danh sách lead *(FR-11)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Sắp `createdAt` giảm dần, phân trang 20/trang. Empty-state xử lý ở UI (FR-11 1b/1c).
- **Request** (query):
  | Trường | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
  |--------|------|:--------:|-----------|-------|
  | status | string | ✗ | `new`·`viewed` | Lọc trạng thái |
  | serviceInterest | string | ✗ | slug hoặc `general` | Lọc dịch vụ |
  | dateFrom / dateTo | string | ✗ | ISO date | Lọc theo ngày gửi |
  | page / pageSize | number | ✗ | mặc định 1 / 20 | Phân trang |
- **Response `data`:** `items[]` (id, contactName, companyName, email, phone, serviceInterest, status, emailStatus, createdAt) + `total`, `page`, `pageSize`, `totalPages`.
- **Ví dụ:**
  ```json
  { "success": true, "data": { "items": [
      { "id": "01JB...", "contactName": "Le Van A", "companyName": "Cong ty A",
        "email": "a@cty.example", "phone": "0912345678", "serviceInterest": "dia",
        "status": "new", "emailStatus": "sent", "createdAt": "2026-09-02T08:15:00Z" } ],
      "total": 1, "page": 1, "pageSize": 20, "totalPages": 1 },
    "meta": { "correlationId": "01JBQ..." } }
  ```

### 3.13 `GET /api/admin/leads/{id}` — Chi tiết lead + đánh dấu `viewed` *(FR-11)*
- **Nền tảng:** Web-admin · **Quyền:** admin. Trả đầy đủ lead + consent; nếu `status=new` → cập nhật `viewed`/`viewedAt`/`viewedBy`, ghi audit `lead.view`. MVP **không** cho sửa/xóa lead (BR-18) → không có endpoint mutation lead.
- **Response `data`:** lead đầy đủ + `consent { given, consentTextVersion, givenAt }`.
- **Mã lỗi:** `CB-404` (404) nếu lead không tồn tại.
- **Ví dụ:**
  ```json
  { "success": true, "data": {
      "id": "01JB...", "contactName": "Le Van A", "companyName": "Cong ty A",
      "email": "a@cty.example", "phone": "0912345678", "serviceInterest": "dia",
      "message": "Can bao gia DIA", "status": "viewed", "emailStatus": "sent",
      "createdAt": "2026-09-02T08:15:00Z", "viewedAt": "2026-09-02T09:00:00Z",
      "consent": { "given": true, "consentTextVersion": "v1", "givenAt": "2026-09-02T08:15:00Z" } },
    "meta": { "correlationId": "01JBQ..." } }
  ```

---

## 4. Ghi chú khớp FSD (PO đối chiếu trước GATE-3)
- **Tên trường form lead** (canonical, phải trùng FSD↔LLD↔api-spec): `contactName`·`email`·`phone`·`companyName`·`serviceInterest`·`message`·`consent`·`website`(honeypot).
- **Mã lỗi** (canonical `LLD.md §8`): LEAD-001/010/020/021/030 · AUTH-001/010/020/401/403 · CB-001/010/404 · SYS-500. FSD dùng đúng bộ mã này ở phần thông báo lỗi màn hình.
- **Enum trạng thái:** lead `new`/`viewed`; block `draft`/`visible`/`hidden`/`deleted`; email `pending`/`sent`/`failed`. FSD mô tả trạng thái theo đúng giá trị này.

---

## ✅ Checklist trước GATE-3
- [x] §1 quy ước chung đầy đủ (base URL, envelope HLD §7, auth cookie Auth.js, HTTP status, phân trang, mã lỗi chung) — khai 1 lần.
- [x] Danh mục 14 endpoint phủ FR-02/07/08/09/10/11/12/13/14/15/16/17; mỗi endpoint gắn FR + nền tảng (Web-public/Web-admin) + đánh dấu cần auth admin.
- [x] Mỗi endpoint: bảng request (ràng buộc ref SRS) + `data` + mã lỗi nghiệp vụ + ví dụ JSON (thành công + ≥1 lỗi), dữ liệu giả (PDPL).
- [x] Tên trường khớp `LLD.md`; mã lỗi khớp `LLD.md §8`.
- [x] Ghi chú OpenAPI sinh từ code (B4) đối chiếu file này ở GATE-4; không viết YAML tay.
- [x] Đã xóa khối 💡/📝 của template; dùng envelope Next.js (không TransactionResponse Java).
