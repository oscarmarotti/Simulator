import type {
  CircuitComponent,
  ComponentType,
  FuseComponent,
  LampComponent,
  McbComponent,
  MotorComponent,
  PhaseMode,
  PoleCount,
  RelayComponent,
  SourceComponent,
  SwitchComponent,
} from './types';

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

export function makeSource(id: string, voltage = 220, phase: PhaseMode = 'single'): SourceComponent {
  return { id, type: 'source', voltage, phase, on: true };
}

export function makeMcb(
  id: string,
  rating = 16,
  curve: McbComponent['curve'] = 'C',
  poles: PoleCount = 1,
): McbComponent {
  return { id, type: 'mcb', rating, curve, poles, closed: true, tripped: false };
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

export function makeDefaultComponent(type: ComponentType, id: string): CircuitComponent {
  switch (type) {
    case 'source':
      return makeSource(id, 220);
    case 'mcb':
      return makeMcb(id, 16, 'C');
    case 'switch':
      return makeSwitch(id, true);
    case 'fuse':
      return makeFuse(id, 10);
    case 'relay':
      return makeRelay(id, 220, 3);
    case 'lamp':
      return makeLamp(id, 100, 220, '#ffd76a');
    case 'motor':
      return makeMotor(id, 0.5, 220);
  }
}

export type { CircuitComponent };
