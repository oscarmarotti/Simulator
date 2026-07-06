import type { SwitchComponent } from '../../../engine/types';
import { INDICATOR_GREEN, LABEL_MUTED, METAL, METAL_STROKE, PLASTIC_DARK, PLASTIC_LIGHT, PLASTIC_LIGHT_STROKE } from '../theme';

export function SwitchSymbol({ comp }: { comp: SwitchComponent }) {
  return (
    <g>
      <line x1={0} y1={35} x2={12} y2={35} stroke="#7d828a" strokeWidth={3.5} />
      <line x1={68} y1={35} x2={80} y2={35} stroke="#7d828a" strokeWidth={3.5} />
      <circle cx={12} cy={35} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />
      <circle cx={68} cy={35} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />

      {/* Mounting plate */}
      <rect x={10} y={6} width={60} height={58} rx={2} fill={PLASTIC_LIGHT} stroke={PLASTIC_LIGHT_STROKE} strokeWidth={1.5} />
      <line x1={16} y1={12} x2={64} y2={12} stroke="#eceef1" strokeWidth={1.5} opacity={0.7} />

      {/* Toggle body */}
      <rect x={20} y={16} width={40} height={38} rx={2} fill={PLASTIC_DARK} stroke="#14171b" strokeWidth={1.5} />

      {/* Toggle lever, up = ON, down = OFF (real industrial rocker) */}
      <rect
        x={26}
        y={comp.on ? 20 : 40}
        width={28}
        height={14}
        fill={comp.on ? INDICATOR_GREEN : '#4a4f57'}
        stroke="#14171b"
        strokeWidth={1}
        style={{ transition: 'y 130ms ease' }}
      />
      <line x1={30} y1={comp.on ? 27 : 47} x2={50} y2={comp.on ? 27 : 47} stroke="#000" strokeWidth={0.6} opacity={0.35} />

      <text x={40} y={68} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={LABEL_MUTED}>
        {comp.on ? 'ON' : 'OFF'}
      </text>
    </g>
  );
}
