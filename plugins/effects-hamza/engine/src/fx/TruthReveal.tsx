import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Truth reveal (spoiler glass): a frosted card under the chin hides the answer behind shimmering
// "spoiler" particles. A light wipe dissolves the particles outward like sand and the answer
// appears in glowing gradient: "It was Claude."
const IN = 8;
const REVEAL = [30, 50];
const OUT = 84;
const DOTS = Array.from({ length: 260 }, (_, i) => ({
  x: random(`x${i}`) * 680,
  y: random(`y${i}`) * 170,
  r: 1.5 + random(`r${i}`) * 3,
  ph: random(`p${i}`) * 6.28,
  vx: (random(`vx${i}`) - 0.5) * 300,
  vy: (random(`vy${i}`) - 0.5) * 200 - 80,
}));

export const TruthReveal: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wipe = interpolate(f, REVEAL, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const edge = wipe * 900 - 110; // x of the reveal front inside the 680px area
  const text = interpolate(wipe, [0.2, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, display: "flex", justifyContent: "center", opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 120 + out * 40}px)` }}>
        <div style={{ ...glass("light", 50), width: 800, padding: "26px 60px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: "rgba(255,255,255,0.85)" }}>WHO EDITED THIS?</div>
          <div style={{ position: "relative", width: 680, height: 170 }}>
            {/* the answer, revealed behind the wipe */}
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", WebkitMaskImage: `linear-gradient(90deg, #000 ${edge - 60}px, transparent ${edge + 60}px)`, maskImage: `linear-gradient(90deg, #000 ${edge - 60}px, transparent ${edge + 60}px)` }}>
              <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: -3, ...gradText("linear-gradient(180deg,#FFFFFF,#FFE0A8 55%,#FF8A3D)"), filter: `drop-shadow(0 0 ${18 * text}px rgba(255,150,60,0.8))` }}>It was Claude.</span>
            </div>
            {/* spoiler particles */}
            <svg width={680} height={170} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {DOTS.map((d, i) => {
                const gone = Math.min(1, Math.max(0, (edge - d.x) / 160));
                if (gone >= 1) return null;
                const tw = 0.45 + 0.55 * Math.abs(Math.sin(f / 4 + d.ph));
                return <circle key={i} cx={d.x + d.vx * gone + Math.sin(f / 6 + d.ph) * 3} cy={d.y + d.vy * gone + Math.cos(f / 7 + d.ph) * 3} r={d.r * (1 - gone * 0.5)} fill="#fff" opacity={tw * (1 - gone)} />;
              })}
            </svg>
            {/* light front */}
            {wipe > 0 && wipe < 1 && <div style={{ position: "absolute", top: -20, bottom: -20, left: edge - 3, width: 6, background: "#fff", boxShadow: "0 0 30px 10px rgba(255,220,170,0.8)", borderRadius: 3 }} />}
          </div>
          <Sheen frame={f} start={REVEAL[1]} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
