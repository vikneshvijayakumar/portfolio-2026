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
          ".obv3-datamodel-grid",
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

  // Leaving a study: step back through history when we came from the site, so
  // the portfolio restores its scroll position at the card that was clicked.
  // Only a fresh entry (direct link, new tab) falls through to a real "/" load.
  // Same-origin isn't enough: a direct hit (or a reload) can carry a referrer
  // pointing at this very page, and stepping back from that lands on whatever
  // the tab was showing before. Only a referrer that IS a landing page means
  // the previous entry is the portfolio.
  const LANDING_PATHS = ["/", "/canvas-landing"];
  const cameFromSite = () => {
    try {
      const from = new URL(document.referrer);
      return (
        from.origin === window.location.origin &&
        LANDING_PATHS.includes(from.pathname.replace(/\/$/, "") || "/") &&
        window.history.length > 1
      );
    } catch {
      return false;
    }
  };
  const goBack = () => {
    if (cameFromSite()) window.history.back();
    else window.location.href = "/";
  };

  // The on-page Back link is an <a href="/"> so it works without JS; upgrade it
  // to a history step when there's history to step through.
  document
    .querySelectorAll<HTMLAnchorElement>('a[aria-label^="Back"]')
    .forEach((a) => {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!cameFromSite()) return;
        e.preventDefault();
        window.history.back();
      });
    });

  // Escape returns to the portfolio (same as the Back link) — unless a lightbox
  // is open, in which case its own handler closes it first.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.querySelector(".cd-lightbox.is-open")) return;
    goBack();
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

// Fullscreen media lightbox, shared by every case study: single images, image
// galleries/carousels (Output Builder flow steps + explorations, with prev/next,
// counter, arrow keys and swipe), and expandable videos. Images support zoom +
// pan/pinch. Images are cloned in; a <video> node is *moved* into the lightbox
// and back so playback never restarts — its original class is saved and restored
// so it fits its home slot again on close.
function initLightbox() {
  const box = document.querySelector<HTMLElement>(".cd-lightbox");
  const content = box?.querySelector<HTMLElement>(".cd-lightbox__content");
  if (!box || !content) return;

  let videoHome: HTMLElement | null = null;
  let videoHomeClass = "";
  let videoWasMuted = true;

  // Zoom/pan state for the current image (videos keep their native controls).
  const zoomBar = box.querySelector<HTMLElement>(".cd-lightbox__zoom");
  const zoomLabel = box.querySelector<HTMLElement>(".cd-lightbox__zoom-level");
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  let zoomImg: HTMLImageElement | null = null;
  let scale = 1;
  let tx = 0;
  let ty = 0;

  const applyTransform = () => {
    if (!zoomImg) return;
    zoomImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    zoomImg.style.cursor = scale > 1 ? "grab" : "zoom-in";
    if (zoomLabel) zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  };
  const setZoom = (next: number) => {
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (scale === 1) {
      tx = 0;
      ty = 0;
    }
    applyTransform();
  };
  // Zoom so the point under (cx, cy) stays put — derived from transform-origin
  // center: t1 = t0 + (click - currentCenter) * (1 - s1/s0).
  const zoomToPoint = (next: number, cx: number, cy: number) => {
    if (!zoomImg) return;
    const s1 = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    const rc = zoomImg.getBoundingClientRect();
    const k = s1 / scale;
    tx += (cx - (rc.left + rc.width / 2)) * (1 - k);
    ty += (cy - (rc.top + rc.height / 2)) * (1 - k);
    scale = s1;
    applyTransform();
  };

  // Gallery/carousel state — a lone image is just a one-item gallery.
  const prevBtn = box.querySelector<HTMLElement>(".cd-lightbox__prev");
  const nextBtn = box.querySelector<HTMLElement>(".cd-lightbox__next");
  const counter = box.querySelector<HTMLElement>(".cd-lightbox__counter");
  let galleryImages: HTMLImageElement[] = [];
  let galleryIndex = 0;
  let onGalleryChange: ((i: number) => void) | null = null;
  const setNav = (visible: boolean) => {
    if (prevBtn) prevBtn.style.display = visible ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = visible ? "flex" : "none";
    if (counter) counter.style.display = visible ? "block" : "none";
  };

  let trigger: HTMLElement | null = null;
  const open = () => {
    trigger = document.activeElement as HTMLElement | null;
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    // Direct focus into the dialog for keyboard/AT users.
    box.querySelector<HTMLElement>(".cd-lightbox__close")?.focus();
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
    zoomImg = null;
    galleryImages = [];
    onGalleryChange = null;
    setNav(false);
    zoomBar?.setAttribute("hidden", "");
    // Move focus out of the dialog before hiding it from assistive tech,
    // otherwise aria-hidden traps focus on the close button.
    if (box.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    trigger?.focus();
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
    zoomBar?.setAttribute("hidden", "");
    galleryImages = [];
    setNav(false);
    vid.play().catch(() => {});
    open();
  };

  // Render the gallery image at `index`: reset zoom, sync the counter, and mirror
  // the change back to the source carousel so closing leaves it on the same slide.
  const showImage = (index: number, dir = 0) => {
    if (!galleryImages.length) return;
    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    const src = galleryImages[galleryIndex];
    content.innerHTML = "";
    const full = document.createElement("img");
    full.className = "cd-lightbox__img";
    full.src = src.src;
    full.alt = src.alt;
    full.draggable = false; // else the browser's native image-drag hijacks panning
    if (dir !== 0) full.style.animation = `cd-lb-slide-${dir < 0 ? "prev" : "next"} 0.3s ease`;
    content.appendChild(full);
    zoomImg = full;
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    if (counter) counter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
    onGalleryChange?.(galleryIndex);
  };
  const step = (delta: number) => {
    if (galleryImages.length > 1) showImage(galleryIndex + delta, delta);
  };
  const openImages = (
    images: HTMLImageElement[],
    start = 0,
    onChange: ((i: number) => void) | null = null,
  ) => {
    if (!images.length) return;
    galleryImages = images;
    onGalleryChange = onChange;
    zoomBar?.removeAttribute("hidden");
    setNav(images.length > 1);
    showImage(start);
    open();
  };
  const openImage = (img: HTMLImageElement | null) => {
    if (img) openImages([img]);
  };

  // Zoom controls: buttons, wheel-to-zoom, and drag-to-pan (images only).
  zoomBar?.querySelectorAll<HTMLElement>("[data-zoom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.zoom;
      if (kind === "in") setZoom(scale + 0.5);
      else if (kind === "out") setZoom(scale - 0.5);
      else setZoom(1);
    });
  });
  content.addEventListener(
    "wheel",
    (e) => {
      if (!zoomImg) return;
      e.preventDefault();
      if (e.ctrlKey) {
        // Trackpad pinch (and ctrl + wheel) zoom toward the cursor.
        zoomToPoint(scale - e.deltaY * 0.01, e.clientX, e.clientY);
      } else if (scale > 1) {
        // Zoomed in: a plain wheel / two-finger scroll pans instead of zooming,
        // so trackpad users don't zoom out when they mean to pan.
        tx -= e.deltaX;
        ty -= e.deltaY;
        applyTransform();
      } else {
        // Fitted: scroll up to zoom in toward the cursor.
        zoomToPoint(scale + (e.deltaY < 0 ? 0.25 : -0.25), e.clientX, e.clientY);
      }
    },
    { passive: false },
  );
  // Click/tap toggles zoom (fit ↔ 2×, toward the point); drag pans when zoomed;
  // two fingers pinch. A tap on the backdrop (not the image) closes the lightbox.
  const pointers = new Map<number, { x: number; y: number }>();
  let panning = false;
  let startX = 0;
  let startY = 0;
  let pinchDist = 0;
  let pinchScale = 1;
  let downX = 0;
  let downY = 0;
  let moved = false;
  let multiTouch = false;
  let downOnImg = false;

  const twoFingerDist = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  content.addEventListener("pointerdown", (e) => {
    if (!zoomImg) return;
    const onImg = e.target === zoomImg;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // Capture only when the press is on the image. Capturing a backdrop press
    // would retarget its click event to the image, breaking click-away-to-close.
    if (onImg) zoomImg.setPointerCapture?.(e.pointerId);
    zoomImg.style.transition = "none";
    if (pointers.size === 2) {
      multiTouch = true;
      panning = false;
      pinchDist = twoFingerDist();
      pinchScale = scale;
    } else if (pointers.size === 1) {
      downX = e.clientX;
      downY = e.clientY;
      moved = false;
      downOnImg = onImg;
      if (scale > 1 && onImg) {
        panning = true;
        startX = e.clientX - tx;
        startY = e.clientY - ty;
        zoomImg.style.cursor = "grabbing";
      }
    }
  });
  content.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.abs(e.clientX - downX) > 6 || Math.abs(e.clientY - downY) > 6) moved = true;
    if (pointers.size === 2 && pinchDist > 0) {
      setZoom(pinchScale * (twoFingerDist() / pinchDist));
    } else if (panning) {
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      applyTransform();
    }
  });
  const endPointer = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size !== 0) return;
    if (zoomImg) zoomImg.style.transition = "";
    // A clean tap on the image toggles zoom (fit ↔ 2× toward the point). Measure
    // the release distance too, not just the moved flag, so a fast drag whose
    // move events were sparse isn't misread as a tap (which would zoom out).
    const tapDist = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (!multiTouch && !moved && tapDist <= 6 && downOnImg) {
      if (scale > 1) setZoom(1);
      else zoomToPoint(2, downX, downY);
    } else {
      applyTransform();
    }
    panning = false;
    multiTouch = false;
  };
  content.addEventListener("pointerup", endPointer);
  content.addEventListener("pointercancel", endPointer);
  // Click on the empty area around the media (not the media itself) closes.
  content.addEventListener("click", (e) => {
    if (e.target === content) close();
  });

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

  // Output Builder gallery images (flow steps + exploration versions): open the
  // whole set as a swipeable gallery, mirroring navigation back to the source
  // carousel so closing lands on the same slide.
  document.querySelectorAll<HTMLElement>("[data-lightbox-trigger]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const img =
        btn instanceof HTMLImageElement
          ? btn
          : btn.parentElement?.querySelector<HTMLImageElement>("img");
      if (!img) return;
      const flow = btn.closest("[data-flow-carousel]");
      const exp = btn.closest("[data-exploration-carousel]");
      if (flow) {
        const imgs = [...flow.querySelectorAll<HTMLImageElement>("img")];
        const tabs = [...flow.querySelectorAll<HTMLButtonElement>("[data-flow-tab]")];
        openImages(imgs, Math.max(0, imgs.indexOf(img)), (i) => tabs[i]?.click());
      } else if (exp) {
        const imgs = [...exp.querySelectorAll<HTMLImageElement>("img")];
        const panels = [...exp.querySelectorAll<HTMLElement>("[data-exploration-panel]")];
        openImages(imgs, Math.max(0, imgs.indexOf(img)), (i) =>
          panels.forEach((p, pi) => {
            p.classList.toggle("is-active", pi === i);
            p.hidden = pi !== i;
          }),
        );
      } else {
        openImages([img]);
      }
    });
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    step(-1);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    step(1);
  });

  // Swipe between gallery images — only when not zoomed in, so a pan gesture
  // isn't hijacked into navigation.
  let swipeX = 0;
  box.addEventListener(
    "touchstart",
    (e) => {
      swipeX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );
  box.addEventListener(
    "touchend",
    (e) => {
      if (!box.classList.contains("is-open") || galleryImages.length <= 1 || scale > 1) return;
      const dx = e.changedTouches[0].screenX - swipeX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );

  box.querySelector(".cd-lightbox__close")?.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  window.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
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
