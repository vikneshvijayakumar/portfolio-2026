# Output Builder - Case Study
**By Viknesh Vijayakumar**

## Overview
**From Manual PDFs to a Visual Output System**
Output creation time dropped from days down to hours. This happened by completely eliminating manual workflows.

* **Type:** 0→1 System Redesign, Enterprise Workflow
* **Role:** Sole Product Designer
* **Timeline:** 4 months
* **Product:** Enterprise Case Management
* **Team:** Designer (me), Engineering, and Stakeholders

---

## 01 — Quick Overview
**Replacing manual PDFs with a scalable system**
Generating outputs is a crucial system feature, but the old process was slow, manual, and didn't scale.

* **The Problem:** Creating documents required manual data mapping, static PDFs, and heavy engineer support. This made it slow and prone to errors.
* **The Solution:** The answer was a dynamic, visual builder. Users now work directly with form data instead of confusing response codes.
* **The Impact:** Creation time shrank from days to hours. Non-technical users can now build and update outputs on their own.

---

## 02 — How it works now
**The legacy workflow**
Organizations need official documents for government and university submissions. To save time, users fill out a single unified form to generate multiple required outputs.

However, actually creating these outputs was an engineering nightmare. Developers had to build templates in external PDF tools. They manually mapped form answers using unique response codes. This was tedious and caused frequent mistakes.

Even a tiny change meant rebuilding the whole document. Hours of work easily turned into days. As organizations grew, this process became too slow, buggy, and expensive.

![Legacy Workflow](/assets/output-builder/web-legacy.webp)

---

## 03 — The Problem
**A manual system that couldn’t scale**

* **Slow setup:** Standard, recurring documents still took days of engineering time.
* **Engineer dependency:** Users couldn't make updates without a developer's help.
* **Frequent errors:** Manually placing answer codes led to inconsistencies and mistakes.
* **Painful updates:** Changing one field meant rebuilding and re-uploading the entire layout.
* **High costs:** Storing and processing static PDFs wasted infrastructure money.
* **No version history:** Changes lacked traceability or rollback options.

**Key Insight:** The real issue wasn't generating PDFs. It was the heavy reliance on static templates and manual mapping.

---

## 04 — Strategy
**Redefining the approach**
At first, the goal was to bring PDF creation in-house and drop external tools. But the real issue wasn't *where* PDFs were made, it was *how* they were made.

Manually mapping codes to static templates felt incredibly fragile. Fixing just the PDF tool would only put a band-aid on a broken system. Taking a step back, a different question came to mind:

> **What if we remove manual mapping and static PDFs completely?**

This shifted the entire focus. Instead of patching a workflow, the system itself needed a redesign.

![Goals](/assets/output-builder/design-goals.webp)
---

## 05 — The Solution
**From manual workflows to a visual system**
A process that used to take days of developer coordination is now fully self-serve. Users build outputs directly in the system without dealing with codes or PDF templates. The system hides the complexity in the background.

* **Smart defaults:** Users can start with predefined org layouts to save setup time. There is no need to rebuild standard structures.
![Smart Defaults](/assets/output-builder/smart-defaults.mp4)
* **Visual builder:** A drag-and-drop interface makes output creation easy for anyone. It is much faster and highly accessible for non-technical users.
![Visual Builder](/assets/output-builder/drag-and-drop.mp4)
* **Data, not codes:** Users select actual form questions instead of technical response codes. The system handles the mapping automatically. This cuts down on cognitive load and human error.
![Data, not codes](/assets/output-builder/work-with-data.mp4)
* **Easy customization:** Users get flexible styling options without feeling overwhelmed. The system stays simple.
![Easy Customization](/assets/output-builder/flexible-customization.mp4)
* **Dynamic templates:** The backend saves templates as JSON. They auto-fill with user answers upon submission. This removes the need to maintain static PDFs.
![Dynamic Templates](/assets/output-builder/generate-template.mp4)

**The New Workflow**
1. **Form Setup:** Create questionnaires without response codes.
2. **Visual Output Builder:** Drag and drop data to build the output.
3. **Iterate & Publish:** Update instantly and generate PDFs only when needed.

---

## 06 — Impact
**Removing the bottleneck**
A heavy engineering task became a fast, self-serve tool.

This massively improved customer onboarding. Since organizations need dozens of forms and outputs, cutting setup time meant faster launches. A major bottleneck turned into a highly scalable feature.

* **2 to 3 days → 1 to 3 hours:** Output creation dropped from 2-3 days to just 1-3 hours (a 90% reduction).
* **Engineer-driven → Self-serve:** Clients can now manage their own outputs without needing engineers.
* **Manual → Automated:** Removing manual work cut down on errors and system complexity.
* **Rebuild → Instant Update:** Edits no longer require full rebuilds in external tools.

---

## 07 — On the other hand
**Exploring a more radical idea**

> **What if the output was designed first, letting the system handle the rest?**

This output builder was actually part of a larger form ecosystem redesign. While solving the current problem, I explored whether the system itself could be simplified further by removing the need for forms and mapping altogether. 

Most of the form data already exists in user profiles. Making users fill out forms and *then* mapping them to outputs creates duplicate work. I explored simplifying this even further.

**What if?**
* Admins only define the final outputs.
* The system auto-fills known data.
* Users only provide the missing information.
* They review, sign, and submit.

**Why this could work:**
* No separate form setups.
* No mapping layer.
* Faster implementations with a less complex system.
* Less data entry for the end users.

This would require completely rewriting core system logic and rethinking edge cases. To stick to the project scope, an incremental approach took priority.

---

## 08 — Reflection
**Simplifying the system beats polishing the interface.**

This project changed how I view complex systems. The initial idea was just to make PDF creation easier. But the real win came from questioning the workflow itself.

Instead of optimizing individual steps, they were removed entirely. This made onboarding much faster for organizations with heavy document needs. More importantly, it gave non-technical users the power to safely customize their own outputs.

In the end, the biggest gains didn’t come from improving workflows, but from redefining them.
