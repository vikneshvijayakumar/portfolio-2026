// Vanilla behaviour for the static case-study pages: scroll progress bar,
// word-cascade headings, staggered grids, body rise, magnetic buttons, and
// Escape-to-go-back. This is the plain-DOM port of the old React `useCaseStudyFx`
// hook — no framework, no hydration. Loaded once from CaseStudyLayout.
//
// ponytail: transitional guard — while some studies are still React islands,
// this must not double-run alongside their in-island fx. Skip when an island is
// present; remove the guard once every study is static.

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

function initFx() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  // Scroll progress bar, driven by the study's own scroll container and
  // mounted directly below the topbar.
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
      bar.style.setProperty("--p", String(max > 0 ? scroller.scrollTop / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
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

    // Body content — revealed individually as each enters.
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
        if (el.closest(".csfx-stagger")) return;
        el.classList.add("csfx-rise");
        rio.observe(el);
      });
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
          btn.style.setProperty("--mx", `${dx * 0.18}px`);
          btn.style.setProperty("--my", `${dy * 0.28}px`);
        };
        const leave = () => {
          btn.style.removeProperty("--mx");
          btn.style.removeProperty("--my");
        };
        btn.addEventListener("pointermove", move);
        btn.addEventListener("pointerleave", leave);
      });
  }

  // Escape returns to the portfolio (same as the Back link) — unless a lightbox
  // is open, in which case its own handler closes it first.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.querySelector(".cd-lightbox.is-open")) return;
    if (
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1
    ) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
}

// Sidebar scrollspy: highlight the nav link for whichever section overlaps a
// thin band near the top of the scroll viewport. Challenge/Approach roll up to
// the Overview nav item, mirroring the original.
function initScrollSpy() {
  const nav = document.querySelector<HTMLElement>(".ps-sidenav, .obv3-sidenav");
  const scroll = document.querySelector<HTMLElement>(".ps-scroll, .obv3-scroll");
  if (!nav || !scroll) return;

  const sections = [
    ...scroll.querySelectorAll<HTMLElement>(
      ".ps-hero[id], .ps-section[id], .obv3-hero[id], .obv3-section[id]",
    ),
  ];
  // Clinical groups Challenge/Approach under the Overview nav item; every other
  // section maps to its own nav link.
  const navId = (id: string) =>
    id === "cd-challenge" || id === "cd-approach" ? "cd-overview" : id;
  const state = new Map<string, boolean>();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => state.set((e.target as HTMLElement).id, e.isIntersecting));
      const active = sections.find((s) => state.get(s.id));
      if (!active) return;
      const target = `#${navId(active.id)}`;
      nav.querySelectorAll("a").forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === target);
      });
    },
    { root: scroll, rootMargin: "-35% 0px -55% 0px", threshold: 0 },
  );
  sections.forEach((s) => io.observe(s));
}

// Fullscreen media lightbox, shared by clinical (image + intake video) and
// Output Builder (feature videos). Images are cloned in; a <video> node is
// *moved* into the lightbox and back so playback never restarts. The video's
// original class is saved and restored so it fits its home slot again on close.
function initLightbox() {
  const box = document.querySelector<HTMLElement>(".cd-lightbox");
  const content = box?.querySelector<HTMLElement>(".cd-lightbox__content");
  if (!box || !content) return;

  let videoHome: HTMLElement | null = null;
  let videoHomeClass = "";
  let videoWasMuted = true;

  const open = () => {
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    const vid = content.querySelector("video");
    if (vid && videoHome) {
      vid.className = videoHomeClass;
      vid.controls = false;
      vid.muted = videoWasMuted;
      videoHome.appendChild(vid);
      videoHome = null;
    }
    content.innerHTML = "";
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
  };

  const openVideo = (vid: HTMLVideoElement | null | undefined) => {
    if (!vid) return;
    content.innerHTML = "";
    videoHome = vid.parentElement as HTMLElement;
    videoHomeClass = vid.className;
    videoWasMuted = vid.muted;
    if (!vid.src && vid.dataset.src) {
      vid.src = vid.dataset.src;
      vid.load();
    }
    vid.className = "cd-lightbox__img";
    vid.controls = true;
    vid.muted = false;
    const slot = document.createElement("div");
    slot.className = "cd-lightbox__video-slot";
    slot.appendChild(vid);
    content.appendChild(slot);
    vid.play().catch(() => {});
    open();
  };

  const openImage = (img: HTMLImageElement | null) => {
    if (!img) return;
    content.innerHTML = "";
    const full = document.createElement("img");
    full.className = "cd-lightbox__img";
    full.src = img.src;
    full.alt = img.alt;
    content.appendChild(full);
    open();
  };

  // Clinical image/video maximize buttons.
  document.querySelectorAll<HTMLElement>(".cd-media-maximize").forEach((btn) => {
    btn.addEventListener("click", () => {
      const media = btn.closest(".cd-media");
      if (!media) return;
      if (btn.dataset.lightbox === "video") openVideo(media.querySelector("video"));
      else openImage(media.querySelector("img"));
    });
  });

  // Output Builder feature-video expand buttons open the same lightbox.
  document
    .querySelectorAll<HTMLElement>(".obv3-feature__fullscreen")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        openVideo(
          btn.closest(".obv3-feature__media-frame")?.querySelector("video"),
        ),
      );
    });

  box.querySelector(".cd-lightbox__close")?.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && box.classList.contains("is-open")) close();
  });
}

// Output Builder feature videos: lazy-loaded, and only the single most-visible
// one plays at a time (to save bandwidth/CPU). A fullscreen button uses the
// native fullscreen API. Videos carry data-src and no src until they play.
function initFeatureVideos() {
  const videos = [
    ...document.querySelectorAll<HTMLVideoElement>("video[data-src]"),
  ];
  if (!videos.length) return;

  const ratios = new WeakMap<HTMLVideoElement, number>();
  const pick = () => {
    let best: HTMLVideoElement | null = null;
    let bestRatio = 0;
    videos.forEach((v) => {
      const r = ratios.get(v) ?? 0;
      if (r > bestRatio) {
        bestRatio = r;
        best = v;
      }
    });
    videos.forEach((v) => {
      if (v === best && bestRatio > 0) {
        const target = v.dataset.src ?? "";
        const abs = target ? new URL(target, location.origin).href : "";
        if (v.src !== abs) {
          v.src = target;
          v.load();
        }
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) =>
        ratios.set(
          e.target as HTMLVideoElement,
          e.isIntersecting ? e.intersectionRatio : 0,
        ),
      );
      pick();
    },
    { rootMargin: "50px 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  videos.forEach((v) => io.observe(v));
  // Expanding a feature video is handled by the shared lightbox (initLightbox),
  // which moves this same node in and out so playback continues seamlessly.
}

// Skip while any study on the page is still a hydrated React island (it runs
// its own fx). Static studies have no <astro-island>, so this runs for them.
if (!document.querySelector("astro-island")) {
  initFx();
  initScrollSpy();
  initLightbox();
  initFeatureVideos();
}
