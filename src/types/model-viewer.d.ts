// JSX typing for Google's <model-viewer> web component (loaded on demand in BodyTypeShowroom).
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  "camera-orbit"?: string;
  "camera-controls"?: string;
  "auto-rotate"?: string;
  "auto-rotate-delay"?: string;
  "rotation-per-second"?: string;
  "disable-zoom"?: string;
  "disable-pan"?: string;
  "disable-tap"?: string;
  "touch-action"?: string;
  "interaction-prompt"?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
  "environment-image"?: string;
  exposure?: string;
  loading?: "auto" | "lazy" | "eager";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
