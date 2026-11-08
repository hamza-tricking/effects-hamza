import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS } from "./shared";

// Highlighter: big stacked words land on the empty wall beside the head,
// then a marker sweeps a rough yellow stroke behind the key word.
const IN = 8;
const MARK = [30, 42];
const OUT = 84;
const WORDS = [
  { w: "edit", mark: false },
  { w: "with", mark: false },
  { w: "Claude.", mark: true },
];

export const Highlighter: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leave = interpolate(f, [OUT, OUT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const sweep = interpolate(f, MARK, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 70, top: 330, display: "flex", flexDirection: "column", gap: 6, opacity: 1 - leave, transform: `translateX(${-leave * 60}px)` }}>
        {WORDS.map((wd, i) => {
          const p = spring({ frame: f - IN - i * 5, fps, config: { damping: 13, stiffness: 170 } });
          return (
            <div key={i} style={{ position: "relative", alignSelf: "flex-start", transform: `translateY(${(1 - p) * 50}px)`, opacity: Math.min(1, p * 1.5) }}>
              {wd.mark && (
                <svg width={420} height={130} viewBox="0 0 420 130" preserveAspectRatio="none" style={{ position: "absolute", left: -16, top: 12, width: 350, height: 102, overflow: "visible" }}>
                  <defs>
                    <clipPath id="mark-sweep">
                      <rect x={0} y={-20} width={440 * sweep} height={170} />
                    </clipPath>
                  </defs>
                  <path
                    d="M8 40 C 80 22, 200 30, 410 18 L 414 104 C 300 112, 150 104, 4 112 Z"
                    fill="#FFE14D"
                    opacity={0.92}
                    clipPath="url(#mark-sweep)"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </svg>
              )}
              <span
                style={{
                  position: "relative",
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: wd.mark ? 98 : 86,
                  lineHeight: 1.05,
                  letterSpacing: -2,
                  color: "#121317",
                  textShadow: "0 2px 14px rgba(255,255,255,0.35)",
                }}
              >
                {wd.w}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
