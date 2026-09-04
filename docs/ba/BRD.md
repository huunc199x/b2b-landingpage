# BRD — Landing page dịch vụ B2B Mytel

| Phiên bản | v0.2 | Ngày | 2026-09-02 | Người viết | BA | Trạng thái | DRAFT (chờ GATE-1) |
|-----------|------|------|------------|------------|----|-----------|--------------------|

> **Thay đổi v0.1 → v0.2 (2026-09-02, anh Bryan yêu cầu):** Bổ sung **phần Admin (CMS-lite) + Database** để marketing **tự cấu hình các khối nội dung động** trên landing (Sản phẩm/dịch vụ mới, Đối tác, Con số nổi bật: doanh thu/khách hàng…) mà không cần dev. **Hệ quả:** kiến trúc chuyển từ "SSG tĩnh thuần" sang **web app có backend + DB + xác thực admin**; SA phải cập nhật techstack/HLD ở B2. Xem BG-07, actor "Content Admin", BR-13..BR-18, §Phạm vi, §Rủi ro, câu hỏi mở Q7..Q10.

> **Vai trò tài liệu:** BRD trả lời **VÌ SAO & CÁI GÌ ở mức kinh doanh**. Chi tiết chức năng (FR, validate trường, luồng màn hình, chọn công nghệ) để ở **SRS (B2)** và **HLD (SA)** — BRD này **không** đặc tả chức năng.
>
> **Tiền đề:** Đã brainstorm & được anh Bryan chốt hướng ngày 2026-09-02 (xem `docs/_eval/decisions.md`). BRD là bản ghi có cấu trúc của hướng đã thống nhất.

---

## 1. Bối cảnh & Vấn đề

Mytel đang cung cấp **18 dịch vụ B2B** thuộc 3 nhóm năng lực (Connectivity 7 · Mobile ICT 3 · ICT Service 8 — chi tiết `docs/_eval/brief.md`). Hiện tại các dịch vụ này **chưa có một điểm chạm số (digital touchpoint) tập trung** để khách doanh nghiệp tra cứu năng lực và để lại nhu cầu tư vấn:

- Thông tin 18 dịch vụ hiện nằm ở file nội bộ (`B2B Eco System_1_1.1.xlsx`), **không có trang public** để khách doanh nghiệp tự tìm hiểu trước khi làm việc với Sale.
- Không có **kênh thu thập lead trực tuyến** chuẩn hoá: khách quan tâm không có nút "để lại thông tin", Sale không có nguồn lead inbound có cấu trúc; lead (nếu có) đến rải rác qua kênh cá nhân, **không đo đếm được**.
- Đối thủ trong khu vực đã có trang giới thiệu giải pháp doanh nghiệp; Mytel cần một trang **branding B2B** đồng bộ nhận diện (tông cam + kem, typography đậm) để củng cố định vị nhà cung cấp hạ tầng & ICT cho doanh nghiệp.

Vì vậy cần một **landing page dịch vụ B2B** vừa **quảng bá năng lực (branding)** vừa **thu lead có cấu trúc (lead-gen)**, ra bản đầu nhanh và mở rộng dần.

> **Lưu ý số liệu:** Các con số hiện trạng thực tế của Mytel (lượng lead inbound/tháng hiện tại, tỷ lệ chuyển đổi Sale, số liệu SLA/uptime để đưa lên trang) **[cần anh Bryan cung cấp]** — chưa đưa số bịa vào tài liệu.

## 2. Mục tiêu kinh doanh (đo được)

> Mục tiêu #1 anh Bryan đã chốt: **cả branding + lead-gen**. Các mục tiêu dưới đây phản ánh cả hai. Baseline gắn nhãn [cần anh Bryan cung cấp] ở chỗ cần số thật; target là **đề xuất của BA** để anh Bryan xác nhận/điều chỉnh ở GATE-1.

| ID | Mục tiêu | Chỉ số (baseline → target) | Thời hạn |
|----|----------|-----------------------------|----------|
| BG-01 | Thu lead doanh nghiệp có cấu trúc qua form đăng ký | Số lead hợp lệ/tháng: baseline **[cần anh Bryan cung cấp]** → **≥ 30 lead hợp lệ/tháng** (đề xuất BA — anh Bryan chốt target) | Sau 3 tháng go-live |
| BG-02 | Phủ đủ danh mục dịch vụ B2B trên kênh số | Số dịch vụ có trang chi tiết public: 0 → **18/18 dịch vụ** (hoặc tập mũi nhọn đợt 1 — xem câu hỏi mở Q4) | Đợt 1 (MVP) |
| BG-03 | Phủ ngôn ngữ đối tượng mục tiêu | Số ngôn ngữ đạt chuẩn nội dung: 0 → **2 (EN + VI)**; MY hoãn | Đợt 1 (MVP) |
| BG-04 | Rút ngắn thời gian phản hồi lead cho Sale | Thời gian từ lúc khách submit đến khi lead tới tay Sale: baseline **[cần anh Bryan cung cấp]** → **≤ 1 giờ (tự động định tuyến)** | Sau go-live |
| BG-05 | Nhận diện thương hiệu B2B đồng bộ | % trang tuân thủ brand guideline (tông màu, logo, typography): → **100% trang MVP đạt brand checklist** | Đợt 1 (MVP) |
| BG-06 | Chất lượng kỹ thuật trang (điều kiện branding không phản tác dụng) | Lighthouse Performance mobile → **≥ 80**; contrast văn bản chính đạt **WCAG AA 4.5:1**; đạt **`prefers-reduced-motion`** | Trước launch |
| BG-07 | Marketing **tự chủ cập nhật nội dung động** (không phụ thuộc dev) | Số khối nội dung động cấu hình được qua Admin (không cần deploy): 0 → **≥ 3 loại** (Sản phẩm/dịch vụ mới · Đối tác · Con số nổi bật) + thời gian cập nhật 1 khối: từ "chờ dev deploy" → **≤ 10 phút tự thao tác** | Đợt 1 (MVP) |

> BG-01 và BG-04 là trục **lead-gen**; BG-02/BG-03/BG-05 là trục **branding & độ phủ**; BG-06 là điều kiện chất lượng để branding không phản tác dụng (trang chậm/khó đọc làm hại thương hiệu).

## 3. Phạm vi

**Trong phạm vi (MVP đợt 1):**
- **1 Landing tổng** theo phong cách trang tham chiếu (hero + section Why/Coverage/Capabilities/Register, scroll-reveal).
- Gom **3 nhóm dịch vụ** (Connectivity 7 · Mobile ICT 3 · ICT Service 8) dạng card/grid.
- **18 trang chi tiết dịch vụ** dùng **chung 1 template**, map thẳng 8 trường sẵn có trong Excel (Tên · Nhóm · What is · Advantage · Target Customer · Target Sale · Delivery Timeline · Price Policy) — *phạm vi số lượng đợt 1 chờ chốt ở Q4*.
- **Form đăng ký lead** (thu thông tin doanh nghiệp) + **backend mỏng** lưu lead + **consent PDPL** + định tuyến lead về Sale.
- **2 ngôn ngữ EN + VI** (i18n chuẩn bị sẵn khung `/en /vi /my`).
- CTA đích rõ ràng trên landing và mỗi trang dịch vụ (đăng ký tư vấn / để lại thông tin).
- **Phần Admin (CMS-lite) + Database** — trang quản trị có **đăng nhập**, cho phép **Content Admin** cấu hình các **khối nội dung động** hiển thị trên landing, **không cần dev deploy**. Đợt 1 tối thiểu 3 loại khối:
  - **Sản phẩm/dịch vụ mới cung cấp** (highlight: tiêu đề, mô tả ngắn, ảnh, link, thứ tự, bật/tắt).
  - **Đối tác** (logo + tên + link, thứ tự, bật/tắt).
  - **Con số nổi bật** (nhãn + giá trị + đơn vị, vd "Khách hàng doanh nghiệp: 1.200+", "Độ phủ: 63 tỉnh") — *doanh thu chỉ đăng khi được duyệt, xem Q8*.
  - Mỗi khối: **đa ngữ EN/VI**, có trạng thái **hiển thị/ẩn**, lưu vào **DB**.

**Ngoài phạm vi (MVP đợt 1 — hoãn/không làm):**
- **Tiếng Myanmar (MY):** hoãn (bật khi có bản dịch đạt + xử lý font Unicode/Zawgyi).
- **Headless CMS thương mại / trang quản trị nội dung phức tạp (workflow duyệt nhiều cấp, versioning, phân quyền chi tiết):** không làm đợt 1. Đợt 1 chỉ làm **Admin CMS-lite tự xây** đủ cho các khối nội dung động ở §Phạm vi + quản trị lead; nâng cấp CMS đầy đủ sau nếu cần.
- **Quản trị nội dung 18 trang dịch vụ qua Admin:** *chờ chốt Q7* — đợt 1 mặc định nội dung 18 dịch vụ vẫn trong repo (map từ Excel), Admin chỉ quản các **khối marketing động**; nếu anh muốn Admin quản luôn 18 dịch vụ thì mở rộng phạm vi.
- **App nghiệp vụ / cổng khách hàng / self-service order:** không làm (đây là landing marketing, không phải app nghiệp vụ).
- **Thanh toán, ký hợp đồng online, tra cứu đơn hàng:** ngoài phạm vi.
- **Case study / testimonial / blog:** hoãn (chờ nội dung).
- **Hiển thị bảng giá công khai chi tiết:** chờ chốt ở Q3 (đa số dịch vụ "theo dự án").
- **Parallax / hiệu ứng animation nâng cao:** hoãn; đợt 1 chỉ animation nhẹ tôn trọng `prefers-reduced-motion`.
- **Tích hợp CRM 2 chiều đầy đủ:** đợt 1 chỉ định tuyến lead 1 chiều tới nơi nhận (chờ chốt ở Q1).

## 4. Stakeholders & Actors

### 4.1 Stakeholders (bên liên quan / quyền quyết)

| Vai trò | Người/Bộ phận | Quan tâm chính / Quyền quyết |
|---------|---------------|-------------------------------|
| Chủ đầu tư (duyệt) | anh Bryan | Duyệt hướng, mục tiêu, phạm vi, phương án IA ở GATE-1; cấp asset & brand; quyết các câu hỏi mở |
| Product Owner | PO | Điều phối pipeline, trình cổng, gom phản biện sản phẩm |
| Business team / Sale B2B | Bộ phận kinh doanh B2B | **Nơi nhận lead**; owner tiếp nhận & follow-up lead; đầu vào nội dung Target Sale |
| Quản trị nội dung / Marketing | Bộ phận marketing B2B | Cung cấp/duyệt nội dung 18 dịch vụ, asset, bản dịch VI; tuân thủ brand |
| Bộ phận pháp chế / tuân thủ | Legal / DPO | Duyệt nội dung consent PDPL, chính sách xử lý dữ liệu cá nhân của lead |

### 4.2 Actors (tác nhân tương tác với hệ thống — mức khái quát; chi tiết use case ở SRS B2)

| Actor | Mô tả | Nghiệp vụ khái quát |
|-------|-------|----------------------|
| Khách doanh nghiệp (visitor) | Người ra quyết định/khảo sát dịch vụ B2B, phân theo ngành từ trường **Target Customer** (vd: ISP/carrier, ngân hàng-tài chính, nhà hàng/F&B, doanh nghiệp đa chi nhánh, tổ chức cần bảo mật/giám sát…) | Xem landing, duyệt 3 nhóm, đọc trang chi tiết dịch vụ, đổi ngôn ngữ EN/VI, **submit form lead** |
| Sale B2B | Người tiếp nhận & xử lý lead | Nhận lead được định tuyến, follow-up khách (ngoài hệ thống landing ở MVP) |
| **Content Admin** (mới v0.2) | Người quản trị nội dung marketing của landing (thuộc Marketing) | **Đăng nhập Admin**; tạo/sửa/xoá/ẩn-hiện các **khối nội dung động** (Sản phẩm/dịch vụ mới, Đối tác, Con số nổi bật) đa ngữ EN/VI; **xem danh sách lead** đã thu (đợt 1) |
| Hệ thống nhận lead (ngoài) | CRM / email / Google Sheet — **[chờ chốt Q1]** | Nơi lead được ghi/chuyển tới |

## 5. Yêu cầu mức nghiệp vụ

> Mức **năng lực nghiệp vụ** (hệ thống phải *cho phép làm gì*); chi tiết luồng/validate để SRS. Mỗi dòng nối về một BG.

| ID | Yêu cầu nghiệp vụ | Ưu tiên | Phục vụ mục tiêu |
|----|-------------------|---------|------------------|
| BR-01 | Khách xem được Landing tổng giới thiệu năng lực B2B Mytel theo phong cách nhận diện đã duyệt | Cao | BG-05 |
| BR-02 | Khách duyệt dịch vụ theo 3 nhóm (Connectivity/Mobile ICT/ICT Service) và đi tới trang chi tiết | Cao | BG-02 |
| BR-03 | Khách xem trang chi tiết mỗi dịch vụ với 8 trường thông tin chuẩn từ Excel | Cao | BG-02 |
| BR-04 | Khách để lại thông tin nhu cầu qua **form đăng ký lead** (kèm dịch vụ quan tâm) | Cao | BG-01 |
| BR-05 | Hệ thống lưu lead an toàn và **định tuyến về nơi nhận của Sale** | Cao | BG-01, BG-04 |
| BR-06 | Thu **đồng ý xử lý dữ liệu cá nhân (consent PDPL)** trước khi nhận lead | Cao | BG-01 |
| BR-07 | Khách chuyển đổi ngôn ngữ **EN ↔ VI** trên toàn trang | Cao | BG-03 |
| BR-08 | Chống spam/lạm dụng form (honeypot/rate-limit/captcha ở mức nghiệp vụ) | Cao | BG-01 |
| BR-09 | Mỗi trang có **CTA đích** dẫn tới form/tư vấn | Cao | BG-01 |
| BR-10 | Trang đạt ngưỡng hiệu năng & khả dụng (tốc độ, contrast, reduced-motion) | Trung bình | BG-06 |
| BR-11 | Khung nội dung sẵn sàng bật ngôn ngữ **MY** về sau mà không viết lại | Trung bình | BG-03 |
| BR-12 | Cho phép cập nhật nội dung 18 dịch vụ với chi phí thấp (đợt 1 qua repo; ngỏ đường lên CMS) | Trung bình | BG-02 |
| BR-13 | Content Admin **đăng nhập** vào trang quản trị an toàn (xác thực; chỉ người được cấp quyền) | Cao | BG-07 |
| BR-14 | Content Admin **quản lý khối "Sản phẩm/dịch vụ mới"** (thêm/sửa/xoá/sắp thứ tự/ẩn-hiện, đa ngữ EN/VI) | Cao | BG-07 |
| BR-15 | Content Admin **quản lý khối "Đối tác"** (logo/tên/link, thứ tự, ẩn-hiện) | Cao | BG-07 |
| BR-16 | Content Admin **quản lý khối "Con số nổi bật"** (nhãn/giá trị/đơn vị, đa ngữ, ẩn-hiện) | Cao | BG-07 |
| BR-17 | Nội dung động do Admin cấu hình được **lưu vào DB** và **hiển thị đúng** trên landing theo trạng thái hiển thị + ngôn ngữ | Cao | BG-07 |
| BR-18 | Content Admin **xem danh sách lead** đã thu (đọc; đợt 1 chưa cần sửa) | Trung bình | BG-01 |
| BR-19 | Trang Admin **an toàn** theo chuẩn (chống truy cập trái phép, ghi log thao tác quản trị) | Cao | BG-07 |

## 6. Phương án Kiến trúc thông tin (IA) — trình anh Bryan duyệt ở GATE-1

> Anh Bryan giao BA đề xuất IA. Dưới đây 3 phương án + **khuyến nghị**. Cả 3 đều giữ **1 Landing tổng theo style tham chiếu** và **form lead**; khác nhau ở cách tổ chức nội dung 18 dịch vụ.

### Phương án A — Landing phẳng (tất cả trên 1 trang)
Toàn bộ 18 dịch vụ nằm trên **một trang cuộn dài**, gom theo 3 nhóm bằng section; không có trang chi tiết riêng.

| Ưu điểm | Nhược điểm |
|---------|-----------|
| Ra nhanh nhất, ít trang nhất | Trang quá dài, 18 mục × 8 trường → loãng, khó đọc trên mobile |
| Hợp thuần branding, ít điều hướng | SEO yếu (không có URL riêng theo dịch vụ) |
| | Khó gắn CTA/lead theo từng dịch vụ → giảm chất lượng lead-gen |
| | Khó mở rộng khi thêm dịch vụ/nội dung |

### Phương án B — 18 landing rời (mỗi dịch vụ 1 trang thiết kế riêng)
Mỗi dịch vụ là **một landing độc lập**, thiết kế/nội dung riêng biệt.

| Ưu điểm | Nhược điểm |
|---------|-----------|
| SEO mạnh nhất theo từng dịch vụ | Khối lượng thiết kế/nội dung ×18, chi phí & thời gian cao nhất |
| Tùy biến sâu từng dịch vụ | Nhận diện dễ không đồng bộ giữa 18 trang |
| | Nội dung Excel chưa đủ để làm 18 trang "đặc sắc" riêng → nhiều trang rỗng |
| | Bảo trì & QA đa ngôn ngữ tốn kém (×18 ×2 ngôn ngữ) |

### Phương án C (KHUYẾN NGHỊ) — 1 Landing tổng + 3 nhóm + 18 trang chi tiết dùng chung template
Landing tổng giới thiệu năng lực → section 3 nhóm dạng card/grid → click card mở **trang chi tiết dịch vụ** dùng **chung 1 template** (map 8 trường Excel) + form lead (toàn cục và/hoặc theo dịch vụ).

| Ưu điểm | Nhược điểm |
|---------|-----------|
| **Cân bằng** tốc độ ra MVP và độ phủ 18 dịch vụ | Cần thiết kế 1 template chi tiết đủ tốt ngay từ đầu |
| Nhận diện đồng bộ (1 template → 18 trang nhất quán) | Ít tùy biến sâu cho dịch vụ "đặc thù" (chấp nhận được ở MVP) |
| Mỗi dịch vụ có **URL riêng** → SEO tốt + gắn CTA/lead theo dịch vụ | |
| Map thẳng 8 trường Excel → chi phí nội dung thấp, dễ nhân đôi EN/VI | |
| Dễ mở rộng: thêm dịch vụ = thêm bản ghi nội dung, không sửa layout | |

**Khuyến nghị của BA: chọn Phương án C.** Lý do: đạt đồng thời branding (landing tổng + nhận diện đồng bộ) và lead-gen (URL + CTA theo từng dịch vụ), trong khi chi phí nội dung thấp nhất nhờ map thẳng dữ liệu Excel sẵn có; trùng hướng nghiêng của đội trong đánh giá. Phương án A hy sinh lead-gen & SEO; Phương án B vượt ngân sách nội dung và rủi ro nhận diện không đồng bộ.

## 7. Ràng buộc & Giả định

**Ràng buộc:**
- **Pháp lý (PDPL):** Form lead thu dữ liệu cá nhân/doanh nghiệp → bắt buộc có **consent tường minh**, nêu mục đích thu thập, lưu trữ an toàn (HTTPS), có cơ sở pháp lý xử lý; nội dung consent cần **Legal/DPO duyệt**. Không dùng PII thật trong tài liệu/ví dụ.
- **Brand:** Tuân thủ nhận diện Mytel (tông cam + kem, logo, typography); chờ **brand guideline chính thức** từ anh Bryan để chốt token màu/font.
- **Tiến độ:** Ra **MVP EN+VI đợt 1** nhanh; MY hoãn. Launch VI phụ thuộc **bản dịch VI được duyệt**.
- **Phụ thuộc asset:** Trang không thể "chốt lead" nếu thiếu asset marketing & số liệu (ảnh, logo vector, SLA/uptime) — xem **§9 Danh mục asset**. Đây là điểm chặn thật (không phải code).
- **Phụ thuộc bản dịch:** Nội dung gốc tiếng Anh (Excel); cần bản dịch VI đạt chất lượng trước khi bật ngôn ngữ VI.
- **Kỹ thuật (định hướng, SA chốt lại ở HLD — ĐÃ ĐỔI ở v0.2):** vì có **Admin + DB**, không còn là trang tĩnh thuần. Cần **backend thật + cơ sở dữ liệu (DB)** lưu: nội dung động (khối marketing) + lead + tài khoản admin; **xác thực admin**; trang public có thể vẫn render nhanh (SSR/ISR hoặc tĩnh + đọc DB qua API). SA cập nhật techstack/HLD tương ứng; vẫn **không cần microservices** — một web app + DB là đủ.
- **Bảo mật:** Admin là **bề mặt tấn công** → bắt buộc xác thực mạnh, phân quyền, chống brute-force, ghi log thao tác; đưa vào phạm vi rà bảo mật B5.
- **Tính đúng của số liệu công bố:** Con số nổi bật (khách hàng/độ phủ/**doanh thu**) là số **thật của Mytel** — **không bịa**; doanh thu là dữ liệu nhạy cảm, chỉ đăng khi có phê duyệt (Q8).

**Giả định (chưa xác nhận — cần kiểm):**
- Nội dung 8 trường/dịch vụ trong Excel là **bản chính thức, được phép public** (chưa xác nhận với chủ nội dung).
- Anh Bryan cấp đủ asset & bản dịch VI **trước mốc launch** (nếu trễ → trượt tiến độ, dùng placeholder tạm).
- Sale có nhân sự **owner tiếp nhận lead** sẵn sàng khi go-live.
- Đa số dịch vụ theo mô hình "theo dự án" nên **ẩn giá**, thay bằng CTA tư vấn (chờ chốt Q3).
- Được phép dùng **ảnh stock/người mẫu** tạm cho MVP (chờ chốt Q2).

## 8. Danh mục asset cần anh Bryan cấp

> Đội lập danh mục; anh Bryan gom cấp. Cột "Bắt buộc cho MVP?" giúp phân biệt cái chặn launch với cái có thể dùng placeholder.

| # | Loại asset | Mô tả | Ai cấp | Bắt buộc cho MVP? |
|---|------------|-------|--------|-------------------|
| AS-01 | Logo Mytel (vector) | SVG/AI logo chính + biến thể (mono, trên nền tối/sáng) | anh Bryan / Brand | **Có** |
| AS-02 | Brand guideline | Mã màu chính xác (cam/kem), font brand, quy tắc dùng logo, khoảng cách | anh Bryan / Brand | **Có** |
| AS-03 | Ảnh chính thức / hình minh hoạ | Ảnh hạ tầng/data center/đội ngũ Mytel dùng cho hero & section | anh Bryan / Marketing | Không (dùng ảnh stock tạm — chờ Q2) |
| AS-04 | Số liệu SLA/uptime/coverage | Con số thật để tăng độ tin (vd uptime %, số điểm hiện diện) | anh Bryan / Kỹ thuật | Không (ẩn nếu chưa có; **không bịa số**) |
| AS-05 | Nội dung 18 dịch vụ (bản chốt EN) | Xác nhận 8 trường/dịch vụ trong Excel là bản public chính thức | Marketing / Chủ nội dung | **Có** |
| AS-06 | Bản dịch VI của 18 dịch vụ + UI | Bản dịch tiếng Việt được duyệt cho toàn nội dung | anh Bryan / Marketing | **Có (cho nhánh VI)** |
| AS-07 | Nội dung consent PDPL | Văn bản đồng ý xử lý dữ liệu cá nhân (EN+VI) đã duyệt pháp chế | Legal / DPO | **Có** |
| AS-08 | Thông tin liên hệ B2B | Hotline/email/địa chỉ chính thức hiển thị trên trang | anh Bryan / Sale | **Có** |
| AS-09 | Nơi nhận lead + owner | CRM/email/Sheet đích + người tiếp nhận (xem Q1) | anh Bryan / Sale | **Có** |
| AS-10 | Favicon / OG image | Icon & ảnh chia sẻ mạng xã hội (SEO/social) | Marketing | Không (mặc định tạm) |
| AS-11 | Case study / testimonial | Dẫn chứng khách hàng (nếu có, được phép public) | Marketing / Sale | Không (hoãn) |
| AS-12 | Logo đối tác | Bộ logo đối tác (được phép public) + tên/link cho khối "Đối tác" | Marketing | Không (khối ẩn nếu chưa có) |
| AS-13 | Con số nổi bật (đã duyệt) | Danh sách số liệu được phép công bố (khách hàng/độ phủ; **doanh thu chỉ khi duyệt**) | anh Bryan / Marketing / Tài chính | Không (khối ẩn nếu chưa có) |
| AS-14 | Danh sách tài khoản Admin | Ai được cấp quyền Content Admin (email/vai trò) | anh Bryan / Marketing | **Có** (để tạo tài khoản admin) |

## 9. Tiêu chí thành công / Nghiệm thu

- **SC-01 (BG-01):** Form lead hoạt động end-to-end: khách submit → lead được lưu + định tuyến tới nơi nhận, đạt **≥ 30 lead hợp lệ/tháng** sau 3 tháng (target chờ anh Bryan xác nhận).
- **SC-02 (BG-02):** Landing tổng + 3 nhóm + trang chi tiết cho **tập dịch vụ đợt 1** (18 hoặc mũi nhọn — theo Q4) đều truy cập được, mỗi dịch vụ có URL riêng.
- **SC-03 (BG-03):** Toàn bộ trang MVP có **EN + VI** đầy đủ, chuyển ngôn ngữ không vỡ layout; khung MY sẵn sàng nhưng ẩn.
- **SC-04 (BG-04):** Lead tới tay Sale **≤ 1 giờ** (tự động) kể từ khi submit.
- **SC-05 (BG-05):** 100% trang MVP đạt **brand checklist** (màu/logo/typography theo AS-02).
- **SC-06 (BG-06):** Lighthouse Performance mobile **≥ 80**; contrast văn bản chính **≥ 4.5:1** (WCAG AA); tôn trọng `prefers-reduced-motion`.
- **SC-07 (PDPL):** Không nhận lead khi chưa có consent; nội dung consent đã được Legal/DPO duyệt; dữ liệu truyền qua HTTPS.
- **SC-08 (ổn định):** Không sự cố chặn form (Sev-1) trong **30 ngày** đầu sau launch.
- **SC-09 (BG-07):** Content Admin đăng nhập và **tự cấu hình 3 loại khối** (Sản phẩm/dịch vụ mới · Đối tác · Con số nổi bật) đa ngữ EN/VI; thay đổi **hiển thị đúng trên landing ≤ 10 phút** không cần dev deploy; khối "ẩn" không lộ trên public.
- **SC-10 (bảo mật Admin):** Không truy cập được Admin khi chưa xác thực; có chống brute-force + log thao tác; không lộ danh sách lead ra public.

## 10. Rủi ro & Câu hỏi mở

### 10.1 Câu hỏi mở cần anh Bryan quyết ở GATE-1 (gộp 4 điểm treo trong `decisions.md`)

| ID | Câu hỏi / Rủi ro | Ảnh hưởng | Ai quyết | Hạn chót |
|----|-------------------|-----------|----------|----------|
| Q1 | **Nơi lead đổ về** (CRM nào / email / Google Sheet) và **owner tiếp nhận** là ai? | Chặn thiết kế backend lead & BG-01/BG-04; không có nơi nhận thì lead-gen vô nghĩa | anh Bryan + Sale | GATE-1 |
| Q2 | Được dùng **ảnh stock/người mẫu** như trang tham chiếu, hay **bắt buộc ảnh thật Mytel**? | Ảnh hưởng tiến độ & chi phí asset (AS-03); nếu bắt buộc ảnh thật mà chưa có → trượt launch | anh Bryan | GATE-1 |
| Q3 | **Hiển thị giá** hay ẩn (đa số "theo dự án"), thay bằng CTA tư vấn? | Ảnh hưởng template trang chi tiết & Price Policy | anh Bryan | GATE-1 |
| Q4 | **Phạm vi đợt 1: đủ 18 dịch vụ** hay ưu tiên vài **dịch vụ mũi nhọn** trước? | Ảnh hưởng BG-02, khối lượng nội dung & dịch VI (AS-05/06) | anh Bryan | GATE-1 |
| Q5 | Xác nhận **Phương án IA = C** (khuyến nghị) hay chọn A/B? | Quyết cấu trúc toàn dự án (SRS/design/dev bám theo) | anh Bryan | GATE-1 |
| Q6 | Xác nhận **target BG-01** (≥30 lead/tháng) và cung cấp **baseline** hiện trạng? | Quyết ngưỡng nghiệm thu SC-01 | anh Bryan | GATE-1 |
| Q7 | **Phạm vi Admin đợt 1:** chỉ quản **khối marketing động** (mặc định), hay quản luôn **nội dung 18 dịch vụ**? | Quyết khối lượng Admin + data model + effort | anh Bryan | GATE-1 |
| Q8 | **Doanh thu** có được công bố công khai không? Nếu có, **ai duyệt** con số trước khi đăng? | Dữ liệu nhạy cảm; ảnh hưởng khối "Con số nổi bật" | anh Bryan + Tài chính | GATE-1 |
| Q9 | Admin cần **mấy vai trò** (chỉ 1 vai Content Admin, hay tách Super-admin/Editor)? bao nhiêu người? | Quyết mô hình phân quyền Admin | anh Bryan | GATE-1 |
| Q10 | Nội dung động có cần **luồng duyệt trước khi đăng** (draft→duyệt→publish), hay Admin đăng thẳng? | Quyết độ phức tạp CMS-lite (đợt 1 đề xuất **đăng thẳng**) | anh Bryan | GATE-1 |

### 10.2 Rủi ro (sổ rủi ro — kế thừa từ đánh giá đội)

| # | Rủi ro | Mức | Giảm thiểu |
|---|--------|-----|-----------|
| R1 | Thiếu asset & nội dung (ảnh, giá, số liệu, case study) → trang không chốt được lead | **Cao** | Chốt §8 danh mục asset sớm; dùng placeholder + CTA tư vấn cho phần "theo dự án"; **không bịa số Mytel** |
| R2 | Form lead chạm dữ liệu doanh nghiệp → PDPL/consent + nơi nhận lead chưa rõ | **Cao** | Quyết Q1; thiết kế consent (AS-07) duyệt Legal; định tuyến lead về Sale/CRM |
| R3 | Đa ngôn ngữ VI/MY: chất lượng dịch + font Myanmar vỡ chữ | Trung bình | Ra EN+VI trước (MY hoãn); dịch VI duyệt trước launch; test font Unicode khi bật MY |
| R4 | Animation-heavy gây jank/tốn pin mobile; contrast cam/kem fail WCAG | Trung bình | Animation nhẹ + `prefers-reduced-motion`; kiểm contrast 4.5:1 (BG-06) |
| R5 | Nội dung Excel chưa được xác nhận là bản public chính thức | Trung bình | Xác nhận AS-05 với chủ nội dung trước khi đặc tả SRS |
| R6 | **Admin + DB làm tăng phạm vi & effort** (M→L), kéo dài MVP, thêm bảo mật/vận hành | **Cao** | Giữ CMS-lite tối giản (đăng thẳng, 3 loại khối); i18n & auth chuẩn; SA đánh giá lại effort ở B2 |
| R7 | **Admin là bề mặt tấn công** (chiếm quyền → sửa nội dung public/lộ lead) | **Cao** | Xác thực mạnh + phân quyền + chống brute-force + log; đưa vào rà bảo mật B5 |
| R8 | **Công bố doanh thu/số liệu sai hoặc chưa được phép** → rủi ro pháp lý/thương hiệu | **Cao** | Q8: chỉ đăng số đã duyệt; không bịa; doanh thu cần phê duyệt Tài chính |

---

## Phụ lục — Truy vết BR → BG

| BR | BG phục vụ |
|----|-----------|
| BR-01 | BG-05 |
| BR-02, BR-03 | BG-02 |
| BR-04, BR-06, BR-08, BR-09 | BG-01 |
| BR-05 | BG-01, BG-04 |
| BR-07, BR-11 | BG-03 |
| BR-10 | BG-06 |
| BR-12 | BG-02 |
| BR-13, BR-14, BR-15, BR-16, BR-17, BR-19 | BG-07 |
| BR-18 | BG-01 |

> **Ghi chú pipeline:** BRD này dừng ở mức nghiệp vụ. Chi tiết FR, validate trường form, luồng màn hình, chọn tech stack sẽ được đặc tả ở **SRS (B2)** và **HLD (SA)** sau khi **GATE-1 được duyệt**. BA không tự sang B2.
