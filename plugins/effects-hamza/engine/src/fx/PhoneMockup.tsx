import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Phone mockup: a dark phone slides in beside the person. On its screen a chat types
// the command, sends it, and the reply shows a render bar filling up to "Done".
const IN = 8;
const CMD = "/fx orbit-ring";
const TYPE = [18, 38];
const SEND = 42;
const REPLY = 48;
const BAR = [52, 72];
const OUT = 84;

export const PhoneMockup: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame: f - IN, fps, config: { damping: 16, stiffness: 120 } });
  const leave = interpolate(f, [OUT, OUT + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const x = (1 - slide) * -520 - leave * 520;
  const n = Math.floor(interpolate(f, TYPE, [0, CMD.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sent = f >= SEND;
  const sentPop = spring({ frame: f - SEND, fps, config: { damping: 14, stiffness: 200 } });
  const reply = spring({ frame: f - REPLY, fps, config: { damping: 14, stiffness: 180 } });
  const bar = interpolate(f, BAR, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const done = bar >= 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 400,
          width: 380,
          height: 780,
          borderRadius: 58,
          background: "#101114",
          padding: 14,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 2px #2b2d33",
          transform: `translateX(${x}px) rotate(${-4 + (1 - slide) * -8}deg)`,
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: "#F7F5F0", fontFamily: SANS }}>
          {/* dynamic island */}
          <div style={{ position: "absolute", left: "50%", top: 14, width: 110, height: 32, marginLeft: -55, borderRadius: 16, background: "#000" }} />
          {/* header */}
          <div style={{ padding: "64px 24px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e6e2d8" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#D97757", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 24 }}>✳</div>
            <div style={{ fontWeight: 800, fontSize: 26, color: "#1b1b1b" }}>Claude</div>
          </div>
          {/* messages */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {sent && (
              <div style={{ alignSelf: "flex-end", background: "#1b1b1b", color: "#fff", fontFamily: "Consolas, monospace", fontSize: 24, fontWeight: 700, padding: "14px 18px", borderRadius: "20px 20px 6px 20px", transform: `scale(${0.7 + 0.3 * sentPop})`, transformOrigin: "100% 100%" }}>
                {CMD}
              </div>
            )}
            {f >= REPLY && (
              <div style={{ alignSelf: "flex-start", width: "88%", background: "#fff", border: "1px solid #ece8de", padding: "16px 18px", borderRadius: "20px 20px 20px 6px", transform: `translateY(${(1 - reply) * 20}px)`, opacity: Math.min(1, reply * 1.5) }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1b1b1b", marginBottom: 12 }}>{done ? "Done ✓ orbit ring applied" : "Rendering your clip…"}</div>
                <div style={{ height: 14, borderRadius: 7, background: "#ece8de", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${bar * 100}%`, background: done ? "#2BB673" : "#D97757", borderRadius: 7 }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 18, color: "#8a857a", fontVariantNumeric: "tabular-nums" }}>{Math.round(bar * 100)}%</div>
              </div>
            )}
          </div>
          {/* input bar */}
          <div style={{ position: "absolute", left: 16, right: 16, bottom: 22, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e3dfd4", borderRadius: 26, padding: "12px 12px 12px 18px" }}>
            <div style={{ flex: 1, fontFamily: "Consolas, monospace", fontSize: 24, color: n && !sent ? "#1b1b1b" : "#a39e92", whiteSpace: "nowrap", overflow: "hidden" }}>
              {sent ? "Reply to Claude…" : n ? CMD.slice(0, n) : "Reply to Claude…"}
              {!sent && n > 0 && Math.floor(f / 7) % 2 === 0 && <span style={{ color: "#D97757" }}>|</span>}
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: n && !sent ? "#D97757" : "#e3dfd4", display: "grid", placeItems: "center", color: "#fff", fontSize: 24, fontWeight: 900 }}>↑</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
