'use client';

import { MIcon, MytelMark } from '@/components/ui';

/**
 * EcosystemOrbit — vòng quỹ đạo hệ sinh thái (SCR-01 Ecosystem, bám design v3).
 * Mark Mytel ở tâm + 7 nút dịch vụ quanh vòng, đường nối SVG, vòng sáng/pulse động.
 * Reduced-motion: animation bị tắt toàn cục ở globals.css → tự đứng yên.
 */
type Node = { name: string; sub: string; icon: string; angle: number };

const NODES: Node[] = [
  { name: 'Network', sub: '4G / 5G / Fiber', icon: 'cell_tower', angle: -90 },
  { name: 'Data', sub: 'Analytics', icon: 'analytics', angle: -38 },
  { name: 'AI', sub: 'Intelligence', icon: 'psychology', angle: 12 },
  { name: 'Security', sub: 'Protection', icon: 'shield', angle: 62 },
  { name: 'IoT', sub: 'Smart Solutions', icon: 'sensors', angle: 110 },
  { name: 'Cloud', sub: 'Infrastructure', icon: 'cloud', angle: 160 },
  { name: 'Digital Services', sub: 'Applications', icon: 'apps', angle: 212 },
];

const C = 260;
const R = 200;

export function EcosystemOrbit() {
  const nodes = NODES.map((n, i) => {
    const rad = (n.angle * Math.PI) / 180;
    const x = C + R * Math.cos(rad);
    const y = C + R * Math.sin(rad);
    const left = Math.cos(rad) < -0.2;
    return {
      ...n,
      x,
      y,
      leftPct: `${(x / 520) * 100}%`,
      topPct: `${(y / 520) * 100}%`,
      dir: (left ? 'row-reverse' : 'row') as 'row-reverse' | 'row',
      align: (left ? 'right' : 'left') as 'right' | 'left',
      pulseDelay: `${i * 0.4}s`,
    };
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(440px, 100%)',
        aspectRatio: '1',
        flex: 'none',
        margin: '0 auto',
        fontSize: 'clamp(10px, 2.6vw, 15px)',
      }}
    >
      <svg viewBox="0 0 520 520" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#F26B21" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 7" />
        {nodes.map((n) => (
          <line key={n.name} x1={C} y1={C} x2={n.x} y2={n.y} stroke="#F26B21" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="2 5" />
        ))}
      </svg>

      {/* Chấm chạy quanh quỹ đạo */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '77%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          animation: 'mt-orbit 18s linear infinite',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: '-4px',
            width: 8,
            height: 8,
            marginLeft: -4,
            borderRadius: '50%',
            background: '#F26B21',
            boxShadow: '0 0 12px 3px rgba(242,107,33,0.5)',
          }}
        />
      </div>

      {/* Tâm — mark Mytel */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '29%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #FF9A4D, #F26B21 70%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: '#fff',
          boxShadow: '0 20px 50px rgba(242,107,33,0.4)',
          animation: 'mt-glow 3s ease-out infinite',
        }}
      >
        <MytelMark size="34%" style={{ color: '#fff' }} />
        <span style={{ fontSize: '1.3em', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>mytel</span>
        <span style={{ fontSize: '0.55em', fontWeight: 700, letterSpacing: '0.2em' }}>BUSINESS</span>
      </div>

      {/* Nút dịch vụ */}
      {nodes.map((n) => (
        <div
          key={n.name}
          style={{
            position: 'absolute',
            left: n.leftPct,
            top: n.topPct,
            transform: 'translate(-50%,-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexDirection: n.dir,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '3.4em',
              height: '3.4em',
              flex: 'none',
              borderRadius: '50%',
              background: '#fff',
              border: '1.5px solid #F9C3A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(242,107,33,0.15)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '50%',
                border: '1.5px solid #F26B21',
                opacity: 0,
                animation: 'mt-pulse 2.8s ease-out infinite',
                animationDelay: n.pulseDelay,
                pointerEvents: 'none',
              }}
            />
            <MIcon name={n.icon} style={{ position: 'relative', fontSize: '1.6em', color: '#F26B21' }} />
          </div>
          <div style={{ lineHeight: 1.2, textAlign: n.align, whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.82em', fontWeight: 700, color: 'var(--text-primary)' }}>{n.name}</div>
            <div style={{ fontSize: '0.7em', color: 'var(--text-subtle)', marginTop: 2 }}>{n.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
