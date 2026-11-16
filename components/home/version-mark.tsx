import clsx from 'clsx';
import { Braces, KeyRound, Layers, PanelsTopLeft, Percent, Truck } from 'lucide-react';

const K = 0.866;

type Pt = readonly [number, number];
type Frame = readonly [number, number, number, number, number, number];
type Tone = { face: string; left: string; right: string };

// The marketing site's projection (laravelshopper.dev, sections/home/iso.tsx), so both heroes share one angle.
const P = (x: number, y: number, z = 0): Pt => [(x - y) * K, (x + y) / 2 - z];
const map = ([a, b, c, d, e, f]: Frame, u: number, v: number): Pt => [a * u + c * v + e, b * u + d * v + f];
const floorFrame = (x: number, y: number, z: number): Frame => [K, 0.5, -K, 0.5, ...P(x, y, z)];
const leftFrame = (x: number, y: number, z: number): Frame => [K, 0.5, 0, 1, ...P(x, y, z)];
const loop = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

const outline = (frame: Frame, corners: Pt[]): Pt[] => corners.map(([u, v]) => map(frame, u, v));

/**
 * The near face of a prism and its visible sides. A side is a run of edges that face the sweep under the same
 * light; where two sides overlap on screen, the one further along the sweep is nearer, so sides draw in that order.
 */
function extrude(contours: { pts: Pt[]; hole?: boolean }[], [sx, sy]: Pt) {
  const runs: { pts: Pt[]; lit: boolean }[] = [];

  for (const { pts, hole } of contours) {
    const area = pts.reduce((sum, [x, y], i) => {
      const [x2, y2] = pts[(i + 1) % pts.length];
      return sum + x * y2 - x2 * y;
    }, 0);
    const out = Math.sign(area) * (hole ? -1 : 1);
    const edges = pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const nx = out * (q[1] - p[1]);
      const ny = out * (p[0] - q[0]);
      return { p, q, visible: nx * sx + ny * sy > 1e-6, lit: (sx * ny - sy * nx) * sy > 0 };
    });
    const start = edges.findIndex((e, i) => e.visible && (!edges.at(i - 1)!.visible || edges.at(i - 1)!.lit !== e.lit));
    let run: (typeof runs)[number] | undefined;

    for (const e of [...edges.slice(start), ...edges.slice(0, start)]) {
      if (!e.visible) run = undefined;
      else if (run?.lit === e.lit) run.pts.push(e.q);
      else runs.push((run = { pts: [e.p, e.q], lit: e.lit }));
    }
  }

  const depth = (pts: Pt[]) => pts.reduce((sum, [x, y]) => sum + x * sx + y * sy, 0) / pts.length;
  const sides = runs
    .map(({ pts, lit }) => ({ lit, depth: depth(pts), d: loop([...pts, ...pts.map(([x, y]): Pt => [x + sx, y + sy]).reverse()]) }))
    .sort((a, b) => a.depth - b.depth);

  return { face: contours.map(({ pts }) => loop(pts)).join(''), sides };
}

function Solid({
  contours,
  sweep,
  tone,
  ink,
  stroke = 1.2,
}: {
  contours: { pts: Pt[]; hole?: boolean }[];
  sweep: Pt;
  tone: Tone;
  ink: string;
  stroke?: number;
}) {
  const { face, sides } = extrude(contours, sweep);

  return (
    <g className={ink} strokeWidth={stroke} strokeLinejoin="round">
      {sides.map((side) => (
        <path key={side.d} d={side.d} className={side.lit ? tone.left : tone.right} />
      ))}
      <path d={face} fillRule="evenodd" className={tone.face} />
    </g>
  );
}

const H = 120;
const T = 26;
const W = 80;
const MID = 56;
const GAP = 14;
const DEPTH = 24;

const THREE: Pt[] = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
  [0, H - T],
  [W - T, H - T],
  [W - T, MID + T / 2],
  [24, MID + T / 2],
  [24, MID - T / 2],
  [W - T, MID - T / 2],
  [W - T, T],
  [0, T],
];
const box = (u: number, v: number, w: number, h: number): Pt[] => [
  [u, v],
  [u + w, v],
  [u + w, v + h],
  [u, v + h],
];

const DOT = W + GAP;
const ZERO = DOT + T + GAP;
const SPAN = ZERO + W;
const TILE = { size: 22, gap: 16, h: 6, y: 10 };
const PLATE = { x: -22, y: -DEPTH - 22, w: SPAN + 44, d: DEPTH + 22 + TILE.y + TILE.size + 10, h: 12 };

// One tile per "What's new in 3.0" card on the home page, in the same order.
const ADDITIONS = [Braces, Percent, Truck, KeyRound, PanelsTopLeft, Layers];
const tilesFrom = (SPAN - ADDITIONS.length * (TILE.size + TILE.gap) + TILE.gap) / 2;

const DIGITS: Tone = {
  face: 'fill-white dark:fill-zinc-800',
  left: 'fill-brand-200 dark:fill-brand-600',
  right: 'fill-brand-400 dark:fill-brand-800',
};
const DECK: Tone = {
  face: 'fill-zinc-50 dark:fill-zinc-900',
  left: 'fill-zinc-200 dark:fill-zinc-800',
  right: 'fill-zinc-300 dark:fill-zinc-700',
};
const BLOCK: Tone = {
  face: 'fill-white dark:fill-zinc-800',
  left: 'fill-zinc-100 dark:fill-zinc-700',
  right: 'fill-zinc-200 dark:fill-zinc-600',
};

const glyphFrame = leftFrame(0, 0, PLATE.h + H);
// One solid per glyph, left to right: a glyph's sides run back behind the next glyph, which must paint over them.
const glyphs = [
  [{ pts: outline(glyphFrame, THREE) }],
  [{ pts: outline(glyphFrame, box(DOT, H - T, T, T)) }],
  [{ pts: outline(glyphFrame, box(ZERO, 0, W, H)) }, { pts: outline(glyphFrame, box(ZERO + T, T, W - 2 * T, H - 2 * T)), hole: true }],
];
const deck = outline(floorFrame(PLATE.x, PLATE.y, PLATE.h), box(0, 0, PLATE.w, PLATE.d));
const sweep: Pt = [K * DEPTH, -0.5 * DEPTH];

const corners = [...deck, ...deck.map(([x, y]): Pt => [x, y + PLATE.h]), ...glyphs.flat().flatMap(({ pts }) => pts)];
const xs = corners.map(([x]) => x);
const ys = corners.map(([, y]) => y);
const VIEW = [Math.min(...xs) - 16, Math.min(...ys) - 16, Math.max(...xs) - Math.min(...xs) + 32, Math.max(...ys) - Math.min(...ys) + 40];

export function VersionMark({ className }: { className?: string }) {
  const grid = Array.from({ length: 13 }, (_, i) => -240 + i * 40);

  return (
    <svg viewBox={VIEW.map((v) => v.toFixed(1)).join(' ')} className={clsx('overflow-visible', className)} role="img" aria-label="Shopper 3.0">
      <defs>
        <radialGradient id="version-fade" r="0.6">
          <stop offset="0.35" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="version-mask">
          <rect x={VIEW[0] - 80} y={VIEW[1] - 80} width={VIEW[2] + 160} height={VIEW[3] + 160} fill="url(#version-fade)" />
        </mask>
        <filter id="version-blur" x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <g className="stroke-brand-950/8 dark:stroke-white/8" strokeWidth={0.5} mask="url(#version-mask)">
        {grid.map((t) => (
          <g key={t}>
            <line x1={P(t, -240)[0]} y1={P(t, -240)[1]} x2={P(t, 240)[0]} y2={P(t, 240)[1]} />
            <line x1={P(-240, t)[0]} y1={P(-240, t)[1]} x2={P(240, t)[0]} y2={P(240, t)[1]} />
          </g>
        ))}
      </g>

      <path
        d={loop(outline(floorFrame(PLATE.x + 10, PLATE.y + 10, -2), box(0, 0, PLATE.w, PLATE.d)))}
        className="fill-zinc-400/30 dark:fill-black/60"
        filter="url(#version-blur)"
      />
      <Solid contours={[{ pts: deck }]} sweep={[0, PLATE.h]} tone={DECK} ink="stroke-zinc-400 dark:stroke-zinc-600" stroke={0.6} />
      <path
        d={loop(outline(floorFrame(-4, -DEPTH - 2, PLATE.h), box(0, 0, SPAN + 12, DEPTH + 10)))}
        className="fill-brand-900/15 dark:fill-black/50"
        filter="url(#version-blur)"
      />
      <g className="motion-safe:animate-mark-rise">
        {glyphs.map((contours, i) => (
          <Solid key={i} contours={contours} sweep={sweep} tone={DIGITS} ink="stroke-brand-700 dark:stroke-brand-400" />
        ))}
      </g>
      {ADDITIONS.map((Icon, i) => {
        const top = floorFrame(tilesFrom + i * (TILE.size + TILE.gap), TILE.y, PLATE.h + TILE.h);
        return (
          <g key={i} className="motion-safe:animate-mark-drop" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
            <g className="motion-safe:animate-mark-float" style={{ animationDelay: `${1.5 + i * 0.9}s` }}>
              <Solid contours={[{ pts: outline(top, box(0, 0, TILE.size, TILE.size)) }]} sweep={[0, TILE.h]} tone={BLOCK} ink="stroke-zinc-400 dark:stroke-zinc-600" stroke={0.6} />
              <g transform={`matrix(${top.join(' ')})`}>
                <Icon x={4} y={4} width={TILE.size - 8} height={TILE.size - 8} className="text-brand-600 dark:text-brand-400" />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
