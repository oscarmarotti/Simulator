export interface Complex {
  re: number;
  im: number;
}

export const ZERO: Complex = { re: 0, im: 0 };

export function fromPolar(magnitude: number, angleDeg: number): Complex {
  const rad = (angleDeg * Math.PI) / 180;
  return { re: magnitude * Math.cos(rad), im: magnitude * Math.sin(rad) };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function scale(a: Complex, k: number): Complex {
  return { re: a.re * k, im: a.im * k };
}

export function magnitude(a: Complex): number {
  return Math.hypot(a.re, a.im);
}
