import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Letter dive (glass tiles): the letters of CLAUDE dive one by one out of deep space as frosted
// glass tiles - tumbling, blurred, then landing in a row on the chest with a click, a light flash
// and a sheen. At the end the tiles flip away one after another.
const WORD = "CLAUDE";
const START = 10;
const STEP = 4;
const OUT = 76;
const TILE = 140;
const GAP = 14;

export const LetterDive: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const allIn = START + (WORD.length - 1) * STEP + 12;
  const lift = spring({ frame: f - allIn, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <AbsoluteFill style={{ perspective: 1100 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", gap: GAP, transformStyle: "preserve-3d", transform: `translateY(${-lift * 16}px)` }}>
          {WORD.split("").map((ch, i) => {
            const at = START + i * STEP;
            const t = interpolate(f, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            const land = spring({ frame: f - at - 12, fps, config: { damping: 8, stiffness: 300 } });
            const away = interpolate(f, [OUT + i * 2, OUT + i * 2 + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
            const z = (1 - t) * -2600;
            const rx = (1 - t) * (i % 2 ? 220 : -200) + away * 100;
            const ry = (1 - t) * (i % 3 ? -160 : 140);
            const squash = f >= at + 12 ? 1 - 0.07 * Math.sin(Math.min(1, land) * Math.PI) : 1;
            const flash = interpolate(f, [at + 12, at + 16], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const blur = (1 - t) * 16 + away * 10;
            return (
              <div
                key={i}
                style={{
                  width: TILE,
                  height: TILE * 1.2,
                  transform: `translate3d(0, ${away * -160}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scaleY(${squash})`,
                  opacity: f < at ? 0 : Math.min(1, t * 2) * (1 - away),
                  filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                }}
              >
                <div style={{ ...glass("light", 28), width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, lineHeight: 1, ...gradText("linear-gradient(180deg,#FFFFFF 0%,#FFE3C7 50%,#FF8A4C 100%)"), filter: "drop-shadow(0 4px 14px rgba(255,120,50,0.5))" }}>{ch}</span>
                  <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
                  <Sheen frame={f} start={at + 13} dur={10} strength={0.6} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
