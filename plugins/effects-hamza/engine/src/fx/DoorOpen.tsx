import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, SANS, SERIF } from "./shared";

// Door open: the video starts behind two closed doors with a title across them.
// The doors swing open in 3D, light spills out, and the shot is revealed.
const OPEN = [14, 34];

const Door: React.FC<{ side: "left" | "right"; angle: number }> = ({ side, angle }) => {
  const left = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [left ? "left" : "right"]: 0,
        width: 540,
        transformOrigin: left ? "0% 50%" : "100% 50%",
        transform: `rotateY(${left ? -angle : angle}deg)`,
        background: "linear-gradient(180deg, #1c2233 0%, #10131c 100%)",
        borderRight: left ? "3px solid #c9a65a" : "none",
        borderLeft: left ? "none" : "3px solid #c9a65a",
        boxShadow: "inset 0 0 0 26px rgba(201,166,90,0.08)",
        overflow: "hidden",
        backfaceVisibility: "hidden",
      } as React.CSSProperties}
    >
      {/* panel insets */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 140, height: 640, border: "3px solid rgba(201,166,90,0.45)", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1140, height: 640, border: "3px solid rgba(201,166,90,0.45)", borderRadius: 8 }} />
      {/* handle */}
      <div style={{ position: "absolute", top: 930, [left ? "right" : "left"]: 40, width: 18, height: 120, borderRadius: 9, background: "linear-gradient(90deg,#8a6a2e,#f2d48a,#8a6a2e)" }} />
      {/* half of the title */}
      {/* a full-width title placed so its centre sits on the seam; each door shows its half */}
      <div style={{ position: "absolute", top: 860, left: left ? 0 : -540, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 18, color: "#c9a65a" }}>WELCOME TO</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 140, color: "#f4ead2", lineHeight: 1.05 }}>Effects</div>
      </div>
    </div>
  );
};

export const DoorOpen: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, OPEN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const angle = t * 105;
  const light = interpolate(f, [OPEN[0], OPEN[0] + 8, OPEN[1] + 6], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = interpolate(f, [OPEN[0], 70], [1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Clip />
      </AbsoluteFill>
      {/* light spilling through the gap */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,236,190,1) 0%, rgba(255,210,140,0.5) 30%, rgba(0,0,0,0) 65%)", opacity: light, mixBlendMode: "screen" }} />
      {t < 1 && (
        <AbsoluteFill style={{ perspective: 1400 }}>
          <Door side="left" angle={angle} />
          <Door side="right" angle={angle} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
