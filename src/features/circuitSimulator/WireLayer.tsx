import type { Wire } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { orthogonalPath, terminalWorldPos } from './layout';

export function WireLayer({
  wires,
  components,
  liveWireIds,
  highlightedWireIds,
  selectedWireId,
  onWireTap,
  onDeleteWire,
  draft,
}: {
  wires: Wire[];
  components: PlacedComponent[];
  liveWireIds: Set<string>;
  highlightedWireIds: Set<string>;
  selectedWireId: string | null;
  onWireTap: (id: string) => void;
  onDeleteWire: (id: string) => void;
  draft?: { x1: number; y1: number; x2: number; y2: number } | null;
}) {
  const byId = new Map(components.map((c) => [c.id, c]));
  const dimmed = highlightedWireIds.size > 0;

  return (
    <g>
      {wires.map((w) => {
        const fromComp = byId.get(w.from.componentId);
        const toComp = byId.get(w.to.componentId);
        if (!fromComp || !toComp) return null;
        const p1 = terminalWorldPos(fromComp.x, fromComp.y, fromComp, w.from.terminal);
        const p2 = terminalWorldPos(toComp.x, toComp.y, toComp, w.to.terminal);
        if (!p1 || !p2) return null;
        const live = liveWireIds.has(w.id);
        const highlighted = highlightedWireIds.has(w.id);
        const d = orthogonalPath(p1.x, p1.y, p2.x, p2.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        return (
          <g key={w.id} opacity={dimmed && !highlighted ? 0.28 : 1}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={22}
              onPointerDown={(e) => {
                e.stopPropagation();
                onWireTap(w.id);
              }}
              style={{ cursor: 'pointer', touchAction: 'none' }}
            />
            {highlighted && (
              <path
                d={d}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={9}
                strokeLinejoin="round"
                opacity={0.35}
                pointerEvents="none"
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={live ? 'var(--live-wire)' : 'var(--dead-wire)'}
              strokeWidth={live ? 3.5 : 3}
              strokeLinejoin="round"
              pointerEvents="none"
            />
            {live && (
              <path
                d={d}
                fill="none"
                stroke="#fff7cc"
                strokeWidth={1.4}
                strokeDasharray="2 10"
                strokeLinejoin="round"
                pointerEvents="none"
              >
                <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.6s" repeatCount="indefinite" />
              </path>
            )}
            {selectedWireId === w.id && (
              <g
                transform={`translate(${midX}, ${midY})`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onDeleteWire(w.id);
                }}
                style={{ cursor: 'pointer', touchAction: 'none' }}
              >
                <circle r={11} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                <line x1={-4} y1={-4} x2={4} y2={4} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                <line x1={-4} y1={4} x2={4} y2={-4} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}

      {draft && (
        <path
          d={orthogonalPath(draft.x1, draft.y1, draft.x2, draft.y2)}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={3}
          strokeDasharray="5 5"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
