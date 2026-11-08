import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, SANS, Sheen, glass, gradText } from "./shared";

// Predict keys (glass): a frosted iOS-style keyboard rises under the chin. Keys pop up as they are
// pressed, the field types "make it", the prediction bar offers three words, the glowing one is
// tapped and lands as "pop" with a sparkle.
const IN = 8;
const TYPED = "make it";
const TYPE_START = 18;
const PER = 3;
const PICK = 46;
const OUT = 84;
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const KEY_W = 86;
const KEY_H = 78;
const GAP = 10;

export const PredictKeys: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f - IN, fps, config: { damping: 16, stiffness: 140 } });
  const out = interpolate(f, [OUT, OUT + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = Math.max(0, Math.min(TYPED.length, Math.floor((f - TYPE_START) / PER) + 1));
  const typedNow = f >= TYPE_START ? TYPED.slice(0, n) : "";
  const pressIdx = f >= TYPE_START && (f - TYPE_START) % PER < 2 && n <= TYPED.length ? n - 1 : -1;
  const pressed = pressIdx >= 0 && f < TYPE_START + TYPED.length * PER ? TYPED[pressIdx] : "";
  const picked = f >= PICK;
  const pickPop = spring({ frame: f - PICK, fps, config: { damping: 9, stiffness: 240 } });
  const showPreds = f >= TYPE_START + 6;
  const caret = Math.floor(f / 8) % 2 === 0;

  const key = (ch: string, w = KEY_W) => {
    const down = pressed === ch;
    return (
      <div key={ch} style={{ position: "relative", width: w, height: KEY_H }}>
        <div style={{ ...glass(down ? "light" : "dark", 16), width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: SANS, fontSize: 38, fontWeight: 500, color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 4px 10px rgba(0,0,0,0.25)" }}>
          {ch === " " ? "space" : ch}
        </div>
        {down && ch !== " " && (
          <div style={{ ...glass("light", 20), position: "absolute", left: -12, bottom: KEY_H - 10, width: w + 24, height: 124, display: "grid", placeItems: "center", fontFamily: SANS, fontSize: 76, fontWeight: 600, color: "#fff", boxShadow: "0 18px 40px rgba(0,0,0,0.4), inset 0 1.5px 0 rgba(255,255,255,0.7)" }}>
            {ch}
          </div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      <div style={{ position: "absolute", left: 30, right: 30, top: 905, transform: `translateY(${(1 - rise) * 640 + out * 640}px)`, opacity: Math.min(1, rise * 1.4) }}>
        <div style={{ ...glass("light", 46), padding: "22px 20px 24px" }}>
          {/* text field */}
          <div style={{ ...glass("dark", 26), padding: "10px 26px", fontFamily: SANS, fontSize: 46, fontWeight: 700, color: "#fff", minHeight: 74, display: "flex", alignItems: "center" }}>
            <span>{typedNow}</span>
            {picked && (
              <span style={{ marginLeft: 14, display: "inline-block", transform: `scale(${0.5 + 0.5 * pickPop})`, ...gradText("linear-gradient(180deg,#FFFFFF,#FFC46B 60%,#FF7A3D)"), filter: "drop-shadow(0 0 14px rgba(255,150,60,0.7))" }}>pop ✨</span>
            )}
            {!picked && caret && <span style={{ width: 4, height: 54, background: "#FFB15C", marginLeft: 4, borderRadius: 2 }} />}
          </div>
          {/* prediction bar */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 66, margin: "6px 0 8px", fontFamily: SANS, fontSize: 36, color: "rgba(255,255,255,0.85)", opacity: showPreds ? 1 : 0 }}>
            {["viral", "pop", "clean"].map((w) => {
              const hot = w === "pop";
              return (
                <div key={w} style={hot ? { ...glass("light", 999), padding: "8px 36px", color: "#fff", fontWeight: 800, transform: `scale(${picked ? 1 + 0.12 * Math.sin(Math.min(1, pickPop) * Math.PI) : 1})`, boxShadow: `0 0 ${picked ? 30 : 16}px rgba(255,170,90,0.7), inset 0 1.5px 0 rgba(255,255,255,0.7)` } : { padding: "8px 24px" }}>
                  “{w}”
                </div>
              );
            })}
          </div>
          {/* keys */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP, alignItems: "center" }}>
            {ROWS.map((r) => (
              <div key={r} style={{ display: "flex", gap: GAP }}>
                {r.split("").map((c) => key(c))}
              </div>
            ))}
            <div style={{ display: "flex", gap: GAP }}>{key(" ", 520)}</div>
          </div>
          <Sheen frame={f} start={IN + 6} dur={18} strength={0.4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
