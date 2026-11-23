import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { defaultSettings, layers, pct, pctLen, type LayerId, type MotionSettings } from './layers';
import { sceneData } from './sceneData';
import './ForestParallax.css';

const DevPanel = import.meta.env.DEV ? lazy(() => import('./DevPanel').then((m) => ({ default: m.DevPanel }))) : null;

/** Distance between the two foreground trunks, as a fraction of the scene width. */
const TRUNK_GAP = (1500 - 510) / sceneData.canvas;
/** The family leans in by this share of the trees' push-in. */
const FAMILY_PUSH = 0.375;

/**
 * Lens flare ghosts from the flashlight, laid out like the poster's: along the
 * line from the light through the lens centre (just above the cabin), t = 1 at
 * that centre. The chain hangs off the flashlight and, as the page scrolls,
 * spreads a little and fades, like a slightly nearer parallax plane.
 * size is a % of the scene width; tint is an "r g b" triple.
 */
const FLARES = [
  { t: 0.55, size: 1.2, kind: 'disk', tint: '255 214 150' },
  { t: 1.0, size: 1.8, kind: 'disk', tint: '255 190 120' },
  { t: 1.25, size: 5, kind: 'disk', tint: '255 176 96' },
  { t: 1.34, size: 2.2, kind: 'disk', tint: '130 190 255' },
  { t: 1.6, size: 8, kind: 'disk', tint: '90 200 140' },
  { t: 1.85, size: 15, kind: 'ring', tint: '190 160 255' },
] as const;

/** Lens centre on the poster, and how much the chain spreads by the end of the hero. */
const LENS_CENTRE = { x: 1010, y: 990 };
const FLARE_SPREAD = 0.3;

const placeFlares = (root: HTMLElement, p: number) => {
  const light = root.querySelector<HTMLElement>('.forest__flashlight');
  const spans = root.querySelectorAll<HTMLElement>('.forest__flare');
  if (!light || !spans.length) return;
  const r = root.getBoundingClientRect();
  const l = light.getBoundingClientRect();
  const sx = l.left + l.width / 2 - r.left;
  const sy = l.top + l.height / 2 - r.top;
  const k = (r.width / sceneData.canvas) * (1 + p * FLARE_SPREAD);
  const dx = (LENS_CENTRE.x - sceneData.flashlight.x) * k;
  const dy = (LENS_CENTRE.y - sceneData.flashlight.y) * k;
  spans.forEach((el, i) => {
    const t = FLARES[i].t;
    el.style.transform = `translate3d(${(sx + dx * t).toFixed(1)}px, ${(sy + dy * t).toFixed(1)}px, 0) translate(-50%, -50%)`;
  });
  root.style.setProperty('--flare', (1 - Math.min(1, p * 1.6)).toFixed(3));
};

/** Stable pseudo-random in [0, 1) so server and client render the same twinkle timings. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const bulbStyle = (b: (typeof sceneData.bulbs)[number], i: number): CSSProperties => {
  const size = Math.max(b.r, 3) * 8;
  const flaky = isFlaky(i);
  return {
    left: pct(b.x),
    top: pct(b.y),
    width: pctLen(size),
    height: pctLen(size),
    '--hue': b.hue,
    // Flaky bulbs stutter on short cycles; the rest swell and fade.
    '--dur': `${(flaky ? 1.1 + rand(i) * 1.6 : 1.8 + rand(i) * 3).toFixed(2)}s`,
    '--delay': `${(-rand(i + 99) * 7).toFixed(2)}s`,
    '--peak': (0.75 + rand(i + 7) * 0.25).toFixed(2),
  } as CSSProperties;
};

/** About one bulb in four has a loose connection. */
const isFlaky = (i: number) => rand(i + 51) < 0.27;

const bulbClass = (i: number) =>
  isFlaky(i) ? `forest__bulb forest__bulb--flaky${i % 2}` : `forest__bulb forest__bulb--${i % 3}`;

const Bulbs = ({ group }: { group: 'left' | 'right' | 'strand' }) => (
  <div className="forest__glows" aria-hidden="true">
    {sceneData.bulbs.map((b, i) =>
      b.group === group ? <span key={i} className={bulbClass(i)} style={bulbStyle(b, i)} /> : null,
    )}
  </div>
);

const Stars = () => (
  <div className="forest__glows" aria-hidden="true">
    {sceneData.stars.map((s, i) => (
      <span
        key={i}
        className="forest__star"
        style={
          {
            left: pct(s.x),
            top: pct(s.y),
            '--dur': `${(4 + rand(i + 300) * 6).toFixed(2)}s`,
            '--delay': `${(-rand(i + 400) * 10).toFixed(2)}s`,
          } as CSSProperties
        }
      />
    ))}
  </div>
);

const extras: Partial<Record<LayerId, () => ReactElement>> = {
  sky: Stars,
  mist: () => (
    <div className="forest__mist-wrap" aria-hidden="true">
      <div className="forest__mist forest__mist--a" />
      <div className="forest__mist forest__mist--b" />
    </div>
  ),
  shade: () => <div className="forest__shade" aria-hidden="true" />,
  groundMist: () => (
    <div className="forest__mist-wrap forest__mist-wrap--ground" aria-hidden="true">
      <div className="forest__mist forest__mist--a" />
    </div>
  ),
  cabin: () => (
    <div className="forest__glows" aria-hidden="true">
      <span
        className="forest__window"
        style={{ left: pct(sceneData.window.x), top: pct(sceneData.window.y) }}
      />
    </div>
  ),
  strand: () => <Bulbs group="strand" />,
  family: () => (
    <div className="forest__glows" aria-hidden="true">
      <span
        className="forest__flashlight"
        style={{ left: pct(sceneData.flashlight.x), top: pct(sceneData.flashlight.y) }}
      />
    </div>
  ),
  treesLeft: () => <Bulbs group="left" />,
  treesRight: () => <Bulbs group="right" />,
};

/** Each tree sways from its roots. */
const swayOrigin: Partial<Record<LayerId, string>> = {
  treesLeft: `${pct(510)} ${pct(1120)}`,
  treesRight: `${pct(1500)} ${pct(1120)}`,
};

interface Props {
  label?: string;
}

/**
 * The 2025 poster as five depth planes (plus mist and the light strand).
 * Scrolling through the hero drives a slow camera push into the forest: far
 * planes lag, the foreground trees part and grow, the family leans in. Scroll
 * progress runs through a critically damped spring, and transforms are written
 * straight to the DOM so React never re-renders while things move.
 */
export const ForestParallax = ({ label = 'The Spencer family in a moonlit forest strung with Christmas lights' }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Partial<Record<LayerId, HTMLDivElement | null>>>({});
  const [settings, setSettings] = useState<MotionSettings>(defaultSettings);
  const settingsRef = useRef(settings);
  const kickRef = useRef<() => void>(() => {});
  const [debug, setDebug] = useState(false);

  const updateSettings = useCallback((next: MotionSettings) => {
    settingsRef.current = next;
    setSettings(next);
    kickRef.current();
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('debug')) setDebug(true);
  }, []);

  const reduced = settings.reducedMotion;

  // Keep the glows and mist hidden until the art itself has decoded.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const imgs = [...root.querySelectorAll<HTMLImageElement>('.forest__img')];
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() =>
      root.setAttribute('data-ready', ''),
    );
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reduced) {
      for (const el of Object.values(layerRefs.current)) if (el) el.style.transform = '';
      placeFlares(root, 0);
      kickRef.current = () => {};
      return;
    }

    const compact = matchMedia('(max-width: 768px)').matches;
    let target = 0; // scroll progress through the hero, 0..1
    let p = 0;
    let vel = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const frame = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;

      // Critically damped spring on scroll progress: heavy, no overshoot.
      const k = s.stiffness;
      vel += ((target - p) * k - vel * 2 * Math.sqrt(k)) * dt;
      p += vel * dt;

      const w = root.offsetWidth;
      const h = root.offsetHeight;
      const amt = s.intensity * (compact ? 0.7 : 1);
      // Camera push-in: the foreground trees part and grow, the family leans in.
      const treeScale = 1 + p * s.pushIn * amt;
      const spread = p * s.spread * amt * w;
      // The strand stretches with the trees so its ends stay on the trunks.
      const trunkGap = TRUNK_GAP * w;
      const strandStretch = (trunkGap * treeScale + spread * 2) / (trunkGap * treeScale);

      for (const layer of layers) {
        const el = layerRefs.current[layer.id];
        if (!el) continue;
        const d = s.depths[layer.id];
        const y = p * h * s.drift * (1 - d) * amt;
        let x = 0;
        let sx = 1;
        let sy = 1;
        if (layer.id === 'treesLeft' || layer.id === 'treesRight') {
          x = layer.id === 'treesLeft' ? -spread : spread;
          sx = sy = treeScale;
        } else if (layer.id === 'strand') {
          sx = treeScale * strandStretch;
          sy = treeScale;
        } else if (layer.id === 'family') {
          sx = sy = 1 + p * s.pushIn * FAMILY_PUSH * amt;
        }
        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` +
          (sx !== 1 || sy !== 1 ? ` scale(${sx.toFixed(4)}, ${sy.toFixed(4)})` : '');
      }
      root.style.setProperty('--motion', Math.min(1, Math.abs(vel) * 4).toFixed(3));
      placeFlares(root, p);

      const settled = Math.abs(target - p) < 0.0002 && Math.abs(vel) < 0.0002;
      if (!settled && visible) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const readScroll = () => {
      const rect = root.getBoundingClientRect();
      target = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      root.toggleAttribute('data-paused', !visible);
      if (visible) kick();
    });
    io.observe(root);

    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('resize', readScroll);
    readScroll();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener('scroll', readScroll);
      removeEventListener('resize', readScroll);
      kickRef.current = () => {};
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="forest"
      role="img"
      aria-label={label}
      data-reduced={reduced || undefined}
      data-bounds={settings.showBounds || undefined}
      style={{ '--ambient': settings.ambient } as CSSProperties}
    >
      {layers.map((layer) => {
        const Extra = extras[layer.id];
        const origin = swayOrigin[layer.id];
        const content = (
          <>
            {layer.src && (
              <img
                className="forest__img"
                src={layer.src}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={layer.id === 'family' || layer.id === 'sky' ? 'high' : undefined}
              />
            )}
            {Extra && <Extra />}
          </>
        );
        return (
          <div
            key={layer.id}
            ref={(el) => {
              layerRefs.current[layer.id] = el;
            }}
            className={`forest__layer forest__layer--${layer.id}`}
            data-label={layer.label}
            hidden={settings.hidden[layer.id]}
          >
            {origin ? (
              <div className="forest__sway" style={{ transformOrigin: origin }}>
                {content}
              </div>
            ) : (
              content
            )}
          </div>
        );
      })}
      <div className="forest__vignette" aria-hidden="true" />
      <div className="forest__flares" aria-hidden="true">
        {FLARES.map((f, i) => (
          <span
            key={i}
            className={`forest__flare forest__flare--${f.kind}`}
            style={{ width: `${f.size}%`, '--tint': f.tint } as CSSProperties}
          />
        ))}
      </div>
      {DevPanel && debug && (
        <Suspense fallback={null}>
          <DevPanel settings={settings} onChange={updateSettings} />
        </Suspense>
      )}
    </div>
  );
};
