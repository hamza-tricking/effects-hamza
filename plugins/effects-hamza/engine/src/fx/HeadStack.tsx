import React from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, useCurrentFrame } from "remotion";
import { Clip, PERSON } from "./shared";

// Head stack (echo totem): delayed copies of you rise up behind you, each a few frames late,
// smaller, higher and tinted in a glowing colour - a stacked motion echo that follows your
// movement - then they sink back into you.
const IN = [12, 30];
const OUT = [70, 88];
// hue: rotation applied after sepia (sepia sits near orange) to tint each echo
const ECHOES = [
  { delay: 4, dy: -210, s: 0.86, hue: -5, tint: "rgba(255,138,61,0.9)" },
  { delay: 8, dy: -400, s: 0.74, hue: 235, tint: "rgba(199,125,255,0.9)" },
  { delay: 12, dy: -570, s: 0.63, hue: 125, tint: "rgba(124,245,214,0.9)" },
];

const Echo: React.FC<{ delay: number; style: React.CSSProperties; tint: string; hue: number }> = ({ delay, style, tint, hue }) => (
  <Sequence from={delay} layout="none">
    <AbsoluteFill style={style}>
      <OffthreadVideo src={PERSON} transparent muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: `grayscale(1) brightness(1.25) sepia(1) hue-rotate(${hue}deg) saturate(3.2) drop-shadow(0 0 26px ${tint})` }} />
    </AbsoluteFill>
  </Sequence>
);

export const HeadStack: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.3)) });
  const b = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const k = Math.max(0, a * (1 - b));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip style={{ filter: k > 0.01 ? `brightness(${1 - 0.3 * k})` : undefined }} />
      {[...ECHOES].reverse().map((e, i) => (
        <Echo
          key={i}
          delay={e.delay}
          tint={e.tint}
          hue={e.hue}
          style={{
            transform: `translateY(${e.dy * k}px) scale(${1 - (1 - e.s) * k})`,
            transformOrigin: "55% 40%",
            opacity: Math.min(1, k * 1.4) * 0.92,
            WebkitMaskImage: "linear-gradient(180deg, #000 30%, transparent 62%)",
            maskImage: "linear-gradient(180deg, #000 30%, transparent 62%)",
          }}
        />
      ))}
      <AbsoluteFill>
        <OffthreadVideo src={PERSON} transparent muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
