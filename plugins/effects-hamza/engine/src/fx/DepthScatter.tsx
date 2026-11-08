import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, Person, SANS } from "./shared";

// Depth scatter: a huge word flies in from depth behind the head, holds, then its letters
// scatter outward in 3D (rotate, scale, blur) and vanish. The person stays in front.
const WORD = "EFFECTS";
const IN = 8;
const SCATTER = 62;

export const DepthScatter: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <AbsoluteFill style={{ perspective: 900 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", transformStyle: "preserve-3d" }}>
          {WORD.split("").map((ch, i) => {
            const t = interpolate(f, [IN + i * 2, IN + i * 2 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            const s = interpolate(f, [SCATTER + i, SCATTER + i + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
            const dx = (random(`dx${i}`) - 0.5) * 900;
            const dy = (random(`dy${i}`) - 0.5) * 700;
            const dz = 300 + random(`dz${i}`) * 700;
            const rx = (random(`rx${i}`) - 0.5) * 140;
            const ry = (random(`ry${i}`) - 0.5) * 180;
            const z = interpolate(t, [0, 1], [-1400, 0]) + s * dz;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 210,
                  letterSpacing: -6,
                  lineHeight: 1,
                  color: "#121317",
                  textShadow: "0 10px 40px rgba(255,255,255,0.35)",
                  transform: `translate3d(${s * dx}px, ${s * dy}px, ${z}px) rotateX(${s * rx}deg) rotateY(${s * ry}deg)`,
                  opacity: t * (1 - s),
                  filter: `blur(${(1 - t) * 14 + s * 10}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <Person />
    </AbsoluteFill>
  );
};
