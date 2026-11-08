import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, SANS } from "./shared";

// Live cursor: a named design-app cursor ("Claude") flies in, drags a selection box around
// the person, the handles and size label appear, then it nudges a corner and leaves.
const BLUE = "#0D99FF";
const BOX = { x0: 250, y0: 290, x1: 970, y1: 1380 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const LiveCursor: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.inOut(Easing.cubic);
  const ci = (r: [number, number]) => interpolate(f, r, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  // cursor path: enter -> top-left -> drag to bottom-right -> nudge -> exit
  const enter = ci([8, 20]);
  const drag = ci([24, 42]);
  const nudge = ci([56, 64]);
  const back = ci([64, 70]);
  const exit = ci([78, 90]);
  let cx = lerp(1150, BOX.x0, enter);
  let cy = lerp(1700, BOX.y0, enter);
  if (f >= 24) {
    cx = lerp(BOX.x0, BOX.x1, drag);
    cy = lerp(BOX.y0, BOX.y1, drag);
  }
  const dx = (nudge - back) * -40;
  const dy = (nudge - back) * -30;
  if (f >= 56) {
    cx = BOX.x1 + dx;
    cy = BOX.y1 + dy;
  }
  if (f >= 78) {
    cx = lerp(BOX.x1, 1200, exit);
    cy = lerp(BOX.y1, 1750, exit);
  }
  const boxOn = f >= 24 && f < 84;
  const bx1 = f < 56 ? lerp(BOX.x0, BOX.x1, drag) : BOX.x1 + dx;
  const by1 = f < 56 ? lerp(BOX.y0, BOX.y1, drag) : BOX.y1 + dy;
  const settled = f >= 42;
  const fade = interpolate(f, [80, 86], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const press = f >= 22 && f < 44;
  const w = Math.round((bx1 - BOX.x0) * 1.48);
  const h = Math.round((by1 - BOX.y0) * 1.59);

  const handle = (x: number, y: number, k: number) => (
    <div key={k} style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, background: "#fff", border: `4px solid ${BLUE}`, borderRadius: 3 }} />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {boxOn && (
        <AbsoluteFill style={{ opacity: fade }}>
          <div style={{ position: "absolute", left: BOX.x0, top: BOX.y0, width: bx1 - BOX.x0, height: by1 - BOX.y0, border: `4px solid ${BLUE}`, background: "rgba(13,153,255,0.07)" }} />
          {settled && [handle(BOX.x0, BOX.y0, 0), handle(bx1, BOX.y0, 1), handle(BOX.x0, by1, 2), handle(bx1, by1, 3)]}
          {settled && (
            <div style={{ position: "absolute", left: BOX.x0, top: BOX.y0 - 64, background: BLUE, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 30, padding: "8px 16px", borderRadius: 8 }}>
              you.mp4
            </div>
          )}
          {settled && (
            <div style={{ position: "absolute", left: (BOX.x0 + bx1) / 2 - 110, top: by1 + 18, width: 220, textAlign: "center", background: BLUE, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 28, padding: "8px 0", borderRadius: 8, fontVariantNumeric: "tabular-nums" }}>
              {w} × {h}
            </div>
          )}
        </AbsoluteFill>
      )}
      {/* cursor + name tag */}
      <div style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press ? 0.9 : 1})`, transformOrigin: "0 0" }}>
        <svg width={64} height={64} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
          <path d="M3 2 L20 11 L12.5 13 L9 21 Z" fill="#FF6A2B" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", right: 30, top: 56, background: "#FF6A2B", color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 30, padding: "8px 18px", borderRadius: 20, whiteSpace: "nowrap", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>
          Claude
        </div>
      </div>
    </AbsoluteFill>
  );
};
