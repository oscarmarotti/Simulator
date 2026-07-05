import { solveLinearSystem } from './linearSolve';
import { allEdgeSpecs, buildWireUnionFind, tid } from './graph';
import type { CircuitComponent, Wire } from './types';

export interface EdgeReading {
  current: number; // A, magnitude
  voltageAcross: number; // V, magnitude
}

export interface OnceResult {
  readings: Map<string, EdgeReading>; // keyed by edge key (componentId, or `${id}:coil` / `${id}:contact`)
  nodeVoltage: (canonicalNode: string) => number;
  canonicalNode: (terminalId: string) => string;
}

/**
 * Resistive nodal-analysis solve: wires are merged into exact-zero-resistance
 * supernodes (via union-find), while every device (even when "closed") keeps a
 * small-but-nonzero resistance so its individual branch current can be read
 * out directly from Ohm's law after solving node voltages. Source terminals
 * are fixed-voltage boundary nodes (L = source voltage, N = 0V reference).
 */
export function solveOnce(components: CircuitComponent[], wires: Wire[]): OnceResult {
  const wireUF = buildWireUnionFind(wires);
  const canonicalNode = (t: string) => wireUF.find(t);

  const edges = allEdgeSpecs(components);

  const fixed = new Map<string, number>();
  for (const c of components) {
    if (c.type !== 'source') continue;
    const nL = canonicalNode(tid(c.id, 'L'));
    const nN = canonicalNode(tid(c.id, 'N'));
    if (!fixed.has(nL)) fixed.set(nL, c.voltage);
    if (!fixed.has(nN)) fixed.set(nN, 0);
  }

  const nodeSet = new Set<string>();
  for (const e of edges) {
    nodeSet.add(canonicalNode(e.t1));
    nodeSet.add(canonicalNode(e.t2));
  }
  for (const k of fixed.keys()) nodeSet.add(k);

  const unknownNodes = [...nodeSet].filter((n) => !fixed.has(n));
  const idx = new Map(unknownNodes.map((n, i) => [n, i]));
  const n = unknownNodes.length;

  const readings = new Map<string, EdgeReading>();

  if (fixed.size === 0) {
    // No source anywhere: nothing is energised.
    for (const e of edges) readings.set(e.key, { current: 0, voltageAcross: 0 });
    return { readings, nodeVoltage: () => 0, canonicalNode };
  }

  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const b: number[] = new Array(n).fill(0);

  for (const e of edges) {
    const n1 = canonicalNode(e.t1);
    const n2 = canonicalNode(e.t2);
    if (n1 === n2) continue; // wired directly across itself: no drop, no current
    const g = 1 / e.r;
    const f1 = fixed.get(n1);
    const f2 = fixed.get(n2);
    if (f1 !== undefined && f2 !== undefined) {
      continue; // both fixed; current derived directly from the known drop below
    } else if (f1 !== undefined) {
      const i2 = idx.get(n2)!;
      A[i2][i2] += g;
      b[i2] += g * f1;
    } else if (f2 !== undefined) {
      const i1 = idx.get(n1)!;
      A[i1][i1] += g;
      b[i1] += g * f2;
    } else {
      const i1 = idx.get(n1)!;
      const i2 = idx.get(n2)!;
      A[i1][i1] += g;
      A[i2][i2] += g;
      A[i1][i2] -= g;
      A[i2][i1] -= g;
    }
  }

  const x = solveLinearSystem(A, b);
  const nodeVoltage = (node: string) => (fixed.has(node) ? fixed.get(node)! : (x[idx.get(node)!] ?? 0));

  for (const e of edges) {
    const n1 = canonicalNode(e.t1);
    const n2 = canonicalNode(e.t2);
    const vAcross = nodeVoltage(n1) - nodeVoltage(n2);
    const current = vAcross / e.r;
    readings.set(e.key, { current: Math.abs(current), voltageAcross: Math.abs(vAcross) });
  }

  return { readings, nodeVoltage, canonicalNode };
}
