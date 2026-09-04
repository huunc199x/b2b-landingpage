# Test Report — Landing page dịch vụ B2B Mytel (B4 static + unit)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Trạng thái | DONE (B4) | Vai | Senior Tester/QA |
|-----------|------|------|------------|------------|-----------|-----|-------------------|

> Đối tượng: Làn 0+1, commit `4447a11`, nhánh `feature/scaffold-foundation`. Môi trường: **build env KHÔNG có Postgres** → runtime DB/E2E hoãn UAT/B6. Báo cáo này ghi kết quả **rà tĩnh + unit thực chạy**; kết luận kiểm chéo ở `docs/qa/crosscheck-tester.md`.

## 1. Môi trường chạy
- OS: Windows 11 · Node ≥24 · Next.js 15.1 · Vitest 2.1.9 · TypeScript 5.7.
- Lệnh chạy thật: `npm test` (Vitest), `npx tsc --noEmit`. Không chạy `npm run build` runtime DB (không Postgres).

## 2. Kết quả thực chạy (số thật)

### 2.1 Unit test — `npm test`
```
Test Files  7 passed (7)
     Tests  56 passed (56)
  Duration  751ms
```
**56/56 PASS · 0 fail · 7 file.** Khớp con số dev khai (56/7).

| File | Số test | Phủ (FR) | Kết quả |
|------|:-------:|----------|:-------:|
| `modules/lead/validation.test.ts` | 21 | FR-07 field validate + honeypot + decision table 8 tổ hợp | ✅ pass |
| `lib/rateLimit.test.ts` | 4 | FR-10 sliding window 5/60', ví dụ SRS, đếm theo IP | ✅ pass |
| `modules/admin-auth/lockout.test.ts` | 6 | FR-16 khóa 5/15', reject khi khóa, hết hạn reset | ✅ pass |
| `modules/admin-content/validation.test.ts` | 19 | FR-12/13/14 validate 3 loại, `STAT_VALUE_RE`, `canPublish` (CB-010) | ✅ pass |
| `modules/admin-content/revalidate.test.ts` | 3 | FR-15 setVisibility→revalidateTag, chặn CB-010, CB-404 (mock DB/cache) | ✅ pass |
| `lib/errors.test.ts` | 2 | Envelope/mã lỗi (Làn 0) | ✅ pass |
| `lib/email/noop.test.ts` | 1 | Email noop adapter (Làn 0) | ✅ pass |

### 2.2 Typecheck — `npx tsc --noEmit`
**Exit 0 — sạch, 0 lỗi type.** Xác nhận claim dev.

### 2.3 Build
- `npm run build` (next build + prisma generate): **KHÔNG chạy lại ở B4** (cần Postgres cho một số bước; dev khai build XANH 53 trang, landing SSG revalidate 600s). Verify runtime build hoãn UAT khi devops dựng stack. ESLint còn warning `<img>` (chấp nhận — URL động, giữ cloud-agnostic).

## 3. Độ phủ đếm được (B4)

| Chỉ số | Con số |
|--------|--------|
| FR có ≥1 TC | **18/18 (100%)** |
| Dòng decision table có TC | FR-07: 8/8 · FR-02: 4/4 · FR-15: 4/4 · FR-16: 4/4 = **20/20** |
| Chuyển trạng thái hợp lệ có TC | E-01 (Mới→Đã xem), E-02 (Nháp→visible, visible→hidden, →deleted), E-03 (active↔locked) — phủ (đa số [UAT]) |
| Chuyển trạng thái CẤM có TC | E-02 (bật/sửa/xóa `deleted`) + §7b out-of-order — phủ ([UAT]) |
| Ô ✗ ma trận quyền có TC | authz `/api/admin/*` chưa auth + IDOR — phủ ([UAT]) |
| Tổng TC | **~118** (≈45 verify được B4, ≈73 [UAT] hoãn B6) |
| Unit pass rate | **56/56 (100%)** |

**Đối chiếu 14 endpoint (tĩnh):** 14/14 endpoint có mã hiện thực; envelope `{success,data,meta.correlationId}` + mã lỗi canonical (LEAD-/AUTH-/CB-/SYS-) khớp `errors.ts` ↔ `api-spec §4`/`LLD §8`. Tên trường form lead khớp `contactName/email/phone/companyName/serviceInterest/message/consent/website`. **Contract verify response thật → [UAT].**

## 4. Danh sách phát hiện (Severity ≠ Priority)

> Không có **Blocker/Critical** về mặt tĩnh+unit. Các mục dưới là **điểm lệch tài liệu-code / điểm nghi ngờ** (cần BA/SA chốt), KHÔNG phải bug chặn cổng. Chi tiết + kỳ vọng trích dẫn ở `crosscheck-tester.md`.

| ID | Tiêu đề | Kỳ vọng (trích) vs Thực tế | Severity | Priority (đề xuất) | Loại |
|----|---------|-----------------------------|:--------:|:---:|------|
| DISC-01 | Thứ tự ưu tiên mã lỗi LEAD khi vừa lỗi-trường vừa vượt rate-limit | SRS bảng FR-07 (dòng 6/8) → **LEAD-001**; code pipeline → **LEAD-021** | Minor | P2 | Lệch tài liệu (đã ghi handover §6.2; dev theo api-spec §3.1) |
| DISC-02 | Turnstile fail cứng (secret bật + token sai) → 200 giả, **không tạo lead** | api-spec không định mã riêng; khách thật fail challenge có thể **mất lead âm thầm** | Major | P2 | Nghi ngờ nghiệp vụ — cần SA/BA quyết (handover §6.1) |
| DISC-03 | Hết phiên map mã lỗi | api-spec §3.4/FSD: **AUTH-020**; middleware trả **AUTH-401** khi JWT hết hạn | Minor | P3 | Lệch code-tài liệu (AUTH-020 có trong catalog nhưng middleware không phát) |
| DISC-04 | Tie-break sortOrder khối public | SRS FR-15/FR-02: trùng thứ tự → sắp phụ **updatedAt desc**; `public-site/blocks.ts` orderBy chỉ `[blockType, sortOrder]` (thiếu tiebreak) | Minor | P3 | Lệch — thứ tự khối trùng sortOrder không xác định trên public (list admin đã đúng) |
| DISC-05 | VI fields áp min-2 ngoài SRS | SRS FR-12/14: VI title/desc chỉ có **max** (không min); code `checkLen(...,2,...,required=false)` → VI 1 ký tự bị CB-001 với thông điệp "tối đa…" | Minor | P3 | Lệch — case biên hiếm; thông điệp sai ngữ cảnh (báo max khi fail min) |

## 5. Kết luận B4

- **Unit + typecheck: ĐẠT** (56/56 pass, tsc sạch). Kiến trúc envelope/mã lỗi/pipeline/ma trận quyền **khớp tài liệu** ở mức đọc mã.
- **Không có Blocker/Critical** mở về mặt tĩnh+unit.
- **5 điểm lệch tài liệu-code (DISC-01..05)**: 1 Major (DISC-02 nghi mất lead) + 4 Minor — đều **cần BA/SA làm rõ/chốt tài liệu**, không phải lỗi chặn build.
- **~73 TC [UAT]** (submit lead lưu DB, login/lockout thật, CRUD khối, revalidate lan public, mark-viewed, contract response thật, §7b out-of-order, NFR số đo) **phải verify ở UAT/B6** khi có Postgres.
- Kết luận kiểm chéo + kiến nghị GATE-4: `docs/qa/crosscheck-tester.md`.

Trạng thái file: **DONE**. Tester **không tự phê duyệt GATE-4** — báo PO.
