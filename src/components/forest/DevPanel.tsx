import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { defaultSettings, layers, type LayerId, type MotionSettings } from './layers';

interface Props {
  settings: MotionSettings;
  onChange: (next: MotionSettings) => void;
}

const panel: CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  zIndex: 1000,
  width: 260,
  maxHeight: 'calc(100vh - 32px)',
  overflow: 'auto',
  padding: 14,
  borderRadius: 12,
  background: 'rgb(10 12 24 / 0.92)',
  border: '1px solid rgb(255 255 255 / 0.12)',
  color: '#dde',
  font: '12px/1.4 system-ui, sans-serif',
  pointerEvents: 'auto',
};
const row: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 52px', gap: 6, alignItems: 'center', marginTop: 6 };
const h: CSSProperties = { margin: '12px 0 2px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6 };

const Slider = ({ label, value, min, max, step, onInput }: {
  label: string; value: number; min: number; max: number; step: number; onInput: (v: number) => void;
}) => (
  <label style={row}>
    <span>
      {label}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onInput(Number(e.target.value))}
        style={{ width: '100%', display: 'block' }}
      />
    </span>
    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
  </label>
);

const Check = ({ label, checked, onToggle, disabled }: {
  label: string; checked: boolean; onToggle: (v: boolean) => void; disabled?: boolean;
}) => (
  <label style={{ display: 'flex', gap: 6, marginTop: 4, opacity: disabled ? 0.5 : 1 }}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onToggle(e.target.checked)} />
    {label}
  </label>
);

/** Dev-only tuning panel; open the page with ?debug under `astro dev`. */
export const DevPanel = ({ settings: s, onChange }: Props) => {
  const set = (patch: Partial<MotionSettings>) => onChange({ ...s, ...patch });
  const setDepth = (id: LayerId, v: number) => set({ depths: { ...s.depths, [id]: v } });

  return createPortal(
    <div style={panel} onPointerMove={(e) => e.stopPropagation()}>
      <strong>Scroll parallax</strong>
      <Slider label="Global intensity" value={s.intensity} min={0} max={2.5} step={0.05} onInput={(v) => set({ intensity: v })} />
      <Slider label="Drift (depth lag)" value={s.drift} min={0} max={1} step={0.01} onInput={(v) => set({ drift: v })} />
      <Slider label="Tree spread" value={s.spread} min={0} max={0.15} step={0.005} onInput={(v) => set({ spread: v })} />
      <Slider label="Push-in (tree scale)" value={s.pushIn} min={0} max={0.3} step={0.01} onInput={(v) => set({ pushIn: v })} />
      <Slider label="Smoothing (stiffness)" value={s.stiffness} min={8} max={200} step={1} onInput={(v) => set({ stiffness: v })} />
      <Slider label="Ambient effects" value={s.ambient} min={0} max={2} step={0.05} onInput={(v) => set({ ambient: v })} />

      <p style={h}>Layer depth · visibility</p>
      {[...layers].reverse().map((l) => (
        <div key={l.id}>
          <Slider label={l.label} value={s.depths[l.id]} min={0} max={1.5} step={0.01} onInput={(v) => setDepth(l.id, v)} />
          <Check
            label="visible"
            checked={!s.hidden[l.id]}
            onToggle={(v) => set({ hidden: { ...s.hidden, [l.id]: !v } })}
          />
        </div>
      ))}

      <p style={h}>Debug</p>
      <Check
        label="Reduced motion"
        checked={s.reducedMotion}
        onToggle={(v) => set({ reducedMotion: v })}
      />
      <Check label="Show layer boundaries" checked={s.showBounds} onToggle={(v) => set({ showBounds: v })} />
      <button type="button" onClick={() => onChange(defaultSettings)} style={{ marginTop: 10 }}>
        Reset
      </button>
    </div>,
    document.body,
  );
};
