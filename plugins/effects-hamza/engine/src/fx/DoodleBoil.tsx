import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Doodle boil: a hand-drawn white outline traces the person and "boils" (wobbles) every
// few frames, with doodled stars, hearts and sparkles popping around the head.
const IN = 12;
const OUT = 84;

const DOODLES: { d: string; x: number; y: number; delay: number; s: number }[] = [
  // star
  { d: "M50 5 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z", x: 140, y: 330, delay: 0, s: 1.1 },
  // heart
  { d: "M50 88 C20 65 5 48 5 30 C5 15 17 5 30 5 C40 5 47 11 50 18 C53 11 60 5 70 5 C83 5 95 15 95 30 C95 48 80 65 50 88 Z", x: 830, y: 330, delay: 5, s: 1 },
  // sparkle
  { d: "M50 0 Q55 45 100 50 Q55 55 50 100 Q45 55 0 50 Q45 45 50 0 Z", x: 860, y: 640, delay: 9, s: 0.8 },
  // swirl
  { d: "M20 70 C10 40 40 10 65 25 C85 37 75 65 55 62 C40 60 42 42 55 42", x: 110, y: 640, delay: 13, s: 1 },
];

export const DoodleBoil: React.FC = () => {
  const f = useCurrentFrame();
  const on = interpolate(f, [IN, IN + 6, OUT, OUT + 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seed = Math.floor(f / 3); // new wobble every 3 frames = hand-drawn boil
  const w = 6;
  const outline = [`drop-shadow(${w}px 0 0 #fff)`, `drop-shadow(-${w}px 0 0 #fff)`, `drop-shadow(0 ${w}px 0 #fff)`, `drop-shadow(0 -${w}px 0 #fff)`].join(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <Clip />
      {/* outline layer: the white-outlined silhouette, boiled, under the clean person */}
      <AbsoluteFill style={{ opacity: on, filter: "url(#boil)", WebkitMaskImage: "linear-gradient(180deg, #000 74%, transparent 86%)", maskImage: "linear-gradient(180deg, #000 74%, transparent 86%)" }}>
        <Person style={{ filter: outline }} />
      </AbsoluteFill>
      <Person />
      {/* doodles */}
      <AbsoluteFill style={{ filter: "url(#boil)" }}>
        {DOODLES.map((d, i) => {
          const p = interpolate(f, [IN + d.delay, IN + d.delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pop = p < 1 ? 0.4 + 0.8 * p : 1 + 0.06 * Math.sin((f - IN - d.delay) / 3);
          return (
            <svg key={i} width={120} height={120} viewBox="-10 -10 120 120" style={{ position: "absolute", left: d.x, top: d.y, transform: `scale(${pop * d.s}) rotate(${Math.sin(seed + i) * 6}deg)`, opacity: p * on }}>
              <path d={d.d} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }} />
            </svg>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
