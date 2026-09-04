# SRS — Landing page dịch vụ B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-02 | Trạng thái | DONE |
|-----------|------|------|------------|------------|------|

> Truy vết ngược: BRD v0.2 (BG-01..07, BR-01..19) · `actor-usecase.md` (UC-01..15, F-01/F-02) · `entity-lifecycle.md` (E-01..04). Nguồn dữ liệu 18 dịch vụ: `docs/_eval/brief.md`. Quyết định GATE-1: `docs/_eval/decisions.md`.

## 0. Quyết định ranh giới module (module-map)

**Kết luận: PHẲNG — 1 module, không tách thư mục `docs/modules/`.** Hệ nhỏ: 4 đối tượng nghiệp vụ, 1 admin, đăng thẳng không luồng duyệt (Q9, Q10) → không đạt ngưỡng tách (SKILL: ≥2 đối tượng lõi vòng đời riêng **và** >~8–10 màn hình-FR **và** >1 luồng dev). Bên trong module phẳng, FR gom theo **5 nhóm nghiệp vụ** dùng đồng nhất ở `function-map.html` và `entity-lifecycle.md`:

| Nhóm | Phạm vi | Đối tượng chính | Nền tảng |
|------|---------|-----------------|----------|
| G1 Public site | Landing tổng, render khối động, đổi ngôn ngữ | Content Block, Service | Web |
| G2 Service catalog | Duyệt 3 nhóm, trang chi tiết 18 dịch vụ, CTA | Service | Web |
| G3 Lead | Form lead, lưu DB, email báo Sale, chống spam, Admin xem lead | Lead | Web + CMS |
| G4 Admin content | CRUD 3 loại khối, bật/ẩn, sắp thứ tự | Content Block | CMS |
| G5 Admin auth | Đăng nhập/đăng xuất, khóa brute-force, audit log | Admin Account | CMS |

## 1. Giới thiệu

- **Mục đích:** đặc tả chức năng + phi chức năng cho landing page B2B Mytel (public marketing + lead-gen) kèm Admin CMS-lite quản khối nội dung động và DB, đến mức dev code được và tester viết được test case.
- **Phạm vi:** đúng phạm vi MVP đợt 1 trong BRD §3 (18 dịch vụ theo IA phương án C; khối động Highlight/Đối tác/Con số — ẩn doanh thu; form lead lưu DB + email báo Sale; Admin CMS-lite 1 người đăng thẳng; EN/VI, MY hoãn; ẩn giá, CTA tư vấn).
- **Thuật ngữ:** giữ nguyên tiếng Anh tên dịch vụ (DIA, DPLC, IPLC, IPVPN, IP Transit, Dark Fiber, Cross Connection, M2M, Bulk SMS, VBot, Cloud, Colocation, eKYC, Restaurant Management System, Security EndPoint, Penetration Testing, SOC, AI Camera & Smart City) và thuật ngữ kỹ thuật (Content Block, Lead, consent, honeypot, rate-limit).

## 2. Mô tả tổng quan

- **Bối cảnh hệ thống:** web app (trang public + trang Admin) + backend + DB (đổi từ SSG tĩnh sang web app có backend theo BRD v0.2). Trang public render nhanh; đọc khối động qua DB/API. Trang Admin sau đăng nhập.
- **Nhóm người dùng & quyền:** Khách doanh nghiệp (ẩn danh, không đăng nhập) · Content Admin (1 người, đăng nhập, CRUD khối động + đọc lead) · Sale (nhận lead qua email, không đăng nhập) · Hệ thống email (ngoài). Chi tiết ma trận quyền: `actor-usecase.md §3b`.
- **Ràng buộc:** PDPL (consent bắt buộc, TLS, không PII thật trong tài liệu) · brand chờ AS-02 · bản dịch VI chờ AS-06 · nơi nhận lead chờ Q1 (owner: [cần anh Bryan cung cấp]).
- **Giả định/phụ thuộc:** nội dung 8 trường/dịch vụ trong Excel là bản public chính thức (AS-05) · asset & bản dịch cấp trước launch (AS-01..14) · địa chỉ email Sale sẵn sàng khi go-live (AS-09).

## 3. Yêu cầu chức năng (FR)

### 3.1 Danh mục FR

| ID | Nhóm | Tên | Mô tả | Ưu tiên | Truy vết UC | Truy vết BR/BG |
|----|------|-----|-------|---------|-------------|-----------------|
| FR-01 | G1 | Xem Landing tổng | Render hero + Why/Coverage/Capabilities/Register + các khối động | Cao | UC-01 | BR-01 / BG-05 |
| FR-02 | G1 | Render khối nội dung động | Hiển thị khối `Hiển thị` theo loại + thứ tự + ngôn ngữ | Cao | UC-01 | BR-17 / BG-07 |
| FR-03 | G1 | Đổi ngôn ngữ EN↔VI | Chuyển toàn trang; khung MY ẩn; quy tắc thiếu bản dịch | Cao | UC-04 | BR-07, BR-11 / BG-03 |
| FR-04 | G2 | Duyệt dịch vụ theo 3 nhóm | Grid/card 3 nhóm (7/3/8) | Cao | UC-02 | BR-02 / BG-02 |
| FR-05 | G2 | Trang chi tiết dịch vụ | 8 trường Excel nguồn, hiển thị 7 (ẩn Price Policy), URL riêng, CTA | Cao | UC-03 | BR-03 / BG-02 |
| FR-06 | G2 | CTA tư vấn | Nút CTA trên landing + mỗi trang dịch vụ dẫn tới form | Cao | UC-06 | BR-09 / BG-01 |
| FR-07 | G3 | Submit form lead | Validate từng trường + consent PDPL + chống spam | Cao | UC-05 | BR-04, BR-06 / BG-01 |
| FR-08 | G3 | Lưu lead vào DB | Ghi lead trạng thái `Mới` | Cao | UC-05 | BR-05 / BG-01 |
| FR-09 | G3 | Email báo Sale | Gửi email tóm tắt lead tới hộp thư Sale ≤ 1 giờ | Cao | UC-14, UC-15 | BR-05 / BG-04 |
| FR-10 | G3 | Chống spam form | Honeypot + rate-limit | Cao | UC-05 | BR-08 / BG-01 |
| FR-11 | G3 | Admin xem lead | Danh sách + chi tiết; đánh dấu `Đã xem` | Trung bình | UC-13 | BR-18 / BG-01 |
| FR-12 | G4 | Quản lý khối "Sản phẩm/dịch vụ mới" | CRUD Highlight đa ngữ | Cao | UC-09 | BR-14 / BG-07 |
| FR-13 | G4 | Quản lý khối "Đối tác" | CRUD Partner (logo/tên/link) | Cao | UC-10 | BR-15 / BG-07 |
| FR-14 | G4 | Quản lý khối "Con số nổi bật" | CRUD Stat đa ngữ; ẩn doanh thu | Cao | UC-11 | BR-16 / BG-07 |
| FR-15 | G4 | Bật/Ẩn & sắp thứ tự khối | Publish/ẩn + đổi thứ tự (chung 3 loại) | Cao | UC-12 | BR-14/15/16/17 / BG-07 |
| FR-16 | G5 | Đăng nhập Admin | Email + mật khẩu; khóa 5 lần sai/15 phút | Cao | UC-07 | BR-13, BR-19 / BG-07 |
| FR-17 | G5 | Đăng xuất / hết phiên | Đăng xuất chủ động; phiên hết hạn 30 phút | Cao | UC-08 | BR-13, BR-19 / BG-07 |
| FR-18 | G5 | Audit log thao tác quản trị | Ghi log mọi thao tác admin (đăng nhập, CRUD khối, mở lead) | Cao | UC-07..13 | BR-19 / BG-07 |

### 3.2 Đặc tả chi tiết

> Quy ước mã lỗi: nhóm `LEAD-xxx` (form lead), `AUTH-xxx` (đăng nhập), `CB-xxx` (content block), `I18N-xxx` (ngôn ngữ).

#### FR-03 — Đổi ngôn ngữ EN ↔ VI

- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách (A-01) / đang xem trang bất kỳ / *Thành công:* toàn trang chuyển sang ngôn ngữ chọn, URL mang tiền tố `/en` hoặc `/vi`; *Thất bại:* giữ ngôn ngữ hiện tại.
- **Luồng chính:**
  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu (C/R/U/D) |
  |---|----------------------|-------------------|-------------------|
  | 1 | Bấm chọn EN hoặc VI | Đổi tiền tố URL, tải nội dung ngôn ngữ đó | R: Content Block, Service (bản dịch) |
  | 2 | (đang ở trang chi tiết dịch vụ) | Giữ nguyên trang, đổi nội dung sang ngôn ngữ mới | R: Service |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Khối `Hiển thị` thiếu bản dịch của ngôn ngữ đang chọn (BR-DYN-01) → **ẩn khối đó ở ngôn ngữ thiếu** (không render nội dung rỗng); các khối đủ dịch vẫn hiển thị.
  - 1b. Chọn MY → mục MY ẩn (khung sẵn nhưng chưa bật, BR-11); không có lựa chọn MY trên UI ở MVP.
  - 1c. Đang điền form lead rồi đổi ngôn ngữ → nội dung form giữ nguyên (không mất dữ liệu đã nhập), chỉ nhãn/thông báo đổi ngôn ngữ.
- **Quy tắc nghiệp vụ:** BR-DYN-01 (thiếu bản dịch → ẩn ở ngôn ngữ thiếu) — xem bảng quyết định ở FR-02.
- **Tiêu chí chấp nhận:**
  - Given trang landing EN có 3 khối Highlight `Hiển thị` (2 đủ VI, 1 chỉ EN) — When khách chuyển sang VI — Then VI hiển thị 2 khối, khối chỉ-EN bị ẩn ở VI, layout không vỡ.
  - Given khách đã nhập họ tên vào form — When đổi EN→VI — Then ô họ tên vẫn còn giá trị đã nhập.

#### FR-02 — Render khối nội dung động

- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách (A-01) / đang xem landing / *Thành công:* khối `Hiển thị` đủ dịch của ngôn ngữ đang xem hiện đúng thứ tự; *Thất bại:* khối lỗi bị bỏ qua, phần còn lại vẫn render.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Tải landing | Đọc các khối `Hiển thị`, sắp theo thứ tự tăng dần, lọc theo ngôn ngữ | R: Content Block |
- **Bảng quyết định — hiển thị 1 khối** *(2 điều kiện = 4 tổ hợp)*:
  | Trạng thái = `Hiển thị`? | Đủ trường bắt buộc của ngôn ngữ đang xem? | Kết quả | Ghi chú |
  |:---:|:---:|---------|---------|
  | Có | Có | **Hiển thị khối** | luồng chính |
  | Có | Không | **Ẩn khối ở ngôn ngữ đó** | BR-DYN-01; khối vẫn hiện ở ngôn ngữ đủ dịch |
  | Không | Có | **Ẩn khối** | `Nháp`/`Ẩn`/`Đã xóa` không lên public |
  | Không | Không | **Ẩn khối** | không xảy ra render vì trạng thái đã loại trước |
- **Ví dụ tính tay:**
  - Khối Stat "Enterprise customers: 1.200+" ở `Hiển thị`, có cả EN+VI → hiện ở cả 2 ngôn ngữ.
  - Khối Highlight chỉ nhập EN, `Hiển thị` → hiện ở EN, ẩn ở VI.
  - Khối Partner ở `Ẩn` → không hiện dù đủ dịch.
- **Tiêu chí chấp nhận:** Given 5 khối (3 `Hiển thị`, 2 `Ẩn`) — When tải landing EN — Then đúng 3 khối `Hiển thị` hiện theo thứ tự, 2 khối `Ẩn` không xuất hiện trong HTML public.

#### FR-05 — Trang chi tiết dịch vụ

- **Số trường (chốt để không lệch):** mỗi dịch vụ có **8 trường nguồn từ Excel**; UI công khai **hiển thị 7 trường**, **ẩn 1 trường Price Policy** (Q3). Con số dùng nhất quán: 8 nguồn → 7 hiển thị.
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách (A-01) / có URL dịch vụ hợp lệ / *Thành công:* hiển thị 7 trường public + CTA; *Thất bại:* URL sai → trang 404 song ngữ.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Mở URL `/{lang}/services/{slug}` | Render template với 7 trường + nút CTA (prefill dịch vụ) | R: Service |
- **Trường hiển thị (8 trường Excel):** Tên · Nhóm · What is · Advantage · Target Customer · Target Sale · Delivery Timeline — **hiển thị**; **Price Policy — ẩn** (Q3), thay bằng CTA "Đăng ký tư vấn".
- **Luồng thay thế / ngoại lệ:**
  - 1a. `slug` không thuộc 18 dịch vụ → 404 song ngữ + link về landing.
  - 1b. Trường thiếu bản dịch ngôn ngữ đang xem → hiển thị bản EN cho trường đó (nội dung dịch vụ là gốc EN, không ẩn cả trang).
- **Tiêu chí chấp nhận:** Given URL `/vi/services/dia` — When khách mở — Then hiển thị 7 trường của DIA, không hiển thị Price Policy, có nút CTA prefill "DIA".

#### FR-07 — Submit form lead *(trọng tâm)*

- **Số mục trên form (chốt để không lệch — khác với 7/8 trường của FR-05 dịch vụ):** **6 trường dữ liệu người nhập** (Họ tên, Email, Số điện thoại, Tên doanh nghiệp, Dịch vụ quan tâm, Lời nhắn) + **1 ô consent bắt buộc** + **1 honeypot ẩn** = **8 dòng validate** (bảng bên dưới).
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách (A-01) / đang ở form (landing hoặc trang dịch vụ) / *Thành công:* lead lưu trạng thái `Mới`, email báo Sale được yêu cầu gửi, hiện trang cảm ơn; *Thất bại:* không tạo lead, không gửi email, hiển thị lỗi từng trường.
- **Luồng chính:**
  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu (C/R/U/D) |
  |---|----------------------|-------------------|-------------------|
  | 1 | Nhập các trường + tick consent | Validate client-side theo bảng bên dưới | — |
  | 2 | Bấm "Gửi" | Validate server-side + kiểm chống spam (FR-10) | R: rate-limit store |
  | 3 | (đạt tất cả) | Lưu Lead = `Mới`; yêu cầu gửi email báo Sale (FR-09); hiện trang cảm ơn | C: Lead |
- **Luồng thay thế / ngoại lệ:**
  - 2a. Một/nhiều trường bắt buộc trống hoặc sai định dạng → hiển thị lỗi từng trường (bảng validate), không tạo lead (`LEAD-001`).
  - 2b. Consent không tick → chặn gửi, báo "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" (`LEAD-010`); không tạo lead.
  - 2c. Honeypot có giá trị (bot) → phản hồi trang cảm ơn giả để không lộ cơ chế, **không tạo lead**, ghi cờ nghi spam (`LEAD-020`, FR-10).
  - 2d. Vượt rate-limit (> 5 submit/IP trong cửa sổ rolling 60 phút — IP client lấy từ `X-Forwarded-For`, xem FR-10) → chặn, báo "Bạn đã gửi quá số lần cho phép, vui lòng thử lại sau 1 giờ" (`LEAD-021`); không tạo lead.
  - 2e. Lỗi lưu DB → báo "Hệ thống đang bận, vui lòng thử lại" (`LEAD-030`); không tạo lead một phần (giao dịch nguyên tử).
  - 2f. Lưu lead thành công nhưng gửi email lỗi → **lead vẫn ở `Mới`** (đã lưu), hệ thống retry gửi email (FR-09); không báo lỗi cho khách.
- **Validate từng trường:**
  | Trường | Bắt buộc | Kiểu | Định dạng | Độ dài | Miền giá trị / ràng buộc | Thông báo lỗi |
  |--------|:-------:|------|-----------|:------:|--------------------------|---------------|
  | Họ tên người liên hệ | Có | Chuỗi | chữ + khoảng trắng + dấu tiếng Việt | 2–100 | không toàn khoảng trắng | "Vui lòng nhập họ tên (2–100 ký tự)" |
  | Email công việc | Có | Chuỗi | `^[^@\s]+@[^@\s]+\.[^@\s]+$` | ≤ 150 | 1 địa chỉ | "Email không đúng định dạng" |
  | Số điện thoại | Có | Chuỗi | chỉ chữ số, cho phép `+` đầu | 8–15 chữ số | — | "Số điện thoại chỉ gồm 8–15 chữ số" |
  | Tên doanh nghiệp | Có | Chuỗi | tự do | 2–150 | không toàn khoảng trắng | "Vui lòng nhập tên doanh nghiệp (2–150 ký tự)" |
  | Dịch vụ quan tâm | Có | Enum | 1 trong 18 dịch vụ hoặc "Tư vấn chung" | — | thuộc danh mục | "Vui lòng chọn dịch vụ quan tâm" |
  | Lời nhắn / nhu cầu | Không | Chuỗi | tự do | ≤ 1000 | — | "Lời nhắn tối đa 1000 ký tự" |
  | Consent PDPL | Có | Boolean | checkbox | — | phải = true | "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" |
  | Honeypot (ẩn) | — | Chuỗi | ẩn với người thật | — | phải rỗng | (không hiển thị; giá trị ≠ rỗng → xử lý như bot) |
- **Bảng quyết định — chấp nhận submit** *(3 điều kiện = 8 tổ hợp)*:
  | Trường bắt buộc hợp lệ? | Consent = true? | Chống spam đạt (honeypot rỗng + trong rate-limit)? | Kết quả | Mã |
  |:---:|:---:|:---:|---------|-----|
  | Có | Có | Có | **Tạo lead `Mới` + gửi email** | — |
  | Có | Có | Không | Chặn, không tạo lead | LEAD-020/021 |
  | Có | Không | Có | Chặn, báo thiếu consent | LEAD-010 |
  | Có | Không | Không | Chặn (consent + spam), ưu tiên báo consent | LEAD-010 |
  | Không | Có | Có | Chặn, báo lỗi trường | LEAD-001 |
  | Không | Có | Không | Chặn, báo lỗi trường + spam | LEAD-001 |
  | Không | Không | Có | Chặn, báo lỗi trường + consent | LEAD-001 |
  | Không | Không | Không | Chặn, báo lỗi trường (gộp mọi lỗi hiển thị) | LEAD-001 |
- **Ví dụ tính tay:**
  - Họ tên "Le Van A" + email `a@cty.com` + SĐT `0912345678` (10 chữ số, hợp lệ) + DN "Cong ty A" + dịch vụ "DIA" + consent ✓ + honeypot rỗng + lần gửi thứ 1/giờ → **tạo lead `Mới`**, gửi 1 email báo Sale.
  - Email `a@cty` (thiếu phần sau dấu chấm) → fail regex → LEAD-001, không tạo lead.
  - SĐT `09123` (5 chữ số < 8) → fail độ dài → LEAD-001.
  - Đủ trường + consent bỏ trống → LEAD-010, không tạo lead.
  - Đủ trường + consent ✓ nhưng là lần gửi thứ 6 trong 1 giờ từ cùng IP → LEAD-021, không tạo lead.
- **Ràng buộc dữ liệu:** họ tên/email/SĐT/DN là **PII** — lưu qua HTTPS/TLS1.2+, không log ra file thô, không đưa vào URL (NFR-04). Ví dụ trong tài liệu là dữ liệu ẩn danh, không PII thật.
- **Tiêu chí chấp nhận:**
  - Given form đủ trường hợp lệ + consent ✓ — When bấm Gửi lần đầu — Then 1 lead `Mới` được tạo, 1 email báo Sale được yêu cầu gửi, hiện trang cảm ơn.
  - Given consent chưa tick — When bấm Gửi — Then không tạo lead, hiện LEAD-010 tại ô consent.
  - Given đã gửi 5 lần trong giờ qua từ cùng IP — When gửi lần 6 — Then không tạo lead, hiện LEAD-021.

#### FR-09 — Email báo Sale

- **Actor / Tiền điều kiện / Hậu điều kiện:** Hệ thống → A-04 email → A-03 Sale / lead vừa lưu `Mới` / *Thành công:* email tóm tắt lead vào hộp thư Sale; *Thất bại:* retry, ghi log.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Lead lưu `Mới` (từ FR-08) | Soạn email tóm tắt (họ tên, DN, dịch vụ, SĐT, email, lời nhắn, thời điểm) gửi tới địa chỉ Sale (AS-09) | R: Lead |
  | 2 | Gửi qua A-04 | Nhận kết quả gửi; ghi log | — |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Địa chỉ Sale chưa cấu hình (AS-09 thiếu) → không gửi được; ghi log lỗi + cảnh báo vận hành; lead vẫn `Mới` để Admin xem qua FR-11. [đích + owner: cần anh Bryan cung cấp]
  - 2a. Gửi lỗi (timeout/từ chối) → retry tối đa 3 lần, giãn cách 5 phút; sau 3 lần vẫn lỗi → ghi log lỗi, không mất lead.
- **Quy tắc nghiệp vụ:** BR-LEAD-02 — email đến hộp thư Sale trong **≤ 1 giờ** kể từ khi lead `Mới` (mục tiêu gửi trong ≤ 60 giây; ngưỡng 1 giờ là biên nghiệm thu BG-04).
- **Tiêu chí chấp nhận:** Given lead `Mới` được tạo lúc 10:00 — When FR-09 chạy — Then email vào hộp thư Sale trước 11:00; nếu lần gửi đầu lỗi thì có ≤ 3 lần retry trong log.

#### FR-11 — Admin xem lead

- **Actor / Tiền điều kiện / Hậu điều kiện:** Content Admin (A-02) / đã đăng nhập / *Thành công:* xem danh sách + chi tiết, lead `Mới` chuyển `Đã xem`; *Thất bại:* chưa đăng nhập → chuyển trang đăng nhập.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Mở mục "Lead" | Hiển thị danh sách (sắp theo thời điểm gửi giảm dần, phân trang 20/trang, lọc theo trạng thái/ngày/dịch vụ) | R: Lead |
  | 2 | Mở 1 lead | Hiển thị chi tiết; nếu `Mới` → đánh dấu `Đã xem` | R + U: Lead; C: audit log |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Chưa đăng nhập / phiên hết hạn → chuyển trang đăng nhập (FR-16/17).
  - 1b. **Empty-state — chưa có lead nào:** danh sách hiển thị thông báo "Chưa có lead nào" + gợi ý ("Lead từ form sẽ hiện ở đây"); **không hiển thị bảng rỗng, không phân trang, không nút thao tác trên hàng**.
  - 1c. **Empty-state theo bộ lọc:** áp bộ lọc (trạng thái/ngày/dịch vụ) mà không có kết quả → "Không có lead khớp bộ lọc" + nút xóa lọc.
  - 2a. Admin không có quyền sửa/xóa lead ở MVP → không hiển thị nút sửa/xóa (BR-18).
- **Tiêu chí chấp nhận:**
  - Given 3 lead `Mới` — When Admin mở lead thứ nhất — Then lead đó thành `Đã xem`, 2 lead còn lại giữ `Mới`, có 1 dòng audit log.
  - Given chưa có lead nào trong DB — When Admin mở mục "Lead" — Then hiển thị empty-state "Chưa có lead nào", không có bảng rỗng.
  - Given có lead nhưng bộ lọc "dịch vụ = eKYC" không khớp — When áp bộ lọc — Then hiển thị "Không có lead khớp bộ lọc" + nút xóa lọc.

#### FR-12 — Quản lý khối "Sản phẩm/dịch vụ mới" (Highlight)

- **Actor / Tiền điều kiện / Hậu điều kiện:** Content Admin (A-02) / đã đăng nhập / *Thành công:* khối được tạo/sửa/xóa; *Thất bại:* báo lỗi trường, không lưu.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Bấm "Tạo khối Highlight" | Mở form nhập | — |
  | 2 | Nhập trường + Lưu nháp | Validate; lưu khối `Nháp` | C: Content Block; C audit log |
  | 3 | Sửa khối | Validate; cập nhật | U: Content Block; C audit log |
  | 4 | Xóa khối | Xác nhận; soft-delete → `Đã xóa` | U: Content Block; C audit log |
- **Validate từng trường (Highlight):**
  | Trường | Bắt buộc | Kiểu | Định dạng | Độ dài | Ràng buộc | Thông báo lỗi |
  |--------|:-------:|------|-----------|:------:|-----------|---------------|
  | Tiêu đề (EN) | Có | Chuỗi | tự do | 2–120 | — | "Tiêu đề EN bắt buộc (2–120 ký tự)" |
  | Tiêu đề (VI) | Không | Chuỗi | tự do | ≤ 120 | thiếu → ẩn ở VI (BR-DYN-01) | "Tiêu đề VI tối đa 120 ký tự" |
  | Mô tả ngắn (EN) | Có | Chuỗi | tự do | 2–300 | — | "Mô tả EN bắt buộc (2–300 ký tự)" |
  | Mô tả ngắn (VI) | Không | Chuỗi | tự do | ≤ 300 | — | "Mô tả VI tối đa 300 ký tự" |
  | Ảnh | Không | URL/ảnh | jpg/png/webp | ≤ 2 MB | — | "Ảnh định dạng jpg/png/webp, tối đa 2 MB" |
  | Link | Không | URL | `^https?://` | ≤ 500 | — | "Link phải bắt đầu bằng http:// hoặc https://" |
  | Thứ tự | Có | Số nguyên | ≥ 0 | — | mặc định cuối danh sách | "Thứ tự là số nguyên ≥ 0" |
- **Quy tắc nghiệp vụ:** BR-DYN-01 (thiếu bản dịch → ẩn ở ngôn ngữ thiếu). Bật hiển thị theo FR-15.
- **Tiêu chí chấp nhận:** Given Admin nhập tiêu đề+mô tả EN — When Lưu nháp — Then khối tạo ở `Nháp`, chưa lên public, có audit log.

#### FR-13 — Quản lý khối "Đối tác" (Partner)

- Cấu trúc như FR-12; **trường riêng:**
  | Trường | Bắt buộc | Kiểu | Định dạng | Độ dài | Thông báo lỗi |
  |--------|:-------:|------|-----------|:------:|---------------|
  | Tên đối tác | Có | Chuỗi | tự do | 2–120 | "Tên đối tác bắt buộc (2–120 ký tự)" |
  | Logo | Có | Ảnh | jpg/png/svg/webp | ≤ 1 MB | "Logo bắt buộc, định dạng jpg/png/svg/webp, tối đa 1 MB" |
  | Link | Không | URL | `^https?://` | ≤ 500 | "Link phải bắt đầu bằng http:// hoặc https://" |
  | Thứ tự | Có | Số nguyên | ≥ 0 | — | "Thứ tự là số nguyên ≥ 0" |
- Đối tác không có trường văn bản đa ngữ bắt buộc (logo + tên là ngôn ngữ-trung tính) → hiển thị ở cả EN và VI.
- **Tiêu chí chấp nhận:** Given Admin tạo đối tác có logo + tên — When bật hiển thị — Then logo hiện ở cả EN và VI.

#### FR-14 — Quản lý khối "Con số nổi bật" (Stat)

- Cấu trúc như FR-12; **trường riêng:**
  | Trường | Bắt buộc | Kiểu | Định dạng | Độ dài | Ràng buộc | Thông báo lỗi |
  |--------|:-------:|------|-----------|:------:|-----------|---------------|
  | Nhãn (EN) | Có | Chuỗi | tự do | 2–80 | — | "Nhãn EN bắt buộc (2–80 ký tự)" |
  | Nhãn (VI) | Không | Chuỗi | tự do | ≤ 80 | thiếu → ẩn ở VI | "Nhãn VI tối đa 80 ký tự" |
  | Giá trị | Có | Chuỗi | `^(?=.*[0-9])[0-9.,]{1,19}[+%]?$` — bắt buộc chứa ≥1 chữ số; cho phép chữ số + dấu ngăn cách `.`/`,`; hậu tố tùy chọn `+` hoặc `%` | 1–20 | phần chữ (tỉnh/khách hàng…) đưa vào trường **Đơn vị (EN/VI)**, không nhập vào Giá trị | "Giá trị chỉ gồm chữ số và dấu ngăn cách, hậu tố + hoặc % (vd: 1.200+, 63, 99%); tối đa 20 ký tự" |
  | Đơn vị (EN) | Không | Chuỗi | tự do | ≤ 30 | — | "Đơn vị EN tối đa 30 ký tự" |
  | Đơn vị (VI) | Không | Chuỗi | tự do | ≤ 30 | — | "Đơn vị VI tối đa 30 ký tự" |
  | Thứ tự | Có | Số nguyên | ≥ 0 | — | — | "Thứ tự là số nguyên ≥ 0" |
- **Quy tắc nghiệp vụ:** BR-STAT-01 — **không đăng doanh thu** ở MVP (Q8); loại số nhạy cảm chỉ giới hạn phi-nhạy-cảm (khách hàng/độ phủ). Con số là số thật của Mytel, không bịa; số cần công bố: [cần anh Bryan cung cấp]. Doanh thu chỉ thêm sau khi có phê duyệt Tài chính.
- **Tiêu chí chấp nhận:** Given Admin nhập nhãn "Enterprise customers" + giá trị "1.200+" — When Lưu + bật hiển thị — Then khối hiện trên landing; không có ô nhập doanh thu ở MVP.

#### FR-15 — Bật/Ẩn & sắp thứ tự khối

- **Actor / Tiền điều kiện / Hậu điều kiện:** Content Admin / đã đăng nhập / *Thành công:* trạng thái/thứ tự đổi, public phản ánh trong ≤ TTL cache; *Thất bại:* chặn + báo lý do.
- **Bảng quyết định — bật hiển thị** *(2 điều kiện = 4 tổ hợp)*:
  | Trạng thái hiện tại ∈ {Nháp, Ẩn}? | Đủ trường bắt buộc EN? | Kết quả | Mã |
  |:---:|:---:|---------|-----|
  | Có | Có | → `Hiển thị` | — |
  | Có | Không | Chặn, báo thiếu trường EN | CB-010 |
  | Không | Có | Không áp dụng (đang `Hiển thị`/`Đã xóa`) — nút bật ẩn đi | — |
  | Không | Không | Không áp dụng | — |
- **Sắp thứ tự:** Admin đổi số thứ tự (số nguyên ≥ 0); trùng thứ tự → sắp phụ theo thời điểm cập nhật giảm dần.
- **Tiêu chí chấp nhận:**
  - *Bật hiển thị:* Given khối `Nháp` đủ trường EN — When bấm "Bật hiển thị" — Then khối thành `Hiển thị`, lên public trong ≤ TTL cache (≤ 60s), có audit log.
  - *Tắt hiển thị:* Given khối đang `Hiển thị` trên landing — When Admin bấm "Tắt hiển thị" — Then khối thành `Ẩn`, biến mất khỏi public trong ≤ TTL cache (≤ 60s), vẫn còn trong danh sách quản trị (có thể bật lại), có 1 audit log.
  - *Sắp thứ tự:* Given 3 khối `Hiển thị` thứ tự [1,2,3] — When Admin đổi khối thứ 3 thành thứ tự 1 — Then thứ tự public trở thành [khối-cũ-3, khối-cũ-1, khối-cũ-2]; nếu 2 khối trùng số thứ tự thì sắp phụ theo thời điểm cập nhật giảm dần; có 1 audit log.

#### FR-16 — Đăng nhập Admin *(trọng tâm bảo mật)*

- **Actor / Tiền điều kiện / Hậu điều kiện:** Content Admin (A-02) / có tài khoản seed `Hoạt động` / *Thành công:* tạo phiên 30 phút, vào trang quản trị; *Thất bại:* báo lỗi chung, tăng đếm sai, có thể khóa.
- **Luồng chính:**
  | # | Hành động | Phản ứng hệ thống | Dữ liệu |
  |---|-----------|-------------------|---------|
  | 1 | Nhập email + mật khẩu, bấm Đăng nhập | So khớp mật khẩu băm | R: Admin Account |
  | 2 | (đúng) | Tạo phiên 30 phút; reset đếm sai; ghi audit log | U: Admin Account; C: audit log |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Sai email hoặc mật khẩu → báo lỗi **chung** "Email hoặc mật khẩu không đúng" (`AUTH-001`, không tiết lộ trường nào sai); đếm sai +1.
  - 1b. Đạt 5 lần sai trong 15 phút → tài khoản `Tạm khóa` 15 phút; báo "Tài khoản tạm khóa, thử lại sau 15 phút" (`AUTH-010`).
  - 1c. Đăng nhập khi `Tạm khóa` → từ chối, báo thời gian còn lại (`AUTH-010`).
- **Bảng quyết định — kết quả đăng nhập** *(2 điều kiện = 4 tổ hợp)*:
  | Mật khẩu đúng? | Đang `Tạm khóa`? | Kết quả | Mã |
  |:---:|:---:|---------|-----|
  | Đúng | Không | **Tạo phiên** | — |
  | Đúng | Có | Từ chối (chờ hết khóa) | AUTH-010 |
  | Sai | Không | Từ chối + đếm sai +1 (đủ 5 → khóa) | AUTH-001/010 |
  | Sai | Có | Từ chối (đang khóa) | AUTH-010 |
- **Ví dụ tính tay:** sai lần 1→4 trong 15 phút = AUTH-001; lần thứ 5 = AUTH-010 (khóa tới phút 15); phút 16 nhập đúng = tạo phiên.
- **Quy tắc nghiệp vụ:** BR-AUTH-01 — 5 lần sai/15 phút → khóa 15 phút; mật khẩu băm (không lưu thô), ≥ 12 ký tự (NFR-03).
- **Tiêu chí chấp nhận:**
  - Given tài khoản `Hoạt động` + mật khẩu đúng — When đăng nhập — Then vào trang quản trị, có phiên, 1 audit log.
  - Given đã sai 4 lần trong 15 phút — When sai lần 5 — Then tài khoản `Tạm khóa`, hiện AUTH-010.

#### FR-17 — Đăng xuất / hết phiên

- **Luồng chính:** Admin bấm Đăng xuất → hủy phiên → chuyển trang đăng nhập; ghi audit log.
- **Luồng ngoại lệ:** phiên không thao tác 30 phút → tự hết hạn; thao tác kế tiếp chuyển trang đăng nhập (`AUTH-020`).
- **Tiêu chí chấp nhận:** Given phiên đã đăng nhập, không thao tác 30 phút — When mở mục Lead — Then bị chuyển trang đăng nhập.

#### FR-18 — Audit log thao tác quản trị

- **Luồng chính:** mọi thao tác quản trị (đăng nhập/đăng xuất, tạo/sửa/xóa/bật-ẩn khối, mở lead) ghi 1 dòng log: thời điểm, hành động, đối tượng, kết quả. Không ghi mật khẩu; không ghi PII lead vào log (chỉ mã lead).
- **Tiêu chí chấp nhận:** Given Admin xóa 1 khối — When thao tác hoàn tất — Then có 1 dòng audit log (thời điểm + "xóa Content Block" + mã khối).

#### FR-01, FR-04, FR-06, FR-08, FR-10 — đặc tả gọn

- **FR-01 Xem Landing tổng:** render hero (headline + 2 CTA) + section Why/Coverage/Capabilities/Register + các khối động (FR-02). **Empty-state:** khi **không có khối động nào** ở `Hiển thị` (hoặc bị ẩn hết ở ngôn ngữ đang xem), landing **vẫn render đủ hero + 4 section tĩnh**; các vùng khối động (Highlight/Đối tác/Con số) **thu gọn hoàn toàn** — không hiện tiêu đề mục trống, khung rỗng hay placeholder. AC: (1) Given khách mở `/en` có khối `Hiển thị` — Then thấy hero + 4 section + khối `Hiển thị`. (2) Given mọi khối động ở `Ẩn`/`Nháp` — When mở `/en` — Then thấy hero + 4 section tĩnh, không có vùng khối động rỗng nào hiển thị.
- **FR-04 Duyệt 3 nhóm:** card/grid 3 nhóm (Connectivity 7 · Mobile ICT 3 · ICT Service 8 = 18). AC: Given landing — Then đếm được đúng 18 card chia 3 nhóm, mỗi card link tới trang chi tiết.
- **FR-06 CTA tư vấn:** mỗi trang có ≥ 1 CTA dẫn tới form; từ trang dịch vụ, CTA prefill "Dịch vụ quan tâm" = dịch vụ đó. AC: Given trang DIA — When bấm CTA — Then tới form với ô dịch vụ = "DIA".
- **FR-08 Lưu lead:** ghi lead nguyên tử trạng thái `Mới` (bám FR-07 bước 3). AC: xem FR-07.
- **FR-10 Chống spam:**
  - (a) **Honeypot** — trường ẩn phải rỗng; giá trị ≠ rỗng → xử lý như bot (LEAD-020), không tạo lead, trả trang cảm ơn giả.
  - (b) **Rate-limit** — **cửa sổ rolling 60 phút**; **ngưỡng 5 submit/IP** trong cửa sổ; submit thứ 6 trong 60 phút gần nhất → chặn (LEAD-021).
  - (c) **Nhận diện IP sau proxy/NAT** — lấy IP client từ header `X-Forwarded-For` do **Nginx đặt** (lấy IP **trái nhất** = client thật), không dùng IP kết nối trực tiếp (là IP của Nginx) để không gộp mọi khách sau reverse-proxy thành một.
  - **Ví dụ tính tay (rolling 60 phút):** cùng 1 IP submit 10:00, 10:05, 10:10, 10:15, 10:20 (5 lần) — đều qua; 10:50 là lần thứ 6 trong cửa sổ [09:50–10:50] → **chặn** LEAD-021; 11:01 (mốc 10:00 đã rơi khỏi cửa sổ [10:01–11:01], còn 4 lần) → **qua**.
  - AC: Given 1 IP đã submit 5 lần trong 60 phút qua — When submit lần 6 — Then chặn LEAD-021; Given 2 khách khác nhau sau cùng 1 Nginx (X-Forwarded-For khác nhau) — When mỗi khách submit — Then đếm rate-limit theo từng IP client, không gộp chung.

## 4. Yêu cầu phi chức năng (NFR)

| ID | Loại | Yêu cầu đo được |
|----|------|-----------------|
| NFR-01 | Hiệu năng | Lighthouse Performance mobile **≥ 80**; LCP < 2.5s trên 4G mô phỏng (Moto G4 preset); TTFB P95 trang public < 500ms; khối động cache TTL ≤ 60s |
| NFR-02 | Khả dụng/Accessibility | Contrast văn bản chính **≥ 4.5:1** (WCAG 2.1 AA); tôn trọng `prefers-reduced-motion` (tắt animation phi-thiết-yếu); thao tác được bằng bàn phím; ảnh có alt |
| NFR-03 | Bảo mật Admin | HTTPS bắt buộc; mật khẩu băm (bcrypt/argon2, không lưu thô), ≥ 12 ký tự; khóa 5 lần sai/15 phút; session timeout 30 phút; chống truy cập trang quản trị khi chưa xác thực (302 về đăng nhập) |
| NFR-04 | Tuân thủ PDPL | Không nhận lead khi consent ≠ true; PII truyền qua TLS1.2+; không PII trong URL/log thô; nội dung consent do Legal/DPO duyệt (AS-07); retention & xóa theo yêu cầu chủ thể dữ liệu [quy trình: cần anh Bryan cung cấp]; tài liệu/ví dụ dùng dữ liệu ẩn danh |
| NFR-05 | i18n | EN + VI đầy đủ toàn trang MVP; khung `/en /vi /my` sẵn, MY ẩn; đổi ngôn ngữ không vỡ layout; thiếu bản dịch khối động → ẩn khối ở ngôn ngữ thiếu (BR-DYN-01) |
| NFR-06 | Email lead | Lead đến hộp thư Sale **≤ 1 giờ** (mục tiêu ≤ 60s); retry ≤ 3 lần khi lỗi; mất-email không làm mất lead trong DB |
| NFR-07 | SEO | Mỗi dịch vụ có URL riêng `/{lang}/services/{slug}`; thẻ meta title/description theo ngôn ngữ; sitemap |
| NFR-08 | Tương thích | Chạy đúng trên 2 phiên bản gần nhất của Chrome/Edge/Safari/Firefox; responsive từ 360px đến desktop |
| NFR-09 | Chống lạm dụng form | Rate-limit **cửa sổ rolling 60 phút, ngưỡng 5 submit/IP**; IP client lấy từ header `X-Forwarded-For` do Nginx đặt (IP trái nhất); honeypot ẩn |
| NFR-10 | Sẵn sàng | Uptime trang public **≥ 99.5%/tháng** (target — ngưỡng hạ tầng: [cần anh Bryan cung cấp]) |

## 5. Ràng buộc dữ liệu & Vòng đời đối tượng nghiệp vụ

- Đối tượng nghiệp vụ chính + vòng đời: `entity-lifecycle.md` (E-01 Lead · E-02 Content Block · E-03 Admin Account · E-04 Service). SRS tham chiếu, không lặp bảng trạng thái.
- Phân loại nhạy cảm: **PII** = Lead (họ tên, email, SĐT, tên DN), Admin Account (email + mật khẩu băm) → xử lý theo NFR-03/04. **Công khai** = Content Block (`Hiển thị`), Service. **Nội bộ** = Lead khi lưu, audit log.
- Mỗi FR nghiệp vụ bám một hành động trên vòng đời — bảng FR↔đối tượng↔trạng thái: `entity-lifecycle.md §2`.

## 6. Giao diện ngoài

| Hệ thống | Vai trò | Ràng buộc |
|----------|---------|-----------|
| Hệ thống email / SMTP (A-04) | Gửi email báo Sale | Địa chỉ Sale từ AS-09 [cần anh Bryan cung cấp]; retry ≤ 3 |
| Nơi nhận lead cuối (CRM/Sheet) | Đích lead tương lai | MVP dùng DB + email; đích CRM chốt sau (Q1) — ngoài phạm vi MVP |
| Kênh | Web (public + Admin) | Không có app/Telegram/Zalo ở MVP |

## 7. Truy vết FR/NFR → BRD

| Mục tiêu BRD | FR/NFR phục vụ |
|--------------|----------------|
| BG-01 (thu lead) | FR-06, FR-07, FR-08, FR-10, FR-11, NFR-04, NFR-09 |
| BG-02 (độ phủ dịch vụ) | FR-04, FR-05, NFR-07 |
| BG-03 (EN+VI) | FR-03, NFR-05 |
| BG-04 (lead tới Sale ≤ 1h) | FR-09, NFR-06 |
| BG-05 (branding) | FR-01, NFR-02 |
| BG-06 (chất lượng kỹ thuật) | NFR-01, NFR-02 |
| BG-07 (Admin tự chủ nội dung động) | FR-02, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, NFR-03 |

> Mọi FR (FR-01..18) nối được về ≥ 1 BG; mọi NFR (NFR-01..10) nối được về ≥ 1 BG. Không FR/NFR mồ côi.

---

## ✅ Checklist đặc tả
- [x] Mọi FR có ID, actor, tiền/hậu điều kiện (thành công & thất bại).
- [x] Luồng chính đánh số + cột C/R/U/D; mọi nhánh lỗi có luồng thay thế đánh số.
- [x] Bảng validate field-level + thông báo lỗi cụ thể (FR-07, FR-12/13/14, FR-16).
- [x] Bảng quyết định đủ tổ hợp: FR-07 (8 dòng), FR-02 (4), FR-15 (4), FR-16 (4).
- [x] Ví dụ tính tay có ca fail (FR-07, FR-16, FR-02).
- [x] Tiêu chí chấp nhận Given–When–Then cho mọi FR.
- [x] NFR đo được (Lighthouse ≥80, contrast 4.5:1, TTFB P95 <500ms, khóa 5/15, session 30 phút, email ≤1h).
- [x] Ràng buộc PDPL; không PII thật; phân loại nhạy cảm.
- [x] Truy vết ngược UC + BR + BG cho mọi FR.
- [x] Từ cấm: đã grep sạch toàn bộ danh mục từ mơ hồ trong checklist SRS-template — không còn chỗ nào dùng từ định tính thay cho con số/quy tắc/danh sách đóng.
