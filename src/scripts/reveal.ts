// The one scroll-reveal engine, shared by the landing page and every case
// study. Visual language lives in styles/reveal.css; this file only decides
// *when* something has scrolled far enough to reveal.

/**
 * Where the trigger line sits. threshold stays at 0 and the work is done by the
 * bottom margin, deliberately: a ratio threshold means a short paragraph and a
 * tall section reveal at completely different points on screen (12% of a 60px
 * paragraph is 7px — it fires the instant it peeks in), and an element taller
 * than the scroll band can never reach the ratio at all. A margin gives every
 * element the same line regardless of height. -20% ≈ reveal once the element's
 * top is a fifth of the way up the visible band, so the animation plays where
 * the eye is rather than finishing off the bottom edge.
 */
const TRIGGER: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "0px 0px -20% 0px",
};

/**
 * Case-study markup predates the data-reveal contract, so its semantic classes
 * are mapped onto it here. This is the single source: the engine stamps these
 * elements at runtime, and CaseStudyLayout inlines preHideCss() from the same
 * strings so they are already hidden at first paint. A selector added here is
 * therefore handled end to end — the two used to be hand-mirrored and had
 * drifted apart.
 */
export const CASE_STUDY_TARGETS = {
  words: "h2.cs-heading, h2.case-footer__title",
  stagger: [
    ".cs-flow-container",
    ".cs-datamodel-grid",
    ".cs-feature__helps-list",
    ".cs-audit-grid",
    ".cs-outcomes-grid",
  ].join(", "),
  up: [
    ".cs-body",
    ".cs-blockquote",
    ".cs-subheading",
    ".cs-section__number",
    ".cs-feature-card",
    ".cs-impact-stat",
    ".cs-redesign-card__text",
    ".cs-stat",
    ".case-footer__sub",
  ].join(", "),
};

export type RevealTargets = typeof CASE_STUDY_TARGETS;

/** The pre-hide rules for a class-selector map, mirroring styles/reveal.css. */
export function preHideCss(t: RevealTargets = CASE_STUDY_TARGETS) {
  return `@media (prefers-reduced-motion: no-preference) {
  .reveal-armed :is(${t.words}):not(.reveal-split) { opacity: 0; }
  .reveal-armed :is(${t.stagger}) > *:not(.in),
  .reveal-armed :is(${t.up}):not(.in) {
    opacity: 0;
    translate: 0 var(--reveal-rise);
  }
}`;
}

/** Wrap each word in a mask + inner span so it can slide up from behind. */
export function splitWords(el: HTMLElement) {
  let i = 0;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      (node.textContent || "").split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const mask = document.createElement("span");
        mask.className = "w-mask";
        const inner = document.createElement("span");
        inner.className = "w-in";
        inner.style.setProperty("--i", String(i++));
        inner.textContent = w;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);
    }
  };
  [...el.childNodes].forEach(walk);
  el.classList.add("reveal-split");
}

/**
 * @param root  The element that scrolls, when it isn't the page. Case studies
 *              scroll an inner div, and an observer left on the default root
 *              measures against the viewport instead — every reveal then fires
 *              early by the height of whatever sits above the scroll box.
 * @param targets  Class-selector map for markup without data-reveal attributes.
 */
export function initReveals({
  root = null,
  targets,
}: { root?: Element | null; targets?: RevealTargets } = {}) {
  // Stamp the attribute contract onto class-selected markup. Their hidden state
  // is already applied by preHideCss(), so doing this after paint is safe.
  if (targets) {
    document
      .querySelectorAll<HTMLElement>(targets.words)
      .forEach((el) => el.setAttribute("data-reveal", "words"));
    document
      .querySelectorAll<HTMLElement>(targets.stagger)
      .forEach((el) => el.setAttribute("data-reveal-stagger", ""));
    document.querySelectorAll<HTMLElement>(targets.up).forEach((el) => {
      // Inside a staggered container the parent already drives this element;
      // a second reveal on top of it would double the delay.
      if (!el.closest("[data-reveal-stagger]")) {
        el.setAttribute("data-reveal", "up");
      }
    });
  }

  document
    .querySelectorAll<HTMLElement>("[data-split-words]")
    .forEach(splitWords);
  document
    .querySelectorAll<HTMLElement>('[data-reveal="words"]:not(.reveal-split)')
    .forEach(splitWords);

  // Staggered containers hand their children the attribute plus a delay. The
  // children are observed individually rather than the container, so a grid
  // whose items get reparented later (the landing's masonry) still works.
  document
    .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
    .forEach((container) => {
      const perRow = Number(container.dataset.revealStagger) || 0;
      [...container.children].forEach((child, i) => {
        const step = perRow ? i % perRow : i;
        child.setAttribute("data-reveal", "up");
        (child as HTMLElement).style.transitionDelay =
          `calc(${step} * var(--reveal-step))`;
      });
    });

  // An element can also ask for its own delay, independent of any container.
  document
    .querySelectorAll<HTMLElement>("[data-reveal-delay]")
    .forEach((el) => (el.style.transitionDelay = `${el.dataset.revealDelay}ms`));

  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const reveal = (el: HTMLElement) => el.classList.add("in");

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      reveal(e.target as HTMLElement);
      io.unobserve(e.target);
    });
  }, { ...TRIGGER, root });
  els.forEach((el) => io.observe(el));

  // The trigger line sits above the bottom edge, so anything that can never be
  // scrolled past it — the last item, on a short page — would stay hidden for
  // good. Reveal whatever is left once there is no scroll remaining.
  const scroller: HTMLElement | Window = (root as HTMLElement) ?? window;
  const atEnd = () => {
    const el = (root as HTMLElement) ?? document.documentElement;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
  };
  const flush = () => {
    if (!atEnd()) return;
    els.forEach(reveal);
    scroller.removeEventListener("scroll", flush);
  };
  scroller.addEventListener("scroll", flush, { passive: true });
}
