import type { SourceComponent } from '../../../engine/types';

export function SourceSymbol({ comp }: { comp: SourceComponent }) {
  const pct = (comp.voltage - 100) / (260 - 100);
  const glow = 0.4 + pct * 0.6;
  return (
    <g>
      <line x1={0} y1={26} x2={22} y2={26} stroke="#e11d48" strokeWidth={4} />
      <line x1={0} y1={54} x2={22} y2={54} stroke="#2563eb" strokeWidth={4} />
      <circle cx={55} cy={40} r={34} fill="#1e293b" stroke="#475569" strokeWidth={3} />
      <circle cx={55} cy={40} r={28} fill="none" stroke={`rgba(250,204,21,${glow})`} strokeWidth={2} />
      <path
        d="M 33 40 Q 41 24 49 40 T 65 40 T 81 40"
        fill="none"
        stroke="#facc15"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text x={55} y={72} textAnchor="middle" fontSize={11} fill="#cbd5e1" fontWeight={700}>
        {Math.round(comp.voltage)}V
      </text>
      <text x={12} y={20} textAnchor="middle" fontSize={10} fill="#f87171" fontWeight={700}>
        L
      </text>
      <text x={12} y={68} textAnchor="middle" fontSize={10} fill="#60a5fa" fontWeight={700}>
        N
      </text>
    </g>
  );
}
