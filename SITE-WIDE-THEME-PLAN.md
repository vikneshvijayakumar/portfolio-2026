# Site-Wide Theme And Indexability Plan

## Goal

Bring every public page into the landing page’s visual system, replace the route-specific stylesheets with one shared stylesheet, make display copy title case rather than all caps, and give each public route its own search-engine metadata.

## Scope

- Public routes: `/`, `/v2`, `/pocket-stylist`, `/output-builder`, `/clinical-documentation`, and `/form-taking`.
- Shared layouts, Astro page shells, React case-study content, and existing assets.
- The internal `_index-old.astro` source file will remain excluded from the public route set unless it is intentionally promoted.

## Implementation Plan

1. Establish The Reference Theme
   - Identify the canonical landing route and capture its typography, color tokens, spacing, navigation, motion, and responsive behavior.
   - Audit every page and component for styles that currently override that visual direction.

2. Consolidate Styling
   - Create one shared stylesheet with site-wide tokens, reset rules, layout primitives, navigation, buttons, case-study patterns, and responsive rules.
   - Move route-specific styles into scoped component rules only when the content genuinely requires a unique treatment.
   - Retire duplicate global, landing, and case-study stylesheet imports after the unified stylesheet is active.

3. Align Every Route
   - Update the primary homepage and each case-study route to use the shared shell, type scale, palette, navigation, footer, and interaction states.
   - Preserve project-specific imagery and content hierarchy while making the surrounding experience consistent.

4. Make Routes Individually Indexable
   - Add a unique page title, meta description, canonical URL, Open Graph metadata, and semantic page heading for each public route.
   - Ensure each public page is rendered as a dedicated Astro route and does not depend on a client-only shell for its SEO-critical content.

5. Normalize Display Copy
   - Remove all-caps presentation styles and all-uppercase display strings.
   - Apply title case to navigation labels, headings, buttons, section labels, and other display copy while leaving normal body prose readable.

6. Verify
   - Build the Astro project.
   - Inspect every public route at desktop and mobile widths.
   - Confirm unique metadata, canonical links, title-case display copy, and the absence of duplicate site-wide style imports.

## Definition Of Done

- One shared CSS entry point controls the site-wide theme.
- Every public route visibly belongs to the same design system as the landing page.
- Each public route contains unique, crawlable SEO metadata and an `h1`.
- No user-facing display copy is rendered in all caps; labels and headings use title case.
- The production build completes successfully and all routes render correctly on desktop and mobile.
