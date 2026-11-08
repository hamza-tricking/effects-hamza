"""Track the top of the head from the alpha matte, one point per frame.

Writes src/fx/track.json: [{"x": ..., "y": ...}, ...] in 1080x1920 pixels,
x = centre of the head, y = top of the head. Smoothed lightly.
Usage: python track_head.py <matte.mp4> <out.json>
"""

import json
import subprocess
import sys

import numpy as np

W, H, S = 270, 480, 4  # work at quarter size


def main():
    src, out = sys.argv[1], sys.argv[2]
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        stdout=subprocess.PIPE,
    )
    pts = []
    while True:
        raw = p.stdout.read(W * H)
        if len(raw) < W * H:
            break
        m = np.frombuffer(raw, np.uint8).reshape(H, W) > 128
        rows = np.where(m.sum(axis=1) > 6)[0]
        if len(rows) == 0:
            pts.append(pts[-1] if pts else (W / 2, H / 4))
            continue
        top = rows[0]
        band = m[top : top + 30]  # ~120 px of head below the top
        xs = np.where(band)[1]
        pts.append((float(xs.mean()), float(top)))
    p.wait()
    a = np.array(pts)
    k = 5
    pad = np.pad(a, ((k // 2, k // 2), (0, 0)), mode="edge")
    sm = np.array([pad[i : i + k].mean(axis=0) for i in range(len(a))])
    data = [{"x": round(x * S, 1), "y": round(y * S, 1)} for x, y in sm]
    with open(out, "w") as fh:
        json.dump(data, fh)
    print("frames:", len(data), "first:", data[0], "last:", data[-1])


if __name__ == "__main__":
    main()
