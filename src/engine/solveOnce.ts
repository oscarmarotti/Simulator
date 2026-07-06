import { fromPolar, magnitude, sub, type Complex, ZERO } from './complex';
import { solveComplexLinearSystem } from './linearSolve';
import { allEdgeSpecs, buildWireUnionFind, tid } from './graph';
import type { CircuitComponent, Wire } from './types';

export interface EdgeReading {
  current: number; // A, magnitude
  voltageAcross: number; // V, magnitude
}

export interface OnceResult {
  readings: Map<string, EdgeReading>; // keyed by edge key (componentId, or `${id}:coil` / `${id}:contact` / `${id}:poleN`)
  nodeVoltage: (canonicalNode: string) => number; // magnitude, for relay pickup checks etc.
  canonicalNode: (terminalId: string) => string;
}

const PHASE_ANGLE_DEG: Record<string, number> = {
  L: 0,
  L1: 0,
  L2: -120,
  L3: -240,
};

/**
 * Resistive nodal-analysis solve: wires are merged into exact-zero-resistance
 * supernodes (via union-find), while every device (even when "closed") keeps a
 * small-but-nonzero resistance so its individual branch current can be read
 * out directly from Ohm's law after solving node voltages. Source terminals
 * are fixed-voltage boundary nodes: N (and any neutral) is the 0V reference,
 * and each line terminal is a voltage phasor (magnitude = source.voltage,
 * angle 0/-120/-240 degrees for a 3-phase source). Solving with complex
 * phasors - rather than plain real numbers - is what makes a 3-phase load
 * wired line-to-line correctly see sqrt(3) x the phase-to-neutral voltage
 * (e.g. 380V across L1-L2 when each line is 220V from neutral).
 */
export function solveOnce(components: CircuitComponent[], wires: Wire[]): OnceResult {
  const wireUF = buildWireUnionFind(wires);
  const canonicalNode = (t: string) => wireUF.find(t);

  const edges = allEdgeSpecs(components);

  const fixed = new Map<string, Complex>();
  for (const c of components) {
    if (c.type !== 'source' || !c.on) continue;
    for (const terminal of c.phase === 'three' ? ['L1', 'L2', 'L3', 'N'] : ['L', 'N']) {
      const node = canonicalNode(tid(c.id, terminal));
      if (fixed.has(node)) continue;
      const value = terminal === 'N' ? ZERO : fromPolar(c.voltage, PHASE_ANGLE_DEG[terminal]);
      fixed.set(node, value);
    }
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
    // No energised source anywhere: nothing is energised.
    for (const e of edges) readings.set(e.key, { current: 0, voltageAcross: 0 });
    return { readings, nodeVoltage: () => 0, canonicalNode };
  }

  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const bRe: number[] = new Array(n).fill(0);
  const bIm: number[] = new Array(n).fill(0);

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
      bRe[i2] += g * f1.re;
      bIm[i2] += g * f1.im;
    } else if (f2 !== undefined) {
      const i1 = idx.get(n1)!;
      A[i1][i1] += g;
      bRe[i1] += g * f2.re;
      bIm[i1] += g * f2.im;
    } else {
      const i1 = idx.get(n1)!;
      const i2 = idx.get(n2)!;
      A[i1][i1] += g;
      A[i2][i2] += g;
      A[i1][i2] -= g;
      A[i2][i1] -= g;
    }
  }

  const { re, im } = solveComplexLinearSystem(A, bRe, bIm);
  const nodeVoltagePhasor = (node: string): Complex =>
    fixed.get(node) ?? { re: re[idx.get(node)!] ?? 0, im: im[idx.get(node)!] ?? 0 };
  const nodeVoltage = (node: string) => magnitude(nodeVoltagePhasor(node));

  for (const e of edges) {
    const n1 = canonicalNode(e.t1);
    const n2 = canonicalNode(e.t2);
    const vAcross = sub(nodeVoltagePhasor(n1), nodeVoltagePhasor(n2));
    const vMag = magnitude(vAcross);
    const current = vMag / e.r;
    readings.set(e.key, { current, voltageAcross: vMag });
  }

  return { readings, nodeVoltage, canonicalNode };
}
