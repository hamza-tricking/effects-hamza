import React from "react";
import { Composition } from "remotion";
import { CLIP_FRAMES } from "./fx/shared";
import { FX } from "./fx/registry";

// One composition per effect, all on the prepared clip (public/clip.mp4 ...).
export const RemotionRoot: React.FC = () => (
  <>
    {FX.map((fx) => (
      <Composition key={fx.id} id={fx.id} component={fx.component} durationInFrames={CLIP_FRAMES} fps={30} width={1080} height={1920} />
    ))}
  </>
);
