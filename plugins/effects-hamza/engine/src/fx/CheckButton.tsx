import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Check button (glass): a big frosted "Render reel" button floats under the chin. A glass finger
// cursor taps it, the button squishes into a glowing progress ring, the ring completes, morphs into
// a green check with a burst of glass confetti, and the label becomes "Done".
const IN = 8;
const TAP = 26;
const LOAD = [30, 56];
const DONE = 56;
const OUT = 84;
const COLORS = ["#7CF5D6", "#FFD27A", "#FF8FB1", "#9AB8FF", "#ffffff"];

export const CheckButton: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tap = f >= TAP ? spring({ frame: f - TAP, fps, config: { damping: 8, stiffness: 300 } }) : 0;
  const squish = f >= TAP && f < LOAD[0] + 2 ? 1 - 0.08 * Math.sin(Math.min(1, tap) * Math.PI) : 1;
  const loading = f >= LOAD[0] && f < DONE;
  const prog = interpolate(f, LOAD, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const done = f >= DONE;
  const check = spring({ frame: f - DONE, fps, config: { damping: 9, stiffness: 220 } });
  const burst = interpolate(f, [DONE, DONE + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  // morph width: wide pill -> circle while loading -> wide again when done
  const w = loading ? 200 : done ? interpolate(check, [0, 1], [200, 560]) : 600;
  // finger path
  const fx = interpolate(f, [IN + 4, TAP, TAP + 10], [980, 600, 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const fy = interpolate(f, [IN + 4, TAP, TAP + 10], [1500, 1250, 1460], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const fingerOn = f >= IN + 4 && f < TAP + 10;
  const CX = 540;
  const CY = 1200;
  const H = 200;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <AbsoluteFill style={{ opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 160 + out * 50}px)` }}>
        {/* glow under the button */}
        <div style={{ position: "absolute", left: CX - 320, top: CY - 120, width: 640, height: 240, borderRadius: "50%", background: done ? "radial-gradient(circle, rgba(79,227,193,0.7), rgba(79,227,193,0) 70%)" : "radial-gradient(circle, rgba(255,150,70,0.6), rgba(255,150,70,0) 70%)", filter: "blur(40px)" }} />
        {/* confetti */}
        {done &&
          burst < 1 &&
          Array.from({ length: 22 }, (_, i) => {
            const a = random(`ca${i}`) * Math.PI * 2;
            const d = (160 + random(`cd${i}`) * 260) * burst;
            const x = CX + Math.cos(a) * d;
            const y = CY + Math.sin(a) * d * 0.8 + burst * burst * 140;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 30, borderRadius: 5, background: COLORS[i % COLORS.length], opacity: 1 - burst, transform: `rotate(${random(`cr${i}`) * 360 + burst * 400}deg)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.4)" }} />;
          })}
        {/* the button */}
        <div style={{ position: "absolute", left: CX - w / 2, top: CY - H / 2, width: w, height: H, transform: `scale(${squish})` }}>
          <div style={{ ...glass("light", H / 2), width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#fff", boxShadow: done ? "inset 0 1.5px 0 rgba(255,255,255,0.8), 0 0 50px rgba(79,227,193,0.6), 0 30px 60px rgba(0,0,0,0.35)" : undefined }}>
            {!loading && !done && (
              <>
                <svg width={60} height={60} viewBox="0 0 24 24"><path d="M7 4.5 L19 12 L7 19.5 Z" fill="#fff" /></svg>
                Render reel
              </>
            )}
            {loading && (
              <svg width={150} height={150} viewBox="0 0 100 100">
                <circle cx={50} cy={50} r={40} stroke="rgba(255,255,255,0.25)" strokeWidth={8} fill="none" />
                <circle cx={50} cy={50} r={40} stroke="url(#rg)" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={`${prog * 251} 251`} transform="rotate(-90 50 50)" style={{ filter: "drop-shadow(0 0 6px rgba(255,170,90,0.9))" }} />
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD27A" /><stop offset="100%" stopColor="#FF7A3D" /></linearGradient>
                </defs>
                <text x={50} y={58} textAnchor="middle" fontFamily="Segoe UI, sans-serif" fontWeight={800} fontSize={22} fill="#fff">{Math.round(prog * 100)}%</text>
              </svg>
            )}
            {done && (
              <>
                <div style={{ width: 96, height: 96, borderRadius: 48, background: "linear-gradient(180deg,#7CF5D6,#22B892)", display: "grid", placeItems: "center", transform: `scale(${check})`, boxShadow: "0 0 30px rgba(79,227,193,0.9)" }}>
                  <svg width={58} height={58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - Math.min(1, check))} /></svg>
                </div>
                {check > 0.6 && <span style={{ opacity: Math.min(1, (check - 0.6) * 3) }}>Done</span>}
              </>
            )}
            <Sheen frame={f} start={done ? DONE + 2 : IN + 6} dur={16} strength={0.5} />
          </div>
        </div>
        {/* finger cursor */}
        {fingerOn && (
          <div style={{ position: "absolute", left: fx, top: fy, transform: `scale(${f >= TAP && f < TAP + 4 ? 0.85 : 1})`, transformOrigin: "30% 0%" }}>
            <div style={{ ...glass("light", 999), width: 90, height: 90, display: "grid", placeItems: "center", fontSize: 54 }}>👆</div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
