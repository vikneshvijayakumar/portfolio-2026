// Single source of truth for "where does Back go?".
//
// Referrer sniffing alone can't answer it: a study can be entered directly, in a
// new tab, or after in-page hash navigation, and there are two landings (classic
// `/` and `/canvas-landing`) so the fallback can't be hardcoded to "/". Instead
// each landing records itself — path + scroll — as it is left, and studies read
// that back.
const KEY = "landing-return";

type Return = { path: string; y: number };

const read = (): Return | null => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};

// A restore done at parse time can drift: images decoding and the landing's own
// card-height equalisation both run later and move the page under us. Re-applied
// once at load, unless the visitor has started scrolling themselves.
const restoreScroll = (y: number) => {
  window.scrollTo(0, y);
  let touched = false;
  const mark = () => (touched = true);
  (["wheel", "touchstart", "keydown"] as const).forEach((t) =>
    window.addEventListener(t, mark, { once: true, passive: true }),
  );
  window.addEventListener(
    "load",
    () => {
      if (!touched) window.scrollTo(0, y);
    },
    { once: true },
  );
};

/**
 * Call once per landing page. Records it as home on the way out, and re-applies
 * the scroll position when a study navigates back into it. (On a real
 * back/forward the browser restores the same position itself; re-applying the
 * value we stored for that entry is a no-op.)
 */
export function initLanding() {
  const saved = read();
  if (saved?.path === location.pathname) {
    sessionStorage.removeItem(KEY);
    if (saved.y) restoreScroll(saved.y);
  }
  // pagehide, not unload: unload never fires on iOS Safari.
  window.addEventListener("pagehide", () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ path: location.pathname, y: window.scrollY }),
    );
  });
}

/**
 * Case-study Back: always ends up on the landing the visitor came from.
 * history.back() only when that landing is provably the previous entry, so the
 * browser's own bfcache + scroll restore does the work; otherwise a plain
 * navigation, with initLanding() restoring the scroll on arrival.
 */
export function goHome() {
  const home = read();
  let from: URL | null = null;
  try {
    from = document.referrer ? new URL(document.referrer) : null;
  } catch {
    from = null;
  }
  if (
    home &&
    history.length > 1 &&
    from?.origin === location.origin &&
    from.pathname === home.path
  ) {
    history.back();
    return;
  }
  location.href = home?.path ?? "/";
}
