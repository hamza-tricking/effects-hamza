import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Request timeline (glass waterfall): a frosted network panel under the chin. Five requests run
// one after another as a long staircase, then a "parallel" switch flips and all the bars slide
// to start together - the total time collapses from 1.8s to 0.4s with a glow.
const IN = 8;
const SEQ = [14, 40];
const FLIP = 46;
const PAR = [48, 62];
const OUT = 84;
const REQS = ["/video.mp4", "/captions.json", "/fx/orbit", "/sound.mp3", "/thumb.jpg"];
const DUR = 0.18; // each bar, as a fraction of the track
const TRACK = 640;

export const RequestTimeline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seq = interpolate(f, SEQ, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const par = interpolate(f, PAR, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const flipped = f >= FLIP;
  const knob = spring({ frame: f - FLIP, fps, config: { damping: 12, stiffness: 220 } });
  const total = flipped ? 1.8 - 1.4 * par : 1.8 * seq;
  const done = f >= PAR[1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 50, right: 50, top: 980, opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 140 + out * 40}px)` }}>
        <div style={{ ...glass("light", 44), padding: "24px 30px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, fontFamily: SANS, color: "#fff" }}>
            <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4 }}>NETWORK</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 26 }}>
              parallel
              <div style={{ width: 84, height: 46, borderRadius: 23, padding: 4, background: flipped ? "linear-gradient(90deg,#4FE3C1,#7CF5D6)" : "rgba(255,255,255,0.25)", boxShadow: flipped ? "0 0 16px rgba(79,227,193,0.8)" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: "#fff", transform: `translateX(${(flipped ? knob : 0) * 38}px)` }} />
              </div>
            </div>
          </div>
          {REQS.map((r, i) => {
            const seqStart = i * DUR;
            const grow = Math.min(1, Math.max(0, (seq - seqStart / (DUR * REQS.length)) * REQS.length));
            const start = seqStart * (1 - par);
            const width = DUR * (flipped ? 1 : grow);
            const color = done ? "linear-gradient(90deg,#4FE3C1,#7CF5D6)" : "linear-gradient(90deg,#FFB15C,#FF6A2B)";
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, height: 52 }}>
                <div style={{ width: 210, fontFamily: "Consolas, monospace", fontSize: 24, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r}</div>
                <div style={{ position: "relative", width: TRACK, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.12)" }}>
                  <div style={{ position: "absolute", left: start * TRACK, width: width * TRACK, top: 0, bottom: 0, borderRadius: 11, background: color, boxShadow: width > 0 ? "0 0 12px rgba(255,255,255,0.35)" : "none" }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 12, marginTop: 12, fontFamily: SANS, color: "#fff" }}>
            <span style={{ fontSize: 26, letterSpacing: 4, opacity: 0.8 }}>TOTAL</span>
            <span style={{ fontSize: 64, fontWeight: 900, fontVariantNumeric: "tabular-nums", ...gradText(done ? "linear-gradient(180deg,#fff,#7CF5D6)" : "linear-gradient(180deg,#fff,#FFD27A)"), filter: done ? "drop-shadow(0 0 14px rgba(79,227,193,0.8))" : "none" }}>{total.toFixed(1)}s</span>
          </div>
          <Sheen frame={f} start={PAR[1]} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
