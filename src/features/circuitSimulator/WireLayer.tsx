import type { Wire } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { orthogonalPath, terminalWorldPos } from './layout';

export function WireLayer({
  wires,
  components,
  liveWireIds,
  onWireTap,
  draft,
}: {
  wires: Wire[];
  components: PlacedComponent[];
  liveWireIds: Set<string>;
  onWireTap: (id: string) => void;
  draft?: { x1: number; y1: number; x2: number; y2: number } | null;
}) {
  const byId = new Map(components.map((c) => [c.id, c]));

  return (
    <g>
      {wires.map((w) => {
        const fromComp = byId.get(w.from.componentId);
        const toComp = byId.get(w.to.componentId);
        if (!fromComp || !toComp) return null;
        const p1 = terminalWorldPos(fromComp.x, fromComp.y, fromComp.type, w.from.terminal);
        const p2 = terminalWorldPos(toComp.x, toComp.y, toComp.type, w.to.terminal);
        const live = liveWireIds.has(w.id);
        const d = orthogonalPath(p1.x, p1.y, p2.x, p2.y);
        return (
          <g key={w.id}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              onPointerDown={(e) => {
                e.stopPropagation();
                onWireTap(w.id);
              }}
              style={{ cursor: 'pointer', touchAction: 'none' }}
            />
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
