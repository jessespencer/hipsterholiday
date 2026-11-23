import { sceneData } from './sceneData';

export type LayerId =
  | 'sky'
  | 'far'
  | 'mist'
  | 'strand'
  | 'shade'
  | 'family'
  | 'groundMist'
  | 'cabin'
  | 'treesLeft'
  | 'treesRight';

export interface LayerConfig {
  id: LayerId;
  label: string;
  /** Image in public/; every image shares the same overscanned square canvas. */
  src?: string;
  /** 0 = infinitely far (lags the page most), 1 = nearest (moves with the page). */
  depth: number;
}

const base = '/2025/assets/parallax';

/** Back to front. Paint order and depth are separate on purpose: the light
 * strand hangs from the foreground trees (so it moves with them) but is
 * drawn behind the family, as in the original poster. The cabin is its own
 * plane just in front of the family, moving slightly more than they do.
 * The shadow the poster fades into stays with the page (depth 1), so the far
 * layers slide down behind it instead of dragging the darkness with them. */
export const layers: LayerConfig[] = [
  { id: 'sky', label: 'Night sky', src: `${base}/sky.jpg`, depth: 0.05 },
  { id: 'far', label: 'Distant forest', src: `${base}/far.webp`, depth: 0.15 },
  { id: 'mist', label: 'Mist', depth: 0.25 },
  { id: 'strand', label: 'Light strand', src: `${base}/strand.webp`, depth: 1 },
  { id: 'shade', label: 'Ground shadow', depth: 1 },
  { id: 'family', label: 'Family', src: `${base}/family.webp`, depth: 0.6 },
  { id: 'groundMist', label: 'Ground mist', depth: 0.65 },
  { id: 'cabin', label: 'Cabin', src: `${base}/cabin.webp`, depth: 0.7 },
  { id: 'treesLeft', label: 'Left tree', src: `${base}/trees-left.webp`, depth: 1 },
  { id: 'treesRight', label: 'Right tree', src: `${base}/trees-right.webp`, depth: 1 },
];

export interface MotionSettings {
  /** Multiplies all scroll motion. */
  intensity: number;
  /** How far planes lag behind the page, as a fraction of the hero height at depth 0. */
  drift: number;
  /** How far each foreground tree slides outward by the end of the hero (fraction of width). */
  spread: number;
  /** Extra scale on the foreground trees by the end of the hero (the camera push-in). */
  pushIn: number;
  /** Spring stiffness; lower is heavier and slower. */
  stiffness: number;
  /** Multiplies lights, glows, mist and stars. */
  ambient: number;
  depths: Record<LayerId, number>;
  hidden: Partial<Record<LayerId, boolean>>;
  reducedMotion: boolean;
  showBounds: boolean;
}

export const defaultSettings: MotionSettings = {
  intensity: 1,
  drift: 0.4,
  spread: 0.05,
  pushIn: 0.08,
  stiffness: 60,
  ambient: 1,
  depths: Object.fromEntries(layers.map((l) => [l.id, l.depth])) as Record<LayerId, number>,
  hidden: {},
  reducedMotion: false,
  showBounds: false,
};

const { canvas, overscan } = sceneData;
const box = canvas + overscan * 2;

/** Poster pixel -> percentage of a layer box. */
export const pct = (v: number) => `${(((v + overscan) / box) * 100).toFixed(3)}%`;
/** Poster length -> percentage of a layer box. */
export const pctLen = (v: number) => `${((v / box) * 100).toFixed(3)}%`;
