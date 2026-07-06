import type { CircuitComponent, TerminalRef, Wire } from './types';
import { HP_TO_WATT, LOCKED_ROTOR_MULTIPLIER, R_OFF, R_ON } from './types';
import { UnionFind } from './unionFind';

export function tid(componentId: string, terminal: string): string {
  return `${componentId}:${terminal}`;
}

export function tidRef(ref: TerminalRef): string {
  return tid(ref.componentId, ref.terminal);
}

export interface EdgeSpec {
  key: string;
  componentId: string;
  edgeName: string;
  t1: string;
  t2: string;
  r: number;
  isLoad: boolean;
  isProtector: boolean;
  conductive: boolean;
}

function coilResistance(c: Extract<CircuitComponent, { type: 'relay' }>): number {
  return (c.coilRatedVoltage * c.coilRatedVoltage) / c.coilRatedPowerW;
}

function motorResistance(c: Extract<CircuitComponent, { type: 'motor' }>): number {
  if (c.burnedOut) return R_OFF;
  const ratedPowerW = c.ratedHp * HP_TO_WATT;
  const runningR = (c.ratedVoltage * c.ratedVoltage) / ratedPowerW;
  return c.stalled ? runningR / LOCKED_ROTOR_MULTIPLIER : runningR;
}

export function getEdgeSpecs(c: CircuitComponent): EdgeSpec[] {
  switch (c.type) {
    case 'source':
      return [];
    case 'mcb': {
      // Multiple poles trip together (common trip mechanism): the tripped
      // flag is shared, but each pole is its own edge so its own current can
      // be read out (a 3-phase breaker trips if ANY single pole overloads).
      // A breaker also acts as a manual disconnect: "closed" is the operator
      // handle position, independent of a fault trip.
      const conductive = c.closed && !c.tripped;
      if (c.poles === 1) {
        return [
          {
            key: c.id,
            componentId: c.id,
            edgeName: 'main',
            t1: tid(c.id, 'in'),
            t2: tid(c.id, 'out'),
            r: conductive ? R_ON : R_OFF,
            isLoad: false,
            isProtector: true,
            conductive,
          },
        ];
      }
      const edges: EdgeSpec[] = [];
      for (let i = 1; i <= c.poles; i++) {
        edges.push({
          key: `${c.id}:pole${i}`,
          componentId: c.id,
          edgeName: `pole${i}`,
          t1: tid(c.id, `in${i}`),
          t2: tid(c.id, `out${i}`),
          r: conductive ? R_ON : R_OFF,
          isLoad: false,
          isProtector: true,
          conductive,
        });
      }
      return edges;
    }
    case 'switch':
      return [
        {
          key: c.id,
          componentId: c.id,
          edgeName: 'main',
          t1: tid(c.id, 'in'),
          t2: tid(c.id, 'out'),
          r: c.on ? R_ON : R_OFF,
          isLoad: false,
          isProtector: false,
          conductive: c.on,
        },
      ];
    case 'fuse':
      return [
        {
          key: c.id,
          componentId: c.id,
          edgeName: 'main',
          t1: tid(c.id, 'in'),
          t2: tid(c.id, 'out'),
          r: c.blown ? R_OFF : R_ON,
          isLoad: false,
          isProtector: true,
          conductive: !c.blown,
        },
      ];
    case 'relay':
      return [
        {
          key: `${c.id}:coil`,
          componentId: c.id,
          edgeName: 'coil',
          t1: tid(c.id, 'A1'),
          t2: tid(c.id, 'A2'),
          r: coilResistance(c),
          isLoad: true,
          isProtector: false,
          conductive: true,
        },
        {
          key: `${c.id}:contact`,
          componentId: c.id,
          edgeName: 'contact',
          t1: tid(c.id, 'C'),
          t2: tid(c.id, 'NO'),
          r: c.contactClosed ? R_ON : R_OFF,
          isLoad: false,
          isProtector: false,
          conductive: c.contactClosed,
        },
      ];
    case 'lamp':
      return [
        {
          key: c.id,
          componentId: c.id,
          edgeName: 'main',
          t1: tid(c.id, 'in'),
          t2: tid(c.id, 'out'),
          r: c.burnedOut ? R_OFF : (c.ratedVoltage * c.ratedVoltage) / c.ratedPowerW,
          isLoad: true,
          isProtector: false,
          conductive: !c.burnedOut,
        },
      ];
    case 'motor':
      return [
        {
          key: c.id,
          componentId: c.id,
          edgeName: 'main',
          t1: tid(c.id, 'in'),
          t2: tid(c.id, 'out'),
          r: motorResistance(c),
          isLoad: true,
          isProtector: false,
          conductive: !c.burnedOut,
        },
      ];
  }
}

export function allEdgeSpecs(components: CircuitComponent[]): EdgeSpec[] {
  return components.flatMap(getEdgeSpecs);
}

/** Edge keys for a single component's poles/edges (e.g. an mcb's per-pole readings). */
export function edgeKeysForComponent(c: CircuitComponent): string[] {
  return getEdgeSpecs(c).map((e) => e.key);
}

/** Merges only user-drawn wires: defines true electrical node identity. */
export function buildWireUnionFind(wires: Wire[]): UnionFind {
  const uf = new UnionFind();
  for (const w of wires) uf.union(tidRef(w.from), tidRef(w.to));
  return uf;
}

/**
 * Strict pass: wires + closed breakers/switches + healthy fuses + closed relay
 * contacts. Excludes loads. Used for dead-short detection and to test whether
 * a motor sits directly across a source (full rated voltage, so it can spin).
 */
export function buildStrictUnionFind(components: CircuitComponent[], wires: Wire[]): UnionFind {
  const uf = buildWireUnionFind(wires);
  for (const e of allEdgeSpecs(components)) {
    if (!e.isLoad && e.conductive) uf.union(e.t1, e.t2);
  }
  return uf;
}

/**
 * Flow pass: strict conductors + loads (lamp/motor/relay coil) also treated as
 * connectors, so a series chain of loads is recognised as one live circuit.
 */
export function buildFlowUnionFind(components: CircuitComponent[], wires: Wire[]): UnionFind {
  const uf = buildWireUnionFind(wires);
  for (const e of allEdgeSpecs(components)) {
    if (e.conductive) uf.union(e.t1, e.t2);
  }
  return uf;
}

interface AdjEdge {
  to: string;
  protectorId?: string;
}

/**
 * Adjacency list used only to answer "which mcb/fuse sits in this load's
 * wiring path". Protector edges (mcb/fuse) are always traversable here even
 * when tripped/blown, because tripping is precisely the outcome we're
 * explaining - the wiring topology that earns a device its "protector" label
 * doesn't disappear the moment it does its job. Switches and relay contacts
 * still reflect their real state, since those represent a deliberate open
 * path rather than a fault being cleared.
 */
export function buildProtectorAdjacency(
  components: CircuitComponent[],
  wires: Wire[],
  excludeComponentId?: string,
): Map<string, AdjEdge[]> {
  const adj = new Map<string, AdjEdge[]>();
  const addEdge = (a: string, b: string, protectorId?: string) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push({ to: b, protectorId });
    adj.get(b)!.push({ to: a, protectorId });
  };
  for (const w of wires) addEdge(tidRef(w.from), tidRef(w.to));
  for (const c of components) {
    if (c.id === excludeComponentId) continue;
    for (const e of getEdgeSpecs(c)) {
      const passable = e.isProtector ? true : e.conductive;
      if (passable) addEdge(e.t1, e.t2, e.isProtector ? e.componentId : undefined);
    }
  }
  return adj;
}

/** Single-source BFS: protector ids collected along the shortest path to any source terminal. */
function bfsProtectorsFrom(
  adj: Map<string, AdjEdge[]>,
  startNode: string,
  sourceTerminalIds: string[],
): Set<string> {
  const sourceSet = new Set(sourceTerminalIds);
  const visited = new Map<string, Set<string>>();
  visited.set(startNode, new Set());
  const queue = [startNode];
  while (queue.length) {
    const cur = queue.shift()!;
    if (sourceSet.has(cur)) return visited.get(cur)!;
    const curSet = visited.get(cur)!;
    for (const nb of adj.get(cur) ?? []) {
      if (!visited.has(nb.to)) {
        const newSet = new Set(curSet);
        if (nb.protectorId) newSet.add(nb.protectorId);
        visited.set(nb.to, newSet);
        queue.push(nb.to);
      }
    }
  }
  return new Set();
}

/**
 * Finds the mcb/fuse ids protecting a given load (lamp/motor), tracing outward
 * from EACH of the load's own terminals independently (excluding the load's
 * own edge, so tracing from 'in' can't trivially "arrive" via 'out'). This
 * correctly distinguishes the hot leg (which may run through several
 * breakers/fuses/switches, even behind another load in series) from the
 * neutral return leg, instead of conflating both into one search.
 */
export function findProtectorsForLoad(
  components: CircuitComponent[],
  wires: Wire[],
  loadComponentId: string,
  sourceTerminalIds: string[],
): string[] {
  const adj = buildProtectorAdjacency(components, wires, loadComponentId);
  const result = new Set<string>();
  for (const terminal of ['in', 'out']) {
    const found = bfsProtectorsFrom(adj, tid(loadComponentId, terminal), sourceTerminalIds);
    for (const p of found) result.add(p);
  }
  return [...result];
}
