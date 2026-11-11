import { useEffect, useState, useRef, type ReactNode, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Award,
  Briefcase,
  Code2,
  Copy,
  Check,
  Database,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Send,
  Server,
  Sun,
  Wrench,
  X,
  FolderGit2,
  Layout,
  Cpu,
  Layers,
  Lock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { usePortfolioData, type SkillCategory, type ProjectItem } from "@/lib/portfolio-data";
import profileCutoutImg from "@/assets/profile-cutout.png";
import resumePdfAsset from "@/assets/Banupriya_Resume.pdf";

export async function downloadResumeFile(url?: string, filename = "Banupriya_M_Resume.pdf") {
  const targetUrl =
    url && url !== "#" && !url.includes("/__l5e") ? url : resumePdfAsset || "/Banupriya_Resume.pdf";

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    toast.success("Resume downloaded successfully!");
  } catch (err) {
    console.warn("Direct blob download failed, falling back to direct anchor:", err);
    const a = document.createElement("a");
    a.href = targetUrl;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function Github({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function Linkedin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  ["home", "Home"],
  ["about", "About"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["certifications", "Certifications"],
  ["contact", "Contact"],
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-mono font-medium text-[#7C3AED] dark:text-purple-300 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] dark:bg-purple-400 animate-pulse" />
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">{subtitle}</p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      {...fadeUp}
      whileHover={{ y: -3 }}
      className={`rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-500/5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border/70 bg-secondary px-3 py-1 font-mono text-xs font-medium text-secondary-foreground transition-colors hover:border-purple-500/40">
      {children}
    </span>
  );
}

function getSkillIcon(iconName: SkillCategory["iconName"]) {
  switch (iconName) {
    case "Layout":
      return Layout;
    case "Server":
      return Server;
    case "Database":
      return Database;
    case "Wrench":
      return Wrench;
    case "Cpu":
      return Cpu;
    default:
      return Code2;
  }
}

// ==================== VOICE INTRO HOOK ====================
function useVoiceIntro(profile: {
  name: string;
  role: string;
  shortBio: string;
  voiceIntroScript?: string;
  voiceIntroAudioUrl?: string;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playVoice = () => {
    if (isSpeaking) {
      stopVoice();
      return;
    }

    // 1. If custom audio file is provided (e.g. real recording MP3/WAV)
    if (profile.voiceIntroAudioUrl) {
      try {
        const audio = new Audio(profile.voiceIntroAudioUrl);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          toast.error("Could not play custom audio file.");
        };
        audio.play();
        toast.success("Playing audio introduction!");
        return;
      } catch (err) {
        console.warn("Audio playback failed, falling back to speech synthesis:", err);
      }
    }

    // 2. Realistic SpeechSynthesis with Natural Human-like Neural Voice
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    // Professional, confident engineering pitch (no generic/cheesy filler)
    const introText =
      profile.voiceIntroScript ||
      `Hi, I'm ${profile.name || "Banupriya"} — a Full Stack Software Engineer. I specialize in building scalable web applications and robust REST APIs using React, Node.js, and Python. With hands-on experience across three engineering internships and production projects, I focus on clean architecture, responsive design, and performant systems. I am currently open to full-time engineering opportunities. Feel free to explore my projects or reach out directly to connect. Thank you!`;

    const utterance = new SpeechSynthesisUtterance(introText);
    utterance.rate = 0.94; // Calm, clear, professional human cadence
    utterance.pitch = 1.0; // Natural warm human pitch (not robotic high pitch)

    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural neural voices (Edge / Chrome Natural, Google US/UK, Siri/Samantha)
    // Avoid legacy robotic Windows Zira / David Desktop voices
    const preferredVoice =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Online (Natural)")) ||
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          v.name.includes("Natural") &&
          !v.name.includes("Desktop")
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google US English") ||
            v.name.includes("Google UK English Female"))
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Victoria"))
      ) ||
      voices.find(
        (v) =>
          (v.lang.includes("en-IN") || v.lang.includes("en_IN")) &&
          v.name.includes("Natural")
      ) ||
      voices.find(
        (v) =>
          (v.lang.includes("en-IN") || v.lang.includes("en_IN")) &&
          !v.name.includes("Desktop")
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Female") ||
            v.name.includes("Jenny") ||
            v.name.includes("Aria"))
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    toast.success("Playing Banupriya's audio introduction!");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      stopVoice();
    };
  }, []);

  return { isSpeaking, playVoice, stopVoice };
}

// ==================== NAV COMPONENT ====================
function Nav({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const brandName = (profile?.logoTitle || profile?.name || "Banupriya M")
    .replace(/\.+$/, "")
    .trim();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/70 bg-background/90 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
        <a
          href="#home"
          className="group inline-flex items-center font-display text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap shrink-0"
        >
          <span className="text-[#7C3AED] whitespace-nowrap">{brandName}</span>
        </a>

        <div className="hidden items-center gap-4 xl:gap-6 lg:flex">
          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-xs xl:text-sm font-medium text-slate-600 transition-colors hover:text-[#7C3AED] dark:text-slate-300 dark:hover:text-purple-400 whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              downloadResumeFile(
                profile?.resumeUrl,
                `${(profile?.name || "Banupriya_M").replace(/\s+/g, "_")}_Resume.pdf`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-3.5 py-2 sm:px-4 sm:py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:bg-[#6D28D9] hover:shadow-purple-500/35 hover:scale-[1.02] whitespace-nowrap shrink-0 cursor-pointer"
            title="Download Resume (PDF)"
          >
            <Download size={14} className="shrink-0" />
            <span className="whitespace-nowrap">Download Resume</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card p-2 text-foreground transition-all hover:border-purple-500/40 hover:text-[#7C3AED]"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="/admin"
            title="Admin Page — Edit Website"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-purple-500/40 hover:text-[#7C3AED]"
          >
            <Lock size={13} />
            <span>Admin</span>
          </Link>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="shrink-0 rounded-xl border border-border/80 bg-card p-2 text-foreground transition-colors hover:text-[#7C3AED] lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur-2xl lg:hidden"
        >
          <div className="flex flex-col space-y-3">
            {NAV_ITEMS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[#7C3AED]"
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  downloadResumeFile(
                    profile?.resumeUrl,
                    `${(profile?.name || "Banupriya_M").replace(/\s+/g, "_")}_Resume.pdf`
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-md cursor-pointer"
              >
                <Download size={15} /> Download Resume
              </button>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#7C3AED] py-1"
              >
                <Lock size={13} /> Open Admin Page
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

// ==================== HERO SECTION ====================
function Hero({
  profile,
  education,
  onPlayVoice,
  isSpeaking,
}: {
  profile: any;
  education?: any;
  onPlayVoice?: () => void;
  isSpeaking?: boolean;
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const achievementFirst = profile.achievementLine?.includes("|")
    ? profile.achievementLine.split("|")[0].trim()
    : education?.cgpa || "8.1 CGPA";

  const achievementSecond = profile.achievementLine?.includes("|")
    ? profile.achievementLine.split("|")[1].trim()
    : "3 Internships";

  return (
    <section
      id="home"
      className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-40 bg-[#F8F9FA] dark:bg-[#0B0F17]"
    >
      {/* Subtle Purple Ambient Lighting */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-10 left-10 h-72 w-72 rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Headline, Role, Description, Buttons, Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs font-mono font-medium text-[#7C3AED] dark:text-purple-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{profile.statusPill || "Available for Opportunities"}</span>
          </div>

          {/* Headline */}
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Hi, I'm <span className="text-[#7C3AED]">{profile.name}</span>
          </h1>

          {/* Role */}
          <p className="mt-2.5 font-display text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl lg:text-4xl">
            {profile.role}
          </p>

          {/* Description */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            {profile.shortBio}
          </p>

          {/* Compact Achievement Line */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 sm:text-sm">
            {profile.achievementLine ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <Award size={15} className="text-[#7C3AED]" /> {profile.achievementLine}
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Award size={15} className="text-[#7C3AED]" /> {achievementFirst}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Briefcase size={15} className="text-[#7C3AED]" /> {achievementSecond}
                </span>
              </>
            )}
            {profile.location && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <MapPin size={13} className="text-[#7C3AED]" /> {profile.location}
                </span>
              </>
            )}
          </div>

          {/* Action Buttons: See Projects & Get in Touch */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-purple-500/35 hover:scale-[1.02] whitespace-nowrap"
            >
              <FolderGit2 size={16} /> See Projects
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#7C3AED]/40 bg-purple-50/40 px-7 py-3.5 text-sm font-semibold text-[#7C3AED] transition-all hover:border-[#7C3AED] hover:bg-purple-100/60 dark:bg-purple-950/20 dark:hover:bg-purple-900/40 whitespace-nowrap"
            >
              <Mail size={16} /> Get in Touch
            </a>
          </div>

          {/* Social Icons: Circular purple buttons matching reference image bottom-left */}
          <div className="mt-8 flex items-center gap-3">
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn Profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-sm shadow-purple-500/25 transition-all hover:bg-[#6D28D9] hover:scale-110"
              >
                <Linkedin size={18} />
              </a>
            )}

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub Profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-sm shadow-purple-500/25 transition-all hover:bg-[#6D28D9] hover:scale-110"
              >
                <Github size={18} />
              </a>
            )}

            {profile.email && (
              <button
                onClick={copyEmail}
                aria-label="Email"
                title="Copy Email Address"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-sm shadow-purple-500/25 transition-all hover:bg-[#6D28D9] hover:scale-110"
              >
                {copiedEmail ? <Check size={18} /> : <Mail size={18} />}
              </button>
            )}

            {copiedEmail && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Email copied!
              </span>
            )}
          </div>
        </motion.div>

        {/* Right Column: Seamless Cutout Photo WITHOUT any box template */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto flex w-full flex-col items-center justify-center lg:col-span-5 lg:items-end"
        >
          {/* Subtle soft purple ambient aura in background */}
          <div className="pointer-events-none absolute bottom-12 right-1/4 h-80 w-80 rounded-full bg-purple-500/15 blur-[100px]" />

          {/* Seamless image: No box template, no border, no white card */}
          <div className="relative z-10 flex w-full max-w-[460px] items-end justify-center select-none pointer-events-none">
            <img
              src={profileCutoutImg}
              alt={profile.name}
              className="h-auto w-full max-h-[520px] object-contain object-bottom drop-shadow-[0_16px_32px_rgba(124,58,237,0.12)] transition-transform duration-500 hover:scale-[1.02] pointer-events-auto"
              loading="eager"
            />
          </div>

          {/* Simple Voice Intro Pill right below image */}
          {onPlayVoice && (
            <div className="relative z-20 mt-4 flex justify-center w-full max-w-[450px]">
              <button
                onClick={onPlayVoice}
                className="inline-flex items-center gap-2.5 rounded-full border border-purple-200/90 bg-white/95 px-5 py-2.5 text-xs font-semibold text-[#7C3AED] shadow-sm backdrop-blur transition-all hover:border-[#7C3AED] hover:bg-purple-50 hover:shadow-md dark:border-purple-900/40 dark:bg-card/95 cursor-pointer"
                title="Click to play Banupriya's audio overview"
              >
                {isSpeaking ? (
                  <>
                    <span className="flex items-center gap-0.5">
                      <span className="h-2.5 w-1 animate-pulse rounded-full bg-[#7C3AED]" />
                      <span className="h-4 w-1 animate-pulse rounded-full bg-[#7C3AED] delay-75" />
                      <span className="h-2 w-1 animate-pulse rounded-full bg-[#7C3AED] delay-150" />
                    </span>
                    <span>Playing Intro... (Click to Pause)</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                      <Volume2 size={12} />
                    </span>
                    <span>{profile.voiceIntroBtnText || "Quick Audio Intro"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== ABOUT SECTION ====================
function About({ about, education }: { about: any; education: any }) {
  return (
    <Section
      id="about"
      eyebrow="background & focus"
      title="About Me"
      subtitle="Full Stack Software Engineer committed to creating clean, maintainable code and scalable systems."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <p className="text-base leading-relaxed text-muted-foreground">
            {about.leadParagraph}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {about.secondaryParagraph}
          </p>

          {/* Quick Metrics */}
          {about.highlights && about.highlights.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4">
              {about.highlights.map((h: { label: string; value: string }) => (
                <div key={h.label}>
                  <div className="font-display text-2xl font-bold text-[#7C3AED] dark:text-purple-400">{h.value}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{h.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="inline-flex rounded-xl bg-purple-600/10 p-3 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20">
              <GraduationCap size={22} />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{education.degree}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{education.institution}</p>
          </div>
          <div className="mt-6 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-xs text-muted-foreground">{education.period}</span>
              <span className="font-display font-bold text-[#7C3AED] dark:text-purple-400">{education.cgpa}</span>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

// ==================== SKILLS SECTION ====================
function Skills({ skills }: { skills: SkillCategory[] }) {
  return (
    <Section
      id="skills"
      eyebrow="technical stack"
      title="Core Skills & Technologies"
      subtitle="A versatile toolkit across frontend frameworks, backend runtimes, database architecture, and developer tools."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map(({ iconName, title, items }) => {
          const Icon = getSkillIcon(iconName);
          return (
            <Card key={title} className="flex flex-col">
              <div className="mb-4 inline-flex w-fit rounded-xl bg-purple-600/10 p-3 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20">
                <Icon size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <div className="mt-4 flex flex-1 flex-wrap content-start gap-2">
                {items.map((skill) => (
                  <Chip key={skill}>{skill}</Chip>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

// ==================== PROJECTS SECTION ====================
function Projects({ projects }: { projects: ProjectItem[] }) {
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", "Full Stack", "AI / ML"];

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.category === filter || p.badge?.includes(filter));

  return (
    <Section
      id="projects"
      eyebrow="featured projects"
      title="Featured Engineering Projects"
      subtitle="Production-focused web apps, machine learning models, and full-stack solutions."
    >
      {/* Category filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === cat
                ? "bg-[#7C3AED] text-white shadow-sm shadow-purple-500/20"
                : "border border-border/80 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {filteredProjects.map((p) => (
          <Card key={p.id || p.title} className="group flex flex-col overflow-hidden p-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
              <img
                src={p.img}
                alt={`${p.title} preview`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              {p.badge && (
                <span className="absolute top-3 right-3 rounded-full bg-[#7C3AED] px-3 py-1 text-xs font-semibold text-white shadow">
                  {p.badge}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-lg font-semibold group-hover:text-[#7C3AED] transition-colors">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4 border-t border-border/60 pt-4">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[#7C3AED] transition-colors"
                  >
                    <Github size={15} /> Source Code
                  </a>
                )}
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[#7C3AED] transition-colors"
                  >
                    <ExternalLink size={15} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ==================== EXPERIENCE SECTION ====================
function Experience({ jobs }: { jobs: any[] }) {
  return (
    <Section
      id="experience"
      eyebrow="career history"
      title="Work & Internship Experience"
      subtitle="Practical software engineering roles collaborating on features, API architecture, and code stability."
    >
      <div className="relative space-y-8 border-l-2 border-purple-500/30 pl-8 ml-3 md:ml-4">
        {jobs.map((j) => (
          <motion.div key={j.id || j.company} {...fadeUp} className="relative">
            <span className="absolute -left-[41px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] shadow-sm text-white">
              <Briefcase size={10} />
            </span>
            <div className="rounded-2xl border border-border/80 bg-card p-6 backdrop-blur transition-all duration-300 hover:border-purple-500/40 hover:shadow-md">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{j.role}</h3>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 font-mono text-xs font-medium text-[#7C3AED] dark:text-purple-300">
                  {j.when}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{j.company}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {j.pts.map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-2.5 leading-relaxed">
                    <span className="text-[#7C3AED] font-bold">▹</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ==================== EDUCATION SECTION ====================
function Education({ education }: { education: any }) {
  return (
    <Section
      id="education"
      eyebrow="academics"
      title="Education"
      subtitle="Foundations in Information Technology, Software Engineering, and Computer Science."
    >
      <Card className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="inline-flex w-fit rounded-2xl bg-purple-600/10 p-4 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20">
          <GraduationCap size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold">{education.degree}</h3>
          <p className="text-muted-foreground font-medium">{education.institution}</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Coursework:</strong> {education.coursework}
          </p>
        </div>
        <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
          <p className="font-mono text-xs text-[#7C3AED] dark:text-purple-400 font-semibold">{education.period}</p>
          <p className="mt-1 font-display text-2xl font-bold text-gradient">{education.cgpa}</p>
        </div>
      </Card>
    </Section>
  );
}

// ==================== CERTIFICATIONS SECTION ====================
function Certifications({ certs }: { certs: any[] }) {
  return (
    <Section
      id="certifications"
      eyebrow="certifications"
      title="Credentials & Continuous Learning"
      subtitle="Certifications in Cloud Computing, Full Stack Development, and User Experience Design."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {certs.map((c) => (
          <Card key={c.id || c.name} className="flex flex-col justify-between">
            <div>
              <div className="inline-flex rounded-xl bg-purple-600/10 p-2.5 text-[#7C3AED] dark:text-purple-400 border border-purple-500/20">
                <Award size={22} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{c.name}</h3>
              <p className="mt-1 font-mono text-xs text-[#7C3AED] dark:text-purple-400 font-medium">{c.by}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
            </div>
            {c.link && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <a
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] dark:text-purple-400 hover:underline"
                >
                  View Credential <ExternalLink size={12} />
                </a>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ==================== CONTACT SECTION ====================
const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(1, "Please enter a message").max(1000),
});

function Contact({ profile }: { profile: any }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = contactSchema.safeParse(data);

    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }

    setErrors({});
    const subject = encodeURIComponent(`Portfolio Inquiry from ${result.data.name}`);
    const body = encodeURIComponent(
      `${result.data.message}\n\n— From: ${result.data.name} (${result.data.email})`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
    toast.success("Ready to send! Opening email client.");
  };

  const inputClasses =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]";

  const contactLinks = [
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}`, action: "Email" },
    { icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, "")}`, action: "Call" },
    { icon: Linkedin, label: "LinkedIn Profile", href: profile.linkedin, action: "Connect" },
    { icon: Github, label: "GitHub Profile", href: profile.github, action: "Follow" },
  ];

  return (
    <Section
      id="contact"
      eyebrow="get in touch"
      title="Let's Connect"
      subtitle="Available for full stack and frontend developer opportunities. Feel free to reach out directly."
    >
      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <motion.div {...fadeUp} className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            I am currently open to full-time roles, engineering internships, and technical collaborations. Whether you have questions about my projects or an open role, drop a note below.
          </p>

          <div className="space-y-3 pt-2">
            {contactLinks.map(({ icon: Icon, label, href, action }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-purple-500/50 hover:text-[#7C3AED]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground hover:text-[#7C3AED]">
                  {action} ↗
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                maxLength={100}
                className={inputClasses}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                maxLength={255}
                className={inputClasses}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Hi Banupriya, I'd like to discuss an opportunity..."
                maxLength={1000}
                className={inputClasses}
              />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-[#6D28D9] hover:scale-[1.01]"
            >
              <Send size={16} /> Send Direct Message
            </button>

            {sent && (
              <p className="text-center font-mono text-xs text-[#7C3AED] dark:text-purple-400">
                Opening default email composer…
              </p>
            )}
          </form>
        </Card>
      </div>
    </Section>
  );
}

// ==================== SCROLL TO TOP ====================
function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed right-6 bottom-6 z-40 rounded-full bg-[#7C3AED] p-3 text-white shadow-lg transition-transform hover:bg-[#6D28D9] hover:scale-110"
    >
      <ArrowUp size={18} />
    </button>
  );
}

// ==================== MAIN PORTFOLIO COMPONENT ====================
export function Portfolio() {
  const { data } = usePortfolioData();
  const { profile, about, skills, projects, experience, education, certifications } = data;
  const { isSpeaking, playVoice, stopVoice } = useVoiceIntro(profile);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-purple-500/20 selection:text-[#7C3AED]">
      <Nav profile={profile} />
      <main>
        <Hero
          profile={profile}
          education={education}
          onPlayVoice={playVoice}
          isSpeaking={isSpeaking}
        />
        <About about={about} education={education} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Experience jobs={experience} />
        <Education education={education} />
        <Certifications certs={certifications} />
        <Contact profile={profile} />
      </main>

      {/* Floating Voice Intro Audio Indicator */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border border-purple-400/40 bg-[#7C3AED] px-5 py-2.5 text-white shadow-2xl shadow-purple-900/40 backdrop-blur-md"
        >
          <div className="flex items-center gap-1">
            <span className="h-3 w-1 animate-bounce rounded-full bg-white" />
            <span className="h-5 w-1 animate-bounce rounded-full bg-white delay-100" />
            <span className="h-2 w-1 animate-bounce rounded-full bg-white delay-200" />
            <span className="h-4 w-1 animate-bounce rounded-full bg-white delay-300" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            Banupriya Introduction Playing...
          </span>
          <button
            onClick={stopVoice}
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
            title="Stop voice intro"
          >
            <VolumeX size={13} />
          </button>
        </motion.div>
      )}

      <footer className="bg-[#0B0F17] text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
            {/* Col 1: Brand & Subtitle */}
            <div>
              <a
                href="#home"
                className="font-display text-xl font-bold tracking-tight text-white hover:text-purple-400 transition-colors"
              >
                {profile.logoTitle || profile.name}.
              </a>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
                {profile.role || "Full Stack Developer"} building scalable, responsive web applications.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                QUICK LINKS
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="#about" className="text-slate-300 transition-colors hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#projects" className="text-slate-300 transition-colors hover:text-white">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#skills" className="text-slate-300 transition-colors hover:text-white">
                    Skills
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-300 transition-colors hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Connect */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                CONNECT
              </h4>
              <div className="mt-4 flex items-center gap-3">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                  >
                    <Github size={18} />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="mt-12 border-t border-slate-800/80 pt-8">
            <div className="relative flex items-center justify-center">
              <p className="text-center text-xs text-slate-400">
                © {new Date().getFullYear()} {profile.name} - {profile.role} - All rights reserved.
              </p>
              <Link
                to="/admin"
                className="absolute right-0 opacity-20 hover:opacity-100 transition-opacity text-slate-400"
                title="Admin Page — Edit Website"
              >
                <Lock size={13} />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ScrollTop />
    </div>
  );
}
