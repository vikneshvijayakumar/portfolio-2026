import { useEffect } from "react";
import { goBack } from "./shared";
import { useCaseStudyFx } from "./fx";
import { motion, useReducedMotion } from "motion/react";
import CaseStudyFooter from "./CaseStudyFooter";
import "./FormTaking.css";

const EASE = [0.22, 1, 0.36, 1] as const;


const FIGMA_SRC =
  "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdeck%2FAstzpq5hdC0rIVFP8qBOek%2FForm-Taking%3Fnode-id%3D1-42%26t%3DGPbiU7ok5J07P8BF-1";

type Props = {
  onBack?: () => void;
  origin?: { x: number; y: number } | null;
};

export default function FormTaking({ onBack = goBack, origin }: Props) {
  useCaseStudyFx();
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
      className="ft-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Form Taking case study"
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
      <div className="ft-topbar">
        <button className="ft-back" onClick={onBack} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div className="ft-topbar__title">
          <span className="ft-topbar__eyebrow">Empyra · 2025</span>
          <span className="ft-topbar__name">Form Taking</span>
        </div>
      </div>

      <div className="ft-body">
        <motion.section
          className="ft-slides"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="ft-slides__frame">
            <iframe
              className="ft-slides__iframe"
              src={FIGMA_SRC}
              title="Form Taking — Figma Slides"
              allowFullScreen
              allow="clipboard-write; fullscreen"
            />
          </div>
          <p className="ft-slides__caption">
            Use the slide controls inside the frame to navigate. Press F for fullscreen.
          </p>
        </motion.section>
      </div>

      <CaseStudyFooter
        title="Let's build something together"
        sub="Have questions about this case study or looking to collaborate on form design systems and user experience architecture?"
      />
    </motion.div>
  );
}
