/**
 * ContentBlockService (G4) — CRUD 3 loại khối đa ngữ + toggle visibility (publishGuard CB-010)
 * + reorder + soft-delete. Mỗi mutation: ghi audit_log (FR-18) + revalidateTag để public cập nhật.
 */
import { ulid } from 'ulid';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { writeAudit } from '@/lib/audit';
import { CONTENT_BLOCKS_TAG } from '@/modules/public-site/blocks';
import {
  validateBlockInput,
  canPublish,
  type BlockInput,
  type BlockType,
} from './validation';

type BlockStatusFilter = 'draft' | 'visible' | 'hidden';

export interface ListFilter {
  type?: BlockType;
  status?: BlockStatusFilter;
  page?: number;
  pageSize?: number;
}

function revalidatePublic(): void {
  revalidateTag(CONTENT_BLOCKS_TAG);
}

function i18nMap(rows: { locale: string; title: string | null; description: string | null }[]) {
  const out: Record<string, { title: string | null; description: string | null }> = {};
  for (const r of rows) out[r.locale] = { title: r.title, description: r.description };
  return out;
}

export async function listBlocks(filter: ListFilter) {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));
  const where = {
    deletedAt: null,
    ...(filter.type ? { blockType: filter.type } : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.contentBlock.findMany({
      where,
      include: { i18n: true },
      orderBy: [{ blockType: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contentBlock.count({ where }),
  ]);
  return {
    items: rows.map((b) => ({
      id: b.id,
      blockType: b.blockType,
      status: b.status,
      sortOrder: b.sortOrder,
      payload: b.payload,
      i18n: i18nMap(b.i18n),
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getBlock(id: string) {
  const b = await prisma.contentBlock.findFirst({
    where: { id, deletedAt: null },
    include: { i18n: true },
  });
  if (!b) throw new AppError('CB-404');
  return {
    id: b.id,
    blockType: b.blockType,
    status: b.status,
    sortOrder: b.sortOrder,
    payload: b.payload,
    i18n: i18nMap(b.i18n),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

/** Ghi i18n en/vi. Partner ngôn ngữ-trung tính → copy title EN sang VI nếu VI trống. */
function buildI18nRows(blockId: string, input: BlockInput) {
  const en = input.i18n?.en;
  const vi = input.i18n?.vi;
  const rows: { locale: 'en' | 'vi'; title: string | null; description: string | null }[] = [];
  if (en && (en.title || en.description)) {
    rows.push({ locale: 'en', title: en.title ?? null, description: en.description ?? null });
  }
  if (input.blockType === 'partner') {
    const viTitle = vi?.title || en?.title || null;
    if (viTitle) rows.push({ locale: 'vi', title: viTitle, description: null });
  } else if (vi && (vi.title || vi.description)) {
    rows.push({ locale: 'vi', title: vi.title ?? null, description: vi.description ?? null });
  }
  return rows.map((r) => ({ ...r, blockId, id: ulid() }));
}

export async function createBlock(input: BlockInput, adminId: string, ip?: string) {
  const check = validateBlockInput(input);
  if (!check.valid) throw new AppError('CB-001', check.details);

  const id = ulid();
  const i18nRows = buildI18nRows(id, input);
  await prisma.$transaction(async (tx) => {
    await tx.contentBlock.create({
      data: {
        id,
        blockType: input.blockType,
        status: 'draft',
        sortOrder: input.sortOrder ?? 0,
        payload: (input.payload ?? {}) as object,
        createdBy: adminId,
      },
    });
    if (i18nRows.length > 0) await tx.contentBlockI18n.createMany({ data: i18nRows });
  });

  await writeAudit({ adminId, action: 'block.create', entityType: 'content_block', entityId: id, ip });
  return { id, status: 'draft' as const };
}

export async function updateBlock(id: string, input: BlockInput, adminId: string, ip?: string) {
  const existing = await prisma.contentBlock.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('CB-404');

  const merged: BlockInput = { ...input, blockType: existing.blockType as BlockType };
  const check = validateBlockInput(merged);
  if (!check.valid) throw new AppError('CB-001', check.details);

  const i18nRows = buildI18nRows(id, merged);
  await prisma.$transaction(async (tx) => {
    await tx.contentBlock.update({
      where: { id },
      data: {
        sortOrder: input.sortOrder ?? existing.sortOrder,
        payload: (input.payload ?? existing.payload) as object,
        updatedBy: adminId,
      },
    });
    for (const row of i18nRows) {
      await tx.contentBlockI18n.upsert({
        where: { blockId_locale: { blockId: id, locale: row.locale } },
        update: { title: row.title, description: row.description },
        create: row,
      });
    }
  });

  await writeAudit({ adminId, action: 'block.update', entityType: 'content_block', entityId: id, ip });
  if (existing.status === 'visible') revalidatePublic();
  return { id, status: existing.status };
}

export async function setVisibility(
  id: string,
  action: 'show' | 'hide',
  adminId: string,
  ip?: string,
) {
  const b = await prisma.contentBlock.findFirst({
    where: { id, deletedAt: null },
    include: { i18n: { where: { locale: 'en' } } },
  });
  if (!b) throw new AppError('CB-404');

  if (action === 'show') {
    const en = b.i18n[0];
    const payload = (b.payload ?? {}) as Record<string, unknown>;
    if (!canPublish(b.blockType as BlockType, en ? { title: en.title, description: en.description } : undefined, payload)) {
      throw new AppError('CB-010');
    }
  }
  const status = action === 'show' ? 'visible' : 'hidden';
  await prisma.contentBlock.update({ where: { id }, data: { status, updatedBy: adminId } });
  await writeAudit({
    adminId,
    action: 'block.visibility',
    entityType: 'content_block',
    entityId: id,
    ip,
    detail: { action, status },
  });
  revalidatePublic();
  return { id, status };
}

export async function reorderBlocks(
  items: { id: string; sortOrder: number }[],
  adminId: string,
  ip?: string,
) {
  const valid = items.filter((it) => typeof it.id === 'string' && Number.isInteger(it.sortOrder) && it.sortOrder >= 0);
  await prisma.$transaction(
    valid.map((it) =>
      prisma.contentBlock.update({
        where: { id: it.id },
        data: { sortOrder: it.sortOrder, updatedBy: adminId },
      }),
    ),
  );
  await writeAudit({ adminId, action: 'block.reorder', entityType: 'content_block', ip, detail: { count: valid.length } });
  revalidatePublic();
  return { updated: valid.length };
}

export async function softDeleteBlock(id: string, adminId: string, ip?: string) {
  const b = await prisma.contentBlock.findFirst({ where: { id, deletedAt: null } });
  if (!b) throw new AppError('CB-404');
  await prisma.contentBlock.update({
    where: { id },
    data: { status: 'deleted', deletedAt: new Date(), updatedBy: adminId },
  });
  await writeAudit({ adminId, action: 'block.delete', entityType: 'content_block', entityId: id, ip });
  revalidatePublic();
  return { id, deleted: true };
}
