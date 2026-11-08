import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, SANS, SERIF } from "./shared";

// Paper tear: the video starts as a newspaper front page, which rips down the middle
// and the two halves fly apart to reveal the live shot.
const RIP = 20; // frame the tear starts
const OPEN = 40; // frame the halves are gone

const STEP = 64;
const EDGE: [number, number][] = Array.from({ length: Math.ceil(1920 / STEP) + 1 }, (_, i) => {
  const y = Math.min(i * STEP, 1920);
  const x = 540 + (random(`tear-${i}`) - 0.5) * 90 + Math.sin(i * 0.9) * 22;
  return [x, y];
});
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x}px ${y}px`).join(", ");
const LEFT_CLIP = `polygon(0px 0px, ${pts(EDGE)}, 0px 1920px)`;
const RIGHT_CLIP = `polygon(1080px 0px, ${pts(EDGE)}, 1080px 1920px)`;
// White torn-paper fibre: the same edge pushed a few pixels into the gap, with its own jitter.
const fibre = (dir: number): [number, number][] =>
  EDGE.map(([x, y], i) => [x + dir * (7 + random(`fibre-${dir}-${i}`) * 9), y]);
const LEFT_FIBRE = `polygon(0px 0px, ${pts(fibre(1))}, 0px 1920px)`;
const RIGHT_FIBRE = `polygon(1080px 0px, ${pts(fibre(-1))}, 1080px 1920px)`;

const Lines: React.FC<{ n: number; width: number }> = ({ n, width }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ height: 9, width: i === n - 1 ? width * 0.6 : width, background: "#B9B0A0", borderRadius: 2 }} />
    ))}
  </div>
);

const Page: React.FC = () => (
  <AbsoluteFill style={{ background: "#F2EBDD", padding: "250px 70px 0", fontFamily: SERIF, color: "#1C1A16" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 22, letterSpacing: 3, borderBottom: "2px solid #1C1A16", paddingBottom: 10 }}>
      <span>VOL. 01</span>
      <span>SATURDAY EDITION</span>
      <span>$1.00</span>
    </div>
    <div style={{ fontSize: 108, textAlign: "center", fontWeight: 700, margin: "18px 0 6px", letterSpacing: -2 }}>The Daily Reel</div>
    <div style={{ borderTop: "6px double #1C1A16", margin: "4px 0 26px" }} />
    <div style={{ fontSize: 96, lineHeight: 1, fontWeight: 700, textAlign: "center", letterSpacing: -1 }}>AI VIDEO EFFECTS</div>
    <div style={{ fontSize: 40, fontStyle: "italic", textAlign: "center", margin: "16px 0 30px" }}>one command each, built by Claude.</div>
    <div style={{ display: "flex", gap: 34 }}>
      <div style={{ width: 300, paddingTop: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 2, marginBottom: 14 }}>INSIDE</div>
        <Lines n={14} width={300} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ width: "100%", height: 560, overflow: "hidden", border: "2px solid #1C1A16" }}>
          <Clip muted style={{ filter: "grayscale(1) contrast(1.35) brightness(1.05) sepia(0.15)", objectPosition: "50% 22%" }} />
        </div>
        <div style={{ fontSize: 22, fontStyle: "italic", marginTop: 8 }}>Comment “tool” to get the full pack.</div>
        <div style={{ marginTop: 18 }}>
          <Lines n={7} width={560} />
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const PaperTear: React.FC = () => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, RIP], [1.05, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const t = interpolate(f, [RIP, OPEN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const crack = interpolate(f, [RIP - 3, RIP], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gap = crack * 10 + t * 1150;
  const tilt = t * 9;
  const done = f >= OPEN;

  const half = (side: "left" | "right") => {
    const dir = side === "left" ? -1 : 1;
    return (
      <AbsoluteFill
        style={{
          transform: `translateX(${dir * gap}px) rotate(${dir * tilt}deg) scale(${settle})`,
          transformOrigin: side === "left" ? "0% 100%" : "100% 100%",
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.45))",
        }}
      >
        <AbsoluteFill style={{ clipPath: side === "left" ? LEFT_FIBRE : RIGHT_FIBRE, background: "#FFFDF7" }} />
        <AbsoluteFill style={{ clipPath: side === "left" ? LEFT_CLIP : RIGHT_CLIP }}>
          <Page />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {!done && (
        <>
          {half("left")}
          {half("right")}
        </>
      )}
    </AbsoluteFill>
  );
};
