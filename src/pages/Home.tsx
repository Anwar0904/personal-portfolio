import { useEffect, useMemo, useState, type PointerEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
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

const fallbackStack = ["React", "Node.js", "TypeScript", "Python"];

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

export default function Home() {
  const { data, isLoading, isError, refetch } =
    trpc.portfolio.public.useQuery(undefined, {
      retry: false,
      staleTime: 60_000,
    });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("All");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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

  const heroStack = useMemo(() => {
    const names = portfolio.skills.slice(0, 4).map(skill => skill.name);
    return names.length ? names : fallbackStack;
  }, [portfolio.skills]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      toast.success("Email copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Use the email link instead.");
    }
  };

  // Pointer tilt for the 3D hero. Mouse only; touch devices keep the resting pose.
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
  };
  const resetTilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty("--ry");
    event.currentTarget.style.removeProperty("--rx");
  };

  const navItems = [
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "About", href: "#about" },
    ...(portfolio.blogs.length ? [{ label: "Notes", href: "#notes" }] : []),
  ];

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
            className="studio-logo"
            href="#top"
            aria-label={`${profile.name}, back to top`}
          >
            anwar<span className="studio-logo-dot">.</span>
            <span className="studio-logo-suffix">dev</span>
          </a>
          <nav className="studio-desktop-nav" aria-label="Main navigation">
            {navItems.map(item => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="studio-header-actions">
            <a className="studio-header-contact" href="#contact">
              Contact
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
            {[...navItems, { label: "Contact", href: "#contact" }].map(item => (
              <a
                key={item.href}
                href={item.href}
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
              <p className="studio-hero-name">Hi, I'm {profile.name}.</p>
              <h1 id="studio-hero-title">
                I build full-stack web apps and the AI inside them.
              </h1>
              <p className="studio-hero-description">{profile.bio}</p>
              <div className="studio-hero-ctas">
                <a
                  className="studio-button studio-button--primary"
                  href="#work"
                >
                  View projects
                </a>
                <a
                  className="studio-button studio-button--text"
                  href="#contact"
                >
                  Get in touch
                </a>
              </div>
            </div>

            <div
              className="studio-scene"
              onPointerMove={tilt}
              onPointerLeave={resetTilt}
            >
              <div className="studio-stage">
                <div
                  className="studio-layer studio-layer--plate"
                  aria-hidden="true"
                >
                  <div />
                </div>
                <div className="studio-layer studio-layer--photo">
                  <img
                    src={profile.avatarUrl || fallbackProfile.avatarUrl}
                    alt={`Portrait of ${profile.name}`}
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div
                  className="studio-layer studio-layer--code"
                  aria-hidden="true"
                >
                  <div className="studio-code-bar">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="studio-code-body">
                    <p>
                      <span className="k">const</span> dev = {"{"}
                    </p>
                    <p className="indent">
                      role: <span className="s">"{profile.headline}"</span>,
                    </p>
                    <p className="indent">
                      based: <span className="s">"{profile.location}"</span>,
                    </p>
                    <p>{"}"}</p>
                  </div>
                </div>
                <ul
                  className="studio-layer studio-layer--stack"
                  aria-label="Core stack"
                  style={{ listStyle: "none", margin: 0 }}
                >
                  {heroStack.map(name => (
                    <li key={name} style={{ display: "contents" }}>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
                <div className="studio-layer studio-layer--label">
                  <strong>{profile.name}</strong>
                  <span>{profile.headline}</span>
                </div>
              </div>
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
          id="contact"
          className="studio-contact"
          aria-labelledby="studio-contact-heading"
        >
          <div className="studio-container studio-contact-main">
            <h2 id="studio-contact-heading">Let's build something together.</h2>
            <p className="studio-contact-lead">
              Tell me what you're working on or what's getting in the way. I
              usually reply within a couple of days.
            </p>
            <div className="studio-contact-actions">
              <a
                href={`mailto:${profile.email}`}
                className="studio-contact-email"
              >
                {profile.email}
              </a>
              <button
                type="button"
                className="studio-copy-button"
                onClick={copyEmail}
                aria-label="Copy email address"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <footer className="studio-container studio-footer">
            <a
              href="#top"
              className="studio-footer-logo"
              aria-label="Back to top"
            >
              anwar<span>.</span>dev
            </a>
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <div className="studio-footer-links">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              <a href="#top">Back to top</a>
            </div>
          </footer>
        </section>
      </main>

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
