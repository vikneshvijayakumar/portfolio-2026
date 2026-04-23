# Output Builder - Case Study
**By Viknesh Vijayakumar**

## Overview
**From Manual PDFs to a Visual Output System**
Reduced output creation time from days to hours by eliminating manual workflows.

* **Type:** 0→1 System Redesign, Enterprise Workflow
* **Role:** Sole Product Designer
* **Timeline:** 4 months
* **Product:** Enterprise Case Management
* **Team:** Designer (me) + Engineering + Stakeholders

---

## 01 — Quick Overview
**Replacing manual PDF workflow with a scalable, system-driven workflow**
Output creation was a critical part of the system, but it relied on slow, manual workflows that didn’t scale.

* **Problem - Manual process:** Creating outputs required manual mapping, static PDF templates, and developer involvement, making the process slow and error-prone.
* **Solution - Dynamic builder:** Replaced manual mapping with a visual system where users work directly with form data instead of response codes.
* **Impact - Days → hours:** Reduced output creation time from days to hours and enabled non-technical users to create and update outputs independently.

---

## 02 — How it works now
**The legacy workflow**
Organizations rely on structured forms to generate official outputs for government and university submissions, making output generation a critical part of their workflow.

Instead of filling multiple forms with overlapping information, users provide data once through a unified form, which is used to generate multiple required outputs. 

But, creating these outputs was a manual, engineering-heavy process. Engineers created output templates in external PDF tools and mapped form responses using unique response codes, making the process time-consuming and prone to errors.

Even small changes required rebuilding entire documents turning hours of work into days. As organizations scaled, this process became time-consuming, error-prone, and expensive.

/assets/output-builder/web-legacy.webp

---

## 03 — The Problem
**A manual system that didn’t scale**

* **Manual setup process:** Each new output consumed multiple engineering days even for standard, recurring document types.
* **Dependent on engineers:** No output could be created or updated without major rework and engineer involvement.
* **Mapping errors and inconsistency:** Manual answer code placement introduced frequent errors across different output versions.
* **Full rebuild for small changes:** Updating a single field required reconstructing the entire layout and upload again.
* **Infrastructure overhead:** Static PDF storage and processing created significant unnecessary infrastructure cost.
* **No version control:** Each change created a new static file with no traceable history or rollback capability.

**Key Insight:** The problem wasn't PDF generation, it was the dependency on manual mapping and static output templates that made the entire system complex.

---

## 04 — Strategy
**Redefining the approach**
The initial goal was to bring PDF creation inside the system to reduce reliance on external tools. But as I dug deeper into the workflow, it became clear that the real problem wasn’t where PDFs were created. It was how they were created.

Every output depended on manually mapping response codes to static PDF templates. It was slow, fragile, and difficult to scale. Improving this flow would only make a broken system slightly better. So instead of asking how we could make PDF creation easier, I stepped back and asked a different question:

> **What if we could eliminate manual mapping — and the need for static PDFs — altogether?**

This shifted the focus from improving a workflow to rethinking the system itself.

/assets/output-builder/design-goals.webp

---

## 05 — The Solution
**From manual workflows to a visual system**
What once required days of coordination between tools and engineers is now a simple, self-serve process. Users can create outputs directly within the system without dealing with response codes or static templates. The system handles the complexity in the background, allowing users to focus only on what matters — the output itself.

* **Faster setup with smart defaults:** Start with a blank canvas or use predefined layouts with commonly used elements set by the org already in place.
    * *How it helps:* Reduces initial setup time. No need to rebuild standard structure for every output.
    /assets/output-builder/smart-defaults.mp4
* **Build outputs visually:** A visual builder where users can drag and drop profile fields, form fields, and custom elements to create output layouts and customize them.
    * *How it helps:* Reduced time required to create outputs. Makes output creation easier for non-technical users.
    /assets/output-builder/drag-and-drop.mp4
* **Work with data, not codes:** Users can directly select form questions and data fields, while the system handles mapping and structure in the background.
    * *How it helps:* Eliminates the need for engineers to manually map response codes. Reduces cognitive load, and human errors.
    /assets/output-builder/work-with-data.mp4
* **Customizations simple yet flexible:** Users can control how outputs are presented without dealing with complex layout systems.
    * *How it helps:* Provides flexibility without overwhelming users. Keeps the system simple and easy to use.
    /assets/output-builder/flexible-customization.mp4
* **Generate dynamic templates:** Outputs templates are created as JSON in the backend and automatically filled with user responses after submission.
    * *How it helps:* Eliminates the need for manual PDF creation and maintenance. Enables instant updates without recreating output templates.
    /assets/output-builder/generate-template.mp4

**The New Workflow**
1.  **Form Setup:** Questionnaires are created, no more response codes.
2.  **Visual Output Builder:** Build outputs directly using form data without any manual mapping or response codes.
3.  **Iterate & Publish:** Make updates and publish changes instantly. PDFs generated only when needed.

---

## 06 — Impact
**Turning a bottleneck into a fast, scalable workflow**
The new output builder transformed a slow, engineering-heavy process into a fast, self-serve workflow.

This had a direct impact on onboarding. With each organization requiring dozens of forms and multiple outputs, reducing setup time from days to hours enabled faster implementation and quicker transitions from pilot to production. What was once a bottleneck became a scalable capability.

* **2 to 3 days → 1 to 3 hours:** Reduced output creation time by up to 90%, resulting in significantly faster implementation cycles.
* **Engineer-driven → Self-serve:** Clients can create and manage outputs independently without relying on engineers.
* **Manual → Automated:** Eliminating manual mapping reduced human errors and system complexity.
* **Rebuild → Instant Update:** Changes no longer require recreating outputs in external tools.

---

## 07 — On the other hand
**Exploring a more radical approach**

> **What if we designed for the output first — and let the system handle the rest?**

While solving the current problem, I explored whether the system itself could be simplified further by removing the need for forms and mapping altogether. Most form data originated from existing profile fields. Outputs relied on the same data collected through forms. The system required creating forms and then mapping them again to outputs — introducing duplication and unnecessary setup effort.

**What if?**
* Admin defines only the outputs
* System auto-populates available data
* Users fill in only the missing data
* Review, sign and confirm before submission

**Why this could work?**
* No separate form setup
* No mapping layer
* Faster implementation
* Reduced system complexity
* Lesser information to fill for the users

This required a fundamental change in the system which required rethinking existing edge cases and rewriting core system logic. As this was not within project’s scope, we prioritized an incremental approach.

---

## 08 — Reflection
**In complex systems, simplifying the model has a greater impact than improving the interface.**

This project reshaped how I approach complex systems. The initial direction focused on making PDF creation easier, but the real impact came from stepping back and questioning the workflow itself. 

By moving away from optimizing individual steps, the workflow became faster, scalable, and more reliable. We significantly improved onboarding speed with faster implementation for organizations with dozens of forms and multiple outputs. More importantly allowing controlled flexibility in customization brought non-technical org admins a step closer in creating their own outputs. What was once a bottleneck in implementation became a scalable capability.

In the end, the biggest gains didn’t come from improving workflows, but from redefining them.
