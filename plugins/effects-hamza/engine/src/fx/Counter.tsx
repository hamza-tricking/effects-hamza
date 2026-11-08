import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Counter: an odometer on the chest (under the chin) rolls up to 1,000,000 with motion blur
// on the spinning digits, lands with a bounce, and a "VIEWS" label pops under it.
const TARGET = 1000000;
const RUN = [12, 50];
const OUT = [84, 94];
const DIGIT_H = 170;

export const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(f, RUN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.poly(4)) });
  const value = f >= RUN[1] ? TARGET : t * TARGET;
  const speed = interpolate(f, [RUN[0], RUN[0] + 6, RUN[1] - 14, RUN[1]], [0, 1, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const appear = spring({ frame: f - RUN[0] + 4, fps, config: { damping: 14, stiffness: 140 } });
  const land = spring({ frame: f - RUN[1], fps, config: { damping: 8, stiffness: 220 } });
  const out = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // fixed-width odometer: always 7 digits, leading zeros dimmed
  const digits = Math.floor(value).toString().padStart(String(TARGET).length, "0");
  const text = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const firstReal = text.search(/[1-9]/);
  const bounce = f >= RUN[1] ? 1 + 0.07 * Math.sin(Math.min(1, land) * Math.PI) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {/* soft dark band so the white digits read */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0) 80%)", opacity: appear * (1 - out) }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1010,
          display: "flex",
          justifyContent: "center",
          opacity: appear * (1 - out),
          transform: `translateY(${(1 - appear) * 60 - out * 40}px) scale(${bounce})`,
        }}
      >
        {text.split("").map((ch, i) => {
          const isDigit = /\d/.test(ch);
          return (
            <div key={i} style={{ height: DIGIT_H, overflow: "hidden", width: ch === "," ? 44 : 108, textAlign: "center", opacity: firstReal === -1 || i < firstReal ? 0.35 : 1 }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 180,
                  lineHeight: `${DIGIT_H}px`,
                  color: "#fff",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: -4,
                  textShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  filter: isDigit ? `blur(${speed * 5}px)` : "none",
                  transform: isDigit ? `scaleY(${1 + speed * 0.25})` : "none",
                }}
              >
                {ch}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1196,
          display: "flex",
          justifyContent: "center",
          opacity: (f >= RUN[1] ? Math.min(1, land) : 0) * (1 - out),
          transform: `scale(${f >= RUN[1] ? 0.6 + 0.4 * Math.min(1, land) : 0.6})`,
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 42, letterSpacing: 12, color: "#111", background: "#FFD60A", padding: "10px 26px 10px 38px", borderRadius: 999 }}>VIEWS</div>
      </div>
    </AbsoluteFill>
  );
};
