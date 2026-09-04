# Test Cases — Landing page dịch vụ B2B Mytel (+ Admin CMS-lite)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Trạng thái | DRAFT (B4) |
|-----------|------|------|------------|------------|------------|

> **SINH từ tài liệu bằng kỹ thuật** (không "nghĩ ra"): EP/BVA từ bảng validate SRS FR-07/12/13/14; decision table (mỗi dòng = 1 TC) FR-07/02/15/16; state transition E-01..04; ma trận quyền actor×hành động + IDOR; §7b out-of-order; contract từ ví dụ JSON api-spec.
> **Nhãn:** `[UAT]` = cần Postgres/runtime, hoãn B6 · `[R]` = regression · `[U]` = đã có unit test dev phủ (xác nhận ở B4).
> **Trạng thái B4:** cột "KQ thực tế (B4)" = kết quả rà tĩnh/unit; TC `[UAT]` để trống (chưa chạy) — chạy ở B6.

## 1. Quy ước
- **TC-ID:** `TC-<FR>-<số>`. **Mức lỗi:** Blocker/Critical/Major/Minor. **Trạng thái:** Pass/Fail/Blocked/N-A/[UAT chưa chạy].
- Dữ liệu ẩn danh (PDPL). Base ví dụ: `contactName="Le Van A"`, `email="a@cty.example"`, `phone="0912345678"`, `companyName="Cong ty A"`.

---

## 2. G3 Lead — FR-07 (EP/BVA từ bảng validate SRS §3.2)

| TC-ID | FR / nguồn | Tiền điều kiện | Bước + Dữ liệu | Kết quả kỳ vọng (trích tài liệu) | KQ thực tế (B4) | Trạng thái | Mức |
|-------|-----------|----------------|----------------|----------------------------------|-----------------|:---:|-----|
| TC-FR07-01 `[U]` | contactName EP hợp lệ | — | `contactName="Le Van A"` (8 ký tự) | valid; không lỗi field | Khớp `validation.test.ts` | Pass | — |
| TC-FR07-02 `[U]` | contactName BVA min−1 | — | 1 ký tự `"A"` | LEAD-001, msg "Vui lòng nhập họ tên (2–100 ký tự)" | Khớp mã (len<2) | Pass | Major |
| TC-FR07-03 | contactName BVA min | — | 2 ký tự `"Le"` | valid | Khớp mã | Pass | — |
| TC-FR07-04 | contactName BVA max | — | 100 ký tự | valid | Khớp mã (≤100) | Pass | — |
| TC-FR07-05 `[U]` | contactName BVA max+1 | — | 101 ký tự | LEAD-001 msg họ tên | Khớp mã | Pass | Major |
| TC-FR07-06 | contactName toàn khoảng trắng | — | `"   "` | LEAD-001 (trim→len 0) | Khớp mã (trim trước) | Pass | Major |
| TC-FR07-07 `[U]` | email EP sai định dạng | — | `"a@cty"` (thiếu `.tld`) | LEAD-001 "Email không đúng định dạng" | Khớp mã (regex) | Pass | Major |
| TC-FR07-08 | email EP hợp lệ | — | `"a@cty.example"` | valid | Khớp mã | Pass | — |
| TC-FR07-09 | email BVA max+1 | — | local part để tổng >150 ký tự | LEAD-001 email | Khớp mã (>150) | Pass | Minor |
| TC-FR07-10 `[U]` | phone BVA min−1 | — | `"0912345"` (7 chữ số) | LEAD-001 "Số điện thoại chỉ gồm 8–15 chữ số" | Khớp mã (`\d{8,15}`) | Pass | Major |
| TC-FR07-11 | phone BVA min/max | — | `"09123456"` (8) và 15 chữ số | valid | Khớp mã | Pass | — |
| TC-FR07-12 | phone dấu `+` đầu | — | `"+959123456789"` | valid (regex `^\+?\d{8,15}$`) | Khớp mã | Pass | — |
| TC-FR07-13 | phone chứa chữ cái | — | `"09abc12345"` | LEAD-001 phone | Khớp mã | Pass | Major |
| TC-FR07-14 `[U]` | companyName BVA min−1 | — | 1 ký tự | LEAD-001 "…tên doanh nghiệp (2–150…)" | Khớp mã | Pass | Major |
| TC-FR07-15 | companyName BVA max+1 | — | 151 ký tự | LEAD-001 companyName | Khớp mã (>150) | Pass | Minor |
| TC-FR07-16 `[U]` | serviceInterest enum sai | — | `"unknown-slug"` | LEAD-001 "Vui lòng chọn dịch vụ quan tâm" | Khớp mã (SERVICE_SLUGS) | Pass | Major |
| TC-FR07-17 | serviceInterest `general` | — | `"general"` | valid | Khớp mã | Pass | — |
| TC-FR07-18 | serviceInterest 1/18 slug | — | `"dia"` | valid | Khớp mã (18 slug) | Pass | — |
| TC-FR07-19 | message không bắt buộc rỗng | — | `message=""` | valid, message=null | Khớp mã | Pass | — |
| TC-FR07-20 `[U]` | message BVA max+1 | — | 1001 ký tự | LEAD-001 "Lời nhắn tối đa 1000 ký tự" | Khớp mã (>1000) | Pass | Minor |
| TC-FR07-21 | message BVA max | — | 1000 ký tự | valid | Khớp mã | Pass | — |

## 3. FR-07 Decision table (3 điều kiện = 8 dòng — mỗi dòng 1 TC)

> ⚠️ **Thứ tự ưu tiên mã lỗi khác giữa SRS và code** — xem `crosscheck-tester.md` #DISC-01. Cột "Kỳ vọng (SRS bảng)" theo SRS; cột "Code trả" theo pipeline hiện tại. Dòng lệch = điểm cần BA/SA chốt.

| TC-ID | FieldsValid / Consent / AntiSpamOk | Kỳ vọng SRS (bảng FR-07) | Code hiện trả (`decideLead`) | Khớp? | Trạng thái |
|-------|-----------------------------------|--------------------------|------------------------------|:-----:|:---:|
| TC-FR07D-01 `[U]` | Có / Có / Có | Tạo lead `Mới` + email | OK → tạo lead | ✓ | Pass |
| TC-FR07D-02 `[U]` | Có / Có / Không | LEAD-020/021 (spam) | LEAD-021 | ✓ | Pass |
| TC-FR07D-03 `[U]` | Có / Không / Có | LEAD-010 | LEAD-010 | ✓ | Pass |
| TC-FR07D-04 `[U]` | Có / Không / Không | LEAD-010 (ưu tiên consent) | **LEAD-021** | ✗ **DISC-01** | Fail(spec) |
| TC-FR07D-05 `[U]` | Không / Có / Có | LEAD-001 | LEAD-001 | ✓ | Pass |
| TC-FR07D-06 `[U]` | Không / Có / Không | LEAD-001 (báo lỗi trường + spam) | **LEAD-021** | ✗ **DISC-01** | Fail(spec) |
| TC-FR07D-07 `[U]` | Không / Không / Có | LEAD-001 | LEAD-001 | ✓ | Pass |
| TC-FR07D-08 `[U]` | Không / Không / Không | LEAD-001 (gộp) | **LEAD-021** | ✗ **DISC-01** | Fail(spec) |

> `[U]`: `validation.test.ts` phủ `decideLead` theo pipeline (LEAD-021 first) → unit **pass** nhưng **lệch SRS bảng** ở D-04/06/08. Dev khai theo api-spec §3.1 (thắng). Cần BA đồng bộ bảng SRS hoặc SA xác nhận. Severity Minor (khách vẫn bị chặn đúng — chỉ khác thông điệp ưu tiên), Priority do PO/PM.

## 4. FR-10 Chống spam (honeypot + rate-limit sliding window)

| TC-ID | FR / nguồn | Bước + Dữ liệu | Kết quả kỳ vọng | KQ B4 | Trạng thái | Mức |
|-------|-----------|----------------|-----------------|-------|:---:|-----|
| TC-FR10-01 `[U]` | Honeypot `website`≠rỗng | POST với `website="x"` | 200 giả, KHÔNG tạo lead, log cờ spam (FR-07 2c) | Khớp `service.ts` honeypot→`{kind:'honeypot'}`, route trả `ok()` | Pass | — |
| TC-FR10-02 `[U]` | Rate-limit 5 lần đầu qua | 5 submit cùng IP trong 60' | Cả 5 allowed | Khớp `rateLimit.test.ts` | Pass | — |
| TC-FR10-03 `[U]` | Rate-limit lần 6 chặn | Submit thứ 6 trong cửa sổ | LEAD-021 (429) | Khớp `rateLimit.test.ts` + `AppError('LEAD-021')` | Pass | Major |
| TC-FR10-04 `[U]` | Cửa sổ trượt: mốc cũ rơi ra | ví dụ SRS 10:00..10:20 (5), 10:50 chặn, 11:01 qua | Đúng theo ví dụ tính tay SRS | Khớp `rateLimit.test.ts` (ví dụ SRS) | Pass | — |
| TC-FR10-05 | Đếm theo từng IP | 2 IP khác nhau (X-Forwarded-For khác) mỗi IP 5 lần | Không gộp; mỗi IP đếm riêng | Khớp `rateLimit.test.ts` (key=IP) | Pass | Major |
| TC-FR10-06 `[UAT]` | X-Forwarded-For IP trái nhất sau Nginx | Gửi header `X-Forwarded-For: client, proxy1` | Rate-limit theo `client` (trái nhất) | `clientIpFromHeaders` — verify runtime UAT | [UAT] | Major |
| TC-FR10-07 `[UAT][R]` | Double-submit đồng thời | Bấm Gửi 2 lần / 2 request song song 1 form | Chỉ 1 lead tạo (hoặc 2 tính vào rate-limit); UI disable nút | Cần runtime — verify UAT | [UAT] | Major |
| TC-FR10-08 `[UAT]` | Turnstile bật + token sai | secret cấu hình, `turnstileToken` sai | **⚠ DISC-02:** code trả 200 giả (không tạo lead) — mất lead thật? | Verify UAT + chốt SA | [UAT] | Major |

## 5. FR-08/09 Lưu lead + email (side-effect) — [UAT]

| TC-ID | FR | Bước | Kết quả kỳ vọng | Trạng thái | Mức |
|-------|----|------|-----------------|:---:|-----|
| TC-FR08-01 `[UAT][R]` | FR-08 lưu nguyên tử | Submit hợp lệ | 1 row `lead` status=`new` + 1 row `lead_consent` (tx); AC FR-07 | [UAT] | Critical |
| TC-FR08-02 `[UAT]` | FR-07 2e lỗi DB rollback | Ép lỗi persist | LEAD-030 (500), KHÔNG tạo lead một phần | [UAT] | Critical |
| TC-FR09-01 `[UAT]` | FR-09 email báo Sale | Lead `Mới` tạo | Email tới hộp Sale ≤1h (mục tiêu ≤60s); `emailStatus` cập nhật | [UAT] | Major |
| TC-FR09-02 `[UAT]` | FR-09/2f email lỗi không mất lead | SMTP lỗi | Lead vẫn `Mới`, `emailStatus=failed`, không báo lỗi khách | [UAT] | Major |
| TC-FR09-03 `[UAT]` | Địa chỉ Sale chưa cấu hình (AS-09) | ENV thiếu | Không gửi; log lỗi; lead vẫn `Mới` (Admin xem FR-11) | [UAT] | Minor |

## 6. FR-16 Đăng nhập + lockout (decision table 4 dòng + BVA lần sai)

| TC-ID | Mật khẩu đúng / Đang khóa | Kỳ vọng (SRS bảng) | KQ B4 (`lockout.test.ts`/`auth/index.ts`) | Trạng thái | Mức |
|-------|---------------------------|--------------------|-------------------------------------------|:---:|-----|
| TC-FR16-01 `[U]` | Đúng / Không | Tạo phiên 30', reset đếm sai, audit `auth.login` | `evaluateLogin`→`allow`; index reset+audit | Pass | — |
| TC-FR16-02 `[U]` | Đúng / Có | Từ chối (chờ hết khóa) AUTH-010 | `reject_locked`→`LockedError` | Pass | Critical |
| TC-FR16-03 `[U]` | Sai / Không (chưa đủ 5) | AUTH-001 + đếm sai +1 | `reject_bad` locked=false → return null | Pass | Major |
| TC-FR16-04 `[U]` | Sai / Có | AUTH-010 (đang khóa) | `reject_locked` | Pass | Critical |
| TC-FR16-05 `[U]` | BVA lần sai thứ 5 | sai lần 5/15' → `Tạm khóa` AUTH-010 | `newAttempts>=5`→locked | Pass | Critical |
| TC-FR16-06 `[U]` | Khóa hết hạn reset | phút 16 nhập đúng → tạo phiên | `lockExpired`→base=0→allow | Pass | Major |
| TC-FR16-07 | AUTH-001 thông báo chung | email không tồn tại HOẶC sai mật khẩu | cùng AUTH-001, không lộ trường nào sai | `account null`→null; parse fail→null | Pass | Major |
| TC-FR16-08 `[UAT][R]` | argon2id verify thật | seed account + mật khẩu đúng | `verify()` pass, tạo phiên | Cần DB — verify UAT | [UAT] | Critical |
| TC-FR16-09 `[UAT]` | AUTH-010 HTTP 423 | login khi khóa qua Auth.js | envelope code AUTH-010, http 423 | Cần runtime — `errors.ts` map 423 (tĩnh ✓) | [UAT] | Major |

## 7. FR-17 Đăng xuất / hết phiên · FR-18 Audit

| TC-ID | FR | Bước | Kết quả kỳ vọng | KQ B4 | Trạng thái | Mức |
|-------|----|------|-----------------|-------|:---:|-----|
| TC-FR17-01 `[UAT]` | FR-17 đăng xuất | Bấm Đăng xuất | Hủy phiên → SCR-06; audit `auth.logout` | `events.signOut`→audit (tĩnh ✓) | [UAT] | Major |
| TC-FR17-02 `[UAT]` | FR-17 hết phiên 30' | Không thao tác 30', mở /admin | Chuyển login | `session.maxAge=1800`; middleware redirect | [UAT] | Major |
| TC-FR17-03 | ⚠ DISC-03: hết phiên map mã | Phiên hết → gọi API admin | api-spec/FSD nói AUTH-020; middleware trả **AUTH-401** | Lệch — xem crosscheck | [UAT] | Minor |
| TC-FR18-01 `[UAT][R]` | FR-18 audit mutation | Xóa 1 khối | 1 dòng `audit_log` (thời điểm + action + entityId), KHÔNG PII | `writeAudit` mọi mutation (tĩnh ✓) | [UAT] | Minor |

## 8. FR-11 Admin xem lead + state transition E-01 (Mới→Đã xem)

| TC-ID | FR / nguồn | Bước | Kết quả kỳ vọng | Trạng thái | Mức |
|-------|-----------|------|-----------------|:---:|-----|
| TC-FR11-01 `[UAT][R]` | E-01 Mới→Đã xem | Mở lead `Mới` lần đầu | status→`viewed`, `viewedAt/viewedBy` set, audit `lead.view`; 2 lead khác giữ `Mới` | [UAT] | Major |
| TC-FR11-02 `[UAT]` | Mở lead `Đã xem` lại | Mở lần 2 | KHÔNG ghi audit lần 2, giữ `viewed` (idempotent) | [UAT] | Minor |
| TC-FR11-03 `[UAT]` | Empty-state DB rỗng | Chưa lead nào | "Chưa có lead nào" + gợi ý; không bảng rỗng/phân trang | [UAT] | Minor |
| TC-FR11-04 `[UAT]` | Empty-state lọc rỗng | Lọc `serviceInterest=ekyc` không khớp | "Không có lead khớp bộ lọc" + nút xóa lọc | [UAT] | Minor |
| TC-FR11-05 `[UAT]` | Sắp giảm dần + phân trang 20 | >20 lead | createdAt desc, 20/trang | [UAT] | Minor |
| TC-FR11-06 | State transition CẤM: sửa/xóa lead (BR-18) | — | Không có endpoint mutation lead; UI ẩn nút | Xác nhận tĩnh: api-spec không có PATCH/DELETE lead; `adminLeads.ts` chỉ đọc | Pass | Major |
| TC-FR11-07 `[UAT]` | Lead không tồn tại | GET `/api/admin/leads/{id}` id sai | CB-404 (theo api-spec §3.13) | `AppError('CB-404')` (tĩnh ✓) | [UAT] | Minor |

## 9. FR-02/15 Content Block — decision table + state transition E-02

**FR-02 render (decision table 4 dòng):**
| TC-ID | Hiển thị? / Đủ trường locale? | Kỳ vọng | KQ B4 (`blocks.ts`) | Trạng thái |
|-------|-------------------------------|---------|---------------------|:---:|
| TC-FR02-01 `[UAT]` | Có / Có | Hiển thị khối | `passesLocaleRequirement`=true → push | [UAT] |
| TC-FR02-02 `[UAT]` | Có / Không (thiếu VI) | Ẩn ở locale đó (BR-DYN-01), vẫn hiện ở locale đủ | filter continue (tĩnh ✓) | [UAT] |
| TC-FR02-03 `[UAT]` | Không (draft/hidden) / Có | Ẩn (where status='visible') | query lọc status (tĩnh ✓) | [UAT] |
| TC-FR02-04 `[UAT]` | Không / Không | Ẩn | không xảy ra render | [UAT] |
| TC-FR02-05 `[UAT]` | ⚠ DISC-04 tie-break sortOrder | 2 khối cùng sortOrder | SRS: sắp phụ updatedAt desc; **public `blocks.ts` thiếu tiebreak này** | [UAT] |

**FR-15 bật hiển thị (decision table 4 dòng) + reorder:**
| TC-ID | Trạng thái∈{Nháp,Ẩn}? / Đủ EN? | Kỳ vọng | KQ B4 (`service.ts setVisibility`/`canPublish`) | Trạng thái |
|-------|--------------------------------|---------|--------------------------------------------------|:---:|
| TC-FR15-01 `[U]` | Có / Có | →`visible` | `canPublish`=true → update visible | Pass |
| TC-FR15-02 `[U]` | Có / Không | Chặn CB-010 (422) | `!canPublish`→`AppError('CB-010')` | Pass |
| TC-FR15-03 | Không (đang visible) / — | nút bật ẩn (không áp dụng) | FSD ẩn nút; setVisibility('show') trên visible vẫn re-check | Pass |
| TC-FR15-04 `[U]` | canPublish 3 loại | highlight(title+desc)/partner(title+logo)/stat(title+value) | `validation.test.ts` phủ `canPublish` | Pass |
| TC-FR15-05 `[UAT][R]` | Tắt hiển thị | visible→hide | status=`hidden`, revalidateTag, audit | [UAT] |
| TC-FR15-06 `[UAT]` | Reorder tie-break | items cùng sortOrder | list admin: orderBy sortOrder,updatedAt desc (tĩnh ✓); public thiếu (DISC-04) | [UAT] |
| TC-FR15-07 `[U]` | sortOrder < 0 | reorder/create sortOrder=-1 | "Thứ tự là số nguyên ≥ 0"; reorder filter loại item xấu | Pass (validation.test) |
| TC-FR15-08 `[UAT][R]` | revalidate lan public | bật/ẩn/reorder/xóa | `revalidateTag('content-blocks')` gọi; public ≤TTL | `revalidate.test.ts` mock ✓; runtime [UAT] | [UAT] |

**State transition E-02 CẤM:**
| TC-ID | Chuyển cấm | Kỳ vọng | KQ B4 | Trạng thái |
|-------|-----------|---------|-------|:---:|
| TC-E02-01 `[UAT]` | Bật hiển thị khối `Đã xóa` | CB-404 (không tồn tại/deleted) | `findFirst deletedAt:null`→CB-404 (tĩnh ✓) | [UAT] |
| TC-E02-02 `[UAT]` | Sửa khối `Đã xóa` | CB-404 / "Khối đã xóa" | `updateBlock` findFirst deletedAt:null→CB-404 | [UAT] |
| TC-E02-03 `[UAT]` | Xóa khối đã xóa (lặp) | CB-404 | `softDeleteBlock` findFirst→CB-404 | [UAT] |

## 10. FR-12/13/14 Validate khối (EP/BVA per loại) — `[U]` `validation.test.ts` (19)

| TC-ID | Loại / trường | Dữ liệu | Kỳ vọng | KQ B4 | Trạng thái |
|-------|---------------|---------|---------|-------|:---:|
| TC-FR12-01 `[U]` | Highlight title EN min−1 | 1 ký tự | CB-001 "Tiêu đề EN bắt buộc (2–120)" | Khớp | Pass |
| TC-FR12-02 `[U]` | Highlight title EN max+1 | 121 ký tự | CB-001 | Khớp | Pass |
| TC-FR12-03 `[U]` | Highlight desc EN bắt buộc rỗng | "" | CB-001 "Mô tả EN bắt buộc (2–300)" | Khớp | Pass |
| TC-FR12-04 | Highlight link sai | `"ftp://x"` | CB-001 "Link phải bắt đầu http/https" | Khớp `LINK_RE` | Pass |
| TC-FR13-01 `[U]` | Partner logo thiếu | `payload.logoUrl=""` | CB-001 "Logo đối tác bắt buộc" | Khớp | Pass |
| TC-FR13-02 | Partner title bắt buộc | "" | CB-001 tên đối tác | Khớp | Pass |
| TC-FR14-01 `[U]` | Stat value regex sai | `"abc"` | CB-001 value regex msg | Khớp `STAT_VALUE_RE` | Pass |
| TC-FR14-02 `[U]` | Stat value hợp lệ | `"1.200+"`, `"63"`, `"99%"` | valid | Khớp | Pass |
| TC-FR14-03 `[U]` | Stat value chỉ ký tự đặc biệt | `"++"` (không chữ số) | CB-001 (lookahead `(?=.*[0-9])`) | Khớp | Pass |
| TC-FR14-04 | ⚠ DISC-05 VI min | VI title="A" (1 ký tự) | SRS: VI chỉ có max, không min → nên hợp lệ; **code min 2 → CB-001** | Lệch min | Fail(spec) Minor |

## 11. Ma trận quyền actor×hành động + IDOR (§4 kỹ thuật) — [UAT] gọi thẳng API

| TC-ID | Ô ✗ / hành động cấm | Bước (gọi thẳng API, không qua UI) | Kỳ vọng | KQ B4 (tĩnh) | Trạng thái |
|-------|---------------------|-------------------------------------|---------|--------------|:---:|
| TC-AUTHZ-01 `[UAT][R]` | Khách gọi `/api/admin/content-blocks` | Không cookie | AUTH-401 (401) | middleware chặn + `requireAdmin` (tĩnh ✓) | [UAT] |
| TC-AUTHZ-02 `[UAT][R]` | Khách gọi `/api/admin/leads` | Không cookie | AUTH-401 | middleware + guard (tĩnh ✓) | [UAT] |
| TC-AUTHZ-03 `[UAT]` | Khách GET `/api/admin/leads/{id}` (lộ PII) | Không cookie | AUTH-401, KHÔNG trả PII | guard trước `getLeadAndMarkViewed` (tĩnh ✓) | [UAT] |
| TC-AUTHZ-04 `[UAT]` | POST/PATCH/DELETE mọi admin endpoint không auth | 6 endpoint content + 2 lead | AUTH-401 mỗi cái | middleware `/api/admin/*` (tĩnh ✓) | [UAT] |
| TC-AUTHZ-05 `[UAT]` | Trang `/{locale}/admin/*` chưa login | GET page | 302 → login (NFR-03) | middleware redirect (tĩnh ✓) | [UAT] |
| TC-IDOR-01 `[UAT]` | Đổi id khối của "người khác" | PATCH block id bất kỳ với phiên admin | MVP 1 admin → mọi khối chung; không rò rỉ cross-tenant | Ghi chú: 1 role, IDOR hẹp | [UAT] |

## 12. §7b Test chéo API out-of-order (tìm lỗi backend) — [UAT] B6 lớp ①

| TC-ID | Biến thể | Bước | Kỳ vọng duy nhất đúng | Trạng thái |
|-------|----------|------|------------------------|:---:|
| TC-OOO-01 `[UAT]` | Chuyển trạng thái cấm | Bật hiển thị khối đã soft-delete (id còn) | CB-404, KHÔNG 500, không đổi trạng thái | [UAT] |
| TC-OOO-02 `[UAT]` | Lặp bước đã xong | Gọi DELETE 2 lần cùng id | Lần 2 CB-404, không nhân đôi side-effect | [UAT] |
| TC-OOO-03 `[UAT]` | Thao tác bản ghi đã đóng | PATCH khối `deleted` | CB-404 (findFirst deletedAt:null) | [UAT] |
| TC-OOO-04 `[UAT]` | Nhảy thẳng mark-viewed | GET lead {id} chưa tồn tại | CB-404 | [UAT] |
| TC-OOO-05 `[UAT]` | Double toggle visibility | show rồi show lại | idempotent (giữ visible), audit đúng | [UAT] |
| TC-OOO-06 `[UAT]` | Publish khối thiếu EN qua API | PATCH visibility show, EN rỗng | CB-010 (422), không lên visible | [UAT] |
| TC-OOO-07 `[UAT]` | Reorder id không tồn tại | items có id lạ | Bỏ qua an toàn hoặc lỗi rõ, không hỏng khối khác | [UAT] |

## 13. G1/G2 Public render — FR-01/03/04/05

| TC-ID | FR | Bước | Kết quả kỳ vọng | KQ B4 | Trạng thái | Mức |
|-------|----|------|-----------------|-------|:---:|-----|
| TC-FR01-01 `[UAT]` | Empty-state landing | Mọi khối động ẩn/nháp | Render hero + 4 section tĩnh; 3 cụm khối động thu gọn | blocks→[] khi rỗng (tĩnh ✓) | [UAT] | Minor |
| TC-FR01-02 `[UAT]` | Lỗi DB khối động | DB lỗi | Bỏ qua khối lỗi, phần tĩnh vẫn render, không toast | try/catch→[] (tĩnh ✓) | [UAT] | Major |
| TC-FR03-01 `[UAT]` | Đổi EN↔VI | Toggle | Đổi tiền tố URL /en /vi, giữ trang | `LocaleSwitcher` + next-intl | [UAT] | Major |
| TC-FR03-02 `[UAT]` | Đổi ngôn ngữ giữ dữ liệu form | Nhập họ tên rồi đổi | Ô họ tên giữ giá trị (AC FR-03) | Cần runtime UI | [UAT] | Minor |
| TC-FR03-03 | MY ẩn (BR-11) | — | Không render lựa chọn MY | `LocaleSwitcher` MY ẩn (tĩnh ✓) | Pass | Minor |
| TC-FR04-01 `[UAT]` | 18 card / 3 nhóm (7/3/8) | Mở SCR-02 | Đếm 18 card, nhóm 7/3/8 | index.ts validate 7/8/3 build-time; 18 json ✓ | [UAT] | Major |
| TC-FR05-01 `[UAT]` | Chi tiết dịch vụ 7/8 trường | `/vi/services/dia` | 7 trường, ẩn Price Policy, CTA prefill "dia" | `[slug]/page.tsx` template (tĩnh ✓) | [UAT] | Major |
| TC-FR05-02 `[UAT]` | Slug sai → 404 | `/vi/services/xxx` | 404 song ngữ + link landing (notFound) | `generateStaticParams`+notFound (tĩnh ✓) | [UAT] | Major |
| TC-FR05-03 `[UAT]` | Thiếu bản dịch trường → EN fallback | Trường thiếu VI | Hiển thị EN cho trường đó (FR-05 1b) | `loader.ts` fallback VI→EN (tĩnh ✓) | [UAT] | Minor |
| TC-FR06-01 `[UAT]` | CTA prefill | Bấm CTA từ SCR-03 | Form ô dịch vụ = dịch vụ đó (`serviceInterest=slug`) | prefill (tĩnh ✓) | [UAT] | Major |

## 14. Contract test (đối chiếu ví dụ JSON api-spec) — [UAT] response thật

| TC-ID | Endpoint | Kỳ vọng envelope/schema | KQ B4 (tĩnh) | Trạng thái |
|-------|----------|--------------------------|--------------|:---:|
| TC-CT-01 `[UAT]` | POST /api/leads 200 | `{success,data:{leadId,status:"new"},meta.correlationId}` | `ok()` envelope (tĩnh ✓) | [UAT] |
| TC-CT-02 `[UAT]` | POST /api/leads 400 LEAD-001 + details[] | `{success:false,error:{code,message},details[]}` | `failFrom`+AppError details (tĩnh ✓) | [UAT] |
| TC-CT-03 `[UAT]` | GET /api/public/content-blocks | items[] {id,blockType,sortOrder,title,description,payload} | route shape (tĩnh — verify field names) | [UAT] |
| TC-CT-04 `[UAT]` | GET /api/admin/content-blocks | items[]+total+page+pageSize+totalPages, i18n{en,vi} | `listBlocks` (tĩnh ✓) | [UAT] |
| TC-CT-05 `[UAT]` | GET /api/admin/leads/{id} | lead đầy đủ + consent{given,consentTextVersion,givenAt} | `getLeadAndMarkViewed` (tĩnh ✓) | [UAT] |
| TC-CT-06 `[UAT]` | 14/14 endpoint status code + mã lỗi | khớp api-spec §3 | Rà tĩnh: `errors.ts` map http đúng | [UAT] |

## 15. NFR (có số đo) — [UAT] B6

| TC-ID | NFR | Ngưỡng | Trạng thái |
|-------|-----|--------|:---:|
| TC-NFR01 `[UAT]` | NFR-01 Lighthouse mobile ≥80; LCP<2.5s; TTFB P95<500ms | đo số | [UAT] |
| TC-NFR02 `[UAT]` | NFR-02 contrast ≥4.5:1; prefers-reduced-motion; keyboard; alt | đo/kiểm | [UAT] |
| TC-NFR03 `[UAT]` | NFR-03 HTTPS; khóa 5/15; session 30'; 302 khi chưa auth | verify | [UAT] |
| TC-NFR06 `[UAT]` | NFR-06 email ≤1h; retry ≤3; mất email không mất lead | verify | [UAT] |
| TC-NFR07 `[UAT]` | NFR-07 URL riêng/slug; meta title/desc; sitemap | verify (18×2 locale) | [UAT] |

---

## 16. Độ phủ TC → FR

| FR | Số TC | Có biên? | Có lỗi? | Ghi chú |
|----|:-----:|:---:|:---:|---------|
| FR-01 | 2 | — | ✓ | empty-state + lỗi DB [UAT] |
| FR-02 | 5 | — | ✓ | decision table 4 + tie-break DISC-04 |
| FR-03 | 3 | — | — | i18n, MY ẩn |
| FR-04 | 1 | — | — | 18 card 7/3/8 |
| FR-05 | 3 | — | ✓ | 404, fallback EN |
| FR-06 | 1 | — | — | prefill |
| FR-07 | 21+8 | ✓ | ✓ | EP/BVA 21 + decision table 8 |
| FR-08 | 2 | — | ✓ | lưu tx, rollback [UAT] |
| FR-09 | 3 | — | ✓ | email fallback [UAT] |
| FR-10 | 8 | ✓ | ✓ | honeypot + rate-limit + turnstile |
| FR-11 | 7 | — | ✓ | state transition + empty-state |
| FR-12 | 4 | ✓ | ✓ | validate Highlight |
| FR-13 | 2 | — | ✓ | Partner logo |
| FR-14 | 4 | ✓ | ✓ | Stat regex + DISC-05 |
| FR-15 | 8 | ✓ | ✓ | decision table 4 + reorder + revalidate |
| FR-16 | 9 | ✓ | ✓ | decision table 4 + lockout BVA |
| FR-17 | 3 | — | ✓ | logout + expiry DISC-03 |
| FR-18 | 1 | — | — | audit |
| Quyền/IDOR | 6 | — | ✓ | ma trận + [UAT] |
| §7b OOO | 7 | — | ✓ | out-of-order [UAT] |
| Contract | 6 | — | ✓ | 14 endpoint [UAT] |
| NFR | 5 | — | — | [UAT] số đo |

**Tổng: ~118 TC** · phủ **18/18 FR (100%)** · 4 decision table đủ dòng (8+4+4+4) · state transition E-01/E-02 (hợp lệ + cấm) · ma trận quyền + IDOR + §7b out-of-order.
- **Chạy/verify được ở B4 (static+unit): ~45 TC** (đa số Pass, 4 Fail-spec do DISC-01, 1 Fail-spec DISC-05).
- **Đánh dấu [UAT] (cần Postgres/runtime, hoãn B6): ~73 TC.**

## 17. Tổng hợp kết quả B4
Xem `docs/qa/test-report.md`. TC Fail (spec) → điểm nghi ngờ trong `docs/qa/crosscheck-tester.md` (DISC-01..05), **không phải bug code chặn cổng** — cần BA/SA chốt tài liệu.
