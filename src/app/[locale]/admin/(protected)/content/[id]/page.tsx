import { BlockEditor } from '@/components/admin/BlockEditor';

/** SCR-08 (sửa). */
export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlockEditor blockId={id} />;
}
