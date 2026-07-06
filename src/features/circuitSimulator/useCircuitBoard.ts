import { useCallback, useMemo, useState } from 'react';
import { solveCircuit } from '../../engine/circuitEngine';
import { makeDefaultComponent, nextId } from '../../engine/factory';
import type { ComponentType, TerminalRef, Wire } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';

export function useCircuitBoard() {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const id = nextId(type);
    const base = makeDefaultComponent(type, id);
    const placed: PlacedComponent = { ...base, x, y } as PlacedComponent;
    setComponents((prev) => [...prev, placed]);
    setSelectedId(id);
    return id;
  }, []);

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) => prev.filter((w) => w.from.componentId !== id && w.to.componentId !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const addWire = useCallback((from: TerminalRef, to: TerminalRef) => {
    if (from.componentId === to.componentId && from.terminal === to.terminal) return;
    setWires((prev) => {
      const exists = prev.some(
        (w) =>
          (w.from.componentId === from.componentId &&
            w.from.terminal === from.terminal &&
            w.to.componentId === to.componentId &&
            w.to.terminal === to.terminal) ||
          (w.from.componentId === to.componentId &&
            w.from.terminal === to.terminal &&
            w.to.componentId === from.componentId &&
            w.to.terminal === from.terminal),
      );
      if (exists) return prev;
      return [...prev, { id: nextId('wire'), from, to }];
    });
  }, []);

  const removeWire = useCallback((id: string) => {
    setWires((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateComponent = useCallback((id: string, patch: Record<string, unknown>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...patch } as PlacedComponent) : c)));
  }, []);

  const toggleSwitch = useCallback((id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id && c.type === 'switch' ? { ...c, on: !c.on } : c)),
    );
  }, []);

  const resetDevice = useCallback((id: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.type === 'mcb') return { ...c, tripped: false };
        if (c.type === 'fuse') return { ...c, blown: false };
        if (c.type === 'lamp' || c.type === 'motor') return { ...c, burnedOut: false };
        return c;
      }),
    );
  }, []);

  const result = useMemo(() => solveCircuit(components, wires), [components, wires]);

  // Sync back the engine's derived runtime state (tripped/blown/burnedOut/stalled/contactClosed)
  // into the placed components so the UI reflects it, without clobbering position.
  const syncedComponents: PlacedComponent[] = useMemo(() => {
    const byId = new Map(result.components.map((c) => [c.id, c]));
    return components.map((placed) => {
      const solved = byId.get(placed.id);
      if (!solved) return placed;
      return { ...solved, x: placed.x, y: placed.y } as PlacedComponent;
    });
  }, [components, result]);

  return {
    components: syncedComponents,
    wires,
    selectedId,
    setSelectedId,
    addComponent,
    moveComponent,
    removeComponent,
    addWire,
    removeWire,
    updateComponent,
    toggleSwitch,
    resetDevice,
    result,
  };
}
