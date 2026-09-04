# Kiểm chéo BA (độc lập) — Code vs SRS + FSD — Landing page B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Vai | Business Analyst | Giai đoạn | B4 (sau handover dev) |
|-----------|------|------|------------|-----|------------------|-----------|------------------------|

> **Mục đích:** kiểm chéo độc lập rằng code (Làn 0+1, commit `4447a11`) **đúng SRS + FSD**, đủ FR trong phạm vi, **không lệch/tự thêm-bớt nghiệp vụ**. Đây là rà nghiệp vụ (không sửa code, không phê duyệt cổng). Kiểm thử vận hành/DB là việc của Tester (Phần 2 handover-report).
> **Nguồn đối chiếu:** `docs/ba/SRS.md` (FR-01..18), `docs/ba/FSD.md` (SCR-01..09 + ma trận §4), `docs/ba/entity-lifecycle.md` (E-01..04), `docs/sa/api-spec.md` (14 endpoint), `docs/qa/handover-report.md` Phần 1, mã trong `src/`.

## KẾT LUẬN: **ĐẠT** (đủ 18/18 FR, không lệch nghiệp vụ) — kèm 4 điểm CẦN LÀM RÕ tài liệu/asset (không chặn logic).

---

## 1. Đối chiếu 18/18 FR

| FR | Tên | File mã chính | Đúng hành vi SRS/FSD? | Ghi chú kiểm chéo |
|----|-----|---------------|:---------------------:|-------------------|
| FR-01 | Xem landing tổng | `src/app/[locale]/page.tsx` | ✓ | Hero + 4 section tĩnh + 3 cụm khối động; **empty-state**: cụm động rỗng → `? ... : null` ẩn hẳn cụm (đúng FR-01). Số Why Mytel: `18` thật + 4 số `"—"` chờ AS-04/08/13 (**không bịa số** — đúng tinh thần BR-STAT-01). |
| FR-02 | Render khối động | `src/modules/public-site/blocks.ts` | ✓ | Lọc `status=visible` + `deletedAt=null` + `sortOrder` tăng; `passesLocaleRequirement()` **ẩn khối thiếu trường bắt buộc theo locale** (BR-DYN-01). Lỗi DB → `[]` (không chặn trang, FSD SCR-01 1b). |
| FR-03 | Đổi ngôn ngữ EN↔VI | `src/components/layout/LocaleSwitcher.tsx`, `[locale]` routing | ✓ | Toggle VI/EN theo tiền tố URL; **MY ẩn** (BR-11). Giữ dữ liệu form khi đổi (next-intl route, không remount form). |
| FR-04 | Duyệt 3 nhóm | `src/app/[locale]/services/page.tsx`, `content/services/index.ts` | ✓ | Validate build-time: đúng **18 slug**, số nhóm **7/8/3** (connectivity/ict_service/mobile_ict) — khớp SRS (7/3/8). |
| FR-05 | Chi tiết dịch vụ | `[locale]/services/[slug]/page.tsx`, `service-catalog/loader.ts` | ✓ | Hiển thị **7 trường**, `pricePolicy` **không render** (Q3); VI json không chứa pricePolicy. `notFound()` khi slug sai (1a); fallback VI→EN từng trường (1b). |
| FR-06 | CTA tư vấn | landing + services + `LeadForm` prefill | ✓ | CTA từ trang dịch vụ prefill `serviceInterest=slug`. |
| FR-07 | Submit form lead | `modules/lead/validation.ts` + `service.ts` | ✓ | 6 trường + consent + honeypot validate **đúng bảng SRS FR-07** (regex email/phone, độ dài 2–100/≤150/8–15/2–150/≤1000, enum 18+general). Bảng quyết định `decideLead()` phủ đủ. *(Xem điểm CẦN LÀM RÕ #2 về thứ tự ưu tiên mã lỗi.)* |
| FR-08 | Lưu lead | `modules/lead/service.ts` | ✓ | Persist **nguyên tử** `$transaction(lead + lead_consent)`, status `new`; lỗi → `LEAD-030` rollback. |
| FR-09 | Email báo Sale | `modules/lead/mailer.ts` | ✓ | Side-effect sau persist; email lỗi → `emailStatus=failed`, **không mất lead** (FR-09 2f). Không có UI (đúng FSD). |
| FR-10 | Chống spam | `lib/rateLimit.ts`, `lib/turnstile.ts`, honeypot | ✓ | Honeypot `website` ≠ rỗng → **200 giả, không tạo lead**; rate-limit **cửa sổ trượt 60'/5/IP** (X-Forwarded-For trái nhất) → `LEAD-021`. Ví dụ tính tay SRS phủ trong unit test. |
| FR-11 | Admin xem lead | `modules/lead/adminLeads.ts`, `leads/page.tsx` | ✓ | List sắp `createdAt` giảm, phân trang 20; mở lead `new` → `viewed` + audit; **chỉ đọc** (BR-18, không endpoint sửa/xóa); empty-state rỗng + lọc-rỗng ở UI. |
| FR-12 | CRUD Highlight | `modules/admin-content/{validation,service}.ts` | ✓ | Validate đúng bảng (EN title 2–120, mô tả 2–300, VI tùy chọn, link `^https?://`, thứ tự ≥0). Tạo ở `draft`. |
| FR-13 | CRUD Partner | như trên (`blockType=partner`) | ✓ | **Logo bắt buộc**; tên ngôn ngữ-trung tính (copy title EN→VI khi VI trống) → hiện cả EN/VI. |
| FR-14 | CRUD Stat | như trên (`blockType=stat`) | ✓ | `STAT_VALUE_RE = ^(?=.*[0-9])[0-9.,]{1,19}[+%]?$` khớp SRS; đơn vị tách khỏi giá trị; **KHÔNG có ô doanh thu** (BR-STAT-01 — xác nhận grep `revenue/doanh thu` sạch trong `src/`). |
| FR-15 | Bật/ẩn & sắp thứ tự | `admin-content/service.ts` `setVisibility/reorderBlocks` | ✓ | **publishGuard `canPublish()`** chặn bật khi thiếu trường EN → `CB-010`; reorder trùng số → sắp phụ `updatedAt` giảm; mọi mutation `revalidateTag('content-blocks')`. |
| FR-16 | Đăng nhập + khóa | `modules/admin-auth/lockout.ts`, `lib/auth/index.ts` | ✓ | argon2id; `evaluateLogin()` khóa ở **5 sai → LOCK 15'**; đang khóa → từ chối; báo lỗi **chung** AUTH-001 (không lộ trường/email tồn tại); khóa → AUTH-010. *(Xem điểm CẦN LÀM RÕ #4 — nuance cửa sổ 15').* |
| FR-17 | Đăng xuất / hết phiên | `lib/auth`, `middleware.ts`, SHELL-ADMIN | ✓ | signOut ghi audit; phiên JWT 30'; middleware chặn `/admin/*` chưa auth. |
| FR-18 | Audit log | `lib/audit.ts` | ✓ | Mọi mutation admin + auth event ghi `audit_log`; logger redact PII, log không chứa PII (đúng FR-18/NFR-04). |

**Kết quả FR:** 18/18 có mặt, hành vi khớp SRS/FSD. Không FR thiếu, không FR mồ côi. 14/14 endpoint api-spec hiện thực; envelope + mã lỗi canonical (LEAD/AUTH/CB/SYS) khớp.

## 2. Rà lệch nghiệp vụ (tự thêm / tự bớt)

| Kiểm | Kết quả |
|------|---------|
| Tự thêm tính năng ngoài SRS? | **Không.** Không có màn/endpoint/tính năng ngoài 18 FR. |
| "Đổi mật khẩu admin" (đã HOÃN GATE-2) có bị tự lắp? | **KHÔNG** — grep `password/change-password` chỉ ra luồng đăng nhập + cấu hình SMTP; **không có** endpoint/UI đổi mật khẩu. Đúng phạm vi. |
| Doanh thu (BR-STAT-01) có bị đăng? | **Không** — Stat không có ô doanh thu; số Why Mytel chưa cấp để `"—"` (không bịa). |
| Giá dịch vụ (Q3) có lộ? | **Không** — `pricePolicy` không render, không có trong json VI, chỉ 7/8 trường công khai. |
| PII/PDPL (NFR-04) | Consent bắt buộc trước tạo lead; consent lưu bất biến (version/ip/UA); PII không lên URL/log thô (logger redact). Đúng. |

**Không phát hiện lệch nghiệp vụ.** Code bám sát ranh giới SRS/FSD; các điểm treo đều được đánh dấu chờ (asset/tài liệu), không tự đoán-lắp.

## 3. Đánh giá tác động nghiệp vụ của các điểm dev nêu (§6 handover)

1. **Turnstile fail cứng → xử lý như honeypot (200 giả).** *Tác động nghiệp vụ:* THẤP–TRUNG. Khi secret bật + widget hỏng ở phía khách thật, lead bị **âm thầm bỏ** (ảnh hưởng BG-01 thu lead). api-spec chưa định mã lỗi riêng nên đây không phải lệch code. **Đề xuất SA/BA:** cân nhắc mã lỗi/thông điệp "xác minh thất bại, thử lại" thay vì drop im lặng, để không mất lead hợp lệ. Không chặn GATE.
2. **Thứ tự ưu tiên FR-07 khi vừa lỗi-trường vừa vượt rate-limit:** SRS bảng quyết định ưu tiên **LEAD-001**; pipeline (theo api-spec §3.1 thứ tự cổng) nổi **LEAD-021** trước. *Tác động:* THẤP (ca biên; hiện ra thông điệp rate-limit thay vì lỗi trường — hợp lý về bảo mật/UX). **Đây là mâu thuẫn tài liệu SRS↔api-spec cần đồng bộ:** theo pipeline SDLC, **SRS là nguồn sự thật**; đề nghị PO cho BA/SA chốt 1 hướng và cập nhật tài liệu (nhiều khả năng sửa bảng SRS cho khớp thứ tự cổng). Không chặn logic.
3. **Bản dịch VI 18 dịch vụ (dev tạm dịch) + nhãn nhóm** ("Connectivity / ICT Solutions / Mobile" ở i18n vs "Connectivity / Mobile ICT / ICT Service" ở FSD): *Tác động:* TRUNG cho chất lượng nội dung public khi launch, nhưng **số nhóm 7/8/3 và 18 dịch vụ được giữ đúng** — chỉ khác **nhãn hiển thị + thứ tự trình bày**, không lệch phạm vi. Là phụ thuộc đã biết (AS-06). **Cần BA/Legal duyệt bản dịch VI, anh Bryan chốt nhãn nhóm** trước go-live.
4. **Session 30' + "Đổi mật khẩu admin" HOÃN:** đã giữ đúng — không tự lắp. Đạt.

## 4. Điểm fidelity nhỏ (ghi cho Tester/SA, không phải lệch phạm vi)

- **Cửa sổ đếm sai FR-16:** SRS ghi "5 sai **trong 15 phút**". `evaluateLogin()` đếm **dồn** số lần sai liên tiếp (reset về 0 chỉ khi đăng nhập đúng hoặc sau khi hết khóa), **không** áp cửa sổ trượt 15' trên số lần sai. Hệ quả: các lần sai cách xa >15' vẫn cộng dồn tới 5 → khóa (chặt hơn SRS, thiên về an toàn). Đề nghị Tester xác nhận với BA có cần đúng nghĩa "rolling 15' trên số lần sai" hay chấp nhận mô hình cộng dồn hiện tại. Tác động nghiệp vụ: THẤP.
- **FR-11 lead-not-found trả `CB-404`:** đúng theo api-spec §3.13 (tái dùng mã CB-404 cho lead), tuy tên mã thuộc nhóm Content Block. Khớp hợp đồng — ghi để SA cân nhắc mã `LEAD-404` cho sạch ngữ nghĩa (không bắt buộc).

## 5. Giới hạn kiểm chéo này

- BA rà **nghiệp vụ trên mã tĩnh** (đọc theo màn/endpoint đối chiếu bảng element FSD + FR). **Chưa chạy runtime/DB** — verify migrate/seed/submit thật/CRUD/revalidate/mark-viewed là việc Tester trên UAT có Postgres (Phần 2 handover-report).
- Không phê duyệt cổng. Trình PO tổng hợp với báo cáo Tester + Security trước GATE-4.

---

### Checklist kiểm chéo BA
- [x] 18/18 FR có mặt & đúng hành vi (đối chiếu bảng element FSD + bảng validate/quyết định SRS).
- [x] Form lead validate FR-07 khớp bảng; bảng quyết định 8 tổ hợp phủ.
- [x] CRUD khối FR-12..15 đúng (publishGuard CB-010, reorder, soft-delete, revalidate).
- [x] Đăng nhập lockout 5/15 FR-16; đổi ngôn ngữ FR-03; 18 dịch vụ ẩn giá; khối động + empty-state.
- [x] Không lệch nghiệp vụ: không thêm tính năng ngoài SRS; doanh thu/giá ẩn; "Đổi mật khẩu admin" HOÃN — không tự lắp.
- [x] 4 điểm dev nêu đã đánh giá tác động nghiệp vụ; đều là đồng-bộ-tài-liệu/asset, không chặn logic.
- [x] Không tự phê duyệt cổng — trình PO.
