import { useRef, useState } from 'react';
import { CanvasBoard } from './CanvasBoard';
import { ComponentPalette } from './ComponentPalette';
import { Inspector } from './Inspector';
import { setSoundEnabled } from './sound';
import { useCircuitBoard } from './useCircuitBoard';
import { useCircuitSounds } from './useCircuitSounds';
import './CircuitSimulator.css';

export function CircuitSimulator() {
  const board = useCircuitBoard();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useCircuitSounds(board.components, board.result);

  const selected = board.components.find((c) => c.id === board.selectedId) ?? null;
  const selectedDevice = board.selectedId ? board.result.devices[board.selectedId] : undefined;

  const handleTap = (id: string) => {
    const comp = board.components.find((c) => c.id === id);
    if (!comp) return;
    board.setSelectedId(id);
    if (comp.type === 'switch') {
      board.toggleSwitch(id);
    } else if (comp.type === 'source') {
      board.updateComponent(id, { on: !comp.on });
    } else if (comp.type === 'mcb' && comp.tripped) {
      board.resetDevice(id);
    } else if (comp.type === 'fuse' && comp.blown) {
      board.resetDevice(id);
    } else if ((comp.type === 'lamp' || comp.type === 'motor') && comp.burnedOut) {
      board.resetDevice(id);
    }
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      setSoundEnabled(!prev);
      return !prev;
    });
  };

  const showUnprotectedShortWarning = board.result.warnings.includes('SHORT_CIRCUIT_UNPROTECTED');

  return (
    <div className="circuit-sim">
      {showUnprotectedShortWarning && (
        <div className="circuit-sim__banner">
          قصر مباشر بدون أي حماية! المفتاح ليس بديلاً عن القاطع - وصّل قاطعًا (MCB) أو فيوزًا لحماية الدائرة.
        </div>
      )}

      <div className="circuit-sim__body">
        <div className="circuit-sim__canvas-wrap">
          <CanvasBoard
            ref={svgRef}
            components={board.components}
            wires={board.wires}
            result={board.result}
            selectedId={board.selectedId}
            onSelect={board.setSelectedId}
            onMove={board.moveComponent}
            onAddWire={board.addWire}
            onRemoveWire={board.removeWire}
            onTap={handleTap}
          />
          <button
            type="button"
            className="sound-toggle"
            onClick={toggleSound}
            aria-label={soundOn ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundOn ? (
              <svg width={18} height={18} viewBox="0 0 18 18">
                <path d="M2 6.5v5h3l4 3.5v-12L5 6.5H2z" fill="currentColor" />
                <path d="M12 6a4 4 0 0 1 0 6M14 4a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
              </svg>
            ) : (
              <svg width={18} height={18} viewBox="0 0 18 18">
                <path d="M2 6.5v5h3l4 3.5v-12L5 6.5H2z" fill="currentColor" />
                <line x1={12} y1={6} x2={17} y2={12} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
                <line x1={17} y1={6} x2={12} y2={12} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <Inspector
          comp={selected}
          device={selectedDevice}
          onUpdate={board.updateComponent}
          onRemove={board.removeComponent}
          onReset={board.resetDevice}
          onToggleSwitch={board.toggleSwitch}
        />
      </div>

      <ComponentPalette svgRef={svgRef} onDropComponent={board.addComponent} />
    </div>
  );
}
