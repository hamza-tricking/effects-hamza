import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip, SANS } from "./shared";

// Digital zoom: a hard punch from the wide shot into a tight face crop, with a camera viewfinder.
const FACE = { x: 600, y: 610 };
const PUNCH = 18; // frame the zoom snaps in
const BACK = 74; // frame it snaps back out
const ZOOM = 2.1;

export const DigitalZoom: React.FC = () => {
  const f = useCurrentFrame();
  const inZoom = interpolate(f, [PUNCH, PUNCH + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const outZoom = interpolate(f, [BACK, BACK + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const on = inZoom * (1 - outZoom);
  const drift = interpolate(f, [PUNCH, BACK], [0, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = 1 + (ZOOM - 1 + drift) * on;

  const ui = f >= PUNCH && f < BACK + 2;
  const secs = ((f - PUNCH) / 30 + 12.4).toFixed(2);
  const blink = Math.floor(f / 8) % 2 === 0;
  const bracket = interpolate(f, [PUNCH, PUNCH + 6], [1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });

  const corner = (pos: React.CSSProperties, rot: number) => (
    <div
      style={{
        position: "absolute",
        width: 90,
        height: 90,
        borderTop: "5px solid rgba(255,255,255,0.95)",
        borderLeft: "5px solid rgba(255,255,255,0.95)",
        transform: `rotate(${rot}deg)`,
        ...pos,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${FACE.x}px ${FACE.y}px` }}>
        <Clip />
      </AbsoluteFill>
      {/* vignette while zoomed */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)", opacity: on }} />
      {ui && (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `scale(${bracket})` }}>
            {corner({ left: 150, top: 330 }, 0)}
            {corner({ right: 150, top: 330 }, 90)}
            {corner({ right: 150, bottom: 640 }, 180)}
            {corner({ left: 150, bottom: 640 }, 270)}
          </AbsoluteFill>
          {/* centre focus mark */}
          <div style={{ position: "absolute", left: 540 - 22, top: 960 - 330, width: 44, height: 44, border: "3px solid rgba(255,214,10,0.95)", borderRadius: 4 }} />
          {/* REC + timecode, inside the safe zone */}
          <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: "#FF3B30", opacity: blink ? 1 : 0.25 }} />
            REC
            <span style={{ fontWeight: 500, opacity: 0.9, marginLeft: 12, fontVariantNumeric: "tabular-nums" }}>00:00:{secs.padStart(5, "0")}</span>
          </div>
          <div style={{ position: "absolute", right: 70, top: 250, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#FFD60A", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {(1 + (ZOOM - 1 + drift) * inZoom).toFixed(1)}×
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
