import { type ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import arrowSvg from "../assets/arrow.svg?raw";
import designGoalsWebp from "../assets/output-builder/design-goals.webp";
import dragAndDropMp4 from "../assets/output-builder/drag-and-drop.mp4";
import flexibleCustomizationMp4 from "../assets/output-builder/flexible-customization.mp4";
import generateTemplateMp4 from "../assets/output-builder/generate-template.mp4";
import legacyWebp from "../assets/output-builder/web-legacy.webp";
import smartDefaultsMp4 from "../assets/output-builder/smart-defaults.mp4";
import workWithDataMp4 from "../assets/output-builder/work-with-data.mp4";
import "./OutputBuilderv3.css";

type OutputBuilderv3Props = {
  onBack: () => void;
};

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
};

type Feature = {
  title: string;
  description: string;
  help: string;
  mediaType: "video";
  mediaSrc: string;
  mediaAlt: string;
};

const overviewMeta = [
  "Type: 0→1 System Redesign, Enterprise Workflow",
  "Role: Sole Product Designer",
  "Timeline: 4 months",
  "Product: Enterprise Case Management",
  "Team: Designer (me) + Engineering + Stakeholders",
];

const quickOverview = [
  {
    title: "Problem - Manual process:",
    body: "Creating outputs required manual mapping, static PDF templates, and developer involvement, making the process slow and error-prone.",
  },
  {
    title: "Solution - Dynamic builder:",
    body: "Replaced manual mapping with a visual system where users work directly with form data instead of response codes.",
  },
  {
    title: "Impact - Days → hours:",
    body: "Reduced output creation time from days to hours and enabled non-technical users to create and update outputs independently.",
  },
];

const problemPoints = [
  "Manual setup process: Each new output consumed multiple engineering days even for standard, recurring document types.",
  "Dependent on engineers: No output could be created or updated without major rework and engineer involvement.",
  "Mapping errors and inconsistency: Manual answer code placement introduced frequent errors across different output versions.",
  "Full rebuild for small changes: Updating a single field required reconstructing the entire layout and upload again.",
  "Infrastructure overhead: Static PDF storage and processing created significant unnecessary infrastructure cost.",
  "No version control: Each change created a new static file with no traceable history or rollback capability.",
];

const solutionFeatures: Feature[] = [
  {
    title: "Faster setup with smart defaults:",
    description:
      "Start with a blank canvas or use predefined layouts with commonly used elements set by the org already in place.",
    help: "Reduces initial setup time. No need to rebuild standard structure for every output.",
    mediaType: "video",
    mediaSrc: smartDefaultsMp4,
    mediaAlt: "Smart defaults demo",
  },
  {
    title: "Build outputs visually:",
    description:
      "A visual builder where users can drag and drop profile fields, form fields, and custom elements to create output layouts and customize them.",
    help: "Reduced time required to create outputs. Makes output creation easier for non-technical users.",
    mediaType: "video",
    mediaSrc: dragAndDropMp4,
    mediaAlt: "Visual output builder demo",
  },
  {
    title: "Work with data, not codes:",
    description:
      "Users can directly select form questions and data fields, while the system handles mapping and structure in the background.",
    help: "Eliminates the need for engineers to manually map response codes. Reduces cognitive load, and human errors.",
    mediaType: "video",
    mediaSrc: workWithDataMp4,
    mediaAlt: "Work with data demo",
  },
  {
    title: "Customizations simple yet flexible:",
    description:
      "Users can control how outputs are presented without dealing with complex layout systems.",
    help: "Provides flexibility without overwhelming users. Keeps the system simple and easy to use.",
    mediaType: "video",
    mediaSrc: flexibleCustomizationMp4,
    mediaAlt: "Customization demo",
  },
  {
    title: "Generate dynamic templates:",
    description:
      "Outputs templates are created as JSON in the backend and automatically filled with user responses after submission.",
    help: "Eliminates the need for manual PDF creation and maintenance. Enables instant updates without recreating output templates.",
    mediaType: "video",
    mediaSrc: generateTemplateMp4,
    mediaAlt: "Generate dynamic templates demo",
  },
];

const workflowSteps = [
  "Form Setup: Questionnaires are created, no more response codes.",
  "Visual Output Builder: Build outputs directly using form data without any manual mapping or response codes.",
  "Iterate & Publish: Make updates and publish changes instantly. PDFs generated only when needed.",
];

const impactPoints = [
  "2 to 3 days → 1 to 3 hours: Reduced output creation time by up to 90%, resulting in significantly faster implementation cycles.",
  "Engineer-driven → Self-serve: Clients can create and manage outputs independently without relying on engineers.",
  "Manual → Automated: Eliminating manual mapping reduced human errors and system complexity.",
  "Rebuild → Instant Update: Changes no longer require recreating outputs in external tools.",
];

const whatIfPoints = [
  "Admin defines only the outputs",
  "System auto-populates available data",
  "Users fill in only the missing data",
  "Review, sign and confirm before submission",
];

const whyWorkPoints = [
  "No separate form setup",
  "No mapping layer",
  "Faster implementation",
  "Reduced system complexity",
  "Lesser information to fill for the users",
];

function InlineArrow() {
  return (
    <span
      className="ob3-back__icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: arrowSvg }}
    />
  );
}

function RevealSection({ children, className }: RevealSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-120px 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      animate={
        reduceMotion
          ? undefined
          : inView
            ? {
                opacity: 1,
                y: 0,
                transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] },
              }
            : undefined
      }
    >
      {children}
    </motion.section>
  );
}

function MediaPanel({
  type,
  src,
  alt,
}: {
  type: "image" | "video";
  src: string;
  alt: string;
}) {
  if (type === "video") {
    return (
      <div className="ob3-media">
        <video className="ob3-media__asset" autoPlay muted loop playsInline aria-label={alt}>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="ob3-media">
      <img className="ob3-media__asset" src={src} alt={alt} />
    </div>
  );
}

function SectionEyebrow({ title }: { title: string }) {
  return (
    <div className="ob3-section__heading">
      <h2>{title}</h2>
      <span className="ob3-section__accent" aria-hidden="true" />
    </div>
  );
}

export function OutputBuilderv3({ onBack }: OutputBuilderv3Props) {
  return (
    <div className="ob3-page">
      <div className="ob3-page__mesh" aria-hidden="true" />

      <button className="ob3-back" type="button" onClick={onBack} aria-label="Back to canvas">
        <InlineArrow />
      </button>

      <main className="ob3-shell">
        <RevealSection className="ob3-hero">
          <div className="ob3-hero__main">
            <p className="ob3-byline">By Viknesh Vijayakumar</p>
            <h1>Output Builder - Case Study</h1>
            <div className="ob3-hero__lede">
              <p className="ob3-kicker">From Manual PDFs to a Visual Output System</p>
              <p>
                Reduced output creation time from days to hours by eliminating manual workflows.
              </p>
            </div>
          </div>

          <div className="ob3-hero__rail">
            <div className="ob3-metric">
              <span className="ob3-metric__value">2 to 3 days → 1 to 3 hours</span>
              <span className="ob3-metric__label">
                Reduced output creation time by up to 90%, resulting in significantly faster implementation cycles.
              </span>
            </div>

            <ul className="ob3-meta">
              {overviewMeta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </RevealSection>

        <RevealSection className="ob3-section">
          <SectionEyebrow title="Overview" />
          <div className="ob3-overview">
            {quickOverview.map((item) => (
              <article key={item.title} className="ob3-overview__card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="ob3-section">
          <SectionEyebrow title="01 — Quick Overview" />
          <div className="ob3-prose">
            <p className="ob3-kicker">Replacing manual PDF workflow with a scalable, system-driven workflow</p>
            <p>
              Output creation was a critical part of the system, but it relied on slow, manual workflows that didn’t scale.
            </p>
          </div>
          <div className="ob3-overview">
            {quickOverview.map((item) => (
              <article key={`${item.title}-detail`} className="ob3-overview__card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="ob3-section ob3-section--media">
          <div className="ob3-copy">
            <SectionEyebrow title="02 — How it works now" />
            <div className="ob3-prose">
              <p className="ob3-kicker">The legacy workflow</p>
              <p>
                Organizations rely on structured forms to generate official outputs for government and university submissions, making output generation a critical part of their workflow.
              </p>
              <p>
                Instead of filling multiple forms with overlapping information, users provide data once through a unified form, which is used to generate multiple required outputs.
              </p>
              <p>
                But, creating these outputs was a manual, engineering-heavy process. Engineers created output templates in external PDF tools and mapped form responses using unique response codes, making the process time-consuming and prone to errors.
              </p>
              <p>
                Even small changes required rebuilding entire documents turning hours of work into days. As organizations scaled, this process became time-consuming, error-prone, and expensive.
              </p>
            </div>
          </div>
          <MediaPanel type="image" src={legacyWebp} alt="Legacy workflow" />
        </RevealSection>

        <RevealSection className="ob3-section">
          <SectionEyebrow title="03 — The Problem" />
          <div className="ob3-prose">
            <p className="ob3-kicker">A manual system that didn’t scale</p>
          </div>
          <div className="ob3-problem-grid">
            {problemPoints.map((item) => (
              <article key={item} className="ob3-problem-card">
                <p>{item}</p>
              </article>
            ))}
          </div>
          <blockquote className="ob3-quote ob3-quote--insight">
            <p>Key Insight: The problem wasn't PDF generation, it was the dependency on manual mapping and static output templates that made the entire system complex.</p>
          </blockquote>
        </RevealSection>

        <RevealSection className="ob3-section ob3-section--media">
          <div className="ob3-copy">
            <SectionEyebrow title="04 — Strategy" />
            <div className="ob3-prose">
              <p className="ob3-kicker">Redefining the approach</p>
              <p>
                The initial goal was to bring PDF creation inside the system to reduce reliance on external tools. But as I dug deeper into the workflow, it became clear that the real problem wasn’t where PDFs were created. It was how they were created.
              </p>
              <p>
                Every output depended on manually mapping response codes to static PDF templates. It was slow, fragile, and difficult to scale. Improving this flow would only make a broken system slightly better. So instead of asking how we could make PDF creation easier, I stepped back and asked a different question:
              </p>
            </div>
            <blockquote className="ob3-quote">
              <p>What if we could eliminate manual mapping — and the need for static PDFs — altogether?</p>
            </blockquote>
            <div className="ob3-prose">
              <p>This shifted the focus from improving a workflow to rethinking the system itself.</p>
            </div>
          </div>
          <MediaPanel type="image" src={designGoalsWebp} alt="Design goals" />
        </RevealSection>

        <RevealSection className="ob3-section">
          <SectionEyebrow title="05 — The Solution" />
          <div className="ob3-prose">
            <p className="ob3-kicker">From manual workflows to a visual system</p>
            <p>
              What once required days of coordination between tools and engineers is now a simple, self-serve process. Users can create outputs directly within the system without dealing with response codes or static templates. The system handles the complexity in the background, allowing users to focus only on what matters — the output itself.
            </p>
          </div>

          <div className="ob3-feature-stack">
            {solutionFeatures.map((feature, index) => (
              <article
                key={feature.title}
                className={`ob3-feature ${index % 2 === 1 ? "ob3-feature--reverse" : ""}`}
              >
                <div className="ob3-feature__copy">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <p className="ob3-feature__help">How it helps: {feature.help}</p>
                </div>
                <MediaPanel type={feature.mediaType} src={feature.mediaSrc} alt={feature.mediaAlt} />
              </article>
            ))}
          </div>

          <div className="ob3-workflow">
            <h3>The New Workflow</h3>
            <ol>
              {workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </RevealSection>

        <RevealSection className="ob3-section ob3-section--impact">
          <SectionEyebrow title="06 — Impact" />
          <div className="ob3-prose">
            <p className="ob3-kicker">Turning a bottleneck into a fast, scalable workflow</p>
            <p>
              The new output builder transformed a slow, engineering-heavy process into a fast, self-serve workflow.
            </p>
            <p>
              This had a direct impact on onboarding. With each organization requiring dozens of forms and multiple outputs, reducing setup time from days to hours enabled faster implementation and quicker transitions from pilot to production. What was once a bottleneck became a scalable capability.
            </p>
          </div>

          <div className="ob3-impact">
            <article className="ob3-impact__hero">
              <span>2 to 3 days</span>
              <span>1 to 3 hours</span>
            </article>
            <div className="ob3-impact__grid">
              {impactPoints.map((item) => (
                <article key={item} className="ob3-impact__card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className="ob3-section">
          <SectionEyebrow title="07 — On the other hand" />
          <div className="ob3-prose">
            <p className="ob3-kicker">Exploring a more radical approach</p>
          </div>

          <blockquote className="ob3-quote">
            <p>What if we designed for the output first — and let the system handle the rest?</p>
          </blockquote>

          <div className="ob3-prose">
            <p>
              While solving the current problem, I explored whether the system itself could be simplified further by removing the need for forms and mapping altogether. Most form data originated from existing profile fields. Outputs relied on the same data collected through forms. The system required creating forms and then mapping them again to outputs — introducing duplication and unnecessary setup effort.
            </p>
          </div>

          <div className="ob3-dual">
            <article className="ob3-dual__card">
              <h3>What if?</h3>
              <ul>
                {whatIfPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="ob3-dual__card">
              <h3>Why this could work?</h3>
              <ul>
                {whyWorkPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="ob3-note">
            <p>
              This required a fundamental change in the system which required rethinking existing edge cases and rewriting core system logic. As this was not within project’s scope, we prioritized an incremental approach.
            </p>
          </div>
        </RevealSection>

        <RevealSection className="ob3-section ob3-section--reflection">
          <SectionEyebrow title="08 — Reflection" />
          <blockquote className="ob3-quote ob3-quote--final">
            <p>In complex systems, simplifying the model has a greater impact than improving the interface.</p>
          </blockquote>
          <div className="ob3-prose">
            <p>
              This project reshaped how I approach complex systems. The initial direction focused on making PDF creation easier, but the real impact came from stepping back and questioning the workflow itself.
            </p>
            <p>
              By moving away from optimizing individual steps, the workflow became faster, scalable, and more reliable. We significantly improved onboarding speed with faster implementation for organizations with dozens of forms and multiple outputs. More importantly allowing controlled flexibility in customization brought non-technical org admins a step closer in creating their own outputs. What was once a bottleneck in implementation became a scalable capability.
            </p>
            <p>
              In the end, the biggest gains didn’t come from improving workflows, but from redefining them.
            </p>
          </div>
        </RevealSection>
      </main>
    </div>
  );
}
