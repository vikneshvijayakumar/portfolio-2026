import { motion, AnimatePresence } from "motion/react";
import { MODIFIER_KEY } from "../utils/constants";

export default function Legend({ isOpen, modifierKey = MODIFIER_KEY }: { isOpen: boolean; modifierKey?: string }) {
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
            <h2 className="legend-card__title">Canvas Controls</h2>

            <div className="legend-card__sections">
              <div className="legend-card__section">
                <LegendRow action="Pan Canvas">
                  <kbd className="legend-card__key">Click</kbd>
                  <span className="legend-card__plus">+</span>
                  <kbd className="legend-card__key">Drag</kbd>
                </LegendRow>
                <LegendRow action="Switch Section">
                  <kbd className="legend-card__key">←</kbd>
                  <span className="legend-card__plus">/</span>
                  <kbd className="legend-card__key">→</kbd>
                </LegendRow>
                <LegendRow action="Jump to Section">
                  <kbd className="legend-card__key">1 - 5</kbd>
                </LegendRow>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <LegendRow action="Smooth Zoom">
                  <kbd className="legend-card__key">{modifierKey}</kbd>
                  <span className="legend-card__plus">+</span>
                  <kbd className="legend-card__key">Scroll</kbd>
                </LegendRow>
                <LegendRow action="Reset Zoom">
                  <kbd className="legend-card__key">{modifierKey}</kbd>
                  <span className="legend-card__plus">+</span>
                  <kbd className="legend-card__key">0</kbd>
                </LegendRow>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <LegendRow action="Switch Theme">
                  <kbd className="legend-card__key">T</kbd>
                </LegendRow>
                <LegendRow action="Toggle Help">
                  <kbd className="legend-card__key">Shift + /</kbd>
                </LegendRow>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendRow({ children, action }: { children: React.ReactNode; action: string }) {
  return (
    <div className="legend-card__row">
      <span className="legend-card__keys">{children}</span>
      <span className="legend-card__action">{action}</span>
    </div>
  );
}
