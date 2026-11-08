import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, PERSON_STILL, PLATE, SANS, glass } from "./shared";

// Blow away (snap): you freeze, then break into glowing dust from left to right and blow away up
// and to the right, leaving the empty room. A beat later the dust flies back and re-forms you,
// and the live shot continues. Uses the frozen person still + the empty-room plate.
const FREEZE = 20; // the still was taken at frame 20
const DUST = [22, 46];
const BACK = [56, 78];
const TILE = 30;
// only tiles that overlap the person (rough box) are animated
const BOX = { x0: 0, y0: 240, x1: 1080, y1: 1920 };

const tiles: { x: number; y: number; d: number; vx: number; vy: number; r: number }[] = [];
for (let y = BOX.y0; y < BOX.y1; y += TILE) {
  for (let x = BOX.x0; x < BOX.x1; x += TILE) {
    const i = tiles.length;
    tiles.push({
      x,
      y,
      d: x / 1080 * 0.6 + random(`d${i}`) * 0.4, // left to right, with noise
      vx: 260 + random(`vx${i}`) * 520,
      vy: -(180 + random(`vy${i}`) * 520),
      r: (random(`r${i}`) - 0.5) * 720,
    });
  }
}

export const BlowAway: React.FC = () => {
  const f = useCurrentFrame();
  const frozen = f >= FREEZE && f < BACK[1];
  if (!frozen) return <AbsoluteFill style={{ backgroundColor: "#000" }}><Clip /></AbsoluteFill>;
  const go = interpolate(f, DUST, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const back = interpolate(f, BACK, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // progress per tile: 0 = in place, 1 = gone
  const label = interpolate(f, [DUST[1] - 6, DUST[1], BACK[0], BACK[0] + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* keep the audio running */}
      <AbsoluteFill style={{ opacity: 0 }}><Clip /></AbsoluteFill>
      <Img src={PLATE} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      {tiles.map((t, i) => {
        const startGo = t.d * 0.6;
        const pOut = Math.min(1, Math.max(0, (go - startGo) / 0.4));
        const pIn = Math.min(1, Math.max(0, (back - (1 - t.d) * 0.5) / 0.5));
        const p = Easing.in(Easing.quad)(pOut) * (1 - Easing.out(Easing.cubic)(pIn));
        if (p >= 0.999) return null;
        const glow = p > 0.02 && p < 0.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: TILE,
              height: TILE,
              backgroundImage: `url(${PERSON_STILL})`,
              backgroundSize: "1080px 1920px",
              backgroundPosition: `${-t.x}px ${-t.y}px`,
              transform: `translate(${t.vx * p}px, ${t.vy * p}px) rotate(${t.r * p}deg) scale(${1 - p * 0.7})`,
              opacity: 1 - p,
              filter: glow ? "brightness(1.6) sepia(0.6) drop-shadow(0 0 6px rgba(255,170,90,0.9))" : undefined,
            }}
          />
        );
      })}
      {/* crossfade back to the live shot as the dust settles */}
      {back > 0.8 && (
        <AbsoluteFill style={{ opacity: (back - 0.8) / 0.2 }}>
          <Clip muted />
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, display: "flex", justifyContent: "center", opacity: label }}>
        <div style={{ ...glass("dark", 999), padding: "14px 36px", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: "#fff" }}>GONE.</div>
      </div>
    </AbsoluteFill>
  );
};
