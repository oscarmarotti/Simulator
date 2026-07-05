import type { LampComponent } from '../../../engine/types';

export function LampSymbol({ comp, powerW }: { comp: LampComponent; powerW: number }) {
  const brightness = comp.burnedOut ? 0 : Math.min(1, powerW / comp.ratedPowerW);
  const glowRadius = 18 + brightness * 22;

  return (
    <g>
      <line x1={28} y1={84} x2={0} y2={88} stroke="#9ca3af" strokeWidth={3} />
      <line x1={52} y1={84} x2={80} y2={88} stroke="#9ca3af" strokeWidth={3} />

      {!comp.burnedOut && brightness > 0.02 && (
        <circle cx={40} cy={38} r={glowRadius} fill={comp.color} opacity={0.18 + brightness * 0.35} />
      )}

      <circle
        cx={40}
        cy={38}
        r={28}
        fill={comp.burnedOut ? '#3f3f46' : `${comp.color}`}
        opacity={comp.burnedOut ? 0.5 : 0.22 + brightness * 0.5}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />

      {comp.burnedOut ? (
        <g>
          <line x1={28} y1={26} x2={52} y2={50} stroke="#57534e" strokeWidth={2} />
          <line x1={52} y1={26} x2={28} y2={50} stroke="#57534e" strokeWidth={2} />
        </g>
      ) : (
        <path
          d="M 28 48 L 33 26 L 40 42 L 47 26 L 52 48"
          fill="none"
          stroke={brightness > 0.05 ? '#fff7cc' : '#78716c'}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5 + brightness * 0.5}
        />
      )}

      <rect x={28} y={64} width={24} height={20} rx={2} fill="#94a3b8" stroke="#64748b" />
      <line x1={28} y1={70} x2={52} y2={70} stroke="#64748b" strokeWidth={1.5} />
      <line x1={28} y1={76} x2={52} y2={76} stroke="#64748b" strokeWidth={1.5} />
      <path d="M 30 84 Q 40 90 50 84" stroke="#64748b" strokeWidth={3} fill="none" />

      <text x={40} y={12} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.ratedPowerW}W {comp.burnedOut ? '- محترقة' : ''}
      </text>
    </g>
  );
}
