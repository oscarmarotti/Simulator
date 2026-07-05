import type { ComponentType } from '../../engine/types';

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
// coil pair on the left and a contact pair on the right.
export const COMPONENT_VISUALS: Record<ComponentType, ComponentVisual> = {
  source: {
    width: 100,
    height: 80,
    terminals: {
      L: { x: 0, y: 26 },
      N: { x: 0, y: 54 },
    },
  },
  mcb: {
    width: 70,
    height: 96,
    terminals: {
      in: { x: 35, y: 0 },
      out: { x: 35, y: 96 },
    },
  },
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
  motor: {
    width: 96,
    height: 96,
    terminals: {
      in: { x: 0, y: 88 },
      out: { x: 96, y: 88 },
    },
  },
};

export function terminalWorldPos(
  compX: number,
  compY: number,
  type: ComponentType,
  terminal: string,
): { x: number; y: number } {
  const visual = COMPONENT_VISUALS[type];
  const t = visual.terminals[terminal];
  return { x: compX + t.x, y: compY + t.y };
}

/** Orthogonal (right-angle) 3-segment routing between two points, elbowed at the horizontal midpoint. */
export function orthogonalPath(x1: number, y1: number, x2: number, y2: number): string {
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midX = Math.round((x1 + x2) / 2);
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}
