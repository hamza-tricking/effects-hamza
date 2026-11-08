import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person, SANS } from "./shared";

// Before + after: starts on the raw, flat shot. A glowing light beam sweeps across and leaves
// the edited look behind it: blurred dark background, lit subject, cinematic colour.
const SWEEP = [16, 40];

const Label: React.FC<{ text: string; side: "left" | "right"; a: number; accent?: boolean }> = ({ text, side, a, accent }) => (
  <div
    style={{
      position: "absolute",
      top: 250,
      [side]: 70,
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: 6,
      textTransform: "uppercase",
      padding: "12px 24px",
      borderRadius: 999,
      color: accent ? "#111" : "rgba(255,255,255,0.95)",
      background: accent ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.35)",
      backdropFilter: "blur(12px)",
      opacity: a,
      transform: `translateY(${(1 - a) * -16}px)`,
    } as React.CSSProperties}
  >
    {text}
  </div>
);

export const BeforeAfter: React.FC = () => {
  const f = useCurrentFrame();
  // beam x from off-left to off-right
  const x = interpolate(f, SWEEP, [-120, 1200], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const beamOn = f >= SWEEP[0] - 2 && f <= SWEEP[1] + 2;
  const reveal = `inset(0 ${Math.max(0, 1080 - x)}px 0 0)`; // after-look is shown left of the beam
  const beforeA = interpolate(f, [4, 10, SWEEP[0] + 6, SWEEP[0] + 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const afterA = interpolate(f, [SWEEP[1] - 6, SWEEP[1] + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = interpolate(f, [SWEEP[0], 100], [1, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* BEFORE: raw phone look - flat, washed, a bit soft */}
      <Clip style={{ filter: "contrast(0.78) saturate(0.55) brightness(1.1) blur(0.6px)" }} />

      {/* AFTER: revealed behind the beam */}
      <AbsoluteFill style={{ clipPath: reveal }}>
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "55% 35%" }}>
          <Clip muted style={{ filter: "blur(10px) brightness(0.5) saturate(1.25) sepia(0.35) hue-rotate(-10deg)", transform: "scale(1.06)" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 35%, rgba(255,170,90,0.22), rgba(0,0,0,0) 45%), radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
          <Person style={{ filter: "contrast(1.18) saturate(1.2) brightness(1.06) drop-shadow(0 0 40px rgba(255,190,120,0.35))" }} />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* the light beam */}
      {beamOn && (
        <>
          <div style={{ position: "absolute", left: x - 160, top: 0, width: 320, height: 1920, background: "linear-gradient(90deg, rgba(255,220,170,0), rgba(255,220,170,0.35), rgba(255,220,170,0))", mixBlendMode: "screen" }} />
          <div style={{ position: "absolute", left: x - 4, top: 0, width: 8, height: 1920, background: "#fff", boxShadow: "0 0 30px 10px rgba(255,235,200,0.9), 0 0 90px 30px rgba(255,180,110,0.5)" }} />
        </>
      )}

      <Label text="Before" side="left" a={beforeA} />
      <Label text="After" side="right" a={afterA} accent />
    </AbsoluteFill>
  );
};
