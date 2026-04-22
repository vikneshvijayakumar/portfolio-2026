import { useEffect, useMemo, useRef, useState, memo } from "react";
import { motion, useSpring, useTransform } from "motion/react";
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
import { OutputBuilderv3 } from "./pages/OutputBuilderv3";
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

const MOBILE_BREAKPOINT = 900;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1.5;
const CASE_STUDY_PARAM = "case-study";
const OUTPUT_BUILDER_V3 = "output-builder-v3";
const DEFAULT_ZOOM =
  typeof window !== "undefined"
    ? window.innerWidth > 1400
      ? 0.82
      : 0.72
    : 0.8;

type Camera = {
  x: number;
  y: number;
  scale: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readCaseStudyFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = new URLSearchParams(window.location.search).get(CASE_STUDY_PARAM);
  return value === OUTPUT_BUILDER_V3 ? value : null;
}

function writeCaseStudyToUrl(caseStudyId: string | null, historyMode: "push" | "replace" = "push") {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (caseStudyId) {
    url.searchParams.set(CASE_STUDY_PARAM, caseStudyId);
  } else {
    url.searchParams.delete(CASE_STUDY_PARAM);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (historyMode === "replace") {
    window.history.replaceState({}, "", nextUrl);
    return;
  }

  window.history.pushState({}, "", nextUrl);
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
  scale: number = DEFAULT_ZOOM,
): Camera {
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  const center = (isMobile && zone.mobileCenter) ? zone.mobileCenter : zone.desktopCenter;

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

function zoomAroundPoint(
  camera: Camera,
  nextScale: number,
  originX: number,
  originY: number,
  viewportWidth: number,
  viewportHeight: number,
): Camera {
  const ratio = nextScale / camera.scale;
  const nextCamera = {
    x: originX - (originX - camera.x) * ratio,
    y: originY - (originY - camera.y) * ratio,
    scale: nextScale,
  };

  return clampCamera(nextCamera, viewportWidth, viewportHeight);
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
  const [activeStandaloneCaseStudy, setActiveStandaloneCaseStudy] = useState<string | null>(readCaseStudyFromUrl);

  const [theme, setTheme] = useState<"paper" | "ink">(() => {
    const saved = window.localStorage.getItem("viknesh-theme");
    return saved === "ink" ? "ink" : "paper";
  });
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  const [isTablet, setIsTablet] = useState(typeof window !== "undefined" ? (window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= 1024) : false);
  const [activeZone, setActiveZone] = useState<ZoneId>("about");
  const [isEntering, setIsEntering] = useState(true);
  const [isLoaded, setIsLoaded] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [camera, setCamera] = useState<Camera>(() => {
    // Initial Wide-Angle View (Better framed)
    const initScale = 0.40;
    return {
      x: window.innerWidth / 2 - (STAGE.width / 2) * initScale,
      y: window.innerHeight / 2 - (STAGE.height / 2) * initScale,
      scale: initScale,
    };
  });
  const [isWheelNavigating, setIsWheelNavigating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInertia, setIsInertia] = useState(false);
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
  } | null>(null);
  const inertiaRafRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);
  const mobileZoneRefs = useRef<Record<ZoneId, HTMLElement | null>>({
    "case-studies": null,
    about: null,
    "how-i-work": null,
    experience: null,
    skills: null,
  });

  const socialPos = useMemo(() => ({
    x: 2160 + (isMobile ? 100 : 0) + (Math.random() * 60 - 30),
    y: 1150 + (Math.random() * 40),
    rotate: Math.random() * 6 - 4
  }), [isMobile]);

  const madeWithPos = useMemo(() => ({
    x: 3060 + (Math.random() * 40 - 20),
    y: 580 + (Math.random() * 40 - 20),
    rotate: Math.random() * 6 - 3
  }), []);

  // Initial load effect removed as we now start loaded immediately
  useEffect(() => {
    // No-op or keep if needed for other logic
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveStandaloneCaseStudy(readCaseStudyFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const openStandaloneCaseStudy = (caseStudyId: string) => {
    writeCaseStudyToUrl(caseStudyId);
    setActiveStandaloneCaseStudy(caseStudyId);
  };

  const closeStandaloneCaseStudy = () => {
    writeCaseStudyToUrl(null);
    setActiveStandaloneCaseStudy(null);
  };

  if (activeStandaloneCaseStudy === OUTPUT_BUILDER_V3) {
    return <OutputBuilderv3 onBack={closeStandaloneCaseStudy} />;
  }

  useEffect(() => {
    if (isEntering) {
      // Start the zoom-in immediately to simulate a purposeful scroll entry
      const timer = window.setTimeout(() => {
        moveToZone("about", 0.8);
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
      setCamera((currentCamera) =>
        centerCamera(currentZone, window.innerWidth, window.innerHeight, currentCamera.scale),
      );
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

    let mouseX = 0;
    let mouseY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updateMousePos = () => {
      document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);
      rafId = requestAnimationFrame(updateMousePos);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(updateMousePos);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      // Check if we are zooming (pinch or ctrl+scroll)
      const isZoom = event.ctrlKey || event.metaKey;

      // If we are pinching, we ALWAYS want to zoom the canvas regardless of where the cursor is.
      // This prevents the browser's default full-page zoom.
      if (isZoom) {
        event.preventDefault();
        scheduleWheelIdle();
        setCamera((currentCamera) => {
          const scaleDelta = Math.exp(-event.deltaY * 0.004);
          const nextScale = clamp(currentCamera.scale * scaleDelta, MIN_ZOOM, MAX_ZOOM);
          return zoomAroundPoint(
            currentCamera,
            nextScale,
            event.clientX,
            event.clientY,
            window.innerWidth,
            window.innerHeight,
          );
        });
        return;
      }

      // For regular scrolling, decide if it's a canvas pan or an internal element scroll.
      const target = event.target as HTMLElement;
      const isInternalScroll = target.closest(".markdown-card__viewport, .case-study-overlay, .case-study-content");

      if (!isInternalScroll) {
        event.preventDefault();
        scheduleWheelIdle();
        setCamera((currentCamera) =>
          clampCamera(
            {
              x: currentCamera.x - event.deltaX,
              y: currentCamera.y - event.deltaY,
              scale: currentCamera.scale,
            },
            window.innerWidth,
            window.innerHeight,
          ),
        );
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isMobile]);



  const activeZoneIndex = zones.findIndex((zone) => zone.id === activeZone);
  const activeZoneMeta = zones[activeZoneIndex];

  const zoneSequence = useMemo(() => zones.map((zone) => zone.id), []);

  const moveToZone = (zoneId: ZoneId, customScale?: number) => {
    setIsNavigating(true);
    setActiveZone(zoneId);

    const zone = zones.find((entry) => entry.id === zoneId)!;
    const targetZoom = customScale ?? (isMobile ? zone.targetScale?.mobile : zone.targetScale?.desktop) ?? DEFAULT_ZOOM;

    setCamera(() =>
      centerCamera(zone, window.innerWidth, window.innerHeight, targetZoom),
    );

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
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const target = event.target as HTMLElement;
    // Don't prevent default for inputs/labels so they still focus/toggle
    if (!target.closest("input, label, textarea, button, a")) {
      event.preventDefault();
    }

    // Kill any running inertia so grab feels instant
    cancelInertia();
    setIsInertia(false);

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      dragStateRef.current = {
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        startCamX: camera.x,
        startCamY: camera.y,
        startClientX: event.clientX,
        startClientY: event.clientY,
        samples: [],
        target: target,
      };
      stageRef.current?.setPointerCapture(event.pointerId);
    } else if (activePointersRef.current.size === 2) {
      // Setup pinch zoom
      const pts = Array.from(activePointersRef.current.values());
      pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setIsDragging(false);
      dragStateRef.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointersRef.current.size === 2 && pinchDistRef.current !== null) {
      const pts = Array.from(activePointersRef.current.values());
      const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midpointX = (pts[0].x + pts[1].x) / 2;
      const midpointY = (pts[0].y + pts[1].y) / 2;

      const zoomFactor = newDist / pinchDistRef.current;
      pinchDistRef.current = newDist;

      setCamera((currentCamera) => {
        const nextScale = clamp(currentCamera.scale * zoomFactor, MIN_ZOOM, MAX_ZOOM);
        return zoomAroundPoint(
          currentCamera,
          nextScale,
          midpointX,
          midpointY,
          window.innerWidth,
          window.innerHeight
        );
      });
      return;
    }

    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== event.pointerId) return;

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

    setCamera((currentCamera) =>
      clampCamera(
        { x: nextX, y: nextY, scale: currentCamera.scale },
        window.innerWidth,
        window.innerHeight,
      ),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchDistRef.current = null;
    }

    const ds = dragStateRef.current;
    setIsDragging(false);
    if (!ds || ds.pointerId !== event.pointerId) return;

    stageRef.current?.releasePointerCapture(event.pointerId);

    // If movement was tiny, it's a click, not a pan.
    const moveDist = Math.hypot(event.clientX - ds.startClientX, event.clientY - ds.startClientY);
    if (moveDist < 6) {
      const interactive = ds.target.closest("a, button, label, input, [data-interactive='true']") as HTMLElement;
      if (interactive) {
        interactive.click();
      }
      dragStateRef.current = null;
      return;
    }

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
    const FRICTION = 0.91; // lower = more friction, 0.91 ≈ Shruti's feel
    const MIN_SPEED = 0.4;
    let velX = vx;
    let velY = vy;

    const tick = () => {
      velX *= FRICTION;
      velY *= FRICTION;

      const currentSpeed = Math.hypot(velX, velY);
      if (currentSpeed < MIN_SPEED) {
        inertiaRafRef.current = null;
        setIsInertia(false);
        return;
      }

      setCamera((currentCamera) =>
        clampCamera(
          {
            x: currentCamera.x + velX,
            y: currentCamera.y + velY,
            scale: currentCamera.scale,
          },
          window.innerWidth,
          window.innerHeight,
        ),
      );

      inertiaRafRef.current = requestAnimationFrame(tick);
    };

    inertiaRafRef.current = requestAnimationFrame(tick);
    setIsInertia(true);
  };

  const scheduleWheelIdle = () => {
    if (wheelEndTimerRef.current) {
      window.clearTimeout(wheelEndTimerRef.current);
    }

    setIsWheelNavigating(true);
    wheelEndTimerRef.current = window.setTimeout(() => {
      setIsWheelNavigating(false);
      wheelEndTimerRef.current = null;
    }, 120);
  };

  const adjustZoom = (direction: 1 | -1, originX?: number, originY?: number) => {
    const boardRect = stageRef.current?.getBoundingClientRect();
    const focusX =
      originX ?? (boardRect ? boardRect.left + boardRect.width / 2 : window.innerWidth / 2);
    const focusY =
      originY ?? (boardRect ? boardRect.top + boardRect.height / 2 : window.innerHeight / 2);

    setCamera((currentCamera) => {
      const nextScale = clamp(currentCamera.scale + direction * 0.12, MIN_ZOOM, MAX_ZOOM);
      return zoomAroundPoint(
        currentCamera,
        nextScale,
        focusX,
        focusY,
        window.innerWidth,
        window.innerHeight,
      );
    });
  };

  const resetZoom = () => {
    const zone = zones.find((entry) => entry.id === activeZone)!;
    setCamera(centerCamera(zone, window.innerWidth, window.innerHeight, DEFAULT_ZOOM));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isMobile || !(event.metaKey || event.ctrlKey)) {
        return;
      }

      if (event.key === "=" || event.key === "+") {
        event.preventDefault();
        adjustZoom(1, window.innerWidth / 2, window.innerHeight / 2);
      }

      if (event.key === "-") {
        event.preventDefault();
        adjustZoom(-1, window.innerWidth / 2, window.innerHeight / 2);
      }

      if (event.key === "0") {
        event.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZone, isMobile]);

  useEffect(
    () => () => {
      if (wheelEndTimerRef.current) {
        window.clearTimeout(wheelEndTimerRef.current);
      }
      cancelInertia();
      setIsInertia(false);
    },
    [],
  );

  return (
    <div className="app-shell">
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
          className={`stage ${isDragging || isWheelNavigating || isInertia ? "is-dragging" : ""
            } ${isEntering ? "is-entering" : ""}`}
          initial={false}
          animate={{
            x: camera.x,
            y: camera.y,
            scale: camera.scale,
          }}
          transition={
            isDragging || isWheelNavigating || isInertia
              ? { type: false }
              : isNavigating
                ? { type: "spring", stiffness: 60, damping: 18, mass: 1 }
                : {
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  mass: 1,
                  restDelta: 0.001
                }
          }
          style={{
            height: STAGE.height,
            width: STAGE.width,
          }}
        >
          <AboutCard />
          <SkillsCard />
          <ExperienceStack isMobile={isMobile} />
          <ClockWidget />
          <BadgesCluster />
          <ProjectCards onCaseStudyOpen={openStandaloneCaseStudy} />
          <WorkCluster />
          {!isMobile && <FloatingStatus />}

          {isMobile && (
            <>
              {/* Social Strip as a Canvas Card */}
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

              {/* Made With Badge as a Canvas Card */}
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
      <div className="bottom-dock">
        {!isMobile && (
          <div className="bottom-dock__left">
            <ZoomControls
              scale={camera.scale}
              onZoomIn={() => adjustZoom(1)}
              onZoomOut={() => adjustZoom(-1)}
              onReset={resetZoom}
            />
          </div>
        )}
        <div className="bottom-dock__center">
          {!isMobile ? <SocialStrip /> : <MobileZoneNav onMove={moveToZone} activeZone={activeZone} />}
        </div>
        <div className="bottom-dock__right">
          {!isMobile && (
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
          )}
        </div>
      </div>

      {/* <Preloader isLoaded={isLoaded} /> */}

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
                <div className="toolbar__breadcrumbs">
                  <div className="toolbar__namegroup">
                    <span className="toolbar__name">Viknesh Vijayakumar</span>
                    <span className="toolbar__role">Senior Product Designer</span>
                  </div>
                </div>
              </div>
            </button>
            {!isMobile && (
              <span className="availability-pill">
                <span className="availability-pill__dot" />
                Open for opportunities
              </span>
            )}
          </div>
        </div>

        <div className="toolbar__panel--right">
          <div className="toolbar__actions">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {!isMobile && (
              <a className="download-button" href={toolbarLinks.resume} target="_blank" rel="noreferrer">
                Download Resume
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Moved SocialStrip to Bottom Dock for desktop, so we don't need it as a floating article usually */}
    </div>
  );
}

function WarpHUD({ activeZone, onSnap }: { activeZone: ZoneId; onSnap: (id: ZoneId) => void }) {
  const navItems: { id: ZoneId; label: string; icon: string }[] = [
    { id: "about", label: "Home", icon: "🏠" },
    { id: "case-studies", label: "Projects", icon: "📂" },
    { id: "how-i-work", label: "Process", icon: "🧠" },
    { id: "experience", label: "History", icon: "💼" },
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
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const animatedScale = useSpring(scale * 100, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  useEffect(() => {
    animatedScale.set(scale * 100);
  }, [scale, animatedScale]);

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


const SkillsCard = memo(function SkillsCard() {
  const [activeTab, setActiveTab] = useState(0);

  const style = {
    left: 1760,
    top: 1500,
  };



  const tabs = [
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
      id: "systems",
      label: "systems-craft.md",
      version: "1.0.0-Finalv5",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">SYSTEMS_AND_CRAFT_RULES</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Architecture</span>: Always utilize Design Thinking and Information Architecture (IA) as the foundation.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Scalability</span>: Reference and extend professional design systems.</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span><span className="md-italic">*Standard Kits*</span>: MUI, shadcn, UntitledUI.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Prototyping_Engine</span>: </div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Static/Interactive: Figma</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Motion/Interaction: Jitter</div>
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
    }
  ];

  const currentTab = tabs[activeTab];

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
      className="markdown-card"
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
      <div className="markdown-card__viewport">
        <div className="markdown-card__gutter" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index: number) => (
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

const ExperienceStack = memo(function ExperienceStack({ isMobile }: { isMobile: boolean }) {
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const stackCenter = { x: 450, y: 1750 }; // Center of experience zone on mobile

  return (
    <>
      {experience.map((item, index) => {
        const desktopRotate = (item as any).desktopPosition?.rotation || 0;
        const desktopX = (item as any).desktopPosition?.x || 0;
        const desktopY = (item as any).desktopPosition?.y || 0;

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
          "--folder-color": (item as any).logoColor || "#a886ff"
        } as React.CSSProperties;

        const isOpen = openFolderId === item.role + item.company;

        return (
          <motion.article
            key={item.role + item.company}
            initial={{ rotate: rotate }}
            animate={{ rotate: rotate, left: style.left, top: style.top }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            whileTap={{ scale: 0.98 }}
            className={`experience-folder ${isOpen ? "is-open" : ""}`}
            style={style}
            data-interactive="true"
            onClick={() => setOpenFolderId(isOpen ? null : item.role + item.company)}
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

const ProjectCards = memo(function ProjectCards({ onCaseStudyOpen }: { onCaseStudyOpen: (id: string) => void }) {
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
            onCaseStudyOpen={onCaseStudyOpen}
          />
        );
      })}
    </>
  );
});

const ProjectCard = memo(function ProjectCard({
  project,
  index = 0,
  onCaseStudyOpen,
}: {
  project: Project;
  index?: number;
  onCaseStudyOpen: (id: string) => void;
}) {
  const cardStyle = {
    left: project.desktopPosition.x,
    top: project.desktopPosition.y,
  };

  const rotate = project.desktopPosition.rotation;

  const formattedSummary = project.summary.split(/(\d+%)/).map((part, idx) =>
    part.match(/\d+%/) ? <strong key={idx}>{part}</strong> : part
  );

  const handleClick = () => {
    if (project.title === "Output Builder") {
      onCaseStudyOpen(OUTPUT_BUILDER_V3);
    }
  };

  return (
    <motion.article
      layout
      initial={{ rotate: rotate }}
      animate={{ rotate: rotate, left: cardStyle.left, top: cardStyle.top }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`project-card ${project.type === "concept" ? "project-card--concept" : ""} ${project.year === "Coming Soon" ? "is-disabled" : ""} ${project.title === "Output Builder" ? "is-clickable" : ""}`.trim()}
      style={cardStyle}
      data-interactive={project.year === "Coming Soon" ? "false" : "true"}
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

const ClockWidget = memo(function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time in IST (Chennai)
  const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const seconds = istDate.getSeconds();
  const minutes = istDate.getMinutes();
  const hours = istDate.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  const displayTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return (
    <motion.div
      className="clock-widget"
      data-interactive="true"
      whileTap={{ scale: 0.98 }}
    >
      <div className="clock-widget__inner">
        <div className="clock-widget__graduations">
          {Array.from({ length: 60 }).map((_, index: number) => (
            <div
              key={index}
              className={`clock-widget__graduation ${index % 5 === 0 ? "is-major" : ""}`}
              style={{ transform: `rotate(${index * 6}deg)` }}
            />
          ))}
        </div>

        <div className="clock-widget__hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
        <div className="clock-widget__hand minute" style={{ transform: `rotate(${minDeg}deg)` }} />
        <div className="clock-widget__hand second" style={{ transform: `rotate(${secDeg}deg)` }} />

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
    <motion.div
      className="badges-cluster"
      data-interactive="true"
      whileTap={{ scale: 0.98 }}
    >
      <a href="https://www.upwork.com/freelancers/~0124077c8ba1055975" target="_blank" rel="noreferrer" className="badge-link">
        <img src={upworkBadge} alt="Upwork Top Rated" className="badge-image badge-image--upwork" draggable="false" />
        <span className="badge-tooltip">View Profile</span>
      </a>
      <a href="https://coursera.org/verify/professional-cert/7QG5LZC7FDAB" target="_blank" rel="noreferrer" className="badge-link">
        <img src={googleUxBadge} alt="Google UX Design Certificate" className="badge-image badge-image--google" draggable="false" />
        <span className="badge-tooltip">See Certificate</span>
      </a>
    </motion.div>
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
            layout
            initial={{ rotate: rotate }}
            animate={{ rotate: rotate, left: style.left, top: style.top }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
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

const MobileZoneNav = memo(function MobileZoneNav({ onMove, activeZone }: { onMove: (id: ZoneId) => void, activeZone: ZoneId }) {
  const navItems: { id: ZoneId; label: string }[] = [
    { id: "about", label: "About" },
    { id: "case-studies", label: "Case Studies" },
    { id: "experience", label: "Employment" },
    { id: "how-i-work", label: "Principles" },
    { id: "skills", label: "Skills" },
  ];

  const currentIndex = navItems.findIndex(item => item.id === activeZone);
  const currentItem = navItems[currentIndex] || navItems[0];

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
    onMove(navItems[nextIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % navItems.length;
    onMove(navItems[nextIndex].id);
  };

  const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
  const nextIndex = (currentIndex + 1) % navItems.length;
  const prevItem = navItems[prevIndex];
  const nextItem = navItems[nextIndex];

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
          {navItems.map((item, idx) => (
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
});

function CopyContactButton({ text, icon, copyValue }: { text: string; icon: string; copyValue: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

    const eyesData = [
      { eye: svg.querySelector("#eye-left") as SVGGraphicsElement, pupil: pupilLeftRef.current, offsetX: 0 },
      { eye: svg.querySelector("#eye-right") as SVGGraphicsElement, pupil: pupilRightRef.current, offsetX: 0 },
    ];

    const calcOffset = () => {
      eyesData.forEach((props) => {
        if (!props.pupil || !props.eye) return;
        props.pupil.removeAttribute("transform");
        const eyeRect = props.eye.getBoundingClientRect();
        const pupilRect = props.pupil.getBoundingClientRect();
        props.offsetX = (eyeRect.right - pupilRect.right - (pupilRect.left - eyeRect.left)) / 2;
      });
    };

    calcOffset();

    const handleMouseMove = (ev: MouseEvent) => {
      requestAnimationFrame(() => {
        eyesData.forEach(({ eye, pupil, offsetX }) => {
          if (!eye || !pupil) return;
          const eyeRect = eye.getBoundingClientRect();
          const centerX = eyeRect.left + eyeRect.width / 2;
          const centerY = eyeRect.top + eyeRect.height / 2;

          const distX = ev.clientX - centerX;
          const distY = ev.clientY - centerY;

          const pupilRect = pupil.getBoundingClientRect();
          const maxDistX = pupilRect.width / 2;
          const maxDistY = pupilRect.height / 2;

          const angle = Math.atan2(distY, distX);

          const newPupilX =
            offsetX + Math.min(maxDistX, Math.max(-maxDistX, Math.cos(angle) * maxDistX));
          const newPupilY = Math.min(maxDistY, Math.max(-maxDistY, Math.sin(angle) * maxDistY));

          const svgCTM = svg.getScreenCTM();
          if (!svgCTM) return;

          const scaledPupilX = newPupilX / svgCTM.a;
          const scaledPupilY = newPupilY / svgCTM.d;

          pupil.setAttribute("transform", `translate(${scaledPupilX}, ${scaledPupilY})`);
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", calcOffset);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", calcOffset);
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

function Preloader({ isLoaded }: { isLoaded: boolean }) {
  return (
    <div className={isLoaded ? "preloader is-hidden" : "preloader"} aria-hidden={isLoaded}>
      <div className="preloader__logo-container">
        <div className="preloader__logo-glow" />
        <div
          className="preloader__logo-svg"
          dangerouslySetInnerHTML={{ __html: logoSvg }}
        />
      </div>
      <div className="preloader__copy">
        <span>Portfolio @viknesh.me</span>
        <strong>Mapping systems into clarity</strong>
      </div>
    </div>
  );
}

export default App;
