import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";
import track from "./track.json";

// Sticky text (glass): a frosted profile tag floats above the head and follows it frame by frame
// (tracked from the cutout matte). A glowing curved tether with flowing light connects it to a
// pulsing dot on the head. The tag trails slightly and sways with the movement.
const IN = 10;
const OUT = 84;
const T = track as { x: number; y: number }[];
const at = (i: number) => T[Math.max(0, Math.min(T.length - 1, i))];

export const StickyText: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 11, stiffness: 170 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const now = at(f);
  const lag = at(f - 3);
  const sway = (now.x - lag.x) * -0.5;
  const lx = lag.x;
  const ly = Math.max(270, lag.y - 175);
  const s = Math.max(0, pop) * (1 - out);
  const blur = (1 - Math.min(1, pop)) * 12 + out * 10;
  const hx = now.x;
  const hy = now.y + 8;
  const pulse = ((f - IN) % 24) / 24;
  if (f < IN) return <AbsoluteFill style={{ backgroundColor: "#000" }}><Clip /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {/* tether + head dot */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: s, overflow: "visible" }}>
        <defs>
          <linearGradient id="tether" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#FF8A3D" />
          </linearGradient>
        </defs>
        <path d={`M ${lx} ${ly + 52} Q ${(lx + hx) / 2 + 40} ${(ly + hy) / 2} ${hx} ${hy}`} stroke="url(#tether)" strokeWidth={4} fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(255,170,100,0.9))" }} />
        <path d={`M ${lx} ${ly + 52} Q ${(lx + hx) / 2 + 40} ${(ly + hy) / 2} ${hx} ${hy}`} stroke="#fff" strokeWidth={4} fill="none" strokeDasharray="10 40" strokeDashoffset={-f * 4} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={20 + pulse * 26} fill="none" stroke="rgba(255,138,61,0.9)" strokeWidth={3} opacity={1 - pulse} />
        <circle cx={hx} cy={hy} r={11} fill="#fff" style={{ filter: "drop-shadow(0 0 10px rgba(255,138,61,1))" }} />
      </svg>
      {/* glass tag */}
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%, -50%) scale(${s}) rotate(${-2 + sway}deg)`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        <div style={{ ...glass("dark", 999), display: "flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 14px", whiteSpace: "nowrap" }}>
          <div style={{ width: 78, height: 78, borderRadius: 39, padding: 4, background: `conic-gradient(from ${f * 6}deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg,#2a2d36,#4b5160)", border: "3px solid rgba(20,20,26,0.9)", display: "grid", placeItems: "center", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 32 }}>H</div>
          </div>
          <div style={{ fontFamily: SANS, color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 42, lineHeight: 1.05 }}>
              Hamza
              <svg width={34} height={34} viewBox="0 0 24 24"><path d="M12 1.5l2.6 2 3.2-.3.9 3.1 2.8 1.6-1.1 3 1.1 3-2.8 1.6-.9 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-.9-3.1L2.4 14l1.1-3-1.1-3 2.8-1.6.9-3.1 3.2.3z" fill="#3897F0" /><path d="M7.5 12.2l3 3 6-6.2" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontWeight: 500, fontSize: 24, opacity: 0.75, letterSpacing: 1 }}>Creator · Claude effects</div>
          </div>
          <Sheen frame={f} start={IN + 6} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
