// ServiceCatalogLoader (G2) — listByGroup(locale), getBySlug(slug, locale).
// Fallback VI→EN từng trường (FR-05 1b): thiếu bản dịch một trường → dùng EN cho trường đó, KHÔNG ẩn trang.
import { ALL_SERVICES, GROUP_ORDER } from '@/content/services';
import type {
  ServiceDoc,
  ServiceGroup,
  ServiceLocale,
  ServiceView,
} from '@/content/services/types';

function toView(doc: ServiceDoc, locale: ServiceLocale): ServiceView {
  const en = doc.i18n.en;
  const vi = doc.i18n.vi ?? {};
  const pick = (field: keyof ServiceView) => {
    if (field === 'slug' || field === 'group' || field === 'order') return '';
    if (locale === 'vi') {
      const v = vi[field as keyof typeof vi];
      if (typeof v === 'string' && v.trim() !== '') return v;
    }
    return en[field as keyof typeof en] as string;
  };
  return {
    slug: doc.slug,
    group: doc.group,
    order: doc.order,
    name: pick('name'),
    whatIs: pick('whatIs'),
    advantage: pick('advantage'),
    targetCustomer: pick('targetCustomer'),
    targetSale: pick('targetSale'),
    deliveryTimeline: pick('deliveryTimeline'),
  };
}

export interface ServiceGroupView {
  group: ServiceGroup;
  services: ServiceView[];
}

/** 18 dịch vụ chia 3 nhóm theo thứ tự hiển thị (Connectivity · ICT Solutions · Mobile). */
export function listByGroup(locale: ServiceLocale): ServiceGroupView[] {
  return GROUP_ORDER.map((group) => ({
    group,
    services: ALL_SERVICES.filter((s) => s.group === group)
      .sort((a, b) => a.order - b.order)
      .map((s) => toView(s, locale)),
  }));
}

/** Toàn bộ 18 dịch vụ phẳng (đã đổ locale). */
export function listAll(locale: ServiceLocale): ServiceView[] {
  return listByGroup(locale).flatMap((g) => g.services);
}

/** 1 dịch vụ theo slug; null nếu slug không thuộc danh mục (FR-05 1a → notFound()). */
export function getBySlug(slug: string, locale: ServiceLocale): ServiceView | null {
  const doc = ALL_SERVICES.find((s) => s.slug === slug);
  return doc ? toView(doc, locale) : null;
}
