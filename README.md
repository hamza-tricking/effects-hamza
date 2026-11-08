# effects-hamza

60 premium video effects for vertical talking-head videos (Reels, TikTok, Shorts), applied by Claude Code with one command.

## Install (in Claude Code)

```
/plugin marketplace add hamza-tricking/effects-hamza
/plugin install effects-hamza@effects-hamza
```

The first line adds this repository as a plugin source. The second installs the plugin from it. You do this once.

## Use

```
/fx <effect-id> <path to your video> [start second]
```

Examples:

```
/fx clone-row C:\videos\me.mp4
/fx orbit-ring "D:\my clips\intro.mov" 4
```

Claude cuts a 3.4 s window of your video (from the start second), applies the effect and saves `<your video>_<effect-id>.mp4` next to it, vertical 1080x1920 at 30 fps.

See [the effects list](plugins/effects-hamza/skills/fx/effects.md) for all 60 ids.

## What it needs

- Node.js 18+, ffmpeg, Python 3.10-3.12 (Claude checks and offers to install what is missing).
- First run: `npm install` of the Remotion engine (about 300 MB) into `~/effects-hamza`.
- Effects marked **cutout** remove your background with [RobustVideoMatting](https://github.com/PeterL1n/RobustVideoMatting) (PyTorch, a few GB, NVIDIA GPU recommended). Claude asks before downloading it.

Best results: one person in the middle of the frame, face visible, calm background.

## How it works

`plugins/effects-hamza/engine` is a Remotion project with one composition per effect.
`engine/scripts/prepare.py` turns your video into the files the effects use (the clip, and for cutout effects: you without background, the empty background, your head position per frame).
Then Remotion renders the effect.

## Licenses

Effects code: MIT. Remotion has its own license (free for individuals and small teams, see remotion.dev/license). RobustVideoMatting is GPL-3.0 and is downloaded separately on your machine.
