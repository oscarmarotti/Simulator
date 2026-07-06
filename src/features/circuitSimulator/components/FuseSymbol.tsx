import type { FuseComponent } from '../../../engine/types';

export function FuseSymbol({ comp }: { comp: FuseComponent }) {
  return (
    <g>
      <line x1={0} y1={30} x2={10} y2={30} stroke="#9ca3af" strokeWidth={4} />
      <line x1={80} y1={30} x2={90} y2={30} stroke="#9ca3af" strokeWidth={4} />

      {/* Metal ferrules (end caps) */}
      <rect x={10} y={14} width={14} height={32} rx={2} fill="#94a3b8" stroke="#64748b" strokeWidth={1} />
      <rect x={66} y={14} width={14} height={32} rx={2} fill="#94a3b8" stroke="#64748b" strokeWidth={1} />
      <rect x={12} y={17} width={4} height={26} fill="#e2e8f0" opacity={0.5} />
      <rect x={68} y={17} width={4} height={26} fill="#e2e8f0" opacity={0.5} />

      {/* Glass/ceramic tube */}
      <rect
        x={22}
        y={12}
        width={46}
        height={36}
        rx={17}
        fill={comp.blown ? 'rgba(50,42,42,0.65)' : 'rgba(224,242,254,0.32)'}
        stroke="#94a3b8"
        strokeWidth={2}
      />
      <rect x={26} y={16} width={8} height={28} rx={4} fill="#ffffff" opacity={comp.blown ? 0.04 : 0.18} />

      {comp.blown ? (
        <g>
          <path d="M 30 30 L 40 24 L 44 34 L 50 26" stroke="#57534e" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 50 26 L 60 30" stroke="#f59e0b" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
          <circle cx={45} cy={30} r={7} fill="#1c1917" opacity={0.5} />
        </g>
      ) : (
        <path
          d="M 28 30 L 35 22 L 40 38 L 45 22 L 50 38 L 55 22 L 62 30"
          fill="none"
          stroke="#64748b"
          strokeWidth={1.75}
        />
      )}

      <text x={45} y={62} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.rating}A {comp.blown ? '- محترق' : ''}
      </text>
    </g>
  );
}
