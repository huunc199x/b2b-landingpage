# BRIEF ĐÁNH GIÁ — Landing page dịch vụ B2B Mytel

> Tài liệu nền cho giai đoạn ĐÁNH GIÁ (pre-BRD). Các role đọc file này thay vì scrape lại nguồn.

## 1. Yêu cầu của anh Bryan
Làm **landing page cho các dịch vụ B2B** của Mytel, theo **phong cách** trang tham chiếu:
https://event-landingpage-ashen.vercel.app/ — và giao **team đánh giá** trước.

## 2. Style trang tham chiếu (quan sát trực tiếp)
- Single-page, **animation-heavy** (nội dung fade/scroll-reveal khi cuộn).
- Nhận diện **Mytel**: tông **cam (#F5821F-ish) + kem/trắng ấm**, typography **đậm, cỡ lớn**.
- Cấu trúc: **Hero** (headline lớn + 2 CTA: "Register at the booth" / "Explore capabilities") →
  các section: **Why Mytel · Coverage · Capabilities · Register**.
- Đa ngôn ngữ: **EN / VI / MY** (Anh / Việt / Myanmar).
- Section "Capabilities" liệt kê nhóm năng lực số: 5G & connectivity, Transmission & leased lines,
  Data centre & cloud, Cybersecurity, AI & digital platforms → **trùng khớp nhóm dịch vụ B2B**.
- Đây là landing page **sự kiện/forum**, thiên marketing + đăng ký (lead-gen), không phải app nghiệp vụ.

## 3. Dữ liệu đầu vào — 18 dịch vụ B2B (file "B2B Eco System_1_1.1.xlsx")
Mỗi dịch vụ có sẵn: **Tên · Nhóm · Mô tả (What is) · Advantage (lợi ích) · Target Customer ·
Target Sale · Delivery Timeline · Price Policy**. Nội dung tiếng Anh.

### Nhóm A — Connectivity (7)
1. **DIA** – Dedicated Internet Access (băng thông riêng, SLA 24/7). ~3 tuần.
2. **DPLC** – Domestic Private Leased Line (kênh riêng nội địa Myanmar). ~3 tuần.
3. **IPLC** – International Private Leased Line (kênh riêng quốc tế). ~3 tuần.
4. **IPVPN** – IP VPN qua MPLS backbone (nối nhiều site). ~3 tuần.
5. **IP Transit** – Internet transit dung lượng lớn cho ISP/carrier có ASN. ~3 tuần.
6. **Dark Fiber** – Sợi quang riêng, khách tự vận hành. ~3 tuần.
7. **Cross Connection** – Kết nối vật lý trong data center Mytel. ~2 ngày.

### Nhóm B — Mobile ICT (3)
8. **M2M** – Quản lý tập trung balance/data nhiều SIM qua master SIM + portal. ~2 ngày.
9. **Bulk SMS** – Gửi SMS số lượng lớn qua platform/API. ~2 tuần.
10. **VBot** – Cloud call center (đa thiết bị, Web + Mobile App iOS/Android). ~1 tuần.

### Nhóm C — ICT Service (8)
11. **Cloud** – Điện toán đám mây (thuê tài nguyên ảo hoá). ~1 tuần.
12. **Colocation / Data Center** – Thuê chỗ đặt thiết bị. ~1 tuần.
13. **eKYC** – Định danh điện tử từ xa (AI + biometric). Theo dự án.
14. **Restaurant Management System (Misa CukCuk)** – Phần mềm quản lý nhà hàng. Theo dự án.
15. **Security EndPoint** – Bảo vệ thiết bị đầu cuối. ~2 tuần.
16. **Penetration Testing** – Kiểm thử xâm nhập. Theo dự án.
17. **SOC** – Trung tâm giám sát an ninh 24/7 (managed). Theo dự án.
18. **AI Camera & Smart City** – Camera AI + giải pháp thành phố thông minh. Theo dự án.

## 4. Câu hỏi trọng tâm cho đánh giá (mỗi role trả lời theo lăng kính của mình)
- Yêu cầu này **đáng làm & khả thi** không? Rủi ro lớn nhất?
- **Kiến trúc thông tin**: 1 landing tổng + 18 trang con? hay 1 trang/dịch vụ? hay theo 3 nhóm?
- Có cần **form đăng ký/lead** (thu thông tin doanh nghiệp) không? → kéo theo backend/DB/PDPL.
- **Đa ngôn ngữ** EN/VI/MY có bắt buộc không?
- Nội dung hiện có (Excel) **đủ để dựng landing** chưa? Thiếu gì (hình ảnh, giá, testimonial)?
- **MVP** nên là gì để ra nhanh, phần nào cắt/hoãn?
