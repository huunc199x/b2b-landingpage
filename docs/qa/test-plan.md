# Test Plan — Landing page dịch vụ B2B Mytel (+ Admin CMS-lite)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Trạng thái | DRAFT (B4) | Vai | Senior Tester/QA |
|-----------|------|------|------------|------------|------------|-----|-------------------|

> Nguồn suy test: `docs/ba/SRS.md` (FR-01..18, NFR-01..10), `docs/ba/FSD.md` (SCR-01..09, SHELL-ADMIN, ma trận trạng thái×hành động E-01..04), `docs/sa/api-spec.md v1.0` (14 endpoint + envelope + mã lỗi canonical). Handover dev: `docs/qa/handover-report.md` (commit `4447a11`, nhánh `feature/scaffold-foundation`).
> Kỹ thuật thiết kế: `tester/references/test-design-techniques.md` (EP/BVA · decision table · state transition · ma trận quyền/IDOR · §7b out-of-order · risk-based · contract/NFR).

## 1. Phạm vi

**Trong phạm vi (B4):** kiểm chứng tĩnh + unit của Làn 0 (scaffold) + Làn 1 (tính năng G1–G5), 18 FR:
- G1 Public site (FR-01/02/03) · G2 Service catalog (FR-04/05/06) · G3 Lead (FR-07/08/09/10/11) · G4 Admin content (FR-12/13/14/15) · G5 Admin auth (FR-16/17/18).
- 14 endpoint api-spec + 9 màn (SCR-01..09) + SHELL-ADMIN.

**Ngoài phạm vi B4 (chuyển UAT/B6 hoặc vai khác):**
- Runtime end-to-end cần Postgres (submit lead lưu DB, login/lockout thật, CRUD khối, revalidate lan public, mark-viewed) → **hoãn UAT/B6** vì build env chưa có Postgres.
- Bố cục pixel/wireframe/token (`[chờ design.md]`) → không kiểm ở B4.
- Pentest chuyên sâu (STRIDE/OWASP đầy đủ) → vai **security-engineer** B5.
- NFR đo bằng công cụ (Lighthouse, LCP, TTFB P95, load test) → cần môi trường chạy thật → **UAT/B6**.

## 2. Chiến lược kiểm thử

### 2.1 Giai đoạn hiện tại (B4 — static + unit, KHÔNG Postgres)
| Lớp | Cách làm | Công cụ |
|-----|----------|---------|
| **Rà code so tài liệu** | Đọc `src/` đối chiếu SRS/FSD/api-spec: envelope, mã lỗi, tên trường, thứ tự pipeline, ma trận quyền, decision table, state guard | Đọc thủ công + Grep |
| **Unit test (dev viết)** | Chạy `npm test` xác nhận số pass/fail thật; đọc từng file test đối chiếu FR | Vitest |
| **Typecheck/build** | `npx tsc --noEmit` + (dev) `npm run build` — xác nhận build xanh | tsc / next build |
| **Contract (tĩnh)** | Đối chiếu shape route handler ↔ ví dụ JSON api-spec (envelope, code, field) | Đọc mã |

### 2.2 Giai đoạn sau (UAT/B6 — runtime, có Postgres) — chỉ liệt kê, KHÔNG chạy ở B4
- Lớp ① API (chạy bằng lệnh): contract 14 endpoint + chuỗi nghiệp vụ walkthrough + **§7b test chéo out-of-order** (bỏ bước, chuyển trạng thái cấm, lặp bước, tham chiếu chéo sai, double-submit).
- Lớp ② Security UAT (security-engineer).
- Lớp ③ UI: 4 trạng thái mỗi màn, empty-state, rà cột Hiển thị (không lộ ID kỹ thuật).
- NFR có số đo (Lighthouse ≥80, LCP<2.5s, TTFB P95<500ms, contrast 4.5:1, email ≤1h).

Mọi TC cần Postgres/runtime được đánh dấu **[UAT]** trong `test-cases.md`.

## 3. Ma trận rủi ro + thứ tự ưu tiên (risk-based)

| Nhóm chức năng | Tác động khi hỏng | Xác suất hỏng | Mức rủi ro | Thứ tự |
|----------------|-------------------|---------------|:----------:|:------:|
| G5 Admin auth (FR-16 lockout, phiên, authz `/api/admin/*`) | **Cao** (quyền, brute-force) | Cao (logic mới, security) | 🔴 **Cao nhất** | 1 |
| G3 Lead pipeline (FR-07/10 validate + anti-spam + consent PDPL) | **Cao** (mất lead, PII, spam) | Cao (nhiều cổng, decision table) | 🔴 **Cao** | 2 |
| G4 Admin content (FR-15 publishGuard CB-010, state transition) | Trung bình (nội dung public sai) | Cao (state machine) | 🟠 Trung-Cao | 3 |
| G3 view lead / IDOR (FR-11 mark-viewed, chỉ đọc BR-18) | Trung bình (lộ PII qua API) | Trung bình | 🟠 Trung | 4 |
| G1/G2 Public render (FR-01/02/04/05 empty-state, i18n, 404) | Thấp-TB (UX) | Trung bình | 🟡 Trung | 5 |
| FR-18 audit, FR-09 email | Thấp (không mất lead) | Thấp | 🟢 Thấp | 6 |

Thiếu thời gian → cắt từ ô 🟢 lên, **không cắt** G5/G3.

## 4. Môi trường & dữ liệu thử

- **Build env hiện tại:** Node ≥24, Next.js 15, Vitest 2.1.9. **KHÔNG có Postgres** → runtime DB test hoãn.
- **UAT (B6):** cần devops dựng stack (Postgres + `prisma migrate deploy` + `db:seed` + SMTP relay + Turnstile secret + Nginx `X-Forwarded-For`). Base URL UAT `<chờ cấp>`.
- **Dữ liệu thử:** ẩn danh (PDPL) — không PII thật. Ví dụ chuẩn: `contactName="Le Van A"`, `email="a@cty.example"`, `phone="0912345678"`, `companyName="Cong ty A"`, `serviceInterest="dia"`.
- **Tài khoản admin:** seed từ AS-14 (`prisma/seed.ts`), mật khẩu ≥12 ký tự argon2id.

## 5. Exit criteria (định lượng)

**B4 (static + unit) — cổng GATE-4 phần tĩnh:**
- [x] `npm test` 100% pass (đạt: 56/56).
- [x] `npx tsc --noEmit` sạch (đạt); `npm run build` xanh (dev khai; xác nhận lại nếu build được).
- [x] 100% FR (18/18) có ≥1 TC ánh xạ.
- [x] 100% dòng decision table có TC (FR-07: 8 · FR-02: 4 · FR-15: 4 · FR-16: 4).
- [x] Mọi chuyển trạng thái hợp lệ + ô ✗ ma trận quyền có TC (đánh dấu [UAT] nếu cần runtime).
- [ ] 0 Blocker/Critical mở về mặt tĩnh.

**B6 (UAT) — bổ sung để nghiệm thu đầy đủ:**
- [ ] Contract 14/14 endpoint khớp trên UAT thật.
- [ ] Mọi TC [UAT] chạy xanh; §7b không lỗ lọt.
- [ ] NFR có số đo đạt ngưỡng.
- [ ] Regression [R] xanh.

## 6. Rủi ro dự án & giả định

- Không có Postgres ở B4 → phần lớn hành vi lưu-trữ/trạng thái **chưa verify runtime** (chỉ phủ bằng unit mock + đọc mã). Rủi ro dời sang UAT; test-cases đánh dấu [UAT] rõ ràng.
- Rate-limit in-memory 1 instance — đa instance/serverless (Vercel UAT) cần Redis (SA/DevOps quyết).
- 3 điểm cần SA/BA làm rõ (xem `crosscheck-tester.md` §Điểm nghi ngờ) ảnh hưởng kỳ vọng test — chốt trước GATE-4.
