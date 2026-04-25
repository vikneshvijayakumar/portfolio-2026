export type ZoneId = "case-studies" | "about" | "how-i-work" | "experience" | "skills";

export type Zone = {
  id: ZoneId;
  label: string;
  desktopCenter: { x: number; y: number };
  mobileCenter?: { x: number; y: number };
  mobileEyebrow: string;
  mobileTitle: string;
  mobileBody: string;
  targetScale?: {
    desktop: number;
    mobile: number;
  };
};

export type Project = {
  title: string;
  year: string;
  company: string;
  status?: string;
  impact: string;
  summary: string;
  note: string;
  tone: string;
  image: string;
  desktopPosition: { x: number; y: number; rotation: number };
  type?: "case-study" | "concept";
};

export type WorkPrinciple = {
  index: string;
  title: string;
  copy: string;
  accent: string;
};

export const toolbarLinks = {
  email: "mailto:hello@viknesh.me",
  linkedin: "https://www.linkedin.com/in/vikneshvijayakumar/",
  dribbble: "https://dribbble.com/vikneshvijayakumar",
  inspiration: "https://viknesh.me",
  resume:
    "https://drive.google.com/file/d/16Iyt5Sfy_c8Jv3_tKE_pivnKhpe1QpYo/view?usp=sharing",
};

export const zones: Zone[] = [
  {
    id: "about",
    label: "About Me",
    desktopCenter: { x: 2030, y: 950 },
    mobileCenter: { x: 2030, y: 850 },
    mobileEyebrow: "About",
    mobileTitle: "I turn complex workflows and ambiguous ideas into simple, shipped products.",
    mobileBody:
      "10+ years building enterprise SaaS across healthcare, AI, and edtech, with a focus on systems that are used daily by internal teams where reliability matters as much as clarity.",
    targetScale: { desktop: 0.95, mobile: 0.72 }
  },
  {
    id: "case-studies",
    label: "Case Studies",
    desktopCenter: { x: 3200, y: 900 },
    mobileEyebrow: "Selected Work",
    mobileTitle: "Projects designed for complex, high-stakes workflows.",
    mobileBody:
      "A recruiter-friendly scan of the systems work: workflow redesign, modular outputs, guided form completion, and reporting surfaces that help teams act faster.",
    targetScale: { desktop: 0.85, mobile: 0.68 }
  },
  {
    id: "experience",
    label: "Experience",
    desktopCenter: { x: 1160, y: 900 },
    mobileCenter: { x: 1100, y: 780 },
    mobileEyebrow: "History",
    mobileTitle: "Over a decade across enterprise and startups",
    mobileBody:
      "A look into where I've worked and what I've done across healthtech, edtech, and B2B SaaS.",
    targetScale: { desktop: 0.90, mobile: 0.9 }
  },
  {
    id: "skills",
    label: "Skills",
    desktopCenter: { x: 2135, y: 1730 },
    mobileCenter: { x: 2105, y: 1530 },
    mobileEyebrow: "Capabilities",
    mobileTitle: "Specialized in enterprise complexity and design systems.",
    mobileBody: "A deep dive into the technical and leadership skills I bring to the table, from design systems to accessibility validation.",
    targetScale: { desktop: 1.2, mobile: 0.75 }
  },
  {
    id: "how-i-work",
    label: "How I Work",
    desktopCenter: { x: 1220, y: 1700 },
    mobileCenter: { x: 1100, y: 1500 },
    mobileEyebrow: "Process",
    mobileTitle: "A systems-minded design approach grounded in real constraints.",
    mobileBody:
      "The work starts with bottlenecks, moves alongside engineering, and stays accountable to edge cases, accessibility, and how the product is actually used in the wild.",
    targetScale: { desktop: 1.2, mobile: 1.2 }
  }
];

export const projects: Project[] = [
  {
    title: "Output Builder",
    year: "2024",
    company: "Empyra",
    impact: "90% faster creation time",
    summary:
      "Built a modular output system that cut creation time by 90% and enabled faster onboarding at scale.",
    note: "Modular logic",
    tone: "Paper frame / operational clarity",
    image: "output-builder.webp",
    desktopPosition: { x: 2860, y: 830, rotation: 4.4 },
  },
  {
    title: "Form Builder",
    year: "2025",
    company: "Empyra",
    status: "Coming Soon",
    impact: "Reduced engineering dependency",
    summary:
      "Rebuilt a legacy form builder so admins could create complex forms independently without leaning on engineering for every change.",
    note: "Legacy-to-React migration",
    tone: "Pinned note / setup workflow",
    image: "form-builder.webp",
    desktopPosition: { x: 3510, y: 940, rotation: -5.6 },
  },
  {
    title: "Form Taking",
    year: "2025",
    company: "Empyra",
    status: "Coming Soon",
    impact: "Improved completion quality",
    summary:
      "Designed a guided form interface that improved completion rates and data accuracy through simpler, unified workflows.",
    note: "Guided completion patterns",
    tone: "Folded paper / step-by-step flow",
    image: "form-taking.webp",
    desktopPosition: { x: 2800, y: 1430, rotation: -2.8 },
  },
  {
    title: "Dashboard",
    year: "2024",
    company: "Empyra",
    status: "Coming Soon",
    impact: "Actionable report decisions",
    summary:
      "Introduced a modular widget-based dashboard that turned complex report data into instant, actionable decisions.",
    note: "Signal over noise",
    tone: "Utility board / modular reporting",
    image: "dashboard.webp",
    desktopPosition: { x: 3460, y: 1610, rotation: 3.4 },
    type: "case-study",
  },
];

export const workPrinciples: WorkPrinciple[] = [
  {
    index: "01",
    title: "Start with the bottleneck",
    copy:
      "I audit current workflows first. Time lost, coordination gaps, and fragile handoffs reveal more than jumping straight into polished screens.",
    accent: "lime",
  },
  {
    index: "02",
    title: "Design with engineering, not around it",
    copy:
      "Constraints are part of the design material. I stay close to implementation realities so solutions land cleanly and scale after handoff.",
    accent: "blue",
  },
  {
    index: "03",
    title: "Build for real-world use",
    copy:
      "Enterprise interfaces need to survive exceptions, ambiguity, and repeated daily use. I design for those conditions from the start.",
    accent: "coral",
  },
  {
    index: "04",
    title: "Make accessibility part of the baseline",
    copy:
      "Accessible products are more resilient products. The same rigor that supports edge cases usually improves the primary path too.",
    accent: "violet",
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  summary: string;
  desktopPosition: { x: number; y: number; rotation: number };
  logoColor: string;
};

export const experience: Experience[] = [
  {
    role: "Product Designer",
    company: "Empyra",
    period: "Aug 2023 – Jan 2026",
    summary:
      "Led redesign of complex admin workflows across form setup, output setup, and form taking in a .NET-to-React migration.",
    desktopPosition: { x: 1010, y: 630, rotation: -12.5 },
    logoColor: "#e74c3c"
  },
  {
    role: "Freelance Product Designer",
    company: "Upwork · Top Rated",
    period: "Apr 2023 – Jul 2023",
    summary:
      "Delivered MVPs for AI and B2B startups globally while balancing production speed with product quality.",
    desktopPosition: { x: 510, y: 710, rotation: 9.6 },
    logoColor: "#14a800"
  },
  {
    role: "Founding / Lead Product Designer",
    company: "AmbientOne (formerly Auxo Labs)",
    period: "Mar 2015 – Jul 2023",
    summary:
      "Designed AI-powered healthcare products, led a seven-person design team, and built standards for shipping at scale.",
    desktopPosition: { x: 1060, y: 1030, rotation: 14.2 },
    logoColor: "#2980b9"
  },
  {
    role: "UI / Graphic Designer",
    company: "Spiceblue",
    period: "2014 – 2015",
    summary:
      "Designed a leave management workflow for Kissflow, a low-code workflow platform, improving usability for day-to-day administrative tasks.",
    desktopPosition: { x: 560, y: 1080, rotation: -7.4 },
    logoColor: "#53469B"
  },
];
