# WALKTHROUGH — Kịch bản chạy tay end-to-end — Landing page dịch vụ B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-02 | Owner | BA |
|-----------|------|------|------------|-------|-----|

> Chạy tay 5 kịch bản (1 happy + 4 "ác") xuyên qua SRS/entity-lifecycle. Mỗi bước trích mã tài liệu. Dữ liệu là ẩn danh (không PII thật).

## Kịch bản 1 — Happy path: khách submit lead → lưu → báo Sale *(F-01)*

- **Bối cảnh:** Chị "Nguyen A" (ẩn danh), phòng IT một chuỗi F&B, đang xem trang chi tiết dịch vụ **DIA** ở ngôn ngữ VI, lần gửi form thứ 1 trong giờ. Địa chỉ email Sale đã cấu hình (AS-09).
- **Diễn biến từng bước:**

| # | Diễn biến | Tài liệu trả lời | Đối tượng: trạng thái nguồn → đích | Khớp? |
|---|-----------|------------------|-------------------------------------|:-----:|
| 1 | Bấm CTA "Đăng ký tư vấn" trên trang DIA → tới form, ô "Dịch vụ quan tâm" prefill = DIA | FR-06 AC | Service (đọc); Lead: chưa sinh | ✅ |
| 2 | Nhập họ tên, email `a@fnb.com`, SĐT `0912345678`, DN "Cong ty A", lời nhắn ≤ 1000 ký tự, tick consent | FR-07 validate; NFR-04 | — | ✅ |
| 3 | Bấm Gửi; server validate + chống spam đạt (honeypot rỗng, lần 1/giờ) | FR-07 luồng chính b.2; FR-10; bảng QĐ dòng 1 | — | ✅ |
| 4 | Hệ thống lưu lead, hiện trang cảm ơn | FR-07 b.3; FR-08 | Lead: — → `Mới` | ✅ |
| 5 | Hệ thống yêu cầu gửi email tóm tắt tới hộp thư Sale; gửi thành công lúc 10:00:12 | FR-09 b.1-2; BR-LEAD-02; NFR-06 | Lead `Mới` (side-effect email) | ✅ |
| 6 | 09:15 hôm sau Admin đăng nhập, mở lead này lần đầu | FR-16; FR-11 b.2 | Admin Account `Hoạt động`; Lead `Mới` → `Đã xem` | ✅ |

- **Kết cục:** 1 lead ở `Đã xem`, 1 email tới Sale trong ≤ 1 giờ (thực 12 giây), 2 audit log (đăng nhập + mở lead). Khớp máy trạng thái E-01.
- **Lỗ hổng phát hiện:** không.

## Kịch bản 2 — "Ác": khách bỏ trống trường bắt buộc + không tick consent

- **Bối cảnh:** khách vội, chỉ nhập họ tên + email, bỏ trống SĐT và tên DN, **không tick consent**, bấm Gửi.
- **Diễn biến từng bước:**

| # | Diễn biến | Tài liệu trả lời | Đối tượng: trạng thái | Khớp? |
|---|-----------|------------------|------------------------|:-----:|
| 1 | Bấm Gửi khi thiếu SĐT + tên DN + consent | FR-07 ngoại lệ 2a, 2b; bảng QĐ dòng "Không/Không/Có" | Lead: không sinh | ✅ |
| 2 | Hệ thống hiển thị lỗi từng trường: SĐT "Số điện thoại chỉ gồm 8–15 chữ số"; DN "Vui lòng nhập tên doanh nghiệp (2–150 ký tự)"; ưu tiên gộp lỗi trường (LEAD-001) | FR-07 validate; mã LEAD-001 | — | ✅ |
| 3 | Khách bổ sung SĐT + DN nhưng vẫn quên consent, bấm Gửi | FR-07 ngoại lệ 2b; bảng QĐ dòng "Có/Không/Có" | Lead: không sinh | ✅ |
| 4 | Hệ thống chặn, báo tại ô consent "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" (LEAD-010) | FR-07 2b; NFR-04 (không nhận lead khi consent ≠ true) | — | ✅ |
| 5 | Khách tick consent, bấm Gửi | bảng QĐ dòng 1 | Lead: — → `Mới` | ✅ |

- **Kết cục:** không lead nào tạo ở bước 1-4 (đúng: không PII lưu khi thiếu consent); chỉ tạo lead ở bước 5. Không email nào gửi cho tới khi lead `Mới`.
- **Lỗ hổng phát hiện:** không (mọi nhánh có mã lỗi + luồng thay thế).

## Kịch bản 3 — "Ác": Admin ẩn khối "Con số" đang Hiển thị

- **Bối cảnh:** landing đang hiển thị khối Stat "Enterprise customers: 1.200+" (trạng thái `Hiển thị`, đủ EN+VI). Admin phát hiện số cần rút xuống chờ duyệt lại, muốn ẩn ngay.
- **Diễn biến từng bước:**

| # | Diễn biến | Tài liệu trả lời | Đối tượng: trạng thái nguồn → đích | Khớp? |
|---|-----------|------------------|-------------------------------------|:-----:|
| 1 | Admin đăng nhập, vào mục "Con số nổi bật" | FR-16; FR-14 | Admin Account `Hoạt động` | ✅ |
| 2 | Bấm "Tắt hiển thị" khối Stat đó | FR-15; E-02 máy trạng thái (Hiển thị → Ẩn) | Content Block: `Hiển thị` → `Ẩn` | ✅ |
| 3 | Khối biến mất khỏi public sau ≤ TTL cache (≤ 60s) | FR-02 bảng QĐ dòng "Không/…= Ẩn"; NFR-01 (TTL ≤ 60s) | Content Block `Ẩn` (public không đọc) | ✅ |
| 4 | Có 1 dòng audit log "tắt hiển thị Content Block + mã khối" | FR-18 | side-effect | ✅ |
| 5 | Khách đang mở landing (trang đã tải trước đó) refresh sau 60s → không còn thấy khối | FR-02; NFR-01 | — | ✅ |

- **Kết cục:** khối ở `Ẩn`, không xóa (có thể bật lại — E-02 `Ẩn` → `Hiển thị`); doanh thu vẫn không xuất hiện (BR-STAT-01, Q8). Khớp máy trạng thái.
- **Lỗ hổng phát hiện:** không.

## Kịch bản 4 — "Ác": đổi ngôn ngữ giữa chừng, khối chưa có bản dịch VI

- **Bối cảnh:** landing EN có 3 khối Highlight `Hiển thị`: 2 khối đủ EN+VI, khối "New: SD-WAN bundle" chỉ nhập EN (VI trống). Khách đang điền dở form (đã nhập họ tên) ở EN rồi bấm chuyển sang VI.
- **Diễn biến từng bước:**

| # | Diễn biến | Tài liệu trả lời | Đối tượng: trạng thái | Khớp? |
|---|-----------|------------------|------------------------|:-----:|
| 1 | Khách bấm chuyển EN → VI | FR-03 luồng chính b.1 | Content Block (đọc theo VI) | ✅ |
| 2 | Khối "SD-WAN bundle" thiếu bản dịch VI → **ẩn ở VI**, không render nội dung rỗng | FR-03 ngoại lệ 1a; FR-02 bảng QĐ dòng "Có/Không = Ẩn ở ngôn ngữ đó"; BR-DYN-01 | Content Block `Hiển thị` (ẩn ở VI, vẫn hiện ở EN) | ✅ |
| 3 | 2 khối đủ VI vẫn hiển thị bình thường ở VI | FR-02 bảng QĐ dòng 1 | — | ✅ |
| 4 | Ô "họ tên" trong form vẫn giữ giá trị đã nhập; chỉ nhãn/thông báo đổi sang VI | FR-03 ngoại lệ 1c AC | Lead: chưa sinh | ✅ |
| 5 | Admin xem danh sách khối thấy cảnh báo "thiếu bản dịch VI" trên khối SD-WAN | FR-12 validate (VI không bắt buộc, thiếu → ẩn ở VI) | Content Block `Hiển thị` | ✅ |

- **Kết cục:** VI hiển thị 2 khối, khối chỉ-EN ẩn ở VI (không lỗi rỗng), form không mất dữ liệu. Khớp BR-DYN-01.
- **Lỗ hổng phát hiện:** không.

## Kịch bản 5 — "Ác": brute-force đăng nhập Admin

- **Bối cảnh:** kẻ lạ thử đoán mật khẩu admin, sai liên tiếp trong 15 phút.
- **Diễn biến từng bước:**

| # | Diễn biến | Tài liệu trả lời | Đối tượng: trạng thái nguồn → đích | Khớp? |
|---|-----------|------------------|-------------------------------------|:-----:|
| 1 | Nhập sai mật khẩu lần 1→4 trong 12 phút | FR-16 ngoại lệ 1a; bảng QĐ dòng "Sai/Không" | Admin Account `Hoạt động` (đếm sai = 4) | ✅ |
| 2 | Mỗi lần báo lỗi chung "Email hoặc mật khẩu không đúng" (AUTH-001, không lộ trường sai) | FR-16 1a; NFR-03 | — | ✅ |
| 3 | Nhập sai lần 5 (trong 15 phút) | FR-16 ngoại lệ 1b; BR-AUTH-01; E-03 máy trạng thái | Admin Account `Hoạt động` → `Tạm khóa` | ✅ |
| 4 | Thử tiếp lần 6 → bị từ chối "Tài khoản tạm khóa, thử lại sau 15 phút" (AUTH-010) | FR-16 1c; bảng QĐ dòng "Sai/Có" | Admin Account `Tạm khóa` | ✅ |
| 5 | Sau 15 phút, admin thật nhập đúng | FR-16 luồng chính; E-03 (Tạm khóa → Hoạt động sau cooldown) | `Tạm khóa` → `Hoạt động`; tạo phiên 30 phút | ✅ |
| 6 | Có audit log các lần sai + mốc khóa | FR-18 | side-effect | ✅ |

- **Kết cục:** tài khoản khóa 15 phút sau 5 lần sai; tự mở khóa; admin thật vào được; không lộ trường nào sai. Khớp máy trạng thái E-03.
- **Lỗ hổng phát hiện:** không.

## Tổng hợp lỗ hổng & xử lý

| # | Lỗ hổng (kịch bản/bước) | Sửa vào đâu | Trạng thái |
|---|--------------------------|-------------|------------|
| — | Không phát hiện lỗ hổng; cả 5 kịch bản toàn ✅ | — | Đã đóng |

---

## ✅ Checklist walkthrough
- [x] ≥3 kịch bản "ác": KB2 (validate/consent), KB3 (state transition + side-effect), KB4 (i18n fallback), KB5 (phân quyền/brute-force) + KB1 happy.
- [x] Mọi bước có cột "Tài liệu trả lời" trích mã (FR/BR/dòng state/bảng QĐ).
- [x] Số liệu cụ thể (10 chữ số SĐT, 5 lần sai/15 phút, TTL ≤ 60s, ≤ 1 giờ email).
- [x] Không dòng ❓/❌ còn lại; mọi kịch bản toàn ✅.
- [x] Văn kể đọc ~5 phút; không PII thật (dữ liệu ẩn danh).
