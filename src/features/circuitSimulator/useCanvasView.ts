import { useCallback, useRef, useState } from 'react';
import { clientToSvgPoint } from './svgCoords';

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MIN_W = 300;
const MAX_W = 3600;

function clampWidth(w: number): number {
  return Math.min(MAX_W, Math.max(MIN_W, w));
}

export function useCanvasView(initial: ViewBox) {
  const [viewBox, setViewBox] = useState<ViewBox>(initial);
  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;

  /** Zoom so the content currently under (clientX, clientY) stays under the cursor. */
  const zoomAt = useCallback((svg: SVGSVGElement, clientX: number, clientY: number, factor: number) => {
    const vb = viewBoxRef.current;
    const p = clientToSvgPoint(svg, clientX, clientY);
    const newW = clampWidth(vb.w * factor);
    const actualFactor = newW / vb.w;
    const newH = vb.h * actualFactor;
    const newX = p.x - (p.x - vb.x) * actualFactor;
    const newY = p.y - (p.y - vb.y) * actualFactor;
    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  }, []);

  const zoomAtCenter = useCallback((svg: SVGSVGElement, factor: number) => {
    const rect = svg.getBoundingClientRect();
    zoomAt(svg, rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }, [zoomAt]);

  const reset = useCallback(() => setViewBox(initial), [initial]);

  return { viewBox, viewBoxRef, setViewBox, zoomAt, zoomAtCenter, reset };
}
