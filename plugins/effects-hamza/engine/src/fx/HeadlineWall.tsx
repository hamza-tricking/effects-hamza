import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, Person, SANS, SERIF } from "./shared";

// Headline wall: paper notes, clippings and a search bar slap onto the wall behind the person,
// slightly tilted, one per beat. The person stays cut out in front of them.
type Card = { at: number; x: number; y: number; w: number; rot: number; node: React.ReactNode };

const CARDS: Card[] = [
  {
    at: 8, x: 40, y: 300, w: 420, rot: -6,
    node: (
      <div style={{ background: "#F3EEE3", padding: "22px 24px", fontFamily: SERIF }}>
        <div style={{ fontFamily: SANS, fontSize: 16, letterSpacing: 3, color: "#7a7468", borderBottom: "2px solid #222", paddingBottom: 6 }}>THE DAILY REEL</div>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.05, marginTop: 10, color: "#151515" }}>Claude can now edit your videos</div>
      </div>
    ),
  },
  {
    at: 16, x: 700, y: 280, w: 340, rot: 5,
    node: (
      <div style={{ background: "#FFE45C", padding: "26px 24px 30px", fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontSize: 40, fontWeight: 700, color: "#1d1d1d", lineHeight: 1.15 }}>
        1 prompt<br />= 1 reel ✓
      </div>
    ),
  },
  {
    at: 24, x: 60, y: 640, w: 400, rot: 3,
    node: (
      <div style={{ background: "#fff", borderRadius: 40, padding: "18px 26px", display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: 30, color: "#222" }}>
        <svg width={34} height={34} viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" stroke="#555" strokeWidth="2.4" fill="none" /><path d="M15 15l5 5" stroke="#555" strokeWidth="2.4" strokeLinecap="round" /></svg>
        how to edit reels fast
      </div>
    ),
  },
  {
    at: 32, x: 730, y: 560, w: 320, rot: -4,
    node: (
      <div style={{ background: "#151517", padding: "24px 26px", fontFamily: SERIF, color: "#fff" }}>
        <div style={{ fontSize: 60, lineHeight: 0.6, color: "#FF6A2B" }}>“</div>
        <div style={{ fontSize: 34, fontStyle: "italic", lineHeight: 1.2 }}>This saved me 10 hours a week.</div>
      </div>
    ),
  },
  {
    at: 40, x: 300, y: 235, w: 480, rot: -2,
    node: (
      <div style={{ background: "#fff", padding: "14px 22px", fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: -1, color: "#111", borderLeft: "10px solid #FF3B30" }}>
        AI EDITING IS HERE
      </div>
    ),
  },
];
const OUT = 84;

export const HeadlineWall: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {CARDS.map((c, i) => {
        const p = spring({ frame: f - c.at, fps, config: { damping: 12, stiffness: 220, mass: 0.8 } });
        const lift = 1 - Math.min(1, p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: c.w,
              opacity: (f >= c.at ? 1 : 0) * (1 - out),
              transform: `scale(${1 + lift * 0.35 - out * 0.1}) rotate(${c.rot + lift * 10}deg)`,
              boxShadow: `0 ${8 + lift * 30}px ${20 + lift * 40}px rgba(0,0,0,${0.28 + lift * 0.15})`,
            }}
          >
            {c.node}
            {/* tape */}
            <div style={{ position: "absolute", left: "50%", top: -14, width: 110, height: 30, marginLeft: -55, background: "rgba(255,255,255,0.55)", transform: `rotate(${i % 2 ? 4 : -5}deg)`, boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
          </div>
        );
      })}
      <Person />
    </AbsoluteFill>
  );
};
