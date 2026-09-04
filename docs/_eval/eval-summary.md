# BẢN ĐÁNH GIÁ ĐỘI — Landing page dịch vụ B2B Mytel
**Ngày:** 2026-09-02 · **PO tổng hợp** từ BA · SA · Designer (chi tiết: `eval-ba.md`, `eval-sa.md`, `eval-designer.md`)

## 1. Kết luận chung (3 role hội tụ)
- **Đáng làm & khả thi.** Đây là **landing marketing/lead-gen kiểu sự kiện** (giống trang tham chiếu), **không phải app nghiệp vụ**. Rủi ro kỹ thuật thấp; rủi ro thật nằm ở **nội dung & đa ngôn ngữ**, không ở code.
- **Bám style tham chiếu: khả thi ~90%** — tông cam Mytel + kem, typography đậm, section dọc, scroll-reveal đều bóc tách được thành design token + component.

## 2. Hướng thống nhất
| Hạng mục | Đề xuất chung của đội |
|---|---|
| **Kiến trúc thông tin** | 1 **Landing tổng** → gom **3 nhóm** (Connectivity 7 · Mobile ICT 3 · ICT Service 8) dạng card/grid → **18 trang chi tiết dùng CHUNG 1 template** (map thẳng 8 trường sẵn trong Excel) + section/form đăng ký. **Không** nhồi 18 mục vào 1 trang phẳng, cũng **không** làm 18 landing rời. |
| **Kỹ thuật** | **SSG** — Next.js `output: export` (hoặc Astro) + nội dung 18 DV dạng MDX/JSON trong repo + **form lead qua serverless mỏng**. Rẻ, nhanh ra MVP, SEO + animation tốt. Nâng cấp Headless CMS sau bằng cách đổi nguồn dữ liệu, không viết lại. |
| **Đa ngôn ngữ** | Chuẩn bị i18n `/en /vi /my` từ đầu; **ra EN trước**, bật VI/MY khi có bản dịch đạt. Lưu ý **font Myanmar (Unicode vs Zawgyi)** dễ vỡ chữ. |
| **Form lead** | Bảng lead tối thiểu + **consent PDPL** + honeypot/rate-limit/captcha; validate server-side; HTTPS. |
| **MVP** | 1 landing theo style + 3 nhóm + 18 card + 18 trang chi tiết template + form lead (EN). **Hoãn:** giá công khai, case study, tiếng MY (nếu chưa dịch), parallax nâng cao. |

## 3. Phản biện sản phẩm (PO)
- **Giá trị:** landing chỉ có giá trị nếu **chốt được lead** hoặc **phục vụ bán hàng của Sale**. Nếu chỉ "trưng năng lực" mà không có CTA đích + nơi nhận lead → đẹp nhưng không tạo ra kết quả kinh doanh. → **Phải chốt mục tiêu #1 trước.**
- **Đừng over-engineer:** không cần CMS/microservices/DB nghiệp vụ. Bắt đầu SSG + form mỏng là đủ; chỉ nâng cấp khi marketing thực sự cần tự sửa nội dung thường xuyên.
- **Chốt phạm vi ngôn ngữ sớm:** EN/VI/M0 nhân 3 khối lượng nội dung + QA. Ra EN trước là lựa chọn ít rủi ro tiến độ nhất.
- **Điểm chặn thật (không phải code):** asset marketing (logo vector, ảnh chính thức, số liệu SLA/uptime, brand guideline) + bản dịch VI/MY + **nơi lead đổ về (CRM/email) & owner tiếp nhận**.

## 4. Rủi ro chính (đưa vào sổ rủi ro)
| # | Rủi ro | Mức | Phương án |
|---|---|---|---|
| R1 | Thiếu asset marketing & nội dung (ảnh, giá, case study, số liệu) → trang không chốt lead | **Cao** | Chốt danh mục asset cần; dùng placeholder + CTA tư vấn cho phần "theo dự án" |
| R2 | Form lead chạm dữ liệu doanh nghiệp → PDPL/consent + nơi nhận lead chưa rõ | **Cao** | Chốt mục tiêu lead-gen; thiết kế consent; định tuyến lead về Sale/CRM |
| R3 | Đa ngôn ngữ VI/MY: chất lượng dịch + font Myanmar vỡ chữ | Trung bình | Ra EN trước; VI/MY khi có bản dịch duyệt; test font Unicode |
| R4 | Animation-heavy gây jank/tốn pin mobile, contrast cam/kem fail WCAG | Trung bình | Animation nhẹ + `prefers-reduced-motion`; kiểm contrast 4.5:1 |

## 5. Cần anh Bryan quyết (HITL — trước khi BA viết BRD)
1. **Mục tiêu #1:** thu lead (có form + nơi nhận) hay chỉ giới thiệu năng lực (catalogue/branding)?
2. **Ngôn ngữ MVP:** EN trước, hay EN+VI, hay đủ EN/VI/MY ngay?
3. **Kiến trúc thông tin:** xác nhận hướng "1 landing + 3 nhóm + 18 trang chi tiết template"?
4. **Asset/brand:** ai cấp logo vector, ảnh chính thức, brand guideline, bản dịch? có được dùng ảnh stock/người mẫu như tham chiếu không?
