import type { BreakerCurve, DeviceResult, PoleCount } from '../../engine/types';
import type { PlacedComponent } from './boardTypes';

const LAMP_COLORS = ['#ffd76a', '#ffffff', '#fca5a5', '#93c5fd', '#86efac'];
const BREAKER_RATINGS = [6, 10, 16, 20, 25, 32, 40];
const CURVES: BreakerCurve[] = ['B', 'C', 'D'];
const POLE_COUNTS: PoleCount[] = [1, 2, 3, 4];

interface Props {
  comp: PlacedComponent | null;
  device?: DeviceResult;
  canOperate: boolean;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onReset: (id: string) => void;
  onToggleSwitch: (id: string) => void;
  onToggleMcbClosed: (id: string) => void;
}

export function Inspector({ comp, device, canOperate, onUpdate, onRemove, onReset, onToggleSwitch, onToggleMcbClosed }: Props) {
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
        <>
          {canOperate ? (
            <button className="btn" onClick={() => onUpdate(comp.id, { on: !comp.on })}>
              {comp.on ? 'إيقاف المصدر (OFF)' : 'تشغيل المصدر (ON)'}
            </button>
          ) : (
            <p className="inspector__hint-inline">شغّل الدائرة عشان تقدر تفتح/تقفل المصدر.</p>
          )}
          <label className="field">
            <span>نوع الجهد</span>
            <div className="segmented">
              <button
                className={comp.phase === 'single' ? 'segmented__btn is-active' : 'segmented__btn'}
                onClick={() => onUpdate(comp.id, { phase: 'single' })}
              >
                أحادي (L/N)
              </button>
              <button
                className={comp.phase === 'three' ? 'segmented__btn is-active' : 'segmented__btn'}
                onClick={() => onUpdate(comp.id, { phase: 'three' })}
              >
                ثلاثي (L1/L2/L3/N)
              </button>
            </div>
          </label>
          <label className="field">
            <span>الجهد بين كل خط والنيوترال: {comp.voltage}V</span>
            <input
              type="range"
              min={100}
              max={260}
              value={comp.voltage}
              onChange={(e) => onUpdate(comp.id, { voltage: Number(e.target.value) })}
            />
          </label>
          {comp.phase === 'three' && (
            <p className="inspector__hint-inline">
              بين أي خطين (L1-L2 مثلاً) هيبقى الجهد أعلى (≈{Math.round(comp.voltage * Math.sqrt(3))}V) لأنه فرق بين
              فازتين، مش خط ونيوترال.
            </p>
          )}
        </>
      )}

      {comp.type === 'mcb' && (
        <>
          {!comp.tripped && canOperate && (
            <button className="btn" onClick={() => onToggleMcbClosed(comp.id)}>
              {comp.closed ? 'فصل يدويًا (Open)' : 'توصيل يدويًا (Close)'}
            </button>
          )}
          <label className="field">
            <span>عدد الأقطاب (Poles)</span>
            <div className="segmented">
              {POLE_COUNTS.map((p) => (
                <button
                  key={p}
                  className={p === comp.poles ? 'segmented__btn is-active' : 'segmented__btn'}
                  onClick={() => onUpdate(comp.id, { poles: p })}
                >
                  {p}P
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>التيار الاسمي (لكل قطب)</span>
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
          {comp.poles > 1 && (
            <p className="inspector__hint-inline">
              كل القواطع في نفس القاطع بتفصل مع بعض (Common Trip): لو أي قطب واحد سحب تيار أعلى من المسموح، القاطع
              بالكامل بيفصل كل الأقطاب.
            </p>
          )}
          {comp.tripped && (
            <button className="btn btn--warn" onClick={() => onReset(comp.id)}>
              إعادة ضبط القاطع
            </button>
          )}
        </>
      )}

      {comp.type === 'switch' &&
        (canOperate ? (
          <button className="btn" onClick={() => onToggleSwitch(comp.id)}>
            {comp.on ? 'إيقاف (OFF)' : 'تشغيل (ON)'}
          </button>
        ) : (
          <p className="inspector__hint-inline">شغّل الدائرة عشان تقدر تفتح/تقفل المفتاح.</p>
        ))}

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
