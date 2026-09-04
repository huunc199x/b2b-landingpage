# ACTOR & BẢN ĐỒ NGHIỆP VỤ — Landing page dịch vụ B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-02 | Trạng thái | DONE |
|-----------|------|------|------------|------------|------|

> **Nền #1 của B2** — làm trước `entity-lifecycle.md` và `SRS.md`. Tư duy: Actor → nghiệp vụ theo actor → nghiệp vụ liên actor → đối tượng nghiệp vụ → FR. Lần theo **actor**, không lần theo bảng DB.
> **Nguồn:** BRD v0.2 (BG-01..07, BR-01..19), `docs/_eval/decisions.md` (GATE-1: Q7 Admin chỉ quản khối động · Q8 ẩn doanh thu · Q9 1 admin · Q10 đăng thẳng; Q1 lead = DB + Admin xem + email báo Sale · Q3 ẩn giá · Q4 đủ 18 dịch vụ · Q5 IA phương án C).

## 1. Danh sách Actor

| Mã | Actor | Loại | Mục tiêu chính | Quyền hạn / phạm vi | Ghi chú |
|----|-------|------|----------------|---------------------|---------|
| A-01 | Khách doanh nghiệp (visitor) | Người | Tra cứu năng lực 18 dịch vụ B2B, để lại nhu cầu tư vấn | Không đăng nhập; chỉ đọc nội dung công khai + submit form lead | Người ra quyết định/khảo sát, phân theo trường Target Customer |
| A-02 | Content Admin | Người | Tự cập nhật khối nội dung động + xem lead thu về | Đăng nhập Admin; CRUD khối nội dung động; đọc lead (không sửa/xóa ở MVP) | **1 người, 1 vai** (Q9); đăng thẳng không luồng duyệt (Q10) |
| A-03 | Sale B2B | Người | Tiếp nhận lead inbound để follow-up khách | Nhận lead qua **email**; **không đăng nhập landing** ở MVP; follow-up ngoài hệ thống | Nơi nhận lead của Sale (owner: [cần anh Bryan cung cấp]) |
| A-04 | Hệ thống email / nơi nhận lead (ngoài) | Hệ thống ngoài | Chuyển thông báo lead mới tới hộp thư Sale | Nhận yêu cầu gửi từ backend qua SMTP/API; chuyển email tới địa chỉ Sale | Đích CRM cụ thể chốt sau (Q1); MVP dùng email |

> **Không có actor "Sale đăng nhập"** ở MVP: Q1 chốt lead đổ về **DB + Admin xem + email báo Sale**; Sale nhận qua email, không thao tác trên landing. Khi tích hợp CRM 2 chiều (ngoài phạm vi MVP) sẽ bổ sung actor hệ thống CRM.

## 2. Bản đồ nghiệp vụ theo Actor

### A-01 · Khách doanh nghiệp (visitor)
| Mã UC | Nghiệp vụ (use case) | Mô tả ngắn | Đối tượng nghiệp vụ đụng tới | FR dự kiến |
|-------|----------------------|------------|------------------------------|------------|
| UC-01 | Xem Landing tổng | Xem hero + section Why/Coverage/Capabilities/Register + các khối nội dung động | Content Block, Service | FR-01, FR-02 |
| UC-02 | Duyệt dịch vụ theo 3 nhóm | Xem grid/card 3 nhóm (Connectivity 7 · Mobile ICT 3 · ICT Service 8) | Service | FR-04 |
| UC-03 | Xem chi tiết một dịch vụ | Mở trang chi tiết (8 trường từ Excel, giá ẩn, CTA) | Service | FR-05 |
| UC-04 | Đổi ngôn ngữ EN ↔ VI | Chuyển toàn trang giữa EN và VI | Content Block, Service (bản dịch) | FR-03 |
| UC-05 | Điền & submit form lead | Nhập thông tin doanh nghiệp + tick consent PDPL + gửi | Lead | FR-07, FR-08, FR-10 |
| UC-06 | Bấm CTA tư vấn | Từ landing/trang dịch vụ điều hướng tới form (kèm dịch vụ quan tâm) | Service, Lead | FR-06 |

### A-02 · Content Admin
| Mã UC | Nghiệp vụ (use case) | Mô tả ngắn | Đối tượng nghiệp vụ đụng tới | FR dự kiến |
|-------|----------------------|------------|------------------------------|------------|
| UC-07 | Đăng nhập Admin | Xác thực bằng email + mật khẩu (chống brute-force) | Admin Account | FR-16 |
| UC-08 | Đăng xuất / hết phiên | Kết thúc phiên chủ động hoặc do hết hạn 30 phút | Admin Account | FR-17 |
| UC-09 | Quản lý khối "Sản phẩm/dịch vụ mới" | CRUD khối Highlight (tiêu đề, mô tả, ảnh, link) đa ngữ | Content Block | FR-12 |
| UC-10 | Quản lý khối "Đối tác" | CRUD khối Partner (logo, tên, link) | Content Block | FR-13 |
| UC-11 | Quản lý khối "Con số nổi bật" | CRUD khối Stat (nhãn, giá trị, đơn vị) đa ngữ; ẩn doanh thu (Q8) | Content Block | FR-14 |
| UC-12 | Bật/tắt hiển thị & sắp thứ tự khối | Publish/ẩn + đổi thứ tự các khối (chung 3 loại) | Content Block | FR-15 |
| UC-13 | Xem danh sách + chi tiết lead | Đọc lead đã thu (không sửa/xóa ở MVP); đánh dấu Đã xem khi mở | Lead | FR-11 |

### A-03 · Sale B2B
| Mã UC | Nghiệp vụ (use case) | Mô tả ngắn | Đối tượng nghiệp vụ đụng tới | FR dự kiến |
|-------|----------------------|------------|------------------------------|------------|
| UC-14 | Nhận email lead mới | Nhận email chứa tóm tắt lead trong hộp thư Sale, follow-up ngoài hệ thống | Lead (đọc qua email) | FR-09 |

### A-04 · Hệ thống email / nơi nhận lead (ngoài)
| Mã UC | Nghiệp vụ (use case) | Mô tả ngắn | Đối tượng nghiệp vụ đụng tới | FR dự kiến |
|-------|----------------------|------------|------------------------------|------------|
| UC-15 | Chuyển email báo lead tới Sale | Nhận yêu cầu gửi từ backend, chuyển tới địa chỉ Sale; trả kết quả gửi | Lead (side-effect) | FR-09 |

## 3. Nghiệp vụ LIÊN actor

| Mã | Nghiệp vụ liên actor | Actor khởi tạo | Các actor tham gia (thứ tự) | Đối tượng & chuyển trạng thái | FR dự kiến |
|----|----------------------|----------------|------------------------------|-------------------------------|------------|
| F-01 | Submit lead → lưu DB → báo Sale | A-01 Khách | A-01 → Hệ thống → A-04 email → A-03 Sale; A-02 xem sau | Lead: — → **Mới** (email gửi); A-02 mở → **Đã xem** | FR-07, FR-08, FR-09, FR-11 |
| F-02 | Admin cập nhật khối → khách thấy ngay | A-02 Admin | A-02 → Hệ thống → A-01 | Content Block: Nháp/Ẩn → **Hiển thị** (đăng thẳng, không duyệt) | FR-12/13/14, FR-15, FR-02 |

```mermaid
sequenceDiagram
  actor KH as A-01 Khách doanh nghiệp
  participant SYS as Hệ thống (landing + backend + DB)
  participant MAIL as A-04 Hệ thống email
  actor SALE as A-03 Sale B2B
  actor ADM as A-02 Content Admin
  KH->>SYS: Điền form + tick consent + Gửi (UC-05)
  SYS->>SYS: Validate + chống spam; lưu Lead = "Mới"
  SYS->>MAIL: Yêu cầu gửi email báo lead (FR-09)
  MAIL->>SALE: Email tóm tắt lead → hộp thư Sale (UC-14)
  SYS-->>KH: Trang cảm ơn (lead đã ghi nhận)
  ADM->>SYS: Đăng nhập + mở lead (UC-13)
  SYS-->>ADM: Chi tiết lead; Lead "Mới" → "Đã xem"
```

## 3b. Ma trận Actor × Hành động trên đối tượng *(cấu trúc đóng — không ô trống)*

**Đối tượng: Lead**

| Actor \ Hành động | Tạo (submit) | Xem DS (quản trị) | Xem chi tiết | Cập nhật trường | Xóa | Nhận thông báo lead |
|-------------------|:---:|:---:|:---:|:---:|:---:|:---:|
| A-01 Khách | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| A-02 Content Admin | ✗ | ✓ | ✓ | ✗ (khóa ở MVP, BR-18) | ✗ (ngoài phạm vi MVP) | ✗ |
| A-03 Sale | ✗ | ✗ (không đăng nhập MVP) | ✗ | ✗ | ✗ | ✓ (qua email) |
| A-04 Hệ thống email | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (chuyển tiếp) |

**Đối tượng: Content Block** *(3 loại: Highlight / Đối tác / Con số nổi bật)*

| Actor \ Hành động | Tạo | Xem DS quản trị | Xem bản công khai | Cập nhật | Bật/Ẩn | Sắp thứ tự | Xóa |
|-------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| A-01 Khách | ✗ | ✗ | ✓ (chỉ khối Hiển thị, đúng ngôn ngữ) | ✗ | ✗ | ✗ | ✗ |
| A-02 Content Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (soft-delete) |
| A-03 Sale | ✗ | ✗ | ✓ (như visitor) | ✗ | ✗ | ✗ | ✗ |
| A-04 Hệ thống email | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Đối tượng: Admin Account**

| Actor \ Hành động | Tạo (seed) | Đăng nhập | Đổi mật khẩu | Khóa (auto) | Mở khóa (auto) | Vô hiệu hóa |
|-------------------|:---:|:---:|:---:|:---:|:---:|:---:|
| A-01 Khách | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| A-02 Content Admin | ✗ (do seed/DevOps từ AS-14) | ✓ | ✓ | ✗ | ✗ | ✗ |
| A-03 Sale | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| A-04 Hệ thống (cơ chế xác thực) | ✗ | ✗ | ✗ | ✓ (5 lần sai/15 phút) | ✓ (hết cooldown 15 phút) | ✗ (ngoài phạm vi MVP) |

**Đối tượng: Service** *(catalog 18 dịch vụ — Q7: giữ trong repo, không quản qua Admin)*

| Actor \ Hành động | Tạo | Xem DS/Duyệt | Xem chi tiết | Cập nhật | Gỡ/Ẩn |
|-------------------|:---:|:---:|:---:|:---:|:---:|
| A-01 Khách | ✗ | ✓ | ✓ | ✗ | ✗ |
| A-02 Content Admin | ✗ | ✓ (như visitor) | ✓ | ✗ (Q7 — qua repo/deploy) | ✗ |
| A-03 Sale | ✗ | ✓ (như visitor) | ✓ | ✗ | ✗ |
| A-04 Hệ thống email | ✗ | ✗ | ✗ | ✗ | ✗ |

> Sửa/thêm/gỡ Service ở MVP là việc của dev qua repo + deploy (Q7), không có hành động runtime cho actor nào — nên toàn cột Cập nhật/Tạo/Gỡ là ✗.

## 4. Từ nghiệp vụ → đối tượng nghiệp vụ *(cầu nối sang entity-lifecycle.md)*

| Đối tượng nghiệp vụ | Xuất hiện ở nghiệp vụ (UC/F) | Có vòng đời? | Đã lập trong entity-lifecycle? |
|---------------------|------------------------------|:------------:|:------------------------------:|
| Lead | UC-05, UC-06, UC-13, UC-14, UC-15, F-01 | Có (Mới → Đã xem) | E-01 |
| Content Block | UC-01, UC-04, UC-09..UC-12, F-02 | Có (Nháp → Hiển thị ↔ Ẩn → Đã xóa) | E-02 |
| Admin Account | UC-07, UC-08 | Có (Hoạt động ↔ Tạm khóa) | E-03 |
| Service | UC-01, UC-02, UC-03, UC-06 | Tối giản (Hiển thị) | E-04 |

## 5. Quyết định ranh giới module

**Kết luận: để PHẲNG — 1 module (`docs/ba/` không tách thư mục `modules/`).** Lý do đóng:
- Chỉ **4 đối tượng nghiệp vụ**, trong đó 2 có vòng đời đầy đủ (Lead, Content Block), 1 tối giản (Service), 1 hạ tầng-quản trị (Admin Account).
- **1 admin, đăng thẳng, không luồng duyệt** (Q9, Q10) → không có tương tác đa vai phức tạp cần tách luồng dev.
- Ngưỡng tách module trong SKILL (≥2 đối tượng lõi có vòng đời riêng **và** >~8–10 màn hình-FR **và** cần >1 luồng dev) **không đạt cả ba**: tổng 18 FR nhưng đọc chung một lát cắt, một luồng dev đủ.

Bên trong module phẳng vẫn **gom FR theo 5 nhóm nghiệp vụ** để function-map và SRS đọc mạch lạc: **Public site · Service catalog · Lead · Admin content · Admin auth**. Ranh giới 5 nhóm này đồng nhất giữa `SRS.md`, `function-map.html`, `entity-lifecycle.md`.

---

## ✅ Checklist
- [x] Đủ actor: 3 người (Khách, Content Admin, Sale) + 1 hệ thống ngoài (email).
- [x] Mỗi actor quét cạn nghiệp vụ (UC-01..UC-15).
- [x] Nghiệp vụ liên actor F-01 (submit → lưu → báo Sale) + F-02 (Admin cập nhật → khách thấy) đã vẽ + sequence diagram.
- [x] Ma trận Actor × Hành động cho cả 4 đối tượng — không ô trống.
- [x] Mọi đối tượng ở §4 có khối vòng đời trong `entity-lifecycle.md`.
- [x] Mọi use case nối được sang ≥1 FR.
- [x] Không bắt đầu từ bảng DB (map CSDL để SA làm ở LLD).
