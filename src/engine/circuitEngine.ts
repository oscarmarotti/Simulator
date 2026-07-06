import { allEdgeSpecs, buildFlowUnionFind, buildStrictUnionFind, edgeKeysForComponent, findProtectorsForLoad, tid, tidRef } from './graph';
import { solveOnce } from './solveOnce';
import type { CircuitComponent, CircuitResult, DeviceResult, SourceComponent, TripEvent, Wire } from './types';
import { CURRENT_EPSILON, PICKUP_RATIO, sourceTerminalNames, UNPROTECTED_BURN_CURRENT_A } from './types';

const MAX_ITERATIONS = 25;

function cloneComponents(components: CircuitComponent[]): CircuitComponent[] {
  return components.map((c) => ({ ...c }));
}

function sourceTerminalPairs(s: SourceComponent): Array<[string, string]> {
  const names = sourceTerminalNames(s.phase);
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) pairs.push([names[i], names[j]]);
  }
  return pairs;
}

function isDeadShort(components: CircuitComponent[], wires: Wire[]): boolean {
  const strict = buildStrictUnionFind(components, wires);
  return components.some(
    (c) =>
      c.type === 'source' &&
      c.on &&
      sourceTerminalPairs(c).some(([a, b]) => strict.connected(tid(c.id, a), tid(c.id, b))),
  );
}

function motorIsDirectAcrossSource(
  strict: ReturnType<typeof buildStrictUnionFind>,
  motorId: string,
  sources: SourceComponent[],
): boolean {
  const a = strict.find(tid(motorId, 'in'));
  const b = strict.find(tid(motorId, 'out'));
  return sources.some((s) => {
    if (!s.on) return false;
    return sourceTerminalPairs(s).some(([t1, t2]) => {
      const n1 = strict.find(tid(s.id, t1));
      const n2 = strict.find(tid(s.id, t2));
      return (a === n1 && b === n2) || (a === n2 && b === n1);
    });
  });
}

/**
 * Solves a full circuit "tick": two-stage relay resolution, then an iterative
 * convergence loop that re-derives motor run/stall state, trips breakers,
 * blows fuses, and burns out unprotected overloaded loads until stable.
 */
export function solveCircuit(inputComponents: CircuitComponent[], wires: Wire[]): CircuitResult {
  const state = cloneComponents(inputComponents);
  const sources = state.filter((c): c is SourceComponent => c.type === 'source');
  const sourceTerminalIds = sources.flatMap((s) => sourceTerminalNames(s.phase).map((t) => tid(s.id, t)));
  const warnings: string[] = [];
  const tripEvents = new Map<string, TripEvent>();

  // --- Relay stage 1: assume every NO contact is open, see which coils energise ---
  const stage1 = state.map((c) => (c.type === 'relay' ? { ...c, contactClosed: false } : c));
  const stage1Result = solveOnce(stage1, wires);
  for (const c of state) {
    if (c.type !== 'relay') continue;
    const reading = stage1Result.readings.get(`${c.id}:coil`);
    const vAcross = reading?.voltageAcross ?? 0;
    c.contactClosed = vAcross >= PICKUP_RATIO * c.coilRatedVoltage;
  }

  // --- Relay stage 2 + convergence loop: motor stall, breaker trips, fuse blows, burns ---
  let result = solveOnce(state, wires);
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const strict = buildStrictUnionFind(state, wires);
    const deadShort = sources.some(
      (s) => s.on && sourceTerminalPairs(s).some(([a, b]) => strict.connected(tid(s.id, a), tid(s.id, b))),
    );

    for (const c of state) {
      if (c.type === 'motor' && !c.burnedOut) {
        c.stalled = !motorIsDirectAcrossSource(strict, c.id, sources);
      }
    }

    result = solveOnce(state, wires);

    let changed = false;
    for (const c of state) {
      if (c.type === 'mcb' && !c.tripped) {
        const maxCurrent = Math.max(0, ...edgeKeysForComponent(c).map((k) => result.readings.get(k)?.current ?? 0));
        if (maxCurrent > c.rating) {
          c.tripped = true;
          changed = true;
          tripEvents.set(c.id, deadShort ? 'SHORT_CIRCUIT' : 'OVERLOAD');
        }
      }
      if (c.type === 'fuse' && !c.blown) {
        const current = result.readings.get(c.id)?.current ?? 0;
        if (current > c.rating) {
          c.blown = true;
          changed = true;
          tripEvents.set(c.id, deadShort ? 'SHORT_CIRCUIT' : 'OVERLOAD');
        }
      }
    }

    if (changed) {
      result = solveOnce(state, wires);
    }

    {
      let burnChanged = false;
      for (const c of state) {
        if ((c.type === 'lamp' || c.type === 'motor') && !c.burnedOut) {
          const current = result.readings.get(c.id)?.current ?? 0;
          if (current > UNPROTECTED_BURN_CURRENT_A) {
            const protectors = findProtectorsForLoad(state, wires, c.id, sourceTerminalIds);
            if (protectors.length === 0) {
              c.burnedOut = true;
              burnChanged = true;
              tripEvents.set(c.id, deadShort ? 'SHORT_CIRCUIT' : 'OVERLOAD');
            }
          }
        }
      }
      if (burnChanged) {
        changed = true;
        result = solveOnce(state, wires);
      }
    }

    if (!changed) break;
  }

  if (isDeadShort(state, wires)) {
    warnings.push('SHORT_CIRCUIT_UNPROTECTED');
  }

  const devices: Record<string, DeviceResult> = {};

  for (const c of state) {
    if (c.type === 'source') continue;

    if (c.type === 'mcb' && c.poles > 1) {
      // Report both a representative (worst-pole) entry under the component id,
      // and a per-pole breakdown so the UI can show each line's own current.
      const poleKeys = edgeKeysForComponent(c);
      let worst = { current: 0, voltageAcross: 0 };
      for (const k of poleKeys) {
        const reading = result.readings.get(k) ?? { current: 0, voltageAcross: 0 };
        devices[k] = {
          id: k,
          type: c.type,
          current: reading.current,
          voltageAcross: reading.voltageAcross,
          powerW: reading.current * reading.voltageAcross,
          tripEvent: tripEvents.get(c.id) ?? null,
          protectedBy: [],
        };
        if (reading.current > worst.current) worst = reading;
      }
      devices[c.id] = {
        id: c.id,
        type: c.type,
        current: worst.current,
        voltageAcross: worst.voltageAcross,
        powerW: worst.current * worst.voltageAcross,
        tripEvent: tripEvents.get(c.id) ?? null,
        protectedBy: [],
      };
      continue;
    }

    const key = c.id;
    const reading = result.readings.get(key);
    const current = reading?.current ?? 0;
    const voltageAcross = reading?.voltageAcross ?? 0;

    let protectedBy: string[] = [];
    if (c.type === 'lamp' || c.type === 'motor') {
      protectedBy = findProtectorsForLoad(state, wires, c.id, sourceTerminalIds);
    }

    devices[key] = {
      id: c.id,
      type: c.type,
      current,
      voltageAcross,
      powerW: voltageAcross * current,
      tripEvent: tripEvents.get(c.id) ?? null,
      protectedBy,
    };

    if (c.type === 'relay') {
      const coilReading = result.readings.get(`${c.id}:coil`);
      devices[`${c.id}:coil`] = {
        id: `${c.id}:coil`,
        type: c.type,
        current: coilReading?.current ?? 0,
        voltageAcross: coilReading?.voltageAcross ?? 0,
        powerW: (coilReading?.current ?? 0) * (coilReading?.voltageAcross ?? 0),
        tripEvent: null,
        protectedBy: [],
      };
    }
  }

  // Flow pass: which wires currently sit in a live (current-carrying) branch,
  // for the UI to animate. A supernode is "live" if any device touching it
  // carries measurable current; a wire is live if both its ends are.
  const flowUF = buildFlowUnionFind(state, wires);
  const liveSupernodes = new Set<string>();
  for (const e of allEdgeSpecs(state)) {
    const reading = result.readings.get(e.key);
    if (reading && reading.current > CURRENT_EPSILON) {
      liveSupernodes.add(flowUF.find(e.t1));
      liveSupernodes.add(flowUF.find(e.t2));
    }
  }
  const liveWireIds = wires
    .filter((w) => liveSupernodes.has(flowUF.find(tidRef(w.from))) && liveSupernodes.has(flowUF.find(tidRef(w.to))))
    .map((w) => w.id);

  return { components: state, devices, warnings, liveWireIds };
}
