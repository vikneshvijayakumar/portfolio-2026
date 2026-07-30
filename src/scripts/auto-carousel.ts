// The one carousel engine on the site: 10s autoplay (paused on hover, focus, or
// an open lightbox — re-checked live each tick so a stale flag can't strand it),
// horizontal swipe, in-view gating, and reduced-motion. `advance(delta)` is the
// only thing each carousel supplies. Returns `start` so click/keyboard handlers
// can restart the timer after a manual move.
// Lifted out of output-builder.astro so a second carousel reuses it rather than
// growing its own copy with its own timings.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export const autoCarousel = (
  carousel: HTMLElement,
  advance: (delta: number) => void,
  // Off where the container scroll-snaps: the browser already handles the
  // swipe, and advancing on top of it would jump two slides.
  { swipe = true }: { swipe?: boolean } = {},
) => {
  let intervalId: number | undefined;
  let isVisible = false;

  const start = () => {
    if (intervalId !== undefined) window.clearInterval(intervalId);
    intervalId = undefined;
    if (!isVisible || reduceMotion.matches) return;
    intervalId = window.setInterval(() => {
      if (
        carousel.matches(":hover") ||
        carousel.contains(document.activeElement) ||
        document.querySelector(".cs-lightbox.is-open")
      )
        return;
      advance(1);
    }, 10000);
  };

  if (swipe) {
    let touchStartX = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    carousel.addEventListener(
      "touchend",
      (e) => {
        start();
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (dx < -50) advance(1);
        if (dx > 50) advance(-1);
      },
      { passive: true },
    );
  }

  new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      start();
    },
    { threshold: 0.25 },
  ).observe(carousel);

  reduceMotion.addEventListener("change", start);
  return start;
};
