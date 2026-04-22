import { motion } from "motion/react";
import "./OutputBuilder.css";

type OutputBuilderProps = {
  onBack: () => void;
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
};

export function OutputBuilder({ onBack }: OutputBuilderProps) {
  return (
    <div className="ob-case-study">
      <button className="ob-back-btn" onClick={onBack} aria-label="Go back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Hero Section */}
      <header className="ob-hero">
        <div className="ob-container">
          <motion.span className="ob-hero__label" {...fadeInUp}>Case Study</motion.span>
          <motion.h1 {...fadeInUp} transition={{ delay: 0.1, duration: 0.6 }}>
            Output Builder
          </motion.h1>
          <motion.p className="ob-hero__subtitle" {...fadeInUp} transition={{ delay: 0.2, duration: 0.6 }}>
            From Manual PDFs to a Visual Output System. Reduced output creation time from days to hours by eliminating manual workflows.
          </motion.p>

          <motion.div className="ob-hero__meta" {...fadeInUp} transition={{ delay: 0.3, duration: 0.6 }}>
            <div className="ob-meta-item">
              <span className="ob-meta-item__label">Type</span>
              <span className="ob-meta-item__value">0→1 System Redesign, Enterprise Workflow</span>
            </div>
            <div className="ob-meta-item">
              <span className="ob-meta-item__label">Role</span>
              <span className="ob-meta-item__value">Sole Product Designer</span>
            </div>
            <div className="ob-meta-item">
              <span className="ob-meta-item__label">Timeline</span>
              <span className="ob-meta-item__value">4 months</span>
            </div>
            <div className="ob-meta-item">
              <span className="ob-meta-item__label">Product</span>
              <span className="ob-meta-item__value">Enterprise Case Management</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* 01 — Quick Overview */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>01 — Quick Overview</motion.span>
          <motion.h2 {...fadeInUp}>Replacing manual PDF workflow with a scalable, system-driven workflow</motion.h2>
          <motion.p className="ob-prose" {...fadeInUp}>
            Output creation was a critical part of the system, but it relied on slow, manual workflows that didn’t scale.
          </motion.p>

          <motion.div className="ob-bento" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="ob-card ob-card--third" variants={fadeInUp}>
              <h3>Problem - Manual process</h3>
              <p>Creating outputs required manual mapping, static PDF templates, and developer involvement, making the process slow and error-prone.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--third" variants={fadeInUp}>
              <h3>Solution - Dynamic builder</h3>
              <p>Replaced manual mapping with a visual system where users work directly with form data instead of response codes.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--third" variants={fadeInUp}>
              <h3>Impact - Days → hours</h3>
              <p>Reduced output creation time from days to hours and enabled non-technical users to create and update outputs independently.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 02 — How it works now */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>02 — How it works now</motion.span>
          <motion.h2 {...fadeInUp}>The legacy workflow</motion.h2>
          <motion.div className="ob-prose" {...fadeInUp}>
            <p>Organizations rely on structured forms to generate official outputs for government and university submissions, making output generation a critical part of their workflow.</p>
            <p>Instead of filling multiple forms with overlapping information, users provide data once through a unified form, which is used to generate multiple required outputs.</p>
            <p>But, creating these outputs was a manual, engineering-heavy process. Engineers created output templates in external PDF tools and mapped form responses using unique response codes, making the process time-consuming and prone to errors.</p>
            <p>Even small changes required rebuilding entire documents turning hours of work into days. As organizations scaled, this process became time-consuming, error-prone, and expensive.</p>
          </motion.div>

          <motion.div className="ob-media-placeholder" {...fadeInUp}>
            [Legacy Workflow Illustration /assets/output-builder/web-legacy.webp]
          </motion.div>
        </div>
      </section>

      {/* 03 — The Problem */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>03 — The Problem</motion.span>
          <motion.h2 {...fadeInUp}>A manual system that didn’t scale</motion.h2>
          
          <motion.div className="ob-bento" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>Manual setup process</h3>
              <p>Each new output consumed multiple engineering days even for standard, recurring document types.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>Dependent on engineers</h3>
              <p>No output could be created or updated without major rework and engineer involvement.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>Mapping errors and inconsistency</h3>
              <p>Manual answer code placement introduced frequent errors across different output versions.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>Full rebuild for small changes</h3>
              <p>Updating a single field required reconstructing the entire layout and upload again.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>Infrastructure overhead</h3>
              <p>Static PDF storage and processing created significant unnecessary infrastructure cost.</p>
            </motion.div>
            <motion.div className="ob-card ob-card--half" variants={fadeInUp}>
              <h3>No version control</h3>
              <p>Each change created a new static file with no traceable history or rollback capability.</p>
            </motion.div>
          </motion.div>

          <motion.div className="ob-insight" {...fadeInUp}>
            <strong>Key Insight</strong>
            <p>The problem wasn't PDF generation, it was the dependency on manual mapping and static output templates that made the entire system complex.</p>
          </motion.div>
        </div>
      </section>

      {/* 04 — Strategy */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>04 — Strategy</motion.span>
          <motion.h2 {...fadeInUp}>Redefining the approach</motion.h2>
          <motion.div className="ob-prose" {...fadeInUp}>
            <p>The initial goal was to bring PDF creation inside the system to reduce reliance on external tools. But as I dug deeper into the workflow, it became clear that the real problem wasn’t where PDFs were created. It was how they were created.</p>
            <p>Every output depended on manually mapping response codes to static PDF templates. It was slow, fragile, and difficult to scale. Improving this flow would only make a broken system slightly better. So instead of asking how we could make PDF creation easier, I stepped back and asked a different question:</p>
          </motion.div>

          <motion.div className="ob-quote" {...fadeInUp}>
            <p>What if we could eliminate manual mapping — and the need for static PDFs — altogether?</p>
          </motion.div>

          <motion.p className="ob-prose" {...fadeInUp}>
            This shifted the focus from improving a workflow to rethinking the system itself.
          </motion.p>

          <motion.div className="ob-media-placeholder" {...fadeInUp}>
            [Design Goals /assets/output-builder/design-goals.webp]
          </motion.div>
        </div>
      </section>

      {/* 05 — The Solution */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>05 — The Solution</motion.span>
          <motion.h2 {...fadeInUp}>From manual workflows to a visual system</motion.h2>
          <motion.p className="ob-prose" {...fadeInUp}>
            What once required days of coordination between tools and engineers is now a simple, self-serve process. Users can create outputs directly within the system without dealing with response codes or static templates. The system handles the complexity in the background, allowing users to focus only on what matters — the output itself.
          </motion.p>

          <div className="ob-feature-grid">
            <motion.div className="ob-feature-item" {...fadeInUp}>
              <div className="ob-feature-content">
                <h3>Faster setup with smart defaults</h3>
                <p>Start with a blank canvas or use predefined layouts with commonly used elements set by the org already in place.</p>
                <span className="ob-feature-item__help">How it helps: Reduces initial setup time. No need to rebuild standard structure for every output.</span>
              </div>
              <div className="ob-media-placeholder">[Video: Smart Defaults]</div>
            </motion.div>

            <motion.div className="ob-feature-item ob-feature-item--reverse" {...fadeInUp}>
              <div className="ob-media-placeholder">[Video: Drag and Drop]</div>
              <div className="ob-feature-content">
                <h3>Build outputs visually</h3>
                <p>A visual builder where users can drag and drop profile fields, form fields, and custom elements to create output layouts and customize them.</p>
                <span className="ob-feature-item__help">How it helps: Reduced time required to create outputs. Makes output creation easier for non-technical users.</span>
              </div>
            </motion.div>

            <motion.div className="ob-feature-item" {...fadeInUp}>
              <div className="ob-feature-content">
                <h3>Work with data, not codes</h3>
                <p>Users can directly select form questions and data fields, while the system handles mapping and structure in the background.</p>
                <span className="ob-feature-item__help">How it helps: Eliminates the need for engineers to manually map response codes. Reduces cognitive load, and human errors.</span>
              </div>
              <div className="ob-media-placeholder">[Video: Work with Data]</div>
            </motion.div>

            <motion.div className="ob-feature-item ob-feature-item--reverse" {...fadeInUp}>
              <div className="ob-media-placeholder">[Video: Flexible Customization]</div>
              <div className="ob-feature-content">
                <h3>Customizations simple yet flexible</h3>
                <p>Users can control how outputs are presented without dealing with complex layout systems.</p>
                <span className="ob-feature-item__help">How it helps: Provides flexibility without overwhelming users. Keeps the system simple and easy to use.</span>
              </div>
            </motion.div>

            <motion.div className="ob-feature-item" {...fadeInUp}>
              <div className="ob-feature-content">
                <h3>Generate dynamic templates</h3>
                <p>Outputs templates are created as JSON in the backend and automatically filled with user responses after submission.</p>
                <span className="ob-feature-item__help">How it helps: Eliminates the need for manual PDF creation and maintenance. Enables instant updates without recreating output templates.</span>
              </div>
              <div className="ob-media-placeholder">[Video: Generate Templates]</div>
            </motion.div>
          </div>

          <motion.h3 style={{ marginTop: 80, fontSize: 32, fontWeight: 700 }} {...fadeInUp}>The New Workflow</motion.h3>
          <motion.div className="ob-steps" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="ob-step-card" variants={fadeInUp}>
              <p><strong>Form Setup:</strong> Questionnaires are created, no more response codes.</p>
            </motion.div>
            <motion.div className="ob-step-card" variants={fadeInUp}>
              <p><strong>Visual Output Builder:</strong> Build outputs directly using form data without any manual mapping or response codes.</p>
            </motion.div>
            <motion.div className="ob-step-card" variants={fadeInUp}>
              <p><strong>Iterate & Publish:</strong> Make updates and publish changes instantly. PDFs generated only when needed.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 06 — Impact */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>06 — Impact</motion.span>
          <motion.h2 {...fadeInUp}>Turning a bottleneck into a fast, scalable workflow</motion.h2>
          <motion.p className="ob-prose" {...fadeInUp}>
            The new output builder transformed a slow, engineering-heavy process into a fast, self-serve workflow.
          </motion.p>
          <motion.p className="ob-prose" {...fadeInUp}>
            This had a direct impact on onboarding. With each organization requiring dozens of forms and multiple outputs, reducing setup time from days to hours enabled faster implementation and quicker transitions from pilot to production. What was once a bottleneck became a scalable capability.
          </motion.p>

          <div className="ob-impact-grid">
            <motion.div className="ob-metric-card" {...fadeInUp}>
              <span className="ob-metric-value">2-3 days → 1-3 hrs</span>
              <p className="ob-metric-label">Reduced output creation time by up to 90%, resulting in significantly faster implementation cycles.</p>
            </motion.div>
            <motion.div className="ob-bento">
              <motion.div className="ob-card ob-card--full" variants={fadeInUp}>
                <h3>Engineer-driven → Self-serve</h3>
                <p>Clients can create and manage outputs independently without relying on engineers.</p>
              </motion.div>
              <motion.div className="ob-card ob-card--full" variants={fadeInUp}>
                <h3>Manual → Automated</h3>
                <p>Eliminating manual mapping reduced human errors and system complexity.</p>
              </motion.div>
              <motion.div className="ob-card ob-card--full" variants={fadeInUp}>
                <h3>Rebuild → Instant Update</h3>
                <p>Changes no longer require recreating outputs in external tools.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 07 — On the other hand */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>07 — On the other hand</motion.span>
          <motion.h2 {...fadeInUp}>Exploring a more radical approach</motion.h2>
          
          <motion.div className="ob-quote" {...fadeInUp}>
            <p>What if we designed for the output first — and let the system handle the rest?</p>
          </motion.div>

          <motion.p className="ob-prose" {...fadeInUp}>
            While solving the current problem, I explored whether the system itself could be simplified further by removing the need for forms and mapping altogether. Most form data originated from existing profile fields. Outputs relied on the same data collected through forms. The system required creating forms and then mapping them again to outputs — introducing duplication and unnecessary setup effort.
          </motion.p>

          <div className="ob-dual-grid">
            <motion.div className="ob-dual-card" {...fadeInUp}>
              <h3>What if?</h3>
              <ul>
                <li>Admin defines only the outputs</li>
                <li>System auto-populates available data</li>
                <li>Users fill in only the missing data</li>
                <li>Review, sign and confirm before submission</li>
              </ul>
            </motion.div>
            <motion.div className="ob-dual-card" {...fadeInUp}>
              <h3>Why this could work?</h3>
              <ul>
                <li>No separate form setup</li>
                <li>No mapping layer</li>
                <li>Faster implementation</li>
                <li>Reduced system complexity</li>
                <li>Lesser information to fill for the users</li>
              </ul>
            </motion.div>
          </div>

          <motion.p className="ob-note" {...fadeInUp}>
            This required a fundamental change in the system which required rethinking existing edge cases and rewriting core system logic. As this was not within project’s scope, we prioritized an incremental approach.
          </motion.p>
        </div>
      </section>

      {/* 08 — Reflection */}
      <section className="ob-section">
        <div className="ob-container">
          <motion.span className="ob-section__eyebrow" {...fadeInUp}>08 — Reflection</motion.span>
          <motion.h2 {...fadeInUp}>In complex systems, simplifying the model has a greater impact than improving the interface.</motion.h2>
          
          <motion.div className="ob-prose" {...fadeInUp}>
            <p>This project reshaped how I approach complex systems. The initial direction focused on making PDF creation easier, but the real impact came from stepping back and questioning the workflow itself.</p>
            <p>By moving away from optimizing individual steps, the workflow became faster, scalable, and more reliable. We significantly improved onboarding speed with faster implementation for organizations with dozens of forms and multiple outputs. More importantly allowing controlled flexibility in customization brought non-technical org admins a step closer in creating their own outputs. What was once a bottleneck in implementation became a scalable capability.</p>
            <p>In the end, the biggest gains didn’t come from improving workflows, but from redefining them.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
