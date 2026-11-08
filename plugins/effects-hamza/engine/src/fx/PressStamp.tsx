import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Press stamp: a heavy chrome hydraulic press slams down on a big glass file box ("2.4 GB"),
// squashes it with a puff of glass shards and a shake, lifts away, and the box is now small and
// glowing green ("240 MB").
const IN = 8;
const DROP = [22, 30];
const LIFT = [38, 50];
const OUT = 84;
const CX = 290; // left side, so the press column never crosses the face
const BASE = 1420; // floor line of the box

export const PressStamp: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drop = interpolate(f, DROP, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const lift = interpolate(f, LIFT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const hit = f >= DROP[1];
  const bounce = spring({ frame: f - DROP[1], fps, config: { damping: 7, stiffness: 300 } });
  const bigH = 330;
  const smallH = 150;
  const boxH = hit ? smallH : bigH;
  const boxW = hit ? 420 : 380;
  const squashX = hit ? 1 + 0.12 * (1 - Math.min(1, bounce)) : 1;
  const pressY = hit ? BASE - boxH - lift * 600 : BASE - bigH - (1 - drop) * 600;
  const shake = f >= DROP[1] && f < DROP[1] + 6 ? (random(`s${f}`) - 0.5) * 22 : 0;
  const shards = interpolate(f, [DROP[1], DROP[1] + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const vis = Math.min(1, pop * 1.4) * (1 - out);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${-Math.abs(shake) / 2}px)` }}>
        <Clip />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: vis, transform: `translateY(${(1 - pop) * 140}px)` }}>
        {/* glow on the floor */}
        <div style={{ position: "absolute", left: CX - 300, top: BASE - 60, width: 600, height: 120, borderRadius: "50%", background: hit ? "radial-gradient(circle, rgba(79,227,193,0.6), rgba(79,227,193,0) 70%)" : "radial-gradient(circle, rgba(255,140,60,0.5), rgba(255,140,60,0) 70%)", filter: "blur(20px)" }} />
        {/* shards */}
        {hit && shards < 1 &&
          Array.from({ length: 14 }, (_, i) => {
            const a = Math.PI + random(`a${i}`) * Math.PI;
            const d = (120 + random(`d${i}`) * 220) * shards;
            return <div key={i} style={{ ...glass("light", 6), position: "absolute", left: CX + Math.cos(a) * d * 1.6, top: BASE - 40 + Math.sin(a) * d * 0.6 + shards * shards * 120, width: 26, height: 18, opacity: 1 - shards, transform: `rotate(${random(`r${i}`) * 360 + shards * 300}deg)` }} />;
          })}
        {/* the file box */}
        <div style={{ position: "absolute", left: CX - boxW / 2, top: BASE - boxH, width: boxW, height: boxH, transform: `scaleX(${squashX})`, transformOrigin: "50% 100%" }}>
          <div style={{ ...glass("light", 34), width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, boxShadow: hit ? "inset 0 1.5px 0 rgba(255,255,255,0.8), 0 0 40px rgba(79,227,193,0.6), 0 20px 40px rgba(0,0,0,0.35)" : undefined }}>
            <svg width={hit ? 64 : 110} height={hit ? 80 : 136} viewBox="0 0 24 30"><path d="M3 1h12l6 6v22H3z" fill="rgba(255,255,255,0.85)" /><path d="M15 1v6h6" fill="rgba(0,0,0,0.15)" /></svg>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: hit ? 70 : 84, letterSpacing: -2, ...gradText(hit ? "linear-gradient(180deg,#FFFFFF,#7CF5D6)" : "linear-gradient(180deg,#FFFFFF,#FFB15C)"), filter: hit ? "drop-shadow(0 0 14px rgba(79,227,193,0.8))" : "none" }}>
              {hit ? "240 MB" : "2.4 GB"}
            </div>
            {hit && <Sheen frame={f} start={LIFT[1]} dur={14} />}
          </div>
        </div>
        {/* the press */}
        <div style={{ position: "absolute", left: CX - 220, top: pressY - 700, width: 440, height: 700 }}>
          <div style={{ position: "absolute", left: 180, top: 0, width: 80, height: 620, background: "linear-gradient(90deg,#6b717a,#f2f3f5 45%,#7d828a)" }} />
          <div style={{ position: "absolute", left: 0, top: 600, width: 440, height: 100, borderRadius: 18, background: "linear-gradient(180deg,#f7f7f9 0%,#a7acb5 40%,#ffffff 55%,#7d828a 100%)", boxShadow: "0 18px 30px rgba(0,0,0,0.45), inset 0 2px 0 #fff" }}>
            <div style={{ position: "absolute", left: 20, right: 20, top: 40, height: 6, borderRadius: 3, background: "repeating-linear-gradient(90deg,#FF6A2B 0 30px,#111 30px 60px)" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
