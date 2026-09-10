import type { ReactNode, SVGProps } from 'react';

/**
 * Icon — bộ icon vector (inline SVG) dùng chung, thay cho emoji/ký tự trang trí.
 * Nét đồng nhất (viewBox 24, stroke currentColor) → tự lấy màu theo context
 * (vd trong .iconBox nhận var(--color-brand)). Không phụ thuộc font/CDN ngoài (CSP chặn).
 * Mặc định aria-hidden (trang trí); truyền `title` để có nhãn khi icon mang nghĩa.
 */
export type IconName =
  // Nhóm dịch vụ (Solutions)
  | 'connectivity'
  | 'ict_service'
  | 'mobile_ict'
  // Theo ngành (Industries)
  | 'carrier'
  | 'banking'
  | 'enterprise'
  | 'manufacturing'
  | 'hospitality'
  | 'retail'
  // Tiện ích
  | 'check'
  | 'arrow_right'
  | 'menu'
  | 'close';

const PATHS: Record<IconName, ReactNode> = {
  // Globe + lưới kinh/vĩ tuyến → kết nối (connectivity)
  connectivity: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </>
  ),
  // Đám mây → dịch vụ ICT/cloud
  ict_service: (
    <path d="M7 18h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.8-1A3.5 3.5 0 0 0 7 18Z" />
  ),
  // SIM card → mobile ICT
  mobile_ict: (
    <>
      <path d="M8 3h5l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <rect x="9" y="12" width="6" height="6" rx="1" />
      <path d="M12 12v6M9 15h6" />
    </>
  ),
  // Trạm phát sóng → nhà mạng & ISP
  carrier: (
    <>
      <path d="M12 10v11" />
      <path d="M8.5 21 12 12l3.5 9" />
      <path d="M7 8a7 7 0 0 1 10 0M9.4 10.4a3.5 3.5 0 0 1 5.2 0" />
    </>
  ),
  // Toà nhà cột → ngân hàng & tài chính
  banking: (
    <>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
      <path d="M3 21h18" />
    </>
  ),
  // Toà văn phòng → doanh nghiệp
  enterprise: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  // Nhà máy → sản xuất
  manufacturing: (
    <>
      <path d="M4 21V11l5 3V11l5 3V8l6 3v9Z" />
      <path d="M4 21h16" />
    </>
  ),
  // Tách cà phê → khách sạn & F&B
  hospitality: (
    <>
      <path d="M6 8h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2 2 0 0 1 0 4H17" />
      <path d="M8 3v2M11 3v2M14 3v2" />
      <path d="M5 21h13" />
    </>
  ),
  // Túi mua sắm → bán lẻ
  retail: (
    <>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow_right: <path d="M4 12h15m-6-6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6 18 18M18 6 6 18" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** px, mặc định 24 */
  size?: number;
  /** Nhãn có nghĩa (bỏ trống = trang trí, aria-hidden). */
  title?: string;
}

export function Icon({ name, size = 24, title, className, ...rest }: IconProps) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
