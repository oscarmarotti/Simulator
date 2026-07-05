import type { McbComponent } from '../../../engine/types';

export function McbSymbol({ comp, current }: { comp: McbComponent; current: number }) {
  const overCurrent = current > comp.rating * 0.85;
  // lever: up = ON, centered/tilted = TRIPPED
  const leverY = comp.tripped ? 48 : 20;
  const leverAngle = comp.tripped ? -18 : 0;

  return (
    <g>
      <line x1={35} y1={0} x2={35} y2={10} stroke="#9ca3af" strokeWidth={4} />
      <line x1={35} y1={86} x2={35} y2={96} stroke="#9ca3af" strokeWidth={4} />

      <rect x={5} y={10} width={60} height={76} rx={6} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <rect x={9} y={14} width={52} height={20} rx={3} fill="#cbd5e1" />
      <text x={35} y={28} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1e293b">
        {comp.rating}A
      </text>
      <text x={35} y={40} textAnchor="middle" fontSize={9} fontWeight={700} fill="#475569">
        Type {comp.curve}
      </text>

      <rect x={17} y={48} width={36} height={34} rx={4} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
      <g transform={`translate(35, ${leverY}) rotate(${leverAngle})`}>
        <rect x={-7} y={-22} width={14} height={26} rx={3} fill={comp.tripped ? '#f87171' : '#334155'} />
      </g>

      {comp.tripped && (
        <text x={35} y={92} textAnchor="middle" fontSize={8} fontWeight={700} fill="#dc2626">
          فصل - إعادة ضبط
        </text>
      )}
      {!comp.tripped && overCurrent && (
        <circle cx={57} cy={18} r={3.5} fill="#f97316">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}
