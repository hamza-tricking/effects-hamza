import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Word morph (liquid): inside a frosted glass card, the word "SLOW" melts like liquid metal and
// re-forms as "FAST" - a gooey threshold filter blends the two shapes - then it gets a glowing
// gradient and a sheen.
const IN = 8;
const MELT = [26, 46];
const OUT = 84;

export const WordMorph: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const m = interpolate(f, MELT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const melting = m > 0 && m < 1;
  const blurA = Math.min(m * 2, 1) * 22;
  const blurB = Math.min((1 - m) * 2, 1) * 22;
  const done = f >= MELT[1];
  const land = spring({ frame: f - MELT[1], fps, config: { damping: 8, stiffness: 240 } });
  const word = (t: string, op: number, bl: number, drip: number) => (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: op, filter: bl > 0.05 ? `blur(${bl}px)` : undefined, transform: `scaleY(${1 + drip * 0.25}) translateY(${drip * 20}px)` }}>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: -6, color: "#fff" }}>{t}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="goo">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -11" />
          </filter>
        </defs>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, display: "flex", justifyContent: "center", opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 120 + out * 40}px) scale(${done ? 1 + 0.05 * Math.sin(Math.min(1, land) * Math.PI) : 1})` }}>
        <div style={{ ...glass("light", 56), width: 760, height: 300 }}>
          {/* liquid layer: blurred words + alpha threshold = gooey morph */}
          <div style={{ position: "absolute", inset: 0, filter: melting || !done ? "url(#goo)" : undefined }}>
            {word("SLOW", 1 - m, blurA, m)}
            {word("FAST", m, blurB, -(1 - m) * 0.5)}
          </div>
          {/* glow gradient once it has set */}
          {done && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: Math.min(1, land) }}>
              <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: -6, background: "linear-gradient(180deg,#FFFFFF,#9AB8FF 55%,#6C5CFF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 22px rgba(120,130,255,0.8))" }}>FAST</span>
            </div>
          )}
          <Sheen frame={f} start={MELT[1] + 2} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
