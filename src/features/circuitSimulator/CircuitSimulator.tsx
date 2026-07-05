import { useRef } from 'react';
import { CanvasBoard } from './CanvasBoard';
import { ComponentPalette } from './ComponentPalette';
import { Inspector } from './Inspector';
import { useCircuitBoard } from './useCircuitBoard';
import './CircuitSimulator.css';

export function CircuitSimulator() {
  const board = useCircuitBoard();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const selected = board.components.find((c) => c.id === board.selectedId) ?? null;
  const selectedDevice = board.selectedId ? board.result.devices[board.selectedId] : undefined;

  const handleTap = (id: string) => {
    const comp = board.components.find((c) => c.id === id);
    if (!comp) return;
    board.setSelectedId(id);
    if (comp.type === 'switch') {
      board.toggleSwitch(id);
    } else if (comp.type === 'mcb' && comp.tripped) {
      board.resetDevice(id);
    } else if (comp.type === 'fuse' && comp.blown) {
      board.resetDevice(id);
    } else if ((comp.type === 'lamp' || comp.type === 'motor') && comp.burnedOut) {
      board.resetDevice(id);
    }
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
