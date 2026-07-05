import { useMemo, useState } from 'react';
import { LOAD_TYPE_INFO, type LoadType } from '../../data/electricalTables';
import { computeLoadCalculation, type PhaseType } from './calculations';
import './LoadCalculator.css';

const LOAD_TYPES: LoadType[] = ['lighting', 'ac', 'motor', 'oven'];

export function LoadCalculator() {
  const [loadType, setLoadType] = useState<LoadType>('ac');
  const [powerW, setPowerW] = useState(1500);
  const [phase, setPhase] = useState<PhaseType>('single');
  const [distanceM, setDistanceM] = useState(15);

  const result = useMemo(
    () => computeLoadCalculation({ loadType, powerW, phase, distanceM }),
    [loadType, powerW, phase, distanceM],
  );

  return (
    <div className="load-calc">
      <div className="load-calc__form card">
        <h2>بيانات الحمل</h2>

        <label className="field">
          <span>نوع الحمل</span>
          <div className="segmented">
            {LOAD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={t === loadType ? 'segmented__btn is-active' : 'segmented__btn'}
                onClick={() => setLoadType(t)}
              >
                {LOAD_TYPE_INFO[t].label}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>القدرة (واط)</span>
          <input
            type="number"
            min={1}
            value={powerW}
            onChange={(e) => setPowerW(Math.max(1, Number(e.target.value) || 0))}
          />
        </label>

        <label className="field">
          <span>الجهد</span>
          <div className="segmented">
            <button
              type="button"
              className={phase === 'single' ? 'segmented__btn is-active' : 'segmented__btn'}
              onClick={() => setPhase('single')}
            >
              220V أحادي
            </button>
            <button
              type="button"
              className={phase === 'three' ? 'segmented__btn is-active' : 'segmented__btn'}
              onClick={() => setPhase('three')}
            >
              380V ثلاثي
            </button>
          </div>
        </label>

        <label className="field">
          <span>المسافة من اللوحة (متر): {distanceM}</span>
          <input
            type="range"
            min={1}
            max={100}
            value={distanceM}
            onChange={(e) => setDistanceM(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="load-calc__result card">
        <h2>النتيجة</h2>

        {result.outOfRange ? (
          <div className="out-of-range">
            <strong>خارج نطاق الحاسبة</strong>
            <p>
              التيار المطلوب ({result.designCurrentA.toFixed(1)}A) أعلى من أكبر قاطع مدعوم (125A). راجع تقسيم
              الحمل على أكثر من دائرة أو استخدم قاطع رئيسي وقواطع فرعية.
            </p>
          </div>
        ) : (
          <>
            <div className="result-grid">
              <ResultItem label="التيار المطلوب" value={`${result.designCurrentA.toFixed(2)} A`} />
              <ResultItem label="القاطع المناسب" value={`${result.breakerA} A - Type ${result.breakerCurve}`} />
              <ResultItem
                label="مقطع الكابل"
                value={result.cableMm2 ? `${result.cableMm2} mm²` : 'غير متاح'}
              />
              <ResultItem
                label="هبوط الجهد"
                value={result.voltageDropPercent !== null ? `${result.voltageDropPercent.toFixed(2)}%` : '—'}
                warn={!result.voltageDropOk}
              />
            </div>

            {!result.voltageDropOk && (
              <p className="warning-note">
                هبوط الجهد يتجاوز الحد المسموح ({result.voltageDropLimitPercent}%) عند هذه المسافة بأكبر
                مقطع كابل متاح في الجدول. قرّب اللوحة أو استخدم مقطع كابل أكبر يدويًا.
              </p>
            )}

            <p className="load-note">{result.loadNote}</p>
            <p className="rcd-note">{result.rcdNote}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ResultItem({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={warn ? 'result-item is-warn' : 'result-item'}>
      <span className="result-item__label">{label}</span>
      <span className="result-item__value">{value}</span>
    </div>
  );
}
