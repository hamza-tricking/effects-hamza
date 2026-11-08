import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Speech bubble: a clean bubble grows out of its tail on the empty wall beside the head.
// Typing dots first, then the words pop in one by one, it floats, then shrinks back into the tail.
const IN = 10;
const DOTS_END = 24;
const OUT = 80;
// one word per line, so the bubble keeps a fixed size
const WORDS: { w: string; accent?: boolean }[] = [{ w: "Claude", accent: true }, { w: "edited" }, { w: "this!" }];

// bubble box on the empty left wall; the tail tip lands beside the cheek (never over the face)
const BOX = { left: 105, top: 450, width: 340, height: 260 };

export const SpeechBubble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: f - IN, fps, config: { damping: 11, stiffness: 160, mass: 0.8 } });
  const shrink = interpolate(f, [OUT, OUT + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.back(1.8)) });
  const s = Math.max(0, grow * (1 - shrink));
  const float = Math.sin((f - IN) / 9) * 6 * grow;
  const tilt = interpolate(grow, [0, 1], [-5, -2]);
  const typing = f >= IN && f < DOTS_END;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <AbsoluteFill style={{ transform: `translateY(${float}px)` }}>
        <div
          style={{
            position: "absolute",
            left: BOX.left,
            top: BOX.top,
            width: BOX.width,
            transform: `scale(${s}) rotate(${tilt}deg)`,
            transformOrigin: `${BOX.width - 15}px ${BOX.height + 70}px`, // the tail tip
            opacity: Math.min(1, s * 2),
            // shadow on the whole shape, so the white tail still reads on a white wall
            filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.30)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
          }}
        >
          {/* tail: curved, from the bubble's bottom-right toward the cheek */}
          <svg width={140} height={90} style={{ position: "absolute", left: BOX.width - 140, top: BOX.height - 12, overflow: "visible" }}>
            <path d="M 0 0 L 80 0 Q 92 48 125 82 Q 40 62 0 0 Z" fill="#FFFFFF" />
          </svg>
          <div
            style={{
              position: "relative",
              background: "#FFFFFF",
              borderRadius: 46,
              padding: "0 44px",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 66,
              lineHeight: 1.02,
              color: "#15161A",
              height: BOX.height, // fixed, so the bubble never jumps between the dots and the words
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            {typing ? (
              <div style={{ display: "flex", gap: 14, padding: "10px 0" }}>
                {[0, 1, 2].map((i) => {
                  const b = Math.sin((f - IN) / 2.2 - i * 0.9);
                  return <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: "#9AA0AC", transform: `translateY(${-Math.max(0, b) * 10}px)`, opacity: 0.5 + 0.5 * Math.max(0, b) }} />;
                })}
              </div>
            ) : (
              WORDS.map((wd, i) => {
                const p = spring({ frame: f - DOTS_END - i * 3, fps, config: { damping: 10, stiffness: 220 } });
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      transform: `translateY(${(1 - p) * 26}px) scale(${0.6 + 0.4 * p})`,
                      opacity: Math.min(1, p * 1.6),
                      color: wd.accent ? "#FF6A2B" : "#15161A",
                    }}
                  >
                    {wd.w}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
