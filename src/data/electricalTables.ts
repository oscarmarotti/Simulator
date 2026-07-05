export interface BreakerRating {
  amps: number;
}

// Standard IEC 60898 MCB ratings.
export const BREAKER_RATINGS: number[] = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

export interface CableSize {
  mm2: number;
  ampacity: number; // A, copper, PVC insulation, reference method B1 (conduit), ~30C ambient
}

export const CABLE_TABLE: CableSize[] = [
  { mm2: 1.5, ampacity: 17.5 },
  { mm2: 2.5, ampacity: 24 },
  { mm2: 4, ampacity: 32 },
  { mm2: 6, ampacity: 41 },
  { mm2: 10, ampacity: 57 },
  { mm2: 16, ampacity: 76 },
  { mm2: 25, ampacity: 96 },
  { mm2: 35, ampacity: 119 },
  { mm2: 50, ampacity: 144 },
  { mm2: 70, ampacity: 184 },
  { mm2: 95, ampacity: 223 },
  { mm2: 120, ampacity: 259 },
];

export const COPPER_RESISTIVITY = 0.0175; // ohm*mm^2/m

export type LoadType = 'lighting' | 'motor' | 'ac' | 'oven';

export interface LoadTypeInfo {
  label: string;
  powerFactor: number;
  breakerCurve: 'B' | 'C' | 'D';
  voltageDropLimit: number; // fraction, e.g. 0.03 for 3%
  note: string;
}

export const LOAD_TYPE_INFO: Record<LoadType, LoadTypeInfo> = {
  lighting: {
    label: 'إضاءة',
    powerFactor: 1,
    breakerCurve: 'B',
    voltageDropLimit: 0.03,
    note: 'حمل مقاوم بدون تيار إقلاع، قاطع من نوع B كافٍ.',
  },
  oven: {
    label: 'فرن',
    powerFactor: 1,
    breakerCurve: 'B',
    voltageDropLimit: 0.05,
    note: 'حمل مقاوم (تسخين)، قاطع من نوع B كافٍ.',
  },
  ac: {
    label: 'تكييف',
    powerFactor: 0.85,
    breakerCurve: 'C',
    voltageDropLimit: 0.05,
    note: 'يحتوي على موتور كباس بتيار إقلاع متوسط، يُفضّل قاطع نوع C.',
  },
  motor: {
    label: 'موتور',
    powerFactor: 0.8,
    breakerCurve: 'D',
    voltageDropLimit: 0.05,
    note: 'تيار إقلاع مرتفع (حتى 7 أضعاف التيار الاسمي)، يُفضّل قاطع نوع D.',
  },
};
