import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Clip } from "./shared";

// Sketch words: a glowing marker hand-draws "so easy!" stroke by stroke on the wall beside the
// head, then fills in, underlines itself with a swoosh, and draws an arrow pointing at you.
// The drawing wobbles slightly every 3 frames like a real hand-drawn animation.
const IN = 10;
const WRITE = [10, 40];
const FILL = [38, 46];
const UNDER = [42, 52];
const ARROW = [48, 58];
const OUT = 84;
const HAND = "'Segoe Print', 'Comic Sans MS', cursive";

export const SketchWords: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, WRITE, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fill = interpolate(f, FILL, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const u = interpolate(f, UNDER, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ar = interpolate(f, ARROW, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boil = Math.floor(f / 3);
  const wob = (k: number) => Math.sin(boil * 1.7 + k) * 1.2;
  const glow = "drop-shadow(0 0 10px rgba(255,190,90,0.9)) drop-shadow(0 6px 12px rgba(0,0,0,0.35))";
  if (f < IN) return <AbsoluteFill style={{ backgroundColor: "#000" }}><Clip /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: glow }}>
        <defs>
          <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD27A" />
            <stop offset="100%" stopColor="#FF6A2B" />
          </linearGradient>
        </defs>
        <g transform={`translate(${wob(1)} ${wob(2)}) rotate(-8 260 470)`}>
          {["so", "easy!"].map((t, i) => (
            <text
              key={t}
              x={70}
              y={440 + i * 175}
              fontFamily={HAND}
              fontWeight={700}
              fontSize={i ? 175 : 140}
              fill="url(#ink)"
              fillOpacity={fill}
              stroke="url(#ink)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1800}
              strokeDashoffset={1800 * (1 - Math.min(1, Math.max(0, w * 2 - i)))}
            >
              {t}
            </text>
          ))}
          {/* swoosh underline */}
          <path d="M 70 660 C 180 695, 330 645, 470 675" fill="none" stroke="url(#ink)" strokeWidth={14} strokeLinecap="round" strokeDasharray={430} strokeDashoffset={430 * (1 - u)} />
        </g>
        {/* arrow toward the person */}
        <g transform={`translate(${wob(3)} ${wob(4)})`}>
          <path d="M 300 700 C 340 800, 400 840, 470 850" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - ar)} />
          {ar > 0.95 && <path d="M 440 820 L 474 852 L 432 870" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
