# Mahfuz Chowdhury — Portfolio

Personal portfolio for **Mahfuz Chowdhury**: Web Developer · CRM & GoHighLevel Expert · Paid Ads · AI & Automation · Funnels.
**Build. Automate. Grow.**

A single-page, light-themed site with an interactive 3D hero (an iridescent system core with orbiting service nodes and four floating panels — Web, CRM/GHL, AI & Automation, Funnels — that lift on hover and link to their sections), scroll-driven diagrams (AI & automation flow, CRM workspace, funnel, process), a project showcase and a contact section.

## Tech

- [Vite](https://vite.dev) + React 19 + TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Framer Motion for UI animation, Lenis for smooth scrolling
- three.js + React Three Fiber for the hero scene (lazy-loaded in its own chunk)
- Self-hosted fonts via Fontsource: Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono

## Requirements

- Node.js **20.19+ or 22.12+** (see `.nvmrc`)
- npm 10+

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |

## Editing content

**All text and data live in [`src/content.ts`](src/content.ts).** Section components read from it, so most edits never touch component code.

| What | Where |
|---|---|
| Name, roles, statement, portrait | `person` |
| Email and social links | `contact` |
| Navigation | `nav` |
| Work experience | `experience` |
| Services (Expertise) | `services` |
| AI & automation flow steps | `automationFlow` |
| Funnel stages | `funnelStages` |
| Projects | `projects` |
| Work process | `workProcess` |
| Tech stack | `tech`, `techGroups` |

Images go in `public/images/` and are referenced as `/images/<file>`.

### Adding a real project

Edit an entry in `projects` (or add one):

```ts
{
  id: "brand-site",
  name: "Brand website",
  type: "Web Development",
  role: "Design & development",
  tools: ["React", "Tailwind CSS"],
  description: "One or two sentences about the project.",
  screenshots: ["/images/projects/brand-site-1.jpg", "/images/projects/brand-site-2.jpg"],
  results: [],            // only verified results
  url: "https://example.com",
  placeholder: false,     // hides the "coming soon" treatment
  accent: "violet",
}
```

Screenshots render inside a browser frame. The "Visit site" link appears when `url` is set, and the results list appears only when `results` has entries.

### Content rules

Only publish facts Mahfuz has confirmed. Do not add clients, metrics (ROAS, CPL, revenue, conversion rates), years of experience, certifications or tools that haven't been confirmed. The CRM, ads and automation mock-ups are labelled **"Illustrative example"** because they show capabilities, not client data.

## Before launch: placeholder checklist

These are clean placeholders waiting for real information:

- [ ] `contact.email`: while empty, the contact section shows "Email address coming soon" and the form explains that details are being finalised. Once set, the form opens the visitor's email app with the message pre-filled.
- [ ] `contact.socials[*].href`: empty links show as "soon".
- [ ] `projects`: all four slots are `placeholder: true`. Add real names, roles, tools, descriptions and screenshots.
- [ ] Work-sample screenshot slots in the AI & Automation, CRM and Paid Ads sections. Search the code for `ScreenshotSlot` to find each one and replace it with an `<img>`, or with the real screenshot inside a `BrowserFrame`.
- [ ] `index.html`: once the domain is known, add `<link rel="canonical">` and an absolute `og:url` and `og:image`.

## Project structure

```
public/
  favicon.svg
  images/                 # portrait and (later) project screenshots
  robots.txt
src/
  content.ts              # ← all site content
  App.tsx                 # page composition, smooth scroll
  index.css               # design tokens + shared component classes
  components/
    Header.tsx            # floating glass nav, mobile menu, scroll progress
    motion.tsx            # SplitText, Reveal, Magnetic, TiltCard…
    ui.tsx                # Icon, Logo, SectionHeading, BrowserFrame, placeholders
  lib/hooks.ts            # media queries, active section, scroll helpers
  sections/               # one file per section
    story/                # About, Expertise, Process, Tech helpers
    systems/              # AI & Automation flow + CRM workspace mocks (systems/crm/)
    showcase/             # Projects, Paid Ads and Funnel visuals
  three/HeroScene.tsx     # hero 3D scene (lazy-loaded)
  three/heroPanels.ts     # canvas-drawn hero panels
```

## Light and dark theme

A sun/moon toggle in the navbar switches themes. Light is the default; the choice is saved in `localStorage` (`mc-theme`) and applied before first paint by a small script in `index.html`. Dark mode redefines the colour tokens in `src/index.css` under `.dark`, so components styled with the tokens follow automatically; use Tailwind's `dark:` variant for anything with a hard-coded colour.

## Accessibility and motion

- Semantic landmarks, a skip link, keyboard-operable tabs, menus and dialogs, and visible focus rings.
- `prefers-reduced-motion` is respected: smooth scrolling is off, looping animations stop, and the 3D hero renders as a still frame. Browsers without WebGL get a CSS version of the hero composition.
- The 3D scene stops rendering when it is off-screen.

## Deploying

The build output is a static site in `dist/`.

- **Vercel**: import the repo. The framework preset is Vite, the build command is `npm run build`, and the output directory is `dist`. `vercel.json` is included.
- **Netlify**: build command `npm run build`, publish directory `dist`. `netlify.toml` is included.
- **Any static host** (Cloudflare Pages, GitHub Pages, cPanel…): run `npm run build` and upload the contents of `dist/`.

It is a single page with hash links, so no rewrite rules are needed.
