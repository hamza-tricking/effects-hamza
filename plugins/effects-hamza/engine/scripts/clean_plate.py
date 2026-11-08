"""Make an empty-room plate (person filled out) and a transparent person still from one frame.

Uses push-pull filling: the masked area is filled from the surrounding wall, ceiling and door.
Usage: python clean_plate.py <clip.mp4> <matte.mp4> <frame> <out_plate.png> <out_person.png>
"""

import subprocess
import sys

import numpy as np

W, H = 1080, 1920


def read_frame(path, frame, pix, ch):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", pix, "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, ch).astype(np.float32)


def dilate(mask, r):
    m = mask.copy()
    for _ in range(r):
        m = m | np.roll(m, 1, 0) | np.roll(m, -1, 0) | np.roll(m, 1, 1) | np.roll(m, -1, 1)
    return m


def push_pull(img, valid):
    """Fill invalid pixels by averaging valid ones over an image pyramid."""
    levels = []
    c, w = img * valid[..., None], valid.astype(np.float32)
    while min(c.shape[:2]) > 4:
        levels.append((c, w))
        h2, w2 = c.shape[0] // 2, c.shape[1] // 2
        c = c[: h2 * 2, : w2 * 2].reshape(h2, 2, w2, 2, 3).sum(axis=(1, 3))
        w = w[: h2 * 2, : w2 * 2].reshape(h2, 2, w2, 2).sum(axis=(1, 3))
    col = c / np.maximum(w, 1e-6)[..., None]
    for lvl in range(len(levels) - 1, -1, -1):
        c_l, w_l = levels[lvl]
        up = np.repeat(np.repeat(col, 2, 0), 2, 1)
        up = np.pad(up, ((0, c_l.shape[0] - up.shape[0]), (0, c_l.shape[1] - up.shape[1]), (0, 0)), mode="edge")
        up = box3(box3(up))  # smooth the upscale so no blocks show
        known = c_l / np.maximum(w_l, 1e-6)[..., None]
        a = np.clip(w_l / float(4 ** lvl), 0, 1)[..., None]  # real coverage of the block
        col = known * a + up * (1 - a)
    return col


def row_fill(img, hole):
    """Fill each row's hole by blending the wall on its left and right; rows with no wall on
    one side copy the nearest filled row above. Then soften the fill vertically."""
    out = img.copy()
    xs = np.arange(img.shape[1])
    last = None
    for y in range(img.shape[0]):
        h = hole[y]
        if not h.any():
            last = out[y].copy()
            continue
        ok = ~h
        left_ok = xs[ok & (xs < xs[h].min())]
        if len(left_ok):
            # the white wall on the left continues behind the person: extend its colour
            src = img[y, max(0, left_ok.max() - 12) : left_ok.max() + 1].mean(axis=0)
            out[y, h] = src
            last = out[y].copy()
        elif last is not None:
            out[y, h] = last[h]
    # vertical softening inside the hole only
    soft = out.copy()
    k = 25
    pad = np.pad(out, ((k, k), (0, 0), (0, 0)), mode="edge")
    cs = np.cumsum(pad, axis=0)
    soft = (cs[2 * k :] - cs[: -2 * k]) / (2 * k)
    soft = np.pad(soft, ((0, out.shape[0] - soft.shape[0]), (0, 0), (0, 0)), mode="edge")
    return np.where(hole[..., None], soft, out)


def box3(x):
    p = np.pad(x, ((1, 1), (1, 1), (0, 0)), mode="edge")
    return sum(p[i : i + x.shape[0], j : j + x.shape[1]] for i in range(3) for j in range(3)) / 9.0


def main():
    clip, matte, frame, out_plate, out_person = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
    rgb = read_frame(clip, frame, "rgb24", 3)
    alpha = read_frame(matte, frame, "gray", 1)[..., 0]
    person = alpha > 20
    hole = dilate(person, 30)  # wide margin: the dark fringe around the person must not feed the fill
    filled = row_fill(rgb, hole)
    plate = np.where(hole[..., None], filled, rgb)
    # soft grain so the fill does not look plastic
    plate += np.random.default_rng(1).normal(0, 2.0, plate.shape)
    save(out_plate, np.clip(plate, 0, 255).astype(np.uint8), "rgb24")
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    save(out_person, rgba, "rgba")
    print("ok", out_plate, out_person)


def save(path, arr, pix):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", pix, "-s", f"{W}x{H}", "-i", "-", path],
        input=arr.tobytes(), check=True,
    )


if __name__ == "__main__":
    main()
