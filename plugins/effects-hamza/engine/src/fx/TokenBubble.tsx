import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass } from "./shared";

// Token bubble (tokenizer view): coloured glass token chips fly in from all around and snap into
// a frosted bubble one by one, building the sentence the way a model reads it, while a token
// counter ticks up.
const IN = 8;
const START = 16;
const STEP = 4;
const OUT = 84;
const TOKENS = ["Claude", " edit", "s", " your", " re", "els", " in", " one", " prompt", "."];
const COLORS = ["#FF8A3D", "#7CF5D6", "#9AB8FF", "#FF8FB1", "#FFD27A", "#C77DFF"];

export const TokenBubble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - IN, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = TOKENS.filter((_, i) => f >= START + i * STEP + 8).length;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1020, opacity: Math.min(1, pop * 1.4) * (1 - out), transform: `translateY(${(1 - pop) * 140 + out * 40}px)` }}>
        <div style={{ ...glass("light", 48), padding: "26px 30px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, fontFamily: SANS, color: "#fff" }}>
            <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4, opacity: 0.85 }}>HOW CLAUDE READS IT</div>
            <div style={{ ...glass("dark", 999), padding: "6px 18px", fontWeight: 800, fontSize: 28, fontVariantNumeric: "tabular-nums" }}>{count} tokens</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, minHeight: 170, alignContent: "flex-start" }}>
            {TOKENS.map((t, i) => {
              const at = START + i * STEP;
              const p = interpolate(f, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              const land = spring({ frame: f - at - 8, fps, config: { damping: 8, stiffness: 260 } });
              const a = random(`a${i}`) * Math.PI * 2;
              const dx = Math.cos(a) * 700 * (1 - p);
              const dy = Math.sin(a) * 600 * (1 - p);
              const c = COLORS[i % COLORS.length];
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "10px 16px",
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${c}66, ${c}2a)`,
                    border: `2px solid ${c}`,
                    boxShadow: `0 0 ${14 + (f >= at + 8 ? 10 * (1 - Math.min(1, land)) : 0)}px ${c}88, inset 0 1px 0 rgba(255,255,255,0.6)`,
                    fontFamily: SANS,
                    fontWeight: 800,
                    fontSize: 46,
                    color: "#fff",
                    whiteSpace: "pre",
                    transform: `translate(${dx}px, ${dy}px) rotate(${(1 - p) * 180}deg) scale(${f >= at + 8 ? 1 + 0.08 * Math.sin(Math.min(1, land) * Math.PI) : 0.6 + 0.4 * p})`,
                    opacity: f < at ? 0 : Math.min(1, p * 2),
                    filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined,
                  }}
                >
                  {t.replace(/^ /, "·")}
                </div>
              );
            })}
          </div>
          <Sheen frame={f} start={START + TOKENS.length * STEP + 10} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
