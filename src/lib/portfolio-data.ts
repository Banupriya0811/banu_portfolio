import { useState, useEffect } from "react";
import certImg from "@/assets/proj-cert.jpg";
import bugImg from "@/assets/proj-bug.jpg";
import solarImg from "@/assets/proj-solar.jpg";
import resumeAsset from "@/assets/resume.pdf.asset.json";

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
  profile: {
    name: string;
    role: string;
    availability: string;
    statusPill: string;
    achievementLine?: string;
    avatarUrl?: string; // Optional image URL
    initials: string; // e.g. "BP" or "B"
    shortBio: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    resumeUrl: string;
    logoTitle: string;
    logoSuffix?: string;
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
}

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
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
    resumeUrl: resumeAsset?.url || "#",
    logoTitle: "Banupriya M",
    logoSuffix: "",
  },
  about: {
    leadParagraph:
      "I'm a results-driven Full Stack Developer with practical hands-on experience crafting production-grade web applications using React, Node.js, Express.js, MySQL and Flask. My core strengths center around resilient REST API design, component architecture, and database optimization.",
    secondaryParagraph:
      "Having completed real-world engineering internships, I'm accustomed to agile environments, code reviews, and end-to-end delivery. I strive to build software that marries clean architectural patterns with intuitive user experiences.",
    highlights: [
      { label: "Hands-on Internships", value: "3" },
      { label: "Academic CGPA", value: "8.1" },
      { label: "Primary Stack", value: "MERN / Python" },
      { label: "Location", value: "Chennai" },
    ],
  },
  skills: [
    {
      title: "Frontend Engineering",
      iconName: "Layout",
      items: ["React.js", "TypeScript", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & Modern CSS", "Figma to Code"],
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
      img: certImg,
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
      img: solarImg,
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
      img: bugImg,
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
};

const STORAGE_KEYS = [
  "banupriya_portfolio_data_v4",
  "banupriya_portfolio_data_v3",
  "banupriya_portfolio_data_v2",
  "banupriya_portfolio_data",
];

export function getStoredPortfolioData(): PortfolioData {
  if (typeof window === "undefined") {
    return DEFAULT_PORTFOLIO_DATA;
  }
  try {
    let raw: string | null = null;
    for (const key of STORAGE_KEYS) {
      const val = localStorage.getItem(key);
      if (val) {
        raw = val;
        break;
      }
    }
    if (!raw) return DEFAULT_PORTFOLIO_DATA;
    const parsed = JSON.parse(raw);
    if (parsed.profile) {
      if (parsed.profile.logoTitle === "Banupriya" || !parsed.profile.logoTitle) {
        parsed.profile.logoTitle = "Banupriya M";
      }
      if (parsed.profile.logoSuffix) {
        parsed.profile.logoSuffix = "";
      }
    }
    return {
      ...DEFAULT_PORTFOLIO_DATA,
      ...parsed,
      profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
      about: { ...DEFAULT_PORTFOLIO_DATA.about, ...(parsed.about || {}) },
      education: { ...DEFAULT_PORTFOLIO_DATA.education, ...(parsed.education || {}) },
    };
  } catch (e) {
    console.error("Failed to load portfolio data from localStorage:", e);
    return DEFAULT_PORTFOLIO_DATA;
  }
}

export function saveStoredPortfolioData(data: PortfolioData): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, serialized);
    }
    window.dispatchEvent(new Event("portfolio_data_updated"));
  } catch (e) {
    console.error("Failed to save portfolio data to localStorage:", e);
  }
}

export function resetStoredPortfolioData(): void {
  if (typeof window === "undefined") return;
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("portfolio_data_updated"));
}

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(getStoredPortfolioData());
    setIsLoaded(true);

    const handleUpdate = () => {
      setData(getStoredPortfolioData());
    };

    window.addEventListener("portfolio_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("portfolio_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateData = (updater: (prev: PortfolioData) => PortfolioData) => {
    setData((current) => {
      const next = updater(current);
      saveStoredPortfolioData(next);
      return next;
    });
  };

  const resetData = () => {
    resetStoredPortfolioData();
    setData(DEFAULT_PORTFOLIO_DATA);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `banupriya_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") return false;
      const merged: PortfolioData = {
        ...DEFAULT_PORTFOLIO_DATA,
        ...parsed,
        profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
        about: { ...DEFAULT_PORTFOLIO_DATA.about, ...(parsed.about || {}) },
      };
      saveStoredPortfolioData(merged);
      setData(merged);
      return true;
    } catch {
      return false;
    }
  };

  return {
    data,
    updateData,
    resetData,
    exportJson,
    importJson,
    isLoaded,
  };
}
