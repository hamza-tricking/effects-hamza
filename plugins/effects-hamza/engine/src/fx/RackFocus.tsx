import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person, SANS } from "./shared";

// Rack focus: focus pulls from the person to the background and back, like a cinema lens.
export const RackFocus: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.inOut(Easing.cubic);
  // 0 = person sharp, 1 = background sharp
  const k = interpolate(f, [14, 26, 60, 72], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const bgBlur = 14 * (1 - k) * (f > 8 ? 1 : f / 8);
  const fgBlur = 16 * k;
  const label = f >= 14 && f < 76;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip style={{ filter: `blur(${bgBlur}px)`, transform: "scale(1.04)" }} />
      <Person style={{ filter: `blur(${fgBlur}px)` }} />
      {label && (
        <div style={{ position: "absolute", left: 70, top: 250, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)", display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ border: "2px solid #fff", borderRadius: 8, padding: "2px 10px" }}>AF</span>
          <span style={{ opacity: 0.9 }}>{k > 0.5 ? "FOCUS · BACKGROUND" : "FOCUS · SUBJECT"}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
