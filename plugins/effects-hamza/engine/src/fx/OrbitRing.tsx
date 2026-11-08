import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, HEAD, Person, SERIF } from "./shared";

// Orbit ring: a ring of letters spins around the head, passing behind it and in front of it.
const TEXT = "EFFECTS • HAMZA • ";
const CHARS = TEXT.split("");
const CX = HEAD.x - 40;
const CY = 400; // around the cap, above the eyes
const RX = 400;
const RY = 78;

const IN = [6, 20];
const OUT = [82, 96];

type Glyph = { ch: string; x: number; y: number; depth: number; scale: number };

const useGlyphs = (): { glyphs: Glyph[]; alpha: number; rx: number; ry: number } => {
  const f = useCurrentFrame();
  const grow = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.4)) });
  const leave = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const spin = interpolate(f, [IN[0], OUT[1]], [0, Math.PI * 2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const rx = RX * (0.4 + 0.6 * grow) * (1 + leave * 0.5);
  const ry = RY * (0.4 + 0.6 * grow) * (1 + leave * 0.5);
  const glyphs = CHARS.map((ch, i) => {
    // minus: letters run left-to-right on the front half, so the word reads correctly
    const t = spin - (i / CHARS.length) * Math.PI * 2;
    const depth = Math.sin(t); // > 0 means in front of the head
    return {
      ch,
      x: CX + Math.cos(t) * rx,
      y: CY + depth * ry,
      depth,
      scale: 0.75 + 0.35 * ((depth + 1) / 2),
    };
  });
  return { glyphs, alpha: grow * (1 - leave), rx, ry };
};

// Thin glowing ring line: back half behind the person, front half in front.
const Line: React.FC<{ rx: number; ry: number; alpha: number; front: boolean }> = ({ rx, ry, alpha, front }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path
        d={front ? `M ${CX - rx} ${CY + 30} A ${rx} ${ry} 0 0 0 ${CX + rx} ${CY + 30}` : `M ${CX - rx} ${CY + 30} A ${rx} ${ry} 0 0 1 ${CX + rx} ${CY + 30}`}
        fill="none"
        stroke="rgba(255,236,170,0.9)"
        strokeWidth={front ? 3 : 2}
        style={{ filter: "drop-shadow(0 0 8px rgba(255,220,140,0.9))" }}
        opacity={alpha * (front ? 0.8 : 0.4)}
      />
    </svg>
  </AbsoluteFill>
);

const Ring: React.FC<{ glyphs: Glyph[]; alpha: number; front: boolean }> = ({ glyphs, alpha, front }) => (
  <AbsoluteFill>
    {glyphs
      .filter((g) => (front ? g.depth >= 0 : g.depth < 0))
      .map((g, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: g.x,
            top: g.y,
            transform: `translate(-50%, -50%) scale(${g.scale})`,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 62,
            color: "#FFFFFF",
            opacity: alpha * (front ? 1 : 0.55),
            textShadow: front ? "0 0 18px rgba(255,236,170,0.85), 0 4px 10px rgba(0,0,0,0.35)" : "0 0 10px rgba(255,236,170,0.4)",
            letterSpacing: 0,
          }}
        >
          {g.ch}
        </div>
      ))}
  </AbsoluteFill>
);

export const OrbitRing: React.FC = () => {
  const { glyphs, alpha, rx, ry } = useGlyphs();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <Line rx={rx} ry={ry} alpha={alpha} front={false} />
      <Ring glyphs={glyphs} alpha={alpha} front={false} />
      <Person />
      <Line rx={rx} ry={ry} alpha={alpha} front />
      <Ring glyphs={glyphs} alpha={alpha} front />
    </AbsoluteFill>
  );
};
