export const MOBILE_BREAKPOINT = 720;
export const STAGE = {
  width: 5000,
  height: 2500,
};
export const EASE = [0.22, 1, 0.36, 1] as const;

// The one source for the shortcut modifier glyph. navigator.platform is
// deprecated and userAgent already carries "Macintosh", so one test does it.
const isMac =
  typeof navigator !== "undefined" &&
  navigator.userAgent.toUpperCase().includes("MAC");
export const MODIFIER_KEY = isMac ? "⌘" : "Ctrl";

export function getCardTransition(isMobile: boolean, index: number): import("motion/react").Transition {
  const delay = (isMobile ? 0.05 : 0.2) + index * (isMobile ? 0.02 : 0.05);
  return {
    opacity: { duration: 0.3, delay },
    scale: { type: "spring", stiffness: 300, damping: 25, delay },
    left: { type: "spring", stiffness: 400, damping: 35 },
    top: { type: "spring", stiffness: 400, damping: 35 },
    rotate: { type: "spring", stiffness: 400, damping: 35 }
  };
}
