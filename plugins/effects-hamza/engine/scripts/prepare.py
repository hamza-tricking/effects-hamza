"""Prepare YOUR video for the effects (standard library only; the cutout step uses the RVM venv).

Makes, inside the engine folder:
  public/clip.mp4          3.4 s window of your video, vertical 1080x1920, 30 fps, 102 frames
  (with --cutout, needed by effects that separate you from the background)
  public/person.webm       you, background removed (VP9 with alpha)
  public/plate.png         the empty background (you filled out), from frame 20
  public/person-still.png  you alone, transparent, frame 20
  src/fx/track.json        top of your head per frame
  src/fx/head.json         average head centre

Usage:
  python prepare.py <video> --engine <engine dir> [--start 0] [--cutout --py <venv python> --rvm <rvm dir>]
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

FRAMES = 102
HERE = Path(__file__).resolve().parent


def run(cmd):
    print(">", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def has_audio(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    ).stdout
    return bool(out.strip())


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--engine", required=True)
    p.add_argument("--start", type=float, default=0.0, help="second where the 3.4 s window starts")
    p.add_argument("--cutout", action="store_true")
    p.add_argument("--py", help="python of the RVM venv (torch)")
    p.add_argument("--rvm", help="folder with RobustVideoMatting-master and rvm_mobilenetv3.pth")
    a = p.parse_args()

    eng = Path(a.engine).resolve()
    pub = eng / "public"
    work = eng / "work"
    pub.mkdir(exist_ok=True)
    work.mkdir(exist_ok=True)
    clip = pub / "clip.mp4"

    # 1) the 3.4 s window: fill 1080x1920 (crop, never stretch), 30 fps, freeze the last frame if the video is short
    vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,tpad=stop_mode=clone:stop_duration=4,setsar=1"
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", a.start, "-i", a.video, "-vf", vf, "-frames:v", FRAMES,
           "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p"]
    if has_audio(a.video):
        cmd += ["-af", "apad", "-t", FRAMES / 30, "-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    run(cmd + [clip])

    if not a.cutout:
        print("PREPARED (plain)")
        return

    if not a.py or not a.rvm:
        sys.exit("--cutout needs --py and --rvm")
    matte = work / "matte.mp4"
    # 2) matte with RVM (GPU when available)
    run([a.py, HERE / "alpha_matte.py", clip, matte, "--rvm", a.rvm, "--downsample", "0.4"])
    # 3) transparent person
    run(["ffmpeg", "-v", "error", "-y", "-i", clip, "-i", matte, "-filter_complex",
         "[1:v]format=gray[m];[0:v][m]alphamerge,format=yuva420p[v]", "-map", "[v]",
         "-c:v", "libvpx-vp9", "-b:v", "6M", "-auto-alt-ref", "0", "-an", pub / "person.webm"])
    # 4) head track + average head centre
    track = eng / "src" / "fx" / "track.json"
    run([a.py, HERE / "track_head.py", matte, track])
    pts = json.loads(track.read_text())
    if len(pts) < FRAMES:  # keep one point per frame
        pts += [pts[-1]] * (FRAMES - len(pts))
        track.write_text(json.dumps(pts))
    hx = sum(q["x"] for q in pts) / len(pts)
    top = sum(q["y"] for q in pts) / len(pts)
    (eng / "src" / "fx" / "head.json").write_text(json.dumps({"x": round(hx), "y": round(top + 250)}))
    # 5) empty background + still of the person (frame 20)
    run([a.py, HERE / "clean_plate.py", clip, matte, 20, pub / "plate.png", pub / "person-still.png"])
    print("PREPARED (cutout)")


if __name__ == "__main__":
    main()
