# Đánh giá nghiệp vụ (BA) — Landing page dịch vụ B2B Mytel

> Giai đoạn ĐÁNH GIÁ (pre-BRD). Đánh giá ngắn theo lăng kính nghiệp vụ, KHÔNG phải BRD/SRS. Mọi điểm chưa chốt đều nêu **giả định [GĐ]** để anh Bryan xác nhận.

## 1. Mục tiêu kinh doanh trang nên phục vụ
Trang tham chiếu là landing sự kiện/forum thiên **lead-gen + branding**, không phải app nghiệp vụ. Suy luận mục tiêu theo thứ tự ưu tiên:
1. **Lead-gen (chính) [GĐ]** — thu thông tin doanh nghiệp quan tâm để sale (`Target Sale`) theo đuổi. Đây là lý do tồn tại của một landing B2B có CTA "Register".
2. **Catalogue năng lực (phụ)** — trình bày 18 dịch vụ theo 3 nhóm để khách tự tra cứu, làm "bộ mặt số" khi sale gửi link/quét QR tại booth.
3. **Branding** — củng cố định vị Mytel là nhà cung cấp hạ tầng + ICT + an ninh mạng trọn gói.
- **Tiêu chí thành công sơ bộ [GĐ]:** số lead hợp lệ/tháng; tỷ lệ điền form; số dịch vụ được xem chi tiết. → cần chốt với anh Bryan (mục 8).

## 2. Actor & đối tượng
- **Người xem trang (khách):** đại diện doanh nghiệp/tổ chức — IT/CTO, mua sắm, chủ SME (nhà hàng cho Misa CukCuk), ISP/carrier có ASN (IP Transit/Dark Fiber), khối tài chính/chính phủ (eKYC, SOC, AI Camera/Smart City). Ngành đích rất **rộng và không đồng nhất** theo `Target Customer` từng dịch vụ.
- **Lead = tổ chức**, không phải cá nhân → dữ liệu thu là **thông tin doanh nghiệp + người liên hệ** (tên cty, ngành, nhu cầu, email/SĐT công việc).
- **Actor nội bộ:** đội Sale/B2B (`Target Sale`) nhận & xử lý lead; Marketing quản nội dung/đa ngữ; (tuỳ chọn) Admin duyệt nội dung.
- **Đối tượng nghiệp vụ có trạng thái:** chủ yếu là **Lead/Đăng ký tư vấn** (mới → đã tiếp nhận → đang xử lý → đóng). "Dịch vụ" là dữ liệu tĩnh (catalogue), gần như không có vòng đời trạng thái ở phạm vi landing.

## 3. Kiến trúc thông tin đề xuất
**Đề xuất: 1 landing tổng + điều hướng theo 3 NHÓM + trang/khối chi tiết cho mỗi dịch vụ (18).**
- **Landing tổng:** Hero (headline + 2 CTA: "Đăng ký tư vấn" / "Khám phá dịch vụ") → Why Mytel → Coverage → 3 nhóm năng lực (Connectivity · Mobile ICT · ICT Service) → Register/Contact.
- **Theo nhóm (3):** khớp đúng cách phân nhóm sẵn có và style tham chiếu ("Capabilities"), giúp khách định vị nhanh giữa 18 dịch vụ rất khác nhau.
- **Chi tiết dịch vụ:** mỗi dịch vụ đủ dữ liệu (What is / Advantage / Target / Timeline) để làm **section mở rộng hoặc trang con**. **Lập luận:** 18 trang riêng ngay từ MVP là quá nặng nội dung/đa ngữ và loãng lead-gen; nên MVP dùng **1 landing + 3 nhóm + card/accordion 18 dịch vụ**, tách trang con chỉ cho vài dịch vụ "mũi nhọn" khi có đủ hình ảnh/nội dung marketing. Tránh cả thái cực "1 trang phẳng 18 mục" (khó đọc, SEO yếu) lẫn "18 landing rời" (chi phí cao, khó bảo trì đa ngữ).

## 4. Độ sẵn sàng nội dung (Excel đủ dựng landing chưa?)
Excel đủ **khung chữ** cho mỗi dịch vụ (Tên/Nhóm/What is/Advantage/Target/Timeline/Price Policy) — đủ để dựng phần **catalogue văn bản**. **Chưa đủ để ra một landing marketing hoàn chỉnh.** Thiếu:
- **Hình ảnh/asset thương hiệu:** logo dịch vụ, ảnh hero, icon nhóm, ảnh minh hoạ hạ tầng/DC, bản đồ Coverage — Excel không có.
- **Giá công khai:** `Price Policy` phần lớn là "theo dự án/liên hệ" → **không có bảng giá công bố được** (và B2B thường không niêm yết). Cần chốt: hiện gì trên trang (ẩn giá, "liên hệ báo giá").
- **Bằng chứng tin cậy:** case study, logo khách hàng, con số (uptime/SLA), chứng chỉ (ISO/an ninh) — chưa có; rất quan trọng cho B2B.
- **CTA đích thực:** đích của "Register"/"Contact" chưa xác định (form nội bộ? email sale? CRM? QR booth?).
- **Bản dịch VI/MY:** nội dung Excel là **tiếng Anh**. Nếu đa ngữ EN/VI/MY là bắt buộc → cần dịch 18×3 khối + kiểm nghĩa thuật ngữ kỹ thuật tiếng Myanmar (rủi ro chất lượng/tiến độ).
- **Chuẩn hoá copy marketing:** mô tả kỹ thuật cần biên tập lại giọng bán hàng.

## 5. Có cần form đăng ký/lead không?
**Có [GĐ]** — là năng lực cốt lõi của landing lead-gen; nếu bỏ, trang chỉ còn brochure. Kéo theo:
- **Backend/DB:** cần API nhận submit + lưu lead (không thể chỉ tĩnh) → phát sinh hạ tầng, bảo mật, chống spam (captcha/rate-limit).
- **PDPL/consent:** thu **thông tin doanh nghiệp + người liên hệ** = dữ liệu cá nhân → cần **ô đồng ý (consent) tường minh**, mục đích sử dụng, thời hạn lưu, quyền rút; không log PII vào nơi không bảo vệ; **không dùng PII thật khi demo/test**.
- **Kết nối xử lý lead:** cần định tuyến lead tới đội Sale (email/CRM) + trạng thái tiếp nhận — nếu không, lead "rơi".
- **Phương án MVP nhẹ [GĐ]:** nếu chưa sẵn backend, có thể tạm dùng form → email/Google Sheet nội bộ + consent, coi là nợ kỹ thuật, thay bằng API/CRM sau.

## 6. Đề xuất MVP (MoSCoW ngắn)
- **Must:** 1 landing tổng theo style tham chiếu (Hero + 2 CTA, animation); 3 nhóm; 18 dịch vụ dạng card/accordion (What is + Advantage + Target); **form Đăng ký tư vấn + consent PDPL**; định tuyến lead về Sale; 1 ngôn ngữ **EN trước [GĐ]**; responsive; đo lường (đếm lead/lượt xem).
- **Should:** VI (và MY nếu bắt buộc); mục Why Mytel/Coverage; SEO/OG cơ bản; trang/section chi tiết cho vài dịch vụ mũi nhọn; QR về trang cho booth.
- **Could:** 18 trang con đầy đủ; case study/logo khách; tích hợp CRM; chatbot/VBot demo; bộ lọc/tìm dịch vụ.
- **Won't (đợt này):** báo giá online/thanh toán; cổng đăng nhập khách; cấu hình dịch vụ tự phục vụ.
- **Cắt/hoãn:** MY nếu chưa có bản dịch đạt; 18 trang riêng; giá công khai; case study nếu chưa thu thập kịp.

## 7. Rủi ro nghiệp vụ chính
1. **Nội dung chưa đủ chín** (thiếu ảnh/case study/CTA đích) → landing đẹp nhưng không thuyết phục/không chốt lead.
2. **PDPL/consent** khi thu dữ liệu doanh nghiệp → rủi ro tuân thủ nếu làm ẩu.
3. **Lead không có nơi đổ về** (chưa chốt CRM/owner) → lãng phí lead.
4. **Đa ngữ MY** → rủi ro chất lượng dịch & tiến độ.
5. **Phạm vi phình** (18 trang con) → chậm ra MVP.

## 8. Câu hỏi làm rõ cho anh Bryan (trước khi viết BRD)
1. **Mục tiêu ưu tiên #1** của trang là gì: thu lead, hay chỉ giới thiệu năng lực (catalogue/branding)? KPI kỳ vọng?
2. **Đa ngôn ngữ:** EN/VI/MY bắt buộc cả 3 ngay MVP, hay ra EN trước rồi bổ sung? Ai chịu trách nhiệm bản dịch (nhất là MY)?
3. **CTA đích & xử lý lead:** form đổ về đâu (CRM/email/Sheet)? Ai là owner tiếp nhận lead và SLA phản hồi?
4. **Giá:** hiển thị gì với `Price Policy` "theo dự án" — ẩn hoàn toàn và để "liên hệ báo giá", hay hiện khung?
5. **Asset & bằng chứng:** có sẵn ảnh thương hiệu, logo khách, case study, số liệu SLA/chứng chỉ để dùng không? Nếu chưa, ai cung cấp và khi nào?
