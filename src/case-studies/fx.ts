import { useEffect } from "react";
import "./fx.css";

// Word-split every text node under el, preserving inline markup (<em>, <br>).
function splitWords(el: HTMLElement) {
  let i = 0;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = (node.textContent || "").split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach((w) => {
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
}

// Shared interaction FX for case-study pages, mirroring the landing page:
// scroll progress bar, word-cascade headings, staggered card grids, and
// magnetic primary buttons. Runs after hydration so SSR markup is untouched.
export function useCaseStudyFx() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // Scroll progress bar, driven by the study's own scroll container and
    // mounted directly below the topbar (a flex item in the overlay shell).
    const scroller =
      document.querySelector<HTMLElement>(".obv3-scroll, .ps-scroll") ??
      document.querySelector<HTMLElement>(".ft-overlay, .as-overlay");
    const topbar = document.querySelector<HTMLElement>(
      ".obv3-topbar, .ps-topbar, .ft-topbar, .as-topbar",
    );
    if (scroller && topbar) {
      const bar = document.createElement("div");
      bar.className = "csfx-progress";
      topbar.insertAdjacentElement("afterend", bar);
      let raf = 0;
      const update = () => {
        raf = 0;
        const max = scroller.scrollHeight - scroller.clientHeight;
        // Custom property, not style.transform — see fx.css header.
        bar.style.setProperty(
          "--p",
          String(max > 0 ? scroller.scrollTop / max : 0),
        );
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      scroller.addEventListener("scroll", onScroll, { passive: true });
      update();
      cleanups.push(() => {
        scroller.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(raf);
        bar.remove();
      });
    }

    if (!reduced) {
      // Word cascade on section + footer headings
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            io.unobserve(e.target);
          });
        },
        { threshold: 0.3 },
      );
      document
        .querySelectorAll<HTMLElement>(
          "h2.obv3-heading, h2.ps-heading, h2.case-footer__title",
        )
        .forEach((h) => {
          splitWords(h);
          h.classList.add("csfx-words");
          io.observe(h);
        });
      cleanups.push(() => io.disconnect());

      // Staggered reveal for card grids / lists
      const gio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            gio.unobserve(e.target);
          });
        },
        { threshold: 0.15 },
      );
      document
        .querySelectorAll<HTMLElement>(
          [
            ".obv3-principles-cards",
            ".obv3-flow-container",
            ".obv3-feature__helps-list",
            ".ps-audit-grid",
            ".ps-outcomes-grid",
          ].join(", "),
        )
        .forEach((grid) => {
          [...grid.children].forEach((c, i) => {
            (c as HTMLElement).style.transitionDelay = `${i * 90}ms`;
          });
          grid.classList.add("csfx-stagger");
          gio.observe(grid);
        });
      cleanups.push(() => gio.disconnect());

      // Body content — prose, quotes, section numbers, stats, feature cards.
      // Revealed individually as each enters, so long sections cascade with
      // the scroll instead of arriving as one slab. Runs after the grids above
      // so the .csfx-stagger guard below can see them.
      const rio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            rio.unobserve(e.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -8% 0px" },
      );
      document
        .querySelectorAll<HTMLElement>(
          [
            ".obv3-body",
            ".obv3-blockquote",
            ".obv3-subheading",
            ".obv3-section__number",
            ".obv3-feature-card",
            ".obv3-impact-stat",
            ".ps-body",
            ".ps-section__number",
            ".ps-audit-card",
            ".ps-outcome-card",
            ".ps-redesign-card__text",
            ".cd-stat",
            ".case-footer__sub",
          ].join(", "),
        )
        .forEach((el) => {
          // Grids already stagger their own children; don't double-hide them.
          if (el.closest(".csfx-stagger")) return;
          el.classList.add("csfx-rise");
          rio.observe(el);
        });
      cleanups.push(() => rio.disconnect());
    }

    // Magnetic pull on back buttons and footer CTA
    if (fine && !reduced) {
      document
        .querySelectorAll<HTMLElement>(
          ".download-button, .obv3-back, .ps-back, .ft-back, .as-back",
        )
        .forEach((btn) => {
          btn.classList.add("csfx-mag");
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            // Custom properties, not style.transform — see fx.css header.
            btn.style.setProperty("--mx", `${dx * 0.18}px`);
            btn.style.setProperty("--my", `${dy * 0.28}px`);
          };
          const leave = () => {
            btn.style.removeProperty("--mx");
            btn.style.removeProperty("--my");
          };
          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });
    }

    return () => cleanups.forEach((f) => f());
  }, []);
}
