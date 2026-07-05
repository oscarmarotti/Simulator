import { describe, expect, it } from 'vitest';
import { solveCircuit } from './circuitEngine';
import { makeFuse, makeLamp, makeMcb, makeMotor, makeRelay, makeSource, makeSwitch } from './factory';
import type { CircuitComponent, Wire } from './types';

function wire(id: string, fromComp: string, fromT: string, toComp: string, toT: string): Wire {
  return { id, from: { componentId: fromComp, terminal: fromT }, to: { componentId: toComp, terminal: toT } };
}

describe('solveCircuit', () => {
  it('lights a single lamp directly across the source at rated power', () => {
    const source = makeSource('src', 220);
    const lamp = makeLamp('lamp1', 100, 220);
    const components: CircuitComponent[] = [source, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'lamp1', 'in'),
      wire('w2', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const d = result.devices['lamp1'];
    expect(d.voltageAcross).toBeCloseTo(220, 0);
    expect(d.powerW).toBeCloseTo(100, 0);
    expect(d.current).toBeCloseTo(100 / 220, 2);
  });

  it('series: two identical lamps both light up, each dimmer (half voltage)', () => {
    const source = makeSource('src', 220);
    const lamp1 = makeLamp('lamp1', 100, 220);
    const lamp2 = makeLamp('lamp2', 100, 220);
    const components: CircuitComponent[] = [source, lamp1, lamp2];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'lamp1', 'in'),
      wire('w2', 'lamp1', 'out', 'lamp2', 'in'),
      wire('w3', 'lamp2', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const d1 = result.devices['lamp1'];
    const d2 = result.devices['lamp2'];
    // Equal resistances in series -> equal voltage split, each dimmer than full 220V
    expect(d1.voltageAcross).toBeCloseTo(110, 0);
    expect(d2.voltageAcross).toBeCloseTo(110, 0);
    expect(d1.current).toBeGreaterThan(0);
    expect(d2.current).toBeGreaterThan(0);
    expect(d1.current).toBeCloseTo(d2.current, 5);
    // Much dimmer than the single-lamp case (100W at 220V)
    expect(d1.powerW).toBeLessThan(50);
  });

  it('parallel: two lamps each get full source voltage and light independently', () => {
    const source = makeSource('src', 220);
    const lamp1 = makeLamp('lamp1', 100, 220);
    const lamp2 = makeLamp('lamp2', 60, 220);
    const components: CircuitComponent[] = [source, lamp1, lamp2];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'lamp1', 'in'),
      wire('w2', 'lamp1', 'out', 'src', 'N'),
      wire('w3', 'src', 'L', 'lamp2', 'in'),
      wire('w4', 'lamp2', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const d1 = result.devices['lamp1'];
    const d2 = result.devices['lamp2'];
    expect(d1.voltageAcross).toBeCloseTo(220, 0);
    expect(d2.voltageAcross).toBeCloseTo(220, 0);
    expect(d1.powerW).toBeCloseTo(100, 0);
    expect(d2.powerW).toBeCloseTo(60, 0);
  });

  it('direct short (L to N with only a switch, no load) trips nothing but flags unprotected', () => {
    const source = makeSource('src', 220);
    const sw = makeSwitch('sw1', true);
    const components: CircuitComponent[] = [source, sw];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'sw1', 'in'),
      wire('w2', 'sw1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    expect(result.warnings).toContain('SHORT_CIRCUIT_UNPROTECTED');
  });

  it('direct short protected by a breaker trips it immediately as SHORT_CIRCUIT', () => {
    const source = makeSource('src', 220);
    const mcb = makeMcb('mcb1', 16, 'C');
    const components: CircuitComponent[] = [source, mcb];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'mcb1', 'in'),
      wire('w2', 'mcb1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedMcb = result.components.find((c) => c.id === 'mcb1');
    expect(updatedMcb && 'tripped' in updatedMcb && updatedMcb.tripped).toBe(true);
    expect(result.devices['mcb1'].tripEvent).toBe('SHORT_CIRCUIT');
    expect(result.warnings).not.toContain('SHORT_CIRCUIT_UNPROTECTED');
  });

  it('overload on a lamp protected by an undersized breaker trips the breaker as OVERLOAD', () => {
    const source = makeSource('src', 220);
    const mcb = makeMcb('mcb1', 6, 'C'); // 6A breaker
    const lamp = makeLamp('lamp1', 2000, 220); // ~9A load, exceeds 6A rating
    const components: CircuitComponent[] = [source, mcb, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'mcb1', 'in'),
      wire('w2', 'mcb1', 'out', 'lamp1', 'in'),
      wire('w3', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    expect(result.devices['mcb1'].tripEvent).toBe('OVERLOAD');
    const updatedMcb = result.components.find((c) => c.id === 'mcb1');
    expect(updatedMcb && 'tripped' in updatedMcb && updatedMcb.tripped).toBe(true);
    // Lamp itself should not have burned out - the breaker protected it.
    const updatedLamp = result.components.find((c) => c.id === 'lamp1');
    expect(updatedLamp && 'burnedOut' in updatedLamp && updatedLamp.burnedOut).toBe(false);
  });

  it('overload on a lamp with no protection at all burns it out', () => {
    const source = makeSource('src', 220);
    const lamp = makeLamp('lamp1', 4000, 220); // ~18A, over the 16A safe limit, no mcb/fuse anywhere
    const components: CircuitComponent[] = [source, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'lamp1', 'in'),
      wire('w2', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedLamp = result.components.find((c) => c.id === 'lamp1');
    expect(updatedLamp && 'burnedOut' in updatedLamp && updatedLamp.burnedOut).toBe(true);
  });

  it('a fuse blows on overload and can be identified as the protector for a nested load', () => {
    const source = makeSource('src', 220);
    const fuse = makeFuse('fuse1', 6);
    const sw = makeSwitch('sw1', true);
    const lamp = makeLamp('lamp1', 2000, 220); // ~9A, over the 6A fuse rating
    const components: CircuitComponent[] = [source, fuse, sw, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'fuse1', 'in'),
      wire('w2', 'fuse1', 'out', 'sw1', 'in'),
      wire('w3', 'sw1', 'out', 'lamp1', 'in'),
      wire('w4', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedFuse = result.components.find((c) => c.id === 'fuse1');
    expect(updatedFuse && 'blown' in updatedFuse && updatedFuse.blown).toBe(true);
    expect(result.devices['lamp1'].protectedBy).toContain('fuse1');
  });

  it('motor wired directly across the source runs at full voltage (not stalled)', () => {
    const source = makeSource('src', 220);
    const motor = makeMotor('motor1', 0.5, 220);
    const components: CircuitComponent[] = [source, motor];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'motor1', 'in'),
      wire('w2', 'motor1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedMotor = result.components.find((c) => c.id === 'motor1');
    expect(updatedMotor && 'stalled' in updatedMotor && updatedMotor.stalled).toBe(false);
    expect(result.devices['motor1'].voltageAcross).toBeCloseTo(220, 0);
  });

  it('motor in series with another load stalls and draws locked-rotor current', () => {
    const source = makeSource('src', 220);
    const motor = makeMotor('motor1', 0.5, 220);
    const lamp = makeLamp('lamp1', 100, 220);
    const components: CircuitComponent[] = [source, motor, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'motor1', 'in'),
      wire('w2', 'motor1', 'out', 'lamp1', 'in'),
      wire('w3', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedMotor = result.components.find((c) => c.id === 'motor1');
    expect(updatedMotor && 'stalled' in updatedMotor && updatedMotor.stalled).toBe(true);

    // Stalled: the motor never gets close to its rated 220V because it shares
    // the loop with the lamp.
    expect(result.devices['motor1'].voltageAcross).toBeLessThan(150);

    // Locked-rotor resistance is 1/5th of the running resistance, so the
    // series loop draws MORE current than it would if the motor had (somehow)
    // kept its high running resistance in that same series position.
    const runningRUsedAlone = 220 * 220 / (0.5 * 746);
    const lampR = 220 * 220 / 100;
    const hypotheticalRunningSeriesCurrent = 220 / (runningRUsedAlone + lampR);
    expect(result.devices['motor1'].current).toBeGreaterThan(hypotheticalRunningSeriesCurrent);

    // And a motor that gets full rated voltage alone spins with much less
    // current than the locked-rotor draw would be at that same full voltage.
    const lockedRotorRAtRated = runningRUsedAlone / 5;
    const lockedRotorCurrentAtRatedVoltage = 220 / lockedRotorRAtRated;
    const normalRunningCurrentAtRatedVoltage = 220 / runningRUsedAlone;
    expect(lockedRotorCurrentAtRatedVoltage).toBeCloseTo(normalRunningCurrentAtRatedVoltage * 5, 5);
  });

  it('relay: coil energised through a switch closes the NO contact and powers a separate circuit', () => {
    const source = makeSource('src', 220);
    const controlSwitch = makeSwitch('sw1', true);
    const relay = makeRelay('relay1', 220, 3);
    const lamp = makeLamp('lamp1', 100, 220);
    const components: CircuitComponent[] = [source, controlSwitch, relay, lamp];
    const wires: Wire[] = [
      // control circuit: source -> switch -> relay coil -> source
      wire('w1', 'src', 'L', 'sw1', 'in'),
      wire('w2', 'sw1', 'out', 'relay1', 'A1'),
      wire('w3', 'relay1', 'A2', 'src', 'N'),
      // power circuit: source -> relay NO contact -> lamp -> source
      wire('w4', 'src', 'L', 'relay1', 'C'),
      wire('w5', 'relay1', 'NO', 'lamp1', 'in'),
      wire('w6', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedRelay = result.components.find((c) => c.id === 'relay1');
    expect(updatedRelay && 'contactClosed' in updatedRelay && updatedRelay.contactClosed).toBe(true);
    expect(result.devices['lamp1'].voltageAcross).toBeCloseTo(220, 0);
    expect(result.devices['lamp1'].current).toBeGreaterThan(0);
  });

  it('a reset (un-tripped) breaker re-energises the circuit again', () => {
    const source = makeSource('src', 220);
    const mcb = makeMcb('mcb1', 16, 'C');
    const components: CircuitComponent[] = [source, mcb];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'mcb1', 'in'),
      wire('w2', 'mcb1', 'out', 'src', 'N'),
    ];
    const tripped = solveCircuit(components, wires);
    const trippedMcb = tripped.components.find((c) => c.id === 'mcb1');
    expect(trippedMcb && 'tripped' in trippedMcb && trippedMcb.tripped).toBe(true);

    // User presses reset, but the dead short is still wired up: it should trip again.
    const resetAttempt = solveCircuit(tripped.components.map((c) => (c.id === 'mcb1' ? { ...c, tripped: false } : c)), wires);
    const rearmedMcb = resetAttempt.components.find((c) => c.id === 'mcb1');
    expect(rearmedMcb && 'tripped' in rearmedMcb && rearmedMcb.tripped).toBe(true);
  });

  it('a breaker sized above the load current does not trip', () => {
    const source = makeSource('src', 220);
    const mcb = makeMcb('mcb1', 16, 'C');
    const lamp = makeLamp('lamp1', 100, 220); // ~0.45A, well under 16A
    const components: CircuitComponent[] = [source, mcb, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'mcb1', 'in'),
      wire('w2', 'mcb1', 'out', 'lamp1', 'in'),
      wire('w3', 'lamp1', 'out', 'src', 'N'),
    ];
    const result = solveCircuit(components, wires);
    const updatedMcb = result.components.find((c) => c.id === 'mcb1');
    expect(updatedMcb && 'tripped' in updatedMcb && updatedMcb.tripped).toBe(false);
    expect(result.devices['lamp1'].voltageAcross).toBeCloseTo(220, 0);
  });

  it('relay: coil circuit open means the contact stays open and the power circuit stays dead', () => {
    const source = makeSource('src', 220);
    const controlSwitch = makeSwitch('sw1', false); // control switch off
    const relay = makeRelay('relay1', 220, 3);
    const lamp = makeLamp('lamp1', 100, 220);
    const components: CircuitComponent[] = [source, controlSwitch, relay, lamp];
    const wires: Wire[] = [
      wire('w1', 'src', 'L', 'sw1', 'in'),
      wire('w2', 'sw1', 'out', 'relay1', 'A1'),
      wire('w3', 'relay1', 'A2', 'src', 'N'),
      wire('w4', 'src', 'L', 'relay1', 'C'),
      wire('w5', 'relay1', 'NO', 'lamp1', 'in'),
      wire('w6', 'lamp1', 'out', 'src', 'N'),
    ];

    const result = solveCircuit(components, wires);
    const updatedRelay = result.components.find((c) => c.id === 'relay1');
    expect(updatedRelay && 'contactClosed' in updatedRelay && updatedRelay.contactClosed).toBe(false);
    expect(result.devices['lamp1'].current).toBeCloseTo(0, 5);
  });
});
