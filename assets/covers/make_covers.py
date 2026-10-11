"""
Builds the "cover-only" pictures that the sketchbook colour feature paints over.

For each closed-sketchbook PNG it keeps ONLY the fabric front cover (not the
coloured spine, not the strip of page edges along the top, not the transparent
margin) and turns it into a grey texture with the same alpha. In the browser
that grey texture is multiplied by a pastel colour, so the real fabric
texture, rounded corners and rim shading all show through the new colour.

Run it again if you add a new closed-book picture:
    python3 assets/covers/make_covers.py
(needs: pip install pillow numpy)
"""
from pathlib import Path
import numpy as np
from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent
BOOKS = {  # output name -> closed book picture
    "blue-cover.png": "closed blue sketchbook for work.png",
    "rose-cover.png": "closed dusty rose sketchbook for work.png",
    "sage-cover.png": "closed sage-green sketchbook for about me.png",
}

for out_name, source in BOOKS.items():
    rgba = np.array(Image.open(ASSETS / source).convert("RGBA")).astype(float)
    alpha = rgba[..., 3] / 255.0
    lum = rgba[..., 0] * 0.30 + rgba[..., 1] * 0.59 + rgba[..., 2] * 0.11
    h, w = alpha.shape

    # Top of the book (first solid row down the middle), then the groove
    # just under the page-edge strip: the cover starts one row below it.
    column = alpha[:, w // 2] > 0.5
    top = int(np.argmax(column))
    strip = lum[top:top + 50, w * 2 // 5: w * 7 // 10].mean(axis=1)
    cover_top = top + 18 + int(np.argmin(strip[18:30])) + 1

    # Left edge of the cover = where the coloured spine ends (bright fabric
    # starts) — the same on every row, so read it from the middle rows.
    edges = []
    for y in range(h // 3, h * 3 // 4, 40):
        row = lum[y]
        edges.append(next(x for x in range(120, 260) if row[x:x + 8].min() > 185))
    cover_left = int(np.median(edges)) + 1

    # Soft 2px ramps along the two seams so there are no jagged edges.
    ys, xs = np.mgrid[0:h, 0:w]
    ramp_x = np.clip((xs - cover_left + 1) / 2.0, 0, 1)
    ramp_y = np.clip((ys - cover_top + 1) / 2.0, 0, 1)
    mask = alpha * ramp_x * ramp_y

    # Normalise the fabric brightness so its highlights are pure white and
    # the average is ~0.95: multiplying a pastel by this keeps the pastel's
    # own colour true while the weave and rim shadows still show.
    inside = mask > 0.99
    reference = np.percentile(lum[inside], 97)
    texture = np.clip(lum / reference, 0, 1) * 255

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[..., 0] = out[..., 1] = out[..., 2] = texture.astype(np.uint8)
    out[..., 3] = np.round(mask * 255).astype(np.uint8)
    Image.fromarray(out).save(ASSETS / "covers" / out_name, optimize=True)

    spine = rgba[h // 3: h * 3 // 4, 105:160, :3].reshape(-1, 3).mean(axis=0)
    print(f"{out_name}: cover starts x={cover_left}, y={cover_top}; "
          f"spine colour #{int(spine[0]):02x}{int(spine[1]):02x}{int(spine[2]):02x}")
