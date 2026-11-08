import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Scissors split: a long glass "video" strip floats under the chin. Chrome scissors snip along
// two dashed lines with sparks, and the strip splits into three short clip cards that spread
// apart and tilt, each with its own label.
const IN = 8;
const CUT1 = [24, 32];
const CUT2 = [34, 42];
const SPLIT = 44;
const OUT = 84;
const W = 900;
const H = 200;
const PARTS = ["CLIP 1", "CLIP 2", "CLIP 3"];

const Scissors: React.FC<{ open: number }> = ({ open }) => (
  <svg width={150} height={150} viewBox="-75 -75 150 150" style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))" }}>
    <defs>
      <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#9aa0a8" />
        <stop offset="60%" stopColor="#f2f3f5" />
        <stop offset="100%" stopColor="#6b717a" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${-open * 18})`}>
      <path d="M0 0 L70 -8 L70 0 Z" fill="url(#chrome)" />
      <circle cx={-34} cy={-14} r={16} fill="none" stroke="#FF6A2B" strokeWidth={8} />
      <path d="M0 0 L-22 -10" stroke="#FF6A2B" strokeWidth={8} />
    </g>
    <g transform={`rotate(${open * 18})`}>
      <path d="M0 0 L70 8 L70 0 Z" fill="url(#chrome)" />
      <circle cx={-34} cy={14} r={16} fill="none" stroke="#FF6A2B" strokeWidth={8} />
      <path d="M0 0 L-22 10" stroke="#FF6A2B" strokeWidth={8} />
    </g>
    <circle r={6} fill="#fff" />
  </svg>
);

export const ScissorsSplit: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1 = interpolate(f, CUT1, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const c2 = interpolate(f, CUT2, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const split = spring({ frame: f - SPLIT, fps, config: { damping: 12, stiffness: 150 } });
  const cutting = (f >= CUT1[0] && f < CUT1[1]) || (f >= CUT2[0] && f < CUT2[1]);
  const lineX = f < CUT2[0] ? W / 3 : (2 * W) / 3;
  const prog = f < CUT2[0] ? c1 : c2;
  const sx = 90 + lineX;
  const sy = 1060 + prog * H;
  const open = Math.abs(Math.sin(f * 1.2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 90, top: 1060, width: W, height: H, opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 120 + out * 40}px)` }}>
        {PARTS.map((p, i) => {
          const dx = (i - 1) * 60 * split;
          const rot = (i - 1) * 6 * split;
          const dy = i === 1 ? -20 * split : 10 * split;
          return (
            <div key={p} style={{ position: "absolute", left: (i * W) / 3, top: 0, width: W / 3, height: H, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>
              <div style={{ ...glass("light", 0), width: "100%", height: "100%", borderRadius: f >= SPLIT ? 28 : i === 0 ? "28px 0 0 28px" : i === 2 ? "0 28px 28px 0" : 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", gap: 12 }}>
                {/* film-strip holes */}
                <div style={{ display: "flex", gap: 10 }}>{Array.from({ length: 5 }, (_, k) => <div key={k} style={{ width: 22, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.45)" }} />)}</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 46, color: "#fff", letterSpacing: 2 }}>{f >= SPLIT ? p : i === 1 ? "LONG VIDEO" : ""}</div>
                <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg,#FFB15C,#FF6A2B)", width: f >= SPLIT ? "70%" : "100%" }} />
                {f >= SPLIT && <Sheen frame={f} start={SPLIT + i * 3} dur={12} />}
              </div>
            </div>
          );
        })}
        {/* dashed cut lines */}
        {[W / 3, (2 * W) / 3].map((x, i) => (
          <div key={i} style={{ position: "absolute", left: x - 2, top: -10, height: H + 20, width: 0, borderLeft: "4px dashed rgba(255,255,255,0.8)", opacity: f < SPLIT ? 1 : 0 }} />
        ))}
      </div>
      {cutting && (
        <>
          <div style={{ position: "absolute", left: sx - 75, top: sy - 75, transform: "rotate(90deg)" }}>
            <Scissors open={open} />
          </div>
          {Array.from({ length: 6 }, (_, k) => (
            <div key={k} style={{ position: "absolute", left: sx + Math.cos(k + f) * 30, top: sy + 40 + Math.sin(k * 2 + f) * 20, width: 6, height: 6, borderRadius: 3, background: "#FFD27A", boxShadow: "0 0 10px #FFB15C" }} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
