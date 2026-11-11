import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Download,
  Upload,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Eye,
  Briefcase,
  FolderGit2,
  Code2,
  GraduationCap,
  Award,
  User,
  Settings,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePortfolioData,
  saveStoredPortfolioData,
  DEFAULT_PORTFOLIO_DATA,
  type PortfolioData,
  type ProjectItem,
  type ExperienceItem,
  type CertificationItem,
  type SkillCategory,
} from "@/lib/portfolio-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Studio — Banupriya Portfolio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const PASSCODE_STORAGE_KEY = "banupriya_admin_passcode";
const AUTH_SESSION_KEY = "banupriya_admin_auth";

function AdminPage() {
  const { data, updateData, resetData, exportJson, importJson, isLoaded } = usePortfolioData();

  // Local editable draft state
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "about" | "skills" | "projects" | "experience" | "education" | "settings"
  >("profile");

  const [importText, setImportText] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");

  // Sync draft on initial load
  useEffect(() => {
    if (isLoaded) {
      setFormData(data);
    }
  }, [isLoaded]);

  // Auto-save any edits directly into storage so nothing is ever lost
  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      saveStoredPortfolioData(formData);
    }
  }, [formData, isLoaded, isAuthenticated]);

  // Check auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const getStoredPasscode = () => {
    if (typeof window === "undefined") return "admin123";
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || "admin123";
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = getStoredPasscode();
    if (passcodeInput.trim() === correct) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      setPasscodeError("");
      toast.success("Welcome to Portfolio Admin Studio!");
    } else {
      setPasscodeError("Incorrect passcode. Default is admin123");
      toast.error("Incorrect passcode.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    toast.info("Logged out of Admin Studio.");
  };

  const handleSaveAll = () => {
    saveStoredPortfolioData(formData);
    updateData(() => formData);
    toast.success("All portfolio updates saved and published successfully!");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all portfolio data to defaults?")) {
      resetData();
      setFormData(DEFAULT_PORTFOLIO_DATA);
      toast.info("Portfolio data reset to default settings.");
    }
  };

  const handleSavePasscode = () => {
    if (!newPasscode.trim() || newPasscode.length < 4) {
      toast.error("Passcode must be at least 4 characters long.");
      return;
    }
    localStorage.setItem(PASSCODE_STORAGE_KEY, newPasscode.trim());
    toast.success("Admin passcode updated successfully!");
    setNewPasscode("");
  };

  const handleImportSubmit = () => {
    const success = importJson(importText);
    if (success) {
      setShowImportModal(false);
      setImportText("");
      toast.success("Portfolio data imported successfully!");
    } else {
      toast.error("Invalid JSON format. Please verify and try again.");
    }
  };

  // ==================== LOGIN SCREEN ====================
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lg shadow-primary/20">
              <Lock size={26} />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Admin Studio</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your passcode to edit portfolio content and projects.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="passcode"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                placeholder="Enter admin passcode"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError("");
                }}
                className="w-full rounded-xl border border-input/80 bg-background/80 px-4 py-3 text-sm font-mono outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
              {passcodeError && (
                <p className="mt-2 text-xs font-medium text-destructive">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-[1.01] glow"
            >
              <Unlock size={16} /> Access Studio
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <span className="font-mono">Default passcode: admin123</span>
            <Link to="/" className="text-primary hover:underline">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD VIEW ====================
  const inputStyle =
    "w-full rounded-xl border border-input/80 bg-background/80 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              onClick={handleSaveAll}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
              title="Return to Portfolio"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold">Admin Content Studio</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-500">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Edit portfolio profile, projects, skills & experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              onClick={handleSaveAll}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Eye size={14} /> Preview Site
            </Link>

            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] glow"
            >
              <Save size={14} /> Save Changes
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-border/80 bg-card/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
              title="Log out"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 no-scrollbar">
          <div className="flex space-x-1 border-b border-border/40 py-1 text-xs font-medium">
            {[
              { id: "profile", label: "Profile & Hero", icon: User },
              { id: "about", label: "About Me", icon: Sparkles },
              { id: "skills", label: "Skills", icon: Code2 },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "education", label: "Education & Certs", icon: GraduationCap },
              { id: "settings", label: "Backup & Settings", icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* ==================== TAB: PROFILE ==================== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Hero & Branding</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Configure your main name, roles, branding text and contact channels.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.profile.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, name: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.profile.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, role: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Website Branding Title (e.g. Banupriya M)
                  </label>
                  <input
                    type="text"
                    value={formData.profile.logoTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, logoTitle: e.target.value, logoSuffix: "" },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Avatar Initials (e.g. BP or B)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.profile.initials}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, initials: e.target.value },
                      })
                    }
                    placeholder="BP or B"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Custom Avatar Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... (Leave blank to use initial badge)"
                    value={formData.profile.avatarUrl || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, avatarUrl: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Status Pill Text
                  </label>
                  <input
                    type="text"
                    value={formData.profile.statusPill}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, statusPill: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Compact Achievement Line (e.g. 8.1 CGPA | 3 Internships)
                  </label>
                  <input
                    type="text"
                    value={formData.profile.achievementLine || "8.1 CGPA | 3 Internships"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, achievementLine: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Short Bio (Hero description)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.profile.shortBio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, shortBio: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Contact & Social Links</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.profile.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, email: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.profile.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, phone: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.profile.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, location: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Resume URL
                  </label>
                  <input
                    type="text"
                    value={formData.profile.resumeUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, resumeUrl: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={formData.profile.github}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, github: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={formData.profile.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, linkedin: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2 border-t border-border/60 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
                    Audio / Voice Intro Settings
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Quick Audio Intro"
                        value={formData.profile.voiceIntroBtnText || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, voiceIntroBtnText: e.target.value },
                          })
                        }
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Custom Audio File URL (Optional MP3/WAV)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /my-voice.mp3 (leave empty for natural speech)"
                        value={formData.profile.voiceIntroAudioUrl || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, voiceIntroAudioUrl: e.target.value },
                          })
                        }
                        className={inputStyle}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Voice Introduction Speech Script
                      </label>
                      <textarea
                        rows={3}
                        value={formData.profile.voiceIntroScript || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, voiceIntroScript: e.target.value },
                          })
                        }
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ABOUT ==================== */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">About Paragraphs</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Primary Bio Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about.leadParagraph}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, leadParagraph: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Secondary Bio Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about.secondaryParagraph}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, secondaryParagraph: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Metric Highlights</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {formData.about.highlights.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={h.label}
                      onChange={(e) => {
                        const next = [...formData.about.highlights];
                        next[idx].label = e.target.value;
                        setFormData({
                          ...formData,
                          about: { ...formData.about, highlights: next },
                        });
                      }}
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => {
                        const next = [...formData.about.highlights];
                        next[idx].value = e.target.value;
                        setFormData({
                          ...formData,
                          about: { ...formData.about, highlights: next },
                        });
                      }}
                      className="w-28 rounded-xl border border-input/80 bg-background/80 px-3 py-2 text-sm font-bold text-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SKILLS ==================== */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Technical Skills Groups</h2>
                <p className="text-xs text-muted-foreground">
                  Add, edit, or delete skills across each technical tier.
                </p>
              </div>
              <button
                onClick={() => {
                  const newCategory: SkillCategory = {
                    title: "New Category",
                    iconName: "Code2",
                    items: ["Example Skill"],
                  };
                  setFormData({ ...formData, skills: [...formData.skills, newCategory] });
                  toast.success("New skill category added.");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {formData.skills.map((cat, catIdx) => (
                <div
                  key={catIdx}
                  className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => {
                        const updated = [...formData.skills];
                        updated[catIdx].title = e.target.value;
                        setFormData({ ...formData, skills: updated });
                      }}
                      className="font-display text-base font-bold bg-transparent border-b border-border/60 pb-1 outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const updated = formData.skills.filter((_, i) => i !== catIdx);
                        setFormData({ ...formData, skills: updated });
                        toast.info("Category removed.");
                      }}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {cat.items.map((skill, skillIdx) => (
                      <span
                        key={skillIdx}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-mono"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const updated = [...formData.skills];
                            updated[catIdx].items = updated[catIdx].items.filter(
                              (_, i) => i !== skillIdx
                            );
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add skill input */}
                  <div className="mt-4 flex gap-2">
                    <input
                      id={`new-skill-${catIdx}`}
                      type="text"
                      placeholder="Add skill tag..."
                      className="flex-1 rounded-lg border border-input/80 bg-background/80 px-3 py-1.5 text-xs outline-none focus:border-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const updated = [...formData.skills];
                            updated[catIdx].items.push(val);
                            setFormData({ ...formData, skills: updated });
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          `new-skill-${catIdx}`
                        ) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const updated = [...formData.skills];
                          updated[catIdx].items.push(input.value.trim());
                          setFormData({ ...formData, skills: updated });
                          input.value = "";
                        }
                      }}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: PROJECTS ==================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Featured Projects</h2>
                <p className="text-xs text-muted-foreground">
                  Update projects, descriptions, tech stacks, and live links.
                </p>
              </div>
              <button
                onClick={() => {
                  const newProj: ProjectItem = {
                    id: `proj-${Date.now()}`,
                    title: "New Project",
                    desc: "Detailed overview of project goals, architecture, and achievements.",
                    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
                    badge: "New",
                    category: "Full Stack",
                    tech: ["React.js", "Node.js", "SQL"],
                    github: "https://github.com/banupriya0811",
                    demo: "https://github.com/banupriya0811",
                  };
                  setFormData({ ...formData, projects: [newProj, ...formData.projects] });
                  toast.success("New project card added.");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow"
              >
                <Plus size={14} /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {formData.projects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-mono text-xs text-primary font-semibold">
                      Project #{idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updated = formData.projects.filter((_, i) => i !== idx);
                        setFormData({ ...formData, projects: updated });
                        toast.info("Project removed.");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Badge / Status
                      </label>
                      <input
                        type="text"
                        value={proj.badge || ""}
                        placeholder="e.g. Featured, AI + ML"
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].badge = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={proj.desc}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].desc = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Preview Image URL
                      </label>
                      <input
                        type="text"
                        value={proj.img}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].img = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Technologies (comma separated)
                      </label>
                      <input
                        type="text"
                        value={proj.tech.join(", ")}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].tech = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-1.5">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        GitHub Link
                      </label>
                      <input
                        type="text"
                        value={proj.github}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].github = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-1.5">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Live Demo Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={proj.demo || ""}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].demo = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: EXPERIENCE ==================== */}
        {activeTab === "experience" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Experience & Internships</h2>
                <p className="text-xs text-muted-foreground">
                  Manage professional positions and achievement bullets.
                </p>
              </div>
              <button
                onClick={() => {
                  const newExp: ExperienceItem = {
                    id: `exp-${Date.now()}`,
                    role: "Software Developer Intern",
                    company: "Company Name",
                    when: "Month Year – Present",
                    location: "Chennai",
                    pts: ["Implemented full stack features and resolved production bugs."],
                  };
                  setFormData({ ...formData, experience: [newExp, ...formData.experience] });
                  toast.success("New experience entry added.");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow"
              >
                <Plus size={14} /> Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {formData.experience.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-mono text-xs text-primary font-semibold">
                      Role #{idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updated = formData.experience.filter((_, i) => i !== idx);
                        setFormData({ ...formData, experience: updated });
                        toast.info("Experience entry removed.");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].company = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Duration / Dates
                      </label>
                      <input
                        type="text"
                        value={exp.when}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].when = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Location / Work Mode
                      </label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        placeholder="On-site / Remote"
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].location = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Key Points & Responsibilities (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={exp.pts.join("\n")}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].pts = e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setFormData({ ...formData, experience: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: EDUCATION & CERTS ==================== */}
        {activeTab === "education" && (
          <div className="space-y-6">
            {/* Education details */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Degree & College Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Degree Name
                  </label>
                  <input
                    type="text"
                    value={formData.education.degree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, degree: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={formData.education.institution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, institution: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Period
                  </label>
                  <input
                    type="text"
                    value={formData.education.period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, period: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    CGPA / Score
                  </label>
                  <input
                    type="text"
                    value={formData.education.cgpa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, cgpa: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Coursework Summary
                  </label>
                  <textarea
                    rows={3}
                    value={formData.education.coursework}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, coursework: e.target.value },
                      })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h2 className="font-display text-lg font-bold">Certifications</h2>
                <button
                  onClick={() => {
                    const newCert: CertificationItem = {
                      id: `cert-${Date.now()}`,
                      name: "Certification Name",
                      by: "Issuing Organization",
                      detail: "Skills & competencies acquired during the course.",
                    };
                    setFormData({
                      ...formData,
                      certifications: [...formData.certifications, newCert],
                    });
                    toast.success("New certification added.");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={14} /> Add Certification
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {formData.certifications.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 grid gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="Certificate Title"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Issuing Org (e.g. NPTEL)"
                        value={c.by}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].by = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Details"
                        value={c.detail}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].detail = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className={inputStyle}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updated = formData.certifications.filter((_, i) => i !== idx);
                        setFormData({ ...formData, certifications: updated });
                        toast.info("Certification removed.");
                      }}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SETTINGS & BACKUP ==================== */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Security settings */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Admin Passcode</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Set a personalized passcode to protect the Admin Studio from unauthorized edits.
              </p>

              <div className="mt-4 flex max-w-sm gap-2">
                <input
                  type="password"
                  placeholder="New passcode (min 4 chars)"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className={inputStyle}
                />
                <button
                  onClick={handleSavePasscode}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Backup & Data Sync */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Backup & Sync Tools</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Export your current portfolio configuration to a downloadable JSON file, or restore from a backup.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={exportJson}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow glow"
                >
                  <Download size={15} /> Download Backup (JSON)
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:border-primary"
                >
                  <Upload size={15} /> Import Backup (JSON)
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
                >
                  <RotateCcw size={15} /> Reset to Defaults
                </button>
              </div>
            </div>

            {/* Direct JSON Editor */}
            <div className="rounded-2xl border border-border/80 bg-card/75 p-6 backdrop-blur">
              <h2 className="font-display text-lg font-bold">Direct State Inspector</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Live JSON representation of your portfolio data.
              </p>
              <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-border/60 bg-background/90 p-4 font-mono text-[11px] text-muted-foreground">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Global Save Action Bar */}
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-2xl border border-primary/30 bg-card/95 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles size={16} className="text-primary" />
            <span>Changes persist immediately upon clicking save.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow glow transition-transform hover:scale-[1.02]"
            >
              <Save size={15} /> Save All Changes
            </button>
          </div>
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold">Import Portfolio JSON</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste the contents of a previously exported backup JSON file.
            </p>
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON here..."
              className="mt-4 w-full rounded-xl border border-input bg-background/80 p-3 font-mono text-xs outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow"
              >
                Apply Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
