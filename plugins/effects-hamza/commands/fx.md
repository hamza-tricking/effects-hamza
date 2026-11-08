---
description: Apply one of the 60 effects-hamza video effects to your video (example - /fx orbit-ring C:\videos\me.mp4)
argument-hint: <effect-id> <video path> [start second] [what you want: words, names, numbers, colours]
---

Apply a video effect with the `fx` skill of the effects-hamza plugin.

Arguments: $ARGUMENTS

- First word: the effect id (for example `orbit-ring`). If it is missing or unknown, show the list of effects from the skill's `effects.md` and ask which one.
- Then the video path (it may contain spaces or quotes). If it is missing, ask the user for it.
- Optional number: the second where the 3.4 s effect window starts (default 0).
- Anything else is the user's request for this effect (texts, names, numbers, colours, "not on my face"...). Apply it in the skill's step 5.

Follow the `fx` skill step by step.
