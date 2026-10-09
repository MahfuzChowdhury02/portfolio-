/* ==========================================================================
   Site content — the single source of truth.

   Rules for this file:
   - Only facts confirmed by Mahfuz go here. Never add clients, metrics,
     results, years of experience, certifications or tools he hasn't confirmed.
   - Anything marked `placeholder: true` (or listed in PLACEHOLDERS below)
     is a clean stand-in that must be replaced before launch.
   ========================================================================== */

export const person = {
  name: "Mahfuz Chowdhury",
  firstName: "Mahfuz",
  lastName: "Chowdhury",
  roles: ["Web Developer", "CRM & GHL Expert", "Paid Ads", "AI & Automation"],
  /** Short positioning line used in the hero and meta tags. */
  tagline: "Build. Automate. Grow.",
  statement:
    "I build websites, funnels, CRM systems, automation workflows and the marketing systems that tie them together — so every lead is captured, followed up and tracked from first click to booked call.",
  portrait: "/images/mahfuz-portrait.jpg",
  portraitAlt: "Portrait of Mahfuz Chowdhury in a dark suit and purple tie, standing in a bright office",
};

/* ---------------- contact (PLACEHOLDERS — replace before launch) ---------------- */

export type Social = { label: string; href: string };

export const contact = {
  /** PLACEHOLDER: replace with Mahfuz's real email address. */
  email: "",
  /** PLACEHOLDER: add real profile URLs. Empty hrefs render as "coming soon". */
  socials: [
    { label: "LinkedIn", href: "" },
    { label: "Facebook", href: "" },
    { label: "WhatsApp", href: "" },
  ] satisfies Social[],
};

/** Everything still waiting on real information — also listed in HANDOVER.md. */
export const PLACEHOLDERS = [
  "contact.email",
  "contact.socials[*].href",
  "projects (all four slots)",
  "workSamples (AI & automation, CRM, ads screenshots)",
] as const;

/* ---------------- navigation ---------------- */

export const nav = [
  { id: "about", label: "About" },
  { id: "expertise", label: "Expertise" },
  { id: "projects", label: "Projects" },
  { id: "automation", label: "AI & Automation" },
  { id: "contact", label: "Contact" },
] as const;

/* ---------------- about ---------------- */

export const focusAreas = [
  { id: "web", label: "Web development", line: "Fast, responsive websites and landing pages built to convert, not just to look good." },
  { id: "crm", label: "CRM implementation", line: "Pipelines, contact records and lead management set up so nothing slips through." },
  { id: "ghl", label: "GoHighLevel", line: "Sub-accounts, workflows, forms, calendars and automations built inside GHL." },
  { id: "ads", label: "Paid advertising", line: "Meta and Google campaigns with the tracking needed to see what actually works." },
  { id: "ai", label: "AI automation", line: "AI-assisted workflows that respond, qualify and route leads automatically." },
  { id: "funnels", label: "Funnel development", line: "Lead, sales and appointment funnels — from landing page to thank-you page." },
] as const;

/* ---------------- expertise ---------------- */

export type ServiceId = "web" | "crm" | "ads" | "ai" | "funnels";

export const services: { id: ServiceId; num: string; title: string; summary: string; items: string[] }[] = [
  {
    id: "web",
    num: "01",
    title: "Web Development",
    summary: "Modern, responsive sites and pages designed around a single goal: turning visitors into leads.",
    items: ["Modern responsive websites", "Landing pages", "Business websites", "Interactive UI", "Conversion-focused pages"],
  },
  {
    id: "crm",
    num: "02",
    title: "CRM & GoHighLevel",
    summary: "A CRM that runs the business — every lead captured, staged, followed up and booked.",
    items: ["CRM setup", "Pipeline management", "Lead management", "Workflow automation", "Forms", "Appointment systems", "CRM integrations"],
  },
  {
    id: "ads",
    num: "03",
    title: "Paid Ads",
    summary: "Meta and Google campaigns connected to proper tracking, so spend can be judged on real outcomes.",
    items: ["Meta Ads", "Google Ads", "Lead generation", "Campaign setup", "Tracking", "Conversion optimization"],
  },
  {
    id: "ai",
    num: "04",
    title: "AI & Automation",
    summary: "AI agents and automated workflows that take repetitive work off the team's plate.",
    items: ["AI-powered workflows", "AI agents", "Business automation", "CRM automation", "Lead automation", "Process automation"],
  },
  {
    id: "funnels",
    num: "05",
    title: "Funnels",
    summary: "Step-by-step funnels that guide a stranger to a booked appointment or a sale.",
    items: ["Lead generation funnels", "Landing pages", "Sales funnels", "Appointment funnels", "Thank-you pages", "Conversion optimization"],
  },
];

/* ---------------- AI & automation flow ---------------- */

export const automationFlow = [
  { id: "lead", label: "Lead", detail: "A new enquiry arrives from an ad, form, chat or call.", icon: "user" },
  { id: "crm", label: "CRM", detail: "The contact is created or updated, tagged by source and placed in the pipeline.", icon: "database" },
  { id: "ai", label: "AI", detail: "An AI step reads the enquiry, answers common questions and qualifies intent.", icon: "spark" },
  { id: "workflow", label: "Workflow", detail: "Rules decide what happens next — who owns the lead and which sequence starts.", icon: "branch" },
  { id: "followup", label: "Follow-up", detail: "SMS and email follow-ups go out on schedule until the lead replies.", icon: "message" },
  { id: "appointment", label: "Appointment", detail: "The lead books a time; confirmations and reminders are sent automatically.", icon: "calendar" },
  { id: "reporting", label: "Reporting", detail: "Every step is tracked, so the source of each booking is visible.", icon: "chart" },
] as const;

/* ---------------- CRM / GHL ---------------- */

export const crmCapabilities = [
  { id: "pipelines", label: "Pipelines" },
  { id: "workflows", label: "Workflows" },
  { id: "forms", label: "Forms" },
  { id: "appointments", label: "Appointments" },
  { id: "routing", label: "Lead routing" },
  { id: "followups", label: "Follow-ups" },
] as const;

/* ---------------- paid ads ---------------- */

export const adsCapabilities = ["Meta Ads", "Google Ads", "Campaign management", "Lead generation", "Tracking", "Reporting"] as const;

/* ---------------- funnel ---------------- */

export const funnelStages = [
  { id: "traffic", label: "Traffic", detail: "Meta and Google ads bring the right people in." },
  { id: "landing", label: "Landing Page", detail: "A focused page with one message and one action." },
  { id: "form", label: "Lead Form", detail: "A short form captures the details that matter." },
  { id: "crm", label: "CRM", detail: "The lead lands in the pipeline, tagged by source." },
  { id: "automation", label: "Automation", detail: "Instant replies and follow-ups start on their own." },
  { id: "appointment", label: "Appointment", detail: "The lead books a call straight from the calendar." },
  { id: "conversion", label: "Conversion", detail: "The booked call becomes a customer — and the source is known." },
] as const;

/* ---------------- projects (PLACEHOLDERS) ---------------- */

export type Project = {
  id: string;
  name: string;
  type: string;
  role: string;
  tools: string[];
  description: string;
  /** Paths under /public. Leave empty to show the placeholder frame. */
  screenshots: string[];
  /** Only verified results. Leave empty when none are provided. */
  results: string[];
  url?: string;
  placeholder: boolean;
  /** Visual accent for the placeholder art. */
  accent: "violet" | "sky" | "teal" | "amber";
};

export const projects: Project[] = [
  {
    id: "website",
    name: "Website project",
    type: "Web Development",
    role: "Role to be confirmed",
    tools: ["To be confirmed"],
    description: "Placeholder slot for a website build. Screenshots, the live link and a short write-up go here once provided.",
    screenshots: [],
    results: [],
    placeholder: true,
    accent: "violet",
  },
  {
    id: "crm-build",
    name: "CRM / GoHighLevel build",
    type: "CRM & GoHighLevel",
    role: "Role to be confirmed",
    tools: ["To be confirmed"],
    description: "Placeholder slot for a GHL sub-account or CRM build — pipelines, workflows, forms and calendars.",
    screenshots: [],
    results: [],
    placeholder: true,
    accent: "sky",
  },
  {
    id: "funnel",
    name: "Funnel project",
    type: "Funnels",
    role: "Role to be confirmed",
    tools: ["To be confirmed"],
    description: "Placeholder slot for a lead, sales or appointment funnel, from landing page to thank-you page.",
    screenshots: [],
    results: [],
    placeholder: true,
    accent: "teal",
  },
  {
    id: "ads",
    name: "Paid ads campaign",
    type: "Paid Ads",
    role: "Role to be confirmed",
    tools: ["To be confirmed"],
    description: "Placeholder slot for a Meta or Google Ads campaign. Results will be shown only if verified figures are provided.",
    screenshots: [],
    results: [],
    placeholder: true,
    accent: "amber",
  },
];

/* ---------------- process ---------------- */

export const workProcess = [
  { id: "discover", label: "Discover", detail: "Understand the business, the offer, the audience and where leads are being lost today." },
  { id: "plan", label: "Plan", detail: "Map the whole system — pages, funnel steps, CRM stages, automations and tracking." },
  { id: "build", label: "Build", detail: "Build the website, funnel pages, forms and CRM setup." },
  { id: "integrate", label: "Integrate", detail: "Connect ads, forms, calendars and tools so data flows into one place." },
  { id: "automate", label: "Automate", detail: "Add follow-ups, reminders, lead routing and AI-assisted steps." },
  { id: "optimize", label: "Optimize", detail: "Watch the numbers, find the weak step and improve it." },
] as const;

/* ---------------- tech stack (confirmed by Mahfuz) ---------------- */

export type TechGroup = "web" | "marketing" | "ai";

export const techGroups: { id: TechGroup; label: string }[] = [
  { id: "web", label: "Web" },
  { id: "marketing", label: "CRM & Ads" },
  { id: "ai", label: "AI & Automation" },
];

export const tech: { name: string; mono: string; group: TechGroup; note: string }[] = [
  { name: "HTML", mono: "H", group: "web", note: "Semantic, accessible page structure" },
  { name: "CSS", mono: "C", group: "web", note: "Responsive layouts and motion" },
  { name: "JavaScript", mono: "JS", group: "web", note: "Interactivity and integrations" },
  { name: "React", mono: "R", group: "web", note: "Component-based interfaces" },
  { name: "TypeScript", mono: "TS", group: "web", note: "Typed, maintainable front-ends" },
  { name: "Tailwind CSS", mono: "TW", group: "web", note: "Fast, consistent styling" },
  { name: "GoHighLevel", mono: "GHL", group: "marketing", note: "CRM, funnels, workflows, calendars" },
  { name: "CRM", mono: "CRM", group: "marketing", note: "Pipelines and lead management" },
  { name: "Meta Ads", mono: "M", group: "marketing", note: "Facebook and Instagram campaigns" },
  { name: "Google Ads", mono: "G", group: "marketing", note: "Search and lead campaigns" },
  { name: "AI tools", mono: "AI", group: "ai", note: "AI-assisted workflows and agents" },
  { name: "Automation platforms", mono: "⚙", group: "ai", note: "Connecting apps and automating steps" },
];
