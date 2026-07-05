import { useRef } from 'react';
import type { DeviceResult } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { COMPONENT_VISUALS } from './layout';
import { FuseSymbol } from './components/FuseSymbol';
import { LampSymbol } from './components/LampSymbol';
import { McbSymbol } from './components/McbSymbol';
import { MotorSymbol } from './components/MotorSymbol';
import { RelaySymbol } from './components/RelaySymbol';
import { SourceSymbol } from './components/SourceSymbol';
import { SwitchSymbol } from './components/SwitchSymbol';

const MOVE_THRESHOLD = 6;

export function ComponentNode({
  comp,
  device,
  coilDevice,
  selected,
  onBodyPointerDown,
  onTerminalPointerDown,
  onTap,
}: {
  comp: PlacedComponent;
  device?: DeviceResult;
  coilDevice?: DeviceResult;
  selected: boolean;
  onBodyPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
  onTerminalPointerDown: (e: React.PointerEvent<SVGCircleElement>, id: string, terminal: string) => void;
  onTap: (id: string) => void;
}) {
  const visual = COMPONENT_VISUALS[comp.type];
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    downPos.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    onBodyPointerDown(e, comp.id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!downPos.current) return;
    const dx = e.clientX - downPos.current.x;
    const dy = e.clientY - downPos.current.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) moved.current = true;
  };

  const handlePointerUp = () => {
    if (!moved.current) onTap(comp.id);
    downPos.current = null;
    moved.current = false;
  };

  return (
    <g
      transform={`translate(${comp.x}, ${comp.y})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {selected && (
        <rect
          x={-6}
          y={-6}
          width={visual.width + 12}
          height={visual.height + 12}
          rx={10}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}

      {comp.type === 'source' && <SourceSymbol comp={comp} />}
      {comp.type === 'mcb' && <McbSymbol comp={comp} current={device?.current ?? 0} />}
      {comp.type === 'switch' && <SwitchSymbol comp={comp} />}
      {comp.type === 'fuse' && <FuseSymbol comp={comp} />}
      {comp.type === 'relay' && (
        <RelaySymbol comp={comp} coilEnergized={(coilDevice?.current ?? 0) > 0.001} />
      )}
      {comp.type === 'lamp' && <LampSymbol comp={comp} powerW={device?.powerW ?? 0} />}
      {comp.type === 'motor' && (
        <MotorSymbol comp={comp} voltageAcross={device?.voltageAcross ?? 0} current={device?.current ?? 0} />
      )}

      {Object.entries(visual.terminals).map(([name, pos]) => (
        <g key={name}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r={14}
            fill="transparent"
            onPointerDown={(e) => {
              e.stopPropagation();
              onTerminalPointerDown(e, comp.id, name);
            }}
            style={{ cursor: 'crosshair', touchAction: 'none' }}
          />
          <circle cx={pos.x} cy={pos.y} r={5} fill="#0f172a" stroke="#facc15" strokeWidth={2} pointerEvents="none" />
        </g>
      ))}
    </g>
  );
}
