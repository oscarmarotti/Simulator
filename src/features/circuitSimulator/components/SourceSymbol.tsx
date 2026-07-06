import type { SourceComponent } from '../../../engine/types';

const LINE_COLORS = ['#f87171', '#facc15', '#4ade80'];

export function SourceSymbol({ comp }: { comp: SourceComponent }) {
  const pct = Math.min(1, Math.max(0, (comp.voltage - 100) / (260 - 100)));
  const glow = comp.on ? 0.35 + pct * 0.55 : 0.08;
  const isThree = comp.phase === 'three';
  const bodyW = isThree ? 130 : 100;
  const bodyH = isThree ? 168 : 80;
  const panelX = isThree ? 34 : 30;
  const panelW = bodyW - panelX - 8;
  const panelY = 8;
  const panelH = bodyH - 16;
  const scopeCx = panelX + panelW / 2;
  const scopeCy = isThree ? 66 : 40;
  const scopeR = isThree ? 34 : 26;

  const lineTerminals = isThree ? ['L1', 'L2', 'L3'] : ['L'];
  const lineYs = isThree ? [24, 56, 88] : [26];
  const neutralY = isThree ? 120 : 54;

  return (
    <g>
      {/* Enclosure */}
      <rect x={0} y={0} width={bodyW} height={bodyH} rx={8} fill="#1e293b" stroke="#475569" strokeWidth={2.5} />
      <rect x={3} y={3} width={bodyW - 6} height={10} rx={3} fill="#334155" />
      <text x={bodyW / 2} y={11} textAnchor="middle" fontSize={7} fontWeight={700} fill="#94a3b8">
        {isThree ? '3-PHASE AC SOURCE 50Hz' : 'AC SOURCE 50Hz'}
      </text>

      {/* Lead stubs */}
      {lineTerminals.map((name, i) => (
        <line
          key={name}
          x1={0}
          y1={lineYs[i]}
          x2={panelX - 8}
          y2={lineYs[i]}
          stroke={LINE_COLORS[i]}
          strokeWidth={4}
        />
      ))}
      <line x1={0} y1={neutralY} x2={panelX - 8} y2={neutralY} stroke="#60a5fa" strokeWidth={4} />

      {/* Panel + scope */}
      <rect x={panelX} y={panelY} width={panelW} height={panelH} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1.5} />
      <circle cx={scopeCx} cy={scopeCy} r={scopeR} fill="#052e1b" stroke="#14532d" strokeWidth={2} />
      <circle cx={scopeCx} cy={scopeCy} r={scopeR - 4} fill="none" stroke={`rgba(74,222,128,${glow})`} strokeWidth={1.5} />
      {(isThree ? [0, 1, 2] : [0]).map((i) => (
        <path
          key={i}
          d={`M ${scopeCx - scopeR + 6} ${scopeCy} Q ${scopeCx - scopeR / 2 + 6} ${scopeCy - (scopeR - 10)} ${scopeCx + 6} ${scopeCy} T ${scopeCx + scopeR - 6} ${scopeCy}`}
          fill="none"
          stroke={comp.on ? LINE_COLORS[i] : '#334155'}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={comp.on ? 0.5 + pct * 0.5 : 0.4}
          transform={isThree ? `translate(${(i - 1) * 4}, 0)` : undefined}
        />
      ))}

      {/* Voltage readout */}
      <text x={scopeCx} y={panelY + panelH + 2} textAnchor="middle" fontSize={0} />
      <rect x={panelX + 6} y={panelY + panelH - 20} width={panelW - 12} height={16} rx={3} fill="#111827" />
      <text
        x={scopeCx}
        y={panelY + panelH - 8}
        textAnchor="middle"
        fontSize={10}
        fontWeight={800}
        fill={comp.on ? '#4ade80' : '#374151'}
      >
        {Math.round(comp.voltage)}V
      </text>

      {/* Power rocker switch */}
      <g>
        <rect x={panelX} y={4} width={22} height={0} />
      </g>
      <rect
        x={isThree ? bodyW - 26 : bodyW - 24}
        y={isThree ? bodyH - 30 : bodyH - 26}
        width={18}
        height={20}
        rx={4}
        fill={comp.on ? '#4ade80' : '#475569'}
        stroke="#1e293b"
        strokeWidth={1.2}
      />
      <text
        x={isThree ? bodyW - 17 : bodyW - 15}
        y={isThree ? bodyH - 14 : bodyH - 10}
        textAnchor="middle"
        fontSize={6.5}
        fontWeight={700}
        fill="#0f172a"
      >
        {comp.on ? 'ON' : 'OFF'}
      </text>

      {/* Terminal labels */}
      {lineTerminals.map((name, i) => (
        <text key={name} x={10} y={lineYs[i] - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill={LINE_COLORS[i]}>
          {name}
        </text>
      ))}
      <text x={10} y={neutralY - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill="#60a5fa">
        N
      </text>
    </g>
  );
}
