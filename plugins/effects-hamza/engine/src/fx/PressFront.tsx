import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, SANS, SERIF } from "./shared";

// Press front: the classic spinning newspaper. A front page spins out of the dark toward camera
// and stops: "CLAUDE EDITS REELS" with your photo. The camera then pushes into the 9:16 photo,
// which lands exactly on the full frame and becomes the live shot (seamless cut).
const SPIN = [0, 20];
const PUSH = [34, 56];
const PAGE = 0.92; // page scale once it has landed
// 9:16 photo on the page (page coordinates, 1080x1920)
const P = { x: 330, y: 760, w: 420, h: 746.67 };
// photo rect after the page scale (about the frame centre)
const L = 540 + (P.x - 540) * PAGE;
const T = 960 + (P.y - 960) * PAGE;
const S = 1080 / (P.w * PAGE); // zoom that makes the photo fill the frame

export const PressFront: React.FC = () => {
  const f = useCurrentFrame();
  const sp = interpolate(f, SPIN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const push = interpolate(f, PUSH, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  if (f >= PUSH[1]) return <AbsoluteFill style={{ backgroundColor: "#000" }}><Clip /></AbsoluteFill>;
  const pageScale = 0.06 + (PAGE - 0.06) * sp;
  const rot = (1 - sp) * 720;
  const z = 1 + (S - 1) * push;
  const tx = (-L * S * (z - 1)) / (S - 1);
  const ty = (-T * S * (z - 1)) / (S - 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3a3a3a, #0b0b0b 70%)" }} />
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "0 0" }}>
        <AbsoluteFill style={{ transform: `scale(${pageScale}) rotate(${rot}deg)`, transformOrigin: "50% 50%", boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }}>
          <AbsoluteFill style={{ background: "#F1EBDD", padding: "110px 70px 0", fontFamily: SERIF, color: "#161512" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 26, letterSpacing: 4, borderBottom: "3px solid #161512", paddingBottom: 12 }}>
              <span>NO. 001</span><span>SPECIAL EDITION</span><span>FREE</span>
            </div>
            <div style={{ fontSize: 118, fontWeight: 700, textAlign: "center", margin: "22px 0 4px", letterSpacing: -2 }}>The Reel Times</div>
            <div style={{ borderTop: "8px double #161512", marginBottom: 26 }} />
            <div style={{ fontSize: 128, fontWeight: 900, lineHeight: 0.95, textAlign: "center", fontFamily: SANS, letterSpacing: -4 }}>CLAUDE EDITS REELS</div>
            <div style={{ fontSize: 38, fontStyle: "italic", textAlign: "center", margin: "16px 0 0" }}>“One prompt, one finished video.”</div>
          </AbsoluteFill>
          {/* side columns */}
          {[70, 790].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 770, width: 220, display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 22 }, (_, i) => <div key={i} style={{ height: 9, width: i % 6 === 5 ? 140 : 220, background: "#B8AF9E", borderRadius: 2 }} />)}
            </div>
          ))}
          {/* the photo: the full live shot scaled into a 9:16 frame */}
          <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, overflow: "hidden", outline: `${4 * (1 - push)}px solid #161512` }}>
            <div style={{ width: 1080, height: 1920, transform: `scale(${P.w / 1080})`, transformOrigin: "0 0" }}>
              <Clip style={{ filter: push < 0.999 ? `grayscale(${1 - push}) contrast(${1.3 - 0.3 * push}) sepia(${0.2 * (1 - push)})` : undefined }} />
            </div>
            <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(0,0,0,0.28) 1px, transparent 1.6px)", backgroundSize: "5px 5px", opacity: 1 - push }} />
          </div>
          <div style={{ position: "absolute", left: P.x, top: P.y + P.h + 14, width: P.w, fontFamily: SERIF, fontSize: 24, color: "#161512", opacity: 1 - push }}>
            Pictured: the creator who never opened an editor.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
