import { forwardRef, useMemo, useState } from 'react';
import type { CircuitResult, TerminalRef, Wire } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { ComponentNode } from './ComponentNode';
import { COMPONENT_VISUALS, terminalWorldPos } from './layout';
import { clientToSvgPoint } from './svgCoords';
import { WireLayer } from './WireLayer';

export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 900;
const TERMINAL_SNAP_RADIUS = 26;

type DragState =
  | { kind: 'move'; id: string; offsetX: number; offsetY: number; pointerId: number }
  | { kind: 'wire'; from: TerminalRef; x: number; y: number; pointerId: number }
  | null;

interface Props {
  components: PlacedComponent[];
  wires: Wire[];
  result: CircuitResult;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onAddWire: (from: TerminalRef, to: TerminalRef) => void;
  onRemoveWire: (id: string) => void;
  onTap: (id: string) => void;
}

export const CanvasBoard = forwardRef<SVGSVGElement, Props>(function CanvasBoard(
  { components, wires, result, selectedId, onSelect, onMove, onAddWire, onRemoveWire, onTap },
  ref,
) {
  const [drag, setDrag] = useState<DragState>(null);

  const liveWireIds = useMemo(() => new Set(result.liveWireIds), [result.liveWireIds]);

  const allTerminals = useMemo(() => {
    const list: { componentId: string; terminal: string; x: number; y: number }[] = [];
    for (const c of components) {
      const visual = COMPONENT_VISUALS[c.type];
      for (const name of Object.keys(visual.terminals)) {
        const p = terminalWorldPos(c.x, c.y, c.type, name);
        list.push({ componentId: c.id, terminal: name, x: p.x, y: p.y });
      }
    }
    return list;
  }, [components]);

  const getSvg = (e: { currentTarget: SVGSVGElement }) => e.currentTarget;

  const handleBodyPointerDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    const p = clientToSvgPoint(svg, e.clientX, e.clientY);
    onSelect(id);
    setDrag({ kind: 'move', id, offsetX: p.x - comp.x, offsetY: p.y - comp.y, pointerId: e.pointerId });
  };

  const handleTerminalPointerDown = (e: React.PointerEvent<SVGCircleElement>, id: string, terminal: string) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    const p = clientToSvgPoint(svg, e.clientX, e.clientY);
    onSelect(id);
    setDrag({ kind: 'wire', from: { componentId: id, terminal }, x: p.x, y: p.y, pointerId: e.pointerId });
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const svg = getSvg(e);
    const p = clientToSvgPoint(svg, e.clientX, e.clientY);
    if (drag.kind === 'move') {
      onMove(drag.id, p.x - drag.offsetX, p.y - drag.offsetY);
    } else if (drag.kind === 'wire') {
      setDrag({ ...drag, x: p.x, y: p.y });
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    if (drag.kind === 'wire') {
      const svg = getSvg(e);
      const p = clientToSvgPoint(svg, e.clientX, e.clientY);
      let nearest: { componentId: string; terminal: string; dist: number } | null = null;
      for (const t of allTerminals) {
        if (t.componentId === drag.from.componentId && t.terminal === drag.from.terminal) continue;
        const dist = Math.hypot(t.x - p.x, t.y - p.y);
        if (dist <= TERMINAL_SNAP_RADIUS && (!nearest || dist < nearest.dist)) {
          nearest = { componentId: t.componentId, terminal: t.terminal, dist };
        }
      }
      if (nearest) {
        onAddWire(drag.from, { componentId: nearest.componentId, terminal: nearest.terminal });
      }
    }
    setDrag(null);
  };

  const draft =
    drag?.kind === 'wire'
      ? (() => {
          const fromComp = components.find((c) => c.id === drag.from.componentId);
          if (!fromComp) return null;
          const p1 = terminalWorldPos(fromComp.x, fromComp.y, fromComp.type, drag.from.terminal);
          return { x1: p1.x, y1: p1.y, x2: drag.x, y2: drag.y };
        })()
      : null;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ touchAction: 'none', display: 'block', background: 'var(--bg)' }}
      onPointerMove={handleSvgPointerMove}
      onPointerUp={handleSvgPointerUp}
      onPointerDown={() => onSelect(null)}
    >
      <defs>
        <pattern id="grid" width={32} height={32} patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border)" strokeWidth={1} opacity={0.4} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />

      <WireLayer
        wires={wires}
        components={components}
        liveWireIds={liveWireIds}
        onWireTap={onRemoveWire}
        draft={draft}
      />

      {components.map((c) => (
        <ComponentNode
          key={c.id}
          comp={c}
          device={result.devices[c.id]}
          coilDevice={c.type === 'relay' ? result.devices[`${c.id}:coil`] : undefined}
          selected={c.id === selectedId}
          onBodyPointerDown={handleBodyPointerDown}
          onTerminalPointerDown={handleTerminalPointerDown}
          onTap={onTap}
        />
      ))}
    </svg>
  );
});
