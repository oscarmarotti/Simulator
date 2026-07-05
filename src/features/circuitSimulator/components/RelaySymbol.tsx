import type { RelayComponent } from '../../../engine/types';

export function RelaySymbol({ comp, coilEnergized }: { comp: RelayComponent; coilEnergized: boolean }) {
  const closed = comp.contactClosed;
  return (
    <g>
      <rect x={10} y={4} width={130} height={92} rx={10} fill="#1e293b" stroke="#475569" strokeWidth={2} />

      <line x1={0} y1={24} x2={26} y2={24} stroke="#9ca3af" strokeWidth={3} />
      <line x1={0} y1={76} x2={26} y2={76} stroke="#9ca3af" strokeWidth={3} />
      <line x1={124} y1={24} x2={150} y2={24} stroke="#9ca3af" strokeWidth={3} />
      <line x1={124} y1={76} x2={150} y2={76} stroke="#9ca3af" strokeWidth={3} />

      {/* Coil, A1 (top) - A2 (bottom) */}
      <rect x={26} y={38} width={30} height={24} rx={4} fill="#334155" stroke="#64748b" strokeWidth={1.5} />
      <path
        d="M 30 50 q 4 -8 8 0 q 4 8 8 0 q 4 -8 8 0"
        fill="none"
        stroke={coilEnergized ? '#facc15' : '#94a3b8'}
        strokeWidth={2}
      />
      <line x1={26} y1={24} x2={26} y2={45} stroke="#9ca3af" strokeWidth={2} />
      <line x1={26} y1={76} x2={26} y2={55} stroke="#9ca3af" strokeWidth={2} />

      <circle cx={41} cy={16} r={5} fill={coilEnergized ? '#facc15' : '#3f3f10'} stroke="#78716c" strokeWidth={1}>
        {coilEnergized && <animate attributeName="opacity" values="1;0.65;1" dur="1s" repeatCount="indefinite" />}
      </circle>

      {/* Contact: C (top) is the common arm, swings to meet NO (bottom target) when energized */}
      <line x1={124} y1={24} x2={100} y2={24} stroke="#9ca3af" strokeWidth={2} />
      <line x1={124} y1={76} x2={100} y2={76} stroke="#9ca3af" strokeWidth={2} />
      <circle cx={100} cy={76} r={3} fill="#64748b" />
      <g style={{ transition: 'transform 150ms ease' }} transform={closed ? 'translate(0, 46)' : 'translate(0, 0)'}>
        <line x1={100} y1={24} x2={100} y2={30} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
        <circle cx={100} cy={30} r={3.5} fill={closed ? '#4ade80' : '#94a3b8'} />
      </g>

      <text x={75} y={98} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        Relay {closed ? '(الكونتاكت مقفول)' : '(الكونتاكت مفتوح)'}
      </text>
      <text x={20} y={20} textAnchor="middle" fontSize={8} fill="#64748b">A1</text>
      <text x={20} y={88} textAnchor="middle" fontSize={8} fill="#64748b">A2</text>
      <text x={130} y={20} textAnchor="middle" fontSize={8} fill="#64748b">C</text>
      <text x={130} y={88} textAnchor="middle" fontSize={8} fill="#64748b">NO</text>
    </g>
  );
}
