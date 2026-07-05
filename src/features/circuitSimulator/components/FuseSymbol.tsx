import type { FuseComponent } from '../../../engine/types';

export function FuseSymbol({ comp }: { comp: FuseComponent }) {
  return (
    <g>
      <line x1={0} y1={30} x2={14} y2={30} stroke="#9ca3af" strokeWidth={4} />
      <line x1={76} y1={30} x2={90} y2={30} stroke="#9ca3af" strokeWidth={4} />

      <rect x={14} y={10} width={8} height={40} fill="#94a3b8" />
      <rect x={68} y={10} width={8} height={40} fill="#94a3b8" />

      <rect
        x={20}
        y={12}
        width={50}
        height={36}
        rx={16}
        fill={comp.blown ? 'rgba(60,50,50,0.55)' : 'rgba(224,242,254,0.35)'}
        stroke="#94a3b8"
        strokeWidth={2}
      />

      {comp.blown ? (
        <g>
          <path d="M 26 30 L 38 30" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
          <path d="M 52 30 L 64 30" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
          <text x={45} y={34} textAnchor="middle" fontSize={14} fill="#f59e0b" fontWeight={800}>
            ×
          </text>
        </g>
      ) : (
        <path d="M 26 30 L 34 22 L 40 38 L 46 22 L 52 38 L 58 22 L 64 30" fill="none" stroke="#64748b" strokeWidth={1.75} />
      )}

      <text x={45} y={60} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.rating}A {comp.blown ? '- محترق' : ''}
      </text>
    </g>
  );
}
