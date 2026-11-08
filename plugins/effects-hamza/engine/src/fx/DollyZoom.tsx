import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { Clip, PLATE, Person, SANS, glass } from "./shared";

// Dolly zoom (vertigo): the person stays exactly the same size while the room behind stretches
// toward the camera, with radial speed blur and a cold grade, then eases back. Uses the empty-room
// plate behind the cutout so no ghost of the person shows in the stretched background.
const IN = [14, 46];
const OUT = [62, 84];

export const DollyZoom: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const b = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const k = a * (1 - b);
  const bg = 1 + 1.15 * k; // room pulls in
  const speed = Math.abs(interpolate(f + 1, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) - a) * 30;
  const on = k > 0.005;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {!on && <Clip />}
      {on && (
        <>
          <AbsoluteFill style={{ transform: `scale(${bg})`, transformOrigin: "55% 32%", filter: `blur(${speed * 2 + k * 1.5}px) saturate(${1 - 0.35 * k}) brightness(${1 - 0.12 * k}) hue-rotate(${-12 * k}deg)` }}>
            <Img src={PLATE} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          {/* zoom streaks */}
          <AbsoluteFill style={{ background: `repeating-conic-gradient(from 0deg at 55% 32%, rgba(255,255,255,${0.06 * k}) 0deg 2deg, rgba(255,255,255,0) 2deg 9deg)`, WebkitMaskImage: "radial-gradient(circle at 55% 32%, transparent 25%, #000 70%)", maskImage: "radial-gradient(circle at 55% 32%, transparent 25%, #000 70%)" }} />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 40%, rgba(0,0,0,0) 45%, rgba(10,20,40,${0.5 * k}) 100%)` }} />
          {/* audio + the person, same size the whole time */}
          <AbsoluteFill style={{ opacity: 0 }}><Clip /></AbsoluteFill>
          <Person style={{ filter: `drop-shadow(0 0 ${30 * k}px rgba(120,170,255,${0.45 * k}))` }} />
          <div style={{ position: "absolute", left: 60, top: 250, opacity: interpolate(k, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ ...glass("dark", 999), padding: "10px 24px", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff" }}>VERTIGO</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
