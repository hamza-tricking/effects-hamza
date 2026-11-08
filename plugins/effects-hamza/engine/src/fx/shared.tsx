import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

// Every file below is made from YOUR video by scripts/prepare.py:
// a 3.4 s window, vertical 1080x1920, 30 fps (102 frames).
export const CLIP_FRAMES = 102;
export const CLIP = staticFile("clip.mp4");
// Same clip with the background removed (transparent VP9 WebM).
export const PERSON = staticFile("person.webm");

// Empty room (person filled out) and a transparent still of the person, both from frame 20.
export const PLATE = staticFile("plate.png");
export const PERSON_STILL = staticFile("person-still.png");

// Approximate head centre in the clip (pixels at 1080x1920), measured by prepare.py.
import head from "./head.json";
export const HEAD: { x: number; y: number } = head;

export const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
export const SERIF = "Georgia, 'Times New Roman', serif";

export const Clip: React.FC<{ style?: React.CSSProperties; muted?: boolean }> = ({ style, muted }) => (
  <OffthreadVideo src={CLIP} muted={muted} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
);

// ---------- Premium glass system (use for every card, pill and bubble) ----------
// "light" reads best over the dark hoodie, "dark" reads best over the white wall.
export const glass = (tone: "light" | "dark" = "light", radius = 40): React.CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: radius,
  background:
    tone === "light"
      ? "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.16) 100%)"
      : "linear-gradient(135deg, rgba(28,30,40,0.62) 0%, rgba(28,30,40,0.38) 100%)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  border: "1.5px solid rgba(255,255,255,0.45)",
  boxShadow:
    "inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.12), inset 0 0 40px rgba(255,255,255,0.06), 0 30px 70px rgba(0,0,0,0.35)",
});

// A diagonal streak of light that sweeps across its parent (the parent must use glass()).
export const Sheen: React.FC<{ frame: number; start: number; dur?: number; strength?: number }> = ({ frame, start, dur = 14, strength = 0.55 }) => {
  const t = (frame - start) / dur;
  if (t < 0 || t > 1) return null;
  const x = -60 + t * 220; // percent
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `linear-gradient(115deg, rgba(255,255,255,0) ${x - 18}%, rgba(255,255,255,${strength}) ${x}%, rgba(255,255,255,0) ${x + 18}%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Text filled with a gradient.
export const gradText = (gradient: string): React.CSSProperties => ({
  background: gradient,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

export const Person: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <AbsoluteFill>
    <OffthreadVideo src={PERSON} transparent muted style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
  </AbsoluteFill>
);
