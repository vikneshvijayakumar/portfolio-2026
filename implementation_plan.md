# FigJam-Style Portfolio Website — Viknesh Vijayakumar

## Mockup Analysis

Based on the user's attached mockup, the home canvas has:

### Layout (from mockup)
- **Top-left**: Logo (slashed lines icon) + "Viknesh Vijayakumar" + green dot "Open for Opportunities" | Right side: cursor icon + share button
- **Top-right area**: Status "Open for Opportunities" with animated dots
- **Upper-left area**: Stack of certification badges/images (tilted)
- **Center**: "About" card with avatar, name "Viknesh Vijayakumar", role "Senior Product Designer", bio text, copyright
- **Surrounding the center card**: 4 project cards scattered spatially with screenshots, description, and year
- **Bottom-center**: Social icons (Dribbble, LinkedIn, WhatsApp)
- **Bottom-left**: Additional project cards

### Canvas Sections (capability nav)
1. **Case Studies** — Main project showcases
2. **About Me** — Bio, experience, skills
3. **How I Work** — Process, methodology

### Content
- **Name**: Viknesh Vijayakumar
- **Role**: Senior Product Designer
- **Bio**: "10+ years building enterprise SaaS across healthcare, AI, and edtech. I specialize in simplifying systems with multi-step workflows and technical constraints into interfaces that feel intuitive, scalable, and reliable in real world use."
- **Email**: hello@viknesh.me
- **Social**: Dribbble, LinkedIn, WhatsApp

### Projects (from existing portfolio)
1. **Output Builder** — "Built a modular output system that cut creation time by 90% and enabled faster onboarding at scale." — Empyra 2024
2. **Form Builder** — Rebuilt legacy form builder enabling admins to create complex forms independently — Empyra (Coming Soon)
3. **Form Taking** — Designed guided form interface improving completion rates — Empyra (Coming Soon)
4. **Dashboard** — Modular widget-based dashboard for actionable decisions — Empyra (Coming Soon)

## Proposed Implementation

### [NEW] index.html
Single-page HTML with:
- FigJam-style top toolbar (logo, name, status, cursor icon, share)
- Infinite canvas container with absolute-positioned elements
- About card (center), project cards (scattered), social icons
- Section navigation for Case Studies / About Me / How I Work

### [NEW] styles.css
- Warm gray canvas background (`#F5F3F0`)
- White cards with subtle shadows
- Inter font family
- Smooth transform transitions for canvas panning
- Cursor/selection style matching FigJam
- Card hover micro-animations

### [NEW] script.js
- Canvas drag-to-pan functionality
- Section navigation with smooth camera transitions
- Live clock widget
- Preloader animation
- Status bar behavior

## Verification
- Open site in browser
- Test drag navigation
- Test section switching
- Verify visual match against mockup
