/**
 * Admin đọc lead (G3/FR-11) — danh sách + chi tiết; mở lead `Mới` → `Đã xem` (BR-18 chỉ đọc).
 * PII chỉ trả cho admin đã xác thực (route bảo vệ bởi middleware). Không đưa PII vào URL/log.
 */
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { writeAudit } from '@/lib/audit';
import { SERVICE_SLUGS } from '@/content/services';

export interface LeadFilter {
  status?: 'new' | 'viewed';
  serviceInterest?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function listLeads(filter: LeadFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));

  const serviceOk =
    filter.serviceInterest &&
    (filter.serviceInterest === 'general' || SERVICE_SLUGS.includes(filter.serviceInterest));

  const createdAt: { gte?: Date; lte?: Date } = {};
  if (filter.dateFrom) {
    const d = new Date(filter.dateFrom);
    if (!Number.isNaN(d.getTime())) createdAt.gte = d;
  }
  if (filter.dateTo) {
    const d = new Date(filter.dateTo);
    if (!Number.isNaN(d.getTime())) createdAt.lte = d;
  }

  const where = {
    ...(filter.status ? { status: filter.status } : {}),
    ...(serviceOk ? { serviceInterest: filter.serviceInterest } : {}),
    ...(createdAt.gte || createdAt.lte ? { createdAt } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items: rows.map((l) => ({
      id: l.id,
      contactName: l.contactName,
      companyName: l.companyName,
      email: l.email,
      phone: l.phone,
      serviceInterest: l.serviceInterest,
      status: l.status,
      emailStatus: l.emailStatus,
      createdAt: l.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLeadAndMarkViewed(id: string, adminId: string, ip?: string) {
  const lead = await prisma.lead.findUnique({ where: { id }, include: { consent: true } });
  if (!lead) throw new AppError('CB-404');

  let status = lead.status;
  let viewedAt = lead.viewedAt;
  if (lead.status === 'new') {
    const now = new Date();
    await prisma.lead.update({
      where: { id },
      data: { status: 'viewed', viewedAt: now, viewedBy: adminId },
    });
    status = 'viewed';
    viewedAt = now;
    await writeAudit({ adminId, action: 'lead.view', entityType: 'lead', entityId: id, ip });
  }

  return {
    id: lead.id,
    contactName: lead.contactName,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    serviceInterest: lead.serviceInterest,
    message: lead.message,
    source: lead.source,
    status,
    emailStatus: lead.emailStatus,
    createdAt: lead.createdAt,
    viewedAt,
    consent: lead.consent
      ? {
          given: lead.consent.given,
          consentTextVersion: lead.consent.consentTextVersion,
          givenAt: lead.consent.givenAt,
        }
      : null,
  };
}
