import { useState } from 'react';
import { makeDefaultComponent } from '../../engine/factory';
import type { ComponentType } from '../../engine/types';
import { PALETTE_ITEMS } from './boardTypes';
import { FuseSymbol } from './components/FuseSymbol';
import { LampSymbol } from './components/LampSymbol';
import { McbSymbol } from './components/McbSymbol';
import { MotorSymbol } from './components/MotorSymbol';
import { RelaySymbol } from './components/RelaySymbol';
import { SourceSymbol } from './components/SourceSymbol';
import { SwitchSymbol } from './components/SwitchSymbol';
import { getComponentVisual } from './layout';
import { clientToSvgPoint } from './svgCoords';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onDropComponent: (type: ComponentType, x: number, y: number) => void;
}

export function ComponentPalette({ svgRef, onDropComponent }: Props) {
  const [ghost, setGhost] = useState<{ type: ComponentType; x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, type: ComponentType) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setGhost({ type, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
  };

  const handlePointerUp = (e: React.PointerEvent, type: ComponentType) => {
    setGhost(null);
    const svg = svgRef.current;
    if (!svg) return;
    const elAtPoint = document.elementFromPoint(e.clientX, e.clientY);
    if (!elAtPoint || !svg.contains(elAtPoint)) return;
    const p = clientToSvgPoint(svg, e.clientX, e.clientY);
    const visual = getComponentVisual(makeDefaultComponent(type, 'preview'));
    onDropComponent(type, p.x - visual.width / 2, p.y - visual.height / 2);
  };

  return (
    <>
      <div className="palette">
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            className="palette__item"
            onPointerDown={(e) => handlePointerDown(e, item.type)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(e, item.type)}
            style={{ touchAction: 'none' }}
          >
            <PaletteIcon type={item.type} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {ghost && (
        <div
          className="palette__ghost"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <PaletteIcon type={ghost.type} />
        </div>
      )}
    </>
  );
}

function PaletteIcon({ type }: { type: ComponentType }) {
  const comp = makeDefaultComponent(type, 'preview');
  const visual = getComponentVisual(comp);
  const scale = 36 / Math.max(visual.width, visual.height);
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <g
        transform={`translate(${22 - (visual.width * scale) / 2}, ${22 - (visual.height * scale) / 2}) scale(${scale})`}
      >
        <PaletteSymbol comp={comp} />
      </g>
    </svg>
  );
}

function PaletteSymbol({ comp }: { comp: ReturnType<typeof makeDefaultComponent> }) {
  switch (comp.type) {
    case 'source':
      return <SourceSymbol comp={comp} />;
    case 'mcb':
      return <McbSymbol comp={comp} current={0} />;
    case 'switch':
      return <SwitchSymbol comp={comp} />;
    case 'fuse':
      return <FuseSymbol comp={comp} />;
    case 'relay':
      return <RelaySymbol comp={comp} coilEnergized={false} />;
    case 'lamp':
      return <LampSymbol comp={comp} powerW={100} />;
    case 'motor':
      return <MotorSymbol comp={comp} voltageAcross={220} current={2} />;
  }
}
