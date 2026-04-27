import { memo } from "react";
import { motion } from "motion/react";
import { projects, type Project } from "../content";
import dashboardImg from "../assets/dashboard.webp";
import formBuilderImg from "../assets/form-builder.webp";
import formTakingImg from "../assets/form-taking.webp";
import outputBuilderImg from "../assets/output-builder.webp";
import topArrowSvg from "../assets/top-right-arrow.svg?raw";

const projectImages: Record<string, string> = {
  "dashboard.webp": dashboardImg,
  "form-builder.webp": formBuilderImg,
  "form-taking.webp": formTakingImg,
  "output-builder.webp": outputBuilderImg,
};

const ProjectCard = memo(function ProjectCard({
  project,
  index = 0,
  onOpen,
  onFocusPoint,
  isMobile = false,
  isStarted = false,
}: {
  project: Project;
  index?: number;
  onOpen: (id: string, origin?: { x: number; y: number }) => void;
  onFocusPoint: (worldX: number, worldY: number) => void;
  isMobile?: boolean;
  isStarted?: boolean;
}) {
  const isClickable = project.title === "Output Builder";
  const handleClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!isClickable) return;
    const el = e?.currentTarget as HTMLElement | undefined;
    const rect = el?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;
    if (project.title === "Output Builder") {
      onOpen("output-builder", origin);
    }
  };

  // Prefetch the case study chunk on hover/focus so click is instant.
  const prefetchCaseStudy = () => {
    if (!isClickable) return;
    import("../pages/Obv3");
  };

  const formattedSummary = project.summary.split(/(\d+%)/).map((part, idx) =>
    part.match(/\d+%/) ? <span key={idx} className="is-highlight">{part}</span> : part
  );

  return (
    <motion.article
      initial={{
        opacity: 0,
        scale: 0.9,
        rotate: project.desktopPosition.rotation,
        left: project.desktopPosition.x,
        top: project.desktopPosition.y
      }}
      animate={isStarted ? {
        opacity: 1,
        scale: 1,
        rotate: project.desktopPosition.rotation,
        left: project.desktopPosition.x,
        top: project.desktopPosition.y
      } : {
        opacity: 0,
        scale: 0.9,
        rotate: project.desktopPosition.rotation,
        left: project.desktopPosition.x,
        top: project.desktopPosition.y
      }}
      transition={{
        opacity: { duration: 0.3, delay: (isMobile ? 0.05 : 0.2) + index * (isMobile ? 0.02 : 0.05) },
        scale: { type: "spring", stiffness: 300, damping: 25, delay: (isMobile ? 0.05 : 0.2) + index * (isMobile ? 0.02 : 0.05) },
        left: { type: "spring", stiffness: 400, damping: 35 },
        top: { type: "spring", stiffness: 400, damping: 35 },
        rotate: { type: "spring", stiffness: 400, damping: 35 }
      }}
      whileHover={{ scale: 1.02, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      className={`project-card ${isClickable ? "is-clickable" : "is-disabled"}`}
      style={{
        left: project.desktopPosition.x,
        top: project.desktopPosition.y,
      }}
      data-interactive="true"
      tabIndex={0}
      onFocus={() => {
        onFocusPoint(project.desktopPosition.x, project.desktopPosition.y);
        prefetchCaseStudy();
      }}
      onPointerEnter={prefetchCaseStudy}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      <div className="project-card__visual">
        <img
          src={projectImages[project.image]}
          alt={project.title}
          className="project-card__image"
          width={512}
          height={288}
          draggable="false"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="project-card__content">
        <p className="project-card__summary">
          {formattedSummary}
        </p>

        <div className="project-card__footer-meta">
          {isClickable ? (
            <div className="project-card__company is-link">
              <span className="semibold">{project.company}</span> · {project.year}
              <span className="project-card__metadata-arrow" dangerouslySetInnerHTML={{ __html: topArrowSvg }} />
            </div>
          ) : (
            <div className="project-card__company">
              <span className="semibold">{project.company}</span> · {project.year} · {project.status}
              {project.status === "Coming Soon" && (
                <span className="project-card__coming-soon"></span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
});

const ProjectCards = memo(function ProjectCards({
  onOpenCaseStudy,
  onFocusPoint,
  isMobile = false,
  isStarted = false,
}: {
  onOpenCaseStudy: (id: string, origin?: { x: number; y: number }) => void;
  onFocusPoint: (worldX: number, worldY: number) => void;
  isMobile?: boolean;
  isStarted?: boolean;
}) {
  return (
    <>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.title}
          project={project}
          index={index}
          onOpen={onOpenCaseStudy}
          onFocusPoint={onFocusPoint}
          isMobile={isMobile}
          isStarted={isStarted}
        />
      ))}
    </>
  );
});

export default ProjectCards;
