# NGUỒN THIẾT KẾ — "B2B Landing v2" (kéo từ Claude Design của anh Bryan)
**Nguồn:** Claude Design project "B2B Landing page Mytel" (id 722b8bcc…), file `B2B Landing v2.dc.html`, kéo qua DesignSync 2026-09-04.
**Đây là bản thiết kế CHÍNH THỨC anh Bryan cấp** → designer bám 1:1 để dựng `design.md`. Chỉ bao phủ **public landing**; màn **Admin (SCR-06..09)** designer mở rộng theo cùng hệ token.

## Asset có sẵn trong project (kéo được qua DesignSync khi vào B4)
- `assets/mytel-mark-white.png` — logo mark Mytel (trắng, đặt trong ô bo góc nền cam) — **AS-01**.
- `assets/hero-city.png`, `assets/hero-yangon.png`, `assets/hero-yangon-crop.png` — ảnh hero thành phố/Yangon — **AS-03**.
- `uploads/BRD.md`, `uploads/SRS.md`, `uploads/function-map.html` — bản anh Bryan đã đưa lên (đối chiếu, không phải nguồn mới).

## Design tokens (bóc từ file)
**Màu:**
| Token | Hex | Dùng |
|---|---|---|
| brand-primary | `#F26B21` | CTA, nhấn, label, icon, link |
| brand-primary-hover | `#C9541F` | hover link/nút |
| brand-gradient | `#F26B21 → #F58A3C → #FFA765` | dải CTA lớn |
| tint-100 | `#FFF1E8` | nền icon ngành |
| tint-200 | `#FFD9C2` | ::selection |
| tint-border | `#F9C3A0` | viền hover card / viền icon |
| hero-dark | `#26140A` / overlay `#180A02` | nền hero |
| ink-900 | `#1D1D1F` | tiêu đề/thân đậm |
| ink-700 | `#3A3A3C` | nav, label |
| ink-500 | `#6E6E73` | mô tả |
| ink-400 | `#8E8E93` | footer text/phụ |
| ink-300 | `#AEAEB2` | ghi chú mono/placeholder |
| surface-0 | `#FFFFFF` | nền chính |
| surface-50 | `#FAFAFB` | section Industries |
| surface-100 | `#F7F7F8` | card, form |
| surface-chip | `#F5F5F7` | chip toggle ngôn ngữ |
| border | `#EDEDEF` / `#EFEFEF` / `#E1E1E4` | viền card/input |
| footer-dark | `#1A1A1C` (border `#2C2C2E`) | footer |

**Typography:** font hệ thống (`-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif`); icon **Material Symbols Outlined**.
- Hero H1: `clamp(38px,4.9vw,68px)`, weight 700, uppercase, letter-spacing -0.035em, line 1.04.
- Section H2: 44px / 600 / -0.03em.
- Eyebrow label: 13px / 600 / letter-spacing 0.1em / màu cam.
- Body: 15–22px / 400 / line 1.45–1.6.
- Số thống kê: 30px / 600 / cam.
- Mono phụ chú: `ui-monospace` 10–13px.

**Bo góc:** nút/chip `999px` (pill); card `16–20px`; icon box `12–14px`; input `10px`. **Header** sticky, nền `rgba(255,255,255,0.92)` + `backdrop-filter blur(14px)`, viền dưới `#EFEFEF`. Max-width nội dung `1280px`, padding ngang `48px`.

**Animation** (keyframes, đều tắt khi `prefers-reduced-motion: reduce`): `mt-sweep` (vệt sáng trên card), `mt-bar` (cột sóng), `mt-ring`/`mt-halo` (vòng lan), `mt-scan` (quét), `mt-blink`, `mt-spin`, `mt-float`. Hover card: `translateY(-4px)` + viền cam + shadow cam nhạt.

## Cấu trúc section (thứ tự trên trang)
1. **Header** (sticky): logo `mytel` + nhãn `B2B` | nav: Giải pháp / Theo ngành / Vì sao Mytel / Đăng ký tư vấn | **toggle VI/EN** | CTA pill "Talk to an Expert".
2. **Hero**: nền ảnh `hero-city` + overlay tối gradient; H1 "DẪN ĐẦU TƯƠNG LAI SỐ CÙNG MYTEL"; phụ đề "Một đối tác. Một hệ sinh thái. Khả năng không giới hạn."; 2 CTA ("Khám phá giải pháp →", "Talk to an Expert"); bo cong trắng đáy (`border-radius:50% 50% 0 0`).
3. **Solutions** (`#solutions`): eyebrow "OUR SOLUTIONS" + H2 "Mọi thứ doanh nghiệp cần để chuyển đổi số"; **grid 3 card**:
   - **CONNECTIVITY** (icon `language`, viz bars): DIA, DPLC, IPLC, IPVPN, IP Transit, Dark Fiber, Cross Connection (7).
   - **ICT SOLUTIONS** (icon `cloud`, viz rings): Cloud, Colocation, eKYC, Restaurant Management, Security EndPoint, Penetration Testing, SOC, AI Camera & Smart City (8).
   - **MOBILE** (icon `sim_card`, viz scan): M2M, Bulk SMS, VBot (3).
   - Mỗi card: icon box, label, mô tả, **chip tag từng dịch vụ**, CTA "Khám phá … →".
4. **Industries** (`#industries`, nền `#FAFAFB`): eyebrow "SOLUTIONS BY INDUSTRY" + H2; **grid 6**: Carrier & ISP, Banking & Finance, Enterprise, Manufacturing, Hospitality & F&B, Retail (icon + halo).
5. **Why Mytel** (`#why`): eyebrow + H2 "Đối tác số đáng tin cậy"; **5 con số**: `18` Dịch vụ B2B (3 nhóm) · `—` Khách hàng doanh nghiệp [AS-13] · `—` Độ tin cậy mạng [AS-04] · `—` Trung tâm dữ liệu [AS-04] · `—` Hỗ trợ doanh nghiệp [AS-08]. **Số thật chờ asset — không bịa.**
6. **Dải CTA cam** (gradient): "Sẵn sàng chuyển đổi doanh nghiệp của bạn?" + nút "Talk to an Expert"; chú thích ảnh hạ tầng [AS-03].
7. **Đăng ký tư vấn** (`#dang-ky`): 2 cột — trái: tiêu đề "Để lại nhu cầu, Sale liên hệ trong 1 giờ" + hotline/email [AS-08]; phải: **form** (Họ tên · Email công việc · SĐT · Tên doanh nghiệp · **select Dịch vụ quan tâm** = "Tư vấn chung" + 18 dịch vụ · Lời nhắn · **checkbox consent PDPL** [AS-07] · nút "Gửi yêu cầu" · "DỮ LIỆU TRUYỀN QUA HTTPS").
8. **Footer** (`#1A1A1C`): logo + mô tả + 4 cột (SOLUTIONS/INDUSTRIES/RESOURCES/SUPPORT) + copyright + Privacy/Terms.

## Đối chiếu với FSD/SRS (điểm designer cần khớp)
- Form khớp **FR-07 / SCR-04**: các trường đúng (contactName/email/phone/companyName/serviceInterest/message/consent) — thêm **honeypot ẩn** `website` (LLD), và anti-spam Turnstile (đặt trước nút Gửi).
- Toggle **VI/EN** khớp FR-13/SCR-05 (thiết kế đang để **VI mặc định** — khớp MVP EN+VI; lưu ý BRD ghi "EN trước" nhưng anh Bryan chốt EN+VI nên VI-default OK).
- 3 nhóm dịch vụ khớp SRS G2 (Connectivity/ICT/Mobile). Trang chi tiết dịch vụ (SCR-03) **chưa có trong canvas** → designer thiết kế template chi tiết theo cùng hệ token (map 7 trường hiển thị).
- Con số Why Mytel khớp khối động "Con số nổi bật" (FR-14) — **doanh thu ẩn** (Q8) ✓ (canvas không có ô doanh thu).

## Việc designer phải BỔ SUNG (canvas chưa có)
1. **Trang chi tiết dịch vụ (SCR-03)** — template 1 mẫu, map 7 trường (ẩn giá).
2. **4 màn Admin CMS-lite** (SCR-06 login · SCR-07 danh sách khối · SCR-08 thêm/sửa khối · SCR-09 danh sách lead) — cùng token, phong cách quản trị gọn.
3. **4 trạng thái UI** mỗi màn (loading/empty/lỗi/thành công) + **empty-state** landing khi khối động ẩn hết.
4. **Kiểm WCAG:** cam `#F26B21` chỉ dùng cho nhấn/label/CTA lớn; **không dùng cam cho body text** trên trắng (fail 4.5:1). Nút trắng-trên-cam 16px/600 = borderline → xác minh contrast, tăng đậm/cỡ nếu cần.
5. **Token 3 lớp** (primitive → semantic → component) khớp hệ token dev (Next.js + CSS vars) để đổi nhận diện chỉ sửa token.
