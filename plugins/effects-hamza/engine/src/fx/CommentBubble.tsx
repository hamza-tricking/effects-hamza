import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Comment bubble: an Instagram-style comment card rises under the chin, the keyword types in
// a gradient, it posts, a heart pops with sparkles, and the creator's reply slides in.
const IN = 8;
const WORD = "tool";
const TYPE = [16, 30];
const POST = 34;
const HEART = 44;
const REPLY = 54;
const OUT = 88;

const IG = "linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 55%, #962FBF 80%, #4F5BD5 100%)";

const Avatar: React.FC<{ letter: string; bg: string; ring?: boolean; size?: number }> = ({ letter, bg, ring, size = 76 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, padding: ring ? 4 : 0, background: ring ? IG : "transparent", flex: "none" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: ring ? "3px solid #fff" : "none", background: bg, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.42, fontFamily: SANS }}>
      {letter}
    </div>
  </div>
);

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      display: "flex",
      gap: 22,
      alignItems: "flex-start",
      padding: "24px 28px",
      borderRadius: 34,
      background: "rgba(255,255,255,0.94)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.30), 0 4px 14px rgba(0,0,0,0.12)",
      fontFamily: SANS,
      color: "#111",
      ...style,
    }}
  >
    {children}
  </div>
);

export const CommentBubble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f - IN, fps, config: { damping: 15, stiffness: 150 } });
  const leave = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const n = Math.floor(interpolate(f, TYPE, [0, WORD.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const posted = f >= POST;
  const postPop = spring({ frame: f - POST, fps, config: { damping: 9, stiffness: 240 } });
  const heart = spring({ frame: f - HEART, fps, config: { damping: 7, stiffness: 260 } });
  const liked = f >= HEART;
  const reply = spring({ frame: f - REPLY, fps, config: { damping: 15, stiffness: 150 } });
  const caret = !posted && Math.floor(f / 7) % 2 === 0;
  const sparkT = interpolate(f, [HEART, HEART + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {/* soft shade at the bottom so the cards read */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)", opacity: rise * (1 - leave) }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1060, display: "flex", flexDirection: "column", gap: 18, transform: `translateY(${leave * 120}px)`, opacity: 1 - leave }}>
        {/* the viewer's comment */}
        <Card style={{ transform: `translateY(${(1 - rise) * 200}px) scale(${posted ? 1 + 0.035 * Math.sin(Math.min(1, postPop) * Math.PI) : 1})`, opacity: Math.min(1, rise * 1.4) }}>
          <Avatar letter="Y" bg="linear-gradient(135deg,#6C7BFF,#9B6CFF)" ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#111" }}>
              you <span style={{ fontWeight: 500, color: "#8A8F99", marginLeft: 8 }}>{posted ? "now" : "typing…"}</span>
            </div>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginTop: 4, letterSpacing: -1, minHeight: 80 }}>
              <span style={{ background: IG, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{WORD.slice(0, n)}</span>
              {caret && <span style={{ color: "#D62976", fontWeight: 300 }}>|</span>}
            </div>
          </div>
          {/* like heart with sparkles */}
          <div style={{ position: "relative", width: 64, height: 64, marginTop: 30, flex: "none" }}>
            {liked &&
              Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2;
                const r = 20 + sparkT * 46;
                return <div key={i} style={{ position: "absolute", left: 32 + Math.cos(a) * r - 5, top: 32 + Math.sin(a) * r - 5, width: 10, height: 10, borderRadius: 5, background: i % 2 ? "#FA7E1E" : "#D62976", opacity: 1 - sparkT }} />;
              })}
            <svg width={64} height={64} viewBox="0 0 24 24" style={{ transform: `scale(${liked ? 0.6 + 0.4 * heart : 1})` }}>
              <path
                d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.5C11.8 6.2 13.3 5 15.4 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z"
                fill={liked ? "#FF3040" : "none"}
                stroke={liked ? "#FF3040" : "#8A8F99"}
                strokeWidth={1.8}
              />
            </svg>
          </div>
        </Card>
        {/* the creator's reply */}
        <Card
          style={{
            marginLeft: 90,
            padding: "20px 26px",
            transform: `translateX(${(1 - reply) * 120}px)`,
            opacity: f >= REPLY ? Math.min(1, reply * 1.5) : 0,
          }}
        >
          <Avatar letter="H" bg="#15161A" size={62} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              hamza <span style={{ display: "inline-block", width: 24, height: 24, borderRadius: 12, background: "#3897F0", color: "#fff", fontSize: 16, textAlign: "center", lineHeight: "24px", marginLeft: 6 }}>✓</span>
              <span style={{ fontWeight: 500, color: "#8A8F99", marginLeft: 10 }}>Creator</span>
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>Sent! Check your DMs 📩</div>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};
