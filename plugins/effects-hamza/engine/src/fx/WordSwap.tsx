import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Word swap (glass slot): a frosted capsule under the chin reads "video editing is", and a glass
// slot under it rolls like a slot machine through the old words (hard, slow, boring) with motion
// blur, then locks on a glowing gradient "EASY" with a bounce, sparkles and a sheen.
const IN = 8;
const ROLL = [20, 44];
const OUT = 84;
const WORDS = ["hard", "slow", "boring", "EASY"];
const ROW = 190;

const Sparkle: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <svg width={60} height={60} viewBox="0 0 24 24" style={{ position: "absolute", left: x - 30, top: y - 30, transform: `scale(${s})`, opacity: o, filter: "drop-shadow(0 0 8px rgba(124,245,214,0.9))" }}>
    <path d="M12 0 Q13.5 10.5 24 12 Q13.5 13.5 12 24 Q10.5 13.5 0 12 Q10.5 10.5 12 0 Z" fill="#fff" />
  </svg>
);

export const WordSwap: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const roll = interpolate(f, ROLL, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const lock = spring({ frame: f - ROLL[1], fps, config: { damping: 7, stiffness: 260 } });
  const overshoot = f >= ROLL[1] ? (1 - lock) * 24 : 0;
  const y = -roll * ROW * (WORDS.length - 1) + overshoot;
  const vel = Math.abs(interpolate(f + 1, ROLL, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) - roll);
  const mblur = Math.min(10, vel * 260);
  const landed = f >= ROLL[1];
  const bounce = landed ? 1 + 0.05 * Math.sin(Math.min(1, lock) * Math.PI) : 1;
  const sp = interpolate(f, [ROLL[1], ROLL[1] + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 80 + out * 40}px) scale(${(0.9 + 0.1 * pop) * bounce})`, filter: (1 - Math.min(1, pop)) * 10 + out * 8 > 0.05 ? `blur(${(1 - Math.min(1, pop)) * 10 + out * 8}px)` : undefined }}>
        <div style={{ ...glass("light", 56), padding: "26px 36px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 50, color: "#fff", letterSpacing: 1, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>video editing is</div>
          {/* the slot */}
          <div
            style={{
              ...glass("dark", 34),
              width: 640,
              height: ROW,
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
              maskImage: "linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
            }}
          >
            <div style={{ transform: `translateY(${y}px)`, filter: `blur(${mblur}px)` }}>
              {WORDS.map((w, i) => {
                const last = i === WORDS.length - 1;
                return (
                  <div
                    key={w}
                    style={{
                      height: ROW,
                      display: "grid",
                      placeItems: "center",
                      fontFamily: SANS,
                      fontWeight: 900,
                      fontSize: last ? 150 : 110,
                      letterSpacing: last ? -4 : -2,
                      ...(last
                        ? { ...gradText("linear-gradient(180deg, #FFFFFF 0%, #B9FFE9 45%, #4FE3C1 100%)"), filter: landed ? "drop-shadow(0 0 22px rgba(79,227,193,0.75))" : "none" }
                        : { color: "rgba(255,255,255,0.55)", textDecoration: "line-through", textDecorationThickness: 8, textDecorationColor: "rgba(255,90,90,0.85)" }),
                    }}
                  >
                    {w}
                  </div>
                );
              })}
            </div>
            <Sheen frame={f} start={ROLL[1] + 1} dur={14} strength={0.6} />
          </div>
          <Sheen frame={f} start={IN + 4} dur={18} strength={0.4} />
        </div>
      </div>
      {landed && sp < 1 && (
        <>
          <Sparkle x={250} y={1170} s={0.4 + sp} o={1 - sp} />
          <Sparkle x={850} y={1150} s={0.3 + sp * 1.2} o={1 - sp} />
          <Sparkle x={300} y={1340} s={0.3 + sp * 0.8} o={1 - sp} />
          <Sparkle x={800} y={1350} s={0.4 + sp} o={1 - sp} />
        </>
      )}
    </AbsoluteFill>
  );
};
