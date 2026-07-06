import type { FuseComponent } from '../../../engine/types';
import { INDICATOR_ORANGE, LABEL_MUTED, METAL, METAL_STROKE } from '../theme';

export function FuseSymbol({ comp }: { comp: FuseComponent }) {
  return (
    <g>
      <line x1={0} y1={30} x2={9} y2={30} stroke="#7d828a" strokeWidth={3.5} />
      <line x1={81} y1={30} x2={90} y2={30} stroke="#7d828a" strokeWidth={3.5} />

      {/* Fuse holder base (grey plastic mount) */}
      <rect x={16} y={20} width={58} height={20} fill="#c3c7ce" stroke="#8b909a" strokeWidth={1} />

      {/* Metal ferrules (end caps) */}
      <rect x={9} y={13} width={13} height={34} fill={METAL} stroke={METAL_STROKE} strokeWidth={1} />
      <rect x={68} y={13} width={13} height={34} fill={METAL} stroke={METAL_STROKE} strokeWidth={1} />
      <rect x={11} y={16} width={3} height={28} fill="#dfe2e6" opacity={0.6} />
      <rect x={70} y={16} width={3} height={28} fill="#dfe2e6" opacity={0.6} />

      {/* Ceramic / glass tube */}
      <rect
        x={20}
        y={13}
        width={50}
        height={34}
        fill={comp.blown ? '#332c28' : '#e7e2d3'}
        stroke="#8b8570"
        strokeWidth={1.5}
        opacity={comp.blown ? 0.9 : 0.85}
      />
      <rect x={24} y={16} width={6} height={26} fill="#ffffff" opacity={comp.blown ? 0.03 : 0.3} />

      {comp.blown ? (
        <g>
          <path d="M 30 30 L 40 24 L 44 34 L 50 26" stroke="#1c1917" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 50 26 L 60 30" stroke={INDICATOR_ORANGE} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
          <circle cx={45} cy={30} r={6} fill="#100d0b" opacity={0.55} />
        </g>
      ) : (
        <path d="M 26 30 L 34 22 L 40 38 L 46 22 L 52 38 L 58 22 L 64 30" fill="none" stroke="#5b5748" strokeWidth={1.6} />
      )}

      <text x={45} y={58} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={LABEL_MUTED}>
        {comp.rating}A gG {comp.blown ? '· FAULT' : ''}
      </text>
    </g>
  );
}
