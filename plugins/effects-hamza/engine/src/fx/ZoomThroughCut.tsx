import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip } from "./shared";

// Zoom-through cut: the camera dives hard into the dark of the hoodie with radial motion blur,
// hits black, and the next shot - a tight, warmer close-up (a "second angle") - opens out of the
// black and settles.
const DIVE = [16, 30];
const OPEN = [31, 46];
const DARK = { x: 560, y: 1330 }; // the black hoodie
const FACE = { x: 610, y: 600 };

export const ZoomThroughCut: React.FC = () => {
  const f = useCurrentFrame();
  const d = interpolate(f, DIVE, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.exp) });
  const o = interpolate(f, OPEN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.exp) });
  const second = f >= OPEN[0];
  const black = interpolate(f, [DIVE[1] - 3, DIVE[1], OPEN[0], OPEN[0] + 5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (!second) {
    const s = 1 + d * 9;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${DARK.x}px ${DARK.y}px`, filter: d > 0.01 ? `blur(${d * 14}px)` : undefined }}>
          <Clip />
        </AbsoluteFill>
        {/* radial streaks during the dive */}
        <AbsoluteFill style={{ background: `repeating-conic-gradient(from 0deg at ${DARK.x}px ${DARK.y}px, rgba(255,255,255,${0.12 * d}) 0deg 1.5deg, rgba(0,0,0,0) 1.5deg 7deg)` }} />
        <AbsoluteFill style={{ background: "#000", opacity: black }} />
      </AbsoluteFill>
    );
  }
  // second angle: tight on the face, warmer, opening out of black
  const s2 = interpolate(o, [0, 1], [3.2, 1.7]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${s2})`, transformOrigin: `${FACE.x}px ${FACE.y}px`, filter: `${o < 0.98 ? `blur(${(1 - o) * 12}px) ` : ""}contrast(1.12) saturate(1.15) sepia(0.12)` }}>
        <Clip />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};
