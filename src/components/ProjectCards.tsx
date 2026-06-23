import { memo, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { projects, type Project } from "../content";
import dashboardImg from "../assets/dashboard.webp";
import formBuilderImg from "../assets/form-builder.webp";
import formTakingImg from "../assets/form-taking.webp";
import outputBuilderImg from "../assets/output-builder.webp";
import pocketStylistImg from "../assets/pocket-stylist.webp";
import topArrowSvg from "../assets/top-right-arrow.svg?raw";
import { getCardTransition } from "../utils/constants";

const projectImages: Record<string, string> = {
  "dashboard.webp": dashboardImg,
  "form-builder.webp": formBuilderImg,
  "form-taking.webp": formTakingImg,
  "output-builder.webp": outputBuilderImg,
  "pocket-stylist.webp": pocketStylistImg,
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
  const caseStudyId =
    project.image === "output-builder.webp" ||
    project.title === "Enterprise Output Architecture" ||
    project.title === "Eliminating PDF Bottlenecks with a Visual Builder" ||
    project.title === "Cutting template creation from days → hours"
      ? "output-builder"
      : project.image === "form-taking.webp" || project.title === "Hybrid .NET/React Form Bridge"
        ? "form-taking"
        : project.image === "pocket-stylist.webp" || project.title === "PocketStylist AI Redesign"
          ? "aistylist"
          : null;
  const isClickable = caseStudyId !== null;

  const handleClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!isClickable || !caseStudyId) return;
    const el = e?.currentTarget as HTMLElement | undefined;
    const rect = el?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;
    onOpen(caseStudyId, origin);
  };

  const prefetchCaseStudy = () => {
    if (!isClickable) return;
    if (caseStudyId === "output-builder") {
      import("../pages/Obv3");
    } else if (caseStudyId === "form-taking") {
      import("../pages/FormTaking");
    } else if (caseStudyId === "aistylist") {
      import("../pages/PocketStylist");
    }
  };

  const formattedSummary = project.summary.split(/(\d+%)/).map((part, idx) =>
    part.match(/\d+%/) ? <span key={idx} className="is-highlight">{part}</span> : part
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={isStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={getCardTransition(isMobile, index)}
      whileHover={{ x: 4 }}
      className={`project-card ${isClickable ? "is-clickable" : "is-disabled"}`}
      data-interactive="true"
      tabIndex={0}
      onFocus={() => prefetchCaseStudy()}
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
        <div className="project-card__image-wrapper">
          <img
            src={projectImages[project.image]}
            alt={project.title}
            className={`project-card__image ${project.note?.includes("Password") ? "is-locked" : ""}`}
            draggable="false"
            loading="lazy"
            decoding="async"
          />
          {project.note?.includes("Password") && (
            <div className="project-card__lock-overlay">
              <div className="project-card__lock-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="project-card__content">
        <div className="project-card__text-group">
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__summary">
            {formattedSummary}
          </p>
        </div>

        <div className="project-card__footer-meta">
          {isClickable ? (
            <div className="project-card__company is-link">
              <span className="semibold">{project.company}</span> · {project.year}
              {project.note?.includes("Password") ? ` · ${project.note}` : ""}
              <span className="project-card__metadata-arrow" dangerouslySetInnerHTML={{ __html: topArrowSvg }} />
            </div>
          ) : (
            <div className="project-card__company">
              <span className="semibold">{project.company}</span> · {project.year}
              {project.status ? ` · ${project.status}` : ""}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
});

const PROJECTS_LIST_X = 2850;
const PROJECTS_LIST_Y = 850;

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
    <motion.div
      className={`project-cards ${isMobile ? "is-mobile" : ""}`}
      style={{
        position: "absolute",
        left: isMobile ? 2800 : PROJECTS_LIST_X,
        top: isMobile ? 832 : PROJECTS_LIST_Y,
        width: isMobile ? 560 : 600,
      }}
      initial={{ opacity: 0 }}
      animate={isStarted ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="project-cards__title">CASE STUDIES</h2>
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
    </motion.div>
  );
});

export default ProjectCards;
