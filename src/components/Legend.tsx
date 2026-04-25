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
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">Click</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">Drag</kbd>
                  </span>
                  <span className="legend-card__action">Pan Canvas</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">←</kbd>
                    <span className="legend-card__plus">/</span>
                    <kbd className="legend-card__key">→</kbd>
                  </span>
                  <span className="legend-card__action">Switch Section</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">1 - 5</kbd>
                  </span>
                  <span className="legend-card__action">Jump to Section</span>
                </div>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">{modifierKey}</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">Scroll</kbd>
                  </span>
                  <span className="legend-card__action">Smooth Zoom</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">{modifierKey}</kbd>
                    <span className="legend-card__plus">+</span>
                    <kbd className="legend-card__key">0</kbd>
                  </span>
                  <span className="legend-card__action">Reset Zoom</span>
                </div>
              </div>

              <div className="legend-card__divider" />

              <div className="legend-card__section">
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">T</kbd>
                  </span>
                  <span className="legend-card__action">Switch Theme</span>
                </div>
                <div className="legend-card__row">
                  <span className="legend-card__keys">
                    <kbd className="legend-card__key">Shift + /</kbd>
                  </span>
                  <span className="legend-card__action">Toggle Help</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
