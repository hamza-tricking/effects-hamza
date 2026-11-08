import React from "react";
import { BeforeAfter } from "./BeforeAfter";
import { BladeSlice } from "./BladeSlice";
import { CloneRow } from "./CloneRow";
import { CommentBubble } from "./CommentBubble";
import { DigitalZoom } from "./DigitalZoom";
import { Glitch } from "./Glitch";
import { LightRays } from "./LightRays";
import { OrbitRing } from "./OrbitRing";
import { OutlineGlow } from "./OutlineGlow";
import { PaperTear } from "./PaperTear";
import { RackFocus } from "./RackFocus";
import { Shake } from "./Shake";
import { SpeechBubble } from "./SpeechBubble";
import { ColourSwap } from "./ColourSwap";
import { Counter } from "./Counter";
import { DepthScatter } from "./DepthScatter";
import { DoodleBoil } from "./DoodleBoil";
import { FrameBreak } from "./FrameBreak";
import { Highlighter } from "./Highlighter";
import { ImpactFrame } from "./ImpactFrame";
import { PhoneMockup } from "./PhoneMockup";
import { Sticker } from "./Sticker";
import { Typewriter } from "./Typewriter";
import { BigNumberPunch } from "./BigNumberPunch";
import { DoorOpen } from "./DoorOpen";
import { GreenScreen } from "./GreenScreen";
import { HeadlineWall } from "./HeadlineWall";
import { LiveCursor } from "./LiveCursor";
import { PaperCut } from "./PaperCut";
import { PullBackReveal } from "./PullBackReveal";
import { StickyText } from "./StickyText";
import { VoiceNote } from "./VoiceNote";
import { WordSwap } from "./WordSwap";
import { Banknote } from "./Banknote";
import { ChatTyping } from "./ChatTyping";
import { CheckButton } from "./CheckButton";
import { CommentDrop } from "./CommentDrop";
import { DayDial } from "./DayDial";
import { LayerExplode } from "./LayerExplode";
import { LetterDive } from "./LetterDive";
import { MagnifierCard } from "./MagnifierCard";
import { PredictKeys } from "./PredictKeys";
import { SkeletonLoader } from "./SkeletonLoader";
import { BlowAway } from "./BlowAway";
import { CdnRoad } from "./CdnRoad";
import { CodeBody } from "./CodeBody";
import { DollyZoom } from "./DollyZoom";
import { HeadStack } from "./HeadStack";
import { PostWall } from "./PostWall";
import { PressFront } from "./PressFront";
import { PressStamp } from "./PressStamp";
import { RequestTimeline } from "./RequestTimeline";
import { ScissorsSplit } from "./ScissorsSplit";
import { ServerStopwatch } from "./ServerStopwatch";
import { SketchWords } from "./SketchWords";
import { TokenBubble } from "./TokenBubble";
import { TruthReveal } from "./TruthReveal";
import { UiWorld } from "./UiWorld";
import { WordMorph } from "./WordMorph";
import { ZoomThroughCut } from "./ZoomThroughCut";

// One entry per effect. The index page and the plugin are generated from this list.
export type Fx = {
  id: string; // composition id and file name
  name: string;
  group: "camera" | "text" | "transition" | "cutout" | "ui";
  needsCutout: boolean;
  command: string; // what the user types in Claude Code
  component: React.FC;
};

const fx = (id: string, name: string, group: Fx["group"], needsCutout: boolean, component: React.FC): Fx => ({
  id,
  name,
  group,
  needsCutout,
  command: `/fx ${id}`,
  component,
});

export const FX: Fx[] = [
  // batch 1
  fx("orbit-ring", "Orbit ring", "cutout", true, OrbitRing),
  fx("digital-zoom", "Digital zoom", "camera", false, DigitalZoom),
  fx("paper-tear", "Paper tear", "transition", false, PaperTear),
  // batch 2
  fx("light-rays", "Light rays", "cutout", true, LightRays),
  fx("outline-glow", "Outline glow", "cutout", true, OutlineGlow),
  fx("clone-row", "Clone row", "cutout", true, CloneRow),
  fx("rack-focus", "Rack focus", "camera", true, RackFocus),
  fx("shake", "Shake", "camera", false, Shake),
  fx("glitch", "Glitch", "transition", false, Glitch),
  fx("blade-slice", "Blade slice", "transition", false, BladeSlice),
  fx("speech-bubble", "Speech bubble", "text", false, SpeechBubble),
  fx("comment-bubble", "Comment bubble", "ui", false, CommentBubble),
  fx("before-after", "Before + after", "ui", true, BeforeAfter),
  // batch 3
  fx("depth-scatter", "Depth scatter", "cutout", true, DepthScatter),
  fx("frame-break", "Frame break", "cutout", true, FrameBreak),
  fx("doodle-boil", "Doodle boil", "cutout", true, DoodleBoil),
  fx("typewriter", "Typewriter", "text", false, Typewriter),
  fx("highlighter", "Highlighter", "text", false, Highlighter),
  fx("counter", "Counter", "text", false, Counter),
  fx("impact-frame", "Impact frame", "text", true, ImpactFrame),
  fx("sticker", "Sticker", "text", false, Sticker),
  fx("phone-mockup", "Phone mockup", "ui", false, PhoneMockup),
  fx("colour-swap", "Colour swap", "transition", true, ColourSwap),
  // batch 4
  fx("headline-wall", "Headline wall", "cutout", true, HeadlineWall),
  fx("paper-cut", "Paper cut", "cutout", true, PaperCut),
  fx("green-screen", "Green screen", "cutout", true, GreenScreen),
  fx("live-cursor", "Live cursor", "ui", false, LiveCursor),
  fx("voice-note", "Voice note", "ui", false, VoiceNote),
  fx("pull-back-reveal", "Pull-back reveal", "camera", false, PullBackReveal),
  fx("word-swap", "Word swap", "text", false, WordSwap),
  fx("sticky-text", "Sticky text", "text", true, StickyText),
  fx("door-open", "Door open", "transition", false, DoorOpen),
  fx("big-number-punch", "Big number punch", "text", false, BigNumberPunch),
  // batch 5 (premium glass)
  fx("predict-keys", "Predict keys", "text", false, PredictKeys),
  fx("day-dial", "Day dial", "transition", false, DayDial),
  fx("comment-drop", "Comment drop", "ui", false, CommentDrop),
  fx("banknote", "Banknote", "ui", false, Banknote),
  fx("chat-typing", "Chat typing card", "ui", false, ChatTyping),
  fx("magnifier-card", "Magnifier", "ui", false, MagnifierCard),
  fx("check-button", "Check button", "ui", false, CheckButton),
  fx("skeleton-loader", "Skeleton loader", "ui", false, SkeletonLoader),
  fx("letter-dive", "Letter dive", "text", false, LetterDive),
  fx("layer-explode", "Layer explode", "cutout", true, LayerExplode),
  // batch 6 (final)
  fx("head-stack", "Head stack", "cutout", true, HeadStack),
  fx("code-body", "Code body", "cutout", true, CodeBody),
  fx("post-wall", "Post wall", "cutout", true, PostWall),
  fx("dolly-zoom", "Dolly zoom", "camera", true, DollyZoom),
  fx("zoom-through-cut", "Zoom-through cut", "camera", false, ZoomThroughCut),
  fx("sketch-words", "Sketch words", "text", false, SketchWords),
  fx("word-morph", "Word morph", "text", false, WordMorph),
  fx("press-front", "Press front", "transition", false, PressFront),
  fx("blow-away", "Blow away", "transition", true, BlowAway),
  fx("truth-reveal", "Truth reveal", "transition", false, TruthReveal),
  fx("ui-world", "UI world", "ui", true, UiWorld),
  fx("scissors-split", "Scissors split", "ui", false, ScissorsSplit),
  fx("server-stopwatch", "Server stopwatch", "ui", false, ServerStopwatch),
  fx("token-bubble", "Token bubble", "ui", false, TokenBubble),
  fx("press-stamp", "Press stamp", "ui", false, PressStamp),
  fx("cdn-road", "CDN road", "ui", false, CdnRoad),
  fx("request-timeline", "Request timeline", "ui", false, RequestTimeline),
];
