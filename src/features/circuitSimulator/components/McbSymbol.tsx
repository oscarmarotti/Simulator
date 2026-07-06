import type { McbComponent } from '../../../engine/types';
import {
  INDICATOR_GREEN,
  INDICATOR_GREY,
  INDICATOR_RED,
  LABEL_DARK,
  LABEL_MUTED,
  METAL,
  METAL_STROKE,
  PLASTIC_DARK,
  PLASTIC_LIGHT,
  PLASTIC_LIGHT_HI,
  PLASTIC_LIGHT_PANEL,
  PLASTIC_LIGHT_STROKE,
} from '../theme';

const POLE_WIDTH = 42;

/** Rounded top corners only, square bottom - the classic DIN-breaker silhouette. */
function roundedTopPath(x: number, y: number, w: number, h: number, r: number): string {
  return `M ${x} ${y + h} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h} Z`;
}

export function McbSymbol({ comp, current }: { comp: McbComponent; current: number }) {
  const on = comp.closed && !comp.tripped;
  const overCurrent = on && current > comp.rating * 0.85;
  const width = POLE_WIDTH * comp.poles + 16;
  const leverY = on ? 24 : 52;
  const leverCx = width / 2;
  const leverW = Math.min(26, 14 + comp.poles * 5);
  const flagColor = comp.tripped ? INDICATOR_RED : comp.closed ? INDICATOR_GREEN : INDICATOR_GREY;

  return (
    <g>
      {/* DIN rail clip: a distinct hook/tooth shape, not just a rectangle */}
      <path
        d={`M ${width / 2 - 12} 87 L ${width / 2 - 12} 92 Q ${width / 2} 97 ${width / 2 + 12} 92 L ${width / 2 + 12} 87 Z`}
        fill={METAL}
        stroke={METAL_STROKE}
        strokeWidth={0.9}
      />

      {/* Terminal screws + lead stubs, one pair per pole */}
      {Array.from({ length: comp.poles }).map((_, i) => {
        const x = 8 + POLE_WIDTH * i + POLE_WIDTH / 2;
        return (
          <g key={i}>
            <line x1={x} y1={0} x2={x} y2={9} stroke="#7d828a" strokeWidth={3.5} />
            <line x1={x} y1={87} x2={x} y2={92} stroke="#7d828a" strokeWidth={3.5} />
            <circle cx={x} cy={11} r={3} fill={METAL} stroke={METAL_STROKE} strokeWidth={1} />
            <line x1={x - 2} y1={11} x2={x + 2} y2={11} stroke={METAL_STROKE} strokeWidth={0.8} />
            <circle cx={x} cy={85} r={3} fill={METAL} stroke={METAL_STROKE} strokeWidth={1} />
            <line x1={x - 2} y1={85} x2={x + 2} y2={85} stroke={METAL_STROKE} strokeWidth={0.8} />
          </g>
        );
      })}

      {/* Plastic body - rounded top, square bottom (rail-mount silhouette) */}
      <path
        d={roundedTopPath(4, 9, width - 8, 78, 8)}
        fill={PLASTIC_LIGHT}
        stroke={PLASTIC_LIGHT_STROKE}
        strokeWidth={1.5}
      />
      <path d={roundedTopPath(4, 9, width - 8, 12, 8)} fill={PLASTIC_LIGHT_HI} opacity={0.6} />
      {Array.from({ length: comp.poles - 1 }).map((_, i) => (
        <line
          key={i}
          x1={8 + POLE_WIDTH * (i + 1)}
          y1={11}
          x2={8 + POLE_WIDTH * (i + 1)}
          y2={85}
          stroke={PLASTIC_LIGHT_STROKE}
          strokeWidth={1}
          opacity={0.6}
        />
      ))}

      {/* Nameplate: rating / curve */}
      <rect x={7} y={16} width={width - 14} height={17} fill={PLASTIC_LIGHT_PANEL} />
      <text x={width / 2} y={28.5} textAnchor="middle" fontSize={10} fontWeight={700} fill={LABEL_DARK} fontFamily="Arial, sans-serif">
        {comp.rating}A {comp.poles}P
      </text>
      <text x={width / 2} y={41} textAnchor="middle" fontSize={7.5} fontWeight={600} fill={LABEL_MUTED}>
        CURVE {comp.curve} · IEC60898
      </text>

      {/* Trip/status indicator window - round, not a plain rectangle */}
      <circle cx={width - 14} cy={22} r={5.5} fill="#0f1113" stroke={METAL_STROKE} strokeWidth={0.75} />
      <circle cx={width - 14} cy={22} r={3.8} fill={flagColor} />

      {/* Handle housing: a stepped, narrower raised block (real breakers recess the toggle) */}
      <path
        d={roundedTopPath(leverCx - leverW / 2 - 3, 46, leverW + 6, 38, 5)}
        fill={PLASTIC_DARK}
        stroke="#14171b"
        strokeWidth={1}
      />
      <text x={leverCx} y={80} textAnchor="middle" fontSize={5.5} fill="#8a8f97" fontWeight={700}>
        O
      </text>
      <text x={leverCx} y={54} textAnchor="middle" fontSize={5.5} fill="#8a8f97" fontWeight={700}>
        I
      </text>
      <rect
        x={leverCx - leverW / 2}
        y={leverY}
        width={leverW}
        height={22}
        rx={3}
        fill={comp.tripped ? '#8a3030' : '#1b1d20'}
        stroke="#000000"
        strokeWidth={0.75}
        style={{ transition: 'y 140ms ease' }}
      />
      <rect x={leverCx - leverW / 2 + 2} y={leverY + 2} width={leverW - 4} height={3} rx={1.5} fill="#4a4f57" opacity={0.7} />

      {overCurrent && (
        <circle cx={width - 14} cy={45} r={3}>
          <animate attributeName="fill" values="#c47a2a;#3a3f47" dur="0.6s" repeatCount="indefinite" />
        </circle>
      )}
      {comp.tripped && (
        <text x={width / 2} y={-6} textAnchor="middle" fontSize={7} fontWeight={700} fill={INDICATOR_RED}>
          فصل - إعادة ضبط
        </text>
      )}
    </g>
  );
}
