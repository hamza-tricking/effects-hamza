import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Day dial (glass): a frosted rotary dial appears on the chest for a time jump. The ring of days
// spins with motion blur, decelerates and clicks on the pointer; the centre counts 1 -> 7 and
// reveals "DAYS LATER" in glowing gradient.
const IN = 8;
const SPIN = [14, 46];
const OUT = 84;
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const SIZE = 470;
const CX = 540;
const CY = 1215;

export const DayDial: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 150 } });
  const out = interpolate(f, [OUT, OUT + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = interpolate(f, SPIN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lock = spring({ frame: f - SPIN[1], fps, config: { damping: 6, stiffness: 300 } });
  const total = 360 * 2 + (360 / 7) * 6; // two turns, then land on SUN
  const angle = -spin * total + (f >= SPIN[1] ? (1 - lock) * 6 : 0);
  const vel = Math.abs(interpolate(f + 1, SPIN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) - spin) * total;
  const days = Math.max(1, Math.min(7, Math.round(1 + spin * 6)));
  const landed = f >= SPIN[1];
  const s = (0.7 + 0.3 * pop) * (1 - out * 0.15);
  const op = Math.min(1, pop * 1.5) * (1 - out);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: CX - SIZE / 2, top: CY - SIZE / 2, width: SIZE, height: SIZE, transform: `scale(${s})`, opacity: op }}>
        {/* outer glass ring */}
        <div style={{ ...glass("light", SIZE / 2), position: "absolute", inset: 0 }}>
          <Sheen frame={f} start={SPIN[1] + 1} dur={14} />
        </div>
        {/* rotating ticks + day labels */}
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${angle}deg)`, filter: vel > 2 ? `blur(${Math.min(5, vel / 6)}px)` : undefined }}>
          {Array.from({ length: 56 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: SIZE / 2 - 1.5, top: 10, width: 3, height: i % 8 === 0 ? 26 : 14, background: "rgba(255,255,255,0.7)", transformOrigin: `1.5px ${SIZE / 2 - 10}px`, transform: `rotate(${(i / 56) * 360}deg)` }} />
          ))}
          {DAYS.map((d, i) => (
            <div key={d} style={{ position: "absolute", left: SIZE / 2 - 60, top: 40, width: 120, textAlign: "center", transformOrigin: `60px ${SIZE / 2 - 40}px`, transform: `rotate(${(i / 7) * 360}deg)`, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: landed && d === "SUN" ? "#FFD27A" : "rgba(255,255,255,0.85)", textShadow: landed && d === "SUN" ? "0 0 14px rgba(255,190,90,0.9)" : "none" }}>
              {d}
            </div>
          ))}
        </div>
        {/* pointer */}
        <svg width={48} height={40} style={{ position: "absolute", left: SIZE / 2 - 24, top: -26, filter: "drop-shadow(0 0 10px rgba(255,190,90,0.9))" }}>
          <path d="M4 4 L44 4 L24 36 Z" fill="#FFD27A" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
        </svg>
        {/* centre disc */}
        <div style={{ ...glass("dark", 999), position: "absolute", left: 105, top: 105, width: SIZE - 210, height: SIZE - 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 130, lineHeight: 0.9, letterSpacing: -4, fontVariantNumeric: "tabular-nums", ...gradText("linear-gradient(180deg,#FFFFFF,#FFE0A8 55%,#FF9A4C)"), filter: landed ? "drop-shadow(0 0 18px rgba(255,170,80,0.7))" : "none" }}>{days}</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: "#fff", opacity: landed ? 1 : 0.5, marginTop: 6 }}>{days === 1 ? "DAY" : "DAYS"} LATER</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
