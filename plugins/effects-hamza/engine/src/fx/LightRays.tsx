import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, HEAD, Person } from "./shared";

// Light rays: a burst of warm light rays opens behind the person and slowly turns.
const IN = [12, 22];
const OUT = [78, 92];

export const LightRays: React.FC = () => {
  const f = useCurrentFrame();
  const open = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const close = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const a = open * (1 - close);
  const turn = interpolate(f, [IN[0], OUT[1]], [0, 24]);
  const scale = 0.6 + 0.6 * open;
  const rays = "repeating-conic-gradient(from 0deg, rgba(255,240,200,0.95) 0deg 7deg, rgba(255,240,200,0) 7deg 22deg)";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {/* warm wash so the rays read on a bright wall */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${HEAD.x}px ${HEAD.y}px, rgba(255,190,90,0.55), rgba(255,140,40,0.15) 45%, rgba(0,0,0,0.25) 80%)`, opacity: a }} />
      <AbsoluteFill style={{ opacity: a, mixBlendMode: "screen" }}>
        <div
          style={{
            position: "absolute",
            left: HEAD.x - 1400,
            top: HEAD.y - 1400,
            width: 2800,
            height: 2800,
            borderRadius: "50%",
            background: rays,
            transform: `rotate(${turn}deg) scale(${scale})`,
            WebkitMaskImage: "radial-gradient(circle, #000 8%, rgba(0,0,0,0.6) 35%, transparent 62%)",
            maskImage: "radial-gradient(circle, #000 8%, rgba(0,0,0,0.6) 35%, transparent 62%)",
          }}
        />
      </AbsoluteFill>
      <Person style={{ filter: `drop-shadow(0 0 ${30 * a}px rgba(255,210,120,${0.7 * a}))` }} />
    </AbsoluteFill>
  );
};
