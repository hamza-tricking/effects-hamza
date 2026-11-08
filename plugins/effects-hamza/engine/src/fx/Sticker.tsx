import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Sticker (holographic + glass): premium die-cut stickers slap onto the wall one by one -
// an iridescent holo sticker with a moving shimmer, a glass bubble with a glowing emoji,
// a dark glass pill and a chrome sticker. Each lands from the air (big, blurred, lifted
// shadow), sticks with a bounce and a sparkle burst, floats gently, then peels away.
const OUT = 80;

const holo = (f: number): React.CSSProperties => ({
  background: `conic-gradient(from ${f * 4}deg at 30% 40%, #ff9ad5, #9ad9ff, #b6ffcf, #fff3a0, #d6a8ff, #ff9ad5)`,
});

type S = { at: number; x: number; y: number; rot: number; render: (f: number) => React.ReactNode };

const STICKERS: S[] = [
  {
    at: 10, x: 80, y: 370, rot: -9,
    render: (f) => (
      <div style={{ ...holo(f), position: "relative", overflow: "hidden", borderRadius: 28, padding: "20px 34px", fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: -1, color: "#1a1626" }}>
        AI EDIT ✦
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 50%)" }} />
        <Sheen frame={f} start={18} dur={14} strength={0.9} />
      </div>
    ),
  },
  {
    at: 20, x: 805, y: 330, rot: 10,
    render: (f) => (
      <div style={{ ...glass("light", 90), width: 180, height: 180, display: "grid", placeItems: "center" }}>
        <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,120,40,0.7), rgba(255,120,40,0) 70%)", filter: "blur(10px)" }} />
        <span style={{ position: "relative", fontSize: 100, filter: "drop-shadow(0 6px 14px rgba(255,90,20,0.6))" }}>🔥</span>
        <Sheen frame={f} start={28} dur={14} />
      </div>
    ),
  },
  {
    at: 30, x: 95, y: 610, rot: 6,
    render: (f) => (
      <div style={{ ...glass("dark", 999), padding: "16px 30px 16px 18px", display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 48, color: "#fff", whiteSpace: "nowrap" }}>
        <span style={{ width: 46, height: 46, borderRadius: 23, background: "linear-gradient(180deg,#FF6B6B,#E5484D)", display: "grid", placeItems: "center", fontSize: 28, boxShadow: "0 0 16px rgba(229,72,77,0.7)" }}>✕</span>
        no editor
        <Sheen frame={f} start={38} dur={14} />
      </div>
    ),
  },
  {
    at: 40, x: 770, y: 700, rot: -7,
    render: (f) => (
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "16px 28px", background: "linear-gradient(135deg, #f7f7f9 0%, #a7acb5 38%, #ffffff 52%, #8a8f99 78%, #e9ebef 100%)", fontFamily: SANS, fontWeight: 900, fontSize: 48, color: "#23252b", whiteSpace: "nowrap", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.9)" }}>
        1 prompt
        <Sheen frame={f} start={48} dur={12} strength={0.95} />
      </div>
    ),
  },
];

export const Sticker: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {STICKERS.map((s, i) => {
        const p = spring({ frame: f - s.at, fps, config: { damping: 10, stiffness: 240, mass: 0.7 } });
        const peel = interpolate(f, [OUT + i * 2, OUT + i * 2 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const lift = 1 - Math.min(1, p);
        const float = f > s.at + 10 ? Math.sin((f - s.at) / 10 + i) * 4 : 0;
        const shadow = 6 + lift * 46;
        const burst = interpolate(f, [s.at + 4, s.at + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, opacity: (f >= s.at ? 1 : 0) * (1 - peel) }}>
            {/* sparkle burst when it sticks */}
            {burst > 0 && burst < 1 &&
              Array.from({ length: 8 }, (_, k) => {
                const a = (k / 8) * Math.PI * 2 + random(`sb${i}${k}`);
                const r = 40 + burst * 120;
                return <div key={k} style={{ position: "absolute", left: 90 + Math.cos(a) * r, top: 50 + Math.sin(a) * r, width: 10, height: 10, borderRadius: 5, background: "#fff", boxShadow: "0 0 12px rgba(255,255,255,0.9)", opacity: 1 - burst }} />;
              })}
            <div
              style={{
                transform: `translateY(${float - peel * 90}px) scale(${(1 + lift * 0.7) * (1 - peel * 0.3)}) rotate(${s.rot + lift * 20 + peel * 24}deg)`,
                filter: `blur(${lift * 8}px) drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 ${shadow / 2}px ${shadow}px rgba(0,0,0,${0.25 + lift * 0.2}))`,
              }}
            >
              {s.render(f)}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
