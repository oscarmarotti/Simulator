export type ComponentType =
  | 'source'
  | 'mcb'
  | 'switch'
  | 'fuse'
  | 'relay'
  | 'lamp'
  | 'motor';

export type BreakerCurve = 'B' | 'C' | 'D';

export interface TerminalRef {
  componentId: string;
  terminal: string;
}

export interface Wire {
  id: string;
  from: TerminalRef;
  to: TerminalRef;
}

interface BaseComponent {
  id: string;
  type: ComponentType;
}

export type PhaseMode = 'single' | 'three';

export interface SourceComponent extends BaseComponent {
  type: 'source';
  voltage: number; // 100-260 V, phase-to-neutral magnitude
  phase: PhaseMode;
  on: boolean;
}

export type PoleCount = 1 | 2 | 3 | 4;

export interface McbComponent extends BaseComponent {
  type: 'mcb';
  rating: number; // A: 6,10,16,20,25,32,40
  curve: BreakerCurve;
  poles: PoleCount;
  tripped: boolean;
}

export interface SwitchComponent extends BaseComponent {
  type: 'switch';
  on: boolean;
}

export interface FuseComponent extends BaseComponent {
  type: 'fuse';
  rating: number; // A
  blown: boolean;
}

export interface RelayComponent extends BaseComponent {
  type: 'relay';
  coilRatedVoltage: number; // V, fixed reference e.g. 220
  coilRatedPowerW: number; // W, fixed small coil load e.g. 3
  contactClosed: boolean; // runtime, recomputed by solver each solve
}

export interface LampComponent extends BaseComponent {
  type: 'lamp';
  ratedPowerW: number; // 25-200 W
  ratedVoltage: number; // fixed reference, 220
  color: string;
  burnedOut: boolean;
}

export interface MotorComponent extends BaseComponent {
  type: 'motor';
  ratedHp: number;
  ratedVoltage: number; // fixed reference, 220
  burnedOut: boolean;
  stalled: boolean; // runtime, recomputed by solver each solve
}

export type CircuitComponent =
  | SourceComponent
  | McbComponent
  | SwitchComponent
  | FuseComponent
  | RelayComponent
  | LampComponent
  | MotorComponent;

export function sourceTerminalNames(phase: PhaseMode): string[] {
  return phase === 'three' ? ['L1', 'L2', 'L3', 'N'] : ['L', 'N'];
}

export function mcbTerminalNames(poles: PoleCount): string[] {
  if (poles === 1) return ['in', 'out'];
  const names: string[] = [];
  for (let i = 1; i <= poles; i++) names.push(`in${i}`, `out${i}`);
  return names;
}

export function terminalNamesFor(c: CircuitComponent): string[] {
  switch (c.type) {
    case 'source':
      return sourceTerminalNames(c.phase);
    case 'mcb':
      return mcbTerminalNames(c.poles);
    case 'switch':
    case 'fuse':
    case 'lamp':
    case 'motor':
      return ['in', 'out'];
    case 'relay':
      return ['A1', 'A2', 'C', 'NO'];
  }
}

export type TripEvent = 'SHORT_CIRCUIT' | 'OVERLOAD' | null;

export interface DeviceResult {
  id: string;
  type: ComponentType;
  current: number; // A, magnitude
  voltageAcross: number; // V, magnitude
  powerW: number;
  tripEvent?: TripEvent;
  protectedBy: string[]; // ids of mcb/fuse components found upstream via BFS
}

export interface CircuitResult {
  components: CircuitComponent[]; // updated copies (tripped/blown/burnedOut/contactClosed/stalled)
  devices: Record<string, DeviceResult>;
  warnings: string[]; // e.g. 'SHORT_CIRCUIT_UNPROTECTED'
  liveWireIds: string[]; // wires currently carrying current, for UI animation
}

export const CURRENT_EPSILON = 1e-6;

export const PICKUP_RATIO = 0.6; // relay coil pickup threshold vs rated voltage
export const UNPROTECTED_BURN_CURRENT_A = 16; // safe wiring current limit
export const LOCKED_ROTOR_MULTIPLIER = 5;
export const R_ON = 0.01; // ohms, closed conductor/device
export const R_OFF = 1e9; // ohms, open device
export const HP_TO_WATT = 746;
export const LAMP_PF = 1;
export const MOTOR_PF = 0.8;
