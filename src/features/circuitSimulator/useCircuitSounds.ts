import { useEffect, useRef } from 'react';
import type { CircuitResult } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { playClick, playFusePop, playSpark, setMotorHum } from './sound';

interface PrevState {
  on?: boolean;
  tripped?: boolean;
  blown?: boolean;
  burnedOut?: boolean;
  contactClosed?: boolean;
}

/** Plays one-shot sound effects on state transitions, and drives continuous motor hums. */
export function useCircuitSounds(components: PlacedComponent[], result: CircuitResult) {
  const prevRef = useRef<Map<string, PrevState>>(new Map());
  const prevMotorIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevRef.current;
    const seenMotorIds = new Set<string>();

    for (const c of components) {
      const p = prev.get(c.id) ?? {};
      const device = result.devices[c.id];

      if (c.type === 'switch' && p.on !== undefined && p.on !== c.on) {
        playClick('high');
      }
      if (c.type === 'source' && p.on !== undefined && p.on !== c.on) {
        playClick('low');
      }
      if (c.type === 'relay' && p.contactClosed !== undefined && p.contactClosed !== c.contactClosed) {
        playClick('high');
      }
      if (c.type === 'mcb') {
        if (p.tripped === false && c.tripped) {
          if (device?.tripEvent === 'SHORT_CIRCUIT') playSpark();
          else playClick('low');
        } else if (p.tripped === true && !c.tripped) {
          playClick('high');
        }
      }
      if (c.type === 'fuse' && p.blown === false && c.blown) {
        playFusePop();
      }
      if ((c.type === 'lamp' || c.type === 'motor') && p.burnedOut === false && c.burnedOut) {
        playSpark();
      }

      if (c.type === 'motor') {
        seenMotorIds.add(c.id);
        const running = !c.burnedOut && !c.stalled && (device?.voltageAcross ?? 0) > c.ratedVoltage * 0.5;
        const speedRatio = running ? Math.max(0.15, Math.min(1.4, (device?.voltageAcross ?? 0) / c.ratedVoltage)) : 0;
        const stalledHum = c.stalled && !c.burnedOut && (device?.current ?? 0) > 0.3;
        setMotorHum(c.id, {
          active: running || stalledHum,
          frequency: stalledHum && !running ? 55 : 70 + speedRatio * 90,
          volume: running ? Math.min(0.06, 0.02 + c.ratedHp * 0.012) : stalledHum ? 0.05 : 0,
        });
      }

      prev.set(c.id, {
        on: 'on' in c ? c.on : undefined,
        tripped: c.type === 'mcb' ? c.tripped : undefined,
        blown: c.type === 'fuse' ? c.blown : undefined,
        burnedOut: 'burnedOut' in c ? c.burnedOut : undefined,
        contactClosed: c.type === 'relay' ? c.contactClosed : undefined,
      });
    }

    for (const id of [...prev.keys()]) {
      if (!components.some((c) => c.id === id)) prev.delete(id);
    }
    // Stop hums for motors that were removed this render.
    for (const id of prevMotorIdsRef.current) {
      if (!seenMotorIds.has(id)) setMotorHum(id, { active: false, frequency: 0, volume: 0 });
    }
    prevMotorIdsRef.current = seenMotorIds;
  }, [components, result]);
}
