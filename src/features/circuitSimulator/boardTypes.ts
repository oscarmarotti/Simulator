import type { CircuitComponent, ComponentType, Wire } from '../../engine/types';

export type PlacedComponent = CircuitComponent & { x: number; y: number };

export interface BoardState {
  components: PlacedComponent[];
  wires: Wire[];
}

export interface WireDraft {
  fromComponentId: string;
  fromTerminal: string;
  x: number;
  y: number;
}

export const PALETTE_ITEMS: { type: ComponentType; label: string }[] = [
  { type: 'source', label: 'مصدر AC' },
  { type: 'mcb', label: 'قاطع MCB' },
  { type: 'switch', label: 'مفتاح' },
  { type: 'fuse', label: 'فيوز' },
  { type: 'relay', label: 'ريلي' },
  { type: 'lamp', label: 'لمبة' },
  { type: 'motor', label: 'موتور' },
];
