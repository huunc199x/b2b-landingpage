# ĐÁNH GIÁ KỸ THUẬT — Solution Architect (pre-HLD)

> Dự án: Landing page dịch vụ B2B Mytel (18 dịch vụ, style tham chiếu event-landingpage). Giai đoạn ĐÁNH GIÁ — chưa phải HLD/LLD/techstack đầy đủ.
> Ngày: 2026-09-02. Người đánh giá: SA. Mọi điểm chưa chốt nêu dưới dạng **giả định** + **câu hỏi cho anh Bryan**.

## 1. Phân loại hệ thống
Đây **chủ yếu là site marketing/tĩnh (content-driven), KHÔNG phải app nghiệp vụ**. Lập luận:
- Nội dung 18 dịch vụ là **dữ liệu đọc-nhiều-ghi-ít**, cấu trúc đồng nhất (Tên · Nhóm · What is · Advantage · Target · Timeline · Price). Không có quy trình nghiệp vụ, không giao dịch, không đăng nhập người dùng cuối.
- Trang tham chiếu là landing sự kiện thiên hiệu ứng cuộn + CTA đăng ký — thuộc nhóm **lead-gen**, không phải hệ thống có backend nghiệp vụ.
- **Backend duy nhất cần** (nếu bật form lead): một endpoint nhận & lưu lead. Đây là "backend mỏng", không đổi bản chất tĩnh của site.
- **Kết luận:** SSG/tĩnh + backend mỏng cho form. Không cần microservices, không cần DB nghiệp vụ nặng.

## 2. Các phương án kiến trúc (đánh đổi)

| PA | Mô tả | Ưu | Nhược |
|----|-------|----|-------|
| **(a) SSG thuần** | Next.js (`output: export`) hoặc Astro build tĩnh → CDN. Nội dung đặt trong file (JSON/MDX) trong repo. Form lead qua dịch vụ ngoài (Formspree/Google Form/API mỏng serverless). | Rẻ nhất, nhanh nhất, bảo mật cao (không server-side), hiệu năng/SEO tốt, hợp animation-heavy. | Sửa nội dung phải qua dev + deploy lại (không có admin UI). Người marketing không tự cập nhật giá/dịch vụ được. |
| **(b) Next.js SSR/ISR + Headless CMS** | Next.js render nội dung 18 dịch vụ từ CMS (Strapi/Payload/Sanity/Contentful). ISR để cache. | Marketing tự sửa nội dung + đa ngôn ngữ qua CMS; cấu trúc 18 dịch vụ hợp mô hình content-type. | Thêm hạ tầng (CMS + DB + hosting Node), chi phí & vận hành cao hơn hẳn nhu cầu thực; overkill nếu nội dung ít khi đổi. |
| **(c) SPA (Vite/React) + Headless CMS** | Client render, gọi CMS qua API. | Tách FE/BE rõ; linh hoạt. | SEO/first-paint kém hơn SSG/SSR (xấu cho landing marketing cần Google index + share OG); vẫn cần CMS như (b). Ít phù hợp nhất. |

**Bối cảnh 18 dịch vụ, EN/VI/MY, cập nhật nội dung:** số trang nhỏ và cố định (18), cập nhật **không thường xuyên như tin tức** (giá/timeline đổi theo đợt, không hàng ngày). Vì vậy chi phí CMS của (b)/(c) khó biện minh ở MVP.

## 3. Khuyến nghị
**Chọn (a) SSG thuần — Next.js `export` (hoặc Astro) + nội dung dạng MDX/JSON trong repo + form lead qua serverless function mỏng.**
Lý do: đúng bản chất tĩnh, ra MVP nhanh nhất, rẻ và an toàn nhất, SEO/animation tốt. Cấu trúc dữ liệu 18 dịch vụ đưa vào file cấu trúc (i18n-friendly) để nếu sau này nhu cầu tự-sửa tăng thì **nâng cấp lên (b)** bằng cách thay nguồn dữ liệu — không phải viết lại. Đề xuất kiến trúc thông tin: **1 landing tổng gom theo 3 nhóm (A/B/C) + 18 khối/anchor chi tiết** (hoặc 18 trang con `/services/[slug]` tận dụng SSG) — tránh làm 18 landing rời.

## 4. Đa ngôn ngữ (i18n) EN/VI/MY
- **Xử lý:** routing theo locale (`/en`, `/vi`, `/my`) — Next.js i18n routing hoặc `next-intl`/Astro i18n. Nội dung tách theo file per-locale; 18 dịch vụ có bản dịch song song.
- **Ảnh hưởng kiến trúc:** nhân 3 nội dung → SSG sinh 3 bộ trang tĩnh (chấp nhận được với 18 mục). **Rủi ro chữ Myanmar:** cần font Unicode Myanmar chuẩn (Noto Sans Myanmar), tránh font Zawgyi; kiểm shaping ký tự + xuống dòng. Nội dung Excel hiện **chỉ có tiếng Anh** → thiếu bản dịch VI/MY là hạng mục nội dung, không phải kỹ thuật.
- **Giả định:** MVP có thể ra trước bằng **EN**, VI/MY bật sau khi có bản dịch (kiến trúc chuẩn bị sẵn i18n từ đầu).

## 5. Nếu bật form lead
- **Backend tối thiểu:** một serverless function (Vercel/Cloudflare Function) + 1 bảng lưu lead (Postgres/Supabase, hoặc thậm chí Google Sheet/CRM webhook cho MVP). Trường: tên công ty, người liên hệ, email/phone, dịch vụ quan tâm, message, consent, timestamp, nguồn.
- **Chống spam:** honeypot + rate-limit + CAPTCHA (hCaptcha/Cloudflare Turnstile — ưu tiên Turnstile vì nhẹ, thân thiện). Xác thực server-side, không tin client.
- **PDPL (Myanmar) / bảo vệ dữ liệu:** thu tối thiểu, có **checkbox đồng ý (consent)** + link chính sách quyền riêng tư, ghi log consent, mã hoá at-rest/in-transit (HTTPS), giới hạn quyền truy cập lead, có cơ chế xoá theo yêu cầu. Không đặt PII trên URL. Nếu đẩy lead sang CRM/bên thứ ba → nêu rõ trong chính sách.

## 6. Ước lượng thô effort MVP (S/M/L)
| Khối | Effort | Ghi chú |
|------|--------|---------|
| Setup dự án + design system (màu cam Mytel, typo, token) | **S** | |
| Layout landing + section (Hero/Why/Coverage/Capabilities/Register) | **M** | bám style tham chiếu |
| Animation scroll-reveal | **M** | rủi ro hiệu năng mobile |
| Nội dung 18 dịch vụ (data-driven, template) | **M** | phụ thuộc chất lượng nội dung/hình ảnh |
| i18n EN/VI/MY | **M** | EN trước = **S**; thêm VI/MY = **M** (chủ yếu chờ bản dịch) |
| Form lead + backend mỏng + chống spam + PDPL | **S–M** | |
| **Tổng MVP (EN, có form)** | **~M** | ra nhanh nếu nội dung sẵn sàng |

**Rủi ro kỹ thuật lớn nhất:** *không phải code mà là NỘI DUNG & ĐA NGÔN NGỮ.* Cụ thể (1) thiếu asset hình ảnh/giá/testimonial và bản dịch VI/MY (Excel mới có EN) → chặn tiến độ; (2) font/hiển thị tiếng Myanmar (Unicode vs Zawgyi) dễ vỡ chữ; (3) animation-heavy có thể tụt hiệu năng/LCP trên mobile nếu lạm dụng.

## 7. Câu hỏi version/tech cần anh Bryan xác nhận (giả định nếu không phản hồi)
1. **Framework:** đồng ý **Next.js (SSG/export)** như trang tham chiếu? *(giả định: có)* — hay Astro cho landing thuần tĩnh? Version: **Next.js 15 + Node 22 LTS** *(giả định)*.
2. **CMS:** MVP **không dùng CMS** (nội dung trong repo), nâng cấp sau? *(giả định: không CMS ở MVP)*
3. **Form lead:** có bật ở MVP không? Lead đẩy về đâu (DB / email / CRM Mytel)? Cần **consent PDPL**?
4. **Hosting:** Vercel/Cloudflare (nhanh) hay **phải on-prem/hạ tầng Mytel**? *(ảnh hưởng lớn tới lựa chọn SSG vs serverless — giả định: được dùng CDN ngoài)*
5. **Ngôn ngữ MVP:** ra **EN trước**, VI/MY sau khi có bản dịch? *(giả định: có)*
6. **Kiến trúc thông tin:** 1 landing + 18 anchor theo 3 nhóm, hay 18 trang con `/services/[slug]`? *(đề xuất: trang con SSG)*
