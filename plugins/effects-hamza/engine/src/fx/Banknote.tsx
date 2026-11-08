import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, SANS, SERIF } from "./shared";

// Banknote: a paper wipe turns the shot into an engraved banknote - you inside an oval portrait
// with a line-engraving look, a rotating guilloche rosette, ornate borders, a big value counting
// up and a red serial number. Wipes back to the live shot at the end.
const IN = [12, 22];
const OUT = [80, 90];
const INK = "#1F3A2B";
const PAPER = "#E7ECD9";

const Rosette: React.FC<{ size: number; rot: number }> = ({ size, rot }) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ transform: `rotate(${rot}deg)` }}>
    {Array.from({ length: 36 }, (_, i) => (
      <ellipse key={i} cx={0} cy={0} rx={92} ry={34} fill="none" stroke={INK} strokeOpacity={0.35} strokeWidth={0.8} transform={`rotate(${i * 5})`} />
    ))}
    {Array.from({ length: 24 }, (_, i) => (
      <circle key={`c${i}`} cx={0} cy={-58} r={40} fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={0.7} transform={`rotate(${i * 15})`} />
    ))}
  </svg>
);

export const Banknote: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.inOut(Easing.cubic);
  const a = interpolate(f, IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const b = interpolate(f, OUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const value = Math.round(interpolate(f, [IN[1], IN[1] + 26], [0, 174953], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const v = value.toLocaleString("en-US");
  // diagonal wipe: note shows where (x + y*0.5) < edge
  const edgeIn = -1000 + a * 3100;
  const edgeOut = -1000 + b * 3100;
  const poly = (edge: number) => `polygon(-200px -200px, ${edge + 200}px -200px, ${edge - 1100}px 2120px, -200px 2120px)`;
  const visible = a > 0 && b < 1;
  const push = interpolate(f, [IN[0], OUT[1]], [1.04, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {visible && (
        <AbsoluteFill style={{ clipPath: poly(edgeIn), WebkitMaskImage: b > 0 ? undefined : undefined }}>
          <AbsoluteFill style={{ clipPath: b > 0 ? `polygon(${edgeOut + 200}px -200px, 1300px -200px, 1300px 2120px, ${edgeOut - 1100}px 2120px)` : undefined, background: PAPER, transform: `scale(${push})` }}>
            {/* paper fibres + fine line screen */}
            <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(31,58,43,0.05) 0 1px, transparent 1px 5px), radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.5), rgba(0,0,0,0.08) 90%)` }} />
            {/* ornate double border */}
            <div style={{ position: "absolute", left: 40, right: 40, top: 230, bottom: 430, border: `6px double ${INK}`, borderRadius: 20 }} />
            <div style={{ position: "absolute", left: 62, right: 62, top: 252, bottom: 452, border: `2px solid ${INK}`, borderRadius: 12, opacity: 0.6 }} />
            {/* rosettes */}
            <div style={{ position: "absolute", left: -80, top: 1130 }}><Rosette size={420} rot={f * 0.6} /></div>
            <div style={{ position: "absolute", right: -80, top: 300 }}><Rosette size={360} rot={-f * 0.5} /></div>
            {/* header */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: SERIF, color: INK }}>
              <div style={{ fontSize: 30, letterSpacing: 14, fontFamily: SANS, fontWeight: 700 }}>THE BANK OF EFFECTS</div>
              <div style={{ fontSize: 22, letterSpacing: 6, marginTop: 6, opacity: 0.75 }}>LEGAL TENDER FOR ALL REELS</div>
            </div>
            {/* corner values */}
            {[{ l: 90, t: 270 }, { r: 90, t: 270 }].map((p, i) => (
              <div key={i} style={{ position: "absolute", left: p.l, right: p.r, top: p.t, fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: INK }}>{v.split(",")[0]}</div>
            ))}
            {/* oval engraved portrait */}
            <div style={{ position: "absolute", left: 270, top: 390, width: 540, height: 680, borderRadius: "50%", border: `10px double ${INK}`, overflow: "hidden", boxShadow: `0 0 0 14px ${PAPER}, 0 0 0 16px ${INK}` }}>
              {/* offset so the face (y 270-880 in the clip) sits inside the oval */}
              <AbsoluteFill style={{ left: -270, top: -200, width: 1080, height: 1920 }}>
                <Clip muted style={{ filter: "grayscale(1) contrast(1.9) brightness(1.08) sepia(0.55) hue-rotate(55deg) saturate(0.9)" }} />
              </AbsoluteFill>
              {/* engraving lines */}
              <AbsoluteFill style={{ background: "repeating-linear-gradient(-25deg, rgba(231,236,217,0.55) 0 2px, transparent 2px 5px)", mixBlendMode: "screen" }} />
            </div>
            {/* big value */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: SERIF, color: INK }}>
              <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -2, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{v}.</div>
              <div style={{ fontSize: 34, letterSpacing: 10, fontFamily: SANS, fontWeight: 700, marginTop: 10 }}>AI VIDEO EDITING</div>
              <div style={{ display: "inline-block", marginTop: 26, fontFamily: "Consolas, monospace", fontSize: 34, color: "#B3261E", letterSpacing: 4 }}>AH 2026 0742 ✦</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
