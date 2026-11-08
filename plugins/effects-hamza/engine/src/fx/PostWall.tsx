import React from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIP, Person, SANS, glass } from "./shared";

// Post wall: the room fills with a moving wall of glass post cards - mini versions of your reel in
// different grades with view counts - flipping in tile by tile and drifting in two directions
// behind you. You stay cut out in front with a soft rim light.
const IN = 10;
const OUT = 84;
const COLS = 4;
const ROWS = 5;
const CW = 250;
const CH = 400;
const GRADES = [
  "saturate(1.3) contrast(1.1)",
  "grayscale(1) contrast(1.2)",
  "sepia(0.5) saturate(1.4) hue-rotate(-15deg)",
  "hue-rotate(160deg) saturate(1.2)",
  "contrast(1.25) brightness(0.9) saturate(0.8)",
  "hue-rotate(260deg) saturate(1.5)",
];

export const PostWall: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wallOn = interpolate(f, [IN, IN + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - out);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={CLIP} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "#0d0e13", opacity: wallOn }} />
      <AbsoluteFill style={{ perspective: 1800, opacity: 1 - out }}>
        {Array.from({ length: COLS }, (_, c) => {
          const drift = (c % 2 ? 1 : -1) * (f - IN) * 2.2;
          return (
            <div key={c} style={{ position: "absolute", left: -60 + c * (CW + 30), top: -200 + (c % 2 ? -120 : 0), transform: `translateY(${drift}px)` }}>
              {Array.from({ length: ROWS }, (_, r) => {
                const idx = c * ROWS + r;
                const at = IN + Math.floor(random(`pw${idx}`) * 18);
                const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 150 } });
                const views = (0.2 + random(`v${idx}`) * 2.8).toFixed(1);
                return (
                  <div key={r} style={{ marginBottom: 30, width: CW, height: CH, transform: `rotateY(${(1 - p) * 90}deg) scale(${0.8 + 0.2 * p})`, opacity: f < at ? 0 : Math.min(1, p * 1.5) }}>
                    <div style={{ ...glass("light", 26), width: "100%", height: "100%", padding: 8 }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", position: "relative" }}>
                        <div style={{ width: 1080, height: 1920, transform: `scale(${(CW - 16) / 1080})`, transformOrigin: "0 0" }}>
                          <OffthreadVideo src={CLIP} muted style={{ width: 1080, height: 1920, objectFit: "cover", filter: GRADES[idx % GRADES.length] }} />
                        </div>
                        <div style={{ position: "absolute", left: 10, bottom: 10, ...glass("dark", 999), padding: "4px 12px", fontFamily: SANS, fontWeight: 800, fontSize: 20, color: "#fff" }}>▶ {views}M</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 45%, rgba(0,0,0,0.55), rgba(0,0,0,0) 60%)", opacity: wallOn }} />
      <Person style={{ filter: wallOn > 0.01 ? `drop-shadow(0 0 ${30 * wallOn}px rgba(255,190,130,${0.55 * wallOn}))` : undefined }} />
    </AbsoluteFill>
  );
};
