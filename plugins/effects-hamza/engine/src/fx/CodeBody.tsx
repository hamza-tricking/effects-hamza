import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Clip, Person } from "./shared";

// Code body: your silhouette turns dark and fills with glowing scrolling code, a scan line sweeps
// down the body to switch it on, the room dims, then it scans back to normal.
// Masking trick: inside an isolated group, a white silhouette multiplied by the code layer leaves
// code only inside the body; the group is screened over a darkened body.
const ON = [12, 30];
const OFF = [70, 86];
const MONO = "Consolas, 'Courier New', monospace";
const LINES = Array.from({ length: 70 }, (_, i) => {
  const words = ["const", "edit", "=", "await", "claude", ".render(", "reel", ")", "fx", "orbit()", "zoom", "captions", "{", "}", "=>", "0x", "if", "return", "frame++", "glass"];
  return Array.from({ length: 6 }, (_, j) => words[Math.floor(random(`w${i}-${j}`) * words.length)]).join(" ");
});

export const CodeBody: React.FC = () => {
  const f = useCurrentFrame();
  const scanIn = interpolate(f, ON, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanOut = interpolate(f, OFF, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // visible band: from the top down to the in-scan line, minus what the out-scan has cleared
  const bottom = scanIn * 1920;
  const top = scanOut * 1920;
  const on = bottom > top + 1;
  const scroll = (f * 9) % 46;
  const lineY = f < OFF[0] ? bottom : top;
  const scanning = (f >= ON[0] && f <= ON[1]) || (f >= OFF[0] && f <= OFF[1]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip style={{ filter: on ? "brightness(0.55) saturate(0.6)" : undefined }} />
      {on && (
        <AbsoluteFill style={{ clipPath: `inset(${top}px 0 ${1920 - bottom}px 0)` }}>
          {/* the clip-path makes this a separate blend group, so the dimmed room must be inside it */}
          <Clip muted style={{ filter: "brightness(0.55) saturate(0.6)" }} />
          {/* dark body */}
          <Person style={{ filter: "brightness(0.12) saturate(0)" }} />
          {/* code only inside the body, screened on top */}
          <AbsoluteFill style={{ mixBlendMode: "screen" }}>
            <AbsoluteFill style={{ isolation: "isolate", background: "#000" }}>
              <Person style={{ filter: "brightness(0) invert(1)" }} />
              <AbsoluteFill style={{ mixBlendMode: "multiply", background: "#000", overflow: "hidden" }}>
                <div style={{ transform: `translateY(${-scroll}px)`, padding: "0 30px" }}>
                  {LINES.map((l, i) => (
                    <div key={i} style={{ fontFamily: MONO, fontSize: 30, lineHeight: "46px", whiteSpace: "nowrap", color: i % 7 === 0 ? "#FFB15C" : i % 3 === 0 ? "#7CF5D6" : "#9AB8FF", textShadow: "0 0 10px currentColor" }}>
                      {l}
                    </div>
                  ))}
                </div>
              </AbsoluteFill>
            </AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {scanning && <div style={{ position: "absolute", left: 0, right: 0, top: lineY - 3, height: 6, background: "#7CF5D6", boxShadow: "0 0 30px 10px rgba(124,245,214,0.6)" }} />}
    </AbsoluteFill>
  );
};
