"""Write only the RVM alpha matte of a video as a grayscale video (white = person).

Usage:
    python alpha_matte.py <input video> <output matte.mp4> --rvm <rvm folder> [--downsample 0.4]

Merge later with ffmpeg alphamerge to get a transparent WebM.
"""

import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np
import torch


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--rvm", required=True)
    p.add_argument("--width", type=int, default=1080)
    p.add_argument("--height", type=int, default=1920)
    p.add_argument("--fps", type=float, default=30)
    p.add_argument("--downsample", type=float, default=0.4)
    a = p.parse_args()

    rvm = Path(a.rvm)
    sys.path.insert(0, str(rvm / "RobustVideoMatting-master"))
    from model import MattingNetwork  # noqa: E402

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("device:", device, flush=True)
    model = MattingNetwork("mobilenetv3").eval().to(device)
    model.load_state_dict(torch.load(rvm / "rvm_mobilenetv3.pth", map_location=device, weights_only=True))

    w, h = a.width, a.height
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", a.input, "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    enc = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", str(a.fps),
         "-i", "-", "-c:v", "libx264", "-crf", "10", "-pix_fmt", "yuv420p", a.output],
        stdin=subprocess.PIPE,
    )
    fb = w * h * 3
    rec = [None] * 4
    n = 0
    with torch.no_grad():
        while True:
            raw = dec.stdout.read(fb)
            if len(raw) < fb:
                break
            src = torch.from_numpy(np.frombuffer(raw, np.uint8).reshape(h, w, 3).copy()).permute(2, 0, 1)
            src = src.unsqueeze(0).float().div(255).to(device)
            _, pha, *rec = model(src, *rec, downsample_ratio=a.downsample)
            enc.stdin.write(pha[0, 0].clamp(0, 1).mul(255).byte().cpu().numpy().tobytes())
            n += 1
    enc.stdin.close()
    enc.wait()
    dec.wait()
    print("done, frames:", n, flush=True)


if __name__ == "__main__":
    main()
