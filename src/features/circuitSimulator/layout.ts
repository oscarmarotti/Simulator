import type { CircuitComponent, PhaseMode, PoleCount } from '../../engine/types';

export interface TerminalPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ComponentVisual {
  width: number;
  height: number;
  terminals: Record<string, TerminalPoint>;
}

// All components use a left(in)/right(out) convention so wires auto-route
// cleanly left-to-right, like a ladder diagram. The relay additionally has a
// coil pair on the left and a contact pair on the right. Source and MCB
// visuals are computed dynamically below since their terminal count depends
// on phase mode / pole count.
const STATIC_VISUALS = {
  switch: {
    width: 80,
    height: 70,
    terminals: {
      in: { x: 0, y: 35 },
      out: { x: 80, y: 35 },
    },
  },
  fuse: {
    width: 90,
    height: 60,
    terminals: {
      in: { x: 0, y: 30 },
      out: { x: 90, y: 30 },
    },
  },
  relay: {
    width: 150,
    height: 100,
    terminals: {
      A1: { x: 0, y: 24 },
      A2: { x: 0, y: 76 },
      C: { x: 150, y: 24 },
      NO: { x: 150, y: 76 },
    },
  },
  lamp: {
    width: 80,
    height: 96,
    terminals: {
      in: { x: 0, y: 88 },
      out: { x: 80, y: 88 },
    },
  },
} as const satisfies Record<string, ComponentVisual>;

/** Bigger HP motors get a visibly bigger, more robust-looking body. */
export function motorBodySize(ratedHp: number): number {
  return Math.round(72 + Math.min(3, ratedHp) * 18);
}

function motorVisual(ratedHp: number): ComponentVisual {
  const size = motorBodySize(ratedHp);
  return {
    width: size,
    height: size + 8,
    terminals: {
      in: { x: 0, y: size },
      out: { x: size, y: size },
    },
  };
}

function sourceVisual(phase: PhaseMode): ComponentVisual {
  if (phase === 'single') {
    return {
      width: 100,
      height: 80,
      terminals: { L: { x: 0, y: 26 }, N: { x: 0, y: 54 } },
    };
  }
  return {
    width: 130,
    height: 168,
    terminals: {
      L1: { x: 0, y: 24 },
      L2: { x: 0, y: 56 },
      L3: { x: 0, y: 88 },
      N: { x: 0, y: 120 },
    },
  };
}

const MCB_POLE_WIDTH = 42;

function mcbVisual(poles: PoleCount): ComponentVisual {
  if (poles === 1) {
    return {
      width: 70,
      height: 96,
      terminals: { in: { x: 35, y: 0 }, out: { x: 35, y: 96 } },
    };
  }
  const width = MCB_POLE_WIDTH * poles + 16;
  const terminals: Record<string, TerminalPoint> = {};
  for (let i = 1; i <= poles; i++) {
    const x = 8 + MCB_POLE_WIDTH * (i - 1) + MCB_POLE_WIDTH / 2;
    terminals[`in${i}`] = { x, y: 0 };
    terminals[`out${i}`] = { x, y: 96 };
  }
  return { width, height: 96, terminals };
}

export function getComponentVisual(c: CircuitComponent): ComponentVisual {
  if (c.type === 'source') return sourceVisual(c.phase);
  if (c.type === 'mcb') return mcbVisual(c.poles);
  if (c.type === 'motor') return motorVisual(c.ratedHp);
  return STATIC_VISUALS[c.type];
}

/**
 * Returns null if the terminal no longer exists on this component - e.g. a
 * wire drawn to an MCB's 3rd pole before the user dialled it back down to 1P.
 * Callers should skip rendering/using that wire rather than crash.
 */
export function terminalWorldPos(
  compX: number,
  compY: number,
  comp: CircuitComponent,
  terminal: string,
): { x: number; y: number } | null {
  const visual = getComponentVisual(comp);
  const t = visual.terminals[terminal];
  if (!t) return null;
  return { x: compX + t.x, y: compY + t.y };
}

/** Orthogonal (right-angle) 3-segment routing between two points, elbowed at the horizontal midpoint. */
export function orthogonalPath(x1: number, y1: number, x2: number, y2: number): string {
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midX = Math.round((x1 + x2) / 2);
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}
