import type { McbComponent } from '../../../engine/types';

const POLE_WIDTH = 42;

export function McbSymbol({ comp, current }: { comp: McbComponent; current: number }) {
  const overCurrent = !comp.tripped && current > comp.rating * 0.85;
  const width = POLE_WIDTH * comp.poles + 16;
  const leverY = comp.tripped ? 50 : 22;
  const leverAngle = comp.tripped ? -16 : 0;
  const leverCx = width / 2;
  const leverW = Math.min(34, 16 + comp.poles * 8);

  return (
    <g>
      {/* DIN rail clip */}
      <rect x={width / 2 - 14} y={92} width={28} height={6} rx={1.5} fill="#64748b" />

      {/* Terminal screws + lead stubs, one pair per pole */}
      {Array.from({ length: comp.poles }).map((_, i) => {
        const x = 8 + POLE_WIDTH * i + POLE_WIDTH / 2;
        return (
          <g key={i}>
            <line x1={x} y1={0} x2={x} y2={10} stroke="#9ca3af" strokeWidth={4} />
            <line x1={x} y1={86} x2={x} y2={96} stroke="#9ca3af" strokeWidth={4} />
            <circle cx={x} cy={12} r={3.2} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
            <circle cx={x} cy={84} r={3.2} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
          </g>
        );
      })}

      {/* Plastic body */}
      <rect x={4} y={10} width={width - 8} height={76} rx={6} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      {Array.from({ length: comp.poles - 1 }).map((_, i) => (
        <line
          key={i}
          x1={8 + POLE_WIDTH * (i + 1)}
          y1={12}
          x2={8 + POLE_WIDTH * (i + 1)}
          y2={84}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
      ))}

      {/* Rating / curve label */}
      <rect x={8} y={14} width={width - 16} height={19} rx={3} fill="#cbd5e1" />
      <text x={width / 2} y={27} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1e293b">
        {comp.rating}A {comp.poles > 1 ? `${comp.poles}P` : '1P'}
      </text>
      <text x={width / 2} y={39} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#475569">
        Curve {comp.curve}
      </text>

      {/* Trip indicator flag */}
      <rect
        x={width - 20}
        y={17}
        width={9}
        height={12}
        rx={1.5}
        fill={comp.tripped ? '#ef4444' : '#94a3b8'}
        opacity={comp.tripped ? 1 : 0.5}
      />

      {/* Handle housing + shared lever (mechanically common across all poles) */}
      <rect
        x={leverCx - leverW / 2 - 2}
        y={46}
        width={leverW + 4}
        height={36}
        rx={4}
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      <text x={leverCx} y={80} textAnchor="middle" fontSize={6} fill="#94a3b8">
        ON
      </text>
      <text x={leverCx} y={92} textAnchor="middle" fontSize={0} />
      <g transform={`translate(${leverCx}, ${leverY}) rotate(${leverAngle})`} style={{ transition: 'transform 150ms ease' }}>
        <rect x={-leverW / 2} y={-22} width={leverW} height={26} rx={4} fill={comp.tripped ? '#f87171' : '#334155'} />
        <rect x={-leverW / 2 + 3} y={-19} width={leverW - 6} height={4} rx={2} fill="#0f172a" opacity={0.3} />
      </g>

      {comp.tripped && (
        <text x={width / 2} y={92} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#dc2626">
          فصل - إعادة ضبط
        </text>
      )}
      {overCurrent && (
        <circle cx={width - 12} cy={45} r={3.5} fill="#f97316">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}
