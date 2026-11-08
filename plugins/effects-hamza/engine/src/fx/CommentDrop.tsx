import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Comment drop (glass): frosted comment cards drop from above one by one and stack under the chin,
// pushing the older ones down. Each has a gradient avatar ring, handle, text and a heart whose
// count ticks up when it lands.
const OUT = 86;
const COMMENTS = [
  { at: 10, user: "sara.edits", text: "how did you do this?? 😳", likes: 1284, ring: ["#FEDA75", "#D62976"] },
  { at: 26, user: "yassine.ai", text: "Claude is actually crazy 🔥", likes: 3921, ring: ["#7CF5D6", "#6C8CFF"] },
  { at: 42, user: "noor.films", text: "I need this tool asap", likes: 862, ring: ["#FFB15C", "#C77DFF"] },
];
const CARD_H = 132;
const GAP = 16;

export const CommentDrop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1010, opacity: 1 - out, transform: `translateY(${out * 40}px)` }}>
        {COMMENTS.map((c, i) => {
          if (f < c.at) return null;
          const drop = spring({ frame: f - c.at, fps, config: { damping: 12, stiffness: 170 } });
          // newer comments sit on top: slot = number of comments that arrived after this one
          const newer = COMMENTS.filter((o) => o.at > c.at && f >= o.at);
          const push = newer.reduce((acc, o) => acc + spring({ frame: f - o.at, fps, config: { damping: 14, stiffness: 160 } }), 0);
          const y = (1 - drop) * -320 + push * (CARD_H + GAP);
          const likeT = interpolate(f, [c.at + 8, c.at + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const heart = spring({ frame: f - c.at - 8, fps, config: { damping: 7, stiffness: 260 } });
          const fade = push > 1.6 ? 1 - (push - 1.6) * 1.5 : 1;
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${y}px) rotate(${(1 - drop) * (i % 2 ? 4 : -4)}deg) scale(${1 - push * 0.04})`, opacity: Math.min(1, drop * 1.6) * Math.max(0, fade), zIndex: 10 + i }}>
              <div style={{ ...glass("light", 34), height: CARD_H, display: "flex", alignItems: "center", gap: 20, padding: "0 26px" }}>
                <div style={{ width: 84, height: 84, borderRadius: 42, padding: 4, flex: "none", background: `linear-gradient(135deg, ${c.ring[0]}, ${c.ring[1]})` }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg,#2a2d36,#4b5160)", border: "3px solid rgba(255,255,255,0.7)", display: "grid", placeItems: "center", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 32 }}>{c.user[0].toUpperCase()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontFamily: SANS, color: "#fff" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, opacity: 0.8 }}>{c.user} <span style={{ fontWeight: 400, opacity: 0.7 }}>· now</span></div>
                  <div style={{ fontSize: 40, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.text}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: "none", fontFamily: SANS }}>
                  <svg width={48} height={48} viewBox="0 0 24 24" style={{ transform: `scale(${f >= c.at + 8 ? 0.6 + 0.4 * heart : 1})`, filter: likeT > 0 ? "drop-shadow(0 0 10px rgba(255,64,96,0.8))" : "none" }}>
                    <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.5C11.8 6.2 13.3 5 15.4 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z" fill={likeT > 0 ? "#FF4060" : "none"} stroke={likeT > 0 ? "#FF4060" : "#fff"} strokeWidth={1.8} />
                  </svg>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{Math.round(c.likes * likeT).toLocaleString("en-US")}</span>
                </div>
                <Sheen frame={f} start={c.at + 4} dur={14} strength={0.45} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
