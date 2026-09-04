// Kiểu dữ liệu Service catalog (G2) — 18 dịch vụ trong repo (LLD §3, E-04).
// 8 trường nguồn Excel; public hiển thị 7 (ẩn pricePolicy — FR-05/Q3).

export type ServiceGroup = 'connectivity' | 'ict_service' | 'mobile_ict';

export const SERVICE_LOCALES = ['en', 'vi'] as const;
export type ServiceLocale = (typeof SERVICE_LOCALES)[number];

/** 7 trường hiển thị public + pricePolicy nội bộ (chỉ EN, không render). */
export interface ServiceI18nFields {
  name: string;
  whatIs: string;
  advantage: string;
  targetCustomer: string;
  targetSale: string;
  deliveryTimeline: string;
  /** Nội bộ — KHÔNG render public (FR-05 ẩn). Chỉ có ở EN. */
  pricePolicy?: string;
}

export interface ServiceDoc {
  slug: string;
  group: ServiceGroup;
  order: number;
  i18n: {
    en: ServiceI18nFields;
    vi?: Partial<ServiceI18nFields>;
  };
}

/** View-model đã đổ theo locale (fallback VI→EN từng trường — FR-05 1b). 7 trường public. */
export interface ServiceView {
  slug: string;
  group: ServiceGroup;
  order: number;
  name: string;
  whatIs: string;
  advantage: string;
  targetCustomer: string;
  targetSale: string;
  deliveryTimeline: string;
}

/** Thứ tự hiển thị 3 nhóm trên UI (bám canvas: Connectivity · ICT Solutions · Mobile). */
export const GROUP_ORDER: ServiceGroup[] = ['connectivity', 'ict_service', 'mobile_ict'];
