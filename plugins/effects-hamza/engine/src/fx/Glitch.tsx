import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Clip } from "./shared";

// Glitch: short digital hits - RGB split and sliced bands jumping sideways.
const HITS = [[18, 26], [44, 48], [66, 72]];

const isOn = (f: number) => HITS.some(([a, b]) => f >= a && f < b);

export const Glitch: React.FC = () => {
  const f = useCurrentFrame();
  const on = isOn(f);
  const k = on ? 0.6 + random(`k${f}`) * 0.6 : 0;
  const split = 26 * k;
  const bands = on
    ? Array.from({ length: 7 }, (_, i) => {
        const top = random(`t${f}-${i}`) * 1800;
        const h = 30 + random(`h${f}-${i}`) * 140;
        const dx = (random(`d${f}-${i}`) - 0.5) * 260 * k;
        return { top, h, dx };
      })
    : [];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="rgb-split" x="-10%" y="0%" width="120%" height="100%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx={split} dy={0} result="r2" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feOffset in="b" dx={-split} dy={0} result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </defs>
      </svg>
      <AbsoluteFill style={{ filter: on ? "url(#rgb-split)" : undefined }}>
        <Clip />
      </AbsoluteFill>
      {bands.map((b, i) => (
        <AbsoluteFill key={i} style={{ clipPath: `inset(${b.top}px 0 ${Math.max(0, 1920 - b.top - b.h)}px 0)`, transform: `translateX(${b.dx}px)`, filter: `hue-rotate(${i * 40}deg) contrast(1.3)` }}>
          <Clip muted />
        </AbsoluteFill>
      ))}
      {on && <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 5px)" }} />}
    </AbsoluteFill>
  );
};
