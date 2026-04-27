import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { toolbarLinks } from "../content";
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
    title: "Smart Organizational Defaults",
    body: "Start instantly with predefined organizational layouts. There is no need to rebuild standard structures from scratch, saving initial configuration time and ensuring brand consistency across all output documents.",
    helps: ["Saves initial configuration time", "Maintains consistency across outputs"],
    videoPath: "/assets/output-builder/smart-defaults.mp4",
    duration: "0:19",
  },
  {
    title: "Visual Builder",
    body: "Design output layouts using a purely visual interface. Non-technical users get instant visual feedback and can build complex outputs without writing a single line of code.",
    helps: ["No coding knowledge required", "Instant visual feedback on layout"],
    videoPath: "/assets/output-builder/drag-and-drop.mp4",
    duration: "0:11",
  },
  {
    title: "Direct Data Mapping",
    body: "Select real form questions directly from a list. The system automatically handles the response code mapping in the backend, entirely removing manual mapping and human error.",
    helps: ["Eliminates manual mapping errors", "Reduces technical dependency"],
    videoPath: "/assets/output-builder/work-with-data.mp4",
    duration: "0:17",
  },
  {
    title: "Easy customization",
    body: "Users get flexible control over the document's looks, like switching between compact and comfortable layouts without needing external PDF editing software.",
    helps: ["Powerful yet simple styling", "Granular control over output look"],
    videoPath: "/assets/output-builder/flexible-customization.mp4",
    duration: "0:13",
  },
  {
    title: "Dynamic JSON Templates",
    body: "We eliminated base PDF templates entirely. Templates are saved natively as lightweight JSON files. Edits sync instantly across the system without requiring full document rebuilds.",
    helps: ["Instant updates across the system", "Efficient infrastructure usage"],
    videoPath: "/assets/output-builder/generate-template.mp4",
    duration: "0:15",
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
      if (!v.src) v.src = v.dataset.src ?? "";
      if (v.paused) v.play().catch(() => {});
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
      el.play().catch(() => {});
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
      el.requestFullscreen().catch(() => {});
    } else if (typeof v.webkitRequestFullscreen === "function") {
      v.webkitRequestFullscreen().catch(() => {});
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
  { id: "obv3-contrast", label: "Contrast" },
  { id: "obv3-solution", label: "Solution" },
  { id: "obv3-impact", label: "Impact" },
  { id: "obv3-evolution", label: "Evolution" },
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
  const inView = useInView(ref, { once: false, amount: 0.15 });
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
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

export default function Obv3({ onBack, origin }: Props) {
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const [activeId, setActiveId] = useState<string>("obv3-hero");
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();

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
      aria-label="Form Taking case study"
      style={{ transformOrigin, willChange: "transform, opacity" }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.05, filter: "blur(8px)" }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.05, filter: "blur(8px)" }}
      transition={
        reduceMotion
          ? { duration: 0.2, ease: EASE }
          : {
              scale: { type: "spring", stiffness: 180, damping: 24, mass: 0.9 },
              opacity: { duration: 0.35, ease: EASE },
              filter: { duration: 0.35, ease: EASE },
            }
      }
    >
      <motion.button
        className="obv3-back"
        onClick={onBack}
        aria-label="Back"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Back</span>
      </motion.button>

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

      <div className="obv3-scroll">
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
            <motion.div
              className="obv3-hero__topbar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              <span className="obv3-hero__tag">Empyra · 2024</span>
              <span className="obv3-hero__index">CS — 001</span>
            </motion.div>

            <div className="obv3-hero__main">
              <div className="obv3-hero__lede">
                <motion.h1
                  className="obv3-hero__title"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
                >
                  Zero Code <br /><em>Document</em><br />Generation
                </motion.h1>

                <motion.p
                  className="obv3-hero__desc"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                >
                  Replacing a manual, engineer-dependent PDF workflow with a self-serve visual builder that cuts the template creation time by 90%.
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
                <span className="obv3-meta-label">Outputs</span>
                <span className="obv3-meta-val">90% Faster</span>
              </div>
              <div className="obv3-meta-item">
                <span className="obv3-meta-label">Type</span>
                <span className="obv3-meta-val">0 → 1 Redesign</span>
              </div>
              <div className="obv3-meta-item">
                <span className="obv3-meta-label">Timeline</span>
                <span className="obv3-meta-val">4 months</span>
              </div>
              <p className="obv3-hero__meta-note">
                This is a deep dive into output generation, part of a broader form ecosystem redesign.
              </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 01 OVERVIEW */}
        <RevealSection id="obv3-overview" className="obv3-section obv3-section--overview" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              01<span>Overview</span>
            </div>
            <div>
              <div className="obv3-eyebrow">The Problem</div>
              <h2 className="obv3-heading">
                Replacing Manual PDFs
                <br />
                with a Scalable System
              </h2>
              <p className="obv3-body">
                Organizations collect data using big forms, sometimes with 50+ questions. The system uses that data to automatically generate multiple official documents (outputs). But first, someone has to build the output templates that tell the system where these form data go.
              </p>
              <p className="obv3-body">
                Building these templates used to be heavily dependent on engineers who mapped unique response codes of each question on an external pdf manually. I designed a visual template builder that allowed even non-technical users to build and update their own templates from scratch.
              </p>

              <motion.div
                className="obv3-callout"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <div className="obv3-callout__metric">
                  90<span className="obv3-pct">%</span>
                </div>
                <div className="obv3-callout__content">
                  <h3 className="obv3-callout__title">Faster Template Creation</h3>
                  <p className="obv3-callout__line">Engineer-driven → self-serve.</p>
                  <p className="obv3-callout__line">From days of dev work to hours by anyone.</p>
                </div>
              </motion.div>

    
            </div>
          </div>
        </RevealSection>

        {/* 02 CONTRAST */}
        <RevealSection id="obv3-contrast" className="obv3-section obv3-section--contrast" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              02<span>Contrast</span>
            </div>
            <div>
              <div className="obv3-eyebrow">Before &amp; After</div>
              <h2 className="obv3-heading">
                A Manual System
                <br />
                That Didn't Scale
              </h2>
              <p className="obv3-body">
                Static PDFs don't know where form answers belong. Developers had to manually bridge that gap by mapping unique response codes to pixel coordinates on a blank PDF. This is time consuming and leads to duplication and human errors.
              </p>

              <div className="obv3-compare">
                <div className="obv3-compare__col obv3-compare__col--before">
                  <div className="obv3-compare__title">Legacy Workflow</div>
                  <ul className="obv3-compare__list">
                    <li>System generate unique response codes for every question in the form</li>
                    <li>Engineers manually map the codes onto pixel coordinates on a static PDF</li>
                    <li>External PDF software required for every template edit</li>
                    <li>Process repeated from scratch for each new output type</li>
                    <li>Misplaced response codes, misalignments and broken data common due to human error</li>
                  </ul>
                  <div className="obv3-bottleneck-tags">
                    <span className="obv3-tag">High Cost</span>
                    <span className="obv3-tag">Time Consuming</span>
                    <span className="obv3-tag">Frequent Errors</span>
                    <span className="obv3-tag">External Tools</span>
                  </div>
                </div>
                <div className="obv3-compare__col obv3-compare__col--after">
                  <div className="obv3-compare__title">New Workflow</div>
                  <ul className="obv3-compare__list">
                    <li>Visual drag-and-drop builder with zero manual mapping required</li>
                    <li>Users select form questions directly while the system handles mapping</li>
                    <li>Templates stored as lightweight JSON, no base PDF required</li>
                    <li>PDFs generated on-demand only when user hits Print/Download</li>
                    <li>Entire process runs inside the product with no external tools</li>
                  </ul>
                </div>
              </div>

              <p className="obv3-body obv3-italic" style={{ marginBottom: 0 }}>
                "The fix wasn't just a better PDF tool, it was bringing the process in-house and removing manual mapping entirely."
              </p>
            </div>
          </div>
        </RevealSection>

        {/* 03 SOLUTION */}
        <RevealSection id="obv3-solution" className="obv3-section obv3-section--solution" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              03<span>Solution</span>
            </div>
            <div>
              <div className="obv3-eyebrow">Design Decisions</div>
              <h2 className="obv3-heading">
                From Manual Workflows
                <br />
                to a Visual System
              </h2>
              <p className="obv3-body">
                I designed a completely self-serve tool that brought the entire process in-house. The system hides the complexity in the background, letting users focus on the output they want to create, not the mechanics behind it.
              </p>

              <div className="obv3-feature-list">
                {FEATURES.map((f, idx) => (
                  <motion.article
                    key={idx}
                    className="obv3-feature"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <div className="obv3-feature__index">
                      F/{String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="obv3-feature__head">
                      <div className="obv3-feature__copy">
                        <h3 className="obv3-feature__title">{f.title}</h3>
                        <p className="obv3-feature__body">{f.body}</p>
                      </div>
                      <div className="obv3-feature__helps">
                        <div className="obv3-feature__helps-label">How it helps</div>
                        <ul className="obv3-feature__helps-list">
                          {f.helps.map((h) => (
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
                    </div>
                    <motion.div
                      className="obv3-feature__media"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                      <div className="obv3-feature__media-frame">
                        <LazyVideo src={f.videoPath} className="obv3-feature__video" />
                        <div className="obv3-feature__duration">{f.duration}</div>
                      </div>
                    </motion.div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        {/* 04 IMPACT */}
        <RevealSection id="obv3-impact" className="obv3-section obv3-section--impact" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              04<span>Impact</span>
            </div>
            <div>
              <div className="obv3-eyebrow">Outcomes</div>
              <h2 className="obv3-heading">
                Removing the Bottleneck,
                <br />
                Cutting the Costs
              </h2>
              <p className="obv3-body">
                A heavy engineering task became a fast, self-serve tool. This massively sped up customer onboarding and reduced server infrastructure costs.
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
                <motion.div
                  className="obv3-impact-stat"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                >
                  <div className="obv3-stat-label">Creation Time</div>
                  <div className="obv3-stat-num">
                    <span className="obv3-stat-unit">↓</span>90<span className="obv3-stat-unit">%</span>
                  </div>
                  <div className="obv3-stat-desc">Days of dev time down to hours of self-service</div>
                </motion.div>
                <motion.div
                  className="obv3-impact-stat"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                >
                  <div className="obv3-stat-label">Dev Dependency</div>
                  <div className="obv3-stat-num">Zero</div>
                  <div className="obv3-stat-desc">Clients manage outputs without engineers or external tools</div>
                </motion.div>
                <motion.div
                  className="obv3-impact-stat"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                >
                  <div className="obv3-stat-label">Infrastructure</div>
                  <div className="obv3-stat-num">
                    <span className="obv3-stat-unit">↓</span>100<span className="obv3-stat-unit">%</span>
                  </div>
                  <div className="obv3-stat-desc">Eliminated static file storage by generating PDFs on-demand only</div>
                </motion.div>
              </motion.div>

              <div className="obv3-divider" />

              <div className="obv3-impact-compare">
                <div>
                  <div className="obv3-meta-label" style={{ marginBottom: 12 }}>Before</div>
                  <p>
                    Template creation: <span className="obv3-emph-red">2–3 days</span> of dedicated engineer time per template, with external software and manual coordinate entry.
                  </p>
                </div>
                <div>
                  <div className="obv3-meta-label" style={{ marginBottom: 12 }}>After</div>
                  <p>
                    Template creation: <span className="obv3-emph-accent">1–3 hours</span> by any non-technical team member, entirely inside the product.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* 05 EVOLUTION */}
        <RevealSection id="obv3-evolution" className="obv3-section obv3-section--evolution" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              05<span>Evolution</span>
            </div>
            <div>
              <div className="obv3-eyebrow">The North Star</div>
              <h2 className="obv3-heading">
                Exploring a
                <br />
                More Radical Idea
              </h2>
              <p className="obv3-body">
                While the visual builder solved the immediate bottleneck, I also mapped out the next horizon — a more fundamental rethinking of the problem.
              </p>

              <motion.div
                className="obv3-evolution-box"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="obv3-evolution-quote">"What if we eliminate form mapping entirely?"</p>
                <p className="obv3-evolution-detail">
                  Since most data already exists in user profiles, I pitched a workflow where admins only design the final output — the system auto-fills known data, and users only provide the missing gaps. While this required rewriting core system logic and was out of scope for this release, it established the blueprint for the product's next major evolution.
                </p>
              </motion.div>

              <p className="obv3-body obv3-evolution-tail" style={{ marginBottom: 0 }}>
                This vision shifts the mental model entirely: instead of{" "}
                <em className="obv3-emph-cream">building a form → generating a document</em>, the interface becomes{" "}
                <em className="obv3-emph-accent">design the output → system fills it in.</em>
              </p>
            </div>
          </div>
        </RevealSection>

        {/* 06 REFLECTION */}
        <RevealSection id="obv3-reflection" className="obv3-section obv3-section--reflection" onVisible={setActiveId}>
          <div className="obv3-section__inner">
            <div className="obv3-section__number">
              06<span>Reflection</span>
            </div>
            <div>
              <div className="obv3-eyebrow">Key Takeaway</div>
              <motion.div
                className="obv3-reflection-rule"
                initial={{ scaleX: 0, transformOrigin: "0% 50%" }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1, ease: EASE }}
              />
              <p className="obv3-reflection-big">
                Simplifying the system
                <br />
                beats <em>polishing</em>
                <br />
                the interface.
              </p>
              <p className="obv3-body">
                This project changed how I view complex systems. The initial goal was just to make PDF creation easier. But the biggest win came from questioning the workflow itself, not optimizing individual steps, but removing them entirely.
              </p>
              <p className="obv3-body" style={{ marginBottom: 0 }}>
                The principle that emerged:{" "}
                <span className="obv3-reflection-tail">simplifying the underlying system is always better than just polishing the pixels.</span>{" "}
                Design at the architecture level, not just the interface level.
              </p>
            </div>
          </div>
        </RevealSection>

        {/* FOOTER */}
        <motion.footer
          className="obv3-footer"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="obv3-footer__inner">
            <h2 className="obv3-footer__title">Open to the right opportunity</h2>
            <p className="obv3-footer__sub">
              Looking for roles where I can work on complex systems, collaborate deeply with engineering, and drive real product impact.
            </p>
            <a className="download-button" href={toolbarLinks.resume} target="_blank" rel="noreferrer">
              Download Resume
            </a>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
