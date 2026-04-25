import { useEffect, useMemo, useRef, useState, memo, lazy, Suspense } from "react";
import { motion, useSpring, useTransform, AnimatePresence, useMotionValue, useMotionValueEvent, animate } from "motion/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  experience,
  projects,
  toolbarLinks,
  workPrinciples,
  zones,
  type Project,
  type Zone,
  type ZoneId,
} from "./content";
const OutputBuilder = lazy(() => import("./pages/OutputBuilder"));
import arrowSvg from "./assets/arrow.svg?raw";
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
import dashboardImg from "./assets/dashboard.webp";
import formBuilderImg from "./assets/form-builder.webp";
import formTakingImg from "./assets/form-taking.webp";
import outputBuilderImg from "./assets/output-builder.webp";
import googleEyesIcon from "./assets/👀-(Compressify.io).svg";
import antigravityBadge from "./assets/madewithantigravity.svg?raw";
import topArrowSvg from "./assets/top-right-arrow.svg?raw";
import pinIcon from "./assets/pin.svg";
const EASE = [0.22, 1, 0.36, 1] as const;


const projectImages: Record<string, string> = {
  "dashboard.webp": dashboardImg,
  "form-builder.webp": formBuilderImg,
  "form-taking.webp": formTakingImg,
  "output-builder.webp": outputBuilderImg,
};

const STAGE = {
  width: 4500,
  height: 2500,
};

const MOBILE_BREAKPOINT = 720;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1.5;

const zoneNavItems: { id: ZoneId; label: string; key: string }[] = [
  { id: "about", label: "About", key: "1" },
  { id: "case-studies", label: "Case Studies", key: "2" },
  { id: "experience", label: "Experience", key: "3" },
  { id: "skills", label: "Skills", key: "4" },
  { id: "how-i-work", label: "Process", key: "5" },
];

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
            <AboutCard />
            <SkillsCard isMobile={isMobile} />
            <ExperienceStack isMobile={isMobile} onFocusPoint={panToPoint} />
            <ClockWidget />
            <BadgesCluster />
            <ProjectCards onOpenCaseStudy={openCaseStudy} onFocusPoint={panToPoint} />
            <WorkCluster />
            {!isMobile && <FloatingStatus />}

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
                  <img src={pinIcon} className="social-card-pin" alt="" draggable="false" />
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

function WarpHUD({ activeZone, onSnap }: { activeZone: ZoneId; onSnap: (id: ZoneId) => void }) {
  const navItems: { id: ZoneId; label: string; icon: string; key: string }[] = [
    { id: "about", label: "Home", icon: "🏠", key: "1" },
    { id: "case-studies", label: "Projects", icon: "📂", key: "2" },
    { id: "skills", label: "Skills", icon: "🛠️", key: "3" },
    { id: "experience", label: "History", icon: "💼", key: "4" },
    { id: "how-i-work", label: "Process", icon: "🧠", key: "5" },
  ];

  return (
    <nav className="warp-hud">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`warp-hud__item ${activeZone === item.id ? "is-active" : ""}`}
          onClick={() => onSnap(item.id)}
          type="button"
        >
          <span className="warp-hud__icon">{item.icon}</span>
          <span className="warp-hud__label">{item.label}</span>
          {activeZone === item.id && (
            <motion.div
              layoutId="warp-active"
              className="warp-hud__indicator"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
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

const AboutCard = memo(function AboutCard() {
  return (
    <motion.section
      className="about-card"
      style={{ left: 1710, top: 630 }}
      data-interactive="true"
      whileTap={{ scale: 0.98 }}
    >
      <div className="avatar-disc">
        <img src={profileImg} alt="Viknesh Vijayakumar" draggable="false" />
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


const SkillsCard = memo(function SkillsCard({ isMobile }: { isMobile: boolean }) {
  const [activeTab, setActiveTab] = useState(0);

  const style = {
    left: 1760,
    top: 1500,
  };

  const tabs = [
    {
      id: "systems",
      label: "systems-craft.md",
      version: "1.0.0-Finalv5",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">SYSTEMS_AND_CRAFT_RULES</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Architecture</span>: Always utilize Design Thinking and Information Architecture (IA) as the foundation.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Scalability</span>: Reference and extend professional design systems.</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span><span className="md-italic">Standard Kits</span>: MUI, shadcn, UntitledUI.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Prototyping_Engine</span>: </div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Static/Interactive: Figma</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Motion/Interaction: Jitter</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Vibe Coding</span>: </div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Agentic IDE: Antigravity, Codex, Windsurf, Open Code</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Chat Agents: Gemini, ChatGPT, Claude</div>
        </>
      )
    },
    {
      id: "specialization",
      label: "specialization.md",
      version: "1.0.0",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">DOMAIN_SPECIALIZATION</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Enterprise</span>: Optimized for SaaS complexity and high-density data visualization.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">AI_Integration</span>: Specialized in HITL (Human-in-the-Loop) design patterns.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Verticals</span>: Healthcare UX, EdTech, and high-stakes Investor Demos.</div>
        </>
      )
    },
    {
      id: "leadership",
      label: "leadership-skills.md",
      version: "1.0.0",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">DESIGN_LEADERSHIP_PROTOCOL</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Collaboration</span>: Prioritize cross-functional alignment and stakeholder buy-in.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Team Management</span>: Execute mentoring and design direction for teams (up to 7+).</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Process</span>: Operate within Agile methodologies and maintain high-fidelity client communication.</div>
        </>
      )
    },
    {
      id: "accessibility",
      label: "accessibility.md",
      version: "1.0.0",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">ACCESSIBILITY_VALIDATION</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Compliance</span>: All outputs must strictly adhere to WCAG 2.2 standards.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Evaluation</span>: Perform heuristic analysis on all UI components.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">UX_Copy</span>: Optimize for clarity via UX Writing and intuitive interaction design.</div>
        </>
      )
    }
  ];

  const currentTab = tabs[activeTab];
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const commonHeader = (
    <>
      <div className="markdown-card__line"><span className="md-comment"># PRODUCT_DESIGNER_SPEC: @viknesh.me</span></div>
      <div className="markdown-card__line"><span className="md-comment"># Version: {currentTab.version}</span></div>
      <div className="markdown-card__line"><span className="md-comment"># Capability Level: Senior / Founding Designer</span></div>
      <div className="markdown-card__line">&nbsp;</div>
    </>
  );

  return (
    <motion.section
      className={`markdown-card ${isMobile ? "is-mobile" : ""}`}
      style={style}
      data-interactive="true"
    >
      <div className="markdown-card__header">
        <div className="markdown-card__controls">
          <div className="markdown-card__dot markdown-card__dot--red" />
          <div className="markdown-card__dot markdown-card__dot--yellow" />
          <div className="markdown-card__dot markdown-card__dot--green" />
        </div>
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            className={activeTab === idx ? "markdown-card__tab is-active" : "markdown-card__tab"}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div ref={viewportRef} className="markdown-card__viewport">
        <div className="markdown-card__gutter" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, index: number) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className="markdown-card__content">
          {commonHeader}
          {currentTab.content}
        </div>
      </div>
    </motion.section>
  );
});

const ExperienceStack = memo(function ExperienceStack({ isMobile, onFocusPoint }: { isMobile: boolean; onFocusPoint: (worldX: number, worldY: number) => void }) {
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const lastToggleRef = useRef<number>(0);
  const stackCenter = { x: 450, y: 1750 }; // Center of experience zone on mobile

  const toggleFolder = (id: string) => {
    const now = performance.now();
    if (now - lastToggleRef.current < 300) return; // debounce duplicate events within 300ms
    lastToggleRef.current = now;
    setOpenFolderId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!openFolderId) return;
    const handleOutside = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(".experience-folder")) {
        setOpenFolderId(null);
      }
    };
    window.addEventListener("pointerdown", handleOutside);
    return () => window.removeEventListener("pointerdown", handleOutside);
  }, [openFolderId]);

  return (
    <>
      {experience.map((item, index) => {
        const desktopRotate = item.desktopPosition?.rotation ?? 0;
        const desktopX = item.desktopPosition?.x ?? 0;
        const desktopY = item.desktopPosition?.y ?? 0;

        let finalX = desktopX;
        if (isMobile) {
          if (item.company.includes("Upwork") || item.company === "Spiceblue") {
            finalX = desktopX + 140; // Move them closer to the 700/750 cluster
          }
        }

        const rotate = desktopRotate;
        const style = {
          left: finalX,
          top: desktopY,
          "--folder-color": item.logoColor ?? "#a886ff"
        } as React.CSSProperties;

        const folderId = item.role + item.company;
        const isOpen = openFolderId === folderId;

        return (
          <motion.article
            key={folderId}
            initial={{ rotate: rotate, left: style.left, top: style.top }}
            animate={{ rotate: rotate, left: style.left, top: style.top }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            whileTap={{ scale: 0.98 }}
            className={`experience-folder ${isOpen ? "is-open" : ""}`}
            style={style}
            data-interactive="true"
            tabIndex={0}
            onFocus={() => onFocusPoint(finalX, desktopY)}
            onClick={() => toggleFolder(folderId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFolder(folderId);
              }
            }}
          >
            <div className="experience-folder__back">
              <div className="experience-folder__tab"></div>
            </div>
            <div className="experience-folder__papers">
              <div className="experience-folder__paper experience-folder__paper--3"></div>
              <div className="experience-folder__paper experience-folder__paper--2"></div>
              <div className="experience-folder__paper experience-folder__paper--main">
                <p className="experience-folder__summary">{item.summary}</p>
              </div>
            </div>
            <div className="experience-folder__front">
              <div>
                <strong>{item.company}</strong>
                <span className="experience-folder__role">{item.role}</span>
              </div>
              <span className="experience-folder__period">{item.period}</span>
            </div>
          </motion.article>
        );
      })}
    </>
  );
});

const ProjectCards = memo(function ProjectCards({ onOpenCaseStudy, onFocusPoint }: { onOpenCaseStudy: (id: string, origin?: { x: number; y: number }) => void; onFocusPoint: (worldX: number, worldY: number) => void }) {
  const mobileStart = { x: 2300, y: 1000 };
  return (
    <>
      {projects.map((project, index) => {
        const desktopX = project.desktopPosition.x;
        const desktopY = project.desktopPosition.y;

        return (
          <ProjectCard
            key={project.title}
            project={project}
            index={index}
            onOpen={onOpenCaseStudy}
            onFocusPoint={onFocusPoint}
          />
        );
      })}
    </>
  );
});

const ProjectCard = memo(function ProjectCard({
  project,
  index = 0,
  onOpen,
  onFocusPoint,
}: {
  project: Project;
  index?: number;
  onOpen: (id: string, origin?: { x: number; y: number }) => void;
  onFocusPoint: (worldX: number, worldY: number) => void;
}) {
  const cardStyle = {
    left: project.desktopPosition.x,
    top: project.desktopPosition.y,
  };

  const rotate = project.desktopPosition.rotation;

  const formattedSummary = project.summary.split(/(\d+%)/).map((part, idx) =>
    part.match(/\d+%/) ? <strong key={idx}>{part}</strong> : part
  );

  const handleClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (project.title === "Output Builder") {
      const el = e?.currentTarget as HTMLElement | undefined;
      const rect = el?.getBoundingClientRect();
      const origin = rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : undefined;
      onOpen("output-builder", origin);
    }
  };

  return (
    <motion.article
      initial={{ rotate: rotate, left: cardStyle.left, top: cardStyle.top }}
      animate={{ rotate: rotate, left: cardStyle.left, top: cardStyle.top }}
      whileHover={{ y: -8, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      className={`project-card ${project.type === "concept" ? "project-card--concept" : ""} ${project.year === "Coming Soon" ? "is-disabled" : ""} ${project.title === "Output Builder" ? "is-clickable" : ""}`.trim()}
      style={cardStyle}
      data-interactive="true"
      onClick={handleClick}
      onFocus={project.title === "Output Builder" ? () => onFocusPoint(project.desktopPosition.x, project.desktopPosition.y) : undefined}
      tabIndex={project.title === "Output Builder" ? 0 : -1}
      onKeyDown={(e) => {
        if (project.title === "Output Builder" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="project-card__visual">
        <img
          src={projectImages[project.image]}
          alt={project.title}
          className="project-card__image"
          draggable="false"
        />
      </div>

      <div className="project-card__content">
        <p className="project-card__summary">
          {formattedSummary}
        </p>

        <div className="project-card__footer-meta">
          {project.title === "Output Builder" ? (
            <span className="project-card__company">
              {project.company} {project.year}
              <span
                className="project-card__metadata-arrow"
                dangerouslySetInnerHTML={{ __html: topArrowSvg.replace('stroke="#000"', 'stroke="currentColor"') }}
              />
            </span>
          ) : project.year === "Coming Soon" ? (
            <span className="project-card__coming-soon">Coming Soon</span>
          ) : (
            <span className="project-card__company">
              {project.company} {project.year}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
});

const CLOCK_GRADUATIONS = Array.from({ length: 60 }, (_, index) => (
  <div
    key={index}
    className={`clock-widget__graduation ${index % 5 === 0 ? "is-major" : ""}`}
    style={{ transform: `rotate(${index * 6}deg)` }}
  />
));

const getIstParts = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return {
    seconds: ist.getSeconds() + ist.getMilliseconds() / 1000,
    minutes: ist.getMinutes(),
    hours: ist.getHours(),
    display: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }),
  };
};

const ClockWidget = memo(function ClockWidget() {
  const [displayTime, setDisplayTime] = useState(() => getIstParts().display);
  const rootRef = useRef<HTMLDivElement>(null);

  // Snapshot the current time offsets ONCE on mount — hands are then driven
  // purely by CSS animation. No per-second React render, no state thrash.
  const offsetsRef = useRef<{ sec: number; min: number; hour: number } | null>(null);
  if (offsetsRef.current === null) {
    const { seconds, minutes, hours } = getIstParts();
    offsetsRef.current = {
      sec: seconds,
      min: minutes * 60 + seconds,
      hour: ((hours % 12) * 3600 + minutes * 60 + seconds),
    };
  }

  // Pause hand animations when the clock is scrolled/panned off-screen so the
  // compositor doesn't tick a GPU layer for an invisible widget.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        el.dataset.visible = entries[0]?.isIntersecting ? "true" : "false";
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Update the readable text once per minute — cheap, no layout thrash.
  useEffect(() => {
    const tick = () => setDisplayTime(getIstParts().display);
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60_000);
      (timeout as unknown as { interval?: number }).interval = interval as unknown as number;
    }, msUntilNextMinute);
    return () => {
      clearTimeout(timeout);
      const interval = (timeout as unknown as { interval?: number }).interval;
      if (interval) clearInterval(interval);
    };
  }, []);

  const { sec, min, hour } = offsetsRef.current;

  return (
    <motion.div
      ref={rootRef}
      className="clock-widget"
      data-interactive="true"
      data-visible="true"
      whileTap={{ scale: 0.98 }}
    >
      <div className="clock-widget__inner">
        <div className="clock-widget__graduations">{CLOCK_GRADUATIONS}</div>

        <div
          className="clock-widget__hand hour"
          style={{ animationDelay: `${-hour}s` }}
        />
        <div
          className="clock-widget__hand minute"
          style={{ animationDelay: `${-min}s` }}
        />
        <div
          className="clock-widget__hand second"
          style={{ animationDelay: `${-sec}s` }}
        />

        <div className="clock-widget__metadata">
          <span>Chennai, India</span>
          <strong>{displayTime}</strong>
        </div>
      </div>
    </motion.div>
  );
});

const BadgesCluster = memo(function BadgesCluster() {
  return (
    <div className="badges-cluster">
      <a href="https://www.upwork.com/freelancers/~0124077c8ba1055975" target="_blank" rel="noreferrer" className="badge-link">
        <img src={upworkBadge} alt="Upwork Top Rated" className="badge-image badge-image--upwork" draggable="false" />
        <span className="badge-tooltip">View Profile</span>
      </a>
      <a href="https://coursera.org/verify/professional-cert/7QG5LZC7FDAB" target="_blank" rel="noreferrer" className="badge-link">
        <img src={googleUxBadge} alt="Google UX Design Certificate" className="badge-image badge-image--google" draggable="false" />
        <span className="badge-tooltip">See Certificate</span>
      </a>
    </div>
  );
});

const WorkCluster = memo(function WorkCluster() {
  const rotations = [-2, 3, 1, -4];
  const mobileRefPoint = { x: 800, y: 850 };

  return (
    <section className="work-cluster" data-interactive="true">
      {workPrinciples.map((item, index) => {
        const desktopRotate = rotations[index % 4];
        const desktopPos = {
          left: 910 + (index % 2) * 290,
          top: 1430 + Math.floor(index / 2) * 320,
        };

        const rotate = desktopRotate;
        const style = desktopPos;

        return (
          <motion.article
            key={item.index}
            initial={{ rotate: rotate, left: style.left, top: style.top }}
            animate={{ rotate: rotate, left: style.left, top: style.top }}
            transition={{ type: "spring", stiffness: 800, damping: 45 }}
            whileHover={{ y: -8, rotate: 0, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`principle-card principle-card--${item.accent}`}
            style={style}
          >
            <div className="principle-card__header">
              <span>{item.index}</span>
            </div>
            <div className="principle-card__body">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          </motion.article>
        );
      })}
    </section>
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

const FloatingStatus = memo(function FloatingStatus() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilLeftRef = useRef<SVGPathElement>(null);
  const pupilRightRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    type EyeGeom = {
      eye: SVGGraphicsElement;
      pupil: SVGPathElement;
      offsetX: number;
      offsetY: number;
      maxDistX: number;
      maxDistY: number;
    };

    const eyes: EyeGeom[] = [];
    const leftEye = svg.querySelector("#eye-left") as SVGGraphicsElement | null;
    const rightEye = svg.querySelector("#eye-right") as SVGGraphicsElement | null;
    if (leftEye && pupilLeftRef.current) {
      eyes.push({ eye: leftEye, pupil: pupilLeftRef.current, offsetX: 0, offsetY: 0, maxDistX: 0, maxDistY: 0 });
    }
    if (rightEye && pupilRightRef.current) {
      eyes.push({ eye: rightEye, pupil: pupilRightRef.current, offsetX: 0, offsetY: 0, maxDistX: 0, maxDistY: 0 });
    }
    if (eyes.length === 0) return;

    let ctmA = 1;
    let ctmD = 1;

    // Cache intrinsic eye/pupil dimensions; these scale uniformly with CTM so
    // they stay valid under canvas pan/zoom. Viewport center is re-read per frame.
    const recomputeGeometry = () => {
      for (const e of eyes) {
        e.pupil.removeAttribute("transform");
        // Using getBBox() gives us coordinates in the SVG's local space (0-128),
        // which are zoom-invariant.
        const eyeBox = e.eye.getBBox();
        const pupilBox = e.pupil.getBBox();

        const eyeCenterX = eyeBox.x + eyeBox.width / 2;
        const eyeCenterY = eyeBox.y + eyeBox.height / 2;
        const pupilCenterX = pupilBox.x + pupilBox.width / 2;
        const pupilCenterY = pupilBox.y + pupilBox.height / 2;

        e.offsetX = eyeCenterX - pupilCenterX;
        e.offsetY = eyeCenterY - pupilCenterY;
        e.maxDistX = (eyeBox.width - pupilBox.width) / 2;
        e.maxDistY = (eyeBox.height - pupilBox.height) / 2;
      }
    };

    recomputeGeometry();

    let pointerX = 0;
    let pointerY = 0;
    let rafId: number | null = null;

    const commit = () => {
      rafId = null;
      for (const e of eyes) {
        // centerX/Y are still viewport-based so they track the eye's screen position correctly.
        const eyeRect = e.eye.getBoundingClientRect();
        const centerX = eyeRect.left + eyeRect.width / 2;
        const centerY = eyeRect.top + eyeRect.height / 2;

        const distX = pointerX - centerX;
        const distY = pointerY - centerY;
        const angle = Math.atan2(distY, distX);

        // Final position is calculated in SVG units and applied directly.
        const moveX = Math.cos(angle) * e.maxDistX;
        const moveY = Math.sin(angle) * e.maxDistY;

        e.pupil.setAttribute(
          "transform",
          `translate(${e.offsetX + moveX}, ${e.offsetY + moveY})`,
        );
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      pointerX = ev.clientX;
      pointerY = ev.clientY;
      if (rafId === null) rafId = requestAnimationFrame(commit);
    };

    let resizeRaf: number | null = null;
    const scheduleRecompute = () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        recomputeGeometry();
      });
    };

    // Only listen while the eyes are visible — avoids per-frame getBoundingClientRect
    // reads when the user has panned/scrolled them off-screen.
    let listening = false;
    const attach = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("resize", scheduleRecompute);
    };
    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", scheduleRecompute);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) attach();
        else detach();
      },
      { threshold: 0 },
    );
    io.observe(svg);

    return () => {
      io.disconnect();
      detach();
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <motion.div
      className="floating-status"
    >
      <svg
        ref={svgRef}
        id="eyes"
        width="128"
        height="128"
        viewBox="0 0 128 128"
        role="img"
        aria-label="googly eyes emoji that track the mouse cursor"
        className="floating-status__eyes"
      >
        <defs>
          <linearGradient id="eye-grad" x1="0" x2="0" y1="46.676" y2="82.083" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "#424242" }} />
            <stop offset="1" style={{ stopColor: "#212121" }} />
          </linearGradient>
          <g id="eye-shape">
            <path
              style={{ fill: "#fafafa" }}
              d="M34.16 106.51C18.73 106.51 6.19 87.44 6.19 64s12.55-42.51 27.97-42.51S62.13 40.56 62.13 64s-12.55 42.51-27.97 42.51"
            />
            <path
              style={{ fill: "#b0bec5" }}
              d="M34.16 23.49c6.63 0 12.98 4 17.87 11.27 5.22 7.75 8.1 18.14 8.1 29.24s-2.88 21.49-8.1 29.24c-4.89 7.27-11.24 11.27-17.87 11.27s-12.98-4-17.87-11.27C11.06 85.49 8.19 75.1 8.19 64s2.88-21.49 8.1-29.24c4.89-7.27 11.23-11.27 17.87-11.27m0-4C17.61 19.49 4.19 39.42 4.19 64s13.42 44.51 29.97 44.51S64.13 88.58 64.13 64 50.71 19.49 34.16 19.49"
            />
          </g>
        </defs>
        <use href="#eye-shape" id="eye-left" />
        <path
          ref={pupilLeftRef}
          id="pupil-left"
          style={{ fill: "url(#eye-grad)" }}
          d="M25.63 59.84c-2.7-2.54-2.1-7.58 1.36-11.26.18-.19.36-.37.55-.54-1.54-.87-3.23-1.36-5.01-1.36-7.19 0-13.02 7.93-13.02 17.7s5.83 17.7 13.02 17.7 13.02-7.93 13.02-17.7c0-1.75-.19-3.45-.54-5.05-3.24 2.33-7.11 2.64-9.38.51"
        />
        <g transform="translate(59.68 0)">
          <use href="#eye-shape" id="eye-right" />
          <path
            ref={pupilRightRef}
            id="pupil-right"
            style={{ fill: "url(#eye-grad)" }}
            d="M25.63 59.84c-2.7-2.54-2.1-7.58 1.36-11.26.18-.19.36-.37.55-.54-1.54-.87-3.23-1.36-5.01-1.36-7.19 0-13.02 7.93-13.02 17.7s5.83 17.7 13.02 17.7 13.02-7.93 13.02-17.7c0-1.75-.19-3.45-.54-5.05-3.24 2.33-7.11 2.64-9.38.51"
          />
        </g>
      </svg>
      <p>Open for opportunities</p>
    </motion.div>
  );
});

function Legend({ isOpen, modifierKey }: { isOpen: boolean; modifierKey: string }) {
  return (
    <div className="legend-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8, rotate: 2 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }}
            className="legend-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="legend-card__title">Canvas Controls</h3>

            <div className="legend-card__sections">
              <div className="legend-card__section">
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">Click</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">Drag</kbd>
                  </span>
                  <span className="legend-card__action">Pan Canvas</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">←</kbd>
                    <span className="legend-card__plus">/</span>
                    <kbd className="legend-card__key">→</kbd>
                  </span>
                  <span className="legend-card__action">Switch Section</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">1 - 5</kbd>
                  </span>
                  <span className="legend-card__action">Jump to Section</span>
                </div>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">{modifierKey}</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">Scroll</kbd>
                  </span>
                  <span className="legend-card__action">Smooth Zoom</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">{modifierKey}</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">0</kbd>
                  </span>
                  <span className="legend-card__action">Reset Zoom</span>
                </div>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">T</kbd>
                  </span>
                  <span className="legend-card__action">Switch Theme</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">Shift + /</kbd>
                  </span>
                  <span className="legend-card__action">Toggle Help</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
