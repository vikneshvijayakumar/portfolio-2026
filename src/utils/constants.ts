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
