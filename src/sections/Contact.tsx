import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { contact, nav, person, services } from "../content";
import { ease, scrollToId } from "../lib/hooks";
import { Magnetic, Reveal, SplitText } from "../components/motion";
import { Icon, Logo, cx } from "../components/ui";

const needs = services.map(s => s.title);

function ContactForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sent" | "pending">("idle");
  const toggle = (n: string) => setPicked(p => (p.includes(n) ? p.filter(x => x !== n) : [...p, n]));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!contact.email) { setStatus("pending"); return; }
    const body = [`Name: ${f.get("name")}`, `Email: ${f.get("email")}`, picked.length ? `Interested in: ${picked.join(", ")}` : "", "", String(f.get("message") ?? "")].join("\n");
    location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`Project enquiry from ${f.get("name")}`)}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
  };

  const field = "w-full rounded-xl border border-[#fff]/12 bg-[#fff]/[0.06] px-4 py-3.5 text-[15px] text-[#fff] placeholder:text-[#fff]/40 outline-none transition focus:border-violet-300/60 focus:bg-[#fff]/[0.09] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-describedby="form-status">
      <fieldset>
        <legend className="mb-3 text-[13px] font-medium text-[#fff]/70">What do you need help with?</legend>
        <div className="flex flex-wrap gap-2">
          {needs.map(n => {
            const on = picked.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(n)}
                className={cx("rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all", on ? "border-transparent bg-[#fff] text-[#17151f]" : "border-[#fff]/15 text-[#fff]/80 hover:border-[#fff]/40")}
              >
                {on && <Icon name="check" className="-ml-0.5 mr-1 inline size-3.5" />}
                {n}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#fff]/70">
          Your name
          <input name="name" required autoComplete="name" className={field} placeholder="Full name" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#fff]/70">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@company.com" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#fff]/70">
        Tell me about the project
        <textarea name="message" required rows={4} className={cx(field, "resize-none")} placeholder="What are you building, and where do leads get stuck today?" />
      </label>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Magnetic type="submit" className="inline-flex items-center gap-2.5 rounded-full bg-[#fff] px-6 py-3.5 text-[15px] font-semibold text-[#17151f] transition-colors hover:bg-[#efeafd]">
          Send message <Icon name="arrowRight" />
        </Magnetic>
        <p id="form-status" role="status" className="text-[13px] text-[#fff]/60">
          <AnimatePresence mode="wait">
            {status === "sent" && <motion.span key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Your email app should open with the message ready to send.</motion.span>}
            {status === "pending" && <motion.span key="p" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Contact details are being finalised — please check back soon.</motion.span>}
          </AnimatePresence>
        </p>
      </div>
    </form>
  );
}

export function Contact() {
  const reduced = useReducedMotion();
  const mx = useSpring(useMotionValue(50), { stiffness: 80, damping: 20 });
  const my = useSpring(useMotionValue(30), { stiffness: 80, damping: 20 });
  const spot = useMotionTemplate`radial-gradient(600px circle at ${mx}% ${my}%, rgba(139,92,246,0.28), transparent 60%)`;
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="section pb-16">
      <div className="shell">
        <Reveal y={40}>
          <div onPointerMove={onMove} className="relative isolate overflow-hidden rounded-[32px] bg-[#14121c] dark:ring-1 dark:ring-[#fff]/10 px-6 py-14 text-[#fff] sm:px-10 md:px-14 md:py-20">
            <motion.div aria-hidden className="absolute inset-0 -z-10" style={{ background: spot }} />
            <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(15_111_184/0.35),transparent_65%)]" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
              <div className="flex flex-col">
                <p className="eyebrow flex items-center gap-3 !text-[#fff]/60">
                  <span className="font-semibold text-[#a78bfa]">11</span>
                  <span className="h-px w-8 bg-[#fff]/20" />
                  Contact
                </p>
                <h2 id="contact-title" className="mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-balance">
                  <SplitText text="Have a system to build," />{" "}
                  <SplitText text="automate, or scale?" delay={0.15} className="text-gradient-light" />
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#fff]/70">
                  Tell me where things stand today — the website, the funnel, the CRM or the ads — and I'll map out how to connect it all.
                </p>

                <div className="mt-10 flex flex-col gap-3">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="group inline-flex items-center gap-3 self-start rounded-full border border-[#fff]/15 px-5 py-3 text-[15px] font-medium transition-colors hover:border-[#fff]/40">
                      <Icon name="mail" className="size-[18px] text-[#a78bfa]" />
                      {contact.email}
                      <Icon name="arrowUpRight" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    <p className="inline-flex items-center gap-3 self-start rounded-full border border-dashed border-[#fff]/20 px-5 py-3 text-[14px] text-[#fff]/55">
                      <Icon name="mail" className="size-[18px]" /> Email address coming soon
                    </p>
                  )}
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="Social profiles">
                    {contact.socials.map(s => (
                      <li key={s.label}>
                        {s.href ? (
                          <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#fff]/[0.07] px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#fff]/15">
                            {s.label} <Icon name="arrowUpRight" className="size-3.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#fff]/15 px-4 py-2 text-[13px] text-[#fff]/45" title="Link coming soon">
                            {s.label} · soon
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-[#fff]/10 bg-[#fff]/[0.04] p-5 backdrop-blur sm:p-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="shell pb-10">
      <div className="hairline" />
      <div className="flex flex-col gap-6 pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-[13px] text-ink-3">{person.tagline} · © {new Date().getFullYear()} {person.name}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">
            {nav.map(n => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={e => { e.preventDefault(); scrollToId(n.id); }} className="hover:text-violet">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <motion.button
          type="button"
          onClick={() => scrollToId("top")}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.3, ease }}
          className="inline-flex items-center gap-2 self-start rounded-full border border-line-strong px-4 py-2 text-[13px] font-medium md:self-auto"
        >
          Back to top <Icon name="arrowDown" className="size-3.5 rotate-180" />
        </motion.button>
      </div>
    </footer>
  );
}
