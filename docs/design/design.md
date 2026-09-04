# design.md — Landing page dịch vụ B2B Mytel (+ Admin CMS-lite)

| Phiên bản | v0.1 | Ngày | 2026-09-04 | Trạng thái | DONE (chờ GATE-3) |
|-----------|------|------|------------|------------|-------------------|

> **Nguồn thiết kế CHÍNH THỨC:** `docs/design/design-source-notes.md` — bóc token/section/animation/asset từ file `B2B Landing v2.dc.html` (Claude Design project "B2B Landing page Mytel" của anh Bryan, DesignSync 2026-09-04). Public landing **bám 1:1**; các màn **Admin (SCR-06..09) + trang chi tiết dịch vụ (SCR-03)** designer **mở rộng theo cùng hệ token** (canvas chưa có — đánh dấu BỔ SUNG).
> **Ranh giới tài liệu:** SRS/FSD là nguồn sự thật về **hành vi/quy tắc**; api-spec là nguồn sự thật về **hợp đồng API**. design.md đặc tả **bố cục · token · thành phần · trạng thái thị giác**, tham chiếu FR-/SCR-/endpoint, **không chép lại quy tắc**. Mâu thuẫn → **SRS/FSD thắng**, báo PO.
> **Đối chiếu chéo:** đã khớp `docs/ba/FSD.md` (SCR-01..09 + SHELL-ADMIN, 18 FR), `docs/sa/api-spec.md v1.0` (14 endpoint), tên trường form lead canonical (`contactName/email/phone/companyName/serviceInterest/message/consent/website`). Kết quả đối chiếu ở **§12**.

---

## 1. Nguyên tắc thiết kế

- **Thương hiệu:** Mytel **cam–trắng**. Cam `#F26B21` là màu nhấn (CTA, label, icon, link nhấn) — **không dùng cho body text trên nền trắng** (xem §10 kiểm contrast). Nền chủ đạo trắng/xám rất nhạt; hero nền tối; footer nền gần đen.
- **Giọng điệu:** doanh nghiệp/B2B, tin cậy, tối giản kiểu Apple (khoảng thở rộng, chữ đậm uppercase cho tiêu đề lớn, viền mảnh, bo góc mềm). Không rực rỡ, không nhiều màu lạc ngoài bảng token.
- **Đối tượng:** (public) khách doanh nghiệp Myanmar/quốc tế, ra quyết định mua dịch vụ; (admin) Content Admin nội bộ vận hành khối động + đọc lead.
- **Nền tảng:** **Web only** (không app mobile ở MVP — FSD §1). Public site responsive (mobile→desktop); Admin CMS tối ưu desktop, dùng được tablet.
- **Ngôn ngữ:** **VI + EN** (VI mặc định theo canvas anh Bryan; khung `/my` sẵn nhưng **ẩn** — BR-11). Mọi microcopy qua **i18n key** (không chốt chuỗi cứng trong thiết kế). Thông điệp lỗi hiển thị bám đúng cột message của api-spec §3.
- **Chuyển động:** tinh tế, trang trí (không mang nghĩa); **bắt buộc tắt toàn bộ khi `prefers-reduced-motion: reduce`** (§8, §10).

---

## 2. Design token — 3 lớp (primitive → semantic → component)

> **Quy ước dev (Next.js + CSS variables):** primitive = biến thô `--mt-*` (chỉ dùng trong file token, KHÔNG dùng thẳng trong component); semantic = biến ý nghĩa `--color-*/--text-*/--surface-*` (dev/FE map thẳng, dùng trong mọi component); component = biến cấp thành phần `--btn-*/--card-*/--input-*`. **Đổi nhận diện thương hiệu = chỉ sửa lớp primitive.** Không được đặt màu/cỡ "lạc" ngoài bảng token.

### 2.1 Lớp PRIMITIVE (bảng thô — chỉ file token)

**Màu (bóc 1:1 từ source-notes):**

| Primitive token | Hex | Nguồn source-notes |
|---|---|---|
| `--mt-orange-500` | `#F26B21` | brand-primary |
| `--mt-orange-700` | `#C9541F` | brand-primary-hover |
| `--mt-orange-800` | `#C35120` | *thêm mới (WCAG)* — link cam đạt 4.5:1 trên trắng (§10) |
| `--mt-orange-grad-a` | `#F26B21` | brand-gradient stop 1 |
| `--mt-orange-grad-b` | `#F58A3C` | brand-gradient stop 2 |
| `--mt-orange-grad-c` | `#FFA765` | brand-gradient stop 3 |
| `--mt-tint-100` | `#FFF1E8` | tint-100 (nền icon ngành) |
| `--mt-tint-200` | `#FFD9C2` | tint-200 (::selection) |
| `--mt-tint-border` | `#F9C3A0` | tint-border (viền hover/icon) |
| `--mt-hero-900` | `#26140A` | hero-dark nền |
| `--mt-hero-overlay` | `#180A02` | hero overlay |
| `--mt-ink-900` | `#1D1D1F` | ink-900 |
| `--mt-ink-700` | `#3A3A3C` | ink-700 |
| `--mt-ink-500` | `#6E6E73` | ink-500 |
| `--mt-ink-400` | `#8E8E93` | ink-400 |
| `--mt-ink-300` | `#AEAEB2` | ink-300 |
| `--mt-white` | `#FFFFFF` | surface-0 |
| `--mt-gray-50` | `#FAFAFB` | surface-50 |
| `--mt-gray-100` | `#F7F7F8` | surface-100 |
| `--mt-gray-chip` | `#F5F5F7` | surface-chip |
| `--mt-border-100` | `#EDEDEF` | border card/input |
| `--mt-border-200` | `#E1E1E4` | border đậm |
| `--mt-footer-900` | `#1A1A1C` | footer-dark |
| `--mt-footer-border` | `#2C2C2E` | footer border |
| `--mt-green-600` | `#1E8E5A` | *thêm mới* — success/badge "Hiển thị/Đã gửi" (không có trong canvas; chọn tông đạt contrast) |
| `--mt-red-600` | `#C0392B` | *thêm mới* — error/danger (viền lỗi input, badge "Thất bại") |
| `--mt-amber-600` | `#B7791F` | *thêm mới* — warning/badge "Nháp/Đang gửi" |

> **Ghi chú màu thêm mới (green/red/amber):** canvas anh Bryan chỉ có cam–xám (đủ cho public). Admin cần màu trạng thái ngữ nghĩa (thành công/lỗi/cảnh báo) mà cam không tải được nghĩa. 3 màu này **chọn tối thiểu, đạt contrast ≥4.5:1 trên trắng**, không cạnh tranh với cam thương hiệu. **Chờ anh Bryan xác nhận** (điểm lưu ý §12).

**Typography (font hệ thống — bóc từ source-notes):**

| Primitive token | Giá trị |
|---|---|
| `--mt-font-sans` | `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif` |
| `--mt-font-mono` | `ui-monospace, SFMono-Regular, Menlo, monospace` |
| `--mt-font-icon` | `'Material Symbols Outlined'` |
| Thang cỡ | `10, 13, 15, 17, 22, 30, 44, clamp(38px,4.9vw,68px)` px |
| Cân nặng | `400 / 600 / 700` |
| Letter-spacing | `-0.035em` (H1) · `-0.03em` (H2) · `0.1em` (eyebrow) |
| Line-height | `1.04` (H1) · `1.45–1.6` (body) |

**Spacing (thang 4/8 — chuẩn hoá padding ngang canvas 48px, max-width 1280px):**

| Primitive token | px |
|---|---|
| `--mt-space-1` | 4 |
| `--mt-space-2` | 8 |
| `--mt-space-3` | 12 |
| `--mt-space-4` | 16 |
| `--mt-space-6` | 24 |
| `--mt-space-8` | 32 |
| `--mt-space-12` | 48 (padding ngang container) |
| `--mt-space-16` | 64 |
| `--mt-space-24` | 96 (khoảng cách section) |
| `--mt-container-max` | 1280 |

**Radius (bóc từ source-notes):**

| Primitive token | Giá trị | Dùng |
|---|---|---|
| `--mt-radius-pill` | `999px` | nút/chip |
| `--mt-radius-card` | `18px` (dải 16–20) | card |
| `--mt-radius-icon` | `13px` (dải 12–14) | icon box |
| `--mt-radius-input` | `10px` | input |
| `--mt-radius-hero-cap` | `50% 50% 0 0` | vòm trắng đáy hero |

**Shadow / elevation:**

| Primitive token | Giá trị (đề xuất — canvas chỉ có shadow cam nhạt hover) |
|---|---|
| `--mt-shadow-none` | `none` |
| `--mt-shadow-card` | `0 1px 2px rgba(29,29,31,.04)` |
| `--mt-shadow-card-hover` | `0 12px 28px rgba(242,107,33,.14)` (bóng cam nhạt — hover card) |
| `--mt-shadow-header` | `0 1px 0 #EFEFEF` (viền dưới header) |
| `--mt-blur-header` | `blur(14px)` (backdrop) |

**Z-index:**

| Primitive token | Giá trị |
|---|---|
| `--mt-z-base` | 0 |
| `--mt-z-sticky` | 100 (header) |
| `--mt-z-dropdown` | 200 (menu ngôn ngữ) |
| `--mt-z-overlay` | 900 (dialog xác nhận xóa admin) |
| `--mt-z-toast` | 1000 |

### 2.2 Lớp SEMANTIC (dev map thẳng — dùng trong mọi component)

| Semantic token | = primitive | Ý nghĩa |
|---|---|---|
| `--color-brand` | `--mt-orange-500` | màu nhấn chính (CTA lớn, icon, label) |
| `--color-brand-hover` | `--mt-orange-700` | hover nút/link |
| `--color-brand-gradient` | `linear-gradient(90deg,--mt-orange-grad-a,--mt-orange-grad-b,--mt-orange-grad-c)` | dải CTA cam lớn |
| `--text-primary` | `--mt-ink-900` | tiêu đề, thân đậm |
| `--text-secondary` | `--mt-ink-700` | nav, label |
| `--text-muted` | `--mt-ink-500` | mô tả |
| `--text-subtle` | `--mt-ink-400` | phụ (chỉ dùng trên nền tối/đủ contrast — §10) |
| `--text-placeholder` | `--mt-ink-300` | placeholder/mono ghi chú |
| `--text-on-brand` | `--mt-white` | chữ trên nền cam (chỉ text lớn ≥18px/700 — §10) |
| `--text-link` | `--mt-orange-800` | link cam trên nền trắng (đạt 4.5:1) |
| `--surface-page` | `--mt-white` | nền chính |
| `--surface-alt` | `--mt-gray-50` | nền section Industries |
| `--surface-card` | `--mt-gray-100` | card, form |
| `--surface-chip` | `--mt-gray-chip` | chip toggle ngôn ngữ |
| `--surface-hero` | `--mt-hero-900` | nền hero |
| `--surface-footer` | `--mt-footer-900` | footer |
| `--surface-tint` | `--mt-tint-100` | nền icon ngành |
| `--border-default` | `--mt-border-100` | viền card/input |
| `--border-strong` | `--mt-border-200` | viền đậm |
| `--border-brand` | `--mt-tint-border` | viền hover cam |
| `--focus-ring` | `--mt-orange-500` | vòng focus (2px + offset 2px) |
| `--selection-bg` | `--mt-tint-200` | `::selection` |
| `--color-success` | `--mt-green-600` | trạng thái thành công |
| `--color-danger` | `--mt-red-600` | lỗi/nguy hiểm |
| `--color-warning` | `--mt-amber-600` | cảnh báo |

**Dark mode:** MVP public + admin render **light** (canvas anh Bryan là light; hero/footer đã là vùng tối cục bộ, không phải dark theme). Cấu trúc token **sẵn sàng dark** — khi cần chỉ thêm một bộ giá trị semantic (`:root[data-theme=dark]`) map sang primitive khác, không đổi component. **Chưa thiết kế dark cho MVP** (ngoài phạm vi; ghi rõ để không hiểu nhầm là thiếu).

### 2.3 Lớp COMPONENT (biến cấp thành phần)

| Component token | = semantic | Ghi chú |
|---|---|---|
| `--btn-primary-bg` | `--color-brand` | nút CTA cam |
| `--btn-primary-fg` | `--text-on-brand` | **chữ ≥18px/700** (WCAG §10) |
| `--btn-primary-bg-hover` | `--color-brand-hover` | |
| `--btn-secondary-bg` | `--surface-page` | nút trắng viền |
| `--btn-secondary-fg` | `--text-link` | chữ cam đạt 4.5:1 |
| `--btn-secondary-border` | `--border-brand` | |
| `--btn-radius` | `--mt-radius-pill` | |
| `--card-bg` | `--surface-card` | |
| `--card-radius` | `--mt-radius-card` | |
| `--card-border` | `--border-default` | |
| `--card-border-hover` | `--border-brand` | + `translateY(-4px)` + `--mt-shadow-card-hover` |
| `--icon-box-bg` | `--surface-tint` | nền icon box card |
| `--icon-box-radius` | `--mt-radius-icon` | |
| `--input-bg` | `--surface-card` | |
| `--input-border` | `--border-default` | |
| `--input-border-focus` | `--color-brand` | |
| `--input-border-error` | `--color-danger` | + text lỗi (không chỉ màu) |
| `--input-radius` | `--mt-radius-input` | |
| `--chip-bg` | `--surface-chip` | chip dịch vụ / toggle ngôn ngữ |
| `--badge-visible` | `--color-success` | badge "Hiển thị" |
| `--badge-draft` | `--color-warning` | badge "Nháp" |
| `--badge-hidden` | `--text-muted` | badge "Ẩn" |

---

## 3. Bản đồ màn hình → FR (truy vết, khớp FSD §2)

| Màn (SCR) | Tên | Nền tảng | FR phủ | Nguồn thiết kế |
|---|---|---|---|---|
| SCR-01 | Landing tổng (hero + 8 section) | Web public | FR-01, FR-02, FR-06 | **Canvas 1:1** (8 section §5) |
| SCR-02 | Danh sách dịch vụ theo 3 nhóm | Web public | FR-04, FR-06 | Canvas (Solutions section) |
| SCR-03 | Trang chi tiết dịch vụ (template 18 dịch vụ) | Web public | FR-05, FR-06 | **BỔ SUNG** (cùng token) |
| SCR-04 | Form lead (đăng ký tư vấn) | Web public | FR-06/07/08/10 | Canvas (section 7) + honeypot/Turnstile |
| SCR-05 | Đổi ngôn ngữ EN↔VI (toàn cục) | Web public | FR-03 | Canvas (toggle header) |
| SHELL-ADMIN | Vỏ Admin (nav + đăng xuất + bảo vệ phiên) | CMS | FR-17 (+FR-18 ngầm) | **BỔ SUNG** |
| SCR-06 | Admin đăng nhập | CMS | FR-16 | **BỔ SUNG** |
| SCR-07 | Admin danh sách khối động | CMS | FR-12/13/14 (list), FR-15 | **BỔ SUNG** |
| SCR-08 | Admin thêm/sửa khối (3 loại đa ngữ) | CMS | FR-12/13/14/15 | **BỔ SUNG** |
| SCR-09 | Admin danh sách + chi tiết lead | CMS | FR-11 | **BỔ SUNG** |

**Tổng: 9 màn + 1 vỏ.** 5 màn public bám canvas anh Bryan; SCR-03 + 4 màn admin + shell mở rộng theo cùng hệ token §2.

---

## 4. User flow (bám actor-usecase + FSD)

### 4.1 Public — xem landing → duyệt dịch vụ → submit lead

```
[SCR-01 Landing]
   ├─ CTA "Khám phá giải pháp" ─────────► cuộn tới Solutions (SCR-02 nội trang)
   ├─ bấm card nhóm/dịch vụ ────────────► [SCR-03 Chi tiết dịch vụ /{lang}/services/{slug}]
   │                                          └─ CTA "Đăng ký tư vấn" (prefill dịch vụ) ─►┐
   └─ CTA "Talk to an Expert" ──────────────────────────────────────────────────────────►│
                                                                                          ▼
                                                                          [SCR-04 Form lead]
   [SCR-04] nhập 6 trường + consent ─submit(POST /api/leads)─► [Trang cảm ơn] (thành công)
        ├─ lỗi validate (LEAD-001) ──► giữ dữ liệu + lỗi từng ô, Gửi enable lại
        ├─ thiếu consent (LEAD-010) ─► báo cạnh ô consent
        ├─ vượt rate-limit (LEAD-021)► "Đã gửi quá số lần… thử lại sau 1 giờ", Gửi disable
        ├─ lỗi lưu DB (LEAD-030) ────► "Hệ thống đang bận, thử lại", giữ dữ liệu
        └─ honeypot có giá trị (bot) ► [Trang cảm ơn GIẢ] (không tạo lead — 200 data giả)
   [SCR-05 toggle VI/EN] ─── áp mọi trang public, giữ nguyên trang + dữ liệu form đang nhập
```

- `slug` sai ở SCR-03 → **trang 404 song ngữ** + link về landing (Next.js `notFound()`).
- Không khối động nào `Hiển thị` → SCR-01 **vẫn render hero + 4 section tĩnh**, 3 cụm khối động **thu gọn hoàn toàn** (empty-state — §7).

### 4.2 Admin — login → quản khối → xem lead

```
[SCR-06 Đăng nhập] ─(đúng, tài khoản Hoạt động)─► [SHELL-ADMIN]
      ├─ sai email/mật khẩu (AUTH-001) ─► "Email hoặc mật khẩu không đúng" (lỗi chung)
      └─ 5 lần sai/15' (AUTH-010) ───────► "Tài khoản tạm khóa, thử lại sau 15 phút"

[SHELL-ADMIN]
   ├─ tab "Khối nội dung" ─► [SCR-07 DS khối] ─┬─ "Tạo khối" ─► [SCR-08 Thêm/Sửa]
   │                                            ├─ "Sửa" ──────► [SCR-08]
   │                                            ├─ Bật/Tắt hiển thị (PATCH visibility)
   │                                            │      └─ thiếu trường EN (CB-010) ► chặn + báo
   │                                            ├─ Sắp thứ tự (PATCH reorder)
   │                                            └─ Xóa (dialog xác nhận → soft-delete)
   │      [SCR-08] "Lưu nháp"(→Nháp) / "Lưu & Bật hiển thị"(→Hiển thị, chặn nếu thiếu EN)
   ├─ tab "Lead" ─► [SCR-09 DS lead] ─► mở 1 lead (Mới→Đã xem, đánh dấu khi mở)
   └─ "Đăng xuất" (POST /api/auth/signout) ─► [SCR-06]
   [hết phiên 30' không thao tác → AUTH-020 → chuyển SCR-06]
```

---

## 5. SCR-01 — Landing tổng (8 section, bám canvas 1:1)

**Nền tảng:** Web public · URL `/{lang}` (`/vi` mặc định, `/en`). Container max `--mt-container-max` (1280), padding ngang `--mt-space-12` (48; mobile 20). Thứ tự 8 section đúng source-notes §"Cấu trúc section".

### 5.1 Bố cục (wireframe desktop)

```
┌────────────────────────────────────────────────────────────────────────┐ [1] HEADER sticky
│ [◧ mytel] B2B     Giải pháp  Theo ngành  Vì sao Mytel  Đăng ký tư vấn   │  nền rgba(255,255,255,.92)
│                                              [VI|EN]  ( Talk to an Expert )│  blur(14px), viền dưới #EFEFEF
├────────────────────────────────────────────────────────────────────────┤
│                    ▒▒▒ hero-city + overlay tối gradient ▒▒▒              │ [2] HERO (nền tối)
│              DẪN ĐẦU TƯƠNG LAI SỐ CÙNG MYTEL                             │  H1 clamp(38–68) 700 uppercase
│         Một đối tác. Một hệ sinh thái. Khả năng không giới hạn.          │  phụ đề trắng
│         ( Khám phá giải pháp → )   ( Talk to an Expert )                 │  2 CTA
│      ╰────────────────── vòm trắng đáy (50% 50% 0 0) ─────────────────╯  │
├────────────────────────────────────────────────────────────────────────┤
│  OUR SOLUTIONS (eyebrow cam)                                            │ [3] SOLUTIONS #solutions
│  Mọi thứ doanh nghiệp cần để chuyển đổi số  (H2 44/600)                 │
│  ┌── CONNECTIVITY ──┐ ┌── ICT SOLUTIONS ─┐ ┌──── MOBILE ────┐          │  grid 3 card
│  │ [icon language]  │ │ [icon cloud]     │ │ [icon sim_card] │          │  icon box tint-100
│  │ viz bars ~~~~     │ │ viz rings ◎◎     │ │ viz scan ▚▚      │          │  mô tả + chip dịch vụ
│  │ mô tả…            │ │ mô tả…           │ │ mô tả…          │          │
│  │ [DIA][DPLC][IPLC]│ │[Cloud][eKYC][SOC]│ │ [M2M][SMS][VBot]│          │  7 / 8 / 3 chip
│  │ Khám phá … →      │ │ Khám phá … →     │ │ Khám phá … →    │          │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘          │
├────────────────────────────────────────────────────────────────────────┤ [4] INDUSTRIES #industries
│  SOLUTIONS BY INDUSTRY (eyebrow)              (nền surface-alt #FAFAFB)  │  grid 6
│  [◉ Carrier&ISP] [◉ Banking] [◉ Enterprise]                            │  icon + halo
│  [◉ Manufacturing] [◉ Hospitality&F&B] [◉ Retail]                      │
├────────────────────────────────────────────────────────────────────────┤ [5] WHY MYTEL #why
│  WHY MYTEL (eyebrow) · Đối tác số đáng tin cậy (H2)                     │  5 con số (30/600 cam)
│   18          —           —           —            —                     │  18 = 3 nhóm dịch vụ (số thật)
│  Dịch vụ    Khách hàng   Độ tin cậy  Trung tâm    Hỗ trợ                │  4 số "—" CHỜ ASSET (AS-04/08/13)
│  B2B (3 nhóm)  DN [AS-13] mạng [AS-04] dữ liệu[AS-04] DN [AS-08]         │  KHÔNG bịa số
├────────────────────────────────────────────────────────────────────────┤ [6] CTA BAND (gradient cam)
│  ▓▓▓ Sẵn sàng chuyển đổi doanh nghiệp của bạn? ▓▓▓  ( Talk to an Expert )│  nền brand-gradient
│  (chú thích ảnh hạ tầng [AS-03])                                        │  nút TRẮNG (xem §10 cảnh báo)
├────────────────────────────────────────────────────────────────────────┤ [7] ĐĂNG KÝ TƯ VẤN #dang-ky
│  Để lại nhu cầu, Sale liên hệ trong 1 giờ    │  [ Form lead → SCR-04 ]   │  2 cột
│  ☎ hotline / ✉ email [AS-08]                 │  (đặc tả ở §8 SCR-04)     │
├────────────────────────────────────────────────────────────────────────┤ [8] FOOTER (footer-900)
│ [mytel] mô tả | SOLUTIONS | INDUSTRIES | RESOURCES | SUPPORT            │  4 cột
│ © … Mytel    Privacy · Terms                          [VI|EN]           │
└────────────────────────────────────────────────────────────────────────┘
```

**Khối động (FR-02) — chèn vào trang khi có khối `Hiển thị`:** 3 cụm **Highlight / Đối tác (Partner) / Con số nổi bật (Stat)** render theo `sortOrder` tăng dần, đúng bản dịch locale. Vị trí đề xuất: Highlight sau [3] Solutions; Partner trước [8] Footer; Stat hoà vào/thay thế phần "5 con số" của [5] Why Mytel (Stat động bổ sung). **Ẩn cả cụm khi rỗng** (§7).

### 5.2 Responsive (breakpoint là token)

| Breakpoint | Token | Hành vi |
|---|---|---|
| Mobile | `< 768px` | container padding 20px; nav thu vào **hamburger** (drawer); grid Solutions/Industries về **1 cột**; 5 con số Why về 2 cột; hero H1 dùng cận dưới clamp (38px); CTA band nút full-width; form 1 cột (section 7 xếp dọc: text trên, form dưới). |
| Tablet | `768–1023px` | Solutions 2 cột (card thứ 3 xuống hàng), Industries 2–3 cột, nav đầy đủ. |
| Desktop | `≥ 1024px` | như wireframe (3 cột / 6 cột / 5 con số / form 2 cột). |

### 5.3 4 trạng thái UI (SCR-01)

- **Loading:** SSR/ISR → trang tới đã có nội dung tĩnh; khối động nếu hydrate client dùng **skeleton nhẹ** (card xám bo góc `--mt-radius-card`, shimmer tắt khi reduced-motion). Không spinner trắng toàn màn.
- **Empty (bám FR-01):** không khối động `Hiển thị` (hoặc ẩn hết ở locale đang xem) → **3 cụm khối động biến mất hoàn toàn** — không tiêu đề mục trống, không khung rỗng, không placeholder. Hero + 4 section tĩnh vẫn đủ.
- **Lỗi:** lỗi đọc nguồn khối động → **bỏ qua cụm lỗi**, phần tĩnh vẫn render; **không toast lỗi cho khách**.
- **Thành công:** hero + 4 section + khối động `Hiển thị` đúng thứ tự/ngôn ngữ.
- **Hình dạng dữ liệu khối động:** rỗng (ẩn cụm) · 1 mục (card đơn, không vỡ grid — căn trái) · nhiều (grid wrap / cuộn ngang trên mobile) · **chuỗi dài tràn** (tiêu đề Highlight / tên Partner dài → `text-overflow: ellipsis` 2 dòng; số Stat dài như `1.200+` → không xuống dòng giữa số).

---

## 6. SCR-02 — Danh sách dịch vụ theo 3 nhóm (canvas Solutions)

**Nền tảng:** Web public. Là **section [3] trong SCR-01** và/hoặc anchor `/{lang}#solutions`. 18 dịch vụ chia 3 nhóm: **Connectivity (7)** · **ICT Solutions (8)** · **Mobile (3)** (đúng canvas; lưu ý mã nhóm nội bộ FSD ghi "Mobile ICT/ICT Service" — thống nhất tên hiển thị theo canvas, xem §12).

**Card dịch vụ (component `service-group-card`):** icon box (tint-100, radius-icon) + viz trang trí (bars/rings/scan) + label nhóm + mô tả + **chip tag từng dịch vụ** (`--chip-bg`, pill) + CTA "Khám phá … →". Mỗi chip/card link → SCR-03 `/{lang}/services/{slug}`.

**Trạng thái UI:** **Loading** SSR sẵn nội dung · **Empty** không áp dụng (catalog 18 dịch vụ tĩnh trong repo) · **Lỗi** không áp dụng runtime · **Thành công** 18 card/3 nhóm. Thiếu bản dịch 1 trường → hiển thị bản EN cho trường đó (FR-05 1b), không ẩn card. **Hình dạng dữ liệu:** tên dịch vụ dài → chip wrap nhiều dòng, không tràn card.

---

## 7. SCR-03 — Trang chi tiết dịch vụ (BỔ SUNG — template dùng chung 18 dịch vụ)

**Nền tảng:** Web public · URL `/{lang}/services/{slug}` · phủ FR-05, FR-06 · **cùng hệ token §2** (canvas chưa có màn này).

**Map trường hiển thị (8 trường nguồn Excel → hiển thị 7, ẩn 1 — bám FSD SCR-03):**

| # | Trường nguồn | Hiển thị? | Element trên màn |
|---|---|:---:|---|
| 1 | Tên (Service name) | ✓ | H1 (clamp, 700) + meta title |
| 2 | Nhóm (Group) | ✓ | breadcrumb / nhãn nhóm (chip cam nhạt) |
| 3 | What is | ✓ | đoạn mô tả "Dịch vụ là gì" |
| 4 | Advantage | ✓ | khối lợi thế (list icon check) |
| 5 | Target Customer | ✓ | khối đối tượng khách hàng |
| 6 | Target Sale | ✓ | khối ứng dụng/mục tiêu bán |
| 7 | Delivery Timeline | ✓ | khối thời gian triển khai |
| 8 | **Price Policy** | **✗ ẩn (Q3)** | **thay bằng CTA "Đăng ký tư vấn"** — KHÔNG render giá công khai |

### 7.1 Bố cục

```
┌────────────────────────────────────────────────────────────┐ HEADER (dùng lại SCR-01)
├────────────────────────────────────────────────────────────┤
│ Trang chủ › Giải pháp › [Nhóm]                             │ breadcrumb (#2)
│ TÊN DỊCH VỤ (H1)                          ┌───────────────┐ │
│ [chip Nhóm]                               │  CTA card cam  │ │ CTA sticky (thay Price Policy)
│                                           │  Cần tư vấn?   │ │
│ ## Dịch vụ là gì (What is)                │ (Đăng ký tư vấn)│ │ → SCR-04 prefill = dịch vụ này
│ …                                         │  ☎ hotline     │ │
│ ## Lợi thế (Advantage)  ✓ … ✓ …           └───────────────┘ │
│ ## Đối tượng khách hàng (Target Customer)                   │
│ ## Ứng dụng bán (Target Sale)                               │
│ ## Thời gian triển khai (Delivery Timeline)                 │
│ ─────────────────────────────────────────────────────────  │
│           ( Đăng ký tư vấn dịch vụ này → )                  │ CTA lặp cuối trang
├────────────────────────────────────────────────────────────┤ FOOTER
```

**Responsive:** desktop 2 cột (nội dung trái + CTA card sticky phải); mobile 1 cột (CTA card đẩy lên ngay dưới H1 + lặp CTA cuối trang).

### 7.2 4 trạng thái UI (SCR-03)

- **Loading:** SSR sẵn nội dung (nội dung repo).
- **Empty:** không áp dụng (template luôn có 7 trường).
- **Lỗi:** `slug` không thuộc 18 dịch vụ → **trang 404 song ngữ** (minh hoạ đơn giản: icon + "Không tìm thấy dịch vụ" + nút "Về trang chủ") — dùng lại token, không toast.
- **Thành công:** 7 trường + CTA (ẩn Price Policy).
- **Hình dạng dữ liệu:** trường thiếu bản dịch locale → hiển thị EN (FR-05 1b); mô tả rất dài → cuộn tự nhiên, CTA card sticky vẫn trong tầm nhìn desktop.

---

## 8. SCR-04 — Form lead (đăng ký tư vấn, canvas section 7 + anti-spam)

**Nền tảng:** Web public · phủ FR-06/07/08/10 · vào từ CTA landing (không prefill) hoặc CTA SCR-03 (prefill "Dịch vụ quan tâm"). **Tên trường canonical khớp api-spec §3.1.**

### 8.1 Bố cục (2 cột — canvas)

```
┌──────────────── #dang-ky ────────────────────────────────────────────┐
│ CỘT TRÁI                          │ CỘT PHẢI (form, surface-card)      │
│ Để lại nhu cầu, Sale liên hệ      │ [ Họ tên * ................. ]     │ contactName
│ trong 1 giờ (H2)                  │ [ Email công việc * ........ ]     │ email
│ ☎ hotline  ✉ email  [AS-08]       │ [ Số điện thoại * .......... ]     │ phone
│ (chờ số thật — AS-08)             │ [ Tên doanh nghiệp * ....... ]     │ companyName
│                                   │ [ Dịch vụ quan tâm ▾ * ]           │ serviceInterest (select)
│                                   │     Tư vấn chung + 18 dịch vụ      │  (prefill từ SCR-03)
│                                   │ [ Lời nhắn / nhu cầu ....... ]     │ message (≤1000, đếm ký tự)
│                                   │ [ (input ẩn: website) ]            │ honeypot (aria-hidden)
│                                   │ [☐ Tôi đồng ý xử lý dữ liệu…* ]    │ consent (link nội dung AS-07)
│                                   │ [ Cloudflare Turnstile ]           │ widget (ẩn nếu degrade)
│                                   │ ( Gửi yêu cầu )                    │ submit
│                                   │ 🔒 DỮ LIỆU TRUYỀN QUA HTTPS        │ mono ghi chú
└───────────────────────────────────┴────────────────────────────────────┘
```

- **Honeypot `website`:** input ẩn với người thật (`aria-hidden="true"` + off-screen CSS, KHÔNG `display:none` để bot vẫn thấy). Phải rỗng; có giá trị → xử lý như bot (server trả 200 data giả → **trang cảm ơn giả**).
- **Turnstile:** đặt **trước nút Gửi**; verify server-side (timeout 3s, degrade nếu lỗi — HLD ADR-05).
- **Consent:** checkbox **bắt buộc = true**; nhãn có link nội dung consent PDPL (Legal duyệt — **AS-07 chờ**). `consentTextVersion` gửi kèm (api-spec).

### 8.2 Component state form (default/hover/focus/disabled/error/loading)

| Element | default | focus | error | disabled/loading |
|---|---|---|---|---|
| Input text/email/tel | viền `--input-border`, radius 10 | viền `--input-border-focus` cam + focus-ring | viền `--input-border-error` đỏ + **dòng lỗi chữ dưới ô** (không chỉ màu) | khóa nhập khi đang gửi |
| Select dịch vụ | như input | như input | như input | — |
| Textarea | như input + đếm ký tự `x/1000` | — | ">1000 ký tự" | — |
| Checkbox consent | ô vuông viền | focus-ring | text đỏ cạnh ô | — |
| Nút "Gửi yêu cầu" | `--btn-primary-bg` cam, chữ ≥18/700 | hover `--btn-primary-bg-hover` | — | **disable + spinner** khi gửi (chống double-submit) |

### 8.3 4 trạng thái UI + ánh xạ errorCode → thông điệp (bám FSD SCR-04)

- **Loading:** sau bấm Gửi — nút disable + spinner, khóa nhập.
- **Empty:** không áp dụng (form nhập).
- **Lỗi (giữ nguyên giá trị đã nhập):**
  | errorCode | Hiển thị |
  |---|---|
  | `LEAD-001` (400) | lỗi từng ô theo `error.details[]`; **gộp mọi lỗi cùng lúc**; nút Gửi enable lại |
  | `LEAD-010` (400) | cạnh ô consent: "Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi" |
  | `LEAD-021` (429) | "Bạn đã gửi quá số lần cho phép, vui lòng thử lại sau 1 giờ"; nút Gửi disable |
  | `LEAD-030` (500) | inline/toast "Hệ thống đang bận, vui lòng thử lại"; giữ dữ liệu; Gửi enable lại |
  | honeypot ≠ rỗng | **trang cảm ơn giả** (không lộ cơ chế, không tạo lead) |
- **Thành công:** ẩn form → **trang cảm ơn** ("Cảm ơn, chúng tôi sẽ liên hệ sớm"). Lưu lead OK nhưng email lỗi → **vẫn hiện cảm ơn** (không báo lỗi khách).
- **Hình dạng dữ liệu:** tên/công ty dài → input cuộn ngang nội bộ, không vỡ layout; lời nhắn dài → textarea auto-grow tới trần rồi cuộn.
- **PDPL:** không gửi PII qua URL/query; ví dụ minh hoạ dùng dữ liệu ẩn danh.

---

## 9. SCR-05 — Đổi ngôn ngữ EN↔VI (thành phần toàn cục, canvas toggle)

**Nền tảng:** Web public · thành phần dùng chung header/footer mọi trang public · phủ FR-03.

**Component `lang-toggle`:** chip `--surface-chip` bo pill, 2 mục `VI | EN`, mục đang chọn nền cam `--color-brand` chữ trắng (đủ contrast — text ≥14/600 trên cam borderline → dùng **≥14px/700** hoặc thêm viền; xem §10) hoặc dùng underline + đậm để không phụ thuộc chỉ màu. **Mục MY ẩn** (BR-11 — không render).

**Hành vi:** đổi tiền tố URL `/vi`↔`/en`, **giữ nguyên trang hiện tại**; đang ở SCR-03 → giữ `/services/{slug}`; **đang điền form SCR-04 → giữ nguyên dữ liệu đã nhập**, chỉ đổi nhãn/thông báo.

**Trạng thái UI:** Loading chuyển trang SSR nhanh · Empty n/a · Lỗi (route locale lỗi) → giữ ngôn ngữ hiện tại · Thành công toàn trang đổi ngôn ngữ, layout không vỡ (NFR-05). Khối động thiếu bản dịch locale đang chọn → **ẩn im lặng khối đó** (BR-DYN-01), không báo lỗi khách.

---

## 10. Accessibility — WCAG 2.1 AA (định lượng, đã kiểm)

> Contrast tính theo công thức WCAG relative luminance. **Ngưỡng:** text thường ≥ **4.5:1**; text lớn (≥18px thường / ≥14px bold ≈ ≥18.66px) ≥ **3:1**; thành phần đồ hoạ/viền ≥ 3:1.

### 10.1 Bảng kiểm cặp màu chính

| Cặp màu (fg trên bg) | Tỉ lệ | Ngưỡng | Kết quả | Cách dùng |
|---|---|---|---|---|
| `#F26B21` cam trên `#FFFFFF` | **3.04:1** | 4.5 (thường) / 3 (lớn) | ✅ chỉ text LỚN · ❌ body | **KHÔNG dùng cam cho body text.** Chỉ eyebrow ≥13/600?→ xem dưới, icon, số Stat lớn, CTA lớn |
| `#FFFFFF` trắng trên `#F26B21` cam (nút) | **3.04:1** | 4.5 / 3 | ✅ text ≥18px/700 · ❌ 16px/600 | **Nút CTA cam: chữ ≥18px/700** (canvas để 16/600 = FAIL → tăng cỡ/đậm). Xem 10.2 |
| `#C9541F` (brand-hover) trên trắng | **4.41:1** | 4.5 | ❌ (thiếu 0.09) | KHÔNG dùng làm màu link tĩnh trên trắng |
| **`#C35120` (`--text-link`) trên trắng** | **4.65:1** | 4.5 | ✅ | **Màu link/text cam nhỏ trên nền trắng** (token thêm mới) |
| `#1D1D1F` ink-900 trên trắng | ~15.8:1 | 4.5 | ✅ | tiêu đề, body đậm |
| `#3A3A3C` ink-700 trên trắng | ~11.3:1 | 4.5 | ✅ | nav, label |
| `#6E6E73` ink-500 trên trắng | **5.07:1** | 4.5 | ✅ | mô tả (body) |
| `#8E8E93` ink-400 trên trắng | **3.26:1** | 4.5 | ❌ body · ✅ lớn | **chỉ text lớn/phụ trang trí** trên trắng; KHÔNG cho body |
| `#AEAEB2` ink-300 trên trắng | ~2.3:1 | 4.5 | ❌ | chỉ placeholder (miễn trừ) / mono ghi chú không thiết yếu |
| `#8E8E93` ink-400 trên `#1A1A1C` footer | **5.33:1** | 4.5 | ✅ | text phụ footer (nền tối) OK |
| trắng trên hero `#26140A` | ~17:1 | 4.5 | ✅ | hero cần **overlay/scrim tối** phủ ảnh để đảm bảo (đã có gradient overlay `#180A02`) |
| `#1E8E5A` green-600 trên trắng | ~3.9:1 | 4.5/3 | ✅ badge/large · ◐ body | badge "Hiển thị/Đã gửi" dùng **nền nhạt + chữ đậm** hoặc chấm+chữ, không chỉ màu |
| `#C0392B` red-600 trên trắng | ~5.0:1 | 4.5 | ✅ | text lỗi input |

### 10.2 Xử lý điểm FAIL (bắt buộc dev tuân)

1. **Nút CTA cam (trắng-trên-cam 3.04:1):** đặt **cỡ chữ nút ≥18px, weight 700** → đạt ngưỡng text lớn 3:1. Nếu thiết kế cần chữ nhỏ hơn trên nền cam → **đổi sang nút trắng viền cam + chữ `--text-link` `#C35120`** (đạt 4.5:1). Ghi vào component token: `--btn-primary-fg` chỉ dùng với `--btn-primary-min-size: 18px/700`.
2. **Dải CTA cam gradient [section 6]:** stop sáng `#FFA765` — **trắng trên `#FFA765` chỉ 1.92:1 (FAIL cả 3:1)**. Do đó: (a) **nút trên dải CTA dùng nút TRẮNG nền, chữ `#C35120`** (không phải chữ trắng trên gradient); (b) tiêu đề "Sẵn sàng chuyển đổi…" nếu để chữ trắng phải **đặt trên vùng gradient tối (`#F26B21` đầu dải)** hoặc dùng chữ `--text-primary` ink-900; (c) hoặc phủ overlay tối nhẹ dưới chữ. **KHÔNG để chữ trắng trên phần `#FFA765`.**
3. **Link cam nhỏ / eyebrow:** eyebrow 13px/600 màu cam `#F26B21` (3.04:1) — 13px/600 **không đạt "text lớn"** → **đổi eyebrow sang `#C35120`** (4.65:1) hoặc tăng lên ≥18px. Đề xuất: eyebrow dùng `--text-link` `#C35120`.
4. **Không truyền nghĩa chỉ bằng màu:** badge trạng thái (Nháp/Hiển thị/Ẩn; Mới/Đã xem; email Đã gửi/Thất bại) luôn **kèm chữ** (+ icon/chấm), không chỉ khác màu. Lỗi form luôn có **dòng chữ lỗi**, không chỉ viền đỏ.

### 10.3 Khác

- **Touch target ≥ 44×44px** cho mọi nút/chip/hàng bấm được (nút pill tăng padding dọc đủ 44; hàng lead/khối admin cao ≥44).
- **Focus nhìn thấy:** vòng `--focus-ring` cam 2px + offset 2px trên mọi element tương tác (input, nút, link, toggle, hàng bảng) — không tắt outline.
- **Label:** mọi input có `<label>` thật (không chỉ placeholder); honeypot có label ẩn hợp lệ.
- **Alt ảnh:** hero-city/hero-yangon = alt mô tả ("Thành phố Yangon về đêm"); logo Mytel alt "Mytel B2B"; icon Material Symbols trang trí = `aria-hidden`; logo Partner (khối động) = alt = tên đối tác.
- **`prefers-reduced-motion: reduce`:** **tắt toàn bộ** keyframes (`mt-sweep/mt-bar/mt-ring/mt-halo/mt-scan/mt-blink/mt-spin/mt-float`), hover `translateY`, shimmer skeleton, smooth-scroll → chuyển tức thời. Bắt buộc.
- **Font scale hệ thống:** dùng `rem`/`clamp`, layout không vỡ khi phóng 200%.

---

## 11. Component & animation (danh mục thống nhất tên)

### 11.1 Danh mục component (dev đặt trong `shared/ui`)

| Component | States | Nơi dùng |
|---|---|---|
| `Button` (primary/secondary/ghost) | default·hover·focus·pressed·disabled·loading | mọi CTA |
| `LangToggle` | default·selected·focus | header/footer (SCR-05) |
| `ServiceGroupCard` | default·hover(translateY-4+viền cam+shadow)·focus | SCR-01/02 |
| `ServiceChip` | default·hover·focus | card dịch vụ |
| `IndustryCard` | default·hover(halo)·focus | SCR-01 industries |
| `StatItem` | default | Why Mytel / khối động Stat |
| `FormField` (input/select/textarea/checkbox) | default·focus·error·disabled | SCR-04, SCR-06, SCR-08 |
| `Toast` | success·error·info | admin thao tác |
| `Badge` | visible·draft·hidden / new·viewed / sent·failed·pending | SCR-07/09 |
| `SkeletonRow` / `SkeletonCard` | — | loading admin/khối động |
| `EmptyState` | — | SCR-07/09 (icon + thông điệp + hành động) |
| `ConfirmDialog` | — | xóa khối SCR-07 |
| `AdminTable` | loading·empty·error·data | SCR-07/09 |
| `AdminNav` (SHELL) | — | vỏ admin |

### 11.2 Animation (mô tả: cái gì · thời lượng · easing — đều tắt khi reduced-motion)

| Keyframe | Tác dụng | Thời lượng / easing (đề xuất) |
|---|---|---|
| `mt-sweep` | vệt sáng quét trên card khi hover | 600ms ease-out |
| `mt-bar` | cột sóng viz Connectivity | 1.2s ease-in-out vô hạn |
| `mt-ring` / `mt-halo` | vòng lan viz ICT / halo industry | 2s ease-out vô hạn |
| `mt-scan` | quét viz Mobile | 1.5s linear vô hạn |
| `mt-blink` | nhấp nháy chấm trạng thái | 1s step vô hạn |
| `mt-spin` | spinner nút loading | 0.8s linear vô hạn |
| `mt-float` | trôi nhẹ phần tử hero | 4s ease-in-out vô hạn |
| Hover card | `translateY(-4px)` + viền cam + `--mt-shadow-card-hover` | 180ms ease-out |

---

## 12. Admin CMS-lite (SCR-06..09 + SHELL-ADMIN — BỔ SUNG, cùng token)

> **Phong cách quản trị gọn:** dùng lại toàn bộ token §2; layout tối giản, ưu tiên bảng + form. Không viz trang trí. Nền `--surface-page` trắng, thanh nav trái/trên, khối nội dung `--surface-card`.

### 12.1 SHELL-ADMIN (vỏ)

```
┌───────────────────────────────────────────────────────────┐
│ [mytel B2B Admin]     Khối nội dung | Lead      admin@… ▾  │  top-nav (z-sticky)
│                                                 (Đăng xuất)│
├───────────────────────────────────────────────────────────┤
│  «nội dung màn con SCR-07 / SCR-08 / SCR-09»               │
└───────────────────────────────────────────────────────────┘
```
- Nút "Đăng xuất" → `POST /api/auth/signout` → SCR-06. Hết phiên 30' → `AUTH-020` → chuyển SCR-06. Hiển thị email admin (E-03). FR-18 audit ghi ngầm (không màn).
- **Phân quyền:** chỉ A-02 đã xác thực; `/admin/*` chặn bởi middleware (visitor → SCR-06).

### 12.2 SCR-06 — Đăng nhập

```
┌──────────────── giữa màn, card 400px ────────────────┐
│            [mytel B2B Admin]                          │
│  [ Email * ................................. ]        │
│  [ Mật khẩu * ....................... 👁 ]           │  toggle hiện/ẩn
│  ( Đăng nhập )                                        │  disable+spinner khi gửi
│  ⚠ Email hoặc mật khẩu không đúng   (alert chung)     │  vùng lỗi (không nói trường nào)
└──────────────────────────────────────────────────────┘
```
- **Trạng thái/lỗi:** Loading (nút spinner) · lỗi `AUTH-001` "Email hoặc mật khẩu không đúng" (chung, không tiết lộ trường) · `AUTH-010` (423) "Tài khoản tạm khóa, thử lại sau 15 phút". Không màn đăng ký admin (E-03, seed AS-14). Thành công → SCR-07.

### 12.3 SCR-07 — Danh sách khối động

```
┌───────────────────────────────────────────────────────────────────┐
│ Khối nội dung    [Loại ▾][Trạng thái ▾]           ( + Tạo khối )    │  filter + CTA
├───────────────────────────────────────────────────────────────────┤
│ Loại      | Tiêu đề/Tên   | Trạng thái | Thứ tự | Cập nhật | Thao tác│  AdminTable
│ Highlight | DIA mới       | ●Hiển thị  |  ⇅ 0   | 09-04    |Sửa Tắt Xóa│
│ Partner   | Ngân hàng ABC | ●Nháp      |  ⇅ 1   | 09-03    |Sửa Bật Xóa│
│ Stat      | 1.200+ KH DN  | ●Ẩn        |  ⇅ 2   | 09-02    |Sửa Bật Xóa│
└───────────────────────────────────────────────────────────────────┘
```
- **Badge trạng thái:** ●Hiển thị (`--badge-visible` xanh + chữ) · ●Nháp (`--badge-draft` amber) · ●Ẩn (`--badge-hidden` xám) — luôn kèm chữ.
- **Nút theo trạng thái (bám ma trận E-02 FSD):** "Bật hiển thị" hiện khi `Nháp`/`Ẩn`; "Tắt hiển thị" hiện khi `Hiển thị`; "Sửa" ẩn với `Đã xóa`; "Xóa" mở `ConfirmDialog` → soft-delete. Thứ tự: input số ≥0 hoặc kéo-thả (`PATCH reorder`).
- **4 trạng thái UI:** **Loading** SkeletonRow · **Empty** "Chưa có khối nội dung nào" + nút "Tạo khối" (không bảng rỗng) · **Lỗi** "Không tải được, thử lại" + retry · **Thành công** bảng + toast sau thao tác. **Lỗi nghiệp vụ:** bật khi thiếu EN → `CB-010` "Cần đủ trường tiếng Anh bắt buộc trước khi hiển thị" (chặn, giữ trạng thái); `CB-404` "Không tìm thấy nội dung".
- **Hình dạng dữ liệu:** rỗng (empty-state) · 1 khối · nhiều (phân trang 20/trang, api-spec) · tiêu đề dài (ellipsis, tooltip).

### 12.4 SCR-08 — Thêm/Sửa khối (3 loại, đa ngữ)

```
┌───────────────────────────────────────────────────────────┐
│ [Loại khối ▾: Highlight/Đối tác/Con số]  (khóa khi Sửa)    │
│ [ Tab: EN | VI ]   (EN bắt buộc · VI khuyến nghị)          │
│ ── theo loại ──                                            │
│ Highlight: Tiêu đề* / Mô tả ngắn* / Ảnh(≤2MB) / Link       │
│ Đối tác:  Tên đối tác* / Logo*(≤1MB) / Link                │
│ Con số:   Nhãn* / Giá trị*(regex) / Đơn vị                 │  KHÔNG ô doanh thu (BR-STAT-01)
│ Thứ tự* [ 0 ]                                              │
│ ( Lưu nháp )  ( Lưu & Bật hiển thị )  ( Hủy )              │
└───────────────────────────────────────────────────────────┘
```
- **Tab EN/VI:** nhập song ngữ; thiếu VI → khối ẩn ở VI (BR-DYN-01). Upload có xem trước.
- **Lỗi:** `CB-001` (400) lỗi từng ô theo `details[]` (giữ dữ liệu); "Lưu & Bật hiển thị" thiếu EN → `CB-010` (422) chặn bật, đã lưu `Nháp` nếu phần còn lại hợp lệ; không sửa khối `Đã xóa`.
- **4 trạng thái UI:** **Loading** (Sửa) skeleton form + nút Lưu spinner · **Empty** (Tạo) form trống, thứ tự mặc định cuối · **Lỗi** lỗi từng ô / toast lưu lỗi · **Thành công** toast "Đã lưu"/"Đã bật hiển thị" → SCR-07.

### 12.5 SCR-09 — Danh sách + chi tiết lead (đọc)

```
┌───────────────────────────────────────────────────────────────────┐
│ Lead   [Trạng thái ▾][Ngày ▾][Dịch vụ ▾]                          │  filter
├───────────────────────────────────────────────────────────────────┤
│ Thời điểm | Họ tên | Doanh nghiệp | Dịch vụ | TT | Email          │  AdminTable
│ 09-04 08:15│Le Van A│Cong ty A    │ DIA     │●Mới│●Đã gửi ──► [mở]  │  bấm hàng → panel
│ …                                                                  │  phân trang 20/trang
├──────────────────────────────┬────────────────────────────────────┤
│ (danh sách)                  │ CHI TIẾT LEAD (panel/trang)         │
│                              │ Họ tên · Email · SĐT · DN · Dịch vụ │  đủ trường
│                              │ Lời nhắn · Thời điểm · Ngôn ngữ      │
│                              │ Consent: ✓ v1 · 09-04 08:15         │
│                              │ (KHÔNG nút Sửa/Xóa — BR-18 chỉ đọc) │
└──────────────────────────────┴────────────────────────────────────┘
```
- Mở lead `Mới` → tự đánh dấu `Đã xem` (badge đổi; `GET /api/admin/leads/{id}` đánh dấu trong cùng lời gọi). **Không nút Sửa/Xóa** (MVP chỉ đọc — BR-18).
- **4 trạng thái UI:** **Loading** SkeletonRow · **Empty** DB rỗng → "Chưa có lead nào — lead từ form sẽ hiện ở đây" (không bảng/không phân trang/không nút hàng); lọc rỗng → "Không có lead khớp bộ lọc" + nút "Xóa lọc" · **Lỗi** "Không tải được danh sách lead, thử lại" + retry · **Thành công** danh sách + panel chi tiết.
- **Hình dạng dữ liệu:** rỗng (empty-state) · 1 lead · nhiều (phân trang) · tên/công ty dài (ellipsis cột, đầy đủ ở panel). PII chỉ hiện cho admin đã xác thực; không đưa PII vào URL/log (NFR-04).

---

## 13. Bản đồ asset

> **Trạng thái asset (2026-09-04):** asset trong project Claude Design **kéo được qua DesignSync khi vào B4** — chưa có bản local trong repo. Dev tham chiếu theo tên dưới; số/nội dung thật **CHỜ ASSET** — **không bịa**.

| Mã | Asset | Trạng thái | Dùng ở |
|---|---|---|---|
| AS-01 | `assets/mytel-mark-white.png` (logo mark trắng trong ô bo góc nền cam) | có (DesignSync B4) | header, footer, admin nav |
| AS-03 | `assets/hero-city.png` · `hero-yangon.png` · `hero-yangon-crop.png` | có (DesignSync B4) | hero [2], chú thích CTA band [6] |
| — | Icon **Material Symbols Outlined** (`language`, `cloud`, `sim_card`, industry icons…) | web font | Solutions/Industries/UI |
| **AS-04** | Số "Độ tin cậy mạng" / "Trung tâm dữ liệu" | **CHỜ ASSET** — hiển thị "—" đến khi có | Why Mytel [5] |
| **AS-07** | Nội dung văn bản consent PDPL (Legal/DPO duyệt) + `consentTextVersion` | **CHỜ ASSET** | ô consent SCR-04 |
| **AS-08** | Hotline / email Sale + số "Hỗ trợ doanh nghiệp" | **CHỜ ASSET** | section 6/7, Why Mytel |
| **AS-13** | Số "Khách hàng doanh nghiệp" | **CHỜ ASSET** — hiển thị "—" | Why Mytel [5] |
| AS-14 | Tài khoản admin seed | có (seed backend) | SCR-06 |
| — | Logo/ảnh khối động (Highlight/Partner) | do Admin upload runtime | SCR-01 khối động |

**Số duy nhất chốt được (không chờ asset):** `18` = tổng dịch vụ B2B (3 nhóm 7+8+3) — đã có trong catalog. 4 con số còn lại của Why Mytel hiển thị **placeholder "—"** cho tới khi anh Bryan cấp (AS-04/08/13).

---

## 14. Ghi chú khớp token dev (handoff)

- **Token = CSS variables:** dev Next.js khai lớp primitive `--mt-*` trong `globals.css`/`tokens.css`, lớp semantic + component map theo §2.2/§2.3. **Component chỉ dùng biến semantic/component, không dùng primitive trực tiếp.** Đổi nhận diện = sửa `--mt-*`.
- **Spacing/radius/typography:** dùng đúng thang token §2 (không số lẻ tuỳ hứng). Breakpoint là token (`768`/`1024`).
- **Microcopy:** mọi chuỗi qua **i18n key** (next-intl) — thiết kế không chốt chuỗi cứng; thông điệp lỗi lấy đúng cột message api-spec §3.
- **Điều kiện hiển thị theo quyền:** public không có element admin; admin ẩn/hiện nút theo ma trận trạng thái×hành động E-01/E-02/E-03 (FSD §4b) — đã phản ánh ở §12.
- **Đặt tên component:** thống nhất §11.1 (dev `shared/ui`) — một thứ không hai tên.

---

## 15. Đối chiếu (design ↔ FSD ↔ api-spec)

| Hạng mục | design.md | FSD | api-spec | Kết luận |
|---|---|---|---|---|
| Số màn | 9 SCR + SHELL | 9 SCR + SHELL | — | ✅ khớp |
| Trường form lead | `contactName/email/phone/companyName/serviceInterest/message/consent` + honeypot `website` | idem | idem §3.1 | ✅ khớp canonical |
| Mã lỗi hiển thị | LEAD-001/010/021/030 · AUTH-001/010/020 · CB-001/010/404 | idem | idem | ✅ khớp |
| Ẩn Price Policy (SCR-03) | ✓ (thay bằng CTA) | ✓ (Q3) | — | ✅ khớp |
| Ẩn doanh thu (Stat) | ✓ không ô doanh thu | ✓ BR-STAT-01 | ✓ | ✅ khớp |
| Toggle VI/EN, MY ẩn | ✓ VI mặc định, MY ẩn | ✓ BR-11 | — | ✅ khớp |
| Honeypot 200 giả | ✓ trang cảm ơn giả | ✓ | ✓ §3.1 | ✅ khớp |
| Prefill dịch vụ CTA SCR-03→04 | ✓ | ✓ FR-06 | — | ✅ khớp |

**Điểm lệch / cần lưu ý (không phải mâu thuẫn chặn):**
1. **Tên nhóm dịch vụ:** canvas anh Bryan ghi **"MOBILE" (3) / "ICT SOLUTIONS" (8)**; FSD/SRS ghi **"Mobile ICT" (3) / "ICT Service" (8)**. Số lượng khớp (7/8/3=18) nhưng **nhãn hiển thị khác chữ**. → **Đề xuất:** dùng nhãn canvas cho UI ("Connectivity / ICT Solutions / Mobile"), giữ mã slug/nhóm nội bộ theo LLD. **Chờ anh Bryan/BA chốt nhãn hiển thị cuối** để i18n key thống nhất.
2. **Màu trạng thái admin (green/red/amber):** thêm ngoài palette cam–xám của canvas (canvas không phủ admin). Đã chọn tối thiểu + đạt contrast. **Chờ anh Bryan xác nhận** có chấp nhận mở rộng palette cho admin.
3. **WCAG nút cam:** canvas để trắng-trên-cam 16px/600 (**FAIL 4.5:1, chỉ 3.04:1**). Đã xử lý: nút CTA **chữ ≥18px/700** (đạt 3:1 text lớn) hoặc chuyển nút trắng-viền + chữ `#C35120`. Dải CTA gradient: **không để chữ trắng trên stop sáng `#FFA765`** (1.92:1). Cần anh Bryan duyệt điều chỉnh cỡ/kiểu nút so với canvas.
4. **Eyebrow cam `#F26B21` 13px/600:** không đạt "text lớn" → đổi sang `--text-link` `#C35120` (4.65:1). Thay đổi thị giác nhỏ so với canvas — cần biết anh Bryan có chấp nhận.
5. **Số Why Mytel:** 4/5 con số **CHỜ ASSET** (AS-04/08/13) — hiển thị "—", không bịa số Mytel.

**Mâu thuẫn chặn:** không có. Mọi điểm lệch là nhãn hiển thị / mở rộng palette admin / điều chỉnh WCAG — SRS/FSD/api-spec vẫn thắng về hành vi & hợp đồng.

---

## ✅ Checklist design.md (GATE-3)

- [x] Token 3 lớp (primitive→semantic→component) đủ 6 nhóm (màu·typography·spacing·radius·shadow·z-index); tên semantic thống nhất; dark mode = bộ token (sẵn sàng, MVP light); không màu/cỡ lạc ngoài token.
- [x] Bám theme kit anh Bryan (source-notes): map token kit → dự án; ghi rõ màn lấy từ canvas / màn vẽ mới (SCR-03 + admin).
- [x] Mỗi màn đủ 4 trạng thái UI (loading skeleton / empty / lỗi+retry / thành công) + hình dạng dữ liệu (rỗng/1/nhiều/tràn); empty-state landing (FR-01) + lead rỗng/lọc rỗng (FR-11).
- [x] Component đủ states (default/hover/focus/disabled/error/loading); danh mục component thống nhất tên (§11).
- [x] Breakpoint là token; hành vi responsive từng màn Web; nền tảng khớp FSD.
- [x] WCAG AA định lượng: đã tính contrast từng cặp (§10), nêu rõ FAIL + cách xử lý; `prefers-reduced-motion` bắt buộc; touch ≥44; label đủ; alt ảnh; không truyền nghĩa chỉ bằng màu.
- [x] Handoff: spacing theo thang token, microcopy i18n key, hiển thị theo quyền bám ma trận E-0x; ma trận màn↔FR khớp FSD (§3).
- [x] Đối chiếu design↔FSD↔api-spec (§15); điểm lệch ghi rõ, không mâu thuẫn chặn.
- [x] Đã xóa khối 💡/📝 của template.
