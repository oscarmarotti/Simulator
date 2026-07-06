import type { SourceComponent } from '../../../engine/types';
import {
  INDICATOR_GREEN,
  LABEL_MUTED,
  LINE_COLORS,
  METAL,
  METAL_STROKE,
  NEUTRAL_COLOR,
  PLASTIC_DARK,
  PLASTIC_DARK_HI,
  PLASTIC_DARK_STROKE,
} from '../theme';

/** Chamfered control-panel chassis: square on the terminal (left) edge, cut
 * corners on the right where the readout/switch sit - a stepped industrial
 * enclosure silhouette rather than a plain rectangle. */
function chamferedChassisPath(w: number, h: number, c: number): string {
  return `M 0 0 L ${w - c} 0 L ${w} ${c} L ${w} ${h - c} L ${w - c} ${h} L 0 ${h} Z`;
}

export function SourceSymbol({ comp }: { comp: SourceComponent }) {
  const isThree = comp.phase === 'three';
  const bodyW = isThree ? 130 : 100;
  const bodyH = isThree ? 168 : 80;
  const chamfer = isThree ? 14 : 11;
  const panelX = isThree ? 34 : 30;
  const panelW = bodyW - panelX - 8;
  const panelY = 8;
  const panelH = bodyH - 16;
  const screenCx = panelX + panelW / 2;
  const screenY = 12;
  const screenH = isThree ? 60 : 34;

  const lineTerminals = isThree ? ['L1', 'L2', 'L3'] : ['L'];
  const lineYs = isThree ? [24, 56, 88] : [26];
  const neutralY = isThree ? 120 : 54;
  const clipId = `source-chassis-${comp.id}`;

  return (
    <g>
      {/* Enclosure: dark control-panel unit with a chamfered chassis outline */}
      <defs>
        <clipPath id={clipId}>
          <path d={chamferedChassisPath(bodyW, bodyH, chamfer)} />
        </clipPath>
      </defs>
      <path d={chamferedChassisPath(bodyW, bodyH, chamfer)} fill={PLASTIC_DARK} stroke={PLASTIC_DARK_STROKE} strokeWidth={2} />
      <rect x={0} y={0} width={bodyW} height={7} fill={PLASTIC_DARK_HI} opacity={0.5} clipPath={`url(#${clipId})`} />
      <text x={bodyW / 2} y={bodyH - 4} textAnchor="middle" fontSize={6} fontWeight={700} fill={LABEL_MUTED}>
        {isThree ? '3~ AC SUPPLY 50Hz' : '1~ AC SUPPLY 50Hz'}
      </text>

      {/* Lead stubs + terminal screws */}
      {lineTerminals.map((name, i) => (
        <g key={name}>
          <line x1={0} y1={lineYs[i]} x2={panelX - 8} y2={lineYs[i]} stroke={LINE_COLORS[i]} strokeWidth={3.5} />
          <circle cx={panelX - 8} cy={lineYs[i]} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />
        </g>
      ))}
      <line x1={0} y1={neutralY} x2={panelX - 8} y2={neutralY} stroke={NEUTRAL_COLOR} strokeWidth={3.5} />
      <circle cx={panelX - 8} cy={neutralY} r={2.6} fill={METAL} stroke={METAL_STROKE} strokeWidth={0.9} />

      {/* Panel + digital readout */}
      <rect x={panelX} y={panelY} width={panelW} height={panelH} fill="#0d0f11" stroke="#000" strokeWidth={1.5} />
      <rect x={panelX + 4} y={screenY} width={panelW - 8} height={screenH} fill="#0a1c12" stroke="#173a24" strokeWidth={1.2} />

      {/* Waveform trace(s) - amber/green LED-style */}
      {(isThree ? [0, 1, 2] : [0]).map((i) => (
        <path
          key={i}
          d={`M ${panelX + 8} ${screenY + screenH / 2} Q ${panelX + panelW / 4} ${screenY + 6} ${panelX + panelW / 2} ${screenY + screenH / 2} T ${panelX + panelW - 8} ${screenY + screenH / 2}`}
          fill="none"
          stroke={comp.on ? INDICATOR_GREEN : '#1f3327'}
          strokeWidth={1.3}
          opacity={comp.on ? 0.85 : 0.5}
          transform={isThree ? `translate(0, ${(i - 1) * (screenH / 5)})` : undefined}
        />
      ))}

      <rect x={panelX + 6} y={panelY + panelH - 22} width={panelW - 12} height={17} fill="#050607" />
      <text
        x={screenCx}
        y={panelY + panelH - 9}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        fill={comp.on ? INDICATOR_GREEN : '#2a3a2f'}
        fontFamily="'Courier New', monospace"
      >
        {Math.round(comp.voltage)}V
      </text>

      {/* Power rocker switch - matches SwitchSymbol styling */}
      <rect
        x={isThree ? bodyW - 26 : bodyW - 24}
        y={isThree ? bodyH - 34 : bodyH - 28}
        width={18}
        height={20}
        fill="#1b1d20"
        stroke="#000"
        strokeWidth={1}
      />
      <rect
        x={isThree ? bodyW - 24 : bodyW - 22}
        y={comp.on ? (isThree ? bodyH - 32 : bodyH - 26) : isThree ? bodyH - 21 : bodyH - 15}
        width={14}
        height={9}
        fill={comp.on ? INDICATOR_GREEN : '#4a4f57'}
        style={{ transition: 'y 130ms ease' }}
      />
      <text
        x={isThree ? bodyW - 17 : bodyW - 15}
        y={isThree ? bodyH - 6 : bodyH - 4}
        textAnchor="middle"
        fontSize={5.5}
        fontWeight={700}
        fill={LABEL_MUTED}
      >
        {comp.on ? 'ON' : 'OFF'}
      </text>

      {/* Terminal labels */}
      {lineTerminals.map((name, i) => (
        <text key={name} x={12} y={lineYs[i] - 6} textAnchor="middle" fontSize={8} fontWeight={700} fill={LINE_COLORS[i]}>
          {name}
        </text>
      ))}
      <text x={12} y={neutralY - 6} textAnchor="middle" fontSize={8} fontWeight={700} fill={NEUTRAL_COLOR}>
        N
      </text>
    </g>
  );
}
