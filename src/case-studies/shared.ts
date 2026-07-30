export const toolbarLinks = {
  email: "mailto:hello@viknesh.me",
  linkedin: "https://www.linkedin.com/in/vikneshvijayakumar/",
  dribbble: "https://dribbble.com/vikneshvijayakumar",
  inspiration: "https://viknesh.me",
  resume: "https://drive.google.com/file/d/16Iyt5Sfy_c8Jv3_tKE_pivnKhpe1QpYo/view?usp=sharing",
};

// Form Taking is a Figma slide deck rather than a built page. A 16:9 deck in a
// phone-width iframe renders the slide about 200px tall — unreadable, and it is
// the entire case study — so phones skip /form-taking and open the deck itself,
// where Figma's own viewer handles the small screen. One source for both the
// card links and the page's own fallback.
export const FORM_TAKING_DECK =
  "https://www.figma.com/deck/Astzpq5hdC0rIVFP8qBOek/Form-Taking?node-id=1-42&t=GPbiU7ok5J07P8BF-1";

/** Viewport at or below which the deck replaces the page. */
export const DECK_ONLY_MQ = "(max-width: 640px)";

/** Where a "Form Taking" card should point, given the current viewport. */
export function formTakingHref(): string {
  return typeof window !== "undefined" &&
    window.matchMedia(DECK_ONLY_MQ).matches
    ? FORM_TAKING_DECK
    : "/form-taking";
}

// Carousel control icons, shared by every case study's carousel.
export const previousSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>';
export const nextSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>';
export const fullscreenSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>';
