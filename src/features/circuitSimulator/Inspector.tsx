import type { BreakerCurve, DeviceResult } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';

const LAMP_COLORS = ['#ffd76a', '#ffffff', '#fca5a5', '#93c5fd', '#86efac'];
const BREAKER_RATINGS = [6, 10, 16, 20, 25, 32, 40];
const CURVES: BreakerCurve[] = ['B', 'C', 'D'];

interface Props {
  comp: PlacedComponent | null;
  device?: DeviceResult;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onReset: (id: string) => void;
  onToggleSwitch: (id: string) => void;
}

export function Inspector({ comp, device, onUpdate, onRemove, onReset, onToggleSwitch }: Props) {
  if (!comp) {
    return (
      <div className="inspector card">
        <p className="inspector__hint">اختر مكونًا من اللوحة لعرض إعداداته، أو اسحب قطعة جديدة من القائمة أسفل الشاشة.</p>
      </div>
    );
  }

  return (
    <div className="inspector card">
      <div className="inspector__header">
        <h3>{labelFor(comp)}</h3>
        <button className="btn btn--danger" onClick={() => onRemove(comp.id)}>
          حذف
        </button>
      </div>

      {device && (
        <div className="inspector__readout">
          <span>التيار: {device.current.toFixed(2)}A</span>
          <span>الجهد: {device.voltageAcross.toFixed(0)}V</span>
          <span>القدرة: {device.powerW.toFixed(0)}W</span>
        </div>
      )}

      {comp.type === 'source' && (
        <label className="field">
          <span>الجهد: {comp.voltage}V</span>
          <input
            type="range"
            min={100}
            max={260}
            value={comp.voltage}
            onChange={(e) => onUpdate(comp.id, { voltage: Number(e.target.value) })}
          />
        </label>
      )}

      {comp.type === 'mcb' && (
        <>
          <label className="field">
            <span>التيار الاسمي</span>
            <select value={comp.rating} onChange={(e) => onUpdate(comp.id, { rating: Number(e.target.value) })}>
              {BREAKER_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}A
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>منحنى القاطع</span>
            <div className="segmented">
              {CURVES.map((c) => (
                <button
                  key={c}
                  className={c === comp.curve ? 'segmented__btn is-active' : 'segmented__btn'}
                  onClick={() => onUpdate(comp.id, { curve: c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>
          {comp.tripped && (
            <button className="btn btn--warn" onClick={() => onReset(comp.id)}>
              إعادة ضبط القاطع
            </button>
          )}
        </>
      )}

      {comp.type === 'switch' && (
        <button className="btn" onClick={() => onToggleSwitch(comp.id)}>
          {comp.on ? 'إيقاف (OFF)' : 'تشغيل (ON)'}
        </button>
      )}

      {comp.type === 'fuse' && (
        <>
          <label className="field">
            <span>التيار الاسمي</span>
            <select value={comp.rating} onChange={(e) => onUpdate(comp.id, { rating: Number(e.target.value) })}>
              {BREAKER_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}A
                </option>
              ))}
            </select>
          </label>
          {comp.blown && (
            <button className="btn btn--warn" onClick={() => onReset(comp.id)}>
              استبدال الفيوز
            </button>
          )}
        </>
      )}

      {comp.type === 'lamp' && (
        <>
          <label className="field">
            <span>القدرة: {comp.ratedPowerW}W</span>
            <input
              type="range"
              min={25}
              max={200}
              step={5}
              value={comp.ratedPowerW}
              onChange={(e) => onUpdate(comp.id, { ratedPowerW: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>اللون</span>
            <div className="segmented">
              {LAMP_COLORS.map((color) => (
                <button
                  key={color}
                  className={color === comp.color ? 'color-swatch is-active' : 'color-swatch'}
                  style={{ background: color }}
                  onClick={() => onUpdate(comp.id, { color })}
                />
              ))}
            </div>
          </label>
          {comp.burnedOut && (
            <button className="btn btn--warn" onClick={() => onReset(comp.id)}>
              استبدال اللمبة
            </button>
          )}
        </>
      )}

      {comp.type === 'motor' && (
        <>
          <label className="field">
            <span>القدرة: {comp.ratedHp} HP</span>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.25}
              value={comp.ratedHp}
              onChange={(e) => onUpdate(comp.id, { ratedHp: Number(e.target.value) })}
            />
          </label>
          {comp.stalled && !comp.burnedOut && (
            <p className="inspector__warning">
              الموتور متعثر (Stall): لا يحصل على الجهد الكامل لأنه متسلسل مع حمل آخر، فيسحب تيار إقلاع
              مرتفع بدل أن يلف.
            </p>
          )}
          {comp.burnedOut && (
            <button className="btn btn--warn" onClick={() => onReset(comp.id)}>
              استبدال الموتور
            </button>
          )}
        </>
      )}

      {comp.type === 'relay' && (
        <label className="field">
          <span>قدرة الملف: {comp.coilRatedPowerW}W</span>
          <input
            type="range"
            min={1}
            max={10}
            value={comp.coilRatedPowerW}
            onChange={(e) => onUpdate(comp.id, { coilRatedPowerW: Number(e.target.value) })}
          />
        </label>
      )}
    </div>
  );
}

function labelFor(comp: PlacedComponent): string {
  const map: Record<string, string> = {
    source: 'مصدر AC',
    mcb: 'قاطع MCB',
    switch: 'مفتاح',
    fuse: 'فيوز',
    relay: 'ريلي',
    lamp: 'لمبة',
    motor: 'موتور',
  };
  return map[comp.type];
}
