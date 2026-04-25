import { memo } from "react";
import { motion } from "motion/react";
import { workPrinciples } from "../content";

const WorkCluster = memo(function WorkCluster({ 
  isMobile = false,
  isStarted = false,
}: { 
  isMobile?: boolean;
  isStarted?: boolean;
}) {
  const rotations = [-2, 3, 1, -4];

  return (
    <section className="work-cluster" data-interactive="true">
      {workPrinciples.map((item, index) => {
        const desktopRotate = rotations[index % 4];
        const desktopPos = {
          left: 910 + (index % 2) * 290,
          top: 1430 + Math.floor(index / 2) * 320,
        };

        const style = desktopPos;

        return (
          <motion.article
            key={item.index}
            initial={{ opacity: 0, scale: 0.9, rotate: desktopRotate, left: style.left, top: style.top }}
            animate={isStarted ? { opacity: 1, scale: 1, rotate: desktopRotate, left: style.left, top: style.top } : { opacity: 0, scale: 0.9, rotate: desktopRotate, left: style.left, top: style.top }}
            transition={{ 
              opacity: { duration: 0.3, delay: (isMobile ? 0.05 : 0.2) + index * (isMobile ? 0.02 : 0.05) },
              scale: { type: "spring", stiffness: 300, damping: 25, delay: (isMobile ? 0.05 : 0.2) + index * (isMobile ? 0.02 : 0.05) },
              rotate: { type: "spring", stiffness: 800, damping: 45 },
              left: { type: "spring", stiffness: 800, damping: 45 },
              top: { type: "spring", stiffness: 800, damping: 45 }
            }}
            whileHover={{ y: -8, rotate: 0, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={`principle-card principle-card--${item.accent}`}
            style={style}
          >
            <div className="principle-card__header">
              <span>{item.index}</span>
            </div>
            <div className="principle-card__body">
              <h2 className="principle-card__title">{item.title}</h2>
              <p>{item.copy}</p>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
});

export default WorkCluster;
