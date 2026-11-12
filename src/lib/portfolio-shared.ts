export interface ProjectItem {
  id: string;
  title: string;
  desc: string;
  img: string;
  badge?: string;
  category?: "Full Stack" | "AI / ML" | "Frontend" | "System";
  tech: string[];
  github: string;
  demo?: string;
}

export interface SkillCategory {
  title: string;
  iconName: "Layout" | "Server" | "Database" | "Wrench" | "Code2" | "Cpu";
  items: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  when: string;
  location?: string;
  pts: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  cgpa: string;
  coursework: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  by: string;
  detail: string;
  link?: string;
}

export interface PortfolioData {
  updatedAt?: number;
  profile: {
    name: string;
    role: string;
    availability: string;
    statusPill: string;
    achievementLine?: string;
    avatarUrl?: string;
    initials: string;
    shortBio: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    resumeUrl: string;
    logoTitle: string;
    logoSuffix?: string;
    voiceIntroBtnText?: string;
    voiceIntroScript?: string;
    voiceIntroAudioUrl?: string;
  };
  about: {
    leadParagraph: string;
    secondaryParagraph: string;
    highlights: Array<{ label: string; value: string }>;
  };
  skills: SkillCategory[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education: EducationItem;
  certifications: CertificationItem[];
  contact?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    formNote?: string;
    email?: string;
    phone?: string;
  };
  footer?: {
    brandText?: string;
    tagline?: string;
    copyrightText?: string;
  };
}

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  updatedAt: 0,
  profile: {
    name: "Banupriya M",
    role: "Full Stack Developer",
    availability: "Available for Opportunities",
    statusPill: "Available for Opportunities",
    achievementLine: "8.1 CGPA | 3 Internships",
    avatarUrl: "/profile.jpg",
    initials: "BP",
    shortBio:
      "Full Stack Developer building responsive, scalable web applications using React, Node.js and Python.",
    location: "Chennai, Tamil Nadu, India",
    email: "kpmbanupriya@gmail.com",
    phone: "+91 81221 23979",
    github: "https://github.com/banupriya0811",
    linkedin: "https://linkedin.com/in/banupriya-m-1337612b9",
    resumeUrl: "/Banupriya_Resume.pdf",
    logoTitle: "Banupriya M",
    logoSuffix: "",
    voiceIntroBtnText: "Quick Audio Intro",
    voiceIntroScript:
      "Hi, I'm Banupriya — a Full Stack Software Engineer. I specialize in building scalable web applications and robust REST APIs using React, Node.js, and Python. With hands-on experience across three engineering internships and production projects, I focus on clean architecture, responsive design, and performant systems. I am currently open to full-time engineering opportunities. Feel free to explore my projects or reach out directly to connect. Thank you!",
    voiceIntroAudioUrl: "",
  },
  about: {
    leadParagraph:
      "Aspiring Full Stack Developer pursuing B.Tech in Information Technology (CGPA 8.1) at University College of Engineering, Tiruchirappalli. Passionate about architecting responsive user interfaces, reliable server-side APIs, and intelligent AI-assisted tools.",
    secondaryParagraph:
      "Proven track record through 3 software engineering internships across Aescion EDTECH Solutions, Fantasy Solution, and 8Queens Software Technologies, turning technical challenges into practical software deliverables.",
    highlights: [
      { label: "Academic CGPA", value: "8.1 / 10" },
      { label: "Internships", value: "3 Completed" },
      { label: "Key Projects", value: "3 Deployed" },
      { label: "Focus Stack", value: "React / Node / Py" },
    ],
  },
  skills: [
    {
      title: "Frontend Engineering",
      iconName: "Layout",
      items: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "JavaScript (ES6+)", "Responsive Design", "UI/UX Principles"],
    },
    {
      title: "Backend & APIs",
      iconName: "Server",
      items: ["Node.js", "Express.js", "Python", "Flask", "FastAPI", "RESTful Architecture", "Java"],
    },
    {
      title: "Database Management",
      iconName: "Database",
      items: ["MySQL", "PostgreSQL", "SQLite", "Database Modeling", "SQL Query Optimization"],
    },
    {
      title: "DevOps & Tooling",
      iconName: "Wrench",
      items: ["Git & GitHub", "Linux (Ubuntu)", "VS Code", "Postman", "AWS Core Fundamentals", "Agile Workflow"],
    },
  ],
  projects: [
    {
      id: "fake-cert-detection",
      title: "AI-Powered Fake Certificate Detection using GAN",
      desc: "Full-stack authentication and verification platform with Flask and Bcrypt. Employs GANs to simulate authentic forgery signatures to train a MobileNetV2 CNN classifier achieving 90%+ detection accuracy.",
      img: "/proj-cert.jpg",
      badge: "AI + Full Stack",
      category: "AI / ML",
      tech: ["Python", "Flask", "SQLite", "MobileNetV2", "GAN", "REST API"],
      github: "https://github.com/banupriya0811",
      demo: "https://github.com/banupriya0811",
    },
    {
      id: "solar-pv-monitoring",
      title: "Solar PV Health Monitoring & Fault Classification",
      desc: "Real-time monitoring and anomaly diagnostic system built with FastAPI and React. Analyzed 1.37M+ telemetry data records using Random Forest, Decision Tree and SVM models to diagnose operating faults.",
      img: "/proj-solar.jpg",
      badge: "ML Analytics",
      category: "AI / ML",
      tech: ["FastAPI", "React.js", "Scikit-Learn", "Pandas", "NumPy", "TailwindCSS"],
      github: "https://github.com/banupriya0811",
      demo: "https://github.com/banupriya0811",
    },
    {
      id: "bug-tracking-system",
      title: "Bug Tracking & Release Management System",
      desc: "Enterprise workflow suite providing role-based dashboards for Admins, Developers, and QA Testers. Features issue tracking, attachment handling, audit logs, and release readiness checklists.",
      img: "/proj-bug.jpg",
      badge: "Featured System",
      category: "Full Stack",
      tech: ["React.js", "Node.js", "Express.js", "PostgreSQL", "JWT Authentication"],
      github: "https://github.com/banupriya0811",
      demo: "https://github.com/banupriya0811",
    },
  ],
  experience: [
    {
      id: "exp-aescion",
      role: "Full Stack Developer Intern",
      company: "Aescion EDTECH Solutions",
      when: "Aug 2026 – Present",
      location: "On-site",
      pts: [
        "Architect and implement full stack features across frontend user interfaces and backend API routes.",
        "Collaborate with senior developers on real-world requirements, modular refactoring, and automated testing.",
        "Optimize response latency and database operations for core educational modules.",
      ],
    },
    {
      id: "exp-fantasy",
      role: "Full Stack Web Development Intern",
      company: "Fantasy Solution",
      when: "Jun 2025 – Jul 2025",
      location: "Remote",
      pts: [
        "Developed responsive full-stack modules utilizing HTML5, CSS3, JavaScript and Node.js with REST API integration.",
        "Participated actively in agile sprints, peer code reviews, and UI component standardization.",
        "Ensured seamless cross-browser responsiveness and accessibility standards.",
      ],
    },
    {
      id: "exp-8queens",
      role: "Full Stack Web Development Intern",
      company: "8Queens Software Technologies Pvt. Ltd.",
      when: "Jan 2025 – Feb 2025",
      location: "On-site",
      pts: [
        "Crafted reusable UI components and client-side logic to accelerate internal release cycles.",
        "Managed repository version control using Git/GitHub, resolving merge conflicts and debugging staging issues.",
        "Conducted end-to-end manual and unit validation before production deployments.",
      ],
    },
  ],
  education: {
    degree: "B.Tech – Information Technology",
    institution: "University College of Engineering, Tiruchirappalli",
    period: "2022 – 2026",
    cgpa: "CGPA 8.1 / 10",
    coursework:
      "Web Technologies, Full Stack Web Development, Database Management Systems (DBMS), Computer Networks, Operating Systems, Cloud Service Management, Object Oriented Design, UI/UX Principles.",
  },
  certifications: [
    {
      id: "cert-cloud",
      name: "Cloud Computing Certification",
      by: "NPTEL (IIT Kharagpur)",
      detail: "In-depth coursework covering IaaS, PaaS, SaaS, Virtualization architectures, AWS core services, and Cloud Security.",
    },
    {
      id: "cert-fullstack",
      name: "Full Stack Web Development",
      by: "NoviTech R&D Private Limited",
      detail: "End-to-end development curriculum covering HTML5, CSS3, JavaScript, Node.js, Express, React and MySQL integration.",
    },
    {
      id: "cert-uiux",
      name: "UI/UX Design Professional Certificate",
      by: "Simplilearn",
      detail: "User journey mapping, wireframing, high-fidelity prototyping, design heuristics, and user experience evaluation.",
    },
  ],
  contact: {
    eyebrow: "get in touch",
    title: "Let's Connect",
    subtitle: "Available for full stack and frontend developer opportunities. Feel free to reach out directly.",
    formNote:
      "I am currently open to full-time roles, engineering internships, and technical collaborations. Whether you have questions about my projects or an open role, drop a note below.",
  },
  footer: {
    brandText: "Banupriya M",
    tagline: "Full Stack Developer building scalable, responsive web applications.",
    copyrightText: "© 2026 Banupriya M - Full Stack Developer - All rights reserved.",
  },
};

function repairProjectImage(img: string | undefined, id: string): string {
  if (!img || img.includes("/__l5e")) {
    const match = DEFAULT_PORTFOLIO_DATA.projects.find((p) => p.id === id);
    return match?.img || "/proj-cert.jpg";
  }
  // Remap Vite build-hashed asset URLs to stable public paths
  if (img.includes("proj-cert")) return "/proj-cert.jpg";
  if (img.includes("proj-solar")) return "/proj-solar.jpg";
  if (img.includes("proj-bug")) return "/proj-bug.jpg";
  return img;
}

export function normalizePortfolioData(raw: unknown): PortfolioData {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PORTFOLIO_DATA;
  }

  const parsed = raw as Partial<PortfolioData>;
  const profile = { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) };

  if (profile.logoTitle === "Banupriya" || !profile.logoTitle) {
    profile.logoTitle = "Banupriya M";
  }
  if (profile.logoSuffix) {
    profile.logoSuffix = "";
  }
  if (
    !profile.resumeUrl ||
    profile.resumeUrl.includes("/__l5e") ||
    profile.resumeUrl === "#" ||
    profile.resumeUrl.includes("Banupriya_resume.pdf") ||
    !profile.resumeUrl.toLowerCase().includes(".pdf")
  ) {
    profile.resumeUrl = "/Banupriya_Resume.pdf";
  }

  const projects = Array.isArray(parsed.projects)
    ? parsed.projects.map((p) => ({
        ...p,
        img: repairProjectImage(p.img, p.id),
      }))
    : DEFAULT_PORTFOLIO_DATA.projects;

  return {
    ...DEFAULT_PORTFOLIO_DATA,
    ...parsed,
    updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    profile,
    about: { ...DEFAULT_PORTFOLIO_DATA.about, ...(parsed.about || {}) },
    skills: Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_PORTFOLIO_DATA.skills,
    projects,
    experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_PORTFOLIO_DATA.experience,
    education: { ...DEFAULT_PORTFOLIO_DATA.education, ...(parsed.education || {}) },
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications
      : DEFAULT_PORTFOLIO_DATA.certifications,
    contact: { ...DEFAULT_PORTFOLIO_DATA.contact, ...(parsed.contact || {}) },
    footer: { ...DEFAULT_PORTFOLIO_DATA.footer, ...(parsed.footer || {}) },
  };
}
