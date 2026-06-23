import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import CaseStudyFooter from "../components/CaseStudyFooter";
import "./AIStylist.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const FIGMA_SRC =
  "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdeck%2Fiy15baRKp84wLmLnkXz6tP%2FPockeStylist%3Fnode-id%3D5-36%26t%3D3zDoeSAS7Ukuojnm-1";

type Props = {
  onBack: () => void;
  origin?: { x: number; y: number } | null;
};

export default function AIStylist({ onBack, origin }: Props) {
  const reduceMotion = useReducedMotion();

  // Compute transform-origin from card click point so the overlay zooms in from the card.
  const transformOrigin =
    origin && typeof window !== "undefined"
      ? `${(origin.x / window.innerWidth) * 100}% ${(origin.y / window.innerHeight) * 100}%`
      : "50% 50%";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <motion.div
      className="as-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="PocketStylist AI Redesign presentation"
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
      <div className="as-topbar">
        <button className="as-back" onClick={onBack} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div className="as-topbar__title">
          <span className="as-topbar__eyebrow">PocketStylist · 2025</span>
          <span className="as-topbar__name">AI Redesign Deck</span>
        </div>
      </div>

      <div className="as-body">
        <motion.section
          className="as-slides"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="as-slides__frame">
            <iframe
              className="as-slides__iframe"
              src={FIGMA_SRC}
              title="PocketStylist AI Redesign — Figma Slides"
              allowFullScreen
              allow="clipboard-write; fullscreen"
            />
          </div>
          <p className="as-slides__caption">
            Use the slide controls inside the frame to navigate. Press F for fullscreen.
          </p>
        </motion.section>
      </div>

      <CaseStudyFooter
        title="Let's build something together"
        sub="Have questions about the AI stylist design system or looking to collaborate on B2C SaaS and mobile personalization workflows?"
      />
    </motion.div>
  );
}
