---
name: fx
description: Apply one of the 60 effects-hamza video effects (orbit ring, clone row, blade slice, glitch, post wall...) to the user's own vertical talking-head video, adapted to their words (texts, names, numbers, colours) and to their frame, then render it as an MP4. Use when the user types /fx, names an effect from effects.md, or asks to put one of these effects on their video.
---

# fx: apply an effects-hamza effect to a video

The plugin folder holds a Remotion project in `engine/` (two levels above this skill: `<this skill dir>/../../engine`).
Each effect renders a **3.4 s** window of the user's video as a vertical **1080x1920, 30 fps** MP4.
`effects.md` (next to this file) lists the 60 effect ids, what each does, and which ones need a **cutout** (background removal).

Work step by step. Check before installing; skip what already works. Talk to the user in their language.

## 1. Inputs

- Effect id: must be in `effects.md`. If missing or unknown, show the closest ids and ask.
- Video path: must exist. Best results: vertical video, one person in the middle, face visible. Landscape video is centre-cropped.
- Start second (optional, default 0): where the 3.4 s window starts. If the video is long, ask which moment to use.

## 2. Workspace

Use `~/effects-hamza` (Windows: `%USERPROFILE%\effects-hamza`) as the workspace, never the plugin folder itself.

- If `~/effects-hamza/engine/package.json` is missing, or its `src/fx/registry.ts` differs from the plugin's, copy the plugin's `engine/` folder there (keep an existing `node_modules`).
- Check tools: `node --version` (18 or newer), `ffmpeg -version`, `ffprobe -version`, `python --version` (3.10 to 3.12).
  - Missing ffmpeg on Windows: `winget install --id Gyan.FFmpeg -e`. Missing Node: `winget install --id OpenJS.NodeJS.LTS -e`. Missing Python: `winget install --id Python.Python.3.12 -e`. Ask before installing; open a new terminal afterwards.
- If `~/effects-hamza/engine/node_modules` is missing: run `npm install` in `~/effects-hamza/engine` (about 300 MB, once).

## 3. Background removal (only for effects marked cutout = yes)

Uses RobustVideoMatting (official repo PeterL1n/RobustVideoMatting, GPL-3.0) in its own Python venv under `~/effects-hamza/rvm`.
**Ask the user before downloading** (PyTorch is several GB). Skip this whole step if it is already installed.

1. GPU check: `nvidia-smi`. With an NVIDIA GPU use the CUDA build, otherwise the CPU build (works, much slower; warn the user).
2. `python -m venv ~/effects-hamza/rvm/venv`
3. GPU: `<venv python> -m pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124`
   CPU: same with `--index-url https://download.pytorch.org/whl/cpu`. Then `<venv python> -m pip install numpy pillow`.
4. Download into `~/effects-hamza/rvm`:
   - source: `https://github.com/PeterL1n/RobustVideoMatting/archive/refs/heads/master.zip` (unzip so `RobustVideoMatting-master/model` exists)
   - weights: `https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3.pth`
5. Check: `<venv python> -c "import torch; print(torch.__version__, torch.cuda.is_available())"`.

If the user already has RVM elsewhere, ask for that folder and its python instead of installing again.

## 4. Prepare the video

From `~/effects-hamza/engine`:

- Plain effect:
  `python scripts/prepare.py "<video>" --engine . --start <s>`
- Cutout effect:
  `python scripts/prepare.py "<video>" --engine . --start <s> --cutout --py "<rvm venv python>" --rvm "<rvm folder>"`

It writes `public/clip.mp4` and, with `--cutout`, `public/person.webm`, `public/plate.png`, `public/person-still.png`, `src/fx/track.json`, `src/fx/head.json`. It prints `PREPARED`.
A cutout prepare also serves every other effect, so reuse it when the user asks for several effects on the same video and window.

## 5. Adapt the effect to the user's request and video (always)

The effect files were designed on one sample video, so their texts, numbers, colours and some positions are examples.
Make the effect fit THIS user and THIS video by editing the effect file itself. Do not invent a settings system.

1. Find the file: `src/fx/registry.ts` maps the id to its component file in `src/fx/`.
   Keep a pristine copy: before the first edit, copy it to `work/original-<File>.tsx`; restore from it before adapting it for a new request.
2. Look at the video: extract one frame from the middle of the window
   (`ffmpeg -ss 1.7 -i public/clip.mp4 -frames:v 1 work/frame.png`) and look at it.
   Note where the face is, where the empty areas are, and the main colours.
   With `--cutout`, `src/fx/head.json` and `src/fx/track.json` already hold the head position: use them, never guess over them.
3. Read the effect file. List what is sample content: visible strings (words, names, numbers, UI labels, comments in fake chats),
   colours, and hard-coded x/y positions that are not taken from `HEAD`, `track` or the frame size.
4. Apply the user's request:
   - Replace texts and numbers with what the user asked for. If the effect shows words and the user gave none,
     ask ONE short question listing what can be changed (for example: "which 2 words to swap?"), with the sample values as defaults.
   - Keep the language and script the user writes in. For Arabic text use a font that supports it
     (`'Segoe UI', Tahoma, sans-serif`) and `direction: "rtl"`; do not split Arabic words into separate letters (letters must stay joined).
   - Move positions so nothing important covers the face; keep text inside the safe area (x 60 to 1020, y 220 to 1650).
   - Change colours only if asked, or if the text does not read on this video's background.
   - Do not change the timing, the animation logic or `CLIP_FRAMES`.
5. `npx tsc --noEmit`, then render ONE still at the strongest moment of the effect and show it to the user:
   `npx remotion still src/index.ts <effect-id> work/check.png --frame=60`
   Fix what is wrong (cut-off text, face covered, unreadable) before the full render. Ask the user only if the choice is theirs.

## 6. Render

`npx remotion render src/index.ts <effect-id> "<output>" --codec=h264 --crf=18 --pixel-format=yuv420p --timeout=180000`

Output: next to the user's video, named `<video name>_<effect-id>.mp4`, unless the user names another place.
On Windows, if the render times out while "setting up the headless browser", run it again in the user's own terminal.

## 7. Check and report

- `ffprobe` the output: 1080x1920, about 3.4 s, h264.
- Grab one frame at 2 s (`ffmpeg -ss 2 -i <out> -frames:v 1 check.png`) and look at it: the effect must be visible and must not cover the face.
- Tell the user the output path. Mention that cutout quality drops with busy backgrounds or fast motion, and that they can ask for more changes (texts, colours, positions).
- To preview or tweak: `npm run studio` in `~/effects-hamza/engine`.
