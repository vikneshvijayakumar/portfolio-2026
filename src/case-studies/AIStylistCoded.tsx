import { type ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { goBack } from "./shared";
import { useCaseStudyFx } from "./fx";
import { motion, useInView, useReducedMotion, AnimatePresence } from "motion/react";
import CaseStudyFooter from "./CaseStudyFooter";
import "./AIStylistCoded.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  onBack?: () => void;
  origin?: { x: number; y: number } | null;
};

type RedesignStep = {
  id: string;
  stepNum: string;
  title: string;
  problem: string;
  solution: string;
  why: string;
  details?: string[];
  tag: string;
};

const REDESIGN_STEPS: RedesignStep[] = [
  {
    id: "onboarding",
    stepNum: "01",
    title: "Visual Onboarding Flow",
    tag: "Onboarding",
    problem: "Users were immediately asked to complete an assessment before understanding what the app does or what they would receive in return. This friction increases the cognitive load and makes it harder for them to understand the core value proposition.",
    solution: "Introduced visual onboarding screens that clearly explain how this application works and highlight the specific benefits users receive.",
    why: "The redesigned onboarding gives value and context to the users before requesting information. This makes the value proposition for continuing with the style assessment clear and easy to understand.",
    details: ["Highlights personalized wardrobes", "Explains the role of the AI StyleAgent", "Introduces virtual try-on early"]
  },
  {
    id: "login",
    stepNum: "02",
    title: "Login & Registration",
    tag: "Auth",
    problem: "Original design prioritized generic email and password based registration which increases friction and delays. Since only email was captured initially, name had to be captured separately before the users could start the assessment.",
    solution: "Prioritized social sign-in options to populate the name and email automatically and reduces manual inputs.",
    why: "Removing manual inputs reduced setup time and brought the users close to their first meaningful recommendation.",
    details: ["Google, Apple, Facebook integration", "Autofill profile credentials", "Instant nickname configuration"]
  },
  {
    id: "style-route",
    stepNum: "03",
    title: "Style Route Selection",
    tag: "Assessment",
    problem: "The app offered both AI assisted and manual paths with equal visual weight, when AI required less effort from the users. This increases the risk of decision fatigue as users are required to spend extra time choosing a path before they can progress.",
    solution: "Restructured the design to make the AI assisted path as the primary and the manual assessment as an optional alternative. Manual route is still available but visually deprioritized.",
    why: "The goal is to make the users get their personalized recommendations faster. By making the low effort path more prominent, many users can now reach the assessment results faster.",
    details: ["Primary 'Take My Selfie' route", "Secondary manual entry fallback", "Reduced decision fatigue"]
  },
  {
    id: "selfie-capture",
    stepNum: "04",
    title: "Selfie Posing & Guidelines",
    tag: "Camera",
    problem: "Original design used a rigid, transactional copy, which did not match with the brand's fashion-forward and lifestyle identity.",
    solution: "Updated the copy into a friendly, encouraging brand voice that guides the users about posing requirements.",
    why: "This reduces completion anxiety for the users and helps them to be more explorative rather than feeling restricted.",
    details: ["Friendly voice guides camera setups", "Straighten head / Passport photo style tips", "Clear list of posture rules"]
  },
  {
    id: "skin-tone",
    stepNum: "05",
    title: "Skin Tone Hidden Info",
    tag: "Assessment",
    problem: "Information about the skin tone was hidden behind an icon which resulted in high interaction cost and poor discoverability. Users had to guess or do additional actions to know more about it.",
    solution: "Redesigned the screen and brought the description directly inside the selection flow.",
    why: "Visual cues along with the descriptions within the selection flow allow the users to make faster and more confident decisions.",
    details: ["Brings cool, warm, and neutral descriptions inline", "Shows vein color rules explicitly", "Visual samples to choose directly"]
  },
  {
    id: "results-milestone",
    stepNum: "06",
    title: "Style Assessment Results",
    tag: "Results",
    problem: "Completing the assessment landed on a flat list of attributes and looked like a form rather than a beginning of a personalized experience.",
    solution: "Redesigned it to highlight the attributes and edit the results if required.",
    why: "Completing the assessment is a milestone in itself and this will motivate the user to the upcoming payment screen.",
    details: ["Visual breakdown of oval/apple attributes", "Easy edit parameters", "Personal roadmap celebration"]
  },
  {
    id: "payment-flow",
    stepNum: "07",
    title: "Monetization Paywall Integration",
    tag: "Monetization",
    problem: "The subscription modal appeared only when the user tried to generate an AI image after spending a lot of time on customizing the wardrobe. This caused frustration and limited conversion, looking like just a feature upgrade.",
    solution: "Introduced the subscription earlier in the journey, right after the assessment. Designed transparent plans with clear distinctions.",
    why: "Users can now understand the value of the platform before paying, while still avoiding the frustration of seeing a paywall after investing time in outfit selection.",
    details: ["Lite vs Premium comparison matrix", "Clear pricing structure (₹299/₹499)", "Occasion-smart features highlighted"]
  },
  {
    id: "landing-page",
    stepNum: "08",
    title: "Main Landing Page Dashboard",
    tag: "Dashboard",
    problem: "After onboarding, users landed on a mostly empty page with only a continue button to plan their outfit. This cold start made it difficult to understand where to begin.",
    solution: "Landing page is now transformed into a personalized dashboard that shows recommended outfits, weather based styling, and shortcuts.",
    why: "Users no longer need to search for functions. Relevant content helps the users continue with their styling journey.",
    details: ["Weather-smart widgets", "Action shortcuts", "Carousel of saved outfits"]
  },
  {
    id: "plan-outfit",
    stepNum: "09",
    title: "Guided Outfit Planning",
    tag: "Wardrobe",
    problem: "Users couldn't tell if outfits were suggestions or filters and had to navigate through multiple screens without knowing their progress, or a completion indication.",
    solution: "Redesigned the outfit planning flow with a common checklist and a guided experience with clear progression. Removed redundant filters.",
    why: "The revised flow reduced repetitive navigation, allowing adding/removing of outfits with a prominent call to action.",
    details: ["Step-by-step progress checklist (0% to 100%)", "Surfaces auto-selected matching items", "Quick add/remove controls"]
  },
  {
    id: "lookbook-library",
    stepNum: "10",
    title: "Wardrobe Lookbook Library",
    tag: "Lookbook",
    problem: "Generated outfits just existed as a set of items with limited customization. Essentially a placeholder without any sort of branding.",
    solution: "Added a lookbook where users can save, edit, and organize outfits. Promotes StylePremium up-sell.",
    why: "Users can now save wardrobes and create a personal outfit library instead of just viewing static recommendations.",
    details: ["Save and organize custom outfits", "Add ratings and private reviews", "Mannequin lookbook layout"]
  },
  {
    id: "dark-mode",
    stepNum: "11",
    title: "Dark Mode Experience",
    tag: "Theme",
    problem: "Implementing a dark mode required a detailed analysis on how colors affected styling visuals and the presentation of clothing fabrics.",
    solution: "Designed the complete dark mode experience with careful consideration of visual clarity and image contrast.",
    why: "The experience has to remain consistent across the app allowing users to enjoy the interface based on their style preferences.",
    details: ["Deep dark styling palette", "Optimized fabric texture rendering", "Seamless theme switching support"]
  },
  {
    id: "web-experience",
    stepNum: "12",
    title: "Web Portal Experience",
    tag: "Web",
    problem: "The original app focused only on mobile. There was a need for users to explore and manage their wardrobes on larger screens.",
    solution: "Adapted the mobile designs into a full web portal with optimized layouts for larger monitors.",
    why: "Allows users to seamlessly transition from mobile outfit creation to web-based wardrobe organization.",
    details: ["Two-column responsive dashboard", "Large grid layout for lookbooks", "Persistent desktop navigation"]
  }
];

const NAV_SECTIONS = [
  { id: "ps-hero", label: "Intro" },
  { id: "ps-overview", label: "Overview" },
  { id: "ps-redesign", label: "Redesign Steps" },
  { id: "ps-outcomes", label: "Outcomes" },
  { id: "ps-reflection", label: "Reflection" },
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

/** Phone frame SVG shell for mobile mockup placeholders */
function PhoneFrame({ stepId, label, variant }: { stepId: string; label: string; variant: "old" | "new" }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`ps-phone-wrap ps-phone-wrap--${variant}`}>
      <div className="ps-phone">
        {/* Phone shell */}
        <div className="ps-phone__shell">
          {/* Status bar */}
          <div className="ps-phone__status">
            <span className="ps-phone__time">9:41</span>
            <div className="ps-phone__icons">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                <rect x="0" y="3" width="3" height="7" rx="0.5" opacity="0.4" />
                <rect x="3.5" y="2" width="3" height="8" rx="0.5" opacity="0.6" />
                <rect x="7" y="0.5" width="3" height="9.5" rx="0.5" opacity="0.8" />
                <rect x="10.5" y="0" width="3" height="10" rx="0.5" />
              </svg>
              <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
                <path d="M8 2.4C10.5 2.4 12.8 3.5 14.3 5.3L16 3.5C14 1.3 11.1 0 8 0C4.9 0 2 1.3 0 3.5L1.7 5.3C3.2 3.5 5.5 2.4 8 2.4Z" opacity="0.4" />
                <path d="M8 5.6C9.6 5.6 11.1 6.3 12.2 7.5L13.9 5.7C12.3 3.9 10.3 2.8 8 2.8C5.7 2.8 3.7 3.9 2.1 5.7L3.8 7.5C4.9 6.3 6.4 5.6 8 5.6Z" opacity="0.7" />
                <path d="M8 8.8C9.1 8.8 10.1 9.3 10.8 10.1L8 13L5.2 10.1C5.9 9.3 6.9 8.8 8 8.8Z" />
              </svg>
              <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
                <rect x="0.5" y="0.5" width="21" height="10" rx="3.5" stroke="currentColor" strokeOpacity="0.35" />
                <rect x="1" y="1" width="18" height="9" rx="3" fill="currentColor" />
                <path d="M23 3.5V7.5C23.8 7.2 24.5 6.5 24.5 5.5C24.5 4.5 23.8 3.8 23 3.5Z" fill="currentColor" fillOpacity="0.4" />
              </svg>
            </div>
          </div>
          {/* Screen content area */}
          <div className="ps-phone__screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepId}
                className="ps-phone__placeholder"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="ps-phone__placeholder-icon">
                  {variant === "old" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 3v6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  )}
                </div>
                <span className="ps-phone__placeholder-label">{label}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Home indicator */}
          <div className="ps-phone__home-bar" />
        </div>
      </div>
      <div className={`ps-phone-label ps-phone-label--${variant}`}>{variant === "old" ? "Before" : "After"}</div>
    </div>
  );
}

/** Redesign steps — sticky scroll with standard section layout */
/** Redesign steps — all steps stacked one below the other, regular scroll */
function RedesignStepsSection({
  onVisible,
}: {
  onVisible: (id: string) => void;
}) {
  return (
    <RevealSection id="ps-redesign" className="ps-section ps-section--redesign-mobile" onVisible={onVisible}>
      <div className="ps-section__inner">
        <div className="ps-section__number">
          04<span>Redesign</span>
        </div>
        <div className="ps-redesign-content-mobile" style={{ display: "flex", flexDirection: "column", gap: "48px", width: "100%" }}>
          {REDESIGN_STEPS.map((s) => (
            <div key={s.id} className="ps-redesign-mobile-step" style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--ps-line)", paddingBottom: "40px" }}>
              <div style={{ fontFamily: "var(--ps-font-mono)", fontSize: "12px", color: "var(--ps-accent)" }}>
                {s.stepNum} / {s.tag}
              </div>
              <h3 className="ps-heading" style={{ margin: 0, fontSize: "28px" }}>{s.title}</h3>
              <p className="ps-body" style={{ margin: 0 }}>{s.why}</p>

              <div className="ps-redesign-card__text-pair-mobile" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="ps-redesign-card__text">
                  <div className="ps-redesign-card__block-label">
                    <span className="ps-redesign-card__dot ps-redesign-card__dot--old" />
                    The Problem
                  </div>
                  <p style={{ margin: 0, fontSize: "16px", color: "var(--text-soft)", lineHeight: "1.6" }}>{s.problem}</p>
                </div>
                <div className="ps-redesign-card__text">
                  <div className="ps-redesign-card__block-label">
                    <span className="ps-redesign-card__dot ps-redesign-card__dot--new" />
                    What I Changed
                  </div>
                  <p style={{ margin: 0, fontSize: "16px", color: "var(--text-soft)", lineHeight: "1.6" }}>{s.solution}</p>
                </div>
              </div>

              <div className="ps-redesign-card__phones-mobile" style={{ display: "flex", flexDirection: "row", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                <PhoneFrame stepId={s.id} label={`${s.title} (Before)`} variant="old" />
                <PhoneFrame stepId={s.id} label={`${s.title} (After)`} variant="new" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

export default function AIStylistCoded({ onBack = goBack, origin }: Props) {
  useCaseStudyFx();
  const transformOrigin = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  const [activeId, setActiveId] = useState<string>("ps-hero");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.5 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (heroInView) {
      setActiveId("ps-hero");
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

  const handleRedesignVisible = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <motion.div
      className="ps-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="AIStylist case study"
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
        <a className="ps-back" href="/" onClick={goBack} aria-label="Back to the portfolio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </a>
        <div className="ps-topbar__title">
          <span className="ps-topbar__eyebrow">Concept · 2024</span>
          <span className="ps-topbar__name">AIStylist Redesign</span>
        </div>
      </div>

      {/* Sidebar Nav */}
      <nav className="ps-sidenav" aria-label="Sections">
        {NAV_SECTIONS.map((s) => {
          const isSectionActive = (() => {
            if (s.id === "ps-overview") {
              return activeId === "ps-overview" || activeId === "ps-challenge" || activeId === "ps-goal";
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
          id="ps-hero"
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
                  AI <em>Stylist</em><br />Redesign
                </motion.h1>

                <motion.p
                  className="ps-hero__desc"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                >
                  Redesigning an AI fashion stylist platform with better information architecture, progressive disclosure, and feature discoverability.
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
                  <span className="ps-meta-val">Lead Product Designer</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Duration</span>
                  <span className="ps-meta-val">8 Weeks</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Platform</span>
                  <span className="ps-meta-val">iOS, Android, Web</span>
                </div>
                <div className="ps-meta-item">
                  <span className="ps-meta-label">Deliverables</span>
                  <span className="ps-meta-val">UX Audit, Flows, UI, DS</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* OVERVIEW */}
        <RevealSection id="ps-overview" className="ps-section ps-section--overview" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              01<span>Overview</span>
            </div>
            <div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">What is AIStylist?</h2>
                <p className="ps-body">
                  AIStylist is an AI-powered fashion styling app designed to reduce decision fatigue and build AI powered, personalized wardrobes curated based on users' physical attributes and style preferences.
                </p>
                <p className="ps-body">
                  The core differentiator was their recommendation engine, which integrated expert backed styling rules with AI generated images to show users how their curated outfits will look on them.
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* CHALLENGE */}
        <RevealSection id="ps-challenge" className="ps-section ps-section--challenge" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              02<span>Challenge</span>
            </div>
            <div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">High Friction, Low Transparency</h2>
                <p className="ps-body">
                  During my UX audit, I identified that the users were required to complete several steps before even knowing what they would finally get. This created a high friction experience and impacted how the users experienced the app.
                </p>
              </div>
              <div className="ps-audit-grid">
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>Delayed Time to Value:</strong> Users were required to complete a style assessment and share personal details before knowing what they would finally get. This increased the risk of early abandonment.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>Hard to Discover Features:</strong> Important features like wardrobe management, the unique ability to choose between Indian and Western attairs were hidden in between screens.</p>
                </div>
                <div className="ps-audit-card">
                  <p className="ps-body"><strong>Low Transparency:</strong> Users were not clearly informed how recommendations were generated or how their inputs changed the outfit selection. This made the whole process feel random and not personalized.</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* GOAL */}
        <RevealSection id="ps-goal" className="ps-section ps-section--goal" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              03<span>Goal</span>
            </div>
            <div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">Help users reach their first meaningful styling recommendation as quickly and confidently as possible.</h2>
                <p className="ps-body">
                  I focused on redesigning the app focusing on reducing cognitive load, improving feature discoverability and making personalization more transparent throughout the app.
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* REDESIGN STEPS — sticky scroll */}
        <RedesignStepsSection onVisible={handleRedesignVisible} />

        {/* OUTCOMES */}
        <RevealSection id="ps-outcomes" className="ps-section ps-section--outcomes" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              05<span>Outcomes</span>
            </div>
            <div>
              <div className="ps-heading-body-group">
                <h2 className="ps-heading">System Impact</h2>
                <p className="ps-body">
                  The redesign shifted AIStylist from a set of disjointed screens to a unified, cohesive styling experience.
                </p>
              </div>

              <div className="ps-outcomes-grid">
                <div className="ps-outcome-card">
                  <h4>Accelerated Value</h4>
                  <p>Social authentication and inline descriptions cut setup time by over 50%, letting users see matching outfits immediately.</p>
                </div>
                <div className="ps-outcome-card">
                  <h4>Enhanced Monetization</h4>
                  <p>Introducing plans right after the milestone results screen made the premium proposition clear and boosted checkout conversions.</p>
                </div>
                <div className="ps-outcome-card">
                  <h4>True Personalization</h4>
                  <p>By connecting user preferences directly to the recommendation dashboard, trust and interaction rates increased significantly.</p>
                </div>
                <div className="ps-outcome-card">
                  <h4>Device Uniformity</h4>
                  <p>Whether on web or mobile, light or dark mode, the system now runs on a unified, responsive components architecture.</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* REFLECTION */}
        <RevealSection id="ps-reflection" className="ps-section ps-section--reflection" onVisible={setActiveId}>
          <div className="ps-section__inner">
            <div className="ps-section__number">
              06<span>Reflection</span>
            </div>
            <div>
              <p className="ps-reflection-big">
                Restructuring the journey
                beats polishing
                individual features.
              </p>
              <div className="ps-body-group">
                <p className="ps-body">
                  The redesign was not about introducing new functionality. Most of the platform's strongest capabilities already existed in the backend.
                </p>
                <p className="ps-body">
                  By restructuring the user journey, surfacing value earlier, and removing unnecessary navigation overhead, we unlocked the platform's true potential. Designing the system architecture is always more impactful than just styling the interface.
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* FOOTER */}
        <CaseStudyFooter
          title="Let's build something together"
          sub="Have questions about this case study or looking to collaborate on complex styling systems and design architectures?"
        />
      </div>
    </motion.div>
  );
}
