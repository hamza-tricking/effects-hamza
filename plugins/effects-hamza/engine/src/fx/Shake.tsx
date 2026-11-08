import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Clip } from "./shared";

// Shake: an impact hit - quick zoom punch, a decaying camera shake with motion blur.
const HIT = 20;
const LEN = 16;

export const Shake: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - HIT;
  const active = t >= 0 && t < LEN;
  const decay = active ? Math.pow(1 - t / LEN, 2) : 0;
  const x = active ? (random(`sx${f}`) - 0.5) * 70 * decay : 0;
  const y = active ? (random(`sy${f}`) - 0.5) * 70 * decay : 0;
  const rot = active ? (random(`sr${f}`) - 0.5) * 4 * decay : 0;
  const punch = interpolate(t, [0, 2, 12], [1, 1.12, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = interpolate(f, [HIT + 12, HIT + 40], [1.03, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = t < 12 ? punch : settle;
  const flash = interpolate(t, [0, 1, 3], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`, filter: `blur(${Math.abs(x) / 14}px)` }}>
        <Clip />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
