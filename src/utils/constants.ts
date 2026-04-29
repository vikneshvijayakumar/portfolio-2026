export const MOBILE_BREAKPOINT = 720;
export const STAGE = {
  width: 4500,
  height: 2500,
};
export const EASE = [0.22, 1, 0.36, 1] as const;

const isMac = typeof navigator !== "undefined" && (
  navigator.platform.toUpperCase().indexOf("MAC") >= 0 || 
  navigator.userAgent.toUpperCase().indexOf("MAC") >= 0
);
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
