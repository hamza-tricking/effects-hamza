import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Green screen: a keying scan line sweeps across and swaps the room for a synthwave world
// (gradient sky, striped sun, moving neon grid). Rim light on the person. Sweeps back at the end.
const IN = [12, 24];
const OUT = [80, 92];

const World: React.FC<{ f: number }> = ({ f }) => {
  const scroll = (f * 6) % 120;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #120a2e 0%, #3b1260 20%, #b0306b 36%, #ff8a4c 46.8%, #2a0e3d 46.9%, #0d0620 100%)" }}>
      {/* stars */}
      <svg width={1080} height={1350} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={(i * 197) % 1080} cy={(i * 131) % 700} r={(i % 3) + 1} fill="#fff" opacity={0.3 + ((i * 7) % 10) / 14} />
        ))}
      </svg>
      {/* striped sun */}
      <div
        style={{
          position: "absolute",
          // sun sits right behind the head, its lower part cut by the horizon
          left: 600 - 330,
          top: 300,
          width: 660,
          height: 660,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #ffe66b 0%, #ff9a3d 55%, #ff3d7f 100%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0 52%, transparent 52% 56%, #000 56% 62%, transparent 62% 67%, #000 67% 73%, transparent 73% 79%, #000 79% 100%)",
          maskImage: "linear-gradient(180deg, #000 0 52%, transparent 52% 56%, #000 56% 62%, transparent 62% 67%, #000 67% 73%, transparent 73% 79%, #000 79% 100%)",
          clipPath: "inset(0 0 9% 0)",
          boxShadow: "0 0 120px rgba(255,120,80,0.6)",
        }}
      />
      {/* neon grid floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, bottom: 0, perspective: 500, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: -1200,
            right: -1200,
            top: 0,
            height: 2400,
            transform: "rotateX(72deg)",
            transformOrigin: "50% 0%",
            backgroundImage: "linear-gradient(rgba(255,60,200,0.9) 3px, transparent 3px), linear-gradient(90deg, rgba(80,220,255,0.9) 3px, transparent 3px)",
            backgroundSize: "120px 120px",
            backgroundPosition: `0 ${scroll}px`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const GreenScreen: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.inOut(Easing.cubic);
  const a = interpolate(f, IN, [0, 1080], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const b = interpolate(f, OUT, [0, 1080], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  // world is visible between the in-sweep line (moving right) and the out-sweep line (moving right)
  const left = b;
  const right = a;
  const visible = right > left;
  const lineX = f < OUT[0] ? a : b;
  const scanning = (f >= IN[0] && f <= IN[1]) || (f >= OUT[0] && f <= OUT[1]);
  const rim = interpolate(f, [IN[0], IN[1], OUT[0], OUT[1]], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {visible && (
        <AbsoluteFill style={{ clipPath: `inset(0 ${1080 - right}px 0 ${left}px)` }}>
          <World f={f} />
          <Person style={{ filter: `drop-shadow(-6px 0 10px rgba(255,60,200,${0.8 * rim})) drop-shadow(6px 0 10px rgba(80,220,255,${0.8 * rim})) saturate(1.1)` }} />
        </AbsoluteFill>
      )}
      {scanning && (
        <div style={{ position: "absolute", left: lineX - 3, top: 0, width: 6, height: 1920, background: "#5CFF8A", boxShadow: "0 0 30px 10px rgba(92,255,138,0.7)" }} />
      )}
    </AbsoluteFill>
  );
};
