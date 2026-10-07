/**
 * BrandLogo — logo Mytel chính thức (ảnh tile cam: mark M + chữ "mytel").
 * Ảnh đã gồm wordmark nên KHÔNG kèm chữ "mytel/BUSINESS" bên cạnh.
 */
export function BrandLogo({ size = 44, alt = 'Mytel' }: { size?: number; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/mytel-logo.png"
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 10, display: 'block' }}
    />
  );
}
