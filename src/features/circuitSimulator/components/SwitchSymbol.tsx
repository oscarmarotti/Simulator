import type { SwitchComponent } from '../../../engine/types';
import { INDICATOR_GREEN, LABEL_MUTED, METAL, METAL_HI, METAL_STROKE, PLASTIC_LIGHT, PLASTIC_LIGHT_STROKE } from '../theme';

export function SwitchSymbol({ comp }: { comp: SwitchComponent }) {
  const cx = 42;
  const cy = 40;
  const angle = comp.on ? -18 : 18;

  return (
    <g>
      <line x1={0} y1={42} x2={10} y2={42} stroke="#7d828a" strokeWidth={3.5} />
      <line x1={74} y1={42} x2={84} y2={42} stroke="#7d828a" strokeWidth={3.5} />
      <circle cx={10} cy={42} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />
      <circle cx={74} cy={42} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />

      {/* Square mounting plate with corner screws - the panel a round switch is set into */}
      <rect x={4} y={4} width={76} height={72} fill={PLASTIC_LIGHT} stroke={PLASTIC_LIGHT_STROKE} strokeWidth={1.5} />
      {[
        [11, 11],
        [73, 11],
        [11, 69],
        [73, 69],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={2.4} fill="#9aa0aa" stroke="#6b7078" strokeWidth={0.6} />
          <line x1={x - 1.4} y1={y} x2={x + 1.4} y2={y} stroke="#6b7078" strokeWidth={0.5} />
        </g>
      ))}

      {/* Round metal bezel */}
      <circle cx={cx} cy={cy} r={30} fill={METAL} stroke={METAL_STROKE} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={30} fill="none" stroke={METAL_HI} strokeWidth={1} opacity={0.5} />
      <circle cx={cx} cy={cy} r={24} fill="#2a2e34" stroke="#14171b" strokeWidth={1.5} />

      {/* ON / OFF stamped either side of the bat handle's travel */}
      <text x={cx} y={cy - 15} textAnchor="middle" fontSize={6} fontWeight={700} fill="#6b7078">
        I
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={6} fontWeight={700} fill="#6b7078">
        O
      </text>

      {/* Bat-handle lever, pivots between the two marked positions */}
      <g transform={`rotate(${angle} ${cx} ${cy})`} style={{ transition: 'transform 130ms ease' }}>
        <rect x={cx - 4} y={cy - 20} width={8} height={20} rx={4} fill={comp.on ? INDICATOR_GREEN : '#4a4f57'} stroke="#14171b" strokeWidth={1} />
        <ellipse cx={cx} cy={cy - 20} rx={4.5} ry={3.5} fill={comp.on ? INDICATOR_GREEN : '#5a606a'} stroke="#14171b" strokeWidth={0.75} />
      </g>
      <circle cx={cx} cy={cy} r={5} fill="#1b1d20" stroke="#000" strokeWidth={0.75} />

      <text x={cx} y={76} textAnchor="middle" fontSize={7.5} fontWeight={700} fill={LABEL_MUTED}>
        {comp.on ? 'ON' : 'OFF'}
      </text>
    </g>
  );
}
