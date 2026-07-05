import type { MotorComponent } from '../../../engine/types';

export function MotorSymbol({ comp, voltageAcross, current }: { comp: MotorComponent; voltageAcross: number; current: number }) {
  const running = !comp.burnedOut && !comp.stalled && voltageAcross > comp.ratedVoltage * 0.5;
  const speedRatio = running ? Math.max(0.15, Math.min(1.4, voltageAcross / comp.ratedVoltage)) : 0;
  const spinDuration = running ? Math.max(0.25, 1.4 / speedRatio) : 0;
  const isStalledAndDrawingCurrent = comp.stalled && !comp.burnedOut && current > 0.3;

  return (
    <g>
      <line x1={28} y1={84} x2={0} y2={88} stroke="#9ca3af" strokeWidth={3} />
      <line x1={68} y1={84} x2={96} y2={88} stroke="#9ca3af" strokeWidth={3} />

      <circle cx={48} cy={40} r={4} fill="#334155" />
      <rect x={44} y={4} width={8} height={12} rx={2} fill="#475569" />

      <circle cx={48} cy={40} r={36} fill="#334155" stroke="#64748b" strokeWidth={2.5} />
      <circle cx={48} cy={40} r={36} fill="none" stroke="#1e293b" strokeWidth={1} strokeDasharray="3 5" />

      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const x1 = 48 + Math.cos(angle) * 30;
        const y1 = 40 + Math.sin(angle) * 30;
        const x2 = 48 + Math.cos(angle) * 36;
        const y2 = 40 + Math.sin(angle) * 36;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={2} />;
      })}

      <g
        style={
          running
            ? { transformOrigin: '48px 40px', animation: `motor-spin ${spinDuration}s linear infinite` }
            : undefined
        }
      >
        <circle cx={48} cy={40} r={20} fill="#475569" stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={48} y1={22} x2={48} y2={58} stroke="#cbd5e1" strokeWidth={2.5} />
        <line x1={30} y1={40} x2={66} y2={40} stroke="#cbd5e1" strokeWidth={2.5} />
      </g>

      <circle cx={48} cy={40} r={5} fill="#94a3b8" />

      {comp.burnedOut && (
        <g>
          <line x1={34} y1={26} x2={62} y2={54} stroke="#57534e" strokeWidth={2.5} />
          <line x1={62} y1={26} x2={34} y2={54} stroke="#57534e" strokeWidth={2.5} />
        </g>
      )}

      {isStalledAndDrawingCurrent && (
        <g>
          <path d="M 48 4 Q 54 -6 48 -14 Q 42 -20 48 -28" stroke="#94a3b8" strokeWidth={2} fill="none" opacity={0.7}>
            <animate attributeName="d" dur="1.4s" repeatCount="indefinite"
              values="M 48 4 Q 54 -6 48 -14 Q 42 -20 48 -28;
                      M 48 4 Q 42 -8 48 -16 Q 54 -22 48 -30;
                      M 48 4 Q 54 -6 48 -14 Q 42 -20 48 -28" />
          </path>
          <text x={48} y={-34} textAnchor="middle" fontSize={8} fontWeight={700} fill="#f59e0b">
            متعثر (Stall)
          </text>
        </g>
      )}

      <text x={48} y={92 + 8} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.ratedHp} HP {comp.burnedOut ? '- محترق' : ''}
      </text>
    </g>
  );
}
