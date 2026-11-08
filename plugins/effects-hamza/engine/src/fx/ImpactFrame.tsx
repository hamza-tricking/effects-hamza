import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, Person, SANS } from "./shared";

// Impact frame: for a few frames the shot turns into a black-and-white manga ink panel
// with radial speed lines and a huge word, then snaps back. Inverted flash in and out.
const HIT = 22;
const LEN = 9;

const Lines: React.FC<{ seed: number }> = ({ seed }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 70 }, (_, i) => {
      const a = (i / 70) * Math.PI * 2 + random(`a${seed}-${i}`) * 0.05;
      const r0 = 420 + random(`r${seed}-${i}`) * 260;
      const w = 4 + random(`w${seed}-${i}`) * 16;
      const cx = 600;
      const cy = 620;
      const x1 = cx + Math.cos(a) * r0;
      const y1 = cy + Math.sin(a) * r0;
      const x2 = cx + Math.cos(a) * 2200;
      const y2 = cy + Math.sin(a) * 2200;
      const nx = -Math.sin(a) * w;
      const ny = Math.cos(a) * w;
      return <polygon key={i} points={`${x1},${y1} ${x2 + nx},${y2 + ny} ${x2 - nx},${y2 - ny}`} fill="#000" />;
    })}
  </svg>
);

export const ImpactFrame: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - HIT;
  const on = t >= 0 && t < LEN;
  const flash = t === 0 || t === LEN;
  const jitter = on ? (random(`j${f}`) - 0.5) * 14 : 0;
  const wordS = on ? interpolate(t, [0, 2, LEN], [1.4, 1, 1.04]) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {on && (
        <AbsoluteFill style={{ background: "#F5F1E8", transform: `translate(${jitter}px, ${-jitter}px)` }}>
          <Lines seed={Math.floor(t / 2)} />
          <Person style={{ filter: "grayscale(1) contrast(6) brightness(1.15)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", transform: `scale(${wordS}) rotate(-4deg)` }}>
            <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 230, letterSpacing: -8, color: "#000", WebkitTextStroke: "6px #F5F1E8", paintOrder: "stroke" } as React.CSSProperties}>
              IMPACT
            </span>
          </div>
        </AbsoluteFill>
      )}
      {flash && <AbsoluteFill style={{ background: "#fff", mixBlendMode: "difference" }} />}
    </AbsoluteFill>
  );
};
