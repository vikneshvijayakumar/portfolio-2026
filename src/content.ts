export type ZoneId = "case-studies" | "about" | "dribbble" | "experience" | "skills";

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

type WorkPrinciple = {
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
    mobileCenter: { x: 2080, y: 850 },
    mobileEyebrow: "About",
    mobileTitle: "I turn complex workflows and ambiguous ideas into simple, shipped products.",
    mobileBody:
      "10+ years building enterprise SaaS across healthcare, AI, and edtech, with a focus on systems that are used daily by internal teams where reliability matters as much as clarity.",
    targetScale: { desktop: 0.95, mobile: 0.72 }
  },
  {
    id: "case-studies",
    label: "Case Studies",
    desktopCenter: { x: 3100, y: 900 },
    mobileCenter: { x: 3100, y: 900 },
    mobileEyebrow: "Selected Work",
    mobileTitle: "Projects designed for complex, high-stakes workflows.",
    mobileBody:
      "A recruiter-friendly scan of the systems work: workflow redesign, modular outputs, guided form completion, and reporting surfaces that help teams act faster.",
    targetScale: { desktop: 1.2, mobile: 0.68 }
  },
  {
    id: "dribbble",
    label: "Other Works",
    desktopCenter: { x: 2135, y: 1730 },
    mobileCenter: { x: 2000, y: 1730 },
    mobileEyebrow: "Other Works",
    mobileTitle: "A selection of other works like website, UI explorations and quick concepts",
    mobileBody:
      "A selection of other works like website, UI explorations and quick concepts posted on my Dribbble profile.",
    targetScale: { desktop: 1.1, mobile: 0.8 }
  },
  {
    id: "experience",
    label: "Experience",
    desktopCenter: { x: 1288, y: 896 },
    mobileCenter: { x: 1232, y: 776 },
    mobileEyebrow: "History",
    mobileTitle: "Over a decade across enterprise and startups",
    mobileBody:
      "A look into where I've worked and what I've done across healthtech, edtech, and B2B SaaS.",
    targetScale: { desktop: 1.0, mobile: 0.9 }
  },
  {
    id: "skills",
    label: "Skills",
    desktopCenter: { x: 1240, y: 1650 },
    mobileCenter: { x: 1000, y: 1500 },
    mobileEyebrow: "Capabilities",
    mobileTitle: "Specialized in enterprise complexity and design systems.",
    mobileBody: "A deep dive into the technical and leadership skills I bring to the table, from design systems to accessibility validation.",
    targetScale: { desktop: 1.2, mobile: 0.75 }
  }
];

export const projects: Project[] = [
  {
    title: "Cutting template creation from days → hours",
    year: "2025",
    company: "B2B",
    status: "Coming Soon",
    impact: "90% faster creation time",
    summary:
      "Built a JSON-based visual builder to replace a manual PDF mapping process that required an engineer every time. Template work that used to take days can now be done in a few hours.",
    note: "Modular logic",
    tone: "Operational clarity / Data mapping",
    image: "output-builder.webp",
    desktopPosition: { x: 2860, y: 830, rotation: 4.4 },
  },
  {
    title: "Getting an AI Fashion App Out of Its Own Way",
    year: "2025",
    company: "B2C",
    impact: "Faster first recommendation",
    summary:
      "Redesigned an AI fashion styling journey so users understand the value earlier, discover key wardrobe features faster, and trust how personalization shapes recommendations.",
    note: "",
    tone: "Personalization / Mobile UX",
    image: "pocket-stylist.webp",
    desktopPosition: { x: 3160, y: 520, rotation: -3.2 },
    type: "case-study",
  },
  {
    title: "turning a fragmented form taking flow into one cohesive experience",
    year: "2025",
    company: "B2B",
    status: "Coming Soon",
    impact: "Zero lost users",
    summary:
      "Redesigned a massive legacy enrollment ecosystem into a guided, mobile-first workflow. Eliminated user abandonment by natively embedding legacy components inside dynamic React containers.",
    note: "🔒 Password Protected",
    tone: "Mobile-first / Persistent navigation",
    image: "form-taking.webp",
    desktopPosition: { x: 2800, y: 1430, rotation: -2.8 },
  },
  {
    title: "Self-Serve Form Builder",
    year: "2026",
    company: "Empyra",
    status: "Coming Soon",
    impact: "Zero dev dependency",
    summary:
      "Architected a drag-and-drop authoring canvas for complex administrative forms. Empowered non-technical users to build conditional logic and map profile fields without engineering support.",
    note: "Canvas architecture",
    tone: "Structural control / Authoring",
    image: "form-builder.webp",
    desktopPosition: { x: 3510, y: 940, rotation: -5.6 },
  },
  {
    title: "Modular Analytics Dashboard",
    year: "2025",
    company: "Empyra",
    status: "Coming Soon",
    impact: "Instant actionable data",
    summary:
      "Designed a fully customizable, drag-and-drop widget architecture. Transformed dense, static compliance reports into personalized, high-level interfaces that drive business decisions.",
    note: "Widget architecture",
    tone: "Data visualization / Modularity",
    image: "dashboard.webp",
    desktopPosition: { x: 3460, y: 1610, rotation: 3.4 },
    type: "case-study",
  },
];

export const workPrinciples: WorkPrinciple[] = [
  {
    index: "01",
    title: "Focus on the workflow",
    copy:
      "A pretty interface cannot fix a bad process. I look at the whole user journey to remove friction before I start designing. The goal is to build around how people actually work.",
    accent: "lime",
  },
  {
    index: "02",
    title: "Design with engineering",
    copy:
      "My designs are not just eye candy. They must be technically feasible for both developers and the back end. Since I know HTML and CSS, I visualize how screens will actually be built. This makes collaboration much easier.",
    accent: "blue",
  },
  {
    index: "03",
    title: "Keep everything consistent",
    copy:
      "Consistency is key. I keep my designs consistent with each other. I avoid doing one thing here and making a conflicting design somewhere else. I also follow a 4px grid very strictly.",
    accent: "coral",
  },
  {
    index: "04",
    title: "Make accessibility part of the baseline",
    copy:
      "Accessible products are more resilient products. The same rigor that supports edge cases usually improves the primary path too.",
    accent: "violet",
  },
  {
    index: "05",
    title: "Accessibility is a baseline",
    copy:
      "Accessibility is never an afterthought. I build it into the design from the very beginning. When you solve problems for edge cases, you improve the experience for everyone.",
    accent: "yellow",
  },
];

type Experience = {
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
      "Led redesign of complex admin workflows during .NET-to-React migration. Managed two Figma design systems and ensured WCAG accessibilty across the product.",
    desktopPosition: { x: 1136, y: 632, rotation: -12.5 },
    logoColor: "#e74c3c"
  },
  {
    role: "Freelance Product Designer",
    company: "Upwork · Top Rated",
    period: "Apr 2023 – Jul 2023",
    summary:
      "Delivered MVPs for AI and B2B startups globally while balancing production speed with product quality.",
    desktopPosition: { x: 784, y: 712, rotation: 9.6 },
    logoColor: "#14a800"
  },
  {
    role: "Founding / Lead Product Designer",
    company: "AmbientOne (formerly Auxo Labs)",
    period: "Mar 2015 – Jul 2023",
    summary:
      "Designed AI-powered healthcare products, led a seven-person design team, and built standards for shipping at scale.",
    desktopPosition: { x: 1192, y: 1032, rotation: 14.2 },
    logoColor: "#2980b9"
  },
  {
    role: "UI / Graphic Designer",
    company: "Spiceblue",
    period: "2014 – 2015",
    summary:
      "Designed a leave management workflow for Kissflow, a low-code workflow platform, improving usability for day-to-day administrative tasks.",
    desktopPosition: { x: 832, y: 1080, rotation: -7.4 },
    logoColor: "#53469B"
  },
];
