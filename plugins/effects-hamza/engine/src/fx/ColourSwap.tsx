import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Colour swap: circle wipes behind the person swap the room for bold flat colours,
// one after another, then wipe back to the room. The person stays cut out in front.
const WIPES = [
  { at: 14, color: "#FF6A2B", x: 180, y: 1300 },
  { at: 38, color: "#4F5BD5", x: 950, y: 420 },
  { at: 60, color: "#FFD60A", x: 160, y: 380 },
];
const BACK = 82;
const R = 2400;

const circle = (f: number, at: number) => interpolate(f, [at, at + 10], [0, R], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

export const ColourSwap: React.FC = () => {
  const f = useCurrentFrame();
  const back = circle(f, BACK);
  const any = f >= WIPES[0].at;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {WIPES.map((w, i) => (
        <AbsoluteFill key={i} style={{ background: w.color, clipPath: `circle(${circle(f, w.at)}px at ${w.x}px ${w.y}px)` }} />
      ))}
      {/* wipe back to the room */}
      {f >= BACK && (
        <AbsoluteFill style={{ clipPath: `circle(${back}px at 540px 960px)` }}>
          <Clip muted />
        </AbsoluteFill>
      )}
      {any && <Person style={{ filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.35))" }} />}
    </AbsoluteFill>
  );
};
