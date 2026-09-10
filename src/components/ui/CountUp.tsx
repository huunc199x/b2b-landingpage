'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * CountUp — đếm số tăng dần từ 0 → giá trị đích khi cuộn vào viewport (chạy 1 lần).
 *
 * - Tách phần SỐ để animate + giữ nguyên tiền tố/hậu tố (vd "+", "%", chữ) và
 *   dấu ngăn cách nghìn kiểu VN ("1.200+" → đếm tới 1200, in lại "1.200+").
 * - Giá trị không có số (vd "—", chờ AS) → hiển thị thẳng, KHÔNG animate.
 * - SSR an toàn: state khởi tạo = giá trị cuối (render sẵn cho no-JS/SEO). Animation
 *   chỉ enhance ở client sau hydrate → không lệch hydration.
 * - Tôn trọng prefers-reduced-motion: nếu reduce → hiện thẳng giá trị cuối, không đếm.
 */

const DURATION_MS = 1200;

type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  useGroup: boolean;
  groupSep: string;
};

/** Tách chuỗi giá trị thành tiền tố / số đích / hậu tố + kiểu định dạng. */
function parseValue(raw: string): Parsed | null {
  const m = raw.match(/\d[\d.,]*/);
  if (!m || m.index === undefined) return null;

  const numStr = m[0];
  const prefix = raw.slice(0, m.index);
  const suffix = raw.slice(m.index + numStr.length);

  const seps = numStr.match(/[.,]/g) ?? [];
  const groups = numStr.split(/[.,]/);
  const head = groups[0] ?? '';
  const sep = seps[0] ?? '';

  // Nhóm nghìn: mọi cụm sau cụm đầu đều 3 chữ số + dùng 1 loại dấu (vd "1.200").
  const isGrouped =
    seps.length > 0 &&
    new Set(seps).size === 1 &&
    head.length >= 1 &&
    head.length <= 3 &&
    groups.slice(1).every((g) => g.length === 3);

  if (isGrouped) {
    return {
      prefix,
      suffix,
      target: parseInt(groups.join(''), 10),
      decimals: 0,
      useGroup: true,
      groupSep: sep,
    };
  }

  if (seps.length === 1) {
    // Số thập phân (vd "4.5"): giữ số chữ số sau dấu + ký tự dấu.
    const frac = groups[1] ?? '';
    return {
      prefix,
      suffix,
      target: parseFloat(`${head}.${frac}`),
      decimals: frac.length,
      useGroup: false,
      groupSep: sep,
    };
  }

  return {
    prefix,
    suffix,
    target: parseInt(numStr.replace(/[.,]/g, ''), 10),
    decimals: 0,
    useGroup: false,
    groupSep: '',
  };
}

function format(n: number, p: Parsed): string {
  if (p.useGroup) return Math.round(n).toLocaleString('en-US').replace(/,/g, p.groupSep);
  if (p.decimals > 0) return n.toFixed(p.decimals).replace('.', p.groupSep);
  return String(Math.round(n));
}

// easeOutCubic — mượt, chậm dần về cuối.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({ value, className }: { value: string; className?: string }) {
  const parsed = parseValue(value);
  // SSR + first client render = giá trị cuối (khớp hydration, tốt cho SEO/no-JS).
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parsed) return; // "—"/chuỗi không số → giữ nguyên.

    const el = ref.current;
    if (!el) return;

    const finalText = `${parsed.prefix}${format(parsed.target, parsed)}${parsed.suffix}`;

    // prefers-reduced-motion → hiện thẳng, không đếm.
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(finalText);
      return;
    }

    // Bắt đầu từ 0 (client-only, sau hydrate) rồi đếm khi cuộn vào viewport.
    setDisplay(`${parsed.prefix}${format(0, parsed)}${parsed.suffix}`);

    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        const current = parsed.target * easeOut(t);
        setDisplay(`${parsed.prefix}${format(current, parsed)}${parsed.suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setDisplay(finalText);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            io.disconnect();
            run();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // parseValue là thuần theo `value`; chạy lại khi value đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={ref} className={className}>
      {display}
    </div>
  );
}
