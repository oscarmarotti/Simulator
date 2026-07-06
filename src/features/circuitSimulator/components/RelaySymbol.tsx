import type { RelayComponent } from '../../../engine/types';
import { INDICATOR_GREEN, LABEL_MUTED, METAL, METAL_STROKE, PLASTIC_DARK, PLASTIC_DARK_STROKE } from '../theme';

/** Ice-cube relay silhouette: a domed (half-ellipse) top fused into straight
 * sides - distinct from every other component's flat-rectangle or
 * rounded-corner-only housing. */
function domeTopPath(x: number, y: number, w: number, h: number, domeHeight: number): string {
  return `M ${x} ${y + h} L ${x} ${y + domeHeight} A ${w / 2} ${domeHeight} 0 0 1 ${x + w} ${y + domeHeight} L ${x + w} ${y + h} Z`;
}

export function RelaySymbol({ comp, coilEnergized }: { comp: RelayComponent; coilEnergized: boolean }) {
  const closed = comp.contactClosed;
  return (
    <g>
      {/* Base mounting plate */}
      <rect x={6} y={0} width={138} height={98} fill="#3a3f47" stroke={PLASTIC_DARK_STROKE} strokeWidth={1} />
      {/* Domed housing with a translucent domed viewing window over the internals */}
      <path d={domeTopPath(10, 4, 130, 90, 34)} fill={PLASTIC_DARK} stroke="#0e1013" strokeWidth={1.5} />
      <path d={domeTopPath(16, 10, 118, 78, 30)} fill="#171a1e" stroke="#000" strokeWidth={0.5} opacity={0.6} />
      <line x1={75} y1={16} x2={75} y2={86} stroke="#3a3f47" strokeWidth={1} strokeDasharray="2 3" />

      <line x1={0} y1={24} x2={26} y2={24} stroke="#7d828a" strokeWidth={3} />
      <line x1={0} y1={76} x2={26} y2={76} stroke="#7d828a" strokeWidth={3} />
      <line x1={124} y1={24} x2={150} y2={24} stroke="#7d828a" strokeWidth={3} />
      <line x1={124} y1={76} x2={150} y2={76} stroke="#7d828a" strokeWidth={3} />
      {[
        [26, 24],
        [26, 76],
        [124, 24],
        [124, 76],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.8} />
      ))}

      {/* Coil, A1 (top) - A2 (bottom) */}
      <rect x={30} y={38} width={28} height={24} fill="#26292e" stroke="#4a4f57" strokeWidth={1.2} />
      <path
        d="M 34 50 q 4 -8 8 0 q 4 8 8 0 q 4 -8 8 0"
        fill="none"
        stroke={coilEnergized ? '#c9a13a' : '#565b62'}
        strokeWidth={1.8}
      />
      <line x1={26} y1={24} x2={26} y2={45} stroke="#7d828a" strokeWidth={1.6} />
      <line x1={26} y1={76} x2={26} y2={55} stroke="#7d828a" strokeWidth={1.6} />

      <circle cx={41} cy={16} r={4.2} fill={coilEnergized ? INDICATOR_GREEN : '#2a2e14'} stroke="#000" strokeWidth={0.75}>
        {coilEnergized && <animate attributeName="opacity" values="1;0.6;1" dur="1.1s" repeatCount="indefinite" />}
      </circle>

      {/* Contact: C (top) is the common arm, swings to meet NO (bottom target) when energized */}
      <line x1={124} y1={24} x2={100} y2={24} stroke="#7d828a" strokeWidth={1.6} />
      <line x1={124} y1={76} x2={100} y2={76} stroke="#7d828a" strokeWidth={1.6} />
      <circle cx={100} cy={76} r={2.6} fill="#6b7078" />
      <g style={{ transition: 'transform 150ms ease' }} transform={closed ? 'translate(0, 46)' : 'translate(0, 0)'}>
        <line x1={100} y1={24} x2={100} y2={30} stroke="#c9cdd3" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={100} cy={30} r={3} fill={closed ? INDICATOR_GREEN : '#565b62'} />
      </g>

      <text x={75} y={100} textAnchor="middle" fontSize={7} fontWeight={700} fill={LABEL_MUTED}>
        RELAY {comp.coilRatedVoltage}V · {closed ? 'NO CLOSED' : 'NO OPEN'}
      </text>
      <text x={20} y={20} textAnchor="middle" fontSize={7} fill="#7d828a">A1</text>
      <text x={20} y={88} textAnchor="middle" fontSize={7} fill="#7d828a">A2</text>
      <text x={130} y={20} textAnchor="middle" fontSize={7} fill="#7d828a">C</text>
      <text x={130} y={88} textAnchor="middle" fontSize={7} fill="#7d828a">NO</text>
    </g>
  );
}
