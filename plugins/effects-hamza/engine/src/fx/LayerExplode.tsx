import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person, SANS, glass } from "./shared";

// Layer explode: the frame swings into 3D and splits into its layers - the room at the back,
// you in the middle, a glass effects layer at the front - floating apart with glowing edges and
// frosted labels. Then everything flies back together into the flat shot.
const OPEN = [14, 34];
const CLOSE = [64, 82];

const Label: React.FC<{ text: string; a: number }> = ({ text, a }) => (
  <div style={{ position: "absolute", left: 40, top: 40, opacity: a }}>
    <div style={{ ...glass("dark", 999), padding: "10px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: "#fff" }}>{text}</div>
  </div>
);

export const LayerExplode: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.inOut(Easing.cubic);
  const a = interpolate(f, OPEN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const b = interpolate(f, CLOSE, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const k = a * (1 - b);
  const drift = Math.sin(f / 14) * 4 * k;
  const edge = (c: string): React.CSSProperties => ({ borderRadius: 40 * k, outline: k > 0.02 ? `4px solid ${c}` : "none", boxShadow: k > 0.02 ? `0 0 ${40 * k}px ${c}` : "none", overflow: "hidden" });
  const labelA = interpolate(k, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0c10" }}>
      {/* soft studio floor glow */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(120,110,255,0.25), rgba(0,0,0,0) 60%)", opacity: k }} />
      <AbsoluteFill style={{ perspective: 2200 }}>
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `scale(${1 - 0.3 * k}) rotateX(${12 * k}deg) rotateY(${(-34 + drift) * k}deg)` }}>
          {/* back: the room */}
          <AbsoluteFill style={{ transform: `translateZ(${-420 * k}px)`, ...edge("rgba(124,245,214,0.9)") }}>
            <Clip style={{ filter: k > 0.02 ? `brightness(${1 - 0.25 * k})` : undefined }} />
            {/* the hole where you were cut out of the room */}
            <AbsoluteFill style={{ opacity: k }}>
              <Person style={{ filter: "brightness(0.08) blur(3px)" }} />
            </AbsoluteFill>
            <Label text="ROOM" a={labelA} />
          </AbsoluteFill>
          {/* middle: you */}
          <AbsoluteFill style={{ transform: `translateZ(${0}px)`, ...edge("rgba(255,177,92,0.9)"), background: k > 0.02 ? "rgba(255,255,255,0.04)" : "transparent" }}>
            <Person />
            <div style={{ position: "absolute", left: 40, bottom: 470, opacity: labelA }}>
              <div style={{ ...glass("dark", 999), padding: "10px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: "#fff" }}>YOU</div>
            </div>
          </AbsoluteFill>
          {/* front: effects layer */}
          <AbsoluteFill style={{ transform: `translateZ(${420 * k}px)`, opacity: k, ...edge("rgba(156,140,255,0.9)") }}>
            <div style={{ position: "absolute", left: 80, top: 1180, display: "flex", gap: 18 }}>
              {["CAPTIONS", "ZOOM", "SOUND"].map((t) => (
                <div key={t} style={{ ...glass("light", 999), padding: "14px 28px", fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", letterSpacing: 2 }}>{t}</div>
              ))}
            </div>
            <div style={{ position: "absolute", right: 40, top: 40, opacity: labelA }}>
              <div style={{ ...glass("dark", 999), padding: "10px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: "#fff" }}>EFFECTS</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
