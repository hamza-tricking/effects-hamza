import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Skeleton loader (glass): a frosted analytics card appears as a shimmering skeleton, then each
// block resolves into real content - the reel thumbnail, the title, counting stats and a bar chart
// that grows - one after another.
const IN = 8;
const RESOLVE = 34;
const OUT = 86;

const Bone: React.FC<{ w: number | string; h: number; r?: number; f: number }> = ({ w, h, r = 12, f }) => {
  const x = ((f * 4) % 200) - 50;
  return <div style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(100deg, rgba(255,255,255,0.14) ${x - 25}%, rgba(255,255,255,0.42) ${x}%, rgba(255,255,255,0.14) ${x + 25}%)` }} />;
};

export const SkeletonLoader: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 14, stiffness: 150 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r = (i: number) => interpolate(f, [RESOLVE + i * 6, RESOLVE + i * 6 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const views = Math.round(interpolate(f, [RESOLVE + 12, RESOLVE + 34], [0, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) * 10) / 10;
  const likes = Math.round(interpolate(f, [RESOLVE + 12, RESOLVE + 34], [0, 98], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const bars = [0.35, 0.5, 0.42, 0.68, 0.6, 0.85, 1];
  const fade = (a: number, child: React.ReactNode, bone: React.ReactNode) => (
    <div style={{ position: "relative" }}>
      <div style={{ opacity: 1 - a }}>{bone}</div>
      <div style={{ position: "absolute", inset: 0, opacity: a, transform: `translateY(${(1 - a) * 10}px)`, filter: a < 1 ? `blur(${(1 - a) * 6}px)` : undefined }}>{child}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 60, right: 60, top: 990, opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 200 + out * 50}px) scale(${0.95 + 0.05 * pop})` }}>
        <div style={{ ...glass("light", 44), padding: 28, display: "flex", gap: 26 }}>
          {/* thumbnail */}
          {fade(
            r(0),
            <div style={{ width: 210, height: 370, borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", border: "2px solid rgba(255,255,255,0.6)" }}>
              <div style={{ width: 1080, height: 1920, transform: "scale(0.1945)", transformOrigin: "0 0" }}>
                <Clip muted />
              </div>
            </div>,
            <Bone w={210} h={370} r={24} f={f} />
          )}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, paddingTop: 6 }}>
            {fade(r(1), <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: "#fff", lineHeight: 1.12 }}>My first AI-edited reel</div>, <div style={{ display: "flex", flexDirection: "column", gap: 10 }}><Bone w="95%" h={34} f={f} /><Bone w="60%" h={34} f={f} /></div>)}
            {fade(
              r(2),
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ ...glass("dark", 18), padding: "8px 16px", fontFamily: SANS, fontSize: 30, fontWeight: 800, color: "#fff" }}>
                  <span style={gradText("linear-gradient(180deg,#fff,#7CF5D6)")}>{views.toFixed(1)}M</span> views
                </div>
                <div style={{ ...glass("dark", 18), padding: "8px 16px", fontFamily: SANS, fontSize: 30, fontWeight: 800, color: "#fff" }}>
                  <span style={gradText("linear-gradient(180deg,#fff,#FF8FB1)")}>{likes}K</span> ♥
                </div>
              </div>,
              <div style={{ display: "flex", gap: 14 }}><Bone w={180} h={50} r={18} f={f} /><Bone w={150} h={50} r={18} f={f} /></div>
            )}
            {fade(
              r(3),
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 150, paddingTop: 10 }}>
                {bars.map((b, i) => {
                  const g = interpolate(f, [RESOLVE + 20 + i * 2, RESOLVE + 32 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) });
                  return <div key={i} style={{ flex: 1, height: `${b * 100 * g}%`, borderRadius: 10, background: i === bars.length - 1 ? "linear-gradient(180deg,#FFD27A,#FF7A3D)" : "linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.35))", boxShadow: i === bars.length - 1 ? "0 0 20px rgba(255,140,60,0.7)" : "none" }} />;
                })}
              </div>,
              <Bone w="100%" h={150} r={16} f={f} />
            )}
          </div>
          <Sheen frame={f} start={RESOLVE + 30} dur={16} strength={0.45} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
