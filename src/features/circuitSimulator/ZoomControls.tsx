interface Props {
  getSvg: () => SVGSVGElement | null;
  onZoomIn: (svg: SVGSVGElement) => void;
  onZoomOut: (svg: SVGSVGElement) => void;
  onReset: () => void;
}

export function ZoomControls({ getSvg, onZoomIn, onZoomOut, onReset }: Props) {
  const withSvg = (fn: (svg: SVGSVGElement) => void) => () => {
    const svg = getSvg();
    if (svg) fn(svg);
  };

  return (
    <div className="zoom-controls">
      <button type="button" onClick={withSvg(onZoomIn)} aria-label="تكبير">
        <svg width={18} height={18} viewBox="0 0 18 18">
          <line x1={9} y1={2} x2={9} y2={16} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <line x1={2} y1={9} x2={16} y2={9} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" onClick={withSvg(onZoomOut)} aria-label="تصغير">
        <svg width={18} height={18} viewBox="0 0 18 18">
          <line x1={2} y1={9} x2={16} y2={9} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" onClick={onReset} aria-label="إعادة ضبط العرض" className="zoom-controls__reset">
        <svg width={16} height={16} viewBox="0 0 16 16">
          <path
            d="M1 5V1h4M15 5V1h-4M1 11v4h4M15 11v4h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
