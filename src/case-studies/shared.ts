export const EASE = [0.22, 1, 0.36, 1] as const;

// ponytail: history.back() preserves home-page scroll; direct entries fall back to "/"
export function goBack(e?: { preventDefault: () => void }) {
  if (document.referrer.startsWith(window.location.origin) && window.history.length > 1) {
    e?.preventDefault();
    window.history.back();
  } else if (!e) {
    window.location.href = "/";
  }
  // anchors without preventDefault fall through to their href="/"
}
export const toolbarLinks = {
  email: "mailto:hello@viknesh.me",
  linkedin: "https://www.linkedin.com/in/vikneshvijayakumar/",
  dribbble: "https://dribbble.com/vikneshvijayakumar",
  inspiration: "https://viknesh.me",
  resume: "https://drive.google.com/file/d/16Iyt5Sfy_c8Jv3_tKE_pivnKhpe1QpYo/view?usp=sharing",
};
