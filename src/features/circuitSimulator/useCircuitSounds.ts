import { useEffect, useRef } from 'react';
import type { CircuitResult } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';
import { playClick, playFusePop, playSpark } from './sound';

interface PrevState {
  on?: boolean;
  tripped?: boolean;
  blown?: boolean;
  burnedOut?: boolean;
  contactClosed?: boolean;
}

/** Plays short one-shot sound effects on meaningful state transitions (trip, blow, burn, toggle). */
export function useCircuitSounds(components: PlacedComponent[], result: CircuitResult) {
  const prevRef = useRef<Map<string, PrevState>>(new Map());

  useEffect(() => {
    const prev = prevRef.current;

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
  }, [components, result]);
}
