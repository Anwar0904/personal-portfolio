import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Send,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  trpc,
  type PublicPortfolio,
  type PortfolioProject,
} from "@/providers/trpc";
import "./studio-home.css";

const fallbackProfile = {
  name: "Anwar Ul Haq",
  headline: "Full-Stack AI Engineer",
  subheadline: "MERN Stack Developer, AI Engineer",
  bio: "I build practical, reliable software across full-stack web development and applied artificial intelligence.",
  location: "Pakistan",
  email: "au090469@gmail.com",
  avatarUrl: "/images/anwar-avatar.png",
  linkedinUrl: "https://www.linkedin.com/in/anwar-42khan/",
  githubUrl: "https://github.com/Anwar0904",
  availability: "Building intelligent software, end to end.",
};

// Transparent-background portrait used in the hero (public/images/anwar-hero.png).
const heroPortrait = "/images/anwar-hero.png";
// Drop your CV into public/ with this name to enable the "Download CV" button.
const cvUrl = "/Anwar-Ul-Haq-CV.pdf";

type Blog = PublicPortfolio["blogs"][number];

const emptyPortfolio = {
  profile: fallbackProfile,
  projects: [] satisfies PublicPortfolio["projects"],
  skills: [] satisfies PublicPortfolio["skills"],
  caseStudies: [] satisfies PublicPortfolio["caseStudies"],
  blogs: [] satisfies PublicPortfolio["blogs"],
};

const skillCategories: Record<string, string> = {
  Frontend: "Frontend",
  Backend: "Backend and APIs",
  "AI & Data": "Applied AI",
  Data: "Data and infrastructure",
  Languages: "Languages and tooling",
  Tools: "Languages and tooling",
};

const categoryOrder = [
  "Frontend",
  "Backend and APIs",
  "Applied AI",
  "Data and infrastructure",
  "Languages and tooling",
];

const approach = [
  [
    "Understand the problem",
    "Get clear on who it is for, what the constraints are, and what done looks like before picking tools.",
  ],
  [
    "Build it deliberately",
    "Usable interfaces, predictable APIs, and code that someone else can pick up and maintain.",
  ],
  [
    "Test it and improve it",
    "Check the result against real use, learn from what breaks, and keep refining.",
  ],
];

const techOf = (project: PortfolioProject, max?: number) => {
  const list = project.technologies
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  return max ? list.slice(0, max) : list;
};

function ProjectImage({
  project,
  thumb = false,
}: {
  project: PortfolioProject;
  thumb?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (project.imageUrl && !failed) {
    return (
      <img
        className="studio-img"
        src={project.imageUrl}
        alt={thumb ? "" : `${project.title} screenshot`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`studio-img-fallback ${thumb ? "studio-img-fallback--thumb" : ""}`}
    >
      <strong>{project.title}</strong>
      {!thumb && <small>{techOf(project, 3).join(", ")}</small>}
    </div>
  );
}

const footerNav = [
  ["Home", "#top"],
  ["About Me", "#about"],
  ["Recent Projects", "#work"],
  ["Technical Skills", "#skills"],
];

const footerExpertise = [
  "Full-Stack Web Development",
  "React.js & Modern UI",
  "Node.js & REST APIs",
  "Applied AI Engineering",
];

function PktClock() {
  const read = () =>
    new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const [time, setTime] = useState(read);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(read()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="studio-clock" aria-label="Current time in Pakistan">
      <span className="studio-clock-dot" aria-hidden="true" />
      PKT: {time}
    </div>
  );
}

const CONTACT_EMAIL = "au090469@gmail.com";
const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export default function Home() {
  const { data, isLoading, isError, refetch } = trpc.portfolio.public.useQuery(
    undefined,
    {
      retry: false,
      staleTime: 60_000,
    }
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("All");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [activeId, setActiveId] = useState("top");

  useEffect(() => {
    const ids = ["work", "skills", "about", "notes", "collaborate", "contact"];
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      let current = "top";
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      });
      setActiveId(current === "contact" ? "collaborate" : current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const portfolio = data ?? emptyPortfolio;
  const profile = portfolio.profile ?? fallbackProfile;

  const groupedSkills = useMemo(() => {
    const groups = new Map<string, PublicPortfolio["skills"]>();
    portfolio.skills.forEach(skill => {
      const category = skillCategories[skill.category] ?? skill.category;
      groups.set(category, [...(groups.get(category) ?? []), skill]);
    });
    return Array.from(groups.entries()).sort(([first], [second]) => {
      const firstIndex = categoryOrder.indexOf(first);
      const secondIndex = categoryOrder.indexOf(second);
      return (
        (firstIndex < 0 ? categoryOrder.length : firstIndex) -
        (secondIndex < 0 ? categoryOrder.length : secondIndex)
      );
    });
  }, [portfolio.skills]);

  // Featured work leads the gallery; order is otherwise unchanged.
  const projects = useMemo(
    () =>
      [...portfolio.projects].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      ),
    [portfolio.projects]
  );

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach(p =>
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    );
    return Array.from(counts.entries());
  }, [projects]);

  const visibleProjects = useMemo(
    () =>
      filter === "All" ? projects : projects.filter(p => p.category === filter),
    [projects, filter]
  );

  const selectedProject =
    previewIndex !== null ? (visibleProjects[previewIndex] ?? null) : null;
  const selectedCase = selectedProject
    ? portfolio.caseStudies.find(item => item.projectId === selectedProject.id)
    : undefined;

  const step = (direction: 1 | -1) => {
    if (previewIndex === null || visibleProjects.length === 0) return;
    setPreviewIndex(
      (previewIndex + direction + visibleProjects.length) %
        visibleProjects.length
    );
  };

  const heroStats = [
    [portfolio.projects.length, "Projects done"],
    [portfolio.skills.length, "Technologies"],
    [portfolio.caseStudies.length, "Case studies"],
  ].filter(([count]) => Number(count) > 0) as [number, string][];

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Subscribe me")}&body=${encodeURIComponent(`Please add ${email} to your updates list.`)}`;
    setSubscribeEmail("");
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("_honey")) return;

    setSendStatus("sending");
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject") || "Project Inquiry",
          message: data.get("message"),
          _subject: `Portfolio message: ${data.get("subject") || "Project Inquiry"}`,
          _replyto: data.get("email"),
          _template: "table",
          _captcha: "false",
        }),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("success" in result) ||
        (result.success !== true && result.success !== "true")
      ) {
        throw new Error("Contact form service rejected the message.");
      }

      form.reset();
      setSendStatus("sent");
      toast.success("Message sent. I'll get back to you soon.");
      window.setTimeout(() => setSendStatus("idle"), 6000);
    } catch (error) {
      setSendStatus("idle");
      toast.error(
        `Couldn't send your message. Please email ${CONTACT_EMAIL} directly.`
      );
      console.error("Failed to submit collaboration message:", error);
    }
  };

  const navItems = [
    { label: "Home", href: "#top" },
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "About", href: "#about" },
    ...(portfolio.blogs.length ? [{ label: "Notes", href: "#notes" }] : []),
    { label: "Contact", href: "#collaborate" },
  ];
  const isActive = (href: string) => href.slice(1) === activeId;

  return (
    <div className="studio-site" id="top">
      <a className="studio-skip-link" href="#main-content">
        Skip to content
      </a>

      <header
        className={`studio-header ${scrolled ? "studio-header--scrolled" : ""}`}
      >
        <div className="studio-container studio-header-inner">
          <a
            className={`studio-logo ${scrolled ? "studio-logo--scrolled" : ""}`}
            href="#top"
            aria-label={`${profile.name}, back to top`}
          >
            anwar<span className="studio-logo-dot">.</span>
            <span className="studio-logo-suffix">dev</span>
          </a>
          <nav
            className={`studio-desktop-nav ${scrolled ? "studio-desktop-nav--scrolled" : ""}`}
            aria-label="Main navigation"
          >
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "true" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="studio-header-actions">
            <a
              className={`studio-header-hire ${scrolled ? "studio-header-hire--scrolled" : ""}`}
              href={`mailto:${profile.email}`}
            >
              Hire Me
            </a>
            <button
              className="studio-menu-button"
              type="button"
              onClick={() => setMenuOpen(current => !current)}
              aria-expanded={menuOpen}
              aria-controls="studio-mobile-nav"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="studio-mobile-nav"
            id="studio-mobile-nav"
            aria-label="Mobile navigation"
          >
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "true" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content">
        {isLoading && (
          <p className="studio-loading-notice" role="status">
            Loading portfolio content...
          </p>
        )}
        {isError && (
          <div className="studio-loading-notice" role="alert">
            <span>Portfolio content could not be loaded.</span>
            <button type="button" onClick={() => void refetch()}>
              Try again
            </button>
          </div>
        )}
        <section className="studio-hero" aria-labelledby="studio-hero-title">
          <div className="studio-container studio-hero-grid">
            <div className="studio-hero-copy">
              <p className="studio-hero-hello">Hi I am</p>
              <p className="studio-hero-name">{profile.name}</p>
              <h1 id="studio-hero-title">{profile.headline}</h1>

              <ul className="studio-hero-socials" aria-label="Social links">
                {profile.githubUrl && (
                  <li>
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <Github size={16} />
                    </a>
                  </li>
                )}
                {profile.linkedinUrl && (
                  <li>
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>
                  </li>
                )}
                <li>
                  <a href={`mailto:${profile.email}`} aria-label="Email">
                    <Mail size={16} />
                  </a>
                </li>
              </ul>

              <div className="studio-hero-ctas">
                <a
                  className="studio-button studio-button--primary"
                  href={`mailto:${profile.email}`}
                >
                  Hire Me
                </a>
                <a
                  className="studio-button studio-button--outline"
                  href={cvUrl}
                  download
                >
                  Download CV
                </a>
              </div>

              {heroStats.length > 0 && (
                <ul className="studio-hero-stats" aria-label="Highlights">
                  {heroStats.map(([count, label]) => (
                    <li key={label}>
                      <strong>{count}+</strong>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className="studio-hero-visual"
              onPointerMove={event => {
                if (event.pointerType === "touch") return;
                const bounds = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  "--cursor-x",
                  `${event.clientX - bounds.left}px`,
                );
                event.currentTarget.style.setProperty(
                  "--cursor-y",
                  `${event.clientY - bounds.top}px`,
                );
              }}
              onPointerLeave={event => {
                event.currentTarget.style.removeProperty("--cursor-x");
                event.currentTarget.style.removeProperty("--cursor-y");
              }}
            >
              <div className="studio-hero-disc" aria-hidden="true" />
              <img
                className="studio-hero-photo"
                src={heroPortrait}
                alt={`Portrait of ${profile.name}`}
                fetchPriority="high"
                decoding="async"
              />
              <img
                className="studio-hero-photo studio-hero-photo--color"
                src={heroPortrait}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section
          id="work"
          className="studio-work studio-section"
          aria-labelledby="studio-work-heading"
        >
          <div className="studio-container">
            <div className="studio-section-header">
              <h2 id="studio-work-heading">Projects</h2>
              <p>
                Product builds and experiments. Open any project for the
                screenshots, stack, and write-up.
              </p>
            </div>

            {categories.length > 1 && (
              <div
                className="studio-filters"
                role="group"
                aria-label="Filter projects by category"
              >
                <button
                  type="button"
                  className="studio-filter"
                  aria-pressed={filter === "All"}
                  onClick={() => setFilter("All")}
                >
                  All<small>{projects.length}</small>
                </button>
                {categories.map(([category, count]) => (
                  <button
                    key={category}
                    type="button"
                    className="studio-filter"
                    aria-pressed={filter === category}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                    <small>{count}</small>
                  </button>
                ))}
              </div>
            )}

            <ul className="studio-gallery" key={filter}>
              {visibleProjects.map((project, index) => (
                <li
                  className="studio-tile-wrap"
                  key={project.id}
                  style={{ ["--i" as string]: index }}
                >
                  <button
                    type="button"
                    className="studio-tile"
                    onClick={() => setPreviewIndex(index)}
                    aria-label={`Open ${project.title}`}
                  >
                    <span className="studio-tile-media">
                      <ProjectImage project={project} />
                      <span className="studio-tile-open" aria-hidden="true">
                        Preview
                      </span>
                    </span>
                    <span className="studio-tile-caption">
                      <span className="studio-tile-title">{project.title}</span>
                      <span className="studio-tile-cat">
                        {project.category}
                      </span>
                    </span>
                    <span className="studio-tile-summary">
                      {project.summary}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {visibleProjects.length === 0 && (
              <p className="studio-empty-state">
                Projects will appear here once they're published.
              </p>
            )}
          </div>
        </section>

        <section
          id="skills"
          className="studio-expertise studio-section"
          aria-labelledby="studio-skills-heading"
        >
          <div className="studio-container studio-expertise-grid">
            <div className="studio-expertise-heading">
              <h2 id="studio-skills-heading">What I work with</h2>
              <p>
                Different tools, same approach: understand the problem, pick
                what fits, and make the result reliable.
              </p>
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  className="studio-inline-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See my GitHub <ArrowUpRight size={16} />
                </a>
              )}
            </div>
            <div className="studio-skill-groups">
              {groupedSkills.map(([category, skills]) => (
                <div className="studio-skill-group" key={category}>
                  <h3>{category}</h3>
                  <ul>
                    {skills.map(skill => (
                      <li key={skill.id}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {groupedSkills.length === 0 && (
                <p className="studio-empty-state">Skills will be added soon.</p>
              )}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="studio-about studio-section"
          aria-labelledby="studio-about-heading"
        >
          <div className="studio-container studio-about-grid">
            <div className="studio-about-heading-block">
              <h2 id="studio-about-heading">How I work</h2>
              <p>{profile.bio}</p>
              <div className="studio-about-socials">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={17} /> GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={17} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
            <ol
              className="studio-approach-list"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {approach.map(([title, description], index) => (
                <li className="studio-approach-row" key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {portfolio.blogs.length > 0 && (
          <section
            id="notes"
            className="studio-journal studio-section"
            aria-labelledby="studio-notes-heading"
          >
            <div className="studio-container">
              <div className="studio-section-header">
                <h2 id="studio-notes-heading">Notes</h2>
                <p>Things I've learned while building and testing.</p>
              </div>
              <div className="studio-journal-list">
                {portfolio.blogs.map(blog => (
                  <button
                    type="button"
                    className="studio-journal-row"
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
                  >
                    <span className="studio-journal-date">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div>
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="collaborate"
          className="studio-collab"
          aria-labelledby="studio-collab-heading"
        >
          <div className="studio-container">
            <div className="studio-collab-head">
              <h2 id="studio-collab-heading">
                Let's <span>Collaborate</span>
              </h2>
              <p>Turning complex ideas into high-performance code.</p>
            </div>

            <div className="studio-collab-grid">
              <div className="studio-collab-side">
                <div className="studio-collab-card">
                  <p className="studio-collab-label">Current status</p>
                  <p className="studio-collab-status">
                    <span className="studio-collab-dot" aria-hidden="true" />
                    Available for Work
                  </p>
                </div>

                <div className="studio-collab-card">
                  <p className="studio-collab-label">Drop a line</p>
                  <a
                    className="studio-collab-email"
                    href={`mailto:${CONTACT_EMAIL}`}
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <ul
                    className="studio-collab-socials"
                    aria-label="Social links"
                  >
                    <li>
                      <a
                        href={profile.githubUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                      >
                        <Github size={22} />
                      </a>
                    </li>
                    <li>
                      <a
                        href={profile.linkedinUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={22} />
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="YouTube">
                        <Youtube size={22} />
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="Instagram">
                        <Instagram size={22} />
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="WhatsApp">
                        <MessageCircle size={22} />
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="studio-collab-card">
                  <p className="studio-collab-label">Location</p>
                  <p className="studio-collab-place">
                    Peshawar, Pakistan <small>PK</small>
                  </p>
                  <p className="studio-collab-note">Remote Available (UTC+5)</p>
                </div>
              </div>

              <form className="studio-collab-form" onSubmit={sendMessage}>
                <div className="studio-collab-row">
                  <label>
                    <span>
                      Name <b>*</b>
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your Name"
                    />
                  </label>
                  <label>
                    <span>
                      Email <b>*</b>
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your.email@example.com"
                    />
                  </label>
                </div>
                <label>
                  <span>Subject</span>
                  <div className="studio-collab-subject">
                    <input
                      name="subject"
                      type="text"
                      placeholder="Project Inquiry"
                    />
                    <Send size={18} aria-hidden="true" />
                  </div>
                </label>
                <label>
                  <span>
                    Message <b>*</b>
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="How can I help you?"
                  />
                </label>
                <input
                  type="text"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="studio-collab-honey"
                />
                <button
                  type="submit"
                  className="studio-collab-submit"
                  disabled={sendStatus === "sending"}
                >
                  {sendStatus === "sending"
                    ? "Sending..."
                    : sendStatus === "sent"
                      ? "Message sent"
                      : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="studio-cta"
          aria-labelledby="studio-contact-heading"
        >
          <div className="studio-container studio-cta-inner">
            <div className="studio-cta-copy">
              <span className="studio-cta-icon" aria-hidden="true">
                <Cpu size={26} strokeWidth={1.6} />
              </span>
              <div>
                <h2 id="studio-contact-heading">
                  Ready to build something amazing?
                </h2>
                <p>
                  Let's architect and launch your next high-performance Web or
                  Software solution together.
                </p>
              </div>
            </div>
            <a className="studio-cta-button" href="#collaborate">
              Start a Project <ArrowRight size={20} strokeWidth={2.4} />
            </a>
          </div>
        </section>
      </main>

      <footer className="studio-site-footer">
        <div className="studio-container studio-footer-grid">
          <div className="studio-footer-brand">
            <p className="studio-footer-arabic" lang="ar" dir="rtl">
              انور الحق
            </p>
            <p className="studio-footer-subname">{profile.name}</p>
            <p className="studio-footer-bio">
              Bridging the gap between <strong>Complex Logic</strong> and{" "}
              <strong>User Experience</strong>. I build software that is smart,
              scalable, and intuitive.
            </p>
            <PktClock />
            <ul className="studio-footer-socials" aria-label="Social links">
              <li>
                <a
                  href={profile.githubUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github size={22} />
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedinUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={22} />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram">
                  <Instagram size={22} />
                </a>
              </li>
              <li>
                <a href="#" aria-label="YouTube">
                  <Youtube size={22} />
                </a>
              </li>
            </ul>
          </div>

          <nav className="studio-footer-col" aria-label="Footer navigation">
            <h3>Navigation</h3>
            <ul>
              {footerNav.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="studio-footer-col">
            <h3>Expertise</h3>
            <ul className="studio-footer-expertise">
              {footerExpertise.map(item => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="studio-footer-col">
            <h3>Join the circle</h3>
            <p className="studio-footer-lead">
              Subscribe for project releases, web dev updates, and frontend
              engineering logs.
            </p>
            <form className="studio-subscribe" onSubmit={subscribe}>
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={event => setSubscribeEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
              />
              <button type="submit">Subscribe</button>
            </form>
            <ul className="studio-footer-contact">
              <li>
                <a href={`mailto:${profile.email}`}>
                  <Mail size={20} /> {profile.email}
                </a>
              </li>
              <li>
                <a href="#">
                  <MessageCircle size={20} /> Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="studio-footer-bottom">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </div>
      </footer>

      {/* Project preview: image stage, filmstrip, details. Arrow keys move through the current filter. */}
      <Dialog
        open={selectedProject !== null}
        onOpenChange={open => {
          if (!open) setPreviewIndex(null);
        }}
      >
        <DialogContent
          className="studio-dialog studio-preview"
          onKeyDown={event => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          {selectedProject && (
            <>
              <div className="studio-preview-visual">
                <div className="studio-preview-stage">
                  <ProjectImage
                    key={selectedProject.id}
                    project={selectedProject}
                  />
                  {visibleProjects.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="studio-preview-arrow studio-preview-arrow--prev"
                        onClick={() => step(-1)}
                        aria-label="Previous project"
                      >
                        <ArrowLeft size={19} />
                      </button>
                      <button
                        type="button"
                        className="studio-preview-arrow studio-preview-arrow--next"
                        onClick={() => step(1)}
                        aria-label="Next project"
                      >
                        <ArrowRight size={19} />
                      </button>
                    </>
                  )}
                </div>
                {visibleProjects.length > 1 && (
                  <div className="studio-preview-filmstrip">
                    {visibleProjects.map((project, index) => (
                      <button
                        type="button"
                        key={project.id}
                        className="studio-thumb"
                        aria-current={index === previewIndex}
                        aria-label={`Show ${project.title}`}
                        onClick={() => setPreviewIndex(index)}
                      >
                        <ProjectImage project={project} thumb />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="studio-preview-info">
                <DialogHeader>
                  <p className="studio-preview-category">
                    {selectedProject.category}
                  </p>
                  <DialogTitle>
                    {selectedCase?.title ?? selectedProject.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedProject.summary}
                  </DialogDescription>
                </DialogHeader>

                {selectedCase ? (
                  <div className="studio-case-chapters">
                    {[
                      ["Challenge", selectedCase.challenge],
                      ["Approach", selectedCase.approach],
                      ["Outcome", selectedCase.outcome],
                    ].map(([title, copy]) => (
                      <section key={title}>
                        <h3>{title}</h3>
                        <p>{copy}</p>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="studio-case-full-description">
                    {selectedProject.description}
                  </p>
                )}

                <div className="studio-preview-tech">
                  {techOf(selectedProject).map(tech => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>

                <div className="studio-preview-footer">
                  <div className="studio-preview-links">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live project <ArrowUpRight size={15} />
                      </a>
                    )}
                    {selectedProject.repoUrl && (
                      <a
                        href={selectedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github size={15} /> Source code
                      </a>
                    )}
                  </div>
                  <span className="studio-preview-count">
                    {(previewIndex ?? 0) + 1} of {visibleProjects.length}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedBlog)}
        onOpenChange={open => {
          if (!open) setSelectedBlog(null);
        }}
      >
        <DialogContent className="studio-dialog studio-article-dialog">
          {selectedBlog && (
            <>
              <DialogHeader>
                <p className="studio-preview-category">
                  {new Date(selectedBlog.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </p>
                <DialogTitle>{selectedBlog.title}</DialogTitle>
                <DialogDescription>{selectedBlog.excerpt}</DialogDescription>
              </DialogHeader>
              <div className="studio-article-content">
                {selectedBlog.content
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
              <a
                className="studio-inline-link"
                href={`mailto:${profile.email}?subject=${encodeURIComponent(`About: ${selectedBlog.title}`)}`}
              >
                <Mail size={16} /> Reply to this note
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
