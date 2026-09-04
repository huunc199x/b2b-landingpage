// Đăng ký 18 dịch vụ (G2) + validate build-time (LLD §3.
// Kiểm đủ 18 slug duy nhất, mỗi slug có đủ 7 trường EN bắt buộc; slug không thuộc danh mục → 404 (FR-05 1a).
import type { ServiceDoc, ServiceGroup } from './types';
import { GROUP_ORDER } from './types';

import aiCamera from './ai-camera.json';
import bulkSms from './bulk-sms.json';
import cloud from './cloud.json';
import colocation from './colocation.json';
import crossConnection from './cross-connection.json';
import darkFiber from './dark-fiber.json';
import dia from './dia.json';
import dplc from './dplc.json';
import ekyc from './ekyc.json';
import ipTransit from './ip-transit.json';
import iplc from './iplc.json';
import ipvpn from './ipvpn.json';
import m2m from './m2m.json';
import penetrationTesting from './penetration-testing.json';
import restaurantManagement from './restaurant-management.json';
import securityEndpoint from './security-endpoint.json';
import soc from './soc.json';
import vbot from './vbot.json';

const RAW: unknown[] = [
  dia, dplc, iplc, ipvpn, ipTransit, darkFiber, crossConnection, // connectivity (7)
  cloud, colocation, ekyc, restaurantManagement, securityEndpoint, penetrationTesting, soc, aiCamera, // ict_service (8)
  m2m, bulkSms, vbot, // mobile_ict (3)
];

const REQUIRED_EN: (keyof ServiceDoc['i18n']['en'])[] = [
  'name', 'whatIs', 'advantage', 'targetCustomer', 'targetSale', 'deliveryTimeline',
];

function validate(list: ServiceDoc[]): void {
  if (list.length !== 18) {
    throw new Error(`[service-catalog] Phải đủ 18 dịch vụ, hiện ${list.length}`);
  }
  const slugs = new Set<string>();
  for (const s of list) {
    if (slugs.has(s.slug)) throw new Error(`[service-catalog] Slug trùng: ${s.slug}`);
    slugs.add(s.slug);
    if (!GROUP_ORDER.includes(s.group)) {
      throw new Error(`[service-catalog] Nhóm không hợp lệ ở ${s.slug}: ${s.group}`);
    }
    for (const f of REQUIRED_EN) {
      const v = s.i18n?.en?.[f];
      if (typeof v !== 'string' || v.trim() === '') {
        throw new Error(`[service-catalog] Thiếu trường EN bắt buộc "${String(f)}" ở ${s.slug}`);
      }
    }
  }
  // Số lượng theo nhóm (7/8/3) — bám brief/decisions.
  const counts: Record<ServiceGroup, number> = { connectivity: 0, ict_service: 0, mobile_ict: 0 };
  for (const s of list) counts[s.group]++;
  if (counts.connectivity !== 7 || counts.ict_service !== 8 || counts.mobile_ict !== 3) {
    throw new Error(`[service-catalog] Sai số lượng nhóm: ${JSON.stringify(counts)} (cần 7/8/3)`);
  }
}

export const ALL_SERVICES: ServiceDoc[] = (RAW as ServiceDoc[])
  .slice()
  .sort((a, b) => (a.group === b.group ? a.order - b.order : 0));

validate(ALL_SERVICES);

/** Danh sách slug hợp lệ (dùng validate serviceInterest form lead: slug ∈ 18 hoặc 'general'). */
export const SERVICE_SLUGS: readonly string[] = ALL_SERVICES.map((s) => s.slug);

export type { ServiceDoc, ServiceGroup } from './types';
export { GROUP_ORDER } from './types';
