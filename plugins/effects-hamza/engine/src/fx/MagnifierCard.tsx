import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, glass } from "./shared";

// Magnifier (glass lens): a real glass loupe glides across the shot and magnifies what is under it
// 2x, with a refracting chrome rim, a light glint and a frosted zoom tag. It travels over the hands
// and the chest, never over the face.
const IN = 8;
const OUT = 84;
const R = 175;
const ZOOM = 2;
// over the cream jacket panels, the hand and the ring (bright detail reads best magnified)
const PATH: [number, number][] = [
  [300, 1090],
  [860, 1010],
  [560, 1250],
  [330, 1170],
];

export const MagnifierCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 12, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(f, [IN + 4, OUT - 4], [0, PATH.length - 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const i = Math.min(PATH.length - 2, Math.floor(t));
  const k = Easing.inOut(Easing.cubic)(t - i);
  const cx = PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * k;
  const cy = PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * k;
  const s = Math.max(0, pop) * (1 - out);
  const z = 1 + (ZOOM - 1) * Math.min(1, pop);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {s > 0.01 && (
        <>
          {/* drop shadow of the lens */}
          <div style={{ position: "absolute", left: cx - R * s + 24, top: cy - R * s + 34, width: R * 2 * s, height: R * 2 * s, borderRadius: "50%", background: "rgba(0,0,0,0.35)", filter: "blur(24px)" }} />
          {/* magnified view inside the lens */}
          <AbsoluteFill style={{ clipPath: `circle(${R * s}px at ${cx}px ${cy}px)` }}>
            <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px` }}>
              <Clip muted style={{ filter: "contrast(1.08) saturate(1.1)" }} />
            </AbsoluteFill>
            {/* inner refraction edge */}
            <div style={{ position: "absolute", left: cx - R * s, top: cy - R * s, width: R * 2 * s, height: R * 2 * s, borderRadius: "50%", boxShadow: "inset 0 0 40px rgba(255,255,255,0.35), inset 0 0 8px rgba(255,255,255,0.8), inset -20px -30px 60px rgba(0,0,0,0.25)" }} />
            {/* glint */}
            <div style={{ position: "absolute", left: cx - R * s * 0.7, top: cy - R * s * 0.8, width: R * s * 0.9, height: R * s * 0.4, borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0))", transform: "rotate(-25deg)" }} />
          </AbsoluteFill>
          {/* chrome rim */}
          <div style={{ position: "absolute", left: cx - R * s - 14, top: cy - R * s - 14, width: (R * s + 14) * 2, height: (R * s + 14) * 2, borderRadius: "50%", padding: 14, background: "conic-gradient(from 210deg, #ffffff, #8d939c, #f3f4f6, #6b717a, #ffffff, #9aa0a8, #ffffff)", WebkitMaskImage: `radial-gradient(circle, transparent ${R * s}px, #000 ${R * s + 1}px)`, maskImage: `radial-gradient(circle, transparent ${R * s}px, #000 ${R * s + 1}px)`, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }} />
          {/* handle */}
          <div style={{ position: "absolute", left: cx + R * s * 0.66, top: cy + R * s * 0.66, width: 46 * s, height: 190 * s, borderRadius: 23 * s, background: "linear-gradient(90deg,#2b2e35,#585e69 45%,#2b2e35)", transform: "rotate(-45deg)", transformOrigin: "50% 0%", boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }} />
          {/* zoom tag */}
          <div style={{ position: "absolute", left: cx - R * s, top: cy - R * s - 74, transform: `scale(${s})`, transformOrigin: "0 100%" }}>
            <div style={{ ...glass("dark", 999), padding: "8px 20px", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 2 }}>
              🔍 {z.toFixed(1)}×
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
