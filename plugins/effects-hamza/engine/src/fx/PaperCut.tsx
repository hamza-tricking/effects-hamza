import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, Person, SANS, SERIF } from "./shared";

// Paper cut: you become a white-bordered paper cutout on a torn-paper collage, with
// ransom-note letters and tape. Everything jitters every 3 frames like stop-motion.
const IN = 12;
const OUT = 84;

const torn = (seed: string, x: number, y: number, w: number, h: number) => {
  const pts: string[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) pts.push(`${x + (w * i) / n}px ${y + (random(`${seed}t${i}`) - 0.5) * 26}px`);
  for (let i = 0; i <= n; i++) pts.push(`${x + w + (random(`${seed}r${i}`) - 0.5) * 22}px ${y + (h * i) / n}px`);
  for (let i = n; i >= 0; i--) pts.push(`${x + (w * i) / n}px ${y + h + (random(`${seed}b${i}`) - 0.5) * 26}px`);
  for (let i = n; i >= 0; i--) pts.push(`${x + (random(`${seed}l${i}`) - 0.5) * 22}px ${y + (h * i) / n}px`);
  return `polygon(${pts.join(", ")})`;
};

const PIECES = [
  { c: "#F2A7B8", x: -40, y: 180, w: 620, h: 560, r: -6 },
  { c: "#A9C8F0", x: 520, y: 120, w: 620, h: 640, r: 5 },
  { c: "#F6D35B", x: -60, y: 760, w: 700, h: 520, r: 4 },
  { c: "#9ED9B8", x: 520, y: 820, w: 640, h: 560, r: -4 },
  { c: "#F7F1E3", x: 120, y: 1350, w: 860, h: 520, r: -2 },
];

const LETTERS = [
  { ch: "P", bg: "#111", fg: "#fff", font: SERIF },
  { ch: "A", bg: "#fff", fg: "#111", font: SANS },
  { ch: "P", bg: "#E8423F", fg: "#fff", font: SANS },
  { ch: "E", bg: "#F6D35B", fg: "#111", font: SERIF },
  { ch: "R", bg: "#fff", fg: "#2B50D8", font: SERIF },
  { ch: " ", bg: "transparent", fg: "#000", font: SANS },
  { ch: "C", bg: "#2B50D8", fg: "#fff", font: SANS },
  { ch: "U", bg: "#fff", fg: "#111", font: SERIF },
  { ch: "T", bg: "#111", fg: "#F6D35B", font: SANS },
];

export const PaperCut: React.FC = () => {
  const f = useCurrentFrame();
  const on = f >= IN && f < OUT;
  const step = Math.floor(f / 3); // stop-motion
  const j = (k: string, a: number) => (random(`${k}-${step}`) - 0.5) * a;
  const w = 10;
  const border = [`drop-shadow(${w}px 0 0 #fff)`, `drop-shadow(-${w}px 0 0 #fff)`, `drop-shadow(0 ${w}px 0 #fff)`, `drop-shadow(0 -${w}px 0 #fff)`, "drop-shadow(0 18px 24px rgba(0,0,0,0.35))"].join(" ");
  if (!on) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Clip />
      </AbsoluteFill>
    );
  }
  const t = f - IN;
  const pop = interpolate(t, [0, 4], [0.86, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#D9C7A7" }}>
      {/* muted audio source stays the clip */}
      <AbsoluteFill style={{ opacity: 0 }}>
        <Clip />
      </AbsoluteFill>
      {/* paper texture */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0 3px, transparent 3px 7px)" }} />
      {PIECES.map((p, i) => (
        <AbsoluteFill key={i} style={{ background: p.c, clipPath: torn(`p${i}`, p.x, p.y, p.w, p.h), transform: `rotate(${p.r + j(`pr${i}`, 1.2)}deg)`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))" }} />
      ))}
      {/* scribbles */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translate(${j("sx", 4)}px, ${j("sy", 4)}px)` }}>
        <path d="M70 330 q40 -60 80 0 t80 0 t80 0" stroke="#E8423F" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M840 300 l60 60 M900 300 l-60 60" stroke="#2B50D8" strokeWidth={10} strokeLinecap="round" />
        <circle cx={900} cy={760} r={55} stroke="#111" strokeWidth={7} fill="none" strokeDasharray="12 10" />
      </svg>
      <AbsoluteFill style={{ transform: `scale(${pop * 0.92}) rotate(${j("pr", 1.4)}deg) translate(${j("px", 6)}px, ${j("py", 6)}px)`, transformOrigin: "50% 60%" }}>
        <Person style={{ filter: border }} />
      </AbsoluteFill>
      {/* tape on the shoulders */}
      {[{ x: 170, y: 1010, r: -28 }, { x: 800, y: 980, r: 24 }].map((tp, i) => (
        <div key={i} style={{ position: "absolute", left: tp.x, top: tp.y, width: 150, height: 44, background: "rgba(245,240,225,0.75)", transform: `rotate(${tp.r + j(`t${i}`, 3)}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
      ))}
      {/* ransom letters */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center", gap: 8 }}>
        {LETTERS.map((l, i) => (
          <div
            key={i}
            style={{
              width: l.ch === " " ? 30 : 92,
              height: 112,
              display: "grid",
              placeItems: "center",
              background: l.bg,
              color: l.fg,
              fontFamily: l.font,
              fontWeight: 900,
              fontSize: 84,
              transform: `rotate(${(random(`lr${i}`) - 0.5) * 16 + j(`l${i}`, 4)}deg) translateY(${(random(`ly${i}`) - 0.5) * 20}px) scale(${interpolate(t, [i, i + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              boxShadow: l.ch === " " ? "none" : "0 4px 8px rgba(0,0,0,0.25)",
            }}
          >
            {l.ch.trim()}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
