import { useState, useRef, useEffect, memo } from "react";
import { motion } from "motion/react";

const MdH2 = ({ children }: { children: React.ReactNode }) => (
  <div className="markdown-card__line"><span className="md-h2">{children}</span></div>
);

const MdItem = ({ label, desc }: { label: string; desc: string }) => (
  <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">{label}</span>: {desc}</div>
);

const SkillsCard = memo(function SkillsCard({ 
  isMobile,
  isStarted = false 
}: { 
  isMobile: boolean;
  isStarted?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(0);

  const style = {
    left: 1760,
    top: 1500,
  };

  const tabs = [
    {
      id: "systems",
      label: "systems-craft.md",
      version: "1.0.0-Finalv5",
      content: (
        <>
          <div className="markdown-card__line"><span className="md-h2">SYSTEMS_AND_CRAFT_RULES</span></div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Architecture</span>: Always utilize Design Thinking and Information Architecture (IA) as the foundation.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Scalability</span>: Reference and extend professional design systems.</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span><span className="md-italic">Standard Kits</span>: MUI, shadcn, UntitledUI.</div>
          <div className="markdown-card__line"><span className="md-bullet">- </span><span className="md-bold">Prototyping_Engine</span>: </div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Static/Interactive: Figma</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Motion/Interaction: Jitter</div>
          <div className="markdown-card__line"><span className="md-bold">Vibe Coding</span>: </div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Agentic IDE: Antigravity, Codex, Windsurf, Open Code</div>
          <div className="markdown-card__line">&nbsp;&nbsp;<span className="md-bullet">- </span>Chat Agents: Gemini, ChatGPT, Claude</div>
        </>
      )
    },
    {
      id: "specialization",
      label: "specialization.md",
      version: "1.0.0",
      content: (
        <>
          <MdH2>DOMAIN_SPECIALIZATION</MdH2>
          <MdItem label="Enterprise" desc="Optimized for SaaS complexity and high-density data visualization." />
          <MdItem label="AI_Integration" desc="Specialized in HITL (Human-in-the-Loop) design patterns." />
          <MdItem label="Verticals" desc="Healthcare UX, EdTech, and high-stakes Investor Demos." />
        </>
      )
    },
    {
      id: "leadership",
      label: "leadership-skills.md",
      version: "1.0.0",
      content: (
        <>
          <MdH2>DESIGN_LEADERSHIP_PROTOCOL</MdH2>
          <MdItem label="Collaboration" desc="Prioritize cross-functional alignment and stakeholder buy-in." />
          <MdItem label="Team Management" desc="Execute mentoring and design direction for teams (up to 7+)." />
          <div className="markdown-card__line"><span className="md-bold">Process</span>: Operate within Agile methodologies and maintain high-fidelity client communication.</div>
        </>
      )
    },
    {
      id: "accessibility",
      label: "accessibility.md",
      version: "1.0.0",
      content: (
        <>
          <MdH2>ACCESSIBILITY_VALIDATION</MdH2>
          <MdItem label="Compliance" desc="All outputs must strictly adhere to WCAG 2.2 standards." />
          <MdItem label="Evaluation" desc="Perform heuristic analysis on all UI components." />
          <MdItem label="UX_Copy" desc="Optimize for clarity via UX Writing and intuitive interaction design." />
        </>
      )
    }
  ];

  const currentTab = tabs[activeTab];
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const commonHeader = (
    <>
      <div className="markdown-card__line"><span className="md-comment"># PRODUCT_DESIGNER_SPEC: @viknesh.me</span></div>
      <div className="markdown-card__line"><span className="md-comment"># Version: {currentTab.version}</span></div>
      <div className="markdown-card__line"><span className="md-comment"># Capability Level: Senior / Founding Designer</span></div>
      <div className="markdown-card__line">&nbsp;</div>
    </>
  );

  return (
    <motion.section
      className={`markdown-card ${isMobile ? "is-mobile" : ""}`}
      style={style}
      data-interactive="true"
      initial={isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isStarted ? { opacity: 1, scale: 1 } : (isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 })}
      transition={isMobile ? { duration: 0 } : { duration: 0.3, ease: "easeOut", delay: 0.2 }}
    >
      <div className="markdown-card__header">
        <div className="markdown-card__controls">
          <div className="markdown-card__dot markdown-card__dot--red" />
          <div className="markdown-card__dot markdown-card__dot--yellow" />
          <div className="markdown-card__dot markdown-card__dot--green" />
        </div>
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            className={activeTab === idx ? "markdown-card__tab is-active" : "markdown-card__tab"}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div ref={viewportRef} className="markdown-card__viewport">
        <div className="markdown-card__gutter" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, index: number) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className="markdown-card__content">
          {commonHeader}
          {currentTab.content}
        </div>
      </div>
    </motion.section>
  );
});

export default SkillsCard;
