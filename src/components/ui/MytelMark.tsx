/**
 * MytelMark — mark Mytel (trắng) để đặt trong ô/đĩa nền cam (design v3).
 * Tự lành: hiện chữ "M" trắng làm nền; nếu có file `/assets/mytel-mark-white.png`
 * thì lớp background phủ lên hiển thị logo thật (không cần JS, không vỡ khi thiếu file).
 * color = currentColor (thừa kế) → luôn trắng trong ngữ cảnh nền cam.
 */
export function MytelMark({
  size = 27,
  style,
}: {
  size?: number | string;
  style?: React.CSSProperties;
}) {
  const px = typeof size === 'number';
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: 'currentColor',
        ...style,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: px ? Math.round((size as number) * 0.66) : '1.1em',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        M
      </span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/assets/mytel-mark-white.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </span>
  );
}
