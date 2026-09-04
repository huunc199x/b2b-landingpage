import Link from 'next/link';

/** 404 song ngữ (khung Làn 0). Nội dung/thiết kế đầy đủ là việc Làn 1. */
export default function NotFound() {
  return (
    <main style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 30 }}>404</h1>
      <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy nội dung / Not found</p>
      <Link href="/">← Về trang chủ / Home</Link>
    </main>
  );
}
