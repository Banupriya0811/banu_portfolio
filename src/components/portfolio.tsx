import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp, Award, Briefcase, Code2, Database, Download, ExternalLink, GraduationCap,
  Mail, MapPin, Menu, Moon, Phone, Send, Server, Sun, Wrench, X, FolderGit2, Layout,
} from "lucide-react";
import { z } from "zod";
import resume from "@/assets/resume.pdf.asset.json";
import certImg from "@/assets/proj-cert.jpg";
import bugImg from "@/assets/proj-bug.jpg";
import solarImg from "@/assets/proj-solar.jpg";

function Github({ size = 24 }: { size?: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>);
}
function Linkedin({ size = 24 }: { size?: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>);
}

const EMAIL = "kpmbanupriya@gmail.com";
const GITHUB = "https://github.com/banupriya0811";
const LINKEDIN = "https://linkedin.com/in/banupriya-m-1337612b9";

const NAV = [
  ["about", "About"], ["skills", "Skills"], ["projects", "Projects"], ["experience", "Experience"],
  ["education", "Education"], ["certifications", "Certifications"], ["contact", "Contact"],
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} className="mb-12">
          <p className="font-mono text-sm text-primary">// {eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div {...fadeUp} whileHover={{ y: -4 }}
      className={`rounded-2xl border border-border bg-card/70 p-6 backdrop-blur transition-colors hover:border-primary/50 hover:glow ${className}`}>
      {children}
    </motion.div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">{children}</span>;
}

function BtnPrimary({ href, children, download }: { href: string; children: ReactNode; download?: string }) {
  return (
    <a href={href} download={download} target={download ? undefined : href.startsWith("#") ? undefined : "_blank"} rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] glow">
      {children}
    </a>
  );
}
function BtnGhost({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target={href.startsWith("#") ? undefined : "_blank"} rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
      {children}
    </a>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on(); window.addEventListener("scroll", on);
    const saved = localStorage.getItem("theme");
    if (saved === "light") { setDark(false); document.documentElement.classList.remove("dark"); }
    return () => window.removeEventListener("scroll", on);
  }, []);
  const toggle = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : ""}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#home" className="font-display text-lg font-bold"><span className="text-gradient">BM</span><span className="text-muted-foreground">.dev</span></a>
        <div className="hidden items-center gap-6 lg:flex">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="rounded-lg border border-border p-2 transition-colors hover:text-primary">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded-lg border border-border p-2 lg:hidden">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-b border-border bg-background/95 px-5 pb-4 backdrop-blur-xl lg:hidden">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{label}</a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-5 pt-36 pb-24 md:px-8 md:pt-44">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Open to full stack & frontend roles
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Hi, I'm <span className="text-gradient">Banupriya M</span>
          </h1>
          <p className="mt-4 font-display text-xl text-muted-foreground md:text-2xl">Full Stack Developer</p>
          <p className="mt-6 max-w-xl text-muted-foreground">
            I build responsive, database-driven web applications with React, Node.js, Express and Python —
            with a focus on clean code, thoughtful UI/UX and scalable REST APIs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BtnPrimary href={resume.url} download="Banupriya_M_Resume.pdf"><Download size={16} /> Download Resume</BtnPrimary>
            <BtnGhost href="#projects"><FolderGit2 size={16} /> View Projects</BtnGhost>
          </div>
          <div className="mt-8 flex items-center gap-4 text-muted-foreground">
            <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-primary"><Github /></a>
            <a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-primary"><Linkedin /></a>
            <a href={`mailto:${EMAIL}`} aria-label="Email" className="hover:text-primary"><Mail /></a>
            <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> Chennai, Tamil Nadu</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 animate-[spin_12s_linear_infinite] rounded-full bg-gradient-brand opacity-70 blur-md" />
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-border bg-card md:h-80 md:w-80">
              {/* Profile photo placeholder — replace with your photo */}
              <span className="font-display text-7xl font-bold text-gradient">BM</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" eyebrow="about me" title="Engineering with purpose">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <p className="leading-relaxed text-muted-foreground">
            I'm a results-driven Full Stack Developer with hands-on experience building responsive web applications using
            Node.js, Express.js, React, MySQL and Flask. I'm proficient in REST API development, MVC architecture and agile
            collaboration, and I've completed internships delivering production-ready features.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            I'm passionate about clean code, UI/UX design and scalable software solutions. My goal is an entry-level full stack
            or frontend developer role where I can contribute to an innovative product team.
          </p>
        </Card>
        <Card>
          <GraduationCap className="text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">B.Tech – Information Technology</h3>
          <p className="mt-1 text-sm text-muted-foreground">University College of Engineering, Tiruchirappalli</p>
          <p className="mt-3 font-mono text-sm">2022 – 2026 · CGPA 8.1</p>
        </Card>
      </div>
    </Section>
  );
}

const SKILLS = [
  { icon: Layout, title: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "React.js", "Figma"] },
  { icon: Server, title: "Backend", items: ["Node.js", "Express.js", "Python", "Flask", "FastAPI", "Java"] },
  { icon: Database, title: "Database", items: ["MySQL", "PostgreSQL", "SQLite", "SQL"] },
  { icon: Wrench, title: "Tools & Cloud", items: ["Git", "GitHub", "VS Code", "AWS Fundamentals", "Linux (Ubuntu)"] },
];

function Skills() {
  return (
    <Section id="skills" eyebrow="technical skills" title="My toolkit">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map(({ icon: Icon, title, items }) => (
          <Card key={title}>
            <div className="mb-4 inline-flex rounded-xl bg-gradient-brand p-3 text-primary-foreground"><Icon size={20} /></div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <div className="mt-4 flex flex-wrap gap-2">{items.map((s) => <Chip key={s}>{s}</Chip>)}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const PROJECTS = [
  { img: certImg, title: "AI-Powered Fake Certificate Detection using GAN",
    desc: "Full stack Flask app with secure Bcrypt authentication and REST APIs. A GAN generates synthetic forgeries to train a MobileNetV2 CNN that detects fake certificates with 90%+ accuracy.",
    tech: ["Python", "Flask", "SQLite", "GAN", "CNN", "REST API"] },
  { img: solarImg, title: "Solar PV Health Monitoring & Fault Classification",
    desc: "FastAPI + React app monitoring Solar PV performance. Trained Decision Tree, Random Forest and SVM models on 1.37M+ records to classify five operating conditions.",
    tech: ["FastAPI", "React.js", "Scikit-learn", "Pandas", "NumPy"] },
  { img: bugImg, title: "Bug Tracking & Release Management System", badge: "Planned",
    desc: "Admin, Developer and Tester dashboards for bug reporting, assignment and status tracking, with JWT auth, screenshot uploads, activity logs and release readiness checks.",
    tech: ["React.js", "Node.js", "Express.js", "PostgreSQL", "JWT"] },
];

function Projects() {
  return (
    <Section id="projects" eyebrow="projects" title="Selected work">
      <div className="grid gap-8 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <Card key={p.title} className="group flex flex-col overflow-hidden p-0">
            <div className="relative overflow-hidden">
              <img src={p.img} alt={`${p.title} screenshot`} loading="lazy" width={1280} height={768}
                className="aspect-[5/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {p.badge && <span className="absolute top-3 right-3 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground">{p.badge}</span>}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">{p.tech.map((t) => <Chip key={t}>{t}</Chip>)}</div>
              <div className="mt-6 flex gap-3">
                {/* Replace with each project's repo / demo URL */}
                <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"><Github size={16} /> Code</a>
                <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"><ExternalLink size={16} /> Live Demo</a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const JOBS = [
  { role: "Full Stack Developer Intern", co: "Aescion EDTECH Solutions", when: "Aug 2026 – Present",
    pts: ["Contribute to frontend and backend development for real-world web applications based on project requirements.",
      "Collaborate with the team on feature integration, debugging and testing to improve functionality and usability."] },
  { role: "Full Stack Web Development Intern", co: "Fantasy Solution · Remote", when: "Jun 2025 – Jul 2025",
    pts: ["Developed responsive full stack apps with HTML5, CSS3, JavaScript and Node.js, integrating REST APIs for real-time experiences.",
      "Worked in Agile sprints and code reviews to build modular, maintainable, cross-device features."] },
  { role: "Full Stack Web Development Intern", co: "8Queens Software Technologies Pvt. Ltd.", when: "Jan 2025 – Feb 2025",
    pts: ["Built responsive web apps and reusable UI components to accelerate development workflows.",
      "Used Git/GitHub for version control; performed debugging and module testing to improve stability."] },
];

function Experience() {
  return (
    <Section id="experience" eyebrow="experience" title="Where I've worked">
      <div className="relative space-y-8 border-l border-border pl-8">
        {JOBS.map((j) => (
          <motion.div key={j.co} {...fadeUp} className="relative">
            <span className="absolute -left-[41px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand">
              <Briefcase size={10} className="text-primary-foreground" />
            </span>
            <div className="rounded-2xl border border-border bg-card/70 p-6 transition-colors hover:border-primary/50">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{j.role}</h3>
                <span className="font-mono text-xs text-primary">{j.when}</span>
              </div>
              <p className="text-sm text-muted-foreground">{j.co}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {j.pts.map((p) => <li key={p} className="flex gap-2"><span className="text-primary">▹</span>{p}</li>)}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Education() {
  return (
    <Section id="education" eyebrow="education" title="Academic background">
      <Card className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="inline-flex w-fit rounded-2xl bg-gradient-brand p-4 text-primary-foreground"><GraduationCap size={32} /></div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold">B.Tech – Information Technology</h3>
          <p className="text-muted-foreground">University College of Engineering, Tiruchirappalli, Tamil Nadu</p>
          <p className="mt-3 text-sm text-muted-foreground">Coursework: Web Technologies, Full Stack Web Development, DBMS, Computer Networks, Operating Systems, Cloud Service Management, UI/UX Design</p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-mono text-sm text-primary">Dec 2022 – Jun 2026</p>
          <p className="mt-1 font-display text-2xl font-bold text-gradient">CGPA 8.1</p>
        </div>
      </Card>
    </Section>
  );
}

const CERTS = [
  { name: "Cloud Computing", by: "NPTEL (IIT Kharagpur)", detail: "IaaS, PaaS, SaaS, Virtualization, AWS Fundamentals, Cloud Security" },
  { name: "Full Stack Web Development", by: "NoviTech R&D Private Limited", detail: "HTML, CSS, JavaScript, Node.js, React, REST APIs, MySQL" },
  { name: "UI/UX Design", by: "Simplilearn", detail: "Completed" },
];

function Certifications() {
  return (
    <Section id="certifications" eyebrow="certifications" title="Continuous learning">
      <div className="grid gap-6 md:grid-cols-3">
        {CERTS.map((c) => (
          <Card key={c.name}>
            <Award className="text-accent" />
            <h3 className="mt-3 font-display text-lg font-semibold">{c.name}</h3>
            <p className="text-sm text-primary">{c.by}</p>
            <p className="mt-3 text-sm text-muted-foreground">{c.detail}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(1, "Please enter a message").max(1000),
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    const subject = encodeURIComponent(`Portfolio contact from ${r.data.name}`);
    const body = encodeURIComponent(`${r.data.message}\n\n— ${r.data.name} (${r.data.email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  const input = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary";
  const links = [
    { icon: Mail, label: EMAIL, href: `mailto:${EMAIL}` },
    { icon: Phone, label: "+91 81221 23979", href: "tel:+918122123979" },
    { icon: Linkedin, label: "banupriya-m", href: LINKEDIN },
    { icon: Github, label: "banupriya0811", href: GITHUB },
  ];
  return (
    <Section id="contact" eyebrow="contact" title="Let's build something together">
      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <motion.div {...fadeUp} className="space-y-4">
          <p className="text-muted-foreground">I'm currently open to full stack and frontend developer opportunities. Drop a message and I'll get back to you.</p>
          {links.map(({ icon: Icon, label, href }) => (
            <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
              className="flex items-center gap-4 rounded-xl border border-border bg-card/70 p-4 transition-colors hover:border-primary hover:text-primary">
              <Icon size={18} /> <span className="text-sm">{label}</span>
            </a>
          ))}
        </motion.div>
        <Card>
          <form onSubmit={submit} noValidate className="space-y-4">
            {(["name", "email"] as const).map((f) => (
              <div key={f}>
                <label htmlFor={f} className="mb-1.5 block text-sm font-medium capitalize">{f}</label>
                <input id={f} name={f} type={f === "email" ? "email" : "text"} maxLength={f === "name" ? 100 : 255} className={input} />
                {errors[f] && <p className="mt-1 text-xs text-destructive">{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium">Message</label>
              <textarea id="message" name="message" rows={5} maxLength={1000} className={input} />
              {errors["message"] && <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>}
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] glow">
              <Send size={16} /> Send Message
            </button>
            {sent && <p className="text-center text-sm text-primary">Opening your email app…</p>}
          </form>
        </Card>
      </div>
    </Section>
  );
}

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top"
      className="fixed right-6 bottom-6 z-50 rounded-full bg-gradient-brand p-3 text-primary-foreground transition-transform hover:scale-110 glow">
      <ArrowUp size={18} />
    </button>
  );
}

export function Portfolio() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero /><About /><Skills /><Projects /><Experience /><Education /><Certifications /><Contact />
      </main>
      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
        <Code2 size={16} className="mx-auto mb-2 text-primary" />
        © {new Date().getFullYear()} Banupriya M · Full Stack Developer
      </footer>
      <ScrollTop />
    </div>
  );
}
