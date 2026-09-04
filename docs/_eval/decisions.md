# QUYẾT ĐỊNH ĐỊNH HƯỚNG — anh Bryan chốt 2026-09-02 (sau đánh giá đội)

> Đây là "chốt hướng brainstorm đầu BA" (HITL). Cơ sở để BA viết BRD (B1).

| # | Nội dung | Anh Bryan chốt | Hệ quả |
|---|---|---|---|
| 1 | **Mục tiêu #1** | **Cả hai** — branding + lead-gen | Có **form đăng ký/lead** → cần backend mỏng lưu lead + **consent PDPL** + định tuyến lead về Sale (nơi nhận: **CHƯA chốt — hỏi ở BRD**) |
| 2 | **Ngôn ngữ MVP** | **EN + VI** | Chuẩn bị i18n `/en /vi (/my)`; ra EN+VI đợt đầu, **MY hoãn**; cần **bản dịch VI duyệt** trước launch |
| 3 | **Kiến trúc thông tin** | **Để BA đề xuất trong BRD** | BA phân tích & trình 2–3 phương án IA + **khuyến nghị** (hướng đội nghiêng: 1 landing + 3 nhóm + 18 trang chi tiết template) để anh duyệt ở GATE-1 |
| 4 | **Asset/brand** | **Anh Bryan cung cấp** | Đội lập **danh mục asset cần** (logo vector, ảnh chính thức, brand guideline/mã màu + font brand, số liệu SLA, bản dịch VI) → anh gom cấp. Chốt "được dùng ảnh stock/người mẫu hay bắt buộc ảnh thật" — hỏi ở BRD |

## GATE-1 — anh Bryan DUYỆT 2026-09-02 + trả lời câu hỏi mở
**Duyệt:** "cho chuyển bước tiếp theo" → GATE-1 APPROVED.

| Q | Anh Bryan chốt | Ghi chú |
|---|---|---|
| Q7 | **Admin chỉ quản khối động** | Nội dung 18 dịch vụ giữ trong repo (map Excel) |
| Q8 | **Doanh thu: cần mới điều chỉnh** | MVP **ẩn doanh thu**; khối "Con số nổi bật" chỉ số phi nhạy cảm (khách hàng/độ phủ); doanh thu thêm sau khi cần + có duyệt |
| Q9 | **1 admin** (1 vai Content Admin, 1 người) | Phân quyền tối giản |
| Q10 | **Đăng thẳng** (không luồng duyệt) | CMS-lite tối giản |

**Mặc định PO áp cho Q1–Q6 (anh chưa nói rõ — chờ đính chính):**
| Q | Mặc định áp | Chốt cuối trước khi |
|---|---|---|
| Q1 | Lead lưu **DB** + Admin xem (BR-18) + **email báo Sale**; đích CRM cụ thể chốt sau | dev backend lead |
| Q2 | Cho dùng **ảnh stock/placeholder** tạm; thay ảnh thật khi anh cấp | design chốt |
| Q3 | **Ẩn giá**, thay bằng CTA tư vấn | FSD template trang chi tiết |
| Q4 | Làm **đủ 18 dịch vụ** đợt 1 | — |
| Q5 | **Phương án IA C** (khuyến nghị) | toàn dự án bám C |
| Q6 | Target **≥30 lead/tháng**; baseline chờ anh cấp | nghiệm thu SC-01 |

## B2 — Kiến trúc & version: anh Bryan chốt 2026-09-02 (SA Bước 0.5 HITL)
| Điểm | Anh Bryan chốt |
|---|---|
| **Hosting** | **On-prem Docker** (hạ tầng Mytel) — lead nằm nội bộ, hợp PDPL |
| **Kiến trúc** | **Phương án A** — Next.js fullstack (App Router) modular monolith |
| **Database** | **PostgreSQL** |
| **Version** | **Duyệt toàn bộ** bảng V1–V13 (TS 5.x · Node 24 LTS · Next.js 15 · React 19 · PostgreSQL 17 · Prisma 6 · next-intl · Auth.js v5 + argon2id · Turnstile+honeypot+rate-limit · Docker Compose on-prem) |
| Email báo Sale (V12) | Mặc định **SMTP relay nội bộ Mytel** (Nodemailer); SA thiết kế kèm fallback, cờ nếu chưa có relay |

→ SA được phép viết `techstack.md` + `HLD.md` + `architecture.html`.

## GATE-2 + B3 — anh Bryan chốt 2026-09-02
- **GATE-2 DUYỆT** (SRS + techstack + HLD). Deploy nhắm **UAT trước** (production sau, không bỏ GATE-5/RELEASE).
- **"Đổi mật khẩu admin": HOÃN** khỏi MVP — 1 admin, mật khẩu do DevOps cấp/reset trực tiếp (readiness G5 ◐ đóng theo hướng này).
- **Bản thiết kế:** anh cấp link Claude Design "B2B Landing v2" (`/design/p/722b8bcc...`). **Đội KHÔNG truy cập được** (browser in-app + Chrome + WebFetch đều 403/sign-in — link cần session của anh). **Chờ anh export .dc.html/PNG hoặc lưu vào docs/design/** để designer dựng design.md → mới đủ trình GATE-3.

## B3 — Điều chỉnh hosting (anh Bryan chốt trực tiếp với SA, 2026-09-04)
Anh Bryan rà lại V11 (on-prem) và chọn **DUNG HÒA: UAT trên Vercel + Production on-prem**, code **cloud-agnostic**.
- **Production = on-prem Docker** (lead PII thật nằm trong Mytel — giữ lý do PDPL của quyết định GATE-2).
- **UAT = Vercel** (deploy nhanh cho anh xem sớm) — **dùng dữ liệu giả, KHÔNG đổ lead PII thật**.
- **Ràng buộc code (bắt buộc từ B4):** `output: 'standalone'`; không dùng primitive khóa cứng Vercel; bọc email/lưu file/env qua interface (on-prem SMTP relay ↔ UAT email-API/tắt gửi); 1 codebase chạy được cả 2 đích.
- **DevOps (B6):** làm **docker-compose (prod on-prem)** + **cấu hình Vercel (UAT)**.
- Cập nhật: techstack V11, HLD deployment + ADR mới (hybrid hosting + cloud-agnostic). Đây là delta của quyết định GATE-2 V11 — pre-code nên chi phí thấp.

## Điểm còn treo cần làm rõ trong BRD (BA hỏi anh)
- Nơi lead đổ về (CRM nào / email / Google Sheet) + **owner tiếp nhận**.
- Được dùng ảnh stock/người mẫu như trang tham chiếu, hay bắt buộc ảnh thật Mytel?
- Có hiển thị giá không (đa số "theo dự án") hay ẩn hết, thay bằng CTA tư vấn?
- Phạm vi đợt 1: đủ 18 dịch vụ hay ưu tiên vài dịch vụ mũi nhọn trước?
