import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clip, Person, SANS, Sheen, glass } from "./shared";

// UI world: a circle wipe swaps the room for a clean light app world - soft gradient, floating
// glass panels - and a frosted prompt bar above your head types the request and sends it with a glow.
const WIPE = [10, 24];
const TYPE = [28, 52];
const SEND = 56;
const BACK = [80, 92];
const PROMPT = "make this reel go viral";

export const UiWorld: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = Easing.inOut(Easing.cubic);
  const r = interpolate(f, WIPE, [0, 2300], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const rb = interpolate(f, BACK, [2300, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
  const rad = f < BACK[0] ? r : rb;
  const on = rad > 1;
  const n = Math.floor(interpolate(f, TYPE, [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sent = f >= SEND;
  const sendPop = spring({ frame: f - SEND, fps, config: { damping: 9, stiffness: 240 } });
  const bar = spring({ frame: f - WIPE[1] + 2, fps, config: { damping: 14, stiffness: 160 } });
  const caret = Math.floor(f / 7) % 2 === 0;
  const float = (k: number) => Math.sin(f / 16 + k) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Clip />
      {on && (
        <AbsoluteFill style={{ clipPath: `circle(${rad}px at 560px 300px)` }}>
          {/* app world */}
          <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 15%, #FFE3D1, rgba(255,227,209,0) 45%), radial-gradient(circle at 85% 30%, #DCD9FF, rgba(220,217,255,0) 45%), radial-gradient(circle at 50% 90%, #D4F5EC, rgba(212,245,236,0) 50%), #F6F4F0" }} />
          {/* floating panels */}
          <div style={{ position: "absolute", left: 50, top: 560, width: 300, height: 380, transform: `translateY(${float(1)}px) rotate(-4deg)` }}>
            <div style={{ ...glass("light", 30), width: "100%", height: "100%", padding: 24, background: "rgba(255,255,255,0.55)" }}>
              {[0.9, 0.6, 0.75, 0.5].map((w, i) => <div key={i} style={{ height: 22, width: `${w * 100}%`, borderRadius: 11, background: "rgba(40,40,60,0.14)", marginBottom: 20 }} />)}
              <div style={{ height: 120, borderRadius: 18, background: "linear-gradient(135deg,#FFB15C,#FF6A2B)", opacity: 0.85 }} />
            </div>
          </div>
          <div style={{ position: "absolute", right: 40, top: 520, width: 280, height: 300, transform: `translateY(${float(2)}px) rotate(5deg)` }}>
            <div style={{ ...glass("light", 30), width: "100%", height: "100%", padding: 22, background: "rgba(255,255,255,0.55)" }}>
              <div style={{ height: 150, borderRadius: 18, background: "linear-gradient(135deg,#9AB8FF,#6C5CFF)", marginBottom: 18 }} />
              {[0.8, 0.5].map((w, i) => <div key={i} style={{ height: 20, width: `${w * 100}%`, borderRadius: 10, background: "rgba(40,40,60,0.14)", marginBottom: 16 }} />)}
            </div>
          </div>
          <Person style={{ filter: "drop-shadow(0 30px 50px rgba(60,50,90,0.35))" }} />
          {/* prompt bar above the head */}
          <div style={{ position: "absolute", left: 70, right: 70, top: 236, transform: `translateY(${(1 - bar) * -60}px) scale(${0.9 + 0.1 * bar})`, opacity: Math.min(1, bar * 1.5) }}>
            <div style={{ ...glass("light", 999), background: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", gap: 14, padding: "14px 14px 14px 30px", boxShadow: sent ? "0 0 0 3px rgba(255,138,61,0.6), 0 0 40px rgba(255,138,61,0.5), 0 20px 50px rgba(60,50,90,0.25)" : "0 20px 50px rgba(60,50,90,0.25), inset 0 1.5px 0 #fff" }}>
              <span style={{ fontSize: 34 }}>✳</span>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 38, fontWeight: 600, color: n ? "#1d1d24" : "#8a8796", whiteSpace: "nowrap", overflow: "hidden" }}>
                {n ? PROMPT.slice(0, n) : "Ask Claude to edit…"}
                {!sent && n > 0 && caret && <span style={{ color: "#FF6A2B" }}>|</span>}
              </div>
              <div style={{ width: 66, height: 66, borderRadius: 33, display: "grid", placeItems: "center", color: "#fff", fontSize: 34, fontWeight: 900, background: n ? "linear-gradient(135deg,#FFB15C,#FF6A2B)" : "#d9d6e0", transform: `scale(${sent ? 1 - 0.15 * Math.sin(Math.min(1, sendPop) * Math.PI) : 1})`, boxShadow: n ? "0 0 22px rgba(255,120,50,0.6)" : "none" }}>↑</div>
              <Sheen frame={f} start={SEND} dur={14} />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
