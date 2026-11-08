import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Big number punch (glass): a frosted glass card flies out of the lens and slams onto the chest.
// The number counts 1 -> 10 in warm metallic gradient, a ring of light bursts out, glass orbs
// drift around, a sheen sweeps the card, and a glass chip with the label lands under it.
const HIT = 18;
const OUT = 82;

const ORBS = Array.from({ length: 7 }, (_, i) => ({
  x: 140 + random(`ox${i}`) * 800,
  y: 960 + random(`oy${i}`) * 520,
  r: 18 + random(`or${i}`) * 34,
  speed: 0.6 + random(`os${i}`) * 1.2,
  delay: Math.floor(random(`od${i}`) * 10),
}));

export const BigNumberPunch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f - HIT;
  // fly-in from the lens: big + blurred -> sharp
  const fly = interpolate(f, [HIT - 9, HIT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const settle = spring({ frame: t, fps, config: { damping: 9, stiffness: 240 } });
  const scale = t < 0 ? 2.4 - 1.4 * fly : 1 + 0.07 * (1 - settle) * Math.cos(t * 0.8);
  const blur = t < 0 ? (1 - fly) * 22 : 0;
  const out = interpolate(f, [OUT, OUT + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const vis = interpolate(f, [HIT - 9, HIT - 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - out);
  // camera kick on impact
  const kick = t >= 0 && t < 7 ? 1 - t / 7 : 0;
  const kx = kick * (random(`kx${f}`) - 0.5) * 26;
  const ky = kick * (random(`ky${f}`) - 0.5) * 26;
  // count 1 -> 10
  const n = Math.max(1, Math.round(interpolate(f, [HIT - 4, HIT + 10], [1, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })));
  const ring = interpolate(t, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const chip = spring({ frame: t - 9, fps, config: { damping: 12, stiffness: 200 } });
  const glow = 0.75 + 0.25 * Math.sin(f / 6);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${kx}px, ${ky}px) scale(${1 + kick * 0.03})` }}>
        <Clip />
      </AbsoluteFill>
      {/* warm/violet glow behind the card */}
      <div style={{ position: "absolute", left: 140, top: 900, width: 800, height: 620, borderRadius: "50%", background: "radial-gradient(circle at 35% 45%, rgba(255,140,60,0.75), rgba(255,140,60,0) 60%), radial-gradient(circle at 70% 60%, rgba(150,90,255,0.7), rgba(150,90,255,0) 60%)", filter: "blur(60px)", opacity: vis * glow }} />
      {/* ring of light on impact */}
      {t >= 0 && ring < 1 && (
        <div style={{ position: "absolute", left: 540 - 560 * ring, top: 1180 - 560 * ring, width: 1120 * ring, height: 1120 * ring, borderRadius: "50%", border: `${10 * (1 - ring)}px solid rgba(255,255,255,${0.9 * (1 - ring)})`, boxShadow: `0 0 60px rgba(255,200,150,${0.8 * (1 - ring)})` }} />
      )}
      {/* drifting glass orbs */}
      {ORBS.map((o, i) => {
        const a = interpolate(t - o.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - out);
        return (
          <div
            key={i}
            style={{
              ...glass("light", o.r),
              position: "absolute",
              left: o.x,
              top: o.y - (t > 0 ? t * o.speed * 3 : 0),
              width: o.r * 2,
              height: o.r * 2,
              opacity: a * 0.9,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 20px rgba(0,0,0,0.25)",
            }}
          />
        );
      })}
      {/* the glass card */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 985, display: "flex", justifyContent: "center", opacity: vis }}>
        {/* filter only while blurred: any filter on a parent switches off the glass backdrop blur */}
        <div style={{ transform: `scale(${scale * (1 - out * 0.12)})`, filter: blur + out > 0.01 ? `blur(${blur + out * 10}px)` : undefined }}>
          <div style={{ ...glass("light", 60), padding: "26px 70px 34px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 290,
                lineHeight: 0.95,
                letterSpacing: -14,
                fontVariantNumeric: "tabular-nums",
                ...gradText("linear-gradient(180deg, #FFFFFF 0%, #FFE6CC 40%, #FFB070 75%, #FF7A3D 100%)"),
                filter: "drop-shadow(0 8px 24px rgba(255,120,50,0.55))",
              }}
            >
              {n}×
            </div>
            <div style={{ width: 420, height: 2, margin: "10px 0 18px", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))" }} />
            <div style={{ transform: `scale(${t >= 9 ? chip : 0})` }}>
              <div style={{ ...glass("dark", 999), padding: "12px 30px", display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: "#fff" }}>
                <span style={{ fontSize: 34, ...gradText("linear-gradient(180deg,#FFE27A,#FF8A3D)") }}>⚡</span>
                FASTER EDITING
              </div>
            </div>
            <Sheen frame={f} start={HIT + 3} dur={16} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
