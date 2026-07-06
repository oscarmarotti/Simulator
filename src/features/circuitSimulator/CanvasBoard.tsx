import { forwardRef, useMemo, useRef, useState } from 'react';
import { buildWireUnionFind, tidRef } from '../../engine/graph';
import type { CircuitResult, TerminalRef, Wire } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { ComponentNode } from './ComponentNode';
import { getComponentVisual, terminalWorldPos } from './layout';
import { clientToSvgPoint } from './svgCoords';
import { useCanvasView } from './useCanvasView';
import { WireLayer } from './WireLayer';
import { ZoomControls } from './ZoomControls';

// Initial viewBox: sized close to real component/screen proportions so a
// fresh canvas isn't zoomed miles out. The grid/pan area extends well beyond
// this - it's just the starting window, not a hard canvas boundary.
export const INITIAL_VIEW_WIDTH = 640;
export const INITIAL_VIEW_HEIGHT = 480;
const TERMINAL_SNAP_RADIUS = 26;

interface PinchAnchor {
  distance0: number;
  midClient0: { x: number; y: number };
  viewBox0: { x: number; y: number; w: number; h: number };
  svgRect0: DOMRect;
  contentAtMid0: { x: number; y: number };
}

type DragState =
  | { kind: 'move'; id: string; offsetX: number; offsetY: number; pointerId: number }
  | { kind: 'wire'; from: TerminalRef; x: number; y: number; pointerId: number }
  | {
      kind: 'pan';
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startViewBox: { x: number; y: number; w: number; h: number };
      svgRect: DOMRect;
    }
  | { kind: 'pinch'; anchor: PinchAnchor }
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
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const backgroundPointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const localSvgRef = useRef<SVGSVGElement | null>(null);
  const setSvgRef = (node: SVGSVGElement | null) => {
    localSvgRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<SVGSVGElement | null>).current = node;
  };
  const { viewBox, setViewBox, zoomAt, zoomAtCenter, reset } = useCanvasView({
    x: -40,
    y: -40,
    w: INITIAL_VIEW_WIDTH,
    h: INITIAL_VIEW_HEIGHT,
  });

  const liveWireIds = useMemo(() => new Set(result.liveWireIds), [result.liveWireIds]);

  const wireUF = useMemo(() => buildWireUnionFind(wires), [wires]);
  const highlightedNetNode = useMemo(() => {
    if (!selectedWireId) return null;
    const w = wires.find((w) => w.id === selectedWireId);
    return w ? wireUF.find(tidRef(w.from)) : null;
  }, [selectedWireId, wires, wireUF]);
  const highlightedWireIds = useMemo(() => {
    if (!highlightedNetNode) return new Set<string>();
    return new Set(wires.filter((w) => wireUF.find(tidRef(w.from)) === highlightedNetNode).map((w) => w.id));
  }, [wires, highlightedNetNode]);
  const isTerminalHighlighted = (componentId: string, terminal: string) =>
    highlightedNetNode !== null && wireUF.find(`${componentId}:${terminal}`) === highlightedNetNode;

  const allTerminals = useMemo(() => {
    const list: { componentId: string; terminal: string; x: number; y: number }[] = [];
    for (const c of components) {
      const visual = getComponentVisual(c);
      for (const name of Object.keys(visual.terminals)) {
        const p = terminalWorldPos(c.x, c.y, c, name);
        if (p) list.push({ componentId: c.id, terminal: name, x: p.x, y: p.y });
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
    setSelectedWireId(null);
    setDrag({ kind: 'move', id, offsetX: p.x - comp.x, offsetY: p.y - comp.y, pointerId: e.pointerId });
  };

  const handleTerminalPointerDown = (e: React.PointerEvent<SVGCircleElement>, id: string, terminal: string) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    const p = clientToSvgPoint(svg, e.clientX, e.clientY);
    onSelect(id);
    setSelectedWireId(null);
    setDrag({ kind: 'wire', from: { componentId: id, terminal }, x: p.x, y: p.y, pointerId: e.pointerId });
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    onSelect(null);
    setSelectedWireId(null);
    const svg = e.currentTarget;
    svg.setPointerCapture(e.pointerId);
    backgroundPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (backgroundPointers.current.size === 1) {
      setDrag({
        kind: 'pan',
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startViewBox: { ...viewBox },
        svgRect: svg.getBoundingClientRect(),
      });
    } else if (backgroundPointers.current.size === 2) {
      const pts = [...backgroundPointers.current.values()];
      const svgRect0 = svg.getBoundingClientRect();
      const midClient0 = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const contentAtMid0 = clientToSvgPoint(svg, midClient0.x, midClient0.y);
      setDrag({
        kind: 'pinch',
        anchor: {
          distance0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
          midClient0,
          viewBox0: { ...viewBox },
          svgRect0,
          contentAtMid0,
        },
      });
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (backgroundPointers.current.has(e.pointerId)) {
      backgroundPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (!drag) return;
    const svg = getSvg(e);

    if (drag.kind === 'move') {
      const p = clientToSvgPoint(svg, e.clientX, e.clientY);
      onMove(drag.id, p.x - drag.offsetX, p.y - drag.offsetY);
    } else if (drag.kind === 'wire') {
      const p = clientToSvgPoint(svg, e.clientX, e.clientY);
      setDrag({ ...drag, x: p.x, y: p.y });
    } else if (drag.kind === 'pan') {
      const scaleX = drag.startViewBox.w / drag.svgRect.width;
      const scaleY = drag.startViewBox.h / drag.svgRect.height;
      const dx = (e.clientX - drag.startClientX) * scaleX;
      const dy = (e.clientY - drag.startClientY) * scaleY;
      setViewBox({ ...drag.startViewBox, x: drag.startViewBox.x - dx, y: drag.startViewBox.y - dy });
    } else if (drag.kind === 'pinch') {
      const pts = [...backgroundPointers.current.values()];
      if (pts.length < 2) return;
      const { anchor } = drag;
      const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const scale = anchor.distance0 / distance;
      const newW = Math.min(3600, Math.max(300, anchor.viewBox0.w * scale));
      const actualScale = newW / anchor.viewBox0.w;
      const newH = anchor.viewBox0.h * actualScale;
      const fracX = (midClient.x - anchor.svgRect0.left) / anchor.svgRect0.width;
      const fracY = (midClient.y - anchor.svgRect0.top) / anchor.svgRect0.height;
      const newX = anchor.contentAtMid0.x - fracX * newW;
      const newY = anchor.contentAtMid0.y - fracY * newH;
      setViewBox({ x: newX, y: newY, w: newW, h: newH });
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    backgroundPointers.current.delete(e.pointerId);
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
    if ((drag.kind === 'pan' || drag.kind === 'pinch') && backgroundPointers.current.size > 0) {
      return; // still one finger down (was pinching, now down to one) - end cleanly without resuming pan
    }
    setDrag(null);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
    zoomAt(e.currentTarget, e.clientX, e.clientY, factor);
  };

  const handleWireTap = (id: string) => {
    setSelectedWireId((prev) => (prev === id ? null : id));
    onSelect(null);
  };

  const draft =
    drag?.kind === 'wire'
      ? (() => {
          const fromComp = components.find((c) => c.id === drag.from.componentId);
          if (!fromComp) return null;
          const p1 = terminalWorldPos(fromComp.x, fromComp.y, fromComp, drag.from.terminal);
          if (!p1) return null;
          return { x1: p1.x, y1: p1.y, x2: drag.x, y2: drag.y };
        })()
      : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={setSvgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        style={{ touchAction: 'none', display: 'block', background: 'var(--bg)', width: '100%', height: '100%' }}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerCancel={handleSvgPointerUp}
        onPointerDown={handleBackgroundPointerDown}
        onWheel={handleWheel}
      >
        <defs>
          <pattern id="grid" width={32} height={32} patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border)" strokeWidth={1} opacity={0.4} />
          </pattern>
        </defs>
        <rect x={-2000} y={-2000} width={6000} height={6000} fill="url(#grid)" />

        <WireLayer
          wires={wires}
          components={components}
          liveWireIds={liveWireIds}
          highlightedWireIds={highlightedWireIds}
          selectedWireId={selectedWireId}
          onWireTap={handleWireTap}
          onDeleteWire={onRemoveWire}
          draft={draft}
        />

        {components.map((c) => (
          <ComponentNode
            key={c.id}
            comp={c}
            device={result.devices[c.id]}
            coilDevice={c.type === 'relay' ? result.devices[`${c.id}:coil`] : undefined}
            selected={c.id === selectedId}
            isTerminalHighlighted={isTerminalHighlighted}
            onBodyPointerDown={handleBodyPointerDown}
            onTerminalPointerDown={handleTerminalPointerDown}
            onTap={onTap}
          />
        ))}
      </svg>

      <ZoomControls
        onZoomIn={(svg) => zoomAtCenter(svg, 1 / 1.3)}
        onZoomOut={(svg) => zoomAtCenter(svg, 1.3)}
        onReset={reset}
        getSvg={() => localSvgRef.current}
      />
    </div>
  );
});
