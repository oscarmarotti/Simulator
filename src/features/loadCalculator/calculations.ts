import { BREAKER_RATINGS, CABLE_TABLE, COPPER_RESISTIVITY, LOAD_TYPE_INFO, type LoadType } from '../../data/electricalTables';

export type PhaseType = 'single' | 'three';

export interface LoadCalculatorInput {
  loadType: LoadType;
  powerW: number;
  phase: PhaseType;
  distanceM: number; // one-way distance from panel to load
}

export interface LoadCalculatorResult {
  designCurrentA: number;
  outOfRange: boolean;
  breakerA: number | null;
  breakerCurve: 'B' | 'C' | 'D';
  cableMm2: number | null;
  voltageDropPercent: number | null;
  voltageDropLimitPercent: number;
  voltageDropOk: boolean;
  rcdNote: string;
  loadNote: string;
  voltage: number;
}

const SINGLE_PHASE_VOLTAGE = 220;
const THREE_PHASE_VOLTAGE = 380;

export function computeDesignCurrent(powerW: number, phase: PhaseType, powerFactor: number): number {
  if (phase === 'single') {
    return powerW / (SINGLE_PHASE_VOLTAGE * powerFactor);
  }
  return powerW / (Math.sqrt(3) * THREE_PHASE_VOLTAGE * powerFactor);
}

export function selectBreaker(designCurrentA: number): number | null {
  const found = BREAKER_RATINGS.find((r) => r >= designCurrentA);
  return found ?? null;
}

function voltageDropPercentFor(cableMm2: number, currentA: number, distanceM: number, phase: PhaseType, voltage: number): number {
  const drop =
    phase === 'single'
      ? (2 * currentA * distanceM * COPPER_RESISTIVITY) / cableMm2
      : (Math.sqrt(3) * currentA * distanceM * COPPER_RESISTIVITY) / cableMm2;
  return (drop / voltage) * 100;
}

export function selectCable(
  currentA: number,
  distanceM: number,
  phase: PhaseType,
  voltage: number,
  dropLimitPercent: number,
): { cableMm2: number; dropPercent: number } | null {
  for (const cable of CABLE_TABLE) {
    if (cable.ampacity < currentA) continue;
    const dropPercent = voltageDropPercentFor(cable.mm2, currentA, distanceM, phase, voltage);
    if (dropPercent <= dropLimitPercent) {
      return { cableMm2: cable.mm2, dropPercent };
    }
  }
  // No cable satisfies both ampacity and voltage-drop limit within the table;
  // fall back to the largest ampacity-adequate cable so the UI can show a
  // clear "increase cable size / distance too long" warning instead of null.
  const largestAdequate = [...CABLE_TABLE].reverse().find((c) => c.ampacity >= currentA);
  if (!largestAdequate) return null;
  return {
    cableMm2: largestAdequate.mm2,
    dropPercent: voltageDropPercentFor(largestAdequate.mm2, currentA, distanceM, phase, voltage),
  };
}

export function computeLoadCalculation(input: LoadCalculatorInput): LoadCalculatorResult {
  const info = LOAD_TYPE_INFO[input.loadType];
  const voltage = input.phase === 'single' ? SINGLE_PHASE_VOLTAGE : THREE_PHASE_VOLTAGE;
  const designCurrentA = computeDesignCurrent(input.powerW, input.phase, info.powerFactor);
  const breakerA = selectBreaker(designCurrentA);
  const outOfRange = breakerA === null;

  let cableMm2: number | null = null;
  let voltageDropPercent: number | null = null;
  let voltageDropOk = true;

  if (!outOfRange) {
    const dropLimitPercent = info.voltageDropLimit * 100;
    const cableChoice = selectCable(designCurrentA, input.distanceM, input.phase, voltage, dropLimitPercent);
    if (cableChoice) {
      cableMm2 = cableChoice.cableMm2;
      voltageDropPercent = cableChoice.dropPercent;
      voltageDropOk = cableChoice.dropPercent <= dropLimitPercent;
    }
  }

  const rcdNote =
    input.loadType === 'motor' || input.loadType === 'ac'
      ? 'يُنصح بقاطع حماية من التسرب الأرضي (RCD) بتيار 30mA لحماية الأشخاص، مع مراعاة نوع RCD (A/AC) حسب نوع الموتور.'
      : 'يُنصح بقاطع حماية من التسرب الأرضي (RCD) بتيار 30mA خاصة في الأماكن الرطبة.';

  return {
    designCurrentA,
    outOfRange,
    breakerA,
    breakerCurve: info.breakerCurve,
    cableMm2,
    voltageDropPercent,
    voltageDropLimitPercent: info.voltageDropLimit * 100,
    voltageDropOk,
    rcdNote,
    loadNote: info.note,
    voltage,
  };
}
