import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, Person } from "./shared";

// Clone row: copies of the person slide out to both sides, a little smaller and behind.
const START = 14;
const END = 80;
const CLONES = [
  { dx: -330, s: 0.78, delay: 0 },
  { dx: 330, s: 0.78, delay: 3 },
  { dx: -560, s: 0.62, delay: 6 },
  { dx: 560, s: 0.62, delay: 9 },
];

export const CloneRow: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const back = interpolate(f, [END, END + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dim = Math.min(1, spring({ frame: f - START, fps, config: { damping: 200 } })) * back;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip style={{ filter: `brightness(${1 - 0.35 * dim}) blur(${6 * dim}px)` }} />
      {[...CLONES].reverse().map((c, i) => {
        const p = spring({ frame: f - START - c.delay, fps, config: { damping: 14, stiffness: 120 } }) * back;
        return (
          <AbsoluteFill
            key={i}
            style={{
              transform: `translateX(${c.dx * p}px) scale(${1 - (1 - c.s) * p})`,
              transformOrigin: "50% 100%",
              opacity: Math.min(1, p * 1.5),
              filter: `brightness(${1 - 0.25 * p})`,
            }}
          >
            <Person />
          </AbsoluteFill>
        );
      })}
      <Person />
    </AbsoluteFill>
  );
};
