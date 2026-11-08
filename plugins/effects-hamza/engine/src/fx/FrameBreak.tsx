import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Frame break: the shot shrinks into a phone screen on a dark blurred room,
// and the person's head and shoulders break out over the top edge of the phone.
const IN = [12, 28];
const OUT = [76, 90];
const S = 0.7; // final scale of the shot
const OX = 540;
const OY = 1300; // scale origin
const BREAK_Y = 660; // original-frame y where the phone's top edge sits (around the mouth)

export const FrameBreak: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const b = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const k = a * (1 - b);
  const s = 1 - (1 - S) * k;
  const map = (x: number, y: number) => ({ x: OX + (x - OX) * s, y: OY + (y - OY) * s });
  // phone screen rect in output pixels
  const tl = map(0, BREAK_Y * k); // top edge slides down from 0 to the break line
  const br = map(1080, 1920);
  const radius = 70 * k;
  const bezel = 16 * k;
  const shot = { transform: `scale(${s})`, transformOrigin: `${OX}px ${OY}px` };

  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0d10" }}>
      {/* dark blurred room behind the phone */}
      <AbsoluteFill style={{ opacity: k }}>
        <Clip muted style={{ filter: "blur(30px) brightness(0.35) saturate(1.2)", transform: "scale(1.15)" }} />
      </AbsoluteFill>
      {/* phone body */}
      <div
        style={{
          position: "absolute",
          left: tl.x - bezel,
          top: tl.y - bezel,
          width: br.x - tl.x + bezel * 2,
          height: br.y - tl.y + bezel * 2,
          borderRadius: radius + bezel,
          background: "#16171b",
          boxShadow: k > 0 ? "0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 3px #2c2e35" : "none",
        }}
      />
      {/* the shot, clipped to the screen */}
      <AbsoluteFill style={{ clipPath: `inset(${tl.y}px ${1080 - br.x}px ${1920 - br.y}px ${tl.x}px round ${radius}px)` }}>
        <AbsoluteFill style={shot}>
          <Clip />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* the person breaking out over the top edge */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 ${1920 - tl.y - 40}px 0)`, opacity: k > 0.02 ? 1 : 0 }}>
        <AbsoluteFill style={shot}>
          <Person style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
