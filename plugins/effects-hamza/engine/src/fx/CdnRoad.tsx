import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// CDN road: a glass server node on the left wall and a glass phone on the right. A glowing path
// draws itself between them through a "CDN" hub, data packets race along it leaving light trails,
// and a latency badge drops from 820 ms to 12 ms.
const IN = 8;
const DRAW = [14, 32];
const RUN = [30, 76];
const OUT = 84;
// cubic path points (on the empty walls, above the chest)
const A = { x: 190, y: 560 };
const H = { x: 540, y: 1180 }; // CDN hub, on the chest
const B = { x: 900, y: 560 };
const PATH = `M ${A.x} ${A.y} C ${A.x} ${H.y - 80}, ${H.x - 220} ${H.y}, ${H.x} ${H.y} S ${B.x} ${H.y - 80}, ${B.x} ${B.y}`;

// approximate point on the path using the same curve pieces
const bez = (t: number, p0: number, p1: number, p2: number, p3: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};
const pointAt = (t: number) => {
  if (t < 0.5) {
    const k = t * 2;
    return { x: bez(k, A.x, A.x, H.x - 220, H.x), y: bez(k, A.y, H.y - 80, H.y, H.y) };
  }
  const k = (t - 0.5) * 2;
  return { x: bez(k, H.x, H.x + 220, B.x, B.x), y: bez(k, H.y, H.y, H.y - 80, B.y) };
};

export const CdnRoad: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const draw = interpolate(f, DRAW, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const ms = Math.round(interpolate(f, [RUN[0], RUN[0] + 30], [820, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const vis = Math.min(1, pop * 1.4) * (1 - out);
  const packets = [0, 0.33, 0.66];
  const node = (x: number, y: number, children: React.ReactNode, label: string) => (
    <div style={{ position: "absolute", left: x - 100, top: y - 150, width: 200, transform: `scale(${0.7 + 0.3 * pop})` }}>
      <div style={{ ...glass("dark", 30), height: 170, display: "grid", placeItems: "center" }}>{children}</div>
      <div style={{ textAlign: "center", marginTop: 10, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: "#111", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <AbsoluteFill style={{ opacity: vis }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFB15C" />
              <stop offset="50%" stopColor="#7CF5D6" />
              <stop offset="100%" stopColor="#9AB8FF" />
            </linearGradient>
          </defs>
          <path d={PATH} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
          <path d={PATH} fill="none" stroke="url(#road)" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: "drop-shadow(0 0 10px rgba(124,245,214,0.9))" }} />
          <path d={PATH} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={3} strokeDasharray="6 22" strokeDashoffset={-f * 6} pathLength={undefined} opacity={draw >= 1 ? 1 : 0} />
          {f >= RUN[0] &&
            packets.map((o, i) => {
              const t = ((f - RUN[0]) / 26 + o) % 1;
              const p = pointAt(t);
              const tail = pointAt(Math.max(0, t - 0.06));
              return (
                <g key={i}>
                  <line x1={tail.x} y1={tail.y} x2={p.x} y2={p.y} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
                  <circle cx={p.x} cy={p.y} r={14} fill="#fff" style={{ filter: "drop-shadow(0 0 12px #7CF5D6)" }} />
                </g>
              );
            })}
        </svg>
        {node(A.x, A.y, <svg width={90} height={90} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="5" rx="1.5" fill="#fff" /><rect x="3" y="10" width="18" height="5" rx="1.5" fill="#fff" opacity="0.8" /><rect x="3" y="17" width="18" height="4" rx="1.5" fill="#fff" opacity="0.6" /></svg>, "SERVER")}
        {node(B.x, B.y, <svg width={70} height={110} viewBox="0 0 14 22"><rect x="1" y="1" width="12" height="20" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.6" /><rect x="5" y="2.5" width="4" height="1.2" rx="0.6" fill="#fff" /></svg>, "PHONE")}
        {/* CDN hub on the chest */}
        <div style={{ position: "absolute", left: H.x - 110, top: H.y - 60, width: 220, transform: `scale(${draw > 0.45 ? 1 : 0.4})` }}>
          <div style={{ ...glass("light", 999), height: 120, display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 900, fontSize: 52, color: "#fff", letterSpacing: 4, boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.7), 0 0 40px rgba(124,245,214,0.6)" }}>
            CDN
            <Sheen frame={f} start={DRAW[1]} dur={14} />
          </div>
        </div>
        {/* latency badge */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: f >= RUN[0] ? 1 : 0 }}>
          <div style={{ ...glass("dark", 999), padding: "12px 30px", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            ⚡ {ms} ms
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
