import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import "./OutputBuilder.css";

// Asset imports
import legacyWebp from "../assets/output-builder/web-legacy.webp";
import designGoalsWebp from "../assets/output-builder/design-goals.webp";
import smartDefaultsMp4 from "../assets/output-builder/smart-defaults.mp4";
import dragAndDropMp4 from "../assets/output-builder/drag-and-drop.mp4";
import workWithDataMp4 from "../assets/output-builder/work-with-data.mp4";
import flexibleCustomizationMp4 from "../assets/output-builder/flexible-customization.mp4";
import generateTemplateMp4 from "../assets/output-builder/generate-template.mp4";
import arrowSvg from "../assets/arrow.svg?raw";

interface OutputBuilderProps {
  onClose: () => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
};

const metricVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, type: "spring" as const, stiffness: 200, damping: 25 },
  }),
};

function InlineArrow({ className }: { className?: string }) {
  return (
    <span
      className={className ? `inline-arrow ${className}` : "inline-arrow"}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: arrowSvg }}
    />
  );
}

function MediaPlaceholder({ type, src, alt }: { type: "image" | "video"; src: string; alt: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (type === "video") {
    return (
      <motion.div
        ref={ref}
        className="media-container media-container--video"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <video autoPlay muted loop playsInline className="media-video">
          <source src={src} type="video/mp4" />
        </video>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="media-container media-container--image"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <img src={src} alt={alt} className="media-image" />
    </motion.div>
  );
}

export function OutputBuilder({ onClose }: OutputBuilderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      className="case-study-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky header with back button */}
      <header className="case-study-header">
        <button className="case-study-back" onClick={onClose} type="button">
          <InlineArrow className="back-arrow" />
          <span>Back to canvas</span>
        </button>
        <div className="case-study-meta">
          <span className="case-study-tag">Case Study</span>
          <span className="case-study-divider" />
          <span className="case-study-company">Empyra · 2024</span>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="case-study-content">
        {/* Hero Section */}
        <section className="cs-hero">
          <div className="cs-hero__inner">
            <motion.div
              className="cs-hero__label"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span>By Viknesh Vijayakumar</span>
            </motion.div>
            <motion.h1
              className="cs-hero__title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Output Builder
            </motion.h1>
            <motion.p
              className="cs-hero__subtitle"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <strong>From Manual PDFs to a Visual Output System</strong>
              <br />
              Reduced output creation time from days to hours by eliminating manual workflows.
            </motion.p>

            <motion.div
              className="cs-meta-strip"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="cs-meta-item">
                <span className="cs-meta-label">Type</span>
                <span className="cs-meta-value">0→1 System Redesign, Enterprise Workflow</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">Role</span>
                <span className="cs-meta-value">Sole Product Designer</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">Timeline</span>
                <span className="cs-meta-value">4 months</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">Product</span>
                <span className="cs-meta-value">Enterprise Case Management</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">Team</span>
                <span className="cs-meta-value">Designer (me) + Engineering + Stakeholders</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 01 — Quick Overview */}
        <Section01 />

        {/* 02 — How it works now */}
        <Section02 />

        {/* 03 — The Problem */}
        <Section03 />

        {/* 04 — Strategy */}
        <Section04 />

        {/* 05 — The Solution */}
        <Section05 />

        {/* 06 — Impact */}
        <Section06 />

        {/* 07 — On the other hand */}
        <Section07 />

        {/* 08 — Reflection */}
        <Section08 />

        {/* Footer */}
        <footer className="cs-footer">
          <button className="cs-footer-back" onClick={onClose} type="button">
            <InlineArrow className="back-arrow" />
            <span>Back to portfolio</span>
          </button>
        </footer>
      </main>
    </motion.div>
  );
}

function Section01() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section cs-section--overview"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">01</span>
        <h2 className="cs-section__title">Quick Overview</h2>
      </div>
      <p className="cs-section__lead">
        <strong>Replacing manual PDF workflow with a scalable, system-driven workflow</strong>
      </p>
      <p className="cs-section__body">
        Output creation was a critical part of the system, but it relied on slow, manual workflows that didn't scale.
      </p>

      <div className="cs-ps-grid">
        <div className="cs-ps-card cs-ps-card--problem">
          <span className="cs-ps-label">Problem</span>
          <p>
            <strong>Manual process:</strong> Creating outputs required manual mapping, static PDF templates, and developer
            involvement, making the process slow and error-prone.
          </p>
        </div>
        <div className="cs-ps-card cs-ps-card--solution">
          <span className="cs-ps-label">Solution</span>
          <p>
            <strong>Dynamic builder:</strong> Replaced manual mapping with a visual system where users work directly with
            form data instead of response codes.
          </p>
        </div>
        <div className="cs-ps-card cs-ps-card--impact">
          <span className="cs-ps-label">Impact</span>
          <p>
            <strong>Days → hours:</strong> Reduced output creation time from days to hours and enabled non-technical
            users to create and update outputs independently.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function Section02() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">02</span>
        <h2 className="cs-section__title">How it works now</h2>
      </div>
      <p className="cs-section__subtitle">The legacy workflow</p>

      <div className="cs-prose">
        <p>
          Organizations rely on structured forms to generate official outputs for government and university
          submissions, making output generation a critical part of their workflow.
        </p>
        <p>
          Instead of filling multiple forms with overlapping information, users provide data once through a unified
          form, which is used to generate multiple required outputs.
        </p>
        <p>
          But, creating these outputs was a manual, engineering-heavy process. Engineers created output templates in
          external PDF tools and mapped form responses using unique response codes, making the process time-consuming
          and prone to errors.
        </p>
        <p>
          Even small changes required rebuilding entire documents turning hours of work into days. As organizations
          scaled, this process became time-consuming, error-prone, and expensive.
        </p>
      </div>

      <MediaPlaceholder type="image" src={legacyWebp} alt="Legacy workflow interface" />
    </motion.section>
  );
}

function Section03() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">03</span>
        <h2 className="cs-section__title">The Problem</h2>
      </div>
      <p className="cs-section__subtitle">A manual system that didn't scale</p>

      <ul className="cs-problem-list">
        <li>
          <strong>Manual setup process:</strong> Each new output consumed multiple engineering days even for standard,
          recurring document types.
        </li>
        <li>
          <strong>Dependent on engineers:</strong> No output could be created or updated without major rework and
          engineer involvement.
        </li>
        <li>
          <strong>Mapping errors and inconsistency:</strong> Manual answer code placement introduced frequent errors
          across different output versions.
        </li>
        <li>
          <strong>Full rebuild for small changes:</strong> Updating a single field required reconstructing the entire
          layout and upload again.
        </li>
        <li>
          <strong>Infrastructure overhead:</strong> Static PDF storage and processing created significant unnecessary
          infrastructure cost.
        </li>
        <li>
          <strong>No version control:</strong> Each change created a new static file with no traceable history or
          rollback capability.
        </li>
      </ul>

      <blockquote className="cs-blockquote">
        <span className="cs-blockquote__label">Key Insight</span>
        <p>
          The problem wasn't PDF generation, it was the dependency on manual mapping and static output templates that
          made the entire system complex.
        </p>
      </blockquote>
    </motion.section>
  );
}

function Section04() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">04</span>
        <h2 className="cs-section__title">Strategy</h2>
      </div>
      <p className="cs-section__subtitle">Redefining the approach</p>

      <div className="cs-prose">
        <p>
          The initial goal was to bring PDF creation inside the system to reduce reliance on external tools. But as I
          dug deeper into the workflow, it became clear that the real problem wasn't where PDFs were created. It was
          how they were created.
        </p>
        <p>
          Every output depended on manually mapping response codes to static PDF templates. It was slow, fragile, and
          difficult to scale. Improving this flow would only make a broken system slightly better. So instead of
          asking how we could make PDF creation easier, I stepped back and asked a different question:
        </p>
      </div>

      <blockquote className="cs-blockquote cs-blockquote--highlight">
        <p>What if we could eliminate manual mapping — and the need for static PDFs — altogether?</p>
      </blockquote>

      <div className="cs-prose">
        <p>This shifted the focus from improving a workflow to rethinking the system itself.</p>
      </div>

      <MediaPlaceholder type="image" src={designGoalsWebp} alt="Design goals visualization" />
    </motion.section>
  );
}

function Section05() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section cs-section--solution"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">05</span>
        <h2 className="cs-section__title">The Solution</h2>
      </div>
      <p className="cs-section__subtitle">From manual workflows to a visual system</p>

      <div className="cs-prose">
        <p>
          What once required days of coordination between tools and engineers is now a simple, self-serve process.
          Users can create outputs directly within the system without dealing with response codes or static templates.
          The system handles the complexity in the background, allowing users to focus only on what matters — the output
          itself.
        </p>
      </div>

      <div className="cs-features">
        <div className="cs-feature">
          <div className="cs-feature__content">
            <h3>Faster setup with smart defaults</h3>
            <p>
              Start with a blank canvas or use predefined layouts with commonly used elements set by the org already in
              place.
            </p>
            <span className="cs-feature__tag">How it helps</span>
            <p className="cs-feature__help">
              Reduces initial setup time. No need to rebuild standard structure for every output.
            </p>
          </div>
          <MediaPlaceholder type="video" src={smartDefaultsMp4} alt="Smart defaults demonstration" />
        </div>

        <div className="cs-feature cs-feature--reverse">
          <div className="cs-feature__content">
            <h3>Build outputs visually</h3>
            <p>
              A visual builder where users can drag and drop profile fields, form fields, and custom elements to
              create output layouts and customize them.
            </p>
            <span className="cs-feature__tag">How it helps</span>
            <p className="cs-feature__help">
              Reduced time required to create outputs. Makes output creation easier for non-technical users.
            </p>
          </div>
          <MediaPlaceholder type="video" src={dragAndDropMp4} alt="Drag and drop builder demonstration" />
        </div>

        <div className="cs-feature">
          <div className="cs-feature__content">
            <h3>Work with data, not codes</h3>
            <p>
              Users can directly select form questions and data fields, while the system handles mapping and structure in
              the background.
            </p>
            <span className="cs-feature__tag">How it helps</span>
            <p className="cs-feature__help">
              Eliminates the need for engineers to manually map response codes. Reduces cognitive load, and human errors.
            </p>
          </div>
          <MediaPlaceholder type="video" src={workWithDataMp4} alt="Work with data demonstration" />
        </div>

        <div className="cs-feature cs-feature--reverse">
          <div className="cs-feature__content">
            <h3>Customizations simple yet flexible</h3>
            <p>Users can control how outputs are presented without dealing with complex layout systems.</p>
            <span className="cs-feature__tag">How it helps</span>
            <p className="cs-feature__help">
              Provides flexibility without overwhelming users. Keeps the system simple and easy to use.
            </p>
          </div>
          <MediaPlaceholder type="video" src={flexibleCustomizationMp4} alt="Flexible customization demonstration" />
        </div>

        <div className="cs-feature">
          <div className="cs-feature__content">
            <h3>Generate dynamic templates</h3>
            <p>
              Outputs templates are created as JSON in the backend and automatically filled with user responses after
              submission.
            </p>
            <span className="cs-feature__tag">How it helps</span>
            <p className="cs-feature__help">
              Eliminates the need for manual PDF creation and maintenance. Enables instant updates without recreating
              output templates.
            </p>
          </div>
          <MediaPlaceholder type="video" src={generateTemplateMp4} alt="Generate template demonstration" />
        </div>
      </div>

      <div className="cs-workflow">
        <h3>The New Workflow</h3>
        <ol className="cs-workflow-list">
          <li>
            <span className="cs-workflow-step">1</span>
            <div>
              <strong>Form Setup:</strong> Questionnaires are created, no more response codes.
            </div>
          </li>
          <li>
            <span className="cs-workflow-step">2</span>
            <div>
              <strong>Visual Output Builder:</strong> Build outputs directly using form data without any manual mapping
              or response codes.
            </div>
          </li>
          <li>
            <span className="cs-workflow-step">3</span>
            <div>
              <strong>Iterate & Publish:</strong> Make updates and publish changes instantly. PDFs generated only when
              needed.
            </div>
          </li>
        </ol>
      </div>
    </motion.section>
  );
}

function Section06() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section cs-section--impact"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">06</span>
        <h2 className="cs-section__title">Impact</h2>
      </div>
      <p className="cs-section__subtitle">Turning a bottleneck into a fast, scalable workflow</p>

      <div className="cs-prose">
        <p>
          The new output builder transformed a slow, engineering-heavy process into a fast, self-serve workflow.
        </p>
        <p>
          This had a direct impact on onboarding. With each organization requiring dozens of forms and multiple outputs,
          reducing setup time from days to hours enabled faster implementation and quicker transitions from pilot to
          production. What was once a bottleneck became a scalable capability.
        </p>
      </div>

      <div className="cs-metrics">
        <motion.div
          className="cs-metric cs-metric--primary"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={0}
          variants={metricVariants}
        >
          <span className="cs-metric__value">
            2–3 days <span className="cs-metric__arrow">→</span> 1–3 hours
          </span>
          <span className="cs-metric__label">
            Reduced output creation time by up to 90%, resulting in significantly faster implementation cycles.
          </span>
        </motion.div>

        <motion.div
          className="cs-metric"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={1}
          variants={metricVariants}
        >
          <span className="cs-metric__title">Engineer-driven → Self-serve</span>
          <span className="cs-metric__desc">
            Clients can create and manage outputs independently without relying on engineers.
          </span>
        </motion.div>

        <motion.div
          className="cs-metric"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={2}
          variants={metricVariants}
        >
          <span className="cs-metric__title">Manual → Automated</span>
          <span className="cs-metric__desc">
            Eliminating manual mapping reduced human errors and system complexity.
          </span>
        </motion.div>

        <motion.div
          className="cs-metric"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={3}
          variants={metricVariants}
        >
          <span className="cs-metric__title">Rebuild → Instant Update</span>
          <span className="cs-metric__desc">Changes no longer require recreating outputs in external tools.</span>
        </motion.div>
      </div>
    </motion.section>
  );
}

function Section07() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section cs-section--alt"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">07</span>
        <h2 className="cs-section__title">On the other hand</h2>
      </div>
      <p className="cs-section__subtitle">Exploring a more radical approach</p>

      <blockquote className="cs-blockquote cs-blockquote--highlight">
        <p>What if we designed for the output first — and let the system handle the rest?</p>
      </blockquote>

      <div className="cs-prose">
        <p>
          While solving the current problem, I explored whether the system itself could be simplified further by
          removing the need for forms and mapping altogether. Most form data originated from existing profile fields.
          Outputs relied on the same data collected through forms. The system required creating forms and then mapping
          them again to outputs — introducing duplication and unnecessary setup effort.
        </p>
      </div>

      <div className="cs-whatif">
        <h3>What if?</h3>
        <ul className="cs-whatif-list">
          <li>Admin defines only the outputs</li>
          <li>System auto-populates available data</li>
          <li>Users fill in only the missing data</li>
          <li>Review, sign and confirm before submission</li>
        </ul>
      </div>

      <div className="cs-whywork">
        <h3>Why this could work?</h3>
        <ul className="cs-whywork-list">
          <li>No separate form setup</li>
          <li>No mapping layer</li>
          <li>Faster implementation</li>
          <li>Reduced system complexity</li>
          <li>Lesser information to fill for the users</li>
        </ul>
      </div>

      <div className="cs-note">
        <p>
          This required a fundamental change in the system which required rethinking existing edge cases and rewriting
          core system logic. As this was not within project's scope, we prioritized an incremental approach.
        </p>
      </div>
    </motion.section>
  );
}

function Section08() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="cs-section cs-section--reflection"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      <div className="cs-section__header">
        <span className="cs-section__number">08</span>
        <h2 className="cs-section__title">Reflection</h2>
      </div>

      <blockquote className="cs-blockquote cs-blockquote--final">
        <span className="cs-blockquote__label">Key Takeaway</span>
        <p>
          In complex systems, simplifying the model has a greater impact than improving the interface.
        </p>
      </blockquote>

      <div className="cs-prose">
        <p>
          This project reshaped how I approach complex systems. The initial direction focused on making PDF creation
          easier, but the real impact came from stepping back and questioning the workflow itself.
        </p>
        <p>
          By moving away from optimizing individual steps, the workflow became faster, scalable, and more reliable. We
          significantly improved onboarding speed with faster implementation for organizations with dozens of forms and
          multiple outputs. More importantly allowing controlled flexibility in customization brought non-technical org
          admins a step closer in creating their own outputs. What was once a bottleneck in implementation became a
          scalable capability.
        </p>
        <p>
          <strong>In the end, the biggest gains didn't come from improving workflows, but from redefining them.</strong>
        </p>
      </div>
    </motion.section>
  );
}
