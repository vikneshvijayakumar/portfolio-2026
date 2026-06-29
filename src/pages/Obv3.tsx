import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { toolbarLinks } from "../content";
import CaseStudyFooter from "../components/CaseStudyFooter";
import "./Obv3.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  onBack: () => void;
  origin?: { x: number; y: number } | null;
};

type Feature = {
  title: string;
  body: string;
  helps: string[];
  videoPath: string;
  duration: string;
};

const FEATURES: Feature[] = [
  {
    title: "Automated Code Mapping",
    body: "Users select form questions from a list using an interface that focused on what they are trying to do, not how the system is doing it. The system handles response codes automatically in the backend.",
    helps: ["Less cognitive load", "No memorisation of codes", "Fewer mapping errors", "Easier for new users to pick up"],
    videoPath: "/assets/output-builder/work-with-data.mp4",
    duration: "0:17",
  },
  {
    title: "Visual Builder",
    body: "Template creation is now moved entirely inside the product. A visual builder without the bloated functions of a PDF tool is built within the product. Even non-technical admins can now create templates within minutes.",
    helps: ["Users can now see the output as they build", "No need to switch between the app and PDF tools", "Instant updates"],
    videoPath: "/assets/output-builder/drag-and-drop.mp4",
    duration: "0:11",
  },
  {
    title: "Flexible Customizations",
    body: "Users can now adjust layouts and styling easily. Enough control to handle real variation without adding a new learning curve.",
    helps: ["Simple yet flexible customization", "No need for external PDF tools"],
    videoPath: "/assets/output-builder/flexible-customization.mp4",
    duration: "0:13",
  },
  {
    title: "JSON Templates",
    body: "The visual builder made mapping automatic. But the underlying PDF model would have kept the same problems — every modification requiring a base file regeneration, more storage, and slow maintenance. I proposed moving to a JSON-based template model. Documents are generated on demand, only when needed. No base file to maintain.",
    helps: ["No base PDF file to maintain", "Edits are applied instantly", "Documents generated on demand", "Reduced storage"],
    videoPath: "/assets/output-builder/generate-template.mp4",
    duration: "0:15",
  },
  {
    title: "Smart Organizational Defaults",
    body: "Most organizations were rebuilding output templates with similar headers and layouts from scratch every time. I introduced predefined org defaults so users could start from a default template and only work with the form fields.",
    helps: ["Faster setup", "Reduces repetitive work", "Ensures consistency", "Better control for organizations"],
    videoPath: "/assets/output-builder/smart-defaults.mp4",
    duration: "0:19",
  },
];

// Track all mounted feature videos so only the most-visible one plays.
const activeVideos = new Set<HTMLVideoElement>();
const videoRatios = new WeakMap<HTMLVideoElement, number>();

function pickActiveVideo() {
  let best: HTMLVideoElement | null = null;
  let bestRatio = 0;
  activeVideos.forEach((v) => {
    const r = videoRatios.get(v) ?? 0;
    if (r > bestRatio) {
      bestRatio = r;
      best = v;
    }
  });
  activeVideos.forEach((v) => {
    if (v === best && bestRatio > 0) {
      const targetSrc = v.dataset.src ?? "";
      const absTarget = targetSrc ? new URL(targetSrc, window.location.origin).href : "";
      if (v.src !== absTarget) {
        v.src = targetSrc;
        v.load();
      }
      if (v.paused) v.play().catch(() => { });
    } else if (!v.paused) {
      v.pause();
    }
  });
}

function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.src = src;
    activeVideos.add(el);

    if (typeof IntersectionObserver === "undefined") {
      el.src = src;
      el.play().catch(() => { });
      return () => {
        activeVideos.delete(el);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          videoRatios.set(el, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        pickActiveVideo();
      },
      { rootMargin: "50px 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      activeVideos.delete(el);
      videoRatios.delete(el);
    };
  }, [src]);

  const handleFullscreen = () => {
    const el = ref.current;
    if (!el) return;
    // Ensure src is loaded before going fullscreen
    if (!el.src) el.src = src;

    type FsVideo = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const v = el as FsVideo;

    if (typeof v.webkitEnterFullscreen === "function") {
      // iOS Safari — native fullscreen player with full controls
      v.webkitEnterFullscreen();
    } else if (typeof el.requestFullscreen === "function") {
      el.requestFullscreen().catch(() => { });
    } else if (typeof v.webkitRequestFullscreen === "function") {
      v.webkitRequestFullscreen().catch(() => { });
    }
  };

  return (
    <>
      <video ref={ref} className={className} muted loop playsInline preload="none" />
      <button
        type="button"
        className="obv3-feature__fullscreen"
        onClick={handleFullscreen}
        aria-label="Expand video"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
    </>
  );
}

const NAV_SECTIONS = [
  { id: "obv3-hero", label: "Intro" },
  { id: "obv3-overview", label: "Overview" },
  { id: "obv3-discovery", label: "Discovery" },
  { id: "obv3-contrast", label: "Actual problem" },
  { id: "obv3-principles", label: "Principles" },
  { id: "obv3-solution", label: "Solution" },
  { id: "obv3-impact", label: "Impact" },
  { id: "obv3-evolution", label: "Future" },
  { id: "obv3-reflection", label: "Reflection" },
] as const;

function RevealSection({
  id,
  className,
  children,
  onVisible,
}: {
  id: string;
  className: string;
  children: ReactNode;
  onVisible?: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  // Active section = whichever one overlaps a thin band near the top of the
  // viewport, instead of "any pixel visible" (which made the nav jump early).
  const inView = useInView(ref, { once: false, margin: "-35% 0px -55% 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (inView && onVisible) onVisible(id);
  }, [inView, id, onVisible]);

  if (reduceMotion) {
    return (
      <section ref={ref} id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

function SectionBlock({
  id,
  className,
  number,
  title,
  eyebrow,
  heading,
  onVisible,
  children,
}: {
  id: string;
  className: string;
  number: string;
  title: string;
  eyebrow: string;
  heading?: React.ReactNode;
  onVisible?: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <RevealSection id={id} className={`obv3-section ${className}`} onVisible={onVisible}>
      <div className="obv3-section__inner">
        <div className="obv3-section__number">
          {number}<span>{title}</span>
        </div>
        <div>
          <div className="obv3-eyebrow">{eyebrow}</div>
          {heading && <h2 className="obv3-heading">{heading}</h2>}
          {children}
        </div>
      </div>
    </RevealSection>
  );
}

function ImpactStat({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="obv3-impact-stat"
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
    >
      <div className="obv3-stat-label">{label}</div>
      <div className="obv3-stat-num">{children}</div>
      <div className="obv3-stat-desc">{desc}</div>
    </motion.div>
  );
}

export default function Obv3({ onBack, origin }: Props) {
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const [activeId, setActiveId] = useState<string>("obv3-hero");
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroInView) {
      setActiveId("obv3-hero");
    }
  }, [heroInView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      className="obv3-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Output Builder case study"
      style={{ transformOrigin, willChange: "transform, opacity" }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={
        reduceMotion
          ? { duration: 0.2, ease: EASE }
          : {
            scale: { type: "spring", stiffness: 180, damping: 24, mass: 0.9 },
            opacity: { duration: 0.35, ease: EASE },
          }
      }
    >
      <div className="obv3-topbar">
        <button className="obv3-back" onClick={onBack} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div className="obv3-topbar__title">
          <span className="obv3-topbar__eyebrow">Empyra · 2024</span>
          <span className="obv3-topbar__name">Output Builder</span>
        </div>
      </div>

      <nav className="obv3-sidenav" aria-label="Sections">
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={activeId === s.id ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(s.id);
            }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div ref={scrollContainerRef} className="obv3-scroll">
        {/* HERO */}
        <motion.section
          ref={heroRef}
          id="obv3-hero"
          className="obv3-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="obv3-hero__inner">
            <div className="obv3-hero__main">
              <div className="obv3-hero__lede">
                <motion.h1
                  className="obv3-hero__title"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
                >
                  Cutting template creation from <em>days → hours</em>
                </motion.h1>

                <motion.p
                  className="obv3-hero__desc"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                >
                  Reframing a document generation workflow to remove a 2 to 3 day engineering bottleneck.
                </motion.p>

                <motion.div
                  className="obv3-scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 1 }}
                >
                  Scroll to explore
                </motion.div>
              </div>

              <motion.div
                className="obv3-hero__meta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
              >
                <div className="obv3-meta-item">
                  <span className="obv3-meta-label">Role</span>
                  <span className="obv3-meta-val">Solo Designer</span>
                </div>
                <div className="obv3-meta-item">
                  <span className="obv3-meta-label">Outcomes</span>
                  <span className="obv3-meta-val">90% Faster</span>
                </div>
                <div className="obv3-meta-item">
                  <span className="obv3-meta-label">Type</span>
                  <span className="obv3-meta-val">Workflow Redesign</span>
                </div>
                <div className="obv3-meta-item">
                  <span className="obv3-meta-label">Timeline</span>
                  <span className="obv3-meta-val">4 months</span>
                </div>
                <p className="obv3-hero__meta-note">
                  This is a deep dive into output generation, a part of a broader form ecosystem.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 01 OVERVIEW */}
        <SectionBlock
          id="obv3-overview"
          className="obv3-section--overview"
          onVisible={setActiveId}
          number="01"
          title="Overview"
          eyebrow="The Context"
          heading={
            <>
              A Hidden Dependency
              <br />
              Behind Every Document
            </>
          }
        >
          <p className="obv3-body">
            Organizations use complex forms to collect student data and generate official form outputs. But the workflow behind it required an engineer to manually create a template for each form. It required manual data mapping, multiple validation cycles, back and forth before the template reached production.
          </p>
          <p className="obv3-body">
            The original requirement was to improve the PDF creation experience. But as I mapped the actual workflow, it became clear that PDF creation wasn't the problem. The real issue was a hidden dependency that required days of an engineer's work to manually map form data into an output template layout.
          </p>
        </SectionBlock>

        {/* 02 DISCOVERY */}
        <SectionBlock
          id="obv3-discovery"
          className="obv3-section--contrast"
          onVisible={setActiveId}
          number="02"
          title="Discovery"
          eyebrow="Mapping the Workflow"
          heading={
            <>
              Where Effort Was
              <br />
              Actually Being Spent
            </>
          }
        >
          <p className="obv3-body">
            I started by mapping the full workflow of the users, admins, engineers, and system dependencies to understand where effort was actually wasted and who was affected by it the most. I found that most of the time was going into linking the template with the system rather than designing it.
          </p>

          <div className="obv3-flow-container">
            <div className="obv3-flow-card">
              <div className="obv3-flow-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip_clipboard_flow_1)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M35.3165 22.365C35.3165 19.12 35.1498 15.4916 34.8498 12.715C34.7791 11.2473 34.4467 9.80402 33.8682 8.45329C33.5749 8.01053 33.1583 7.66345 32.6698 7.45496C31.735 7.04531 30.7505 6.76009 29.7415 6.60662C29.5921 6.5864 29.4405 6.62319 29.317 6.70966C29.1934 6.79614 29.107 6.92596 29.0748 7.07329C29.0513 7.22549 29.0889 7.38082 29.1795 7.5054C29.27 7.62998 29.4061 7.7137 29.5582 7.73829C30.3293 7.87273 31.0782 8.08384 31.8048 8.37162C32.2048 8.49495 32.5598 8.73829 32.8215 9.06995C33.2715 10.2733 33.5182 11.545 33.5532 12.83C33.8032 15.575 33.8198 19.17 33.8198 22.38C33.8198 25.5933 33.9032 28.7216 33.8198 31.5C33.8365 33.0811 33.7532 34.6566 33.5698 36.2266C33.5698 36.4266 33.3865 36.61 33.3698 36.7266C29.9715 37.56 26.4848 37.975 22.9865 37.9566C18.0436 38.1629 13.0929 38.0794 8.15984 37.7066C7.64318 37.7066 7.14318 37.4066 6.96151 37.4566C6.88604 37.2064 6.83032 36.9506 6.79484 36.6916C6.79484 36.1083 6.67818 35.51 6.64484 35.1283C6.51151 33.5633 6.16151 26.275 5.91318 19.9016C5.71318 14.81 5.54651 10.3016 5.59651 9.78496V9.11829C6.14543 8.72979 6.79062 8.49973 7.46151 8.45329C8.14707 8.38662 8.83484 8.35884 9.52484 8.36996C9.40707 8.72551 9.31262 9.08662 9.24151 9.45329C9.21085 9.71294 9.21085 9.9753 9.24151 10.235C9.24151 10.7833 9.39151 11.4983 9.39151 11.4983C9.42226 11.709 9.52541 11.9024 9.68326 12.0454C9.8411 12.1883 10.0438 12.2719 10.2565 12.2816C10.2565 12.2816 14.9315 12.3816 19.2415 12.3816C21.6548 12.3816 23.9682 12.3816 25.2665 12.2483C25.3964 12.2316 25.5145 12.1646 25.5955 12.0618C25.6765 11.959 25.714 11.8284 25.6998 11.6983C25.6978 11.6333 25.6826 11.5695 25.6553 11.5105C25.6279 11.4515 25.589 11.3987 25.5407 11.3551C25.4925 11.3115 25.436 11.2781 25.3745 11.2569C25.3131 11.2357 25.248 11.2271 25.1832 11.2316C24.1665 11.2316 22.5365 11.2316 20.7232 11.115C17.1448 10.9483 12.8515 10.65 11.1065 10.5166V9.84995C11.1732 9.54773 11.256 9.24884 11.3548 8.95329C11.4382 8.70773 11.5493 8.4744 11.6882 8.25329C11.9847 7.8459 12.379 7.51975 12.8348 7.30496C13.6817 6.94896 14.563 6.68142 15.4648 6.50662L15.9982 6.38996C16.1343 6.37108 16.2651 6.32434 16.3824 6.25265C16.4997 6.18096 16.601 6.08586 16.6798 5.97329C16.7691 5.73756 16.7691 5.47735 16.6798 5.24162L16.4465 3.97829C16.45 3.72763 16.5068 3.48059 16.6131 3.25358C16.7194 3.02656 16.8729 2.82478 17.0632 2.66162C17.5515 2.26996 18.1182 1.98662 18.7265 1.83162C19.036 1.73979 19.3654 1.73979 19.6748 1.83162C20.0123 1.94409 20.3196 2.13221 20.5732 2.38162C20.9032 2.73162 21.1382 3.15996 21.2565 3.62829C21.3398 4.1794 21.3732 4.73384 21.3565 5.29162C21.3515 5.47328 21.4156 5.65007 21.536 5.78621C21.6563 5.92236 21.8239 6.0077 22.0048 6.02496C22.6271 6.08607 23.2371 6.20829 23.8348 6.39162C24.4248 6.54995 24.9882 6.80329 25.4982 7.13829C25.8982 7.41329 26.1865 7.82162 26.3148 8.28829C26.5115 8.84995 26.6282 9.43829 26.6648 10.035C26.6589 10.1128 26.669 10.191 26.6947 10.2648C26.7204 10.3385 26.761 10.4061 26.8141 10.4634C26.8671 10.5207 26.9314 10.5664 27.003 10.5977C27.0745 10.6289 27.1518 10.6451 27.2298 10.6451C27.3079 10.6451 27.3852 10.6289 27.4567 10.5977C27.5282 10.5664 27.5926 10.5207 27.6456 10.4634C27.6987 10.4061 27.7393 10.3385 27.765 10.2648C27.7907 10.191 27.8008 10.1128 27.7948 10.035C27.8332 9.20592 27.7203 8.37683 27.4615 7.58829C27.2436 7.00052 26.8561 6.49066 26.3482 6.12329C25.7403 5.70498 25.0795 5.36926 24.3832 5.12496C23.9216 4.96846 23.4493 4.84591 22.9698 4.75829C23.0013 4.14859 22.9394 3.53767 22.7865 2.94662C22.6094 2.36691 22.308 1.83283 21.9032 1.38162C21.4771 0.90751 20.948 0.537462 20.3565 0.299955C19.7248 0.0199553 19.0232 -0.0667114 18.3432 0.0499553C17.2448 0.307709 16.2484 0.887458 15.4815 1.71496C14.9013 2.34362 14.5851 3.17127 14.5982 4.02662C14.5815 4.27107 14.5815 4.51551 14.5982 4.75995C13.6616 4.94186 12.7509 5.23797 11.8865 5.64162C11.1461 5.98603 10.5051 6.51241 10.0232 7.17162C10.0322 7.21561 10.0322 7.26096 10.0232 7.30496C8.96704 7.27781 7.91033 7.32794 6.86151 7.45496C6.20484 7.57162 5.57984 7.82662 5.03151 8.20496C4.8494 8.33959 4.71041 8.52433 4.63151 8.73662C4.53707 9.03996 4.48151 9.35107 4.46484 9.66996V19.9366C4.56484 26.3583 4.73151 33.68 4.83151 35.2616C4.84262 36.0805 4.93151 36.89 5.09818 37.69C5.19984 38.1716 5.42318 38.6183 5.74818 38.9883C6.32651 39.3216 6.97651 39.515 7.64318 39.555C11.8365 39.9283 16.0482 40.0666 20.2565 39.97C25.9148 39.8533 31.7065 39.3533 34.3015 38.3066C34.5952 38.1865 34.8331 37.9605 34.9682 37.6733C35.3098 36.69 35.4782 35.6533 35.4665 34.6116C35.6498 31.5166 35.4165 26.675 35.3165 22.365Z" fill="var(--text)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.4189 26.0583C23.3115 25.9842 23.1872 25.938 23.0574 25.9241C22.9276 25.9101 22.7964 25.9288 22.6757 25.9785C22.555 26.0282 22.4486 26.1073 22.3662 26.2085C22.2838 26.3098 22.228 26.43 22.2039 26.5583C21.9173 27.725 21.5678 28.8733 21.1556 30.0033C20.7827 31.0878 20.2562 32.1132 19.5923 33.0483V33.1817H16.0139C14.7398 33.2011 13.4661 33.1231 12.2039 32.9483C11.9353 32.8016 11.6568 32.6735 11.3706 32.565C11.0889 31.0183 10.8723 28.805 10.6556 26.425C10.5223 25.01 10.3556 23.3467 10.2389 21.915C10.0245 19.4033 9.95273 16.8815 10.0239 14.3617C10.0291 14.2282 9.98407 14.0977 9.89766 13.9958C9.81125 13.894 9.68978 13.8283 9.55725 13.8117C9.42311 13.8028 9.29079 13.8466 9.18841 13.9338C9.08603 14.0209 9.02164 14.1445 9.00892 14.2783C8.61739 18.1093 8.52823 21.9651 8.74225 25.81C8.85225 28.3967 9.15892 30.9717 9.65892 33.5133C9.71492 33.7057 9.8146 33.8824 9.95019 34.0299C10.0858 34.1773 10.2536 34.2915 10.4406 34.3633C10.9073 34.5133 11.3839 34.6244 11.8706 34.6967C12.9306 34.7833 13.99 34.7833 15.0489 34.6967C22.0706 34.43 21.1223 34.4633 22.1873 34.2633C22.7495 34.1689 23.3045 34.0467 23.8523 33.8967C25.2913 33.5027 26.6529 32.8669 27.8789 32.0167C28.7589 31.4167 29.4506 30.58 29.8756 29.6033C30.7869 27.3915 31.1907 25.0035 31.0573 22.615V20.65C31.0573 20.0017 30.9239 19.32 30.8406 18.6867C30.6073 16.8067 30.2906 15.21 30.1073 14.1783C30.101 14.104 30.08 14.0316 30.0457 13.9653C30.0114 13.899 29.9643 13.8402 29.9071 13.7922C29.95 13.7442 29.7839 13.708 29.7127 13.6856C29.6415 13.6632 29.5666 13.655 29.4923 13.6617C29.4169 13.6657 29.3432 13.6851 29.2757 13.7189C29.2082 13.7526 29.1483 13.7998 29.0999 13.8577C29.0514 13.9155 29.0153 13.9827 28.994 14.0551C28.9756 14.2783V18.8367C28.9756 19.4533 28.9756 20.1033 29.0589 20.7667C29.1423 21.4333 29.1423 22.05 29.2089 22.6983C29.7089 27.3733 29.4089 27.1067 28.7439 29.1033C28.4006 29.8367 27.8106 30.4233 27.0806 30.7683C25.9498 31.4155 24.7173 31.8658 23.4356 32.1L22.2706 32.3C22.4206 31.9667 22.5539 31.6278 22.6706 31.2833C23.0773 30.1322 23.3934 28.9567 23.6189 27.7567C24.2289 27.9633 24.8723 28.0533 25.5156 28.0233C26.5046 27.9978 27.4738 27.7409 28.3456 27.2733C28.4797 27.2085 28.5829 27.0934 28.6328 26.953C28.6827 26.8127 28.6753 26.6583 28.6123 26.5233C28.5816 26.4535 28.5371 26.3906 28.4816 26.3384C28.426 26.2861 28.3605 26.2456 28.2889 26.2193C28.2173 26.193 28.1411 26.1815 28.065 26.1853C27.9888 26.1891 27.9142 26.2083 27.8456 26.2417C27.1223 26.575 26.3289 26.7283 25.5323 26.6917C24.7801 26.6983 24.0435 26.4775 23.4189 26.0583Z" fill="var(--obv3-accent)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M25.0016 17.0734C23.4239 16.6524 21.8165 16.3515 20.1933 16.1734C19.0855 16.088 17.9728 16.088 16.8649 16.1734L14.4183 16.5234L13.3533 16.69C12.7033 16.69 12.7366 17.0734 12.9033 17.3734C12.8923 17.4149 12.8916 17.4585 12.9011 17.5004C12.9107 17.5423 12.9302 17.5812 12.958 17.614C12.9858 17.6467 13.0211 17.6722 13.0609 17.6884C13.1007 17.7045 13.1439 17.7108 13.1866 17.7067L14.3033 17.8234L16.9149 18.0067H22.3716C23.2883 18.0067 24.0366 18.0067 24.7349 18.1217C24.8095 18.1335 24.8856 18.1303 24.9589 18.1123C25.0321 18.0942 25.101 18.0617 25.1616 18.0167C25.2221 17.9717 25.2731 17.9151 25.3114 17.8501C25.3498 17.7851 25.3748 17.7131 25.3849 17.6384C25.3912 17.5153 25.3571 17.3936 25.2879 17.2917C25.2188 17.1897 25.1182 17.1131 25.0016 17.0734ZM21.6733 23.8784C23.6866 23.745 25.3166 23.5117 25.4499 23.5617C25.5228 23.6009 25.6032 23.6241 25.6857 23.6298C25.7683 23.6355 25.8511 23.6236 25.9287 23.5949C26.0063 23.5661 26.0768 23.5212 26.1357 23.4631C26.1946 23.405 26.2405 23.335 26.2703 23.2578C26.3001 23.1806 26.3131 23.098 26.3085 23.0154C26.3039 22.9328 26.2817 22.8521 26.2436 22.7787C26.2054 22.7053 26.152 22.6408 26.087 22.5896C26.022 22.5384 25.9469 22.5017 25.8666 22.4817C24.479 22.2545 23.0784 22.1154 21.6733 22.065H20.0099C19.4766 22.065 18.8599 22.065 18.3449 22.1484C16.6816 22.2984 15.2166 22.565 14.3516 22.715C14.2178 22.7236 14.0926 22.7839 14.0024 22.8831C13.9122 22.9823 13.8641 23.1127 13.8683 23.2467C13.8745 23.3479 13.9113 23.4447 13.9738 23.5245C14.0363 23.6043 14.1215 23.6632 14.2183 23.6934C14.2849 23.7134 14.3516 23.72 14.4183 23.7134C15.2999 23.7134 16.7649 23.9134 18.3949 23.9967H20.0583L21.6733 23.8784Z" fill="var(--obv3-accent)" />
                  </g>
                  <defs>
                    <clipPath id="clip_clipboard_flow_1">
                      <rect width="40" height="40" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="obv3-flow-content">
                <h4 className="obv3-flow-title">Form Setup</h4>
                <p className="obv3-flow-desc">Questionnaires are created and the system generates response codes.</p>
              </div>
            </div>

            <div className="obv3-flow-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="obv3-flow-card">
              <div className="obv3-flow-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip_pdf_flow)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.1749 9.3501C25.8065 9.35276 25.4386 9.32489 25.0749 9.26677C25.1749 8.9001 25.3249 8.46677 25.4749 8.0001C26.1915 5.63344 26.5415 3.1501 24.6415 1.5501C24.5534 1.48104 24.4426 1.44733 24.3309 1.45556C24.2192 1.4638 24.1146 1.51338 24.0376 1.59463C23.9605 1.67587 23.9165 1.78294 23.9141 1.89491C23.9118 2.00688 23.9513 2.11569 24.0249 2.2001C25.9915 4.33343 23.5749 7.28343 23.3249 9.51677C23.0749 11.7501 28.4415 11.0168 30.2915 10.1668L33.1082 8.98344C33.2248 8.92241 33.3173 8.82378 33.3707 8.70354C33.4241 8.58331 33.4354 8.44854 33.4026 8.32113C33.3697 8.19371 33.2948 8.08113 33.1899 8.00167C33.0851 7.92222 32.9564 7.88055 32.8249 7.88344C29.2915 9.16677 29.1415 9.41677 26.1749 9.3501Z" fill="var(--text)" />
                    <path d="M12.5648 19.8C12.2104 19.8 11.862 19.76 11.5198 19.68C11.1837 19.6 10.8659 19.4971 10.5665 19.3714C10.432 19.8857 10.3159 20.4486 10.2181 21.06C10.1937 21.2314 10.157 21.3886 10.1081 21.5314C10.0592 21.6686 9.98286 21.78 9.87897 21.8657C9.77508 21.9514 9.6223 21.9943 9.42063 21.9943C9.23118 21.9943 9.1059 21.9257 9.04479 21.7886C8.98368 21.6514 8.95312 21.4829 8.95312 21.2829C8.95312 21.22 8.97757 21.0571 9.02646 20.7943C9.07535 20.5314 9.13646 20.2143 9.20979 19.8429C9.28313 19.4657 9.35952 19.0771 9.43896 18.6771C9.1884 18.4429 9.06313 18.2286 9.06313 18.0343C9.06313 17.9371 9.09368 17.8457 9.15479 17.76C9.22202 17.6686 9.35035 17.6229 9.5398 17.6229C9.56424 17.6229 9.59785 17.6314 9.64063 17.6486C9.70174 17.3286 9.75369 17.0429 9.79646 16.7914C9.84535 16.5343 9.87285 16.3486 9.87897 16.2343C9.89119 16.0171 9.92785 15.8571 9.98897 15.7543C10.0501 15.6457 10.1265 15.5743 10.2181 15.54C10.3159 15.5 10.4137 15.48 10.5115 15.48C10.6398 15.48 10.7376 15.5057 10.8048 15.5571C10.872 15.6086 10.9056 15.7229 10.9056 15.9C10.9056 16.0714 10.9026 16.2286 10.8965 16.3714C11.1959 15.8914 11.5076 15.5543 11.8315 15.36C12.1554 15.16 12.5098 15.06 12.8948 15.06C13.2737 15.06 13.6037 15.1571 13.8848 15.3514C14.1659 15.5457 14.3829 15.8257 14.5357 16.1914C14.6946 16.5514 14.774 16.9857 14.774 17.4943C14.774 18.2714 14.5815 18.8514 14.1965 19.2343C13.8176 19.6114 13.2737 19.8 12.5648 19.8ZM10.8781 18.36C11.1043 18.4743 11.3456 18.5743 11.6023 18.66C11.859 18.74 12.1218 18.78 12.3907 18.78C12.8245 18.78 13.1423 18.6743 13.344 18.4629C13.5518 18.2514 13.6557 17.9029 13.6557 17.4171C13.6557 16.5543 13.3776 16.1229 12.8215 16.1229C12.467 16.1229 12.1218 16.3086 11.7856 16.68C11.4556 17.0514 11.1531 17.6114 10.8781 18.36Z" fill="var(--text)" />
                    <path d="M16.0891 22.5C15.9118 22.5 15.7713 22.4543 15.6674 22.3629C15.5696 22.2771 15.5207 22.1543 15.5207 21.9943C15.5207 21.8457 15.5635 21.72 15.6491 21.6171C15.7346 21.5086 15.8996 21.4057 16.1441 21.3086C16.1624 21.3029 16.1807 21.2971 16.1991 21.2914C16.0463 21.2629 15.9393 21.1829 15.8782 21.0514C15.8232 20.92 15.7957 20.7686 15.7957 20.5971C15.7957 20.5 15.8141 20.3429 15.8507 20.1257C15.8874 19.9086 15.9332 19.66 15.9882 19.38C16.0432 19.1 16.1013 18.8229 16.1624 18.5486C16.2235 18.2686 16.2755 18.0229 16.3182 17.8114C16.4344 17.3257 16.5841 16.8971 16.7674 16.5257C16.9507 16.1543 17.1982 15.8657 17.5099 15.66C17.8216 15.4486 18.2219 15.3429 18.7108 15.3429C19.0835 15.3429 19.4502 15.4171 19.8108 15.5657C20.1774 15.7086 20.5105 15.9114 20.8099 16.1743C21.1094 16.4371 21.3477 16.7457 21.5249 17.1C21.7083 17.4543 21.7999 17.8429 21.7999 18.2657C21.7999 18.7457 21.5983 19.2286 21.1949 19.7143C20.7916 20.2 20.2263 20.6657 19.4991 21.1114C18.778 21.5514 17.9346 21.9486 16.9691 22.3029C16.8102 22.36 16.6666 22.4057 16.5382 22.44C16.416 22.48 16.2663 22.5 16.0891 22.5ZM16.8774 21.0429C17.7635 20.7114 18.4785 20.3943 19.0224 20.0914C19.5663 19.7886 19.9605 19.4686 20.2049 19.1314C20.4555 18.7943 20.5808 18.4114 20.5808 17.9829C20.5808 17.7429 20.4952 17.5143 20.3241 17.2971C20.153 17.08 19.933 16.9057 19.6641 16.7743C19.3952 16.6371 19.111 16.5686 18.8116 16.5686C18.4877 16.5686 18.228 16.6914 18.0324 16.9371C17.8369 17.1771 17.681 17.5886 17.5649 18.1714C17.5099 18.4057 17.4519 18.66 17.3907 18.9343C17.3357 19.2029 17.2807 19.4629 17.2257 19.7143C17.1769 19.96 17.1341 20.1657 17.0974 20.3314C17.0669 20.4971 17.0485 20.5943 17.0424 20.6229C17.0119 20.7943 16.9569 20.9343 16.8774 21.0429Z" fill="var(--text)" />
                    <path d="M23.6489 22.0457C23.49 22.0457 23.3739 21.9743 23.3006 21.8314C23.2272 21.6886 23.1906 21.4343 23.1906 21.0686C23.1906 20.5543 23.2242 20.0114 23.2914 19.44C23.3647 18.8629 23.4595 18.24 23.5756 17.5714C23.6795 17.04 23.927 16.6314 24.3181 16.3457C24.7153 16.06 25.247 15.8257 25.9131 15.6429C26.3287 15.5286 26.7595 15.4229 27.2056 15.3257C27.6517 15.2286 28.0703 15.1514 28.4614 15.0943C28.8587 15.0314 29.1856 15 29.4423 15C29.6378 15 29.7906 15.0286 29.9006 15.0857C30.0106 15.1429 30.087 15.2143 30.1298 15.3C30.1787 15.38 30.2031 15.4543 30.2031 15.5229C30.2031 15.6314 30.1756 15.7286 30.1206 15.8143C30.0656 15.9 29.9465 15.9657 29.7631 16.0114C29.6837 16.0343 29.5156 16.0743 29.259 16.1314C29.0084 16.1829 28.6998 16.2457 28.3331 16.32C27.9726 16.3943 27.5906 16.4743 27.1873 16.56C26.7839 16.64 26.3928 16.7229 26.0139 16.8086C25.6411 16.9114 25.3661 17.0371 25.1889 17.1857C25.0178 17.3286 24.9048 17.5371 24.8498 17.8114C24.8375 17.8686 24.8253 17.9486 24.8131 18.0514C25.0636 17.9771 25.3325 17.9171 25.6198 17.8714C25.907 17.8257 26.1728 17.7914 26.4173 17.7686C26.6617 17.7457 26.842 17.7343 26.9581 17.7343C27.0803 17.7343 27.2087 17.7543 27.3431 17.7943C27.4837 17.8286 27.6028 17.8829 27.7006 17.9571C27.8045 18.0257 27.8564 18.1143 27.8564 18.2229C27.8564 18.3257 27.8137 18.42 27.7281 18.5057C27.6425 18.5857 27.4684 18.6629 27.2056 18.7371C27.1506 18.7543 27.0253 18.7771 26.8298 18.8057C26.6403 18.8343 26.4142 18.8714 26.1514 18.9171C25.8948 18.9571 25.632 19.0029 25.3631 19.0543C25.1003 19.1057 24.8681 19.16 24.6664 19.2171C24.6236 19.5257 24.5839 19.8343 24.5472 20.1429C24.5106 20.4514 24.48 20.72 24.4556 20.9486C24.4311 21.1714 24.4128 21.3114 24.4006 21.3686C24.3639 21.58 24.2753 21.7457 24.1347 21.8657C23.9942 21.9857 23.8322 22.0457 23.6489 22.0457Z" fill="var(--text)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.4593 0.1C24.1593 0 25.2093 0 9.99096 0C9.84731 0 9.70953 0.0570683 9.60795 0.158651C9.50637 0.260233 9.4493 0.398008 9.4493 0.541667C9.4493 0.685326 9.50637 0.823101 9.60795 0.924683C9.70953 1.02627 9.84731 1.08333 9.99096 1.08333C24.176 1.2 24.5926 1.08333 26.3593 1.35C28.126 1.61667 32.6093 5.76667 33.7443 7.51667C33.9826 7.80667 34.1276 8.16167 34.161 8.53333C33.9943 11.1 32.9276 18.5367 32.4943 20.3367C32.061 22.1367 31.7443 23.3367 31.4443 24.8533C31.3276 25.4533 30.5776 32.52 28.6943 33.4367C26.0443 34.7217 23.0776 33.87 20.3593 34.1033C17.8223 34.3474 15.2747 34.4647 12.726 34.455C3.72263 34.1383 4.1393 34.2717 1.70597 33.105C3.92263 30.0883 5.40597 23.1033 6.1893 19.02C7.07263 14.52 6.77263 9.935 7.12263 5.4C7.12263 4.61667 7.90597 0.4 6.62263 1.03333C6.10597 1.26667 6.27263 2.03333 6.27263 2.38333C6.27263 4.63333 5.72263 13.3683 5.5893 14.8183C4.92867 20.2642 3.53842 25.5965 1.45597 30.6717C1.1893 31.1717 0.872633 31.655 0.572633 32.1217C0.332152 32.4046 0.140627 32.7257 0.00596602 33.0717C-0.0192777 33.3309 0.0359839 33.5915 0.164225 33.8182C0.292466 34.0449 0.487454 34.2265 0.722633 34.3383C1.76338 34.9265 2.88725 35.3536 4.05597 35.605C9.50763 36.1433 14.996 36.215 20.4593 35.8217C23.276 35.5717 26.4093 36.4717 29.476 34.9717C32.276 33.605 32.9093 26.2217 33.1093 25.1717C33.3926 23.6533 33.7943 22.17 34.0943 20.67C34.3943 19.17 35.411 11.5017 35.561 8.60167C35.6943 6.085 28.776 0.283333 26.4593 0.1Z" fill="var(--text)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M38.4783 9.6834C38.3117 12.2517 36.9117 22.5367 36.545 24.2701C36.1783 26.0034 35.795 27.2701 35.495 28.7867C35.3783 29.3867 34.6283 36.4551 32.745 37.3717C30.095 38.6384 27.1283 37.8051 24.4117 38.0384C22.7433 38.1884 19.01 38.4551 16.775 38.3884C8.19167 38.0717 8.20834 38.3884 6.10834 37.4384C4.89167 36.9551 4.59167 38.1217 5.34167 38.6384C6.20135 39.1455 7.16391 39.453 8.15834 39.5384C13.604 40.0769 19.0861 40.1438 24.5433 39.7384C27.36 39.5051 30.4933 40.4051 33.56 38.9051C36.3617 37.5384 37.0117 30.1551 37.195 29.1051C37.4783 27.5884 37.8783 26.1051 38.1783 24.6051C38.4783 23.1051 39.8617 12.8001 39.995 10.0001C40.0783 8.4334 38.6617 8.20007 38.4783 9.6834Z" fill="var(--obv3-accent)" />
                  </g>
                  <defs>
                    <clipPath id="clip_pdf_flow">
                      <rect width="40" height="40" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="obv3-flow-content">
                <h4 className="obv3-flow-title">PDF Template</h4>
                <p className="obv3-flow-desc">Engineers create a static PDF template with required fields</p>
              </div>
            </div>

            <div className="obv3-flow-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="obv3-flow-card">
              <div className="obv3-flow-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip_code_flow)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M33.0972 29.0899C33.4389 26.6816 31.0472 24.8066 28.7889 25.7149L28.6739 25.7649C27.1108 26.5126 25.6963 27.5375 24.4989 28.7899C23.7672 29.4066 21.2889 31.2516 21.1739 31.3016C19.8182 31.2857 18.4788 31.0031 17.2322 30.4699C17.2322 30.3033 17.3489 30.1533 17.5489 29.8866C19.5939 27.0449 22.2539 26.0466 20.3756 23.2366C20.0823 22.8269 19.6666 22.5207 19.1884 22.362C18.7102 22.2033 18.194 22.2003 17.7139 22.3533C14.6872 22.8199 11.6772 25.8633 8.79891 26.9949C8.66558 26.9949 8.53224 26.9949 8.49891 27.0783C8.01724 23.7516 4.92391 24.6499 3.74391 24.6333C2.56391 24.6166 -0.0810892 24.4333 0.417244 25.5799C0.469277 25.7094 0.569958 25.8133 0.697699 25.8694C0.82544 25.9254 0.970071 25.9292 1.10058 25.8799C1.95784 25.7588 2.8296 25.787 3.67724 25.9633C5.34058 26.1466 6.50391 25.6799 6.68724 27.1616V36.9066C6.68724 38.0699 6.58724 38.3699 4.74224 38.5699C3.63131 38.6509 2.51471 38.6005 1.41558 38.4199C1.25888 38.3912 1.09718 38.4259 0.966065 38.5164C0.834946 38.6069 0.745143 38.7457 0.716411 38.9024C0.687679 39.0591 0.722372 39.2208 0.812859 39.352C0.903345 39.4831 1.04221 39.5729 1.19891 39.6016C2.36782 39.8619 3.56138 39.9954 4.75891 39.9999C6.42058 39.9999 7.58558 39.7333 8.16724 38.3366L12.0756 37.4716C18.2622 39.1349 26.7289 39.4016 32.1506 35.9583C34.2289 34.6116 36.5239 32.9483 35.3772 30.7366C35.19 30.2758 34.8769 29.877 34.4737 29.5859C34.0705 29.2947 33.5935 29.1228 33.0972 29.0899ZM25.5306 30.2216C27.1939 29.1383 29.4389 26.8949 30.7206 27.3766C31.0888 27.5034 31.3966 27.7628 31.5839 28.1042C31.7713 28.4456 31.8247 28.8446 31.7339 29.2233C28.5072 29.9383 26.9439 30.6199 24.0672 31.0033C24.6006 30.7366 25.1306 30.4549 25.5306 30.2216ZM31.0856 34.2766C24.0022 39.1499 12.4089 36.1066 11.9589 36.2233C8.11724 37.1883 8.45058 37.1883 8.46724 37.0383C8.70891 34.1499 8.74724 31.2499 8.58391 28.3549C10.7956 28.2399 18.0139 22.2199 19.1106 24.0333C20.2089 25.8449 18.2122 26.2116 16.1672 28.8549C15.1189 30.2183 15.3689 31.1333 16.0006 31.7816C16.9273 32.446 17.9992 32.8797 19.1272 33.0466C23.0356 34.0283 29.6889 31.8149 31.1356 31.5333C32.2822 31.2833 33.0972 30.7499 33.5972 31.6999C34.0972 32.6466 31.8506 33.7616 31.0856 34.2766ZM18.1639 18.0799C18.3149 18.0687 18.456 18.0007 18.559 17.8898C18.662 17.7788 18.7192 17.633 18.7192 17.4816C18.7192 17.3302 18.662 17.1844 18.559 17.0734C18.456 16.9625 18.3149 16.8946 18.1639 16.8833C17.0639 16.8333 11.6772 12.4249 10.8456 11.7266C10.0139 11.0283 10.0122 11.5099 10.5956 10.9283C11.1789 10.3449 11.8922 9.88161 12.1422 9.66494C14.1254 7.75264 16.28 6.02651 18.5789 4.50827C18.695 4.434 18.7781 4.31789 18.8109 4.18402C18.8438 4.05015 18.8238 3.90879 18.7553 3.78922C18.6867 3.66965 18.5747 3.58105 18.4426 3.54178C18.3105 3.5025 18.1683 3.51557 18.0456 3.57827C14.5152 5.35946 11.2518 7.6265 8.35058 10.3133C8.16699 10.5442 8.04474 10.8177 7.99521 11.1085C7.94567 11.3993 7.97045 11.6979 8.06724 11.9766C8.51724 12.8749 16.5006 18.1466 18.1639 18.0799ZM21.2244 20.2249C23.0678 14.3049 27.0594 9.1666 28.1744 0.716604C28.2029 0.643803 28.215 0.565633 28.2099 0.487627C28.2049 0.409622 28.1827 0.333689 28.145 0.265204C28.1073 0.196719 28.055 0.137356 27.9918 0.0913181C27.9287 0.0452802 27.8561 0.0136929 27.7794 -0.00120763C27.7027 -0.0161082 27.6236 -0.0139577 27.5478 0.00509164C27.472 0.024141 27.4013 0.0596233 27.3407 0.109027C27.2801 0.15843 27.2311 0.220547 27.1972 0.290979C27.1633 0.361412 27.1453 0.438438 27.1444 0.516604C25.8144 5.83994 21.6728 12.1599 20.0611 19.9266C20.0397 20.0034 20.0338 20.0838 20.0438 20.1629C20.0538 20.242 20.0794 20.3184 20.1193 20.3875C20.1591 20.4566 20.2124 20.517 20.2758 20.5653C20.3393 20.6136 20.4118 20.6488 20.489 20.6687C20.5663 20.6886 20.6467 20.693 20.7256 20.6815C20.8045 20.67 20.8804 20.6428 20.9487 20.6017C21.017 20.5605 21.0765 20.5061 21.1235 20.4417C21.1706 20.3773 21.2043 20.3042 21.2228 20.2266\" fill="var(--text)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M31.3016 3.94336C31.2478 3.89356 31.1842 3.8554 31.115 3.83125C31.0458 3.80711 30.9723 3.7975 30.8992 3.80303C30.826 3.80856 30.7549 3.82911 30.69 3.8634C30.6252 3.89768 30.5682 3.94496 30.5224 4.00229C30.4767 4.05961 30.4433 4.12575 30.4243 4.19657C30.4053 4.2674 30.4011 4.34138 30.4119 4.41389C30.4228 4.48641 30.4485 4.55591 30.4875 4.61805C30.5264 4.68018 30.5777 4.73362 30.6382 4.77503C31.3532 5.40836 36.9566 10.38 37.4549 11.1784C35.6432 13.39 28.8416 17.4984 28.8749 17.6484C28.7311 17.6973 28.6104 17.7977 28.536 17.9302C28.4616 18.0627 28.4387 18.2179 28.4718 18.3662C28.5048 18.5145 28.5915 18.6454 28.7151 18.7338C28.8387 18.8221 28.9906 18.8617 29.1416 18.845C29.7732 18.745 38.8032 13.855 39.6016 11.4617C40.0849 9.93002 36.6249 7.76836 31.3016 3.94503" fill="var(--text)" />
                  </g>
                  <defs>
                    <clipPath id="clip_code_flow">
                      <rect width="40" height="40" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="obv3-flow-content">
                <h4 className="obv3-flow-title">Code Mapping</h4>
                <p className="obv3-flow-desc">Each response code is manually mapped into exact pixel coordinates</p>
              </div>
            </div>

            <div className="obv3-flow-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="obv3-flow-card">
              <div className="obv3-flow-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip_clipboard_flow_2)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M35.3165 22.365C35.3165 19.12 35.1498 15.4916 34.8498 12.715C34.7791 11.2473 34.4467 9.80402 33.8682 8.45329C33.5749 8.01053 33.1583 7.66345 32.6698 7.45496C31.735 7.04531 30.7505 6.76009 29.7415 6.60662C29.5921 6.5864 29.4405 6.62319 29.317 6.70966C29.1934 6.79614 29.107 6.92596 29.0748 7.07329C29.0513 7.22549 29.0889 7.38082 29.1795 7.5054C29.27 7.62998 29.4061 7.7137 29.5582 7.73829C30.3293 7.87273 31.0782 8.08384 31.8048 8.37162C32.2048 8.49495 32.5598 8.73829 32.8215 9.06995C33.2715 10.2733 33.5182 11.545 33.5532 12.83C33.8032 15.575 33.8198 19.17 33.8198 22.38C33.8198 25.5933 33.9032 28.7216 33.8198 31.5C33.8365 33.0811 33.7532 34.6566 33.5698 36.2266C33.5698 36.4266 33.3865 36.61 33.3698 36.7266C29.9715 37.56 26.4848 37.975 22.9865 37.9566C18.0436 38.1629 13.0929 38.0794 8.15984 37.7066C7.64318 37.7066 7.14318 37.4066 6.96151 37.4566C6.88604 37.2064 6.83032 36.9506 6.79484 36.6916C6.79484 36.1083 6.67818 35.51 6.64484 35.1283C6.51151 33.5633 6.16151 26.275 5.91318 19.9016C5.71318 14.81 5.54651 10.3016 5.59651 9.78496V9.11829C6.14543 8.72979 6.79062 8.49973 7.46151 8.45329C8.14707 8.38662 8.83484 8.35884 9.52484 8.36996C9.40707 8.72551 9.31262 9.08662 9.24151 9.45329C9.21085 9.71294 9.21085 9.9753 9.24151 10.235C9.24151 10.7833 9.39151 11.4983 9.39151 11.4983C9.42226 11.709 9.52541 11.9024 9.68326 12.0454C9.8411 12.1883 10.0438 12.2719 10.2565 12.2816C10.2565 12.2816 14.9315 12.3816 19.2415 12.3816C21.6548 12.3816 23.9682 12.3816 25.2665 12.2483C25.3964 12.2316 25.5145 12.1646 25.5955 12.0618C25.6765 11.959 25.714 11.8284 25.6998 11.6983C25.6978 11.6333 25.6826 11.5695 25.6553 11.5105C25.6279 11.4515 25.589 11.3987 25.5407 11.3551C25.4925 11.3115 25.436 11.2781 25.3745 11.2569C25.3131 11.2357 25.248 11.2271 25.1832 11.2316C24.1665 11.2316 22.5365 11.2316 20.7232 11.115C17.1448 10.9483 12.8515 10.65 11.1065 10.5166V9.84995C11.1732 9.54773 11.256 9.24884 11.3548 8.95329C11.4382 8.70773 11.5493 8.4744 11.6882 8.25329C11.9847 7.8459 12.379 7.51975 12.8348 7.30496C13.6817 6.94896 14.563 6.68142 15.4648 6.50662L15.9982 6.38996C16.1343 6.37108 16.2651 6.32434 16.3824 6.25265C16.4997 6.18096 16.601 6.08586 16.6798 5.97329C16.7691 5.73756 16.7691 5.47735 16.6798 5.24162L16.4465 3.97829C16.45 3.72763 16.5068 3.48059 16.6131 3.25358C16.7194 3.02656 16.8729 2.82478 17.0632 2.66162C17.5515 2.26996 18.1182 1.98662 18.7265 1.83162C19.036 1.73979 19.3654 1.73979 19.6748 1.83162C20.0123 1.94409 20.3196 2.13221 20.5732 2.38162C20.9032 2.73162 21.1382 3.15996 21.2565 3.62829C21.3398 4.1794 21.3732 4.73384 21.3565 5.29162C21.3515 5.47328 21.4156 5.65007 21.536 5.78621C21.6563 5.92236 21.8239 6.0077 22.0048 6.02496C22.6271 6.08607 23.2371 6.20829 23.8348 6.39162C24.4248 6.54995 24.9882 6.80329 25.4982 7.13829C25.8982 7.41329 26.1865 7.82162 26.3148 8.28829C26.5115 8.84995 26.6282 9.43829 26.6648 10.035C26.6589 10.1128 26.669 10.191 26.6947 10.2648C26.7204 10.3385 26.761 10.4061 26.8141 10.4634C26.8671 10.5207 26.9314 10.5664 27.003 10.5977C27.0745 10.6289 27.1518 10.6451 27.2298 10.6451C27.3079 10.6451 27.3852 10.6289 27.4567 10.5977C27.5282 10.5664 27.5926 10.5207 27.6456 10.4634C27.6987 10.4061 27.7393 10.3385 27.765 10.2648C27.7907 10.191 27.8008 10.1128 27.7948 10.035C27.8332 9.20592 27.7203 8.37683 27.4615 7.58829C27.2436 7.00052 26.8561 6.49066 26.3482 6.12329C25.7403 5.70498 25.0795 5.36926 24.3832 5.12496C23.9216 4.96846 23.4493 4.84591 22.9698 4.75829C23.0013 4.14859 22.9394 3.53767 22.7865 2.94662C22.6094 2.36691 22.308 1.83283 21.9032 1.38162C21.4771 0.90751 20.948 0.537462 20.3565 0.299955C19.7248 0.0199553 19.0232 -0.0667114 18.3432 0.0499553C17.2448 0.307709 16.2484 0.887458 15.4815 1.71496C14.9013 2.34362 14.5851 3.17127 14.5982 4.02662C14.5815 4.27107 14.5815 4.51551 14.5982 4.75995C13.6616 4.94186 12.7509 5.23797 11.8865 5.64162C11.1461 5.98603 10.5051 6.51241 10.0232 7.17162C10.0322 7.21561 10.0322 7.26096 10.0232 7.30496C8.96704 7.27781 7.91033 7.32794 6.86151 7.45496C6.20484 7.57162 5.57984 7.82662 5.03151 8.20496C4.8494 8.33959 4.71041 8.52433 4.63151 8.73662C4.53707 9.03996 4.48151 9.35107 4.46484 9.66996V19.9366C4.56484 26.3583 4.73151 33.68 4.83151 35.2616C4.84262 36.0805 4.93151 36.89 5.09818 37.69C5.19984 38.1716 5.42318 38.6183 5.74818 38.9883C6.32651 39.3216 6.97651 39.515 7.64318 39.555C11.8365 39.9283 16.0482 40.0666 20.2565 39.97C25.9148 39.8533 31.7065 39.3533 34.3015 38.3066C34.5952 38.1865 34.8331 37.9605 34.9682 37.6733C35.3098 36.69 35.4782 35.6533 35.4665 34.6116C35.6498 31.5166 35.4165 26.675 35.3165 22.365Z" fill="var(--text)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.4189 26.0583C23.3115 25.9842 23.1872 25.938 23.0574 25.9241C22.9276 25.9101 22.7964 25.9288 22.6757 25.9785C22.555 26.0282 22.4486 26.1073 22.3662 26.2085C22.2838 26.3098 22.228 26.43 22.2039 26.5583C21.9173 27.725 21.5678 28.8733 21.1556 30.0033C20.7827 31.0878 20.2562 32.1132 19.5923 33.0483V33.1817H16.0139C14.7398 33.2011 13.4661 33.1231 12.2039 32.9483C11.9353 32.8016 11.6568 32.6735 11.3706 32.565C11.0889 31.0183 10.8723 28.805 10.6556 26.425C10.5223 25.01 10.3556 23.3467 10.2389 21.915C10.0245 19.4033 9.95273 16.8815 10.0239 14.3617C10.0291 14.2282 9.98407 14.0977 9.89766 13.9958C9.81125 13.894 9.68978 13.8283 9.55725 13.8117C9.42311 13.8028 9.29079 13.8466 9.18841 13.9338C9.08603 14.0209 9.02164 14.1445 9.00892 14.2783C8.61739 18.1093 8.52823 21.9651 8.74225 25.81C8.85225 28.3967 9.15892 30.9717 9.65892 33.5133C9.71492 33.7057 9.8146 33.8824 9.95019 34.0299C10.0858 34.1773 10.2536 34.2915 10.4406 34.3633C10.9073 34.5133 11.3839 34.6244 11.8706 34.6967C12.9306 34.7833 13.99 34.7833 15.0489 34.6967C22.0706 34.43 21.1223 34.4633 22.1873 34.2633C22.7495 34.1689 23.3045 34.0467 23.8523 33.8967C25.2913 33.5027 26.6529 32.8669 27.8789 32.0167C28.7589 31.4167 29.4506 30.58 29.8756 29.6033C30.7869 27.3915 31.1907 25.0035 31.0573 22.615V20.65C31.0573 20.0017 30.9239 19.32 30.8406 18.6867C30.6073 16.8067 30.2906 15.21 30.1073 14.1783C30.101 14.104 30.08 14.0316 30.0457 13.9653C30.0114 13.899 29.9643 13.8402 29.9071 13.7922C29.95 13.7442 29.7839 13.708 29.7127 13.6856C29.6415 13.6632 29.5666 13.655 29.4923 13.6617C29.4169 13.6657 29.3432 13.6851 29.2757 13.7189C29.2082 13.7526 29.1483 13.7998 29.0999 13.8577C29.0514 13.9155 29.0153 13.9827 28.994 14.0551C28.9756 14.2783V18.8367C28.9756 19.4533 28.9756 20.1033 29.0589 20.7667C29.1423 21.4333 29.1423 22.05 29.2089 22.6983C29.7089 27.3733 29.4089 27.1067 28.7439 29.1033C28.4006 29.8367 27.8106 30.4233 27.0806 30.7683C25.9498 31.4155 24.7173 31.8658 23.4356 32.1L22.2706 32.3C22.4206 31.9667 22.5539 31.6278 22.6706 31.2833C23.0773 30.1322 23.3934 28.9567 23.6189 27.7567C24.2289 27.9633 24.8723 28.0533 25.5156 28.0233C26.5046 27.9978 27.4738 27.7409 28.3456 27.2733C28.4797 27.2085 28.5829 27.0934 28.6328 26.953C28.6827 26.8127 28.6753 26.6583 28.6123 26.5233C28.5816 26.4535 28.5371 26.3906 28.4816 26.3384C28.426 26.2861 28.3605 26.2456 28.2889 26.2193C28.2173 26.193 28.1411 26.1815 28.065 26.1853C27.9888 26.1891 27.9142 26.2083 27.8456 26.2417C27.1223 26.575 26.3289 26.7283 25.5323 26.6917C24.7801 26.6983 24.0435 26.4775 23.4189 26.0583Z" fill="var(--obv3-accent)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M25.0016 17.0734C23.4239 16.6524 21.8165 16.3515 20.1933 16.1734C19.0855 16.088 17.9728 16.088 16.8649 16.1734L14.4183 16.5234L13.3533 16.69C12.7033 16.69 12.7366 17.0734 12.9033 17.3734C12.8923 17.4149 12.8916 17.4585 12.9011 17.5004C12.9107 17.5423 12.9302 17.5812 12.958 17.614C12.9858 17.6467 13.0211 17.6722 13.0609 17.6884C13.1007 17.7045 13.1439 17.7108 13.1866 17.7067L14.3033 17.8234L16.9149 18.0067H22.3716C23.2883 18.0067 24.0366 18.0067 24.7349 18.1217C24.8095 18.1335 24.8856 18.1303 24.9589 18.1123C25.0321 18.0942 25.101 18.0617 25.1616 18.0167C25.2221 17.9717 25.2731 17.9151 25.3114 17.8501C25.3498 17.7851 25.3748 17.7131 25.3849 17.6384C25.3912 17.5153 25.3571 17.3936 25.2879 17.2917C25.2188 17.1897 25.1182 17.1131 25.0016 17.0734ZM21.6733 23.8784C23.6866 23.745 25.3166 23.5117 25.4499 23.5617C25.5228 23.6009 25.6032 23.6241 25.6857 23.6298C25.7683 23.6355 25.8511 23.6236 25.9287 23.5949C26.0063 23.5661 26.0768 23.5212 26.1357 23.4631C26.1946 23.405 26.2405 23.335 26.2703 23.2578C26.3001 23.1806 26.3131 23.098 26.3085 23.0154C26.3039 22.9328 26.2817 22.8521 26.2436 22.7787C26.2054 22.7053 26.152 22.6408 26.087 22.5896C26.022 22.5384 25.9469 22.5017 25.8666 22.4817C24.479 22.2545 23.0784 22.1154 21.6733 22.065H20.0099C19.4766 22.065 18.8599 22.065 18.3449 22.1484C16.6816 22.2984 15.2166 22.565 14.3516 22.715C14.2178 22.7236 14.0926 22.7839 14.0024 22.8831C13.9122 22.9823 13.8641 23.1127 13.8683 23.2467C13.8745 23.3479 13.9113 23.4447 13.9738 23.5245C14.0363 23.6043 14.1215 23.6632 14.2183 23.6934C14.2849 23.7134 14.3516 23.72 14.4183 23.7134C15.2999 23.7134 16.7649 23.9134 18.3949 23.9967H20.0583L21.6733 23.8784Z" fill="var(--obv3-accent)" />
                  </g>
                  <defs>
                    <clipPath id="clip_clipboard_flow_2">
                      <rect width="40" height="40" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="obv3-flow-content">
                <h4 className="obv3-flow-title">Upload & Test</h4>
                <p className="obv3-flow-desc">Template is uploaded to the system, tested and corrected until production.</p>
              </div>
            </div>
          </div>

          <p className="obv3-body" style={{ marginBottom: 0 }}>
            This process introduced friction at every step. Users had no way to easily configure the outputs these forms generated. What was supposed to be a self-serve model the platform was built on, stopped working the moment a document was involved.
          </p>

        </SectionBlock>

        {/* 03 ACTUAL PROBLEM */}
        <SectionBlock
          id="obv3-contrast"
          className="obv3-section--overview"
          onVisible={setActiveId}
          number="03"
          title="Actual problem"
          eyebrow="Problem Reframing"
          heading={
            <>
              From Interface Polish
              <br />
              to Workflow Redesign
            </>
          }
        >
          <p className="obv3-body">
            The original requirement was to make PDF creation easier.
          </p>
          <blockquote className="obv3-blockquote">
            “How might we make PDF creation easier?”
          </blockquote>
          <p className="obv3-body">
            But once I understood the workflow, I realised that it was not really a PDF issue. It was the manual mapping that was taking up the engineer's time. So, I rephrased the requirement:
          </p>
          <blockquote className="obv3-blockquote">
            “How might we remove manual mapping and enable non-technical admins to create templates on their own?”
          </blockquote>
          <p className="obv3-body">
            This reframing changed the scope from a simple UI revamp to workflow redesign. By removing unnecessary steps, we would make the complex manual workflow simple.
          </p>

          <h3 className="obv3-subheading">Challenge</h3>
          <p className="obv3-body" style={{ marginBottom: 0 }}>
            The challenge was to build it in a way without affecting the legacy backend and build on the mental models that users already understand.
          </p>
        </SectionBlock>

        {/* 04 PRINCIPLES */}
        <SectionBlock
          id="obv3-principles"
          className="obv3-section--contrast"
          onVisible={setActiveId}
          number="04"
          title="Principles"
          eyebrow="Design Principles"
          heading={
            <>
              Rethinking the Workflow
            </>
          }
        >
          <p className="obv3-body">
            After several rounds of discussions with the stakeholders, we shortlisted 4 design principles that formed the basis for the new design.
          </p>

          <div className="obv3-principles-cards">
            {[
              {
                label: "Reduce cognitive overhead",
                desc: "Users should work with question and fields that they already know, not internal system response codes.",
              },
              {
                label: "Support progressive complexity",
                desc: "Simple templates should be fast to build. Advanced customizations should still be possible.",
              },
              {
                label: "Preserve existing mental models",
                desc: "Users already understood forms. The output experience should build on that, not introduce new abstractions on top of it.",
              },
              {
                label: "Shift ownership closer to users",
                desc: "Shift the template design control from engineers to the users. Engineers can focus on engineering problems, not templates and layouts.",
              },
            ].map((p) => (
              <div key={p.label} className="obv3-principle-card">
                <div className="obv3-principle-card__label">{p.label}</div>
                <div className="obv3-principle-card__desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* 05 SOLUTION — all features stacked one below the other */}
        <RevealSection id="obv3-solution" className="obv3-section obv3-section--solution" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              05<span>Solution</span>
            </div>
            <div>
              <div className="obv3-solution-info" style={{ marginBottom: "40px" }}>
                <div className="obv3-eyebrow">Design Decisions</div>
                <h2 className="obv3-heading">
                  From Manual Workflows
                  <br />
                  to a Visual System
                </h2>
              </div>
              <div className="obv3-features-list">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="obv3-feature-card">
                    <div className="obv3-feature__header">
                      <h3 className="obv3-feature__title">{feature.title}</h3>
                      <p className="obv3-feature__body">{feature.body}</p>
                    </div>

                    <div className="obv3-feature__helps-wrap">
                      <div className="obv3-feature__helps-label">How it helps</div>
                      <ul className="obv3-feature__helps-list">
                        {feature.helps.map((h) => (
                          <li key={h}>
                            <span className="obv3-feature__helps-mark" aria-hidden="true">
                              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 8.5 6.5 12 13 5" />
                              </svg>
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="obv3-feature__media-wrap">
                      <div className="obv3-feature__media" style={{ transform: "none" }}>
                        <div className="obv3-feature__media-frame">
                          <LazyVideo src={feature.videoPath} className="obv3-feature__video" />
                          <div className="obv3-feature__duration">{feature.duration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        {/* 06 IMPACT */}
        <SectionBlock
          id="obv3-impact"
          className="obv3-section--impact"
          onVisible={setActiveId}
          number="06"
          title="Impact"
          eyebrow="Outcomes"
          heading={
            <>
              Engineering bottleneck to
              <br />
              a Self-Serve Capability
            </>
          }
        >
          <p className="obv3-body">
            Output creation went from an engineering workflow to a self-serve functionality.
          </p>
          <p className="obv3-body">
            <strong>Operational impact:</strong> Time to create a template reduced from multiple days to a few hours. Onboarding new organizations has gotten faster. Customer requirements could be turned around more quickly.
          </p>
          <p className="obv3-body">
            <strong>Product impact:</strong> Engineering was no longer needed for routine template work. The platform became more autonomous. Self-serve capabilities got meaningfully stronger.
          </p>
          <p className="obv3-body">
            <strong>User impact:</strong> Non-technical admins could create, manage, and iterate on output templates without knowing anything about response identifiers, coordinate systems, or PDF tooling.
          </p>

          <motion.div
            className="obv3-impact-stats"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <ImpactStat label="Template Creation" desc="Days of dev time down to hours by any non-technical team member">
              <span className="obv3-stat-unit">↓</span>90<span className="obv3-stat-unit">%</span>
            </ImpactStat>
            <ImpactStat label="Eng Dependency" desc="Non-technical admins create, manage, and iterate on templates without engineers">
              Zero
            </ImpactStat>
            <ImpactStat label="Static Storage" desc="PDFs generated on-demand only — no base files stored or maintained">
              <span className="obv3-stat-unit">↓</span>100<span className="obv3-stat-unit">%</span>
            </ImpactStat>
          </motion.div>

          <div className="obv3-impact-compare">
            <div>
              <div className="obv3-meta-label" style={{ marginBottom: 16 }}>Before</div>
              <p>
                <span className="obv3-emph-red">2–3 days</span> of dedicated engineer time per template, with external software and manual coordinate entry.
              </p>
            </div>
            <div>
              <div className="obv3-meta-label" style={{ marginBottom: 16 }}>After</div>
              <p>
                <span className="obv3-emph-accent">1–3 hours</span> by any non-technical team member, entirely inside the product. No external tools. No engineers.
              </p>
            </div>
          </div>
        </SectionBlock>

        {/* 07 FUTURE */}
        <SectionBlock
          id="obv3-evolution"
          className="obv3-section--evolution"
          onVisible={setActiveId}
          number="07"
          title="Future"
          eyebrow="Future Vision"
          heading={
            <>
              Exploring a More Radical Idea
            </>
          }
        >
          <p className="obv3-body">
            During discovery, I proposed a larger improvement that could make the entire process even more seamless. The current workflow still treated forms as the source of truth. But most of the information users were collecting already existed somewhere in the platform.
          </p>

          <motion.div
            className="obv3-evolution-box"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="obv3-evolution-quote">"What if we design the output first and let the system determine what information is actually missing?"</p>
          </motion.div>

          <p className="obv3-body obv3-evolution-tail" style={{ marginBottom: 0 }}>
            This was out of scope for this release as it required rewriting core system logic. But it shaped how we started thinking about where the platform could go.
          </p>
        </SectionBlock>

        {/* 08 REFLECTION */}
        <SectionBlock
          id="obv3-reflection"
          className="obv3-section--reflection"
          onVisible={setActiveId}
          number="08"
          title="Reflection"
          eyebrow="Key Takeaway"
        >
          <p className="obv3-body">
            The ask was to make PDF creation easier. The real opportunity was understanding why it was hard in the first place. Once I mapped the workflow and found the hidden dependencies, I could remove a major part of the workflow rather than just making it less annoying.
          </p>
          <p className="obv3-body" style={{ marginBottom: 0 }}>
            The result was more than a better interface.{" "}
            <span className="obv3-reflection-tail">It was a simpler system.</span>
          </p>
        </SectionBlock>

        {/* FOOTER */}
        <CaseStudyFooter
          title="Open to the right opportunity"
          sub="Looking for roles where I can work on complex systems, collaborate deeply with engineering, and drive real product impact."
        />
      </div>
    </motion.div>
  );
}
