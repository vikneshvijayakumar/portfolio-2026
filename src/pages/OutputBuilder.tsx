import { type ReactNode, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import "./OutputBuilder.css";

import clipboardIcon from "../assets/clipboard.svg?raw";
import codeIcon from "../assets/code.svg?raw";
import pdfIcon from "../assets/pdf.svg?raw";
import dataIcon from "../assets/data.svg?raw";
import syncIcon from "../assets/sync.svg?raw";
import alertIcon from "../assets/alert.svg?raw";
import bulbIcon from "../assets/bulb.svg?raw";
import checkIcon from "../assets/check.svg?raw";
import hourglassIcon from "../assets/hourglass.svg?raw";
import organizeIcon from "../assets/organize.svg?raw";
import paperIcon from "../assets/paper.svg?raw";
import searchIcon from "../assets/search.svg?raw";
import signIcon from "../assets/sign.svg?raw";
import workIcon from "../assets/work.svg?raw";

import dribbbleIcon from "../assets/dribbble.svg?raw";
import emailIcon from "../assets/email.svg?raw";
import linkedinIcon from "../assets/linkedin.svg?raw";
import whatsappIcon from "../assets/whatsapp.svg?raw";
import arrowRightIcon from "../assets/arrow-right.svg?raw";
import { toolbarLinks } from "../content";

// ---------- Motion primitives ----------
const EASE = [0.22, 1, 0.36, 1] as const;

const ThemedIcon = ({ raw, className, size = 24 }: { raw: string; className?: string; size?: number }) => {
  const themedRaw = raw
    .replace(/fill="#(0E0E0E|0F0E0D|1b1715|000000|767676)"/gi, 'fill="var(--text-soft)"')
    .replace(/fill="#C9541A"/gi, 'fill="var(--primary)"')
    .replace(/width="[0-9]+"/, `width="${size}"`)
    .replace(/height="[0-9]+"/, `height="${size}"`);
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      dangerouslySetInnerHTML={{ __html: themedRaw }}
    />
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/**
 * Only attaches the video source and begins playback once the element is near
 * the viewport. Dramatically reduces upfront bandwidth/CPU on mobile where
 * autoplaying every demo at once would fetch ~9MB of MP4.
 */
function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.src = src;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!el.src) el.src = src;
            el.play().catch(() => {});
          } else {
            if (!el.paused) el.pause();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px 200px 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : inView ? "show" : "hidden"}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

type OutputBuilderProps = {
  onBack: () => void;
};

type MetaItem = { label: string; value: string };

const META: MetaItem[] = [
  { label: "Type", value: "0→1 System Redesign, Enterprise Workflow" },
  { label: "Role", value: "Sole Product Designer" },
  { label: "Timeline", value: "4 months" },
  { label: "Product", value: "Enterprise Case Management" },
  { label: "Team", value: "Designer (me), Engineering, and Stakeholders" },
  { label: "", value: "This is a deep dive into output generation, part of a broader form ecosystem redesign." },
];

const OVERVIEW_COLUMNS = [
  {
    tag: "The Problem",
    tone: "problem",
    title: "Manual process",
    body: "Creating documents required manual data mapping, static PDFs, and heavy engineer support. This made it slow and prone to errors.",
  },
  {
    tag: "The Solution",
    tone: "solution",
    title: "Visual system",
    body: "The answer was a dynamic, visual builder. Users now work directly with form data instead of confusing response codes.",
  },
  {
    tag: "The Impact",
    tone: "impact",
    title: "Days → hours",
    body: "Creation time shrank from days to hours. Non-technical users can now build and update outputs on their own.",
  },
] as const;

const LEGACY_STEPS = [
  {
    title: "Form Setup",
    body: "Questionnaires are created with unique response codes.",
    icon: clipboardIcon,
  },
  {
    title: "Code Extraction",
    body: "Engineers extract the unique response codes from the form.",
    icon: codeIcon,
  },
  {
    title: "Map Code in PDF",
    body: "Each code placed into PDF coordinates by hand.",
    icon: clipboardIcon,
  },
  {
    title: "PDF Template",
    body: "Static PDF template manually created for each output.",
    icon: pdfIcon,
  },
  {
    title: "Upload & Test",
    body: "Template is uploaded to the system and tested.",
    icon: dataIcon,
  },
];

const PROBLEM_CARDS = [
  {
    title: "Slow setup",
    body: "Standard, recurring documents still took days of engineering time.",
    icon: hourglassIcon,
  },
  {
    title: "Engineer dependency",
    body: "Users couldn't make updates without a developer's help.",
    icon: workIcon,
  },
  {
    title: "Frequent errors",
    body: "Manually placing answer codes led to inconsistencies and mistakes.",
    icon: alertIcon,
  },
  {
    title: "Painful updates",
    body: "Changing one field meant rebuilding and re-uploading the entire layout.",
    icon: syncIcon,
  },
  {
    title: "High costs",
    body: "Storing and processing static PDFs wasted infrastructure money.",
    icon: dataIcon,
  },
  {
    title: "No version history",
    body: "Changes lacked traceability or rollback options.",
    icon: syncIcon,
  },
];

const STICKY_NOTES = [
  { index: "01", title: "Make output creation visual and intuitive", accent: "lime" },
  { index: "02", title: "Allow users to work directly with form data", accent: "blue" },
  { index: "03", title: "Make response mapping easier or automatic", accent: "coral" },
  { index: "04", title: "Remove need for static PDFs to generate an output", accent: "violet" },
];

type Feature = {
  title: ReactNode;
  body: string;
  helps: string[];
  videoPath?: string;
  duration: string;
};

const FEATURES: Feature[] = [
  {
    title: (
      <>
        Smart defaults
      </>
    ),
    body: "Users can start with predefined org layouts to save setup time. There is no need to rebuild standard structures.",
    helps: [
      "Saves initial configuration time",
      "Maintains consistency across outputs",
    ],
    videoPath: "/assets/output-builder/smart-defaults.mp4",
    duration: "0:19",
  },
  {
    title: (
      <>
        Visual builder
      </>
    ),
    body: "A drag-and-drop interface makes output creation easy for anyone. It is much faster and highly accessible for non-technical users.",
    helps: [
      "No coding knowledge required",
      "Instant visual feedback on layout",
    ],
    videoPath: "/assets/output-builder/drag-and-drop.mp4",
    duration: "0:11",
  },
  {
    title: (
      <>
        Data, not codes
      </>
    ),
    body: "Users select actual form questions instead of technical response codes. The system handles the mapping automatically. This cuts down on cognitive load and human error.",
    helps: [
      "Eliminates manual mapping errors",
      "Reduces technical dependency",
    ],
    videoPath: "/assets/output-builder/work-with-data.mp4",
    duration: "0:17",
  },
  {
    title: (
      <>
        Easy customization
      </>
    ),
    body: "Users get flexible styling options without feeling overwhelmed. The system stays simple.",
    helps: [
      "Powerful yet simple styling",
      "Granular control over output look",
    ],
    videoPath: "/assets/output-builder/flexible-customization.mp4",
    duration: "0:13",
  },
  {
    title: (
      <>
        Dynamic templates
      </>
    ),
    body: "The backend saves templates as JSON and auto-fill the user answers upon submission. This removes the need to maintain static PDFs.",
    helps: [
      "Instant updates across the system",
      "Efficient infrastructure usage",
    ],
    videoPath: "/assets/output-builder/generate-template.mp4",
    duration: "0:21",
  },
];

const NEW_WORKFLOW = [
  {
    title: "Form Setup",
    body: "Create questionnaires without response codes.",
    icon: clipboardIcon,
  },
  {
    title: "Visual Output Builder",
    body: "Drag and drop data to build the output.",
    icon: organizeIcon,
  },
  {
    title: "Iterate & Publish",
    body: "Update instantly and generate PDFs only when needed.",
    icon: syncIcon,
  },
];

const IMPACT_STATS = [
  {
    title: (
      <>
        2 to 3 days <span className="ob-accent">→ 1 to 3 hours</span>
      </>
    ),
    body: "Output creation dropped from 2-3 days to just 1-3 hours (a 90% reduction).",
  },
  {
    title: (
      <>
        Engineer-driven <span className="ob-accent">→ Self-serve</span>
      </>
    ),
    body: "Clients can now manage their own outputs without needing engineers.",
  },
  {
    title: (
      <>
        Manual <span className="ob-accent">→ Automated</span>
      </>
    ),
    body: "Removing manual work cut down on errors and system complexity.",
  },
  {
    title: (
      <>
        Rebuild <span className="ob-accent">→ Instant Update</span>
      </>
    ),
    body: "Edits no longer require full rebuilds in external tools.",
  },
];

const WHAT_IF = [
  "Admins only define the final outputs.",
  "The system auto-fills known data.",
  "Users only provide the missing information.",
  "They review, sign, and submit.",
];

const WHY_WORK = [
  "No separate form setups.",
  "No mapping layer.",
  "Faster implementations with a less complex system.",
  "Less data entry for the end users.",
];

// --- Inline placeholder icon components (generic, neutral) ---




const SocialIcon = ({ kind }: { kind: "email" | "whatsapp" | "linkedin" | "dribbble" }) => {
  const icons: Record<string, string> = {
    email: emailIcon,
    whatsapp: whatsappIcon,
    linkedin: linkedinIcon,
    dribbble: dribbbleIcon,
  };
  return (
    <div
      style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
      dangerouslySetInnerHTML={{ __html: icons[kind] }}
    />
  );
};

function OutputBuilder({ onBack }: OutputBuilderProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )) return;

    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;
    const handleMove = (e: MouseEvent) => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const el = footerRef.current;
        if (!el) return;
        el.style.setProperty("--footer-mouse-x", `${pendingX}px`);
        el.style.setProperty("--footer-mouse-y", `${pendingY}px`);
        el.style.setProperty("--footer-mouse-x-px", `${pendingX}px`);
        el.style.setProperty("--footer-mouse-y-px", `${pendingY}px`);
      });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <motion.div
      className="ob-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Output Builder case study"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ 
        duration: 0.6, 
        ease: EASE,
        opacity: { duration: 0.4 } 
      }}
    >
      {/* Floating back button */}
      <motion.button
        className="ob-back"
        onClick={onBack}
        aria-label="Back"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="ob-back__arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </span>
        <span className="ob-back__label">Back</span>
      </motion.button>

      <div className="ob-scroll">
        <motion.main
          className="ob-main"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          {/* HERO */}
          <motion.section
            className="ob-hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <motion.div
              className="ob-hero__left"
              variants={staggerParent}
              initial="hidden"
              animate="show"
            >
              <motion.h1 className="ob-h1" variants={staggerChild}>
                From Manual PDFs to a <span className="ob-accent">Visual Output System</span>
              </motion.h1>
              <motion.p className="ob-hero__sub" variants={staggerChild}>
                Output creation time went from days down to hours by completely eliminating manual workflows.
              </motion.p>
              <motion.div className="ob-hero__tags" variants={staggerChild}>
                <motion.span className="ob-tag" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                  0→1 System Redesign
                </motion.span>
                <motion.span className="ob-tag" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                  Enterprise Workflow
                </motion.span>
              </motion.div>
            </motion.div>
            <motion.aside
              className="ob-meta-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
              whileHover={{ y: -2 }}
            >
              {META.map((m, i) => (
                <motion.div
                  key={i}
                  className="ob-meta-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.45 + i * 0.06 }}
                >
                  <div className="ob-eyebrow">{m.label}</div>
                  <div className="ob-meta-value">{m.value}</div>
                </motion.div>
              ))}
            </motion.aside>
          </motion.section>

          {/* 01 QUICK OVERVIEW */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">01 — Quick Overview —</div>
            <h2 className="ob-h2">
              Replacing manual PDFs with a <span className="ob-accent">scalable system</span>
            </h2>
            <p className="ob-lede">
              Generating outputs is a crucial system feature, but the old process was slow, manual, and didn't scale.
            </p>
            <motion.div
              className="ob-overview-card"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              {OVERVIEW_COLUMNS.map((c) => (
                <motion.div key={c.tag} className={`ob-overview-col ob-overview-col--${c.tone}`} variants={staggerChild}>
                  <div className={`ob-overview-tag ob-overview-tag--${c.tone}`}>
                    <span className="ob-bullet" /> {c.tag}
                  </div>
                  <h3 className="ob-overview-title">{c.title}</h3>
                  <p className="ob-body">{c.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* 02 HOW IT WORKS NOW */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">02 — How it works now —</div>
            <h2 className="ob-h2">
              The <span className="ob-accent">legacy</span> workflow
            </h2>
            <div className="ob-prose">
              <p>
                Organizations need official documents for government and university submissions. To save time, users fill out a single unified form to generate multiple required outputs.
              </p>
              <p>
                However, actually creating these outputs was an engineering nightmare. Developers had to build templates in external PDF tools. They manually mapped form answers using unique response codes. This was tedious and caused frequent mistakes.
              </p>
              <p>
                Even a tiny change meant rebuilding the whole document. Hours of work easily turned into days. As organizations grew, this process became too slow, buggy, and expensive.
              </p>
            </div>

            <div className="ob-legacy-flow">
              <div className="ob-legacy-flow-main">
                {/* Step 1 — outside the dashed box */}
                <motion.div
                  className="ob-legacy-step-wrap--first"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="ob-legacy-step">
                    <div className="ob-legacy-step__icon">
                      <ThemedIcon raw={LEGACY_STEPS[0].icon} size={28} />
                    </div>
                    <div className="ob-legacy-step__text">
                      <h4 className="ob-legacy-step__title">{LEGACY_STEPS[0].title}</h4>
                      <p className="ob-legacy-step__body">{LEGACY_STEPS[0].body}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Down arrow into the box */}
                <div className="ob-legacy-connector" aria-hidden="true">
                  <ThemedIcon raw={arrowRightIcon} size={20} />
                </div>

                {/* Steps 2–5 inside the dashed coral box */}
                <div className="ob-legacy-box-container">
                  <motion.div
                    className="ob-legacy-box"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                  >
                    {LEGACY_STEPS.slice(1).map((s, i) => (
                      <div key={s.title} className="ob-legacy-step-wrap">
                        <div className="ob-legacy-step">
                          <div className="ob-legacy-step__icon">
                            <ThemedIcon raw={s.icon} size={28} />
                          </div>
                          <div className="ob-legacy-step__text">
                            <h4 className="ob-legacy-step__title">{s.title}</h4>
                            <p className="ob-legacy-step__body">{s.body}</p>
                          </div>
                        </div>
                        {i < LEGACY_STEPS.length - 2 && (
                          <div className="ob-legacy-connector" aria-hidden="true">
                            <ThemedIcon raw={arrowRightIcon} size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                  <p className="ob-legacy-box-label">Rework entire PDF even for minor changes in form</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 03 THE PROBLEM */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">03 — The Problem —</div>
            <h2 className="ob-h2">
              A manual system that <span className="ob-accent">didn’t scale</span>
            </h2>
            <motion.div
              className="ob-problem-grid"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              {PROBLEM_CARDS.map((p) => (
                <motion.article
                  key={p.title}
                  className="ob-problem-card"
                  variants={staggerChild}
                >
                  <div className="ob-problem-icon" aria-hidden="true">
                    <ThemedIcon raw={p.icon} size={32} />
                  </div>
                  <div className="ob-problem-content">
                    <h3 className="ob-problem-title">{p.title}</h3>
                    <p className="ob-body">{p.body}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              className="ob-insight"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="ob-insight__bigquote" aria-hidden="true">&ldquo;</div>

              <div className="ob-eyebrow ob-eyebrow--accent">Key Insight</div>
              <p className="ob-insight__quote">
                The real issue wasn't generating PDFs. It was the heavy reliance on static templates and manual mapping.
              </p>
            </motion.div>
          </motion.section>

          {/* 04 STRATEGY */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">04 — Strategy —</div>
            <h2 className="ob-h2">
              <span className="ob-accent">Redefining</span> the approach
            </h2>
            <div className="ob-prose">
              <p>
                At first, the goal was to bring PDF creation in-house and drop external tools. But the real issue wasn't <em>where</em> PDFs were made, it was <em>how</em> they were made.
              </p>
              <p>
                Manually mapping codes to static templates felt incredibly fragile. Fixing just the PDF tool would only put a band-aid on a broken system. Taking a step back, a different question came to mind:
              </p>
              <p className="ob-pull">
                What if we remove manual mapping and static PDFs completely?
              </p>
              <p>This shifted the entire focus. Instead of patching a workflow, the system itself needed a redesign.</p>
            </div>

            <motion.div
              className="ob-sticky-wall"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              {STICKY_NOTES.map((n, i) => (
                <motion.article
                  key={n.index}
                  className={`principle-card principle-card--${n.accent} ob-sticky`}
                  variants={staggerChild}
                  style={{ rotate: [-2, 1, -1, 2][i % 4], position: 'relative', left: 'auto', top: 'auto', width: '100%' }}
                  whileHover={{ y: -8, rotate: 0, scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className="principle-card__header">
                    <span>{n.index}</span>
                  </div>
                  <div className="principle-card__body">
                    <h3 className="ob-sticky__title">{n.title}</h3>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.section>

          {/* 05 SOLUTION */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">05 — The Solution —</div>
            <h2 className="ob-h2">
              From manual workflows to a <span className="ob-accent">visual system</span>
            </h2>
            <p className="ob-lede">
              A process that used to take days of developer coordination is now fully self-serve. Users build outputs directly in the system without dealing with codes or PDF templates. The system hides the complexity in the background.
            </p>

            {FEATURES.map((f, idx) => (
              <motion.div
                key={idx}
                className="ob-feature"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px 200px 0px" }}
                transition={{ duration: 0.4, ease: EASE }}
              >

                <div className="ob-feature__inner">
                  <div className="ob-feature__head">
                    <div className="ob-feature__left">
                      <h3 className="ob-feature__title">{f.title}</h3>
                      <p className="ob-body">{f.body}</p>
                    </div>
                    <div className="ob-feature__right">
                      <div className="ob-eyebrow ob-eyebrow--accent">How it helps</div>
                      <ul className="ob-helps">
                        {f.helps.map((h) => (
                          <li key={h}>
                            <ThemedIcon raw={checkIcon} size={16} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <motion.div
                    className="ob-media"
                    role="img"
                    aria-label={`Demo for ${typeof f.title === "string" ? f.title : "feature"}`}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <div className="ob-media__frame">
                      {f.videoPath ? (
                        <LazyVideo src={f.videoPath} className="ob-video" />
                      ) : (
                        <div className="ob-media__placeholder">
                          <ThemedIcon raw={dataIcon} size={48} />
                          <span>Video placeholder</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}

            <div className="ob-eyebrow ob-eyebrow--center">The New Workflow</div>
            <motion.div
              className="ob-workflow-grid"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              {NEW_WORKFLOW.map((w, i) => (
                <div key={w.title} className="ob-workflow-wrap">
                  <motion.article
                    className="ob-workflow-card"
                    variants={staggerChild}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <ThemedIcon raw={w.icon} size={40} className="ob-workflow-card__icon" />
                    <div className="ob-workflow-card__content">
                      <h4 className="ob-workflow-title">{w.title}</h4>
                      <p className="ob-body">{w.body}</p>
                    </div>
                  </motion.article>
                  {i < NEW_WORKFLOW.length - 1 && (
                    <motion.span
                      className="ob-workflow-arrow"
                      aria-hidden="true"
                      variants={staggerChild}
                    >
                      <ThemedIcon raw={arrowRightIcon} size={24} />
                    </motion.span>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* 06 IMPACT */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">06 — Impact —</div>
            <h2 className="ob-h2">
              Removing the <span className="ob-accent">bottleneck</span>
            </h2>
            <div className="ob-prose">
              <p>A heavy engineering task became a fast, self-serve tool.</p>
              <p>
                This massively improved customer onboarding. Since organizations need dozens of forms and outputs, cutting setup time meant faster launches. A major bottleneck turned into a highly scalable feature.
              </p>
            </div>
            <motion.div
              className="ob-impact-grid"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              {IMPACT_STATS.map((s, i) => (
                <motion.div key={i} className="ob-impact-item" variants={staggerChild}>
                  <h3 className="ob-impact-title">{s.title}</h3>
                  <p className="ob-body">{s.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* 07 ON THE OTHER HAND */}
          <motion.section
            className="ob-section"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">07 — On the other hand —</div>
            <h2 className="ob-h2">
              Exploring a more <span className="ob-accent">radical idea</span>
            </h2>
            <p className="ob-pull ob-pull--small">
              What if the output was designed first, letting the system handle the rest?
            </p>
            <div className="ob-prose">
              <p>
                This output builder was actually part of a larger form ecosystem redesign. While solving the current problem, I explored whether the system itself could be simplified further by removing the need for forms and mapping altogether.
              </p>
              <p>
                Most of the form data already exists in user profiles. Making users fill out forms and <em>then</em> mapping them to outputs creates duplicate work. I explored simplifying this even further.
              </p>
            </div>

            <motion.div
              className="ob-altgrid"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            >
              <motion.article
                className="ob-altcard"
                variants={staggerChild}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <h3 className="ob-altcard__title">What if?</h3>
                <ul className="ob-altcard__list">
                  {WHAT_IF.map((w) => (
                    <li key={w}>
                      <ThemedIcon raw={checkIcon} size={18} />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
              <motion.article
                className="ob-altcard"
                variants={staggerChild}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <h3 className="ob-altcard__title">Why this could work?</h3>
                <ul className="ob-altcard__list">
                  {WHY_WORK.map((w) => (
                    <li key={w}>
                      <ThemedIcon raw={checkIcon} size={16} />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            </motion.div>

            <p className="ob-body ob-body--soft">
              This would require completely rewriting core system logic and rethinking edge cases. To stick to the project scope, an incremental approach took priority.
            </p>
          </motion.section>

          {/* 08 REFLECTION */}
          <motion.section
            className="ob-section ob-section--reflection"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="ob-eyebrow ob-eyebrow--lead">08 — Reflection —</div>
            <h2 className="ob-h2">
              Simplifying the system <span className="ob-accent">beats polishing the interface.</span>
            </h2>
            <div className="ob-prose">
              <p>
                This project changed how I view complex systems. The initial idea was just to make PDF creation easier. But the real win came from questioning the workflow itself.
              </p>
              <p>
                Instead of optimizing individual steps, they were removed entirely. This made onboarding much faster for organizations with heavy document needs. More importantly, it gave non-technical users the power to safely customize their own outputs.
              </p>
              <p>In the end, the biggest gains didn’t come from improving workflows, but from redefining them.</p>
            </div>
          </motion.section>
        </motion.main>

        {/* FOOTER */}
        <motion.footer
          ref={footerRef}
          className="ob-footer"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="ob-footer__bg">
            <div className="ob-footer__bg-dots" />
            <div className="ob-footer__bg-color" />
            <div className="ob-footer__bg-glow" />
          </div>

          <div className="ob-footer__inner">
            <h2 className="ob-footer__title">Open to the right opportunity</h2>
            <p className="ob-footer__sub">
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

export default OutputBuilder;
