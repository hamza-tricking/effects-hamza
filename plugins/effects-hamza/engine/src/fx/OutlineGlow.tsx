import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Outline glow: a bright neon line traces the person's silhouette, the room dims behind.
const IN = [14, 24];
const OUT = [80, 94];

export const OutlineGlow: React.FC = () => {
  const f = useCurrentFrame();
  const on = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const off = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const a = on * (1 - off);
  const pulse = 1 + 0.15 * Math.sin(f / 4);
  const c = `rgba(255,122,61,${a})`;
  const w = 4 * a;
  // stacked hard shadows = a solid outline; soft ones = the glow
  const outline = [
    `drop-shadow(${w}px 0 0 ${c})`,
    `drop-shadow(-${w}px 0 0 ${c})`,
    `drop-shadow(0 ${w}px 0 ${c})`,
    `drop-shadow(0 -${w}px 0 ${c})`,
    `drop-shadow(0 0 ${18 * a * pulse}px rgba(255,140,70,${0.9 * a}))`,
    `drop-shadow(0 0 ${40 * a * pulse}px rgba(255,110,40,${0.6 * a}))`,
  ].join(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip style={{ filter: `brightness(${1 - 0.6 * a}) saturate(${1 - 0.5 * a})` }} />
      {/* fade the cutout out near the table so the outline does not draw a line along the bottom edge */}
      <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(180deg, #000 72%, transparent 86%)", maskImage: "linear-gradient(180deg, #000 72%, transparent 86%)" }}>
        <Person style={{ filter: outline }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
