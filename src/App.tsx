import { useEffect, useMemo, useRef, useState, memo, lazy, Suspense } from "react";
import { motion, useSpring, useTransform, AnimatePresence, useMotionValue, useMotionValueEvent, animate } from "motion/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  toolbarLinks,
  zones,
  type Zone,
  type ZoneId,
} from "./content";
import { MOBILE_BREAKPOINT, STAGE, EASE } from "./utils/constants";

import SkillsCard from "./components/SkillsCard";
import Legend from "./components/Legend";

const OutputBuilder = lazy(() => import("./pages/OutputBuilder"));
const ExperienceStack = lazy(() => import("./components/ExperienceStack"));
const WorkCluster = lazy(() => import("./components/WorkCluster"));
const ProjectCards = lazy(() => import("./components/ProjectCards"));

import dribbbleIcon from "./assets/dribbble.svg";
import emailIcon from "./assets/email.svg";
import linkedinIcon from "./assets/linkedin.svg";
import logoSvg from "./assets/logo.svg?raw";
import moonSvg from "./assets/moon.svg?raw";
import profileImg from "./assets/profile.webp";
import sunSvg from "./assets/sun.svg?raw";
import googleUxBadge from "./assets/google-ux.webp";
import upworkBadge from "./assets/Upwork-TopRated-Badge.svg";
import whatsappIcon from "./assets/whatsapp.svg";
import antigravityBadge from "./assets/madewithantigravity.svg?raw";
import topArrowSvg from "./assets/top-right-arrow.svg?raw";
import pinIcon from "./assets/pin.svg";
import lookoutSvgRaw from "./assets/lookout.svg?raw";
import vanakkamBadge from "./assets/vanakkam.webp";

const lookoutSvgRawProcessed = lookoutSvgRaw
  .replace(/<svg[^>]*>/, '<svg id="lookout-sticker" viewBox="0 0 82 91" style="overflow:visible" xmlns="http://www.w3.org/2000/svg">')
  .replace(/clip-path="url\(#a\)"/g, "")
  .replace(/<path fill="#000101" d="([^"]+)"/, (_m, d) => {
    const mIndices = [...d.matchAll(/[mM]/g)].map(m => m.index);
    if (mIndices.length >= 2) {
      const d1 = d.substring(0, mIndices[1]);
      const d2_rel = d.substring(mIndices[1]);
      // Convert relative 'm-16.29 1.04' to absolute 'M18.71 16.37' based on the first pupil's start (35, 15.33)
      const d2_abs = d2_rel.replace(/^m\s*([\d.-]+)\s+([\d.-]+)/, (_m2: string, rx: string, ry: string) => {
        return `M${(35 + parseFloat(rx)).toFixed(2)} ${(15.33 + parseFloat(ry)).toFixed(2)}`;
      });
      return `<path fill="#000101" d="${d1}" /><path fill="#000101" d="${d2_abs}"`;
    }
    return _m;
  });


const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1.5;

const zoneNavItems: { id: ZoneId; label: string; key: string }[] = [
  { id: "about", label: "About", key: "1" },
  { id: "case-studies", label: "Case Studies", key: "2" },
  { id: "experience", label: "Experience", key: "3" },
  { id: "skills", label: "Skills", key: "4" },
  { id: "how-i-work", label: "Principles", key: "5" },
];

const LazySentinel = memo(function LazySentinel({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
});

/*
 * Default zoom scales with viewport size so the canvas feels right on
 * small laptops and large monitors alike. Reactive (function, not const)
 * so resize / rotate picks up the new value.
 */
const getDefaultZoom = (viewportWidth: number): number =>
  viewportWidth >= 1728 ? 1.0 : viewportWidth > 1400 ? 0.82 : 0.72;

type Camera = {
  x: number;
  y: number;
  scale: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/*
 * Core 2D camera transform helper: screen = world * scale + cameraOffset.
 * Inverting it gives world coords for a given screen point, which is the
 * piece needed for invariant-point zoom.
 */
function screenToWorld(screenX: number, screenY: number, camera: Camera) {
  return {
    x: (screenX - camera.x) / camera.scale,
    y: (screenY - camera.y) / camera.scale,
  };
}

function getCameraBounds(scale: number, viewportWidth: number, viewportHeight: number) {
  const scaledWidth = STAGE.width * scale;
  const scaledHeight = STAGE.height * scale;

  const minX = scaledWidth <= viewportWidth ? (viewportWidth - scaledWidth) / 2 : viewportWidth - scaledWidth;
  const maxX = scaledWidth <= viewportWidth ? minX : 0;
  const minY =
    scaledHeight <= viewportHeight ? (viewportHeight - scaledHeight) / 2 : viewportHeight - scaledHeight;
  const maxY = scaledHeight <= viewportHeight ? minY : 0;

  return { minX, maxX, minY, maxY };
}

function clampCamera(camera: Camera, viewportWidth: number, viewportHeight: number): Camera {
  const bounds = getCameraBounds(camera.scale, viewportWidth, viewportHeight);

  return {
    ...camera,
    x: clamp(camera.x, bounds.minX, bounds.maxX),
    y: clamp(camera.y, bounds.minY, bounds.maxY),
  };
}

function InlineAssetSvg({ html, className }: { html: string; className?: string }) {
  return (
    <span
      className={className ? `inline-asset-svg ${className}` : "inline-asset-svg"}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function boardMark() {
  return <InlineAssetSvg html={logoSvg} />;
}

function centerCamera(
  zone: Zone,
  viewportWidth: number,
  viewportHeight: number,
  scale: number = getDefaultZoom(viewportWidth),
): Camera {
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  const center = (isMobile && zone.mobileCenter) ? zone.mobileCenter : zone.desktopCenter;

  // Place `center` (world coord) at the viewport midpoint.
  return clampCamera(
    {
      x: viewportWidth / 2 - center.x * scale,
      y: viewportHeight / 2 - center.y * scale,
      scale,
    },
    viewportWidth,
    viewportHeight,
  );
}

/*
 * Zoom while keeping the world point under (originX, originY) pinned to
 * the same screen position. Standard invariant-point zoom.
 */
function zoomAroundPoint(
  camera: Camera,
  nextScale: number,
  originX: number,
  originY: number,
  viewportWidth: number,
  viewportHeight: number,
): Camera {
  const world = screenToWorld(originX, originY, camera);
  return clampCamera(
    {
      x: originX - world.x * nextScale,
      y: originY - world.y * nextScale,
      scale: nextScale,
    },
    viewportWidth,
    viewportHeight,
  );
}

function ThemeToggle({ theme, setTheme }: { theme: "paper" | "ink"; setTheme: (theme: "paper" | "ink") => void }) {
  return (
    <button
      className="theme-toggle-minimal"
      onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}
      type="button"
      aria-label={theme === "ink" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <InlineAssetSvg html={theme === "ink" ? sunSvg : moonSvg} />
    </button>
  );
}

function App() {
  const skipIntro = new URLSearchParams(window.location.search).has("skip-intro");
  const [activeCaseStudy, setActiveCaseStudy] = useState<string | null>(null);
  const [caseStudyOrigin, setCaseStudyOrigin] = useState<{ x: number; y: number } | null>(null);

  const [theme, setTheme] = useState<"paper" | "ink">(() => {
    const saved = window.localStorage.getItem("viknesh-theme");
    if (saved === "ink" || saved === "paper") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "ink" : "paper";
  });

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  const [isTablet, setIsTablet] = useState(typeof window !== "undefined" ? (window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= 1024) : false);
  const [isLazyReady, setIsLazyReady] = useState(false);
  const startAnimations = isMobile || isLazyReady;
  const [activeZone, setActiveZone] = useState<ZoneId>("about");
  const [isEntering, setIsEntering] = useState(true);
  const [isLoaded, setIsLoaded] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camScale = useMotionValue(0.40);
  const isKeyboardNav = useRef(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const wheelEndTimerRef = useRef<number | null>(null);
  // Drag + inertia state
  const dragStateRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
    startCamX: number;
    startCamY: number;
    startClientX: number;
    startClientY: number;
    // Velocity samples: ring buffer of last 5 {dx, dy, t}
    samples: Array<{ dx: number; dy: number; t: number }>;
    target: HTMLElement;
    hasMoved: boolean;
  } | null>(null);
  const inertiaRafRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);
  // Double-tap tracking for touch devices — records end time/position of
  // the last single-finger tap so we can detect a second tap close by.
  const lastTapRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const mobileZoneRefs = useRef<Record<ZoneId, HTMLElement | null>>({
    "case-studies": null,
    about: null,
    "how-i-work": null,
    experience: null,
    skills: null,
  });

  const isMac = typeof window !== 'undefined'
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
    : false;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const socialPos = {
    x: 2190 + (isMobile ? 100 : 0),
    y: 1170,
    rotate: -1
  };
  const madeWithPos = {
    x: 3080,
    y: 600 + (isMobile ? 100 : 0),
    rotate: -9
  };

  // Initial load effect removed as we now start loaded immediately
  useEffect(() => {
    // No-op or keep if needed for other logic
  }, []);

  const openCaseStudy = (id: string, origin?: { x: number; y: number }) => {
    if (origin) setCaseStudyOrigin(origin);
    setActiveCaseStudy(id);
    window.location.hash = id;
  };

  const closeCaseStudy = () => {
    setActiveCaseStudy(null);
    window.history.pushState(null, "", window.location.pathname + window.location.search);
  };

  // Handle deep linking and browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "output-builder") {
        setActiveCaseStudy(hash);
      } else if (!hash) {
        setActiveCaseStudy(null);
      }
    };

    // Check hash on initial load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (activeCaseStudy) {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, [activeCaseStudy]);

  // Initialize camera
  useEffect(() => {
    const initScale = 0.40;
    camX.set(window.innerWidth / 2 - (STAGE.width / 2) * initScale);
    camY.set(window.innerHeight / 2 - (STAGE.height / 2) * initScale);
    camScale.set(initScale);
  }, []);

  useEffect(() => {
    if (isEntering) {
      // Start the zoom-in immediately to simulate a purposeful scroll entry
      const timer = window.setTimeout(() => {
        moveToZone("about", getDefaultZoom(window.innerWidth));
        // Duration reflects a purposeful, smooth zoom
        window.setTimeout(() => {
          setIsEntering(false);
        }, 1800);
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [isLoaded, isEntering, isMobile]);

  useEffect(() => {
    window.localStorage.setItem("viknesh-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      const tablet = window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      const currentZone = zones.find((zone) => zone.id === activeZone)!;
      const centered = centerCamera(currentZone, window.innerWidth, window.innerHeight, camScale.get());
      camX.set(centered.x);
      camY.set(centered.y);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeZone]);

  useEffect(() => {
    const isWin = navigator.platform.toLowerCase().includes("win");
    if (isWin) {
      document.documentElement.classList.add("os-windows");
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;
    const rootStyle = document.documentElement.style;

    const commit = () => {
      rafId = null;
      rootStyle.setProperty("--mouse-x", `${mouseX}px`);
      rootStyle.setProperty("--mouse-y", `${mouseY}px`);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(commit);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (activeCaseStudy) return;

      const target = event.target as HTMLElement;
      const viewportEl = target.closest(".markdown-card__viewport") as HTMLElement | null;
      if (viewportEl) {
        event.preventDefault();
        if (!event.ctrlKey && !event.metaKey) {
          viewportEl.scrollTop += event.deltaY;
        }
        return;
      }

      event.preventDefault();
      const isZoom = event.ctrlKey || event.metaKey;

      if (isZoom) {
        const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
        const scaleDelta = Math.exp(-event.deltaY * 0.01);
        const nextScale = clamp(currentCamera.scale * scaleDelta, MIN_ZOOM, MAX_ZOOM);
        const zoomed = zoomAroundPoint(
          currentCamera,
          nextScale,
          event.clientX,
          event.clientY,
          window.innerWidth,
          window.innerHeight,
        );
        camX.set(zoomed.x);
        camY.set(zoomed.y);
        camScale.set(zoomed.scale);
      } else {
        const panX = event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
        const panY = event.shiftKey && event.deltaX === 0 ? 0 : event.deltaY;
        const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
        const panned = clampCamera(
          {
            x: currentCamera.x - panX,
            y: currentCamera.y - panY,
            scale: currentCamera.scale,
          },
          window.innerWidth,
          window.innerHeight,
        );
        camX.set(panned.x);
        camY.set(panned.y);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isMobile, activeCaseStudy]);



  const activeZoneIndex = zones.findIndex((zone) => zone.id === activeZone);


  const zoneSequence = useMemo(() => zones.map((zone) => zone.id), []);

  const panToPoint = (worldX: number, worldY: number) => {
    if (!isKeyboardNav.current) return;
    const scale = camScale.get();
    const cx = window.innerWidth / 2 - worldX * scale;
    const cy = window.innerHeight / 2 - worldY * scale;
    animate(camX, cx, { type: "spring", stiffness: 80, damping: 20, mass: 1 });
    animate(camY, cy, { type: "spring", stiffness: 80, damping: 20, mass: 1 });
  };

  useEffect(() => {
    const onKeyDown = () => { isKeyboardNav.current = true; };
    const onPointerDown = () => { isKeyboardNav.current = false; };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  const moveToZone = (zoneId: ZoneId, customScale?: number) => {
    setIsNavigating(true);
    setActiveZone(zoneId);

    const zone = zones.find((entry) => entry.id === zoneId)!;
    const isSmallPhone = window.innerWidth <= 402;
    const targetZoom = customScale ?? (isMobile ? (zone.targetScale?.mobile ?? getDefaultZoom(window.innerWidth)) - (isSmallPhone ? 0.15 : 0) : zone.targetScale?.desktop) ?? getDefaultZoom(window.innerWidth);
    const target = centerCamera(zone, window.innerWidth, window.innerHeight, targetZoom);

    animate(camX, target.x, { type: "spring", stiffness: 60, damping: 18, mass: 1 });
    animate(camY, target.y, { type: "spring", stiffness: 60, damping: 18, mass: 1 });
    animate(camScale, target.scale, { type: "spring", stiffness: 60, damping: 18, mass: 1 });

    // Reset navigating flag after animation roughly finishes
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const moveMobileBy = (direction: -1 | 1) => {
    const nextIndex = clamp(activeZoneIndex + direction, 0, zoneSequence.length - 1);
    moveToZone(zoneSequence[nextIndex]);
  };

  // Cancel any running inertia loop
  const cancelInertia = () => {
    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    // 1. If the tap starts on a specific interactive control (link, button), let native events flow.
    if (target.closest("a, button, label, input, textarea")) {
      return;
    }

    // 2. If the tap starts on fixed UI chrome (toolbar, dock, legend), stay out of its way.
    if (target.closest(".toolbar, .bottom-dock, .legend-wrapper, .mobile-zone-stepper")) {
      return;
    }

    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // NOTE: We don't call event.preventDefault() here anymore.
    // This allows native click events to flow if the user just taps.
    // Pointer capture and touch-action: none on the board handle the rest.

    // Kill any running inertia so grab feels instant
    cancelInertia();

    if (activePointersRef.current.size === 1) {
      dragStateRef.current = {
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        startCamX: camX.get(),
        startCamY: camY.get(),
        startClientX: event.clientX,
        startClientY: event.clientY,
        samples: [],
        target: target,
        hasMoved: false,
      };
    } else if (activePointersRef.current.size === 2) {
      // Setup pinch zoom
      const pts = Array.from(activePointersRef.current.values());
      pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      dragStateRef.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const ds = dragStateRef.current;

    // If we have a single pointer but haven't started "dragging" yet,
    // check if the user has moved enough to commit to a pan.
    if (ds && ds.pointerId === event.pointerId && !ds.hasMoved) {
      const moveDist = Math.hypot(event.clientX - ds.startClientX, event.clientY - ds.startClientY);
      if (moveDist > 4) {
        ds.hasMoved = true;
        stageRef.current?.setPointerCapture(event.pointerId);
        // Once we capture, we might want to kill inertia again just in case
        cancelInertia();
      }
    }

    // Only update camera if we have panned or are in a multi-touch pinch.
    if (activePointersRef.current.size === 2 && pinchDistRef.current !== null) {
      const pts = Array.from(activePointersRef.current.values());
      const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midpointX = (pts[0].x + pts[1].x) / 2;
      const midpointY = (pts[0].y + pts[1].y) / 2;

      const zoomFactor = newDist / pinchDistRef.current;
      pinchDistRef.current = newDist;

      const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
      const nextScale = clamp(currentCamera.scale * zoomFactor, MIN_ZOOM, MAX_ZOOM);
      const zoomed = zoomAroundPoint(
        currentCamera,
        nextScale,
        midpointX,
        midpointY,
        window.innerWidth,
        window.innerHeight
      );
      camX.set(zoomed.x);
      camY.set(zoomed.y);
      camScale.set(zoomed.scale);
      return;
    }

    if (!ds || ds.pointerId !== event.pointerId || !ds.hasMoved) return;

    const dx = event.clientX - ds.lastX;
    const dy = event.clientY - ds.lastY;
    ds.lastX = event.clientX;
    ds.lastY = event.clientY;

    // Record velocity sample (keep only last 5)
    const now = performance.now();
    ds.samples.push({ dx, dy, t: now });
    if (ds.samples.length > 5) ds.samples.shift();

    const nextX = ds.startCamX + (event.clientX - ds.startClientX);
    const nextY = ds.startCamY + (event.clientY - ds.startClientY);

    const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
    const panned = clampCamera(
      { x: nextX, y: nextY, scale: currentCamera.scale },
      window.innerWidth,
      window.innerHeight,
    );
    camX.set(panned.x);
    camY.set(panned.y);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchDistRef.current = null;
    }

    const ds = dragStateRef.current;
    if (!ds) return;

    if (!ds.hasMoved) {
      // It was a click, not a drag.
      const now = performance.now();
      // Double-tap to zoom (touch/pen only — mouse uses wheel + Cmd).
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        const last = lastTapRef.current;
        const DOUBLE_TAP_MS = 300;
        const DOUBLE_TAP_PX = 40;

        if (
          last &&
          now - last.t < DOUBLE_TAP_MS &&
          Math.hypot(event.clientX - last.x, event.clientY - last.y) < DOUBLE_TAP_PX
        ) {
          // Second tap — toggle between zoomed-in and default.
          lastTapRef.current = null;
          const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
          const defaultZoom = getDefaultZoom(window.innerWidth);
          const nearDefault = Math.abs(currentCamera.scale - defaultZoom) < 0.05;
          const targetScale = nearDefault
            ? clamp(defaultZoom * 1.8, MIN_ZOOM, MAX_ZOOM)
            : defaultZoom;
          const zoomed = zoomAroundPoint(
            currentCamera,
            targetScale,
            event.clientX,
            event.clientY,
            window.innerWidth,
            window.innerHeight,
          );
          animate(camX, zoomed.x, { type: "spring", stiffness: 120, damping: 20 });
          animate(camY, zoomed.y, { type: "spring", stiffness: 120, damping: 20 });
          animate(camScale, zoomed.scale, { type: "spring", stiffness: 120, damping: 20 });
        } else {
          lastTapRef.current = { t: now, x: event.clientX, y: event.clientY };
        }
      }
      dragStateRef.current = null;
      return;
    }

    stageRef.current?.releasePointerCapture(event.pointerId);

    // Any real drag invalidates pending double-tap state.
    lastTapRef.current = null;

    // Compute average velocity from recent samples
    const samples = ds.samples;
    dragStateRef.current = null;

    if (samples.length < 2) return;

    const recent = samples.slice(-4);
    const elapsed = recent[recent.length - 1].t - recent[0].t;
    if (elapsed <= 0) return;

    const totalDx = recent.reduce((sum, s) => sum + s.dx, 0);
    const totalDy = recent.reduce((sum, s) => sum + s.dy, 0);
    // px per ms → scale to ~60fps frame budget (16.67ms)
    const vx = (totalDx / elapsed) * 16.67;
    const vy = (totalDy / elapsed) * 16.67;

    // Minimum velocity to bother with inertia
    const speed = Math.hypot(vx, vy);
    if (speed < 1.5) return;

    // Start inertia loop
    const friction = 0.84; // lower = more friction (more grounded feel)
    let velX = vx;
    let velY = vy;

    const tick = () => {
      velX *= friction;
      velY *= friction;

      if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1) {
        return;
      }

      const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
      const next = clampCamera(
        {
          x: currentCamera.x + velX,
          y: currentCamera.y + velY,
          scale: currentCamera.scale,
        },
        window.innerWidth,
        window.innerHeight,
      );
      camX.set(next.x);
      camY.set(next.y);

      inertiaRafRef.current = requestAnimationFrame(tick);
    };

    inertiaRafRef.current = requestAnimationFrame(tick);
  };

  const adjustZoom = (direction: 1 | -1, originX?: number, originY?: number) => {
    const boardRect = stageRef.current?.getBoundingClientRect();
    const focusX =
      originX ?? (boardRect ? boardRect.left + boardRect.width / 2 : window.innerWidth / 2);
    const focusY =
      originY ?? (boardRect ? boardRect.top + boardRect.height / 2 : window.innerHeight / 2);

    const currentCamera = { x: camX.get(), y: camY.get(), scale: camScale.get() };
    const factor = direction === 1 ? 1.2 : 1 / 1.2;
    const nextScale = clamp(currentCamera.scale * factor, MIN_ZOOM, MAX_ZOOM);
    const zoomed = zoomAroundPoint(
      currentCamera,
      nextScale,
      focusX,
      focusY,
      window.innerWidth,
      window.innerHeight,
    );
    animate(camX, zoomed.x, { type: "spring", stiffness: 120, damping: 20 });
    animate(camY, zoomed.y, { type: "spring", stiffness: 120, damping: 20 });
    animate(camScale, zoomed.scale, { type: "spring", stiffness: 120, damping: 20 });
  };

  const resetZoom = () => {
    const zone = zones.find((entry) => entry.id === activeZone)!;
    const target = centerCamera(zone, window.innerWidth, window.innerHeight, getDefaultZoom(window.innerWidth));
    animate(camX, target.x, { type: "spring", stiffness: 120, damping: 20 });
    animate(camY, target.y, { type: "spring", stiffness: 120, damping: 20 });
    animate(camScale, target.scale, { type: "spring", stiffness: 120, damping: 20 });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Escape to close case studies or legend is always allowed
      if (event.key === "Escape") {
        if (activeCaseStudy) closeCaseStudy();
        if (isLegendOpen) setIsLegendOpen(false);
        return;
      }

      // Toggle legend on '?' (Shift + /)
      if (event.key === "?" && !activeCaseStudy) {
        setIsLegendOpen((prev) => !prev);
        return;
      }

      // Toggle Theme on 'T'
      if ((event.key === "t" || event.key === "T") && !activeCaseStudy) {
        setTheme(prev => prev === "ink" ? "paper" : "ink");
        return;
      }

      if (activeCaseStudy || isMobile) return;

      // Zoom Controls (Cmd/Ctrl + Key)
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "=" || event.key === "+") {
          event.preventDefault();
          adjustZoom(1, window.innerWidth / 2, window.innerHeight / 2);
        } else if (event.key === "-") {
          event.preventDefault();
          adjustZoom(-1, window.innerWidth / 2, window.innerHeight / 2);
        } else if (event.key === "0") {
          event.preventDefault();
          resetZoom();
        }
        return;
      }

      // Navigation Controls (Direct Keys)
      const currentIndex = zoneSequence.indexOf(activeZone);

      if (event.key === "ArrowRight" || event.key === "l" || event.key === "L") {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % zoneSequence.length;
        moveToZone(zoneSequence[nextIndex]);
      } else if (event.key === "ArrowLeft" || event.key === "h" || event.key === "H") {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + zoneSequence.length) % zoneSequence.length;
        moveToZone(zoneSequence[prevIndex]);
      } else if (["1", "2", "3", "4", "5"].includes(event.key)) {
        const index = parseInt(event.key) - 1;
        if (zoneSequence[index]) {
          event.preventDefault();
          moveToZone(zoneSequence[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZone, isMobile, activeCaseStudy, zoneSequence, setTheme]);

  useEffect(
    () => () => {
      if (wheelEndTimerRef.current) {
        window.clearTimeout(wheelEndTimerRef.current);
      }
      cancelInertia();
    },
    [],
  );

  return (
    <div
      className="app-container"
      onClick={() => {
        if (isLegendOpen) setIsLegendOpen(false);
      }}
    >
      {activeCaseStudy === "output-builder" && (
        <style>{`
          html, body { 
            overflow: hidden !important; 
            height: 100% !important;
            position: fixed !important;
            width: 100% !important;
          }
        `}</style>
      )}
      {/* Toolbar and footer rendered FIRST so they appear before canvas in tab order */}
      <header className="toolbar" data-interactive="true">
        <div className="toolbar__panel toolbar__panel--left">
          <div className="toolbar__left">
            <button
              className="toolbar__branding"
              onClick={() => moveToZone("about")}
              type="button"
            >
              <span className="toolbar__mark toolbar__mark--large">{boardMark()}</span>
              <div className="toolbar__identity">
                <span className="toolbar__name">Viknesh Vijayakumar</span>
                <span className="toolbar__role">Senior Product Designer</span>
              </div>
            </button>
            {!isMobile && (
              <ZoneNav onMove={moveToZone} activeZone={activeZone} isMobile={false} />
            )}
          </div>
        </div>

        <div className="toolbar__panel toolbar__panel--right">
          <div className="toolbar__actions">
            {!isMobile && !isTablet && <AvailabilityPill />}
            <div className="legend-trigger-wrapper">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLegendOpen(!isLegendOpen);
                }}
                className={`legend-trigger ${isLegendOpen ? 'is-active' : ''}`}
                aria-label="Show canvas controls"
              >
                ?
              </button>
              <Legend
                isOpen={isLegendOpen}
                modifierKey={modifierKey}
              />
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {!isMobile && !isTablet && (
              <a className="download-button toolbar__resume" href={toolbarLinks.resume} target="_blank" rel="noreferrer">
                Download Resume
              </a>
            )}
          </div>
        </div>
      </header>

      {!isMobile && (
        <div className="bottom-dock">
          <div className="bottom-dock__left">
            <ZoomControls
              scale={camScale}
              onZoomIn={() => adjustZoom(1)}
              onZoomOut={() => adjustZoom(-1)}
              onReset={resetZoom}
            />
          </div>
          <div className="bottom-dock__center">
            <SocialStrip className="social-strip--footer" />
          </div>
          <div className="bottom-dock__right">
            <div
              className="made-with-card"
              data-interactive="true"
              dangerouslySetInnerHTML={{
                __html: antigravityBadge
                  .replace('<svg', '<svg viewBox="0 0 174 36" shape-rendering="geometricPrecision"')
                  .replace(/width="174"|height="36"/g, '')
                  .replace(/fill="#(1F1915|202124)"/g, 'fill="currentColor"')
              }}
            />
          </div>
        </div>
      )}
      {isMobile && <ZoneNav onMove={moveToZone} activeZone={activeZone} isMobile />}

      <motion.div
        className="app-shell"
        animate={{
          scale: activeCaseStudy ? 0.98 : 1,
          opacity: activeCaseStudy ? 0.5 : 1
        }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="dynamic-grid-bg">
          <div className="dynamic-grid-bg__color-layer" />
          <div className="dynamic-grid-bg__glow-layer" />
        </div>
        <main
          ref={stageRef}
          className="board"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <motion.div
            className={`stage ${isEntering ? "is-entering" : ""}`}
            style={{
              height: STAGE.height,
              width: STAGE.width,
              x: camX,
              y: camY,
              scale: camScale,
            }}
          >
            <AboutCard isStarted={startAnimations} isMobile={isMobile} />
            <SkillsCard isMobile={isMobile} isStarted={startAnimations} />
            <Suspense fallback={null}>
              <LazySentinel onReady={() => setIsLazyReady(true)} />
              <ExperienceStack isMobile={isMobile} onFocusPoint={panToPoint} isStarted={startAnimations} />
              <ProjectCards onOpenCaseStudy={openCaseStudy} onFocusPoint={panToPoint} isMobile={isMobile} isStarted={startAnimations} />
              <WorkCluster isMobile={isMobile} isStarted={startAnimations} />
            </Suspense>
            <VanakkamSticker isStarted={startAnimations} />
            <BadgesCluster isMobile={isMobile} isStarted={startAnimations} />
            {!isMobile && <FloatingStatus isStarted={startAnimations} />}

            {isMobile && (
              <>
                <motion.div
                  className="social-card-canvas"
                  style={{
                    position: "absolute",
                    left: socialPos.x,
                    top: socialPos.y,
                    rotate: socialPos.rotate,
                    zIndex: 5,
                  }}
                >
                  <img src={pinIcon} className="social-card-pin" alt="" width={56} height={56} draggable="false" />
                  <SocialStrip className="is-mobile" />
                </motion.div>

                <motion.div
                  className="made-with-card made-with-card--canvas"
                  style={{
                    position: "absolute",
                    left: madeWithPos.x,
                    top: madeWithPos.y,
                    rotate: madeWithPos.rotate,
                    zIndex: 5,
                  }}
                  data-interactive="true"
                  dangerouslySetInnerHTML={{
                    __html: antigravityBadge
                      .replace('<svg', '<svg viewBox="0 0 174 36"')
                      .replace(/width="174"|height="36"/g, '')
                      .replace(/fill="#(1F1915|202124)"/g, 'fill="currentColor"')
                  }}
                />
              </>
            )}
          </motion.div>
        </main>
      </motion.div>

      <AnimatePresence>
        {activeCaseStudy === "output-builder" && (
          <Suspense fallback={null}>
            <OutputBuilder onBack={closeCaseStudy} origin={caseStudyOrigin} />
          </Suspense>
        )}
      </AnimatePresence>

      <SpeedInsights />
    </div>
  );
}



function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  scale: any; // MotionValue<number>
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const animatedScale = useSpring(scale.get() * 100, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  useMotionValueEvent(scale, "change", (latest: number) => {
    animatedScale.set(latest * 100);
  });

  const displayValue = useTransform(animatedScale, (latest) => `${Math.round(latest)}%`);

  return (
    <div className="zoom-controls" data-interactive="true">
      <button className="zoom-controls__button" onClick={onZoomOut} type="button" aria-label="Zoom out">
        -
      </button>
      <button className="zoom-controls__readout" onClick={onReset} type="button" aria-label="Reset zoom">
        <motion.span>{displayValue}</motion.span>
      </button>
      <button className="zoom-controls__button" onClick={onZoomIn} type="button" aria-label="Zoom in">
        +
      </button>
    </div>
  );
}

const cardReveal = {
  hidden: ({ rotate = 0 }: { rotate?: number }) => ({
    opacity: 0,
    y: 12,
    scale: 0.98,
    rotate: rotate
  }),
  visible: ({ index, rotate = 0 }: { index: number; rotate?: number }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rotate,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 32,
      delay: 0.4 + index * 0.12,
    },
  }),
};

const AboutCard = memo(function AboutCard({
  isStarted = false,
  isMobile = false,
}: {
  isStarted?: boolean;
  isMobile?: boolean;
}) {
  return (
    <motion.section
      className="about-card"
      style={{ left: 1710, top: 630 }}
      data-interactive="true"
      whileTap={{ scale: 0.98 }}
      initial={isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      animate={isStarted ? { opacity: 1, scale: 1 } : (isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 })}
      transition={isMobile ? { duration: 0 } : {
        opacity: { duration: 0.3, delay: 0 },
        scale: { type: "spring", stiffness: 300, damping: 25, delay: 0 }
      }}
    >
      <div className="avatar-disc">
        <img src={profileImg} alt="Viknesh Vijayakumar" width={120} height={120} draggable="false" />
      </div>
      <div className="about-card__header">
        <h1>Viknesh Vijayakumar</h1>
        <p>Senior Product Designer</p>
      </div>
      <p className="about-card__body">
        Over 10 years of experience in enterprise SaaS in fields like healthcare, AI, and edtech.
        I love taking complex systems with complicated workflows and technical limitations and turning
        them into user friendly interfaces that are easy to use and actually work.
      </p>
      <div className="about-card__footer">
        <a className="download-button" href={toolbarLinks.resume} target="_blank" rel="noreferrer">
          Download Resume
        </a>
      </div>
      <div className="about-card__copyright">
        Copyright © {new Date().getFullYear()} — Viknesh Vijayakumar
      </div>
    </motion.section>
  );
});





const VanakkamSticker = memo(function VanakkamSticker({ isStarted }: { isStarted: boolean }) {
  return (
    <motion.div
      className="vanakkam-sticker"
      data-interactive="true"
      whileHover={{ scale: 1.02, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
      animate={isStarted ? { opacity: 1, scale: 1, rotate: 12 } : { opacity: 0, scale: 0.9, rotate: 12 }}
      transition={{
        opacity: { duration: 0.3, delay: 0.1 },
        scale: { type: "spring", stiffness: 300, damping: 25, delay: 0.1 },
        rotate: { type: "spring", stiffness: 400, damping: 35 }
      }}
    >
      <img src={vanakkamBadge} alt="Vanakkam" className="vanakkam-sticker__image" width={180} height={180} draggable="false" />
    </motion.div>
  );
});

const BadgesCluster = memo(function BadgesCluster({
  isMobile = false,
  isStarted = false,
}: {
  isMobile?: boolean;
  isStarted?: boolean;
}) {
  const animProps = (isMobile || !isStarted) ? {
    initial: { opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.9 },
    animate: isStarted ? { opacity: 1, scale: 1 } : { opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.9 },
    transition: { duration: isMobile ? 0 : 0.3 }
  } : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };

  return (
    <div className="badges-cluster">
      <motion.a
        href="https://www.upwork.com/freelancers/~0124077c8ba1055975"
        target="_blank" rel="noreferrer" className="badge-link"
        {...animProps}
        transition={isMobile ? { duration: 0 } : {
          opacity: { duration: 0.3, delay: 0.05 },
          scale: { type: "spring", stiffness: 300, damping: 25, delay: 0.05 }
        }}
      >
        <img src={upworkBadge} alt="Upwork Top Rated" className="badge-image badge-image--upwork" width={200} height={56} draggable="false" />
        <span className="badge-tooltip">View Profile</span>
      </motion.a>
      <motion.a
        href="https://coursera.org/verify/professional-cert/7QG5LZC7FDAB"
        target="_blank" rel="noreferrer" className="badge-link"
        {...animProps}
        transition={isMobile ? { duration: 0 } : {
          opacity: { duration: 0.3, delay: 0.1 },
          scale: { type: "spring", stiffness: 300, damping: 25, delay: 0.1 }
        }}
      >
        <img src={googleUxBadge} alt="Google UX Design Certificate" className="badge-image badge-image--google" width={200} height={200} draggable="false" />
        <span className="badge-tooltip">See Certificate</span>
      </motion.a>
    </div>
  );
});


const SocialStrip = memo(function SocialStrip({ className = "" }: { className?: string }) {
  return (
    <footer className={`social-strip ${className}`} data-interactive="true">
      <a href={toolbarLinks.dribbble} target="_blank" rel="noreferrer">
        <img src={dribbbleIcon} alt="" width={22} height={22} draggable="false" />
        <span>vikneshvijayakumar</span>
      </a>
      <a href={toolbarLinks.linkedin} target="_blank" rel="noreferrer">
        <img src={linkedinIcon} alt="" width={22} height={22} draggable="false" />
        <span>vikneshvijayakumar</span>
      </a>
      <CopyContactButton
        text="+91 81488 36036"
        icon={whatsappIcon}
        copyValue="+918148836036"
      />
      <CopyContactButton
        text="hello@viknesh.me"
        icon={emailIcon}
        copyValue="hello@viknesh.me"
      />
    </footer>
  );
});

const ZoneNav = memo(function ZoneNav({
  onMove,
  activeZone,
  isMobile,
}: {
  onMove: (id: ZoneId) => void;
  activeZone: ZoneId;
  isMobile: boolean;
}) {
  const currentIndex = zoneNavItems.findIndex(item => item.id === activeZone);

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + zoneNavItems.length) % zoneNavItems.length;
    onMove(zoneNavItems[nextIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % zoneNavItems.length;
    onMove(zoneNavItems[nextIndex].id);
  };

  if (isMobile) {
    return (
      <motion.nav
        className="mobile-zone-stepper"
        data-interactive="true"
        onPanEnd={(_, info) => {
          if (info.offset.x > 30) handlePrev();
          else if (info.offset.x < -30) handleNext();
        }}
      >
        <button className="mobile-zone-stepper__arrow" onClick={handlePrev} type="button" aria-label="Previous section">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="mobile-zone-stepper__label-viewport">
          <motion.div
            className="mobile-zone-stepper__label-track"
            animate={{ x: (2 - currentIndex) * 110 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {zoneNavItems.map((item, idx) => (
              <span
                key={item.id}
                className={`mobile-zone-stepper__title ${idx === currentIndex ? "is-active" : "is-ghost"}`}
                onClick={() => onMove(item.id)}
              >
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>

        <button className="mobile-zone-stepper__arrow" onClick={handleNext} type="button" aria-label="Next section">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </motion.nav>
    );
  }

  return (
    <nav className="header-zone-nav" aria-label="Primary">
      {zoneNavItems.map((item) => (
        <button
          key={item.id}
          className={`header-zone-nav__item ${activeZone === item.id ? "is-active" : ""}`}
          onClick={() => onMove(item.id)}
          type="button"
        >
          <span className="header-zone-nav__label">{item.label}</span>
          {activeZone === item.id && (
            <motion.span
              layoutId="header-zone-nav-active"
              className="header-zone-nav__indicator"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
});

const AvailabilityPill = memo(function AvailabilityPill() {
  return (
    <div className="availability-pill">
      <span className="availability-pill__dot" />
      <span>Open for opportunities</span>
    </div>
  );
});

function CopyContactButton({ text, icon, copyValue }: { text: string; icon: string; copyValue: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();

    const performCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(copyValue)
        .then(performCopy)
        .catch(() => fallbackCopy(copyValue, performCopy));
    } else {
      fallbackCopy(copyValue, performCopy);
    }
  };

  const fallbackCopy = (value: string, callback: () => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    // Ensure it's not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <button className="social-strip__copy-btn" onClick={handleCopy} type="button">
      <img src={icon} alt="" width={22} height={22} draggable="false" />
      <span>{text}</span>
      <div className={`tooltip ${copied ? "is-copied" : ""}`}>
        <div className="tooltip__content">
          <span className="tooltip__label">Click to copy</span>
          <span className="tooltip__label">Copied!</span>
        </div>
      </div>
    </button>
  );
}

const FloatingStatus = memo(function FloatingStatus({ isStarted }: { isStarted: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;

    // Direct path finding by fill color
    const allPaths = Array.from(svg.querySelectorAll("path"));
    const eyePaths = allPaths.filter(p => {
      const f = p.getAttribute("fill")?.toLowerCase();
      const isWhite = f === "#fff" || f === "#ffffff";
      if (!isWhite) return false;
      // Ignore large paths like the clip path or stroke background
      const bbox = p.getBBox();
      return bbox.width < 30; 
    }) as SVGGraphicsElement[];
    
    const pupilPaths = allPaths.filter(p => {
      const f = p.getAttribute("fill")?.toLowerCase();
      return f === "#000101";
    }) as SVGPathElement[];

    if (eyePaths.length < 2 || pupilPaths.length < 2) return;

    // Sort by horizontal position
    eyePaths.sort((a, b) => a.getBBox().x - b.getBBox().x);
    pupilPaths.sort((a, b) => a.getBBox().x - b.getBBox().x);

    const eyes = [
      { eye: eyePaths[0], pupil: pupilPaths[0], ox: 0, oy: 0, mx: 0, my: 0, lcx: 0, lcy: 0 },
      { eye: eyePaths[1], pupil: pupilPaths[1], ox: 0, oy: 0, mx: 0, my: 0, lcx: 0, lcy: 0 }
    ];

    const recompute = () => {
      for (const e of eyes) {
        e.pupil.removeAttribute("transform");
        e.pupil.style.transform = "";
        const eb = e.eye.getBBox();
        const pb = e.pupil.getBBox();
        
        e.lcx = eb.x + eb.width / 2;
        e.lcy = eb.y + eb.height / 2;
        const pcx = pb.x + pb.width / 2;
        const pcy = pb.y + pb.height / 2;
        
        e.ox = e.lcx - pcx;
        e.oy = e.lcy - pcy;
        e.mx = (eb.width - pb.width) * 0.55;
        e.my = (eb.height - pb.height) * 0.55;
      }
    };

    recompute();
    const t = setTimeout(recompute, 300);

    let px = 0, py = 0, raf: number | null = null;
    const commit = () => {
      raf = null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      for (const e of eyes) {
        const vcx = e.lcx * ctm.a + e.lcy * ctm.c + ctm.e;
        const vcy = e.lcx * ctm.b + e.lcy * ctm.d + ctm.f;

        const dx = px - vcx;
        const dy = py - vcy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const a = Math.atan2(dy, dx);
        
        // Very aggressive strength at close range to ensure convergence
        const s = Math.min(d / 30, 1);
        const tx = Math.cos(a) * e.mx * s;
        const ty = Math.sin(a) * e.my * s;

        e.pupil.setAttribute("transform", `translate(${e.ox + tx}, ${e.oy + ty})`);
      }
    };

    const onMove = (e: MouseEvent) => {
      px = e.clientX; py = e.clientY;
      if (raf === null) raf = requestAnimationFrame(commit);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", recompute);

    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", recompute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isStarted]);

  return (
    <motion.div
      ref={containerRef}
      className="floating-status"
      initial={{ opacity: 0, scale: 0.9, rotate: -12 }}
      animate={isStarted ? { opacity: 1, scale: 1, rotate: -12 } : { opacity: 0, scale: 0.9, rotate: -12 }}
      transition={{
        opacity: { duration: 0.3, delay: 0.15 },
        scale: { type: "spring", stiffness: 300, damping: 25, delay: 0.15 },
        rotate: { type: "spring", stiffness: 400, damping: 35 }
      }}
      whileHover={{ scale: 1.02, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        containerRef.current?.focus();
      }}
      tabIndex={0}
      data-interactive="true"
    >
      <div className="floating-status__inner">
        <div className="floating-status__icon" dangerouslySetInnerHTML={{ __html: lookoutSvgRawProcessed }} />
      </div>
    </motion.div>
  );
});



export default App;
