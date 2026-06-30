import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import CaseStudyFooter from "../components/CaseStudyFooter";
import "./PocketStylist.css";
import "./ClinicalDocumentation.css";
import intakeVideo from "../assets/intake-v3.webm";
import companionAppImage from "../assets/companion-app.webp";
import trainerImage from "../assets/trainer.webp";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  onBack: () => void;
  origin?: { x: number; y: number } | null;
};

type Module = {
  id: string;
  num: string;
  tag: string;
  title: string;
  subtitle: string;
  problem: string;
  challenge: string;
  solution: string;
  annotations: string[];
};

const MODULES: Module[] = [
  {
    id: "patient-intake",
    num: "01",
    tag: "Patient Intake",
    title: "Patient Intake",
    subtitle: "Fix the data at the source, before the visit even starts.",
    problem:
      "Physical intake forms are long and complex. Patients are expected to fill in a lot of fields, full of medical terms they cannot read or understand. So they end up needing a nurse to fill it in for them, or worse, enter incorrect information.",
    challenge:
      "The design has to work on any device, in any language, and support patients who cannot fill the form by themselves.",
    solution:
      "I show one question at a time. This single design decision had a cascading effect. Only the questions relevant to the patient are shown, the conditions resolve dynamically as they answer, and help adapts to each question and stays within reach. One answer can hide or reveal many others. Smoking cessation questions appear only for a patient who is both a minor and a smoker, so no one else ever sees them.",
    annotations: [
      "One question at a time",
      "Conditions resolve dynamically",
      "Context-aware help stays in reach",
      "Branching that hides or reveals questions",
    ],
  },
  {
    id: "companion-app",
    num: "02",
    tag: "Companion App",
    title: "Companion App, the core",
    subtitle: "The provider talks to the patient, not a screen.",
    problem:
      "The provider spends most of the day on data entry and ends up with very little time for the patient conversation. The patient does not get their questions answered and feels neglected.",
    challenge:
      "AI produces a lot of insight. The challenge was to organize and disclose it progressively, without interrupting the conversation, while still letting the assistant take requests.",
    solution:
      "I proposed a realtime chat interface. The screen glows in a color when the AI has something to say, and requests like a lab order or a reminder appear as color coded bubbles, so a single glance confirms they registered. If a detail is missing, the provider can check the EHR or the live summary and confirm it with the patient on the spot, instead of dictating an addendum later.",
    annotations: [
      "Color states for speaker and alerts",
      "Three capture modes",
      "Privacy mode",
      "Connection lost state",
    ],
  },
  {
    id: "ai-trainer",
    num: "03",
    tag: "AI Assistant Trainer",
    title: "AI Assistant Trainer",
    subtitle: "Teaching the assistant to take real clinical actions.",
    problem:
      "These workflows hold a lot of questions. Showing them all at once results in endless scrolling, and conditional questions get hidden.",
    challenge:
      "Let a non engineer build a complex flow with clinical logic and still see the whole flow, without it collapsing into a list no one can follow.",
    solution:
      "I proposed a node based canvas. Questions are laid out spatially and linked to the answers that lead to them, so the logic is something you can see, not scroll through.",
    annotations: [
      "Auto-arranging canvas",
      "Left panel pans to the selected question",
      "Highlights directly connected questions",
      "Linkable subforms",
    ],
  },
];

const TAKEAWAYS = [
  {
    title: "Design for the last user",
    body:
      "I learned how a permission set at the top reaches all the way down to the last person who uses it, the nurse, the patient. Now I start with that whole flow in mind before I design a screen.",
  },
  {
    title: "Build to ship",
    body:
      "An idea only matters if it can be built. The auto arranging canvas worked only because I designed it together with the developers. Now I bring engineering in early, while the idea is still forming.",
  },
  {
    title: "Edge cases first",
    body:
      "The happy path is the easy part. The real design is in the dropped connection, or the patient who says no to AI. Now I look for what breaks the flow, not what makes it.",
  },
  {
    title: "How AI works behind the scenes",
    body:
      "I designed the training modules, an inference engine, a realtime assistant, and more. That gave me a real sense of how AI lives and works inside a product.",
  },
];

const NAV_SECTIONS = [
  { id: "cd-hero", label: "Intro" },
  { id: "cd-overview", label: "Overview" },
  { id: "cd-modules", label: "Modules" },
  { id: "cd-takeaways", label: "Takeaways" },
  { id: "cd-reflection", label: "Reflection" },
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

/** Phone-style mockup placeholder for a clinical module screen */
function ModuleMockup({ label }: { label: string }) {
  return (
    <div className="cd-placeholder">
      <span className="cd-placeholder__label">{label}</span>
    </div>
  );
}

function ModuleBlocks({ module }: { module: Module }) {
  return (
    <div className="cd-module__blocks">
      <div className="ps-redesign-card__text">
        <div className="ps-redesign-card__block-label">
          <span className="ps-redesign-card__dot ps-redesign-card__dot--old" />
          The Problem
        </div>
        <p>{module.problem}</p>
      </div>
      <div className="ps-redesign-card__text">
        <div className="ps-redesign-card__block-label">
          <span className="ps-redesign-card__dot cd-dot--mid" />
          The Challenge
        </div>
        <p>{module.challenge}</p>
      </div>
      <div className="ps-redesign-card__text">
        <div className="ps-redesign-card__block-label">
          <span className="ps-redesign-card__dot ps-redesign-card__dot--new" />
          The Solution
        </div>
        <p>{module.solution}</p>
      </div>
    </div>
  );
}

function ModuleAnnotations({ items }: { items: string[] }) {
  return (
    <ul className="cd-annotations">
      {items.map((item) => (
        <li key={item} className="cd-annotations__item">
          {item}
        </li>
      ))}
    </ul>
  );
}

function MaximizeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="cd-media-maximize"
      onClick={onClick}
      aria-label="View full screen"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button>
  );
}

type LightboxMedia = { type: "image"; src: string; alt: string };

/** Chrome (backdrop, close button, animated frame) shared by the image lightbox
 *  and the video lightbox. `children` is the media content for that slot. */
function LightboxChrome({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="cd-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <motion.button
        type="button"
        className="cd-lightbox__close"
        onClick={onClose}
        aria-label="Close full screen view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE, delay: reduceMotion ? 0 : 0.1 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </motion.button>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ media, onClose }: { media: LightboxMedia; onClose: () => void }) {
  return (
    <LightboxChrome onClose={onClose}>
      <img src={media.src} alt={media.alt} className="cd-lightbox__img" />
    </LightboxChrome>
  );
}

/** Renders only the chrome + an empty slot div. The actual <video> element is
 *  portaled into this slot from outside, so it's the same DOM node that was
 *  playing inline — expanding/collapsing never restarts or pauses it. */
function VideoLightboxFrame({
  onClose,
  slotRef,
}: {
  onClose: () => void;
  slotRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <LightboxChrome onClose={onClose}>
      <div ref={slotRef} className="cd-lightbox__video-slot" />
    </LightboxChrome>
  );
}

/** Modules — single section, all modules stacked one below the other */
function ModulesSection({ onVisible }: { onVisible: (id: string) => void }) {
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);

  // Video expand/collapse: a single <video> node is portaled between the
  // inline slot and the lightbox slot, so playback never restarts or pauses.
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [inlineVideoSlot, setInlineVideoSlot] = useState<HTMLDivElement | null>(null);
  const [lightboxVideoSlot, setLightboxVideoSlot] = useState<HTMLDivElement | null>(null);
  const videoTarget = lightboxVideoSlot ?? inlineVideoSlot;

  const intakeVideoEl = (
    <video
      className={videoExpanded ? "cd-lightbox__img" : "cd-module__video"}
      src={intakeVideo}
      autoPlay
      loop
      muted={!videoExpanded}
      controls={videoExpanded}
      playsInline
    />
  );

  return (
    <RevealSection id="cd-modules" className="ps-section ps-section--modules" onVisible={onVisible}>
      <div className="ps-section__inner">
        <div className="ps-section__number">
          04<span>Modules</span>
        </div>
        <div className="cd-modules">
          <div className="ps-eyebrow">The Build</div>
          <div className="cd-modules-list">
            {MODULES.map((module) => (
              <div key={module.id} className="cd-module">
                <div className="cd-module__meta">{module.num} / {module.tag}</div>
                <h3 className="ps-heading cd-module__title">{module.title}</h3>
                <p className="ps-body">{module.subtitle}</p>

                {module.id === "patient-intake" ? (
                  <>
                    <div className="cd-module__texts">
                      <ModuleBlocks module={module} />
                    </div>
                    <div className="cd-media">
                      <div ref={setInlineVideoSlot} className="cd-media-video-slot" />
                      <MaximizeButton onClick={() => setVideoExpanded(true)} />
                    </div>
                  </>
                ) : module.id === "companion-app" ? (
                  <>
                    <div className="cd-module__texts">
                      <ModuleBlocks module={module} />
                    </div>
                    <div className="cd-media">
                      <img
                        className="cd-module__video"
                        src={companionAppImage}
                        alt={module.title}
                      />
                      <MaximizeButton
                        onClick={() => setLightboxMedia({ type: "image", src: companionAppImage, alt: module.title })}
                      />
                    </div>
                  </>
                ) : module.id === "ai-trainer" ? (
                  <>
                    <div className="cd-module__texts">
                      <ModuleBlocks module={module} />
                    </div>
                    <div className="cd-media">
                      <img
                        className="cd-module__video"
                        src={trainerImage}
                        alt={module.title}
                      />
                      <MaximizeButton
                        onClick={() => setLightboxMedia({ type: "image", src: trainerImage, alt: module.title })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="cd-module__pair">
                    <div className="cd-module__texts">
                      <ModuleBlocks module={module} />
                    </div>
                    <div className="cd-module__mockup">
                      <div className="cd-module__mockup-inner">
                        <ModuleMockup label={module.title} />
                        <ModuleAnnotations items={module.annotations} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxMedia && (
          <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence onExitComplete={() => setLightboxVideoSlot(null)}>
        {videoExpanded && (
          <VideoLightboxFrame
            onClose={() => setVideoExpanded(false)}
            slotRef={setLightboxVideoSlot}
          />
        )}
      </AnimatePresence>

      {videoTarget && createPortal(intakeVideoEl, videoTarget)}
    </RevealSection>
  );
}

export default function ClinicalDocumentation({ onBack, origin }: Props) {
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const [activeId, setActiveId] = useState<string>("cd-hero");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (heroInView) setActiveId("cd-hero");
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
      className="ps-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Clinical Documentation case study"
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
      {/* Topbar */}
      <div className="ps-topbar">
        <button className="ps-back" onClick={onBack} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div className="ps-topbar__title">
          <span className="ps-topbar__eyebrow">Healthcare AI · 2018–2021</span>
          <span className="ps-topbar__name">Clinical Documentation Platform</span>
        </div>
      </div>

      {/* Sidebar Nav */}
      <nav className="ps-sidenav" aria-label="Sections">
        {NAV_SECTIONS.map((s) => {
          const isSectionActive = (() => {
            if (s.id === "cd-overview") {
              return activeId === "cd-overview" || activeId === "cd-challenge" || activeId === "cd-approach";
            }
            return activeId === s.id;
          })();
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={isSectionActive ? "is-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(s.id);
              }}
            >
              {s.label}
            </a>
          );
        })}
      </nav>

      {/* Main Scroll Content */}
      <div className="ps-scroll" ref={scrollContainerRef}>

        {/* HERO */}
        <motion.section
          ref={heroRef}
          id="cd-hero"
          className="ps-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="ps-hero__inner">
            <div className="ps-hero__main">
              <div className="ps-hero__lede">
                <motion.h1
                  className="ps-hero__title"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
                >
                  Realtime Clinical<br /><em>Documentation</em>
                </motion.h1>

                <motion.p
                  className="ps-hero__desc"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                >
                  Designing the interface for AI native clinical documentation, before AI was a thing. A realtime clinical AI platform that listens to provider and patient conversations and gives realtime insights and reports as they happen.
                </motion.p>

                <motion.div
                  className="ps-scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 1 }}
                >
                  Scroll to explore
                </motion.div>
              </div>

              <motion.div
                className="ps-hero__meta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
              >
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Role</span>
                  <span className="ps-meta-val">Lead UI Designer</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Duration</span>
                  <span className="ps-meta-val">2018 — 2021</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Platform</span>
                  <span className="ps-meta-val">Web, iOS, Android</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Scale</span>
                  <span className="ps-meta-val">1000+ Screens</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* OVERVIEW */}
        <RevealSection id="cd-overview" className="ps-section ps-section--overview" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              01<span>Overview</span>
            </div>
            <div>
              <div className="ps-eyebrow">The Platform</div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">Designing for AI native documentation</h2>
                <p className="ps-body">
                  I built the design for the entire platform, designed the core modules, and led the design team to expand on them. The platform listens to provider and patient conversations and produces realtime insights and reports as they happen.
                </p>
                <p className="ps-body">
                  It is a natural evolution of an AI transcription platform I designed with the CEO before, reusing its speech recognition, NLP and inference engines.
                </p>
              </div>
              <div className="cd-stats">
                <div className="cd-stat">
                  <span className="cd-stat__num">0 → 1</span>
                  <span className="cd-stat__label">End to end platform design</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat__num">30+</span>
                  <span className="cd-stat__label">Modules designed for web & mobile</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat__num">4 yrs</span>
                  <span className="cd-stat__label">From a solo designer to design lead</span>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* CHALLENGE */}
        <RevealSection id="cd-challenge" className="ps-section ps-section--challenge" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              02<span>Challenge</span>
            </div>
            <div>
              <div className="ps-eyebrow">The Problem</div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">A doctor should be able to look at their patient, not a screen.</h2>
                <p className="ps-body">
                  Manual clinical documentation steals time from providers and nurses. They spend extended hours completing documentation and less time on patient care and conversation.
                </p>
              </div>
              <div className="ps-audit-grid">
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>The Problem:</strong> Manual documentation and EHRs pull providers away from the patient. Hours go into paperwork instead of care and conversation.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>The Vision:</strong> Move beyond manual clinical documentation and EHRs to a platform that transforms the healthcare workflow with AI.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>The Precursor:</strong> A natural evolution of an AI transcription platform I designed before, reusing its speech recognition, NLP, and inference engines.</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* APPROACH */}
        <RevealSection id="cd-approach" className="ps-section ps-section--goal" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              03<span>Approach</span>
            </div>
            <div>
              <div className="ps-eyebrow">The North Star</div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">Reduce documentation by managing the data across the whole visit.</h2>
                <p className="ps-body">
                  Documentation cannot be fixed with one screen. It has to be handled across the journey, from the moment a patient checks in until the report is done. The complete flow included 1000+ screens, for every user and every edge case.
                </p>
                <p className="ps-body">
                  A birds eye view: the flow starts by capturing the provider and patient conversation and streaming it to speech recognition that transcribes it in realtime. A conversational AI assistant interacts with the provider directly, while an NLP engine extracts the context and generates reports automatically, with a complete human in the loop workflow for fixing lower confidence results.
                </p>
              </div>
              <div className="ps-audit-grid">
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>Patient Intake:</strong> So the data is right from the start.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>The Companion App:</strong> So the provider documents nothing by hand.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>The AI Trainer:</strong> So the assistant can take real clinical actions.</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* MODULES — single section, all modules stacked */}
        <ModulesSection onVisible={setActiveId} />

        {/* TAKEAWAYS */}
        <RevealSection id="cd-takeaways" className="ps-section ps-section--outcomes" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              05<span>Takeaways</span>
            </div>
            <div>
              <div className="ps-eyebrow">What I Carry Forward</div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">An early view of AI inside a clinical product</h2>
                <p className="ps-body">
                  Designing this gave me a rare, early view of how AI can live inside a clinical product, and that is what I bring to healthcare design now.
                </p>
              </div>
              <div className="ps-outcomes-grid">
                {TAKEAWAYS.map((t) => (
                  <div key={t.title} className="ps-outcome-card">
                    <h4>{t.title}</h4>
                    <p>{t.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        {/* REFLECTION */}
        <RevealSection id="cd-reflection" className="ps-section ps-section--reflection" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              06<span>Reflection</span>
            </div>
            <div>
              <div className="ps-eyebrow">Key Takeaway</div>
              <p className="ps-reflection-big">
                AI can be on every screen,
                but the human should be
                the <em>decision maker</em>.
              </p>
              <div className="ps-body-group">
                <p className="ps-body">
                  This is one belief that formed the base of all my designs. I learned how a permission set at the top reaches all the way down to the last person who uses it, the nurse, the patient.
                </p>
                <p className="ps-body">
                  The happy path is the easy part. The real design is in the dropped connection, or the patient who says no to AI. Now I look for what breaks the flow, not what makes it.
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* FOOTER */}
        <CaseStudyFooter
          title="Let's build something together"
          sub="Have questions about this case study or looking to collaborate on AI native clinical products and complex healthcare workflows?"
        />
      </div>
    </motion.div>
  );
}
