import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Voice note (glass): a frosted voice-message bubble rises under the chin. The avatar's ring spins,
// sound rings pulse while it plays, the glowing gradient waveform fills with a light playhead,
// and a live transcript writes itself word by word under the waveform.
const IN = 8;
const PLAY = [18, 74];
const OUT = 84;
const BARS = 40;
const HEIGHTS = Array.from({ length: BARS }, (_, i) => 0.22 + Math.abs(Math.sin(i * 0.55 + 0.4)) * 0.55 + random(`vb${i}`) * 0.23);
const WORDS = ["Claude", "edited", "my", "whole", "reel", "🔥"];

export const VoiceNote: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 14, stiffness: 150 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = interpolate(f, PLAY, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const playing = f >= PLAY[0] && f < PLAY[1];
  const secs = Math.floor(p * 7);
  const ringT = ((f - PLAY[0]) % 20) / 20;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1040,
          opacity: Math.min(1, pop * 1.4) * (1 - out),
          transform: `translateY(${(1 - pop) * 120 + out * 60}px) scale(${0.92 + 0.08 * pop})`,
          filter: (1 - Math.min(1, pop)) * 12 + out * 8 > 0.05 ? `blur(${(1 - Math.min(1, pop)) * 12 + out * 8}px)` : undefined,
        }}
      >
        <div style={{ ...glass("light", 52), padding: "28px 32px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* avatar with spinning gradient ring + sound rings */}
            <div style={{ position: "relative", width: 112, height: 112, flex: "none" }}>
              {playing &&
                [0, 0.5].map((o, i) => {
                  const r = (ringT + o) % 1;
                  return <div key={i} style={{ position: "absolute", inset: -r * 34, borderRadius: "50%", border: `3px solid rgba(124,245,214,${0.7 * (1 - r)})` }} />;
                })}
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", padding: 5, background: `conic-gradient(from ${f * 5}deg, #7CF5D6, #6C8CFF, #C77DFF, #7CF5D6)` }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg,#2a2d36,#4b5160)", border: "3px solid rgba(255,255,255,0.6)", display: "grid", placeItems: "center", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 42 }}>H</div>
              </div>
            </div>
            {/* glass play button */}
            <div style={{ ...glass("dark", 50), width: 92, height: 92, flex: "none", display: "grid", placeItems: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24">
                {playing ? <g fill="#fff"><rect x="6" y="4" width="4.2" height="16" rx="1.6" /><rect x="13.8" y="4" width="4.2" height="16" rx="1.6" /></g> : <path d="M8 4.5 L19.5 12 L8 19.5 Z" fill="#fff" />}
              </svg>
            </div>
            {/* waveform */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, height: 92 }}>
                {HEIGHTS.map((h, i) => {
                  const pos = i / BARS;
                  const lit = pos < p;
                  const near = playing ? Math.max(0, 1 - Math.abs(pos - p) * 14) : 0;
                  const wob = playing ? 1 + 0.35 * near * Math.sin(f * 0.9 + i) : 1;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h * 100 * wob}%`,
                        borderRadius: 6,
                        background: lit ? "linear-gradient(180deg, #FFFFFF, #7CF5D6)" : "rgba(255,255,255,0.32)",
                        boxShadow: lit ? "0 0 12px rgba(124,245,214,0.7)" : "none",
                      }}
                    />
                  );
                })}
              </div>
              {/* light playhead */}
              <div style={{ position: "absolute", top: -6, bottom: -6, left: `${p * 100}%`, width: 4, marginLeft: -2, borderRadius: 2, background: "#fff", boxShadow: "0 0 16px 4px rgba(255,255,255,0.8)", opacity: playing ? 1 : 0 }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontFamily: SANS, fontSize: 26, color: "rgba(255,255,255,0.75)", fontVariantNumeric: "tabular-nums" }}>
            <span>0:0{secs} / 0:07</span>
            <span style={{ letterSpacing: 3 }}>VOICE NOTE</span>
          </div>
          <div style={{ height: 1.5, margin: "18px 0 16px", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))" }} />
          {/* live transcript */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px", minHeight: 56, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: "#fff" }}>
            {WORDS.map((w, i) => {
              const at = PLAY[0] + 4 + i * 8;
              const a = interpolate(f, [at, at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span key={i} style={{ opacity: a, transform: `translateY(${(1 - a) * 14}px)`, filter: `blur(${(1 - a) * 6}px)`, ...(i === 0 ? gradText("linear-gradient(180deg,#FFFFFF,#7CF5D6)") : {}) }}>
                  {w}
                </span>
              );
            })}
          </div>
          <Sheen frame={f} start={IN + 5} dur={18} strength={0.45} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
