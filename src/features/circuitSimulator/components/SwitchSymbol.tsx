import type { SwitchComponent } from '../../../engine/types';

export function SwitchSymbol({ comp }: { comp: SwitchComponent }) {
  return (
    <g>
      <line x1={0} y1={35} x2={12} y2={35} stroke="#9ca3af" strokeWidth={4} />
      <line x1={68} y1={35} x2={80} y2={35} stroke="#9ca3af" strokeWidth={4} />

      {/* Mounting plate */}
      <rect x={10} y={6} width={60} height={58} rx={5} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
      <circle cx={17} cy={13} r={2} fill="#64748b" />
      <circle cx={63} cy={13} r={2} fill="#64748b" />
      <circle cx={17} cy={57} r={2} fill="#64748b" />
      <circle cx={63} cy={57} r={2} fill="#64748b" />

      {/* Rocker housing */}
      <rect x={16} y={12} width={48} height={46} rx={8} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />

      {/* Rocker paddle, tilts to reflect on/off like a real wall switch */}
      <g transform={comp.on ? 'translate(0,-4) rotate(-6 40 35)' : 'translate(0,4) rotate(6 40 35)'} style={{ transition: 'transform 120ms ease' }}>
        <rect
          x={22}
          y={20}
          width={36}
          height={30}
          rx={6}
          fill={comp.on ? '#4ade80' : '#94a3b8'}
          stroke="#1e293b"
          strokeWidth={1.5}
        />
        <rect x={26} y={24} width={28} height={4} rx={2} fill="#ffffff" opacity={0.35} />
      </g>

      <text x={40} y={68} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.on ? 'ON' : 'OFF'}
      </text>
    </g>
  );
}
