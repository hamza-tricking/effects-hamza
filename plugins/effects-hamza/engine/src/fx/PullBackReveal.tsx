import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Pull-back reveal: the shot pulls back to reveal it is playing inside a Claude-style app
// window, with a task list ticking off and a render bar filling beside it.
const PULL = [12, 34];
// final rect of the video preview inside the window
const T = { x: 440, y: 470, w: 594, h: 1056 };
const TASKS = [
  { t: "Cut silences", at: 38 },
  { t: "Add captions", at: 48 },
  { t: "Apply orbit ring", at: 58 },
  { t: "Mix sound", at: 68 },
];

export const PullBackReveal: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = interpolate(f, PULL, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const s = 1 + (T.w / 1080 - 1) * k;
  const x = T.x * k;
  const y = T.y * k;
  const ui = interpolate(f, [PULL[0] + 8, PULL[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = interpolate(f, [36, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E5DC" }}>
      {/* app window */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 330,
          width: 1020,
          height: 1240,
          borderRadius: 34,
          background: "#F7F5F0",
          boxShadow: "0 40px 100px rgba(0,0,0,0.25)",
          opacity: ui,
          transform: `scale(${1.08 - 0.08 * ui})`,
          fontFamily: SANS,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 76, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: "1px solid #e4dfd3" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />)}
          <div style={{ marginLeft: 18, fontWeight: 700, fontSize: 26, color: "#3a372f" }}>Claude · editing reel.mp4</div>
        </div>
        <div style={{ position: "absolute", left: 26, top: 110, width: 350 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#D97757", color: "#fff", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 900 }}>✳</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#1b1b1b" }}>Working on</div>
          </div>
          {TASKS.map((tk, i) => {
            const done = f >= tk.at;
            const tick = spring({ frame: f - tk.at, fps, config: { damping: 10, stiffness: 240 } });
            const active = !done && (i === 0 || f >= TASKS[i - 1].at);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderBottom: "1px solid #ebe6da", fontSize: 30, color: done ? "#1b1b1b" : "#8b867b", fontWeight: done ? 700 : 500 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, flex: "none", display: "grid", placeItems: "center", background: done ? "#2BB673" : "transparent", border: done ? "none" : "3px solid #cfc9bc", transform: `scale(${done ? 0.6 + 0.4 * tick : 1})` }}>
                  {done && <span style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>✓</span>}
                  {active && <div style={{ width: 16, height: 16, borderRadius: 8, background: "#D97757", opacity: 0.5 + 0.5 * Math.sin(f / 3) }} />}
                </div>
                {tk.t}
              </div>
            );
          })}
          <div style={{ marginTop: 36, fontSize: 24, color: "#8b867b", display: "flex", justifyContent: "space-between" }}>
            <span>Rendering</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(bar * 100)}%</span>
          </div>
          <div style={{ marginTop: 10, height: 16, borderRadius: 8, background: "#e4dfd3", overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", background: bar >= 1 ? "#2BB673" : "#D97757" }} />
          </div>
        </div>
      </div>
      {/* the shot, pulling back into the preview slot */}
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: "0 0" }}>
        <div style={{ width: 1080, height: 1920, borderRadius: 40 * k / s, overflow: "hidden", boxShadow: k > 0.5 ? "0 20px 50px rgba(0,0,0,0.25)" : "none" }}>
          <Clip />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
