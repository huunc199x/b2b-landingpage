# MASTER PLAN (PM) — Landing page dịch vụ B2B Mytel
**Cập nhật:** 2026-09-02 · **Giai đoạn:** B2 (chuẩn bị trình GATE-2) · **Loại:** Mới (Track A)

---

## §0b. BÁO CÁO NGUỒN LỰC & TIẾN ĐỘ (trình kèm GATE-2/GATE-3, trước khi vào B4)

### 1. Tổng quan đội & quyết định bật/tắt vai Lead
- **Quy mô dự án:** NHỎ–VỪA. Kiến trúc **modular monolith** 1 app (Next.js) + PostgreSQL, on-prem Docker.
- **Module:** để **PHẲNG (1 module)**, gom 5 nhóm nghiệp vụ (Public site · Service catalog · Lead · Admin content · Admin auth).
- **Vai Lead (backend/frontend/mobile-lead):** **TẮT** — dự án nhỏ, 1 codebase fullstack, không nhiều luồng dev song song. PO giao thẳng dev.
- **Mảng nền tảng:** chỉ **Web** (public + admin). **Không có Mobile app** (VBot là dịch vụ giới thiệu, không phải app của dự án này).

### 2. Vai trò – nhiệm vụ TỪNG role trong dự án này
| Role | Có tham gia? | Nhiệm vụ cụ thể trong dự án này | Giai đoạn |
|------|:---:|---|---|
| **Product Owner / PM** | ✅ | Điều phối, trình cổng, phản biện sản phẩm, giữ master-plan & rủi ro | B1–B6 |
| **Business Analyst** | ✅ | BRD, actor-usecase, entity-lifecycle, SRS, function-map, walkthrough; FSD (B3); nghiệm thu UAT + user-guide (B6) | B1–B3, B6 |
| **Solution Architect** | ✅ | arch-proposal, techstack, HLD, architecture.html; LLD + api-spec (B3) | B2–B3 |
| **Designer** | ✅ | design.md (design system tông cam/kem, wireframe landing + template trang chi tiết + admin + form), token, WCAG | B3 |
| **Frontend/Fullstack Dev** | ✅ | Hiện thực Next.js: public site + 18 trang + form lead + Admin CMS-lite + i18n EN/VI; unit test | B4 |
| **Backend (trong cùng app)** | ✅ (gộp fullstack) | Route Handlers API, Prisma/PostgreSQL, Auth.js, email lead — cùng dev fullstack | B4 |
| **Tester/QA** | ✅ | Rà đặc tả sớm (B2 ✅) · test-plan + test-cases + test-report (B4) · re-test UAT (B6) | B2, B4, B6 |
| **Security Engineer** | ✅ | Pentest-report B5: STRIDE + OWASP + rà Admin (bề mặt tấn công) + PDPL lead + secure-coding ST.TIM.ITC.16 | B5 |
| **DevOps** | ✅ | docker-compose (app + PostgreSQL + Nginx TLS) on-prem, CI/CD, backup DB, deploy UAT | B6 |
| **Mobile Dev / Mobile Lead** | ❌ | Không có app mobile trong phạm vi | — |

### 3. Số dev agent dự kiến theo làn (B4)
- Hệ 1 module, ~18 FR, 1 codebase fullstack → **1–2 dev agent** là đủ (không cần fan-out lớn).
- **Đề xuất 2 làn:**
  - **Làn 0 (nền, làm trước):** setup dự án + design token + Prisma schema/migration + shared/ui + i18n khung + Auth.js (đóng băng trước).
  - **Làn 1 (song song sau nền):** (a) Public site + 18 trang chi tiết + khối động đọc DB; (b) Lead form + DB + email + Admin CMS-lite (auth + CRUD 3 khối + xem lead). Cân tải ~ mỗi dev một nhánh.
- Trần đồng thời: 2 dev agent. Không tách sub-module (quy mô nhỏ).

### 4. Tiến độ dự kiến (milestone) — ước lượng, chốt lại ở GATE-3
| Mốc | Nội dung | Ước lượng thô* |
|-----|----------|----------------|
| GATE-2 | SRS + techstack + HLD (đang trình) | — |
| B3 → GATE-3 | LLD + api-spec + design.md + FSD + scaffold | ~1–1.5 tuần |
| B4 → GATE-4 | Code + test (Làn 0 → Làn 1); khối nặng = Admin CMS-lite (L) | ~2–3 tuần |
| B5 → GATE-5 | Pentest (chú trọng Admin + PDPL lead) | ~3–5 ngày |
| B6 → GATE-6 | docker-compose on-prem + UAT + user-guide + nghiệm thu | ~1 tuần |
*Phụ thuộc **asset & bản dịch VI** anh Bryan cấp — nếu trễ sẽ trượt (R1/R6). Tổng MVP effort ≈ **L**.

---

## §1. WBS — Đầu việc × Role × Phụ thuộc × Trạng thái
| # | Đầu việc | Role | Phụ thuộc | Trạng thái | Điểm cần anh duyệt |
|---|----------|------|-----------|-----------|--------------------|
| 1 | Đánh giá đội | BA/SA/Designer/PO | — | DONE | — |
| 2 | BRD v0.2 | BA | 1 | APPROVED (GATE-1) | ✅ GATE-1 |
| 3 | SRS + nền (actor/entity/function-map/walkthrough) | BA | 2 | DONE (đang siết) | GATE-2 |
| 4 | techstack + HLD + architecture | SA | 2, chốt kiến trúc | DONE | GATE-2 |
| 5 | Đối chiếu SRS↔HLD + tester rà sớm | SA/Tester/PO | 3,4 | DONE | GATE-2 |
| 6 | LLD + api-spec | SA | GATE-2 | TODO | GATE-3 |
| 7 | design.md | Designer | GATE-2 | TODO | GATE-3 (+ theme, asset) |
| 8 | FSD + readiness-checklist | BA | GATE-2 | TODO | GATE-3 |
| 9 | Code + unit test (Làn 0→1) | Dev | GATE-3 | TODO | GATE-4 |
| 10 | Test-plan/cases/report + kiểm chéo | Tester/BA/Security | 9 | TODO | GATE-4 |
| 11 | Pentest-report | Security | GATE-4 | TODO | GATE-5 |
| 12 | docker-compose + UAT + user-guide + nghiệm thu | DevOps/Tester/BA | GATE-5 | TODO | GATE-6 (+ dải port) |

---

## §2b. SỔ RỦI RO (PM duy trì — cập nhật mỗi cổng)
| # | Rủi ro | Tác động | Xác suất | Phương án | Owner | Trạng thái |
|---|--------|:---:|:---:|----------|-------|-----------|
| R1 | Thiếu asset marketing & nội dung (ảnh, số liệu, bản dịch VI) → trễ launch / trang không chốt lead | Cao | Cao | Chốt danh mục AS-01..14; placeholder tạm; bật VI khi có bản dịch duyệt | anh Bryan/Marketing | **Mở** |
| R2 | Form lead + PDPL + đích nhận lead chưa rõ | Cao | TB | Q1: lead→DB + email Sale; consent duyệt Legal; chốt AS-09 trước B4 | anh Bryan/Sale/Legal | **Mở** |
| R6 | Admin+DB tăng effort (M→L), kéo dài MVP | Cao | Cao | Giữ CMS-lite tối giản (3 khối, 1 admin, đăng thẳng) | PO/Dev | Giảm thiểu |
| R7 | Admin là bề mặt tấn công (chiếm quyền/lộ lead) | Cao | TB | Auth.js+argon2id, khóa 5/15, log, rà B5 | Security | Giảm thiểu |
| R8 | Công bố doanh thu/số liệu sai/chưa được phép | Cao | Thấp | Q8: ẩn doanh thu; chỉ đăng số đã duyệt | anh Bryan/Tài chính | Giảm thiểu (ẩn ở MVP) |
| R-OPS | RTO/RPO, ngưỡng uptime, SMTP relay, dải port chưa chốt | TB | TB | Chốt với anh Bryan/DevOps trước B6 | DevOps/anh Bryan | **Mở** |

---

## Log điều phối
- 2026-09-02 — Lập master-plan; vai Lead TẮT (dự án nhỏ, chỉ Web); đội 8 role tham gia, dự kiến 1–2 dev agent B4. Chuẩn bị trình GATE-2.
