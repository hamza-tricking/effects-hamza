import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Chat typing (glass): a frosted chat window rises under the chin. The prompt types in the input,
// flies up as a dark glass bubble, a shimmering "thinking" line appears, then Claude's reply
// streams in token by token behind a glowing caret.
const IN = 6;
const PROMPT = "edit my reel in one prompt";
const TYPE = [12, 32];
const SEND = 35;
const THINK = [38, 46];
const REPLY = "Done! Cuts, captions, zooms and sound ✨";
const STREAM = [46, 74];
const OUT = 86;

export const ChatTyping: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f - IN, fps, config: { damping: 15, stiffness: 140 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = Math.floor(interpolate(f, TYPE, [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sent = f >= SEND;
  const fly = spring({ frame: f - SEND, fps, config: { damping: 14, stiffness: 190 } });
  const thinking = f >= THINK[0] && f < THINK[1];
  const tokens = REPLY.split(" ");
  const shown = Math.floor(interpolate(f, STREAM, [0, tokens.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const streaming = f >= STREAM[0] && shown < tokens.length;
  const caret = Math.floor(f / 6) % 2 === 0;
  const shimmerX = ((f * 5) % 160) - 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 50, right: 50, top: 960, opacity: Math.min(1, rise * 1.4) * (1 - out), transform: `translateY(${(1 - rise) * 260 + out * 60}px) scale(${0.94 + 0.06 * rise})` }}>
        <div style={{ ...glass("light", 46), padding: "22px 24px 22px" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg,#E8916C,#C9643F)", display: "grid", placeItems: "center", color: "#fff", fontSize: 30, fontWeight: 900, boxShadow: "0 0 18px rgba(232,145,108,0.6)" }}>✳</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: "#fff" }}>Claude</div>
            <div style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: 7, background: "#4FE3C1", boxShadow: "0 0 12px #4FE3C1" }} />
          </div>
          {/* messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "18px 0", minHeight: 200 }}>
            {sent && (
              <div style={{ ...glass("dark", 28), alignSelf: "flex-end", maxWidth: "82%", padding: "16px 24px", fontFamily: SANS, fontSize: 36, fontWeight: 700, color: "#fff", borderBottomRightRadius: 8, transform: `translateY(${(1 - fly) * 120}px) scale(${0.8 + 0.2 * fly})`, transformOrigin: "100% 100%" }}>
                {PROMPT}
              </div>
            )}
            {thinking && (
              <div style={{ alignSelf: "flex-start", fontFamily: SANS, fontSize: 32, fontWeight: 700, ...gradText(`linear-gradient(90deg, rgba(255,255,255,0.35) ${shimmerX - 20}%, #fff ${shimmerX}%, rgba(255,255,255,0.35) ${shimmerX + 20}%)`) }}>
                Thinking…
              </div>
            )}
            {f >= STREAM[0] && (
              <div style={{ alignSelf: "flex-start", maxWidth: "92%", fontFamily: SANS, fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                {tokens.slice(0, shown).map((t, i) => (
                  <span key={i} style={{ opacity: i === shown - 1 ? 0.75 : 1 }}>{t} </span>
                ))}
                {streaming && caret && <span style={{ display: "inline-block", width: 18, height: 40, borderRadius: 4, background: "#FFB15C", verticalAlign: "-6px", boxShadow: "0 0 14px rgba(255,177,92,0.9)" }} />}
              </div>
            )}
          </div>
          {/* input */}
          <div style={{ ...glass("dark", 999), display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 26px" }}>
            <div style={{ flex: 1, fontFamily: SANS, fontSize: 32, color: !sent && n ? "#fff" : "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden" }}>
              {!sent && n ? PROMPT.slice(0, n) : "Message Claude…"}
              {!sent && n > 0 && caret && <span style={{ color: "#FFB15C" }}>|</span>}
            </div>
            <div style={{ width: 62, height: 62, borderRadius: 31, display: "grid", placeItems: "center", background: !sent && n ? "linear-gradient(135deg,#FFB15C,#FF7A3D)" : "rgba(255,255,255,0.18)", boxShadow: !sent && n ? "0 0 20px rgba(255,140,60,0.7)" : "none", color: "#fff", fontSize: 32, fontWeight: 900 }}>↑</div>
          </div>
          <Sheen frame={f} start={IN + 6} dur={18} strength={0.4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
