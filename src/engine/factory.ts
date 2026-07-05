import type {
  CircuitComponent,
  FuseComponent,
  LampComponent,
  McbComponent,
  MotorComponent,
  RelayComponent,
  SourceComponent,
  SwitchComponent,
} from './types';

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

export function makeSource(id: string, voltage = 220): SourceComponent {
  return { id, type: 'source', voltage };
}

export function makeMcb(id: string, rating = 16, curve: McbComponent['curve'] = 'C'): McbComponent {
  return { id, type: 'mcb', rating, curve, tripped: false };
}

export function makeSwitch(id: string, on = true): SwitchComponent {
  return { id, type: 'switch', on };
}

export function makeFuse(id: string, rating = 10): FuseComponent {
  return { id, type: 'fuse', rating, blown: false };
}

export function makeRelay(
  id: string,
  coilRatedVoltage = 220,
  coilRatedPowerW = 3,
): RelayComponent {
  return { id, type: 'relay', coilRatedVoltage, coilRatedPowerW, contactClosed: false };
}

export function makeLamp(id: string, ratedPowerW = 100, ratedVoltage = 220, color = '#ffd76a'): LampComponent {
  return { id, type: 'lamp', ratedPowerW, ratedVoltage, color, burnedOut: false };
}

export function makeMotor(id: string, ratedHp = 0.5, ratedVoltage = 220): MotorComponent {
  return { id, type: 'motor', ratedHp, ratedVoltage, burnedOut: false, stalled: false };
}

export type { CircuitComponent };
