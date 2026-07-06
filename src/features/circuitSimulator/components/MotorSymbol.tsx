import type { MotorComponent } from '../../../engine/types';
import { motorBodySize } from '../layout';

export function MotorSymbol({ comp, voltageAcross, current }: { comp: MotorComponent; voltageAcross: number; current: number }) {
  const size = motorBodySize(comp.ratedHp);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const running = !comp.burnedOut && !comp.stalled && voltageAcross > comp.ratedVoltage * 0.5;
  const speedRatio = running ? Math.max(0.15, Math.min(1.4, voltageAcross / comp.ratedVoltage)) : 0;
  const spinDuration = running ? Math.max(0.2, 1.3 / speedRatio) : 0;
  const isStalledAndDrawingCurrent = comp.stalled && !comp.burnedOut && current > 0.3;
  const vibrateAmount = Math.min(2.2, 0.8 + comp.ratedHp * 0.5);

  return (
    <g
      style={
        isStalledAndDrawingCurrent
          ? {
              animation: 'motor-vibrate 0.06s linear infinite',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--vib' as any]: `${vibrateAmount}px`,
            }
          : undefined
      }
    >
      <line x1={cx - 20} y1={size - 12} x2={0} y2={size} stroke="#9ca3af" strokeWidth={3} />
      <line x1={cx + 20} y1={size - 12} x2={size} y2={size} stroke="#9ca3af" strokeWidth={3} />

      {/* Terminal box */}
      <rect x={cx - 12} y={size - 16} width={24} height={12} rx={2} fill="#475569" stroke="#94a3b8" strokeWidth={1} />

      {/* Rear shaft nub */}
      <circle cx={cx} cy={cy} r={4} fill="#334155" />
      <rect x={cx - 4} y={2} width={8} height={10} rx={2} fill="#475569" />

      {/* Body with metallic gradient look via layered circles */}
      <circle cx={cx} cy={cy} r={r} fill="#3f4b5e" stroke="#64748b" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={1} strokeDasharray="3 5" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.35} fill="#ffffff" opacity={0.04} />

      {/* Cooling fins */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * (r - 6);
        const y1 = cy + Math.sin(angle) * (r - 6);
        const x2 = cx + Math.cos(angle) * r;
        const y2 = cy + Math.sin(angle) * r;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={2} />;
      })}

      <g
        style={
          running
            ? { transformOrigin: `${cx}px ${cy}px`, animation: `motor-spin ${spinDuration}s linear infinite` }
            : undefined
        }
      >
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#57677e" stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={cx} y1={cy - r * 0.5} x2={cx} y2={cy + r * 0.5} stroke="#cbd5e1" strokeWidth={2.5} />
        <line x1={cx - r * 0.5} y1={cy} x2={cx + r * 0.5} y2={cy} stroke="#cbd5e1" strokeWidth={2.5} />
      </g>

      <circle cx={cx} cy={cy} r={5} fill="#94a3b8" />

      {comp.burnedOut && (
        <g>
          <line x1={cx - r * 0.5} y1={cy - r * 0.5} x2={cx + r * 0.5} y2={cy + r * 0.5} stroke="#57534e" strokeWidth={2.5} />
          <line x1={cx + r * 0.5} y1={cy - r * 0.5} x2={cx - r * 0.5} y2={cy + r * 0.5} stroke="#57534e" strokeWidth={2.5} />
        </g>
      )}

      {isStalledAndDrawingCurrent && (
        <g>
          <path d={`M ${cx} 4 Q ${cx + 6} -6 ${cx} -14 Q ${cx - 6} -20 ${cx} -28`} stroke="#94a3b8" strokeWidth={2} fill="none" opacity={0.7}>
            <animate
              attributeName="d"
              dur="1.4s"
              repeatCount="indefinite"
              values={`M ${cx} 4 Q ${cx + 6} -6 ${cx} -14 Q ${cx - 6} -20 ${cx} -28;
                      M ${cx} 4 Q ${cx - 6} -8 ${cx} -16 Q ${cx + 6} -22 ${cx} -30;
                      M ${cx} 4 Q ${cx + 6} -6 ${cx} -14 Q ${cx - 6} -20 ${cx} -28`}
            />
          </path>
          <text x={cx} y={-34} textAnchor="middle" fontSize={8} fontWeight={700} fill="#f59e0b">
            متعثر (Stall)
          </text>
        </g>
      )}

      {/* Nameplate */}
      <rect x={cx - 16} y={cy + r * 0.62} width={32} height={12} rx={2} fill="#e2e8f0" opacity={0.9} />
      <text x={cx} y={cy + r * 0.62 + 9} textAnchor="middle" fontSize={7} fontWeight={700} fill="#1e293b">
        {comp.ratedHp} HP
      </text>

      <text x={cx} y={size + 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {comp.burnedOut ? 'محترق' : ''}
      </text>
    </g>
  );
}
