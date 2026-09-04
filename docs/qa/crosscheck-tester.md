# Kiểm chéo Tester (B4) — Landing page dịch vụ B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Vai | Senior Tester/QA (độc lập với dev) |
|-----------|------|------|------------|-----|-------------------------------------|

> **Vì sao file riêng, KHÔNG ghi vào `handover-report.md`:** tránh đụng file với BA/Security khi kiểm chéo song song — **PO sẽ gộp** kết luận các vai trước GATE-4. Đối tượng: Làn 0+1, commit `4447a11`, nhánh `feature/scaffold-foundation`.
> Cơ sở: rà **code thật** trong `src/` đối chiếu `SRS.md`/`FSD.md`/`api-spec.md`; chạy thật `npm test` (56/56) + `tsc --noEmit` (sạch). Chi tiết TC: `test-cases.md`; số đo: `test-report.md`.

## 1. KẾT LUẬN: **ĐẠT** (về mặt tĩnh + unit) — với 3 điều kiện

Làn 0+1 **ĐẠT** điều kiện cổng GATE-4 phần **static + unit**:
- ✅ `npm test` **56/56 pass**, `tsc --noEmit` sạch — khớp claim dev.
- ✅ 14/14 endpoint có mã; envelope + mã lỗi canonical + tên trường form lead **khớp api-spec/LLD**.
- ✅ Pipeline lead (honeypot→rate-limit→turnstile→validate→consent→persist tx→email) đúng thứ tự api-spec §3.1; lockout 5/15 đúng FR-16; publishGuard CB-010 đúng FR-15; ma trận quyền `/api/admin/*` chặn 2 lớp (middleware + `requireAdmin`); audit không PII; empty-state + BR-DYN-01 hiện thực đúng.
- ✅ Decision table FR-07/16 + validate 3 loại khối + rate-limit sliding window có unit test đối chiếu đúng ví dụ tính tay SRS.

**KHÔNG có Blocker/Critical** về mặt tĩnh+unit.

**3 điều kiện kèm theo (ĐẠT có điều kiện):**
1. **PO/SA/BA chốt 5 điểm lệch tài liệu-code (DISC-01..05)** dưới đây trước khi trình GATE-4 — đặc biệt **DISC-02 (Major, nghi mất lead thật khi Turnstile fail)**.
2. **~73 TC [UAT] chưa verify runtime** (không Postgres ở B4) → GATE-4 chỉ đóng phần static+unit; **nghiệm thu đầy đủ phải qua UAT/B6** (submit lưu DB, login thật, CRUD khối, revalidate, mark-viewed, contract response thật, §7b out-of-order, NFR số đo).
3. Các điểm mở dev tự nêu (handover §6: bản dịch VI, asset AS-*, session/đổi mật khẩu hoãn) do PO/anh Bryan quyết — không thuộc phạm vi test nhưng ảnh hưởng kỳ vọng một số TC.

## 2. Điểm nghi ngờ / bug (Severity ≠ Priority)

### DISC-02 — ⚠ **[Major]** Turnstile fail cứng → 200 giả, KHÔNG tạo lead (nghi mất lead thật)
- **File:** `src/modules/lead/service.ts` L46-56 + `src/lib/turnstile.ts`.
- **Thực tế:** khi secret Turnstile ĐƯỢC cấu hình mà verify trả `success:false` (hoặc bật secret nhưng thiếu token), code trả `{kind:'honeypot'}` → route trả **200 với data giả**, **không tạo lead**.
- **Kỳ vọng (trích):** SRS FR-07 chỉ định 200-giả cho **honeypot bot** (2c/LEAD-020). api-spec §3.1 **không** định mã lỗi cho Turnstile fail. Với khách **thật** mà challenge fail (mạng, trình duyệt cũ), hệ quả là **lead biến mất âm thầm** — trái tinh thần BG-01 (thu lead) và FR-09/2f (không mất lead).
- **Rủi ro:** mất cơ hội kinh doanh, không truy vết được.
- **Đề xuất:** SA quyết — hoặc (a) mã lỗi riêng cho Turnstile fail để UI mời thử lại, hoặc (b) chấp nhận degrade rộng hơn. Dev đã nêu ở handover §6.1. **Severity Major · Priority P2** (chờ SA).
- **Verify:** TC-FR10-08 `[UAT]` khi bật secret trên UAT.

### DISC-01 — **[Minor]** Ưu tiên mã lỗi LEAD-021 vs LEAD-001
- **File:** `src/modules/lead/service.ts` (rate-limit trước validate) + `validation.ts::decideLead`.
- **Thực tế:** khi vừa lỗi-trường vừa vượt rate-limit → trả **LEAD-021** (rate-limit đánh trước validate).
- **Kỳ vọng (trích):** SRS FR-07 **bảng quyết định** dòng 6 & 8 → **LEAD-001** (ưu tiên báo lỗi trường). Lệch ở 3/8 dòng decision table (TC-FR07D-04/06/08).
- **Ghi chú:** dev **cố ý** theo thứ tự cổng api-spec §3.1 (handover §6.2); cả hai tài liệu đã duyệt nhưng **mâu thuẫn nhau**. Unit test hiện khoá theo hành vi code (pass) → **unit không bắt được lệch SRS**.
- **Đề xuất:** BA/SA đồng bộ — hoặc sửa bảng SRS FR-07 cho khớp thứ tự cổng, hoặc dev đảo thứ tự validate trước rate-limit. **Severity Minor · Priority P2.**

### DISC-04 — **[Minor]** Public thiếu tie-break `updatedAt desc` khi trùng sortOrder
- **File:** `src/modules/public-site/blocks.ts` L57 — `orderBy: [{blockType},{sortOrder}]` (thiếu `updatedAt: 'desc'`).
- **Kỳ vọng (trích):** SRS FR-15 + FR-02: "trùng thứ tự → sắp phụ theo **thời điểm cập nhật giảm dần**". `admin-content/service.ts::listBlocks` L49 ĐÃ có tie-break đúng; **public thì không** → thứ tự 2 khối cùng sortOrder **không xác định** trên landing.
- **Đề xuất:** thêm `{updatedAt:'desc'}` vào orderBy public. **Severity Minor · Priority P3.** Verify TC-FR02-05/TC-FR15-06 `[UAT]`.

### DISC-03 — **[Minor]** Hết phiên trả AUTH-401 thay vì AUTH-020
- **File:** `src/middleware.ts` L26-35 (API admin chưa auth → AUTH-401); JWT hết hạn cũng thành "chưa auth".
- **Kỳ vọng (trích):** api-spec §3.4 + FSD SHELL-ADMIN 2a / SCR-09 1a: phiên hết hạn → **AUTH-020 (401)**. `errors.ts` có sẵn AUTH-020 nhưng middleware không phân biệt "hết hạn" vs "chưa đăng nhập".
- **Ghi chú:** cùng HTTP 401, hệ quả UX gần như nhau (đều về login). Dev nêu một phần ở handover §5.3. **Severity Minor · Priority P3.**

### DISC-05 — **[Minor]** VI fields áp min-2 ngoài đặc tả SRS
- **File:** `src/modules/admin-content/validation.ts` L69-70, L82 — VI title/description dùng `checkLen(...,min=2,...,required=false)`.
- **Kỳ vọng (trích):** SRS FR-12/14 bảng validate: VI title/desc/nhãn **chỉ có ràng buộc max** (không min). Với VI = 1 ký tự, `checkLen` báo CB-001 kèm thông điệp **"…tối đa 120/300/80 ký tự"** — sai ngữ cảnh (fail min nhưng báo max).
- **Đề xuất:** bỏ min cho field VI không bắt buộc, hoặc chỉnh thông điệp. **Severity Minor · Priority P3.** Case biên hiếm (TC-FR14-04).

## 3. Điểm ĐÃ kiểm và XÁC NHẬN ĐÚNG (không phải bug)
- **CB-404 cho lead không tồn tại** (`adminLeads.ts` L74): trông lạ (mã CB- cho lead) nhưng **đúng api-spec §3.13** — chấp nhận.
- **Honeypot 200 giả** (route L36-39): đúng SRS FR-07 2c / api-spec §3.1 (không lộ cơ chế).
- **Rate-limit không đẩy timestamp khi bị chặn** (`rateLimit.ts` L49-52): đúng — không tự kéo dài cửa sổ; khớp ví dụ SRS.
- **Persist nguyên tử lead + lead_consent trong `$transaction`** (service.ts L73-98): đúng FR-08 (không tạo lead một phần).
- **BR-18 chỉ đọc lead:** không có endpoint mutation lead trong api-spec; `adminLeads.ts` chỉ đọc + mark-viewed. Đúng.
- **Defense-in-depth authz:** middleware chặn `/api/admin/*` + `requireAdmin()` trong từng route. Đúng NFR-03.
- **Audit không PII** (`audit.ts`, mọi mutation + auth event): đúng FR-18/NFR-04.

## 4. Giới hạn kiểm chéo B4 (minh bạch)
- **Không có Postgres** → mọi hành vi lưu-trữ/trạng thái/lan-truyền cache **chỉ đọc mã + unit mock**, **chưa chạy runtime**. Rủi ro thật (transaction, revalidate lan public, mark-viewed đồng thời, lockout persist) **dời UAT/B6** — đã đánh dấu ~73 TC `[UAT]`.
- **Contract test** mới ở mức đối chiếu shape mã ↔ ví dụ JSON; **response thật chưa verify** → [UAT] lớp ①.
- **§7b out-of-order** (chuyển trạng thái cấm, lặp bước, tham chiếu chéo sai) chỉ suy luận tĩnh từ guard code; **chạy thật ở B6 lớp ①**.
- **NFR số đo** (Lighthouse/LCP/TTFB/contrast/email ≤1h) **chưa đo** — cần môi trường chạy → B6.

## 5. Kiến nghị cho PO (GATE-4)
1. **Đồng ý đóng phần static+unit của GATE-4** với ghi chú "phần runtime chờ UAT/B6".
2. **Chốt DISC-01..05 với BA/SA** trước khi trình anh Bryan — ưu tiên **DISC-02 (Major)**.
3. Lên lịch **UAT/B6**: devops dựng Postgres + seed + SMTP + Turnstile secret; Tester chạy ~73 TC [UAT] theo 3 lớp (API → security → UI).
4. Tester **không tự phê duyệt GATE-4** (theo kit); chờ PO gộp kết luận BA + Security + Tester.

**Kết luận cuối: ĐẠT (static + unit) — có điều kiện; CẦN chốt DISC-01..05 + verify runtime ở UAT/B6.**
