/**
 * MIcon — icon từ Material Symbols Outlined (nạp qua <link> Google Fonts ở layout).
 * Dùng ligature: <span class="material-symbols-outlined">cell_tower</span>.
 * aria-hidden: icon chỉ trang trí; nhãn nghĩa nằm ở text kề bên.
 */
export function MIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined${className ? ` ${className}` : ''}`} aria-hidden style={style}>
      {name}
    </span>
  );
}
