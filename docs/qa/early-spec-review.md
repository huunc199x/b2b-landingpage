# Rà đặc tả sớm (Shift-left) — SRS Landing page B2B Mytel

| Phiên bản | v0.1 | Ngày | 2026-09-02 | Vai trò | Tester/QA | Thời điểm | TRƯỚC GATE-2 |
|-----------|------|------|------------|---------|-----------|-----------|--------------|

> **Mục đích:** dò đặc tả lỏng *trước khi có code* (shift-left, SKILL tester §"RÀ ĐẶC TẢ SỚM"). Với mỗi FR, thử nháp test case Given–When–Then (happy + biên + lỗi). FR nào không viết nổi test case → trả về BA. Đây **không phải** kết quả kiểm thử hệ thống (chưa có code).
> **Nguồn:** `docs/ba/SRS.md` (18 FR + 10 NFR), đối chiếu `actor-usecase.md` (UC-01..15, ma trận quyền §3b), `entity-lifecycle.md` (E-01..04, bản đồ FR §2).
> **Quy ước cột "Viết được test case?":** **Đ** = viết được đủ happy + biên + lỗi. **Đ\*** = viết được nhưng còn 1 điểm biên/giá trị/điều kiện mơ hồ cần BA chốt (đã liệt kê ở Mục 2). **K** = không viết nổi (thiếu cả đặc tả).

---

## 1. Bảng FR × "viết được test case?" (Đ / Đ\* / K)

| FR | Tên | Viết được? | Nháp test case (tóm tắt: happy · biên · lỗi) | Ghi chú testability |
|----|-----|:---------:|-----------------------------------------------|---------------------|
| FR-01 | Xem Landing tổng | **Đ\*** | H: mở `/en` → hero + 4 section + khối `Hiển thị`. B: 0 khối động. L: — | AC rõ. **Thiếu empty-state**: khi 0 khối `Hiển thị`, section động render thế nào (ẩn hẳn / placeholder)? → Mục 2. |
| FR-02 | Render khối động | **Đ** | H: 3 `Hiển thị` đúng thứ tự. B: trùng thứ tự (sắp phụ theo update desc — FR-15). L: khối lỗi bị bỏ qua, phần còn lại render. | Bảng quyết định 4 tổ hợp đầy đủ + ví dụ tính tay. Sinh EP/decision-table trực tiếp. |
| FR-03 | Đổi ngôn ngữ EN↔VI | **Đ** | H: EN→VI đổi toàn trang + tiền tố URL. B: khối thiếu VI → ẩn ở VI. L: đang điền form đổi ngôn ngữ → giữ dữ liệu; chọn MY → ẩn. | Alt-flow 1a/1b/1c + 2 AC đủ nhánh. |
| FR-04 | Duyệt 3 nhóm | **Đ** | H: đếm đúng 18 card = 7/3/8. B: mỗi card link chi tiết. L: — | AC gọn nhưng đo được (đếm số). |
| FR-05 | Trang chi tiết dịch vụ | **Đ\*** | H: `/vi/services/dia` → 7 trường, ẩn Price, CTA prefill "DIA". B: trường thiếu VI → fallback EN. L: slug ngoài 18 → 404 song ngữ. | **Lỗi diễn đạt 7 vs 8**: hậu điều kiện ghi "7 trường public" nhưng bảng liệt kê 8 trường Excel (ẩn 1 = Price) → cần chốt "hiển thị đúng 7". → Mục 2. |
| FR-06 | CTA tư vấn | **Đ** | H: trang DIA → bấm CTA → form với ô dịch vụ = "DIA". B: từ landing (không prefill cụ thể) → "Tư vấn chung"? L: — | Mọi trang có ≥1 CTA. Nên xác nhận prefill khi CTA từ landing tổng (Mục 2, nhẹ). |
| FR-07 | Submit form lead ⭐ | **Đ** | H: đủ trường + consent + honeypot rỗng + lần 1 → tạo lead `Mới` + 1 email. B: SĐT 8/15 chữ số (min/max), họ tên 2/100, submit lần 5 vs 6. L: LEAD-001/010/020/021/030, giao dịch nguyên tử. | **Chuẩn mực để kiểm thử:** bảng validate field-level + bảng quyết định 8 tổ hợp + ví dụ fail. Sinh EP+BVA trực tiếp. Còn 1 câu xoáy dedup double-submit (Mục 2, nhẹ). |
| FR-08 | Lưu lead | **Đ** | H: ghi lead nguyên tử `Mới`. B: — . L: lỗi DB → không tạo lead một phần (LEAD-030). | Bám FR-07 bước 3; nguyên tử đã đặc tả. |
| FR-09 | Email báo Sale | **Đ\*** | H: lead lúc 10:00 → email vào hộp Sale trước 11:00. B: mục tiêu ≤60s. L: gửi lỗi → retry ≤3 lần/5 phút, sau 3 lần ghi log, không mất lead; AS-09 thiếu → log + lead vẫn `Mới`. | Logic gửi/retry/log **test được** bằng hộp thư giả. **Nhưng đích thật (địa chỉ Sale, AS-09) = [cần anh Bryan]** → không nghiệm thu end-to-end go-live được cho tới khi chốt. → Mục 2 + Mục 3 (NFR-06). |
| FR-10 | Chống spam form | **Đ\*** | H: honeypot rỗng + trong hạn → cho gửi. B: submit thứ 5 (cho) vs 6 (chặn LEAD-021). L: honeypot ≠ rỗng → cảm ơn giả, không tạo lead, cờ nghi spam. | **Ngữ nghĩa cửa sổ rate-limit + cách nhận diện IP chưa chốt** (rolling 60' hay bucket theo giờ? sau proxy/NAT dùng IP nào?) → ảnh hưởng test biên. → Mục 2. |
| FR-11 | Admin xem lead | **Đ\*** | H: mở lead `Mới` → `Đã xem` + 1 audit log, các lead khác giữ `Mới`. B: phân trang 20/trang (lead thứ 21 sang trang 2), lọc trạng thái/ngày/dịch vụ. L: chưa đăng nhập → chuyển login; không có nút sửa/xóa (BR-18). | IDOR: gọi thẳng API sửa/xóa lead phải bị chặn (ô ✗ ma trận). **Thiếu empty-state 0 lead** → Mục 2 (nhẹ). |
| FR-12 | CRUD Highlight | **Đ** | H: nhập EN → Lưu nháp → `Nháp` + audit log. B: tiêu đề 2/120, mô tả 2/300, ảnh ≤2MB, thứ tự ≥0. L: thiếu EN bắt buộc → báo lỗi, không lưu; xóa → soft-delete `Đã xóa`. | Bảng validate đầy đủ + thông báo lỗi cụ thể. Sinh BVA trực tiếp. |
| FR-13 | CRUD Partner | **Đ** | H: tạo logo+tên → bật → hiện cả EN/VI. B: tên 2/120, logo ≤1MB. L: thiếu logo/tên → báo lỗi. | Trường riêng + thông báo lỗi rõ. |
| FR-14 | CRUD Stat | **Đ\*** | H: nhãn "Enterprise customers" + giá trị "1.200+" → hiện; không có ô doanh thu. B: nhãn 2/80, đơn vị ≤30. L: thiếu nhãn/giá trị EN → báo lỗi. | **Trường "Giá trị" định dạng mơ hồ**: "số + hậu tố" không có regex → không viết nổi ca biên/âm (chấp nhận `abc`? `1,200`? `+`?). → Mục 2. |
| FR-15 | Bật/Ẩn & sắp thứ tự | **Đ\*** | H: `Nháp` đủ EN → bật → `Hiển thị`, lên public ≤ TTL, audit log. B: trùng thứ tự → sắp phụ theo update desc. L: thiếu EN → chặn CB-010. | Bảng quyết định "bật hiển thị" đủ 4. **Thiếu AC/ví dụ cho "Tắt hiển thị" (`Hiển thị`→`Ẩn`) và cho "Sắp thứ tự"** dù lifecycle có → Mục 2 (nhẹ). |
| FR-16 | Đăng nhập Admin ⭐ | **Đ** | H: mật khẩu đúng + `Hoạt động` → phiên 30' + audit log. B: sai lần 4 (AUTH-001) vs lần 5 (AUTH-010 khóa), phút 16 đúng → phiên. L: lỗi chung "Email hoặc mật khẩu không đúng", đăng nhập khi `Tạm khóa`. | Bảng quyết định 4 + ví dụ tính tay đủ nhánh khóa/cooldown. |
| FR-17 | Đăng xuất / hết phiên | **Đ** | H: bấm Đăng xuất → hủy phiên + audit log. B: idle đúng 30' → thao tác kế bị chuyển login (AUTH-020). L: — | Idle-timeout đo được. |
| FR-18 | Audit log | **Đ** | H: xóa 1 khối → 1 dòng log (thời điểm + "xóa Content Block" + mã khối). B: — . L: không ghi mật khẩu/PII lead (chỉ mã lead). | Trường log định nghĩa rõ; kiểm phủ mọi thao tác quản trị (UC-07..13). |

**Tổng kết Mục 1:** 18/18 FR **viết được test case** (không có FR = K, không có FR "không test được" hoàn toàn). Trong đó **11 FR = Đ (sạch)** và **7 FR = Đ\*** (FR-01, FR-05, FR-09, FR-10, FR-11, FR-14, FR-15) — viết được test nhưng còn 1 điểm biên/giá trị/điều kiện cần BA làm rõ để test **chính xác ở biên**.

---

## 2. Danh sách "FR CẦN BA SỬA" + câu hỏi xoáy

> Không FR nào bị chặn hoàn toàn; các mục dưới là **điểm biên/giá trị/điều kiện thiếu** khiến không viết nổi *một* nhóm ca test (thường là ca biên hoặc ca lỗi). Xếp theo mức ảnh hưởng.

### Mức cần chốt trước khi khoá SRS (ảnh hưởng test biên/nghiệm thu)

- **FR-10 / NFR-09 — Ngữ nghĩa rate-limit chưa xác định.**
  - Lý do: "5 submit/IP/giờ" nhưng không nói cửa sổ tính là **rolling 60 phút** hay **bucket theo giờ đồng hồ**; và **nhận diện IP** sau proxy/CDN dùng field nào.
  - Câu hỏi xoáy: (1) Gửi 5 lần lúc 10:59 rồi lần 6 lúc 11:00 — có reset không? (2) Nhiều người dùng **cùng IP NAT/công ty** có bị chặn oan không — có ngưỡng riêng không? (3) Sau reverse-proxy lấy IP từ `X-Forwarded-For` hay IP kết nối? IPv6 tính theo /64 hay full? → **Không chốt thì không viết được ca biên "lần thứ 5 vs 6 quanh mốc giờ" một cách xác định.**

- **FR-14 — Trường "Giá trị" (Stat) thiếu định dạng đóng.**
  - Lý do: "số + hậu tố" (vd `1.200+`, `63`) không có regex/miền giá trị → không viết nổi ca âm.
  - Câu hỏi xoáy: Chuỗi nào **hợp lệ / bị từ chối**? Cho phép dấu phẩy `1,200`? Chữ cái (`1.2K`)? Chỉ dấu `+` đơn lẻ? Có phải luôn bắt đầu bằng chữ số? → Cần **1 regex hoặc danh sách mẫu đóng** như các trường khác.

- **FR-09 / NFR-06 — Đích email Sale (AS-09) chưa chốt (owner: [cần anh Bryan]).**
  - Lý do: logic soạn/gửi/retry/log **test được**, nhưng **địa chỉ hộp thư Sale thật chưa có** → không nghiệm thu end-to-end "email tới đúng hộp Sale ≤ 1h" ở go-live.
  - Câu hỏi xoáy: (1) Địa chỉ Sale go-live là gì, ai xác nhận? (2) Khi AS-09 thiếu lúc chạy thật — chỉ log cảnh báo có đủ để vận hành biết không, hay cần alert? (3) 1 địa chỉ hay danh sách? → Không chặn viết test logic (dùng hộp thư giả), **nhưng chặn tiêu chí nghiệm thu B6/go-live**.

### Mức nên bổ sung để phủ đủ nhánh (không chặn GATE-2)

- **FR-05 — Sửa mâu thuẫn "7 vs 8 trường".** Hậu điều kiện ghi "7 trường public" nhưng thân bài "8 trường Excel". Chốt câu chữ: hiển thị **đúng 7** trường (ẩn Price Policy) để AC không nhập nhằng.
- **FR-15 — Thiếu AC cho "Tắt hiển thị" và "Sắp thứ tự".** Lifecycle E-02 có chuyển `Hiển thị`→`Ẩn` và hành động sắp thứ tự, nhưng FR-15 chỉ có bảng quyết định + AC cho "Bật hiển thị". Bổ sung 1 AC "Tắt hiển thị → public mất sau ≤ TTL" và 1 AC/ví dụ "trùng thứ tự → sắp phụ theo update desc".
- **FR-01 & FR-11 — Thiếu empty-state.** Khi **0 khối động** (FR-01) và **0 lead** (FR-11), UI hiển thị gì? Không có sẽ để tester đoán → thêm 1 dòng đặc tả empty-state mỗi FR.
- **FR-06 — Prefill khi CTA từ landing tổng.** Từ trang dịch vụ CTA prefill dịch vụ đó (đã rõ). Từ **landing tổng / section chung**, ô "Dịch vụ quan tâm" mặc định là "Tư vấn chung" hay để trống? Chốt 1 câu.
- **FR-07 — Chống double-submit trùng nội dung.** Trong hạn rate-limit + honeypot rỗng, khách bấm Gửi 2 lần nhanh (hoặc mạng lặp) → tạo **2 lead trùng**? MVP có cần khử trùng (idempotency / khoá nút) không? Nếu "chấp nhận trùng" thì ghi rõ để tester không báo là bug.

---

## 3. NFR chưa đo được / cần điều kiện đo

| NFR | Đo được? | Vấn đề | Cần bổ sung |
|-----|:--------:|--------|-------------|
| NFR-01 Hiệu năng | **Phần lớn Đ** | Có ngưỡng số rõ (Lighthouse ≥80, LCP<2.5s Moto G4/4G, TTFB **P95**<500ms, TTL≤60s). Nhưng **P95 đo trên tập mẫu/khoảng thời gian nào, trang nào** chưa nêu. | Chốt: đo P95 trên (URL nào — landing + 1 trang dịch vụ?), số request/khoảng thời gian, có tải đồng thời hay không. |
| NFR-02 Accessibility | **Đ** | Contrast ≥4.5:1, reduced-motion, bàn phím, alt — kiểm được bằng axe/thủ công. | (Nhẹ) nêu ngoại lệ WCAG cho **text lớn** (3:1) để không báo nhầm. |
| NFR-03 Bảo mật Admin | **Đ** | HTTPS, hash bcrypt/argon2 ≥12, khóa 5/15, session 30', 302 khi chưa xác thực — đều test được. | — |
| NFR-04 PDPL | **Một phần K** | Consent/TLS/không-PII-trong-URL-log **test được**. Nhưng **retention & xóa theo yêu cầu chủ thể dữ liệu = [cần anh Bryan]** — không có SLA/quy trình → **không viết nổi test**. | Chốt quy trình + thời hạn retention/xóa (hoặc ghi rõ "thủ công, ngoài phạm vi tự động MVP" để tester loại khỏi phạm vi). |
| NFR-05 i18n | **Phần lớn Đ** | EN/VI đủ, MY ẩn, thiếu dịch → ẩn khối — test được. "**Không vỡ layout**" hơi định tính. | Gắn tiêu chí đo: không tràn ngang / không chồng chữ ở các breakpoint NFR-08 (360px→desktop). |
| NFR-06 Email lead | **Đ (logic)** | ≤1h (mục tiêu ≤60s), retry ≤3, không mất lead — đo được. **Nhưng phụ thuộc đích AS-09** (xem Mục 2 FR-09) cho nghiệm thu thật. | Chốt AS-09. |
| NFR-07 SEO | **Đ** | URL riêng, meta title/desc theo ngôn ngữ, sitemap — kiểm được. | — |
| NFR-08 Tương thích | **Đ** | 2 bản gần nhất Chrome/Edge/Safari/Firefox, responsive 360px→desktop — có ma trận thiết bị/trình duyệt. | (Nhẹ) chốt cận trên "desktop" (vd 1440px) cho nhất quán ca test. |
| NFR-09 Chống lạm dụng | **Đ\*** | Rate-limit ≤5/IP/giờ + honeypot — đo được **nhưng cùng lỗ hổng ngữ nghĩa cửa sổ + IP** như FR-10. | Xem Mục 2 FR-10. |
| NFR-10 Sẵn sàng | **Chưa đo được** | Uptime ≥99.5%/tháng là **số**, nhưng **ngưỡng hạ tầng = [cần anh Bryan]** và **điều kiện đo chưa có**: cửa sổ tính, công cụ giám sát, loại trừ bảo trì có kế hoạch, định nghĩa "down". | Chốt: công cụ đo (uptime monitor nào), có trừ maintenance window không, mốc tính tháng. Nếu chưa có hạ tầng → đánh dấu "target, chưa nghiệm thu ở MVP". |

**NFR cần cờ:** **NFR-10** (uptime — điều kiện đo + ngưỡng hạ tầng chưa có → chưa nghiệm thu được), **NFR-04** (retention/xóa — quy trình chưa có → không test được phần đó), **NFR-09** (ngữ nghĩa rate-limit — chung với FR-10). Nhẹ: **NFR-01** (mẫu P95), **NFR-05** ("không vỡ layout").

---

## 4. Độ phủ (coverage) — FR ↔ UC ↔ vòng đời

- **Mọi FR bám ≥1 UC:** đối chiếu `actor-usecase.md §2` — FR-01/02→UC-01, FR-03→UC-04, FR-04→UC-02, FR-05→UC-03, FR-06→UC-06, FR-07/08/10→UC-05, FR-09→UC-14/15, FR-11→UC-13, FR-12→UC-09, FR-13→UC-10, FR-14→UC-11, FR-15→UC-12, FR-16→UC-07, FR-17→UC-08, FR-18→UC-07..13. **Không FR mồ côi UC.**
- **Mọi FR bám 1 hành động vòng đời:** `entity-lifecycle.md §2` ánh xạ đủ FR-01..18 về đối tượng + chuyển trạng thái. **Không FR mồ côi vòng đời.**
- **Điểm mạnh test-point:** ma trận Actor×Hành động (§3b) và Trạng thái×Hành động (§1d) **đóng, không ô trống** → mỗi ô ✗ sinh 1 **ca negative/IDOR** (vd Admin gọi thẳng API sửa/xóa lead → phải chặn; thao tác trên khối `Đã xóa` → phải chặn; truy cập `/admin` chưa xác thực → 302). Bảng quyết định FR-07 (8) / FR-02 (4) / FR-15 (4) / FR-16 (4) → mỗi dòng = 1 ca.
- **Thiếu test-point nhỏ (đã nêu Mục 2):** empty-state (FR-01, FR-11); AC cho "Tắt hiển thị" + "Sắp thứ tự" (FR-15). Không có nhánh nghiệp vụ lớn nào thiếu.
- **Đồng thời / fail giữa chừng / phân quyền:** đồng thời phía Admin **N/A** (1 admin — Q9); đồng thời phía public = double-submit form (rate-limit phủ, còn dedup để ngỏ — Mục 2); fail giữa chừng đã phủ (FR-07 2e nguyên tử, 2f email lỗi giữ lead; FR-09 retry); phân quyền phủ bằng ma trận ✗.

---

## 5. Kết luận — SRS đã đủ chín để qua GATE-2 chưa?

**CHÍN CÓ ĐIỀU KIỆN — nên cho qua GATE-2.**

- **Không có FR "không test được".** 18/18 FR viết được test case Given–When–Then đủ happy + biên + lỗi. Các FR trọng tâm (FR-07 form lead, FR-16 đăng nhập) có bảng validate + bảng quyết định + ví dụ tính tay ở mức **sinh test bằng kỹ thuật EP/BVA/decision-table trực tiếp** — đây là mức đặc tả tốt.
- **7 FR = Đ\*** chỉ vướng điểm biên/giá trị lẻ (đã liệt kê Mục 2), **không** thiếu cả đặc tả → không chặn GATE-2, nhưng **phải chốt trước khi khoá test-case ở B3/B4**.
- **Phải xử lý (không chặn cổng nhưng cần lịch chốt):** (a) ngữ nghĩa rate-limit + nhận diện IP (FR-10/NFR-09); (b) regex trường "Giá trị" Stat (FR-14); (c) đích email Sale AS-09 (FR-09/NFR-06) — phụ thuộc ngoài, chặn nghiệm thu go-live chứ không chặn thiết kế; (d) điều kiện đo NFR-10 (uptime) và quy trình retention NFR-04 — hai NFR này **hiện chưa nghiệm thu được**, nên đánh dấu rõ trạng thái (target/ngoài phạm vi tự động MVP) để tránh treo cổng sau.
- **Sửa nhanh câu chữ:** mâu thuẫn 7↔8 trường (FR-05); thêm AC "Tắt hiển thị"/"Sắp thứ tự" (FR-15); empty-state (FR-01, FR-11); prefill CTA từ landing (FR-06).

**Khuyến nghị cho PO/GATE-2:** duyệt SRS qua cổng, kèm **danh sách action-item Mục 2 + Mục 3** giao BA làm rõ và cập nhật vào SRS/FSD ở B3. Các mục [cần anh Bryan] (AS-09, retention, ngưỡng uptime hạ tầng) đã được BA đánh dấu sẵn — cần owner trả lời trước B6/go-live, không chặn thiết kế B3.
