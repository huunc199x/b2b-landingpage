# ĐÁNH GIÁ — Vai trò DESIGNER (UX/UI)

> Giai đoạn ĐÁNH GIÁ (pre-design), không phải design system đầy đủ. Đánh giá khả năng bám style trang tham chiếu + đề xuất hướng thiết kế cho landing B2B Mytel.
> Nguồn: `brief.md` + quan sát trang https://event-landingpage-ashen.vercel.app/. Không hỏi lại — nêu giả định.

## 1. Đánh giá style trang tham chiếu — mức khả thi tái hiện
Hệ thiết kế bóc tách được (đủ để tái hiện, **khả thi cao ~90%**):

| Thành phần | Quan sát | Khả năng tái hiện |
|---|---|---|
| **Palette** | Cam Mytel (~#F5821F) làm accent + nền kem/trắng ấm (~#FFF7EF), chữ nâu đậm/đen mềm | Cao — chỉ vài token màu, dễ khớp brand |
| **Typography** | Sans-serif đậm, hero cỡ rất lớn (clamp ~48–96px), scale tương phản mạnh giữa heading/body | Cao — dùng biến clamp() responsive; cần chốt 1 font family (giả định Inter/Poppins hoặc font brand Mytel) |
| **Spacing/Layout** | Section full-width, padding dọc lớn (~96–128px), container ~1200px, canh trái nhiều, whitespace rộng | Cao — thang spacing 4/8px chuẩn |
| **Animation** | Scroll-reveal (fade + translate-up) theo section, có thể parallax nhẹ; kiểu marketing | Trung bình-cao — dùng IntersectionObserver hoặc lib (Framer Motion / AOS / GSAP). Cần kiểm soát hiệu năng |
| **Layout section** | Hero (headline + 2 CTA) → Why → Coverage → Capabilities → Register | Cao — mô hình section xếp dọc kinh điển |

**Kết luận:** Style thuần marketing (không phải app nghiệp vụ), tái hiện được bằng token + component tĩnh; điểm khó duy nhất là làm animation "mượt như tham chiếu" mà vẫn nhẹ trên mobile.

## 2. Hướng thiết kế đề xuất cho landing B2B
**Kiến trúc thông tin đề xuất (giả định chọn):** 1 **Landing tổng** + trang **danh mục theo 3 nhóm** + **18 trang chi tiết dịch vụ** dùng chung 1 template (tránh vẽ 18 layout riêng). Không nhồi 18 dịch vụ vào 1 trang.

**A. Landing tổng (SCR-01):**
1. **Hero** — headline lớn + subline + 2 CTA (`Liên hệ tư vấn` / `Khám phá dịch vụ`).
2. **Why Mytel** — 3–4 điểm mạnh (hạ tầng, SLA, phủ sóng, hỗ trợ 24/7) dạng icon-row.
3. **Coverage** — bản đồ/số liệu phủ sóng Myanmar (stat counters).
4. **Capabilities / Dịch vụ** — **3 nhóm** (Connectivity · Mobile ICT · ICT Service) dạng **card/grid**, mỗi card gom N dịch vụ, click → trang chi tiết.
5. **CTA / Form đăng ký lead** — form ngắn (Tên DN, người liên hệ, SĐT/email, nhu cầu).
6. Footer đa ngôn ngữ.

**B. Trang chi tiết dịch vụ (SCR-02, template dùng chung 18 lần):**
Hero nhỏ (tên + tagline) → *What is* → *Advantages* (bullet/icon) → *Target Customer* → *Delivery Timeline* (badge) → *Price Policy* (nếu công khai) → CTA/form. Map thẳng 8 trường có sẵn trong Excel.

**C. Card dịch vụ (component lặp):** icon + tên + mô tả 1 dòng + badge nhóm + timeline. States: default/hover/focus.

## 3. Design tokens sơ bộ (gợi ý)
- **Màu:** `--brand-primary: #F5821F` (cam Mytel); `--brand-primary-dark: #D96D0C` (hover); `--surface: #FFF7EF` (kem); `--surface-alt: #FFFFFF`; `--text-strong: #1A1A1A`; `--text-muted: #6B5E54`; màu nhóm phụ để phân biệt 3 nhóm dịch vụ.
- **Font:** heading & body cùng 1 sans đậm (giả định Poppins/Inter, chờ font brand Mytel). Scale: `--fs-hero: clamp(2.5rem, 6vw, 6rem)` / `h2 ~2rem` / `body 1rem`.
- **Radius:** `--radius-card: 16px`, `--radius-btn: 9999px` (pill CTA giống tham chiếu).
- **Spacing:** thang 4/8, section padding `--space-section: clamp(64px, 10vw, 128px)`.

## 4. Rủi ro UX
- **Animation-heavy → hiệu năng/mobile:** scroll-reveal + parallax dễ giật (jank) trên máy yếu, tốn pin. → Giới hạn animation nhẹ (opacity/transform, không animate layout), `will-change` có chọn lọc, lazy-load ảnh, tôn trọng `prefers-reduced-motion` (tắt animation cho người cần).
- **Accessibility (WCAG 2.1 AA):** cam trên kem dễ **fail contrast 4.5:1** cho chữ nhỏ → chữ trên nền cam phải trắng/đậm và kiểm bằng tool; nội dung không được chỉ hiện khi scroll (phải đọc được nếu tắt JS/reduced-motion); touch target ≥44px; nút không truyền nghĩa chỉ bằng màu.
- **18 dịch vụ → quá tải thông tin:** không list phẳng 18 mục. → Gom **3 nhóm** ở landing, chi tiết đẩy sang trang con; card chỉ 1 dòng mô tả; thêm filter/tab theo nhóm; timeline & giá dạng badge để quét nhanh.
- **Đa ngôn ngữ EN/VI/MY:** chữ Myanmar dài & cần font hỗ trợ (Noto Sans Myanmar); layout phải co giãn theo độ dài chuỗi, không hard-code chiều rộng nút.

## 5. Cần gì từ anh Bryan / brand
- **Logo vector** (SVG/AI) Mytel B2B + guideline dùng logo.
- **Brand guideline chính thức:** mã màu chuẩn, **font brand** (thay giả định), tone-of-voice.
- **Ảnh chính thức:** hero, hạ tầng/data center, icon dịch vụ — chất lượng cao, có bản quyền.
- **Chốt:** có được dùng **ảnh người mẫu/stock như tham chiếu** không, hay bắt buộc ảnh thật của Mytel? (ảnh người ảnh hưởng tông marketing).
- Nội dung: bản dịch **VI/MY** đã duyệt; xác nhận **có công khai giá** hay không (nhiều mục "theo dự án").

## 6. MVP thiết kế (màn tối thiểu)
**4 màn** đủ ra bản chạy:
1. **Landing tổng** (hero + why + coverage + 3 nhóm dịch vụ + form).
2. **Trang chi tiết dịch vụ** (1 template dùng chung cho 18 dịch vụ).
3. **Form đăng ký lead** (có thể là section trong landing + trạng thái success/error).
4. **Trạng thái phụ:** empty/loading/lỗi form + màn "cảm ơn".
→ Hoãn: bản MY (làm sau EN/VI), animation nâng cao (parallax), trang danh mục nhóm riêng nếu gộp được vào landing.

---
### Giả định đã nêu
Font brand chưa có → dùng Poppins/Inter tạm; chọn IA "1 landing + 18 trang chi tiết template chung"; có form lead (kéo theo backend/PDPL — cần role khác xác nhận); giá phần lớn "theo dự án" nên ẩn/thay bằng CTA tư vấn.
