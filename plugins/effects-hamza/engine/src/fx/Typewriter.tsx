import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip } from "./shared";

// Typewriter: a cream paper strip lands under the chin and two lines type on,
// key by key, with tiny strike jitter and ink variation, a block caret, then an underline.
const LINES = ["ONE PROMPT.", "FULL EDIT."];
const IN = 8;
const START = 16;
const PER = 2; // frames per key
const OUT = 86;
const MONO = "'Courier New', Courier, monospace";

export const Typewriter: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = spring({ frame: f - IN, fps, config: { damping: 14, stiffness: 140 } });
  const leave = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const typed = Math.max(0, Math.floor((f - START) / PER));
  const total = LINES.join("").length;
  const doneAt = START + total * PER;
  const underline = interpolate(f, [doneAt + 2, doneAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let idx = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 1080,
          padding: "36px 46px",
          background: "#F4EEDF",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.035) 0 2px, transparent 2px 6px)",
          borderRadius: 6,
          boxShadow: "0 30px 60px rgba(0,0,0,0.35), 0 2px 0 rgba(0,0,0,0.08)",
          transform: `translateY(${(1 - land) * 340 + leave * 340}px) rotate(${-2 + (1 - land) * -6}deg)`,
          opacity: Math.min(1, land * 1.5) * (1 - leave),
        }}
      >
        {LINES.map((line, li) => (
          <div key={li} style={{ position: "relative", minHeight: 103, fontFamily: MONO, fontWeight: 700, fontSize: 92, lineHeight: 1.12, color: "#1B1A17", whiteSpace: "pre", letterSpacing: 2 }}>
            {line.split("").map((ch) => {
              const my = idx++;
              const shown = my < typed;
              const isNew = my === typed - 1;
              return (
                <span
                  key={my}
                  style={{
                    // untyped keys take no space, so the caret sits right after the last letter
                    display: shown ? "inline-block" : "none",
                    opacity: 0.82 + random(`ink${my}`) * 0.18,
                    transform: `translateY(${shown ? (random(`j${my}`) - 0.5) * 4 + (isNew ? -6 : 0) : 0}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
            {/* block caret */}
            {(() => {
              const lineStart = LINES.slice(0, li).join("").length;
              const lineEnd = lineStart + line.length;
              const here = typed >= lineStart && (typed < lineEnd || (li === LINES.length - 1 && typed >= lineEnd));
              const blink = Math.floor(f / 8) % 2 === 0 || typed < total;
              return here && f >= START - 4 && blink ? <span style={{ display: "inline-block", width: 50, height: 82, marginLeft: 4, background: "#E8502B", verticalAlign: "-10px" }} /> : null;
            })()}
            {li === LINES.length - 1 && <div style={{ position: "absolute", left: 0, bottom: -8, height: 10, width: `${underline * 100}%`, background: "#E8502B", borderRadius: 5 }} />}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
