import { useState, useRef, useEffect, memo } from "react";
import { motion } from "motion/react";
import { experience, type ZoneId } from "../content";
import { getCardTransition } from "../utils/constants";

const ExperienceStack = memo(function ExperienceStack({ 
  isMobile, 
  onFocusPoint,
  isStarted = false
}: { 
  isMobile: boolean; 
  onFocusPoint: (worldX: number, worldY: number) => void;
  isStarted?: boolean;
}) {
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const lastToggleRef = useRef<number>(0);

  const toggleFolder = (id: string) => {
    const now = performance.now();
    if (now - lastToggleRef.current < 300) return; // debounce
    lastToggleRef.current = now;
    setOpenFolderId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!openFolderId) return;
    const handleOutside = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(".experience-folder")) {
        setOpenFolderId(null);
      }
    };
    window.addEventListener("pointerdown", handleOutside);
    return () => window.removeEventListener("pointerdown", handleOutside);
  }, [openFolderId]);

  return (
    <>
      {experience.map((item, index) => {
        const desktopRotate = item.desktopPosition?.rotation ?? 0;
        const desktopX = item.desktopPosition?.x ?? 0;
        const desktopY = item.desktopPosition?.y ?? 0;

        let finalX = desktopX;
        if (isMobile) {
          if (item.company.includes("Upwork") || item.company === "Spiceblue") {
            finalX = desktopX + 140;
          }
        }

        const style = {
          left: finalX,
          top: desktopY,
          "--folder-color": item.logoColor ?? "#a886ff"
        } as React.CSSProperties;

        const folderId = item.role + item.company;
        const isOpen = openFolderId === folderId;

        return (
          <motion.article
            key={folderId}
            initial={{ opacity: 0, rotate: desktopRotate, left: style.left, top: style.top, scale: 0.9 }}
            animate={isStarted ? { opacity: 1, rotate: desktopRotate, left: style.left, top: style.top, scale: 1 } : { opacity: 0, rotate: desktopRotate, left: style.left, top: style.top, scale: 0.9 }}
            transition={getCardTransition(isMobile, index)}
            whileTap={{ scale: 0.98 }}
            className={`experience-folder ${isOpen ? "is-open" : ""}`}
            style={style}
            data-interactive="true"
            tabIndex={0}
            onFocus={() => onFocusPoint(finalX, desktopY)}
            onClick={() => toggleFolder(folderId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFolder(folderId);
              }
            }}
          >
            <div className="experience-folder__back">
              <div className="experience-folder__tab"></div>
            </div>
            <div className="experience-folder__papers">
              <div className="experience-folder__paper experience-folder__paper--3"></div>
              <div className="experience-folder__paper experience-folder__paper--2"></div>
              <div className="experience-folder__paper experience-folder__paper--main">
                <p className="experience-folder__summary">{item.summary}</p>
              </div>
            </div>
            <div className="experience-folder__front">
              <div>
                <span className="experience-folder__company">{item.company}</span>
                <span className="experience-folder__role">{item.role}</span>
              </div>
              <span className="experience-folder__period">{item.period}</span>
            </div>
          </motion.article>
        );
      })}
    </>
  );
});

export default ExperienceStack;
