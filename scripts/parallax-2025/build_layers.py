"""Build the 2025 invite's parallax planes from the layer art in ./src.

Every visible pixel comes from the four layer assets:
  src/forest.png  moonlit pine forest     -> night sky + distant forest
  src/family.png  family cutout (alpha)   -> family
  src/cabin.png   cabin on its hill with pines (alpha) -> cabin, its own plane in front of the family
  src/trees.png   lit trees on a baked-in checkerboard -> foreground trees + light strand

src/original.jpg (the finished 2000x2000 poster) is used only as a reference:
for where things sit, and for the family's lighting, which is transferred as
a heavily blurred light/colour map so the daylight-lit cutout sits in the
moonlit scene the way it does on the poster. None of its pixels are drawn.

Every plane shares one canvas: the poster's 2000px square plus OVERSCAN px on
every side. Outputs go to public/2025/assets/parallax/ plus
src/components/forest/sceneData.ts (bulb, star, window, flashlight positions).

Needs Python 3.12 with: numpy pillow opencv-python-headless
  python3.12 -m venv .venv && .venv/bin/pip install numpy pillow opencv-python-headless
  .venv/bin/python scripts/parallax-2025/build_layers.py
"""

from pathlib import Path
import json

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(__file__).resolve().parent / "src"
OUT = ROOT / "public/2025/assets/parallax"
DATA = ROOT / "src/components/forest/sceneData.ts"

N = 2000
OVERSCAN = 100
C = N + 2 * OVERSCAN
PAGE_BG = np.array([1, 3, 16], np.float32)  # #010310

# Placements (asset px -> poster px).
M_FAMILY = np.array([[0.70423, 0.00104, 519.81], [-0.00104, 0.70423, 189.57]], np.float32)  # SIFT/RANSAC vs the poster
FOREST_SCALE, FOREST_X, FOREST_Y = 1.25, 1000 - 1254 * 1.25 / 2, -100  # ground line lands under the cabin
TREES_DX, TREES_DY = 376, -90  # trunks on the poster's trunks
CABIN_SCALE = 0.43  # cabin body ~230px wide, as on the poster
CABIN_WINDOW_SRC = (890, 668)  # window centre in cabin.png
CABIN_WINDOW_DST = (1031, 985)  # window centre on the poster: the cabin goes back where it was


def load(name, mode="RGBA"):
    return np.array(Image.open(SRC / name).convert(mode)).astype(np.float32)


def warp(img, M):
    M = M.copy()
    M[:, 2] += OVERSCAN
    return cv2.warpAffine(img, M, (C, C), flags=cv2.INTER_AREA if M[0, 0] < 1 else cv2.INTER_LANCZOS4,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def place(img, scale, x, y):
    return warp(img, np.array([[scale, 0, x], [0, scale, y]], np.float32))


def ramp(v, a, b):
    return np.clip((v - a) / (b - a), 0, 1)


def smooth(v):
    return v * v * (3 - 2 * v)


def blur(img, s):
    return cv2.GaussianBlur(img, (0, 0), s)


def lum(rgb):
    return rgb @ np.array([0.3, 0.55, 0.15], np.float32)


def save_rgba(name, rgb, a, q=86):
    arr = np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    Image.fromarray(arr, "RGBA").save(OUT / name, quality=q, method=6, alpha_quality=90)


def blobs(mask, min_area, max_area):
    n, _, stats, cents = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    return [(cents[i][0], cents[i][1], stats[i, cv2.CC_STAT_AREA])
            for i in range(1, n) if min_area <= stats[i, cv2.CC_STAT_AREA] <= max_area]


OUT.mkdir(parents=True, exist_ok=True)
for stale in ("near.webp",):
    (OUT / stale).unlink(missing_ok=True)
yy, xx = np.mgrid[0:C, 0:C].astype(np.float32)
Y, X = yy - OVERSCAN, xx - OVERSCAN  # poster coordinates

# The poster's frame: an open window onto the forest, dark at the sides. The
# darkness below is its own plane in the component (it must not drift with
# these far layers, or scrolling would uncover the ground).
frame = smooth(ramp(X, 300, 520)) * smooth(ramp(1700 - X, 0, 220))
frame = np.clip(blur(frame, 30), 0, 1)

# ---------------------------------------------------------------- forest: sky + distant forest
forest = place(load("forest.png"), FOREST_SCALE, FOREST_X, FOREST_Y)
f_rgb = forest[..., :3] * np.array([0.82, 0.86, 0.95], np.float32)  # a touch deeper, like the poster
L = lum(f_rgb)

sky_rows = np.percentile(L[:, OVERSCAN + 650:OVERSCAN + 1350], 90, axis=1)
sky_rows = np.maximum.accumulate(blur(sky_rows[:, None], 6)[:, 0])
key = smooth(ramp(sky_rows[:, None] - L, 5, 20))
far_a = np.maximum(key * ramp(Y, 60, 160), smooth(ramp(Y, 640, 820)))
far_a = np.clip(far_a, 0, 1)

soft = blur(f_rgb, 22)
plate = blur(far_a, 4)[..., None]
sky_rgb = f_rgb * (1 - plate) + soft * plate
fr = frame[..., None]
sky_rgb = sky_rgb * (0.12 + 0.88 * fr) + PAGE_BG * (1 - fr) * 0.88  # darkness outside the frame
far_rgb = f_rgb * (0.12 + 0.88 * fr)
Image.fromarray(np.clip(sky_rgb, 0, 255).astype(np.uint8)).save(OUT / "sky.jpg", quality=86, optimize=True, progressive=True)
save_rgba("far.webp", far_rgb, far_a * (0.25 + 0.75 * frame))

# ---------------------------------------------------------------- foreground trees + strand
tr = load("trees.png", "RGB")
h, w = tr.shape[:2]
tl = lum(tr)
chroma = tr.max(2) - tr.min(2)
# The "transparent" background is a baked-in light checkerboard: key it out.
a = np.clip(np.maximum(ramp(226 - tl, 0, 36), ramp(chroma, 8, 34)), 0, 1)
safe = np.maximum(a, 0.08)[..., None]
tr_fg = np.clip((tr - (1 - a[..., None]) * 246.0) / safe, 0, 255)
tr_fg = np.where(a[..., None] > 0.98, tr, tr_fg)
# The poster's trunks are near-black silhouettes: grade bark and needles down,
# keep the bulbs (and their glow) at full brightness.
hsv0 = cv2.cvtColor(np.clip(tr, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
glow = ((hsv0[..., 1] > 110) & (hsv0[..., 2] > 150) & ((hsv0[..., 0] < 95) | (hsv0[..., 0] > 125))).astype(np.float32)
glow = np.clip(blur(cv2.dilate(glow, np.ones((5, 5), np.uint8)), 3) * 1.5, 0, 1)[..., None]
tr_fg = tr_fg * np.array([0.42, 0.48, 0.6], np.float32) * (1 - glow) + tr_fg * glow
a *= 1 - smooth(ramp(np.arange(h, dtype=np.float32)[:, None], 1090, 1240))  # roots dissolve into the dark
a *= ramp(np.arange(w, dtype=np.float32)[None, :], 0, 50) * ramp(w - np.arange(w, dtype=np.float32)[None, :], 0, 50)

ty, tx = np.mgrid[0:h, 0:w].astype(np.float32)
strand_m = ramp(tx, 200, 260) * ramp(1060 - tx, 0, 60) * ramp(ty, 330, 380) * ramp(640 - ty, 0, 40)
tree_c = place(np.dstack([tr_fg, a]), 1, TREES_DX, TREES_DY)
for name, m in (("trees-left.webp", (tx < w / 2) * (1 - strand_m)),
                ("trees-right.webp", (tx >= w / 2) * (1 - strand_m)),
                ("strand.webp", strand_m)):
    mc = place(m.astype(np.float32), 1, TREES_DX, TREES_DY)
    save_rgba(name, tree_c[..., :3], tree_c[..., 3] * mc)

bulb = ((hsv0[..., 1] > 120) & (hsv0[..., 2] > 170)).astype(np.uint8)
bulb = cv2.morphologyEx(bulb, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
bulbs = []
for bx, by, area in blobs(bulb, 18, 900):
    ix, iy = int(bx), int(by)
    hue = int(hsv0[iy, ix, 0]) * 2
    if 190 <= hue <= 265:  # moonlit blue needles, not bulbs
        continue
    bulbs.append({
        "x": round(bx + TREES_DX, 1), "y": round(by + TREES_DY, 1),
        "r": round(float(np.sqrt(area / np.pi)), 1), "hue": hue,
        "group": "strand" if strand_m[iy, ix] > 0.5 else ("left" if bx < w / 2 else "right"),
    })

# ---------------------------------------------------------------- family
fam = warp(load("family.png"), M_FAMILY)
f_a = fam[..., 3] / 255
fam_rgb = fam[..., :3]

# Transfer the poster's lighting: per-channel gain from the heavily blurred
# poster vs. the blurred cutout, sampled well inside the figures only.
ref = np.zeros((C, C, 3), np.float32)
ref[OVERSCAN:OVERSCAN + N, OVERSCAN:OVERSCAN + N] = load("original.jpg", "RGB")
inner = cv2.erode((f_a > 0.95).astype(np.uint8), np.ones((17, 17), np.uint8)).astype(np.float32)
inner *= 1 - ramp(Y, 760, 820)  # below this the poster dissolves into forest; don't sample it
S = 18
wsum = blur(inner, S)[..., None] + 1e-4
ref_lo = blur(ref * inner[..., None], S) / wsum
src_lo = blur(fam_rgb * inner[..., None], S) / wsum
gain = np.clip((ref_lo + 2) / (src_lo + 2), 0.12, 2.2)
# carry the gain past the sampled area (edges, lower bodies) by diffusing it outward
conf = np.clip(blur(inner, S) * 3, 0, 1)[..., None]
far_gain = blur(gain * conf, 60) / (blur(conf[..., 0], 60)[..., None] + 1e-4)
gain = gain * conf + far_gain * (1 - conf)
graded = np.clip(fam_rgb * gain, 0, 255)

# Light wrap: let the moonlit background bleed into the silhouette edge.
bg_near = blur(sky_rgb * (1 - far_a[..., None]) + far_rgb * far_a[..., None], 14)
edge = np.clip(blur(1 - f_a, 5) * f_a * 2.2, 0, 1)[..., None]
graded = graded * (1 - edge * 0.45) + bg_near * edge * 0.45

# Dissolve into the forest the way the poster does: the adults fade above the
# cabin roof, the boys at their waists; a little noise keeps it organic.
adults = ramp(X, 860, 900) * ramp(1175 - X, 0, 40)
fade_y = 770 * adults + 875 * (1 - adults)
rng = np.random.default_rng(3)
noise = cv2.resize(rng.random((40, 40)).astype(np.float32), (C, C), interpolation=cv2.INTER_CUBIC)
# (the cutout itself ends at y~1008, so the fade must be complete before that)
fam_alpha = f_a * (1 - smooth(ramp(Y - fade_y + (noise - 0.5) * 50, 0, 105)))
save_rgba("family.webp", graded, fam_alpha, q=90)

# ---------------------------------------------------------------- cabin
# The cabin art brings its own hill and pines. Grade it into the moonlight,
# let the pine tips dissolve into the mist, and let the hill sink into the
# ground shadow, so it reads as part of the poster rather than a sticker.
cab_src = load("cabin.png")
cx = CABIN_WINDOW_DST[0] - CABIN_WINDOW_SRC[0] * CABIN_SCALE
cy = CABIN_WINDOW_DST[1] - CABIN_WINDOW_SRC[1] * CABIN_SCALE
window = CABIN_WINDOW_DST
cab = place(cab_src, CABIN_SCALE, cx, cy)
c_rgb, c_a = cab[..., :3], cab[..., 3] / 255
c_rgb = c_rgb * np.array([0.9, 0.93, 1.02], np.float32)

# atmospheric haze: the sky colour behind, stronger toward the pine tips
haze_col = blur(sky_rgb, 30)
top = cy + 40 * CABIN_SCALE  # tallest tip
haze = 0.12 + 0.38 * (1 - smooth(ramp(Y, top, top + 200)))
warm = np.clip((c_rgb[..., 0] - c_rgb[..., 2] - 30) / 60, 0, 1)  # keep the lit window and grass clean
haze = (haze * (1 - warm))[..., None]
c_rgb = c_rgb * (1 - haze) + haze_col * haze
c_a *= 0.55 + 0.45 * smooth(ramp(Y, top, top + 90))  # tips melt into the mist

# the hill sinks into the ground shadow (matches .forest__shade at rest)
shade_at = np.interp(Y, [940, 1040, 1140, 1230], [0, 0.35, 0.8, 1.0])[..., None]
c_rgb = c_rgb * (1 - shade_at * 0.85) + PAGE_BG * shade_at * 0.85
c_a *= 1 - smooth(ramp(Y, cy + 900 * CABIN_SCALE, cy + 975 * CABIN_SCALE))
save_rgba("cabin.webp", c_rgb, c_a, q=90)

# ---------------------------------------------------------------- mist
rng = np.random.default_rng(7)
mist = np.zeros((C // 4, C // 2), np.float32)
for octave, amp in ((6, 1.0), (12, 0.5), (24, 0.25)):
    n = rng.random((octave, octave * 2)).astype(np.float32)
    mist += cv2.resize(n, (C // 2, C // 4), interpolation=cv2.INTER_CUBIC) * amp
mist = (mist - mist.min()) / (mist.max() - mist.min())
mist = smooth(ramp(mist, 0.35, 0.9))
band = np.hanning(C // 4)[:, None].astype(np.float32)
save_rgba("mist.webp", np.ones((C // 4, C // 2, 3), np.float32) * np.array([120, 150, 220], np.float32),
          mist * band * 0.55, q=80)

# ---------------------------------------------------------------- anchors
sk = lum(sky_rgb)
star = (sk - blur(sk, 3) > 22) & (Y < 420) & (X > 560) & (X < 1440)
stars = [{"x": round(sx - OVERSCAN, 1), "y": round(sy - OVERSCAN, 1)} for sx, sy, _ in blobs(star, 1, 30)][:40]

fl = lum(graded) * (fam_alpha > 0.5)
fl_box = blur(fl, 8)[OVERSCAN + 650:OVERSCAN + 880, OVERSCAN + 1050:OVERSCAN + 1250]
fy, fx = np.unravel_index(np.argmax(fl_box), fl_box.shape)

scene = {
    "canvas": N, "overscan": OVERSCAN,
    "window": {"x": float(window[0]), "y": float(window[1])},
    "flashlight": {"x": float(fx + 1050), "y": float(fy + 650)},
    "bulbs": bulbs, "stars": stars,
}
DATA.parent.mkdir(parents=True, exist_ok=True)
DATA.write_text(
    "// Generated by scripts/parallax-2025/build_layers.py — do not edit by hand.\n"
    "// Positions are in the original 2000x2000 poster's pixels.\n"
    "export const sceneData = {\n"
    + "".join(f"  {k}: {json.dumps(v, separators=(',', ':'))},\n" for k, v in scene.items())
    + "} as const;\n"
)
print(f"bulbs {len(bulbs)}  stars {len(stars)}  window {scene['window']}  flashlight {scene['flashlight']}")
