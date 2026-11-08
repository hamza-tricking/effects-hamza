import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip } from "./shared";

// Blade slice: a bright blade cuts the frame diagonally, the two pieces slide apart, then snap back.
const CUT = 16; // blade starts
const SPLIT = 22; // pieces start to slide
const JOIN = 62; // pieces snap back

// diagonal line from (0, Y0) to (1080, Y1)
const Y0 = 1180;
const Y1 = 700;
const TOP = `polygon(0px 0px, 1080px 0px, 1080px ${Y1}px, 0px ${Y0}px)`;
const BOTTOM = `polygon(0px ${Y0}px, 1080px ${Y1}px, 1080px 1920px, 0px 1920px)`;
const ANGLE = (Math.atan2(Y1 - Y0, 1080) * 180) / Math.PI;

export const BladeSlice: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [CUT, CUT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lineFade = interpolate(f, [CUT + 5, CUT + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const open = interpolate(f, [SPLIT, SPLIT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const close = interpolate(f, [JOIN, JOIN + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const s = open * (1 - close);
  // slide along the cut line, and a little apart across it
  const along = 70 * s;
  const apart = 26 * s;
  const rad = (ANGLE * Math.PI) / 180;
  const ax = Math.cos(rad) * along;
  const ay = Math.sin(rad) * along;
  const nx = Math.sin(rad) * apart;
  const ny = -Math.cos(rad) * apart;
  const len = Math.hypot(1080, Y1 - Y0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b" }}>
      <AbsoluteFill style={{ clipPath: TOP, transform: `translate(${-ax + nx}px, ${-ay + ny}px)` }}>
        <Clip />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: BOTTOM, transform: `translate(${ax - nx}px, ${ay - ny}px)` }}>
        <Clip muted />
      </AbsoluteFill>
      {/* the blade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: Y0,
          width: len * draw,
          height: 6,
          background: "linear-gradient(90deg, rgba(255,255,255,0), #fff 30%, #fff)",
          boxShadow: "0 0 24px 6px rgba(190,230,255,0.9)",
          transform: `rotate(${ANGLE}deg)`,
          transformOrigin: "0 50%",
          opacity: lineFade,
        }}
      />
    </AbsoluteFill>
  );
};
