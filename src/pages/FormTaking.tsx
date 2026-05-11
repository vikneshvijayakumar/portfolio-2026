import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import "./FormTaking.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const PASSWORD_HASH = "2a7eef6a830db3a96c4710b22f833ca2b76e990bb3445977ac6ce848cd14fd05";
const STORAGE_KEY = "viknesh-form-taking-unlocked";
const FIGMA_SRC =
  "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdeck%2FAstzpq5hdC0rIVFP8qBOek%2FForm-Taking%3Fnode-id%3D1-42%26t%3DGPbiU7ok5J07P8BF-1";

type Props = {
  onBack: () => void;
  origin?: { x: number; y: number } | null;
};

export default function FormTaking({ onBack, origin }: Props) {
  const reduceMotion = useReducedMotion();
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (!unlocked) {
      // Focus the input shortly after mount so users can type immediately.
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(t);
    }
  }, [unlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const encoder = new TextEncoder();
    const data = encoder.encode(value.trim().toLowerCase());

    try {
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (hashHex === PASSWORD_HASH) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // ignore storage errors
        }
        setError(null);
        setUnlocked(true);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while verifying the password.");
    }
  };

  return (
    <motion.div
      className="ft-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Form Taking case study"
      style={{ transformOrigin, willChange: "transform, opacity" }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.05 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.05 }}
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
        {!unlocked ? (
          <motion.section
            className="ft-gate"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          >
            <div className="ft-gate__lock" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="ft-gate__heading">
              <span className="ft-gate__eyebrow">Protected case study</span>
              <h1 className="ft-gate__title">Form Taking</h1>
              <p className="ft-gate__desc">
                This case study contains work that I cannot share publicly and is password protected. Please enter the
                password to view the presentation.
              </p>
            </div>

            <form className="ft-gate__form" onSubmit={handleSubmit}>
              <div className="ft-gate__field">
                <label className="ft-gate__label" htmlFor="ft-password">
                  Password
                </label>
                <input
                  ref={inputRef}
                  id="ft-password"
                  className={`ft-gate__input${error ? " is-error" : ""}`}
                  type="password"
                  autoComplete="off"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "ft-password-error" : undefined}
                />
              </div>

              <div className="ft-gate__error" id="ft-password-error" role="alert">
                {error ?? ""}
              </div>

              <button className="ft-gate__submit" type="submit" disabled={!value}>
                Unlock case study
              </button>

              <p className="ft-gate__hint">
                Don't have the password? Reach out and I'll share it with you.
              </p>
            </form>
          </motion.section>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
}
