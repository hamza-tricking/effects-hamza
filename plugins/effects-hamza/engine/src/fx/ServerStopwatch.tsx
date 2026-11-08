import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Server stopwatch (glass): a frosted stopwatch beside a glowing server rack. The hand races,
// the load time readout drops from 3.2s to 0.4s with a speed-glow, the rack lights blink faster,
// and a "8x faster" chip clicks in.
const IN = 8;
const RUN = [16, 50];
const DONE = 50;
const OUT = 84;

export const ServerStopwatch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(f, RUN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const secs = 3.2 - 2.8 * t;
  const hand = f * (8 + 30 * (1 - t)) ;
  const done = f >= DONE;
  const chip = spring({ frame: f - DONE, fps, config: { damping: 9, stiffness: 240 } });
  const speed = done ? 0 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1000, opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 140 + out * 40}px)` }}>
        <div style={{ ...glass("light", 48), display: "flex", alignItems: "center", gap: 34, padding: "30px 40px" }}>
          {/* server rack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "none" }}>
            {[0, 1, 2].map((r) => (
              <div key={r} style={{ ...glass("dark", 14), width: 170, height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
                {[0, 1, 2].map((l) => {
                  const on = Math.floor(f / (done ? 2 : 6) + r + l * 2) % 3 === 0;
                  return <div key={l} style={{ width: 14, height: 14, borderRadius: 7, background: on ? "#7CF5D6" : "rgba(255,255,255,0.25)", boxShadow: on ? "0 0 12px #7CF5D6" : "none" }} />;
                })}
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
              </div>
            ))}
          </div>
          {/* stopwatch */}
          <div style={{ position: "relative", width: 250, height: 250, flex: "none" }}>
            <div style={{ position: "absolute", left: 105, top: -24, width: 40, height: 30, borderRadius: 8, background: "linear-gradient(180deg,#f2f3f5,#9aa0a8)" }} />
            <div style={{ ...glass("dark", 125), width: 250, height: 250 }}>
              <svg width={250} height={250} viewBox="-125 -125 250 250">
                {Array.from({ length: 60 }, (_, i) => (
                  <line key={i} x1={0} y1={-108} x2={0} y2={i % 5 === 0 ? -92 : -100} stroke="rgba(255,255,255,0.7)" strokeWidth={i % 5 === 0 ? 4 : 2} transform={`rotate(${i * 6})`} />
                ))}
                <circle r={96} fill="none" stroke="url(#arc)" strokeWidth={6} strokeDasharray={`${(1 - t) * 603} 603`} transform="rotate(-90)" style={{ filter: "drop-shadow(0 0 6px rgba(255,140,60,0.9))" }} />
                <defs>
                  <linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD27A" /><stop offset="100%" stopColor="#FF6A2B" /></linearGradient>
                </defs>
                <line x1={0} y1={14} x2={0} y2={-86} stroke="#fff" strokeWidth={5} strokeLinecap="round" transform={`rotate(${hand})`} style={{ filter: speed ? "drop-shadow(0 0 6px #fff)" : "none" }} />
                <circle r={9} fill="#FF6A2B" />
              </svg>
            </div>
          </div>
          {/* readout */}
          <div style={{ flex: 1, fontFamily: SANS, color: "#fff" }}>
            <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.8 }}>LOAD TIME</div>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, letterSpacing: -4, fontVariantNumeric: "tabular-nums", ...gradText(done ? "linear-gradient(180deg,#FFFFFF,#7CF5D6)" : "linear-gradient(180deg,#FFFFFF,#FFD27A)"), filter: done ? "drop-shadow(0 0 16px rgba(124,245,214,0.8))" : "none" }}>{secs.toFixed(1)}s</div>
            <div style={{ marginTop: 10, transform: `scale(${done ? chip : 0})`, transformOrigin: "0 50%", display: "inline-block" }}>
              <div style={{ ...glass("dark", 999), padding: "8px 20px", fontWeight: 800, fontSize: 30 }}>⚡ 8× faster</div>
            </div>
          </div>
          <Sheen frame={f} start={DONE} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
