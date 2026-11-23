# Brief: scroll parallax for the 2025 invite poster

## Goal

Bring the 2025 Hipster Holiday poster (the family in a moonlit forest strung with
Christmas lights) to life on `/2025/` with a **scroll-driven** parallax. As the guest
scrolls from the poster down to the invite details, the camera should feel like it
slowly pushes into the forest and the scene comes apart in depth. The pointer does
nothing.

The first frame, before any scrolling, must look exactly like the original poster.
If someone doesn't scroll, they should only see the art.

## Source art

- Build every layer **only** from the four layer assets in `scripts/parallax-2025/src/`:
  `family.png` (cutout), `forest.png` (moonlit forest), `trees.png` (lit trees; its
  checkerboard is baked in, so key it out) and `cabin.png` (cutout).
- `original.jpg` is reference only. Use it for placement, and to grade the
  daylight-lit family into the poster's moonlight (a heavily blurred light/colour
  map, an edge light-wrap, and the same dissolve into the forest at the bottom).
  None of its pixels appear on screen.
- Don't redraw or restyle the family. The first frame should read as the poster.

## Planes (back to front) and how each one scrolls

`depth` is 0 (infinitely far) to 1 (nearest). `p` is scroll progress through the
hero: 0 when the poster sits at the top of the page, 1 when its bottom edge reaches
the top of the viewport.

| Plane | Contents | On scroll |
|---|---|---|
| Night sky (0.05) | gradient, stars, vignette | lags most, so it barely moves on screen |
| Distant forest (0.15) | misty tree lines | lags strongly |
| Mist (0.25) | soft drifting haze | lags, keeps drifting on its own |
| Family (0.6) | the four of them, graded to moonlight, dissolving into the forest at the bottom | slight lag, slight scale-up (focal point, stays sharp) |
| Ground mist (0.65) | low haze where the family meets the ground | between family and cabin |
| Cabin (0.7) | the cabin with its shrubs and lit window, centred near the bottom at the poster's size, **in front of the family**; the only cabin in the scene | moves slightly more than the family |
| Light strand | the strand between the trees, drawn behind the family | moves with the trees |
| Foreground trees (1.0) | the two lit trunks and their branches | move with the page, spread outward and scale up as if the camera walks between them |

- Vertical: offset = `p × heroHeight × drift × (1 − depth)`, with drift ≈ 0.4.
- Push-in: foreground trees spread apart horizontally by up to about 6% of the hero
  width, and scale by up to about 1.08. The family scales by up to about 1.03.
- Smooth the scroll value with a critically damped spring so the motion feels heavy,
  never jittery and never springy.
- No plane may reveal an empty edge, a transparent gap or a sharp duplicate of
  itself at any `p`. Build overscan into every layer, and put clean, soft "plates"
  behind anything that slides.

## Ambient life (independent of scroll, subtle, beautiful when still)

- Bulbs visibly flicker on their own irregular rhythms and keep their colors.
  About a quarter of them stutter like loose bulbs. Nothing blinks in sync.
- The flashlight bloom breathes gently and brightens a little while the page is moving.
- The cabin window flickers very slightly.
- Stars shimmer faintly, and mist drifts slowly.
- The trees sway a fraction of a degree from their roots.
- No new particles, text, lens flares or glow beyond what the poster has.

## Technical

- Astro page with a React + TypeScript island (`client:load`). Plain CSS, no WebGL,
  and no animation library unless it clearly earns its place.
- One `requestAnimationFrame` loop that runs only while the spring is settling.
  Write `translate3d` / `scale` straight to the DOM with no React re-renders, and use
  `will-change` only on moving planes.
- Pause the loop and the CSS animations while the hero is off screen.
- `prefers-reduced-motion`: static poster, no scroll motion, no twinkle.
- Mobile: same choreography with smaller amplitudes. Never crop the family, and
  keep the page free of horizontal scroll.
- Keep one shared overscanned canvas for every layer, a single layer config file,
  and a generated data file for bulb, star, window and flashlight positions.
  Include a reproducible asset script.
- Add a dev-only tuning panel (`?debug` under `astro dev`, absent from production
  builds) with controls for drift, spread, push-in, smoothing, ambient intensity,
  per-layer depth and visibility, reduced motion, and alpha-edge outlines.

## Done when

- At `p = 0` the scene is indistinguishable from the original poster.
- Scrolling clearly separates five planes, with the family as the focal point.
- No gaps, seams, duplicated trunks, cabins or family edges at any `p`, at 1440px
  and at 375px wide.
- Effects are subtle, the build passes, and reduced motion is respected.
- It has been checked in a real browser at several scroll positions, with the
  limits of the source art written up honestly.
