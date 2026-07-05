import type { SwitchComponent } from '../../../engine/types';

export function SwitchSymbol({ comp }: { comp: SwitchComponent }) {
  return (
    <g>
      <line x1={0} y1={35} x2={14} y2={35} stroke="#9ca3af" strokeWidth={4} />
      <line x1={66} y1={35} x2={80} y2={35} stroke="#9ca3af" strokeWidth={4} />

      <rect x={14} y={12} width={52} height={46} rx={8} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <rect
        x={comp.on ? 36 : 20}
        y={20}
        width={24}
        height={30}
        rx={6}
        fill={comp.on ? '#4ade80' : '#94a3b8'}
        stroke="#1e293b"
        strokeWidth={1.5}
      />
      <text x={40} y={68} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.on ? 'ON' : 'OFF'}
      </text>
    </g>
  );
}
