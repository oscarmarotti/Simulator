// Solves A x = b via Gaussian elimination with partial pivoting.
// Returns x, or a zero vector if the system is singular (e.g. no source present).
export function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  if (n === 0) return [];
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxAbs) {
        maxAbs = Math.abs(M[r][col]);
        pivotRow = r;
      }
    }
    if (maxAbs < 1e-15) continue; // singular column, leave as free (treated as 0)
    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    }
    const pivot = M[col][col];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / pivot;
      if (factor === 0) continue;
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    x[i] = Math.abs(M[i][i]) < 1e-15 ? 0 : M[i][n] / M[i][i];
  }
  return x;
}

/**
 * Solves A x = b for a complex right-hand side, where A (conductances) is
 * purely real - true whenever every branch is resistive. Real and imaginary
 * parts decouple into two independent real solves of the same matrix, which
 * is what lets a 3-phase source's 120-degree-apart voltage phasors produce
 * correct line-to-line (sqrt(3) x line-to-neutral) magnitudes without a full
 * complex Gaussian elimination.
 */
export function solveComplexLinearSystem(
  A: number[][],
  bRe: number[],
  bIm: number[],
): { re: number[]; im: number[] } {
  return { re: solveLinearSystem(A, bRe), im: solveLinearSystem(A, bIm) };
}
