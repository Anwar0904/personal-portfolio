import { useEffect, useMemo, useState } from "react";
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
import { ProjectArtwork } from "@/components/ProjectArtwork";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePortfolioMotion } from "@/hooks/usePortfolioMotion";
import { trpc, type PublicPortfolio, type PortfolioProject } from "@/providers/trpc";

const fallbackProfile = {
  name: "Anwar Ul Haq",
  headline: "Full-Stack AI Engineer",
  subheadline: "MERN Stack Developer · AI Engineer",
  bio: "I build practical, reliable software across full-stack web development and applied artificial intelligence.",
  location: "Pakistan",
  email: "au090469@gmail.com",
  avatarUrl: "/images/anwar-avatar.png",
  linkedinUrl: "https://www.linkedin.com/in/anwar-42khan/",
  githubUrl: "https://github.com/Anwar0904",
  availability: "Building intelligent software, end to end.",
};

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Expertise", href: "#expertise" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
];

type Blog = PublicPortfolio["blogs"][number];

export default function Home() {
  const { data, isLoading, isError, refetch } = trpc.portfolio.public.useQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [copied, setCopied] = useState(false);

  usePortfolioMotion(data?.projects.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const profile = data?.profile ?? fallbackProfile;
  const groupedSkills = useMemo(() => {
    const groups = new Map<string, PublicPortfolio["skills"]>();
    const categories: Record<string, string> = {
      Frontend: "Frontend Engineering",
      Backend: "Backend & APIs",
      "AI & Data": "Applied AI & Machine Learning",
      Data: "Databases & Infrastructure",
      Languages: "Languages & Developer Tooling",
      Tools: "Languages & Developer Tooling",
    };
    data?.skills.forEach(skill => {
      const category = categories[skill.category] ?? skill.category;
      groups.set(category, [...(groups.get(category) ?? []), skill]);
    });
    const order = [
      "Frontend Engineering",
      "Backend & APIs",
      "Applied AI & Machine Learning",
      "Databases & Infrastructure",
      "Languages & Developer Tooling",
    ];
    return Array.from(groups.entries()).sort(([first], [second]) => {
      const firstIndex = order.indexOf(first);
      const secondIndex = order.indexOf(second);
      if (firstIndex === -1 && secondIndex === -1) return first.localeCompare(second);
      return (firstIndex === -1 ? order.length : firstIndex) - (secondIndex === -1 ? order.length : secondIndex);
    });
  }, [data?.skills]);

  const leadProjects = useMemo(() => {
    if (!data) return [];
    const featured = data.projects.filter(project => project.featured);
    return (featured.length ? featured : data.projects.slice(0, 3)).slice(0, 4);
  }, [data]);
  const otherProjects = useMemo(() => data?.projects.filter(project => !leadProjects.some(lead => lead.id === project.id)) ?? [], [data, leadProjects]);
  const selectedCase = selectedProject ? data?.caseStudies.find(item => item.projectId === selectedProject.id) : undefined;

  const copyEmail = async () => {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    toast.success("Email copied to clipboard");
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) return <PortfolioLoader />;
  if (isError || !data) return <PortfolioError onRetry={() => void refetch()} />;

  return (
    <div className="portfolio-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="brand-mark" aria-label={`${profile.name}, back to top`}><span>anwar</span><b>.</b></a>
        <nav className="pill-nav" aria-label="Main navigation">
          {navItems.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contact">Get in touch <ArrowUpRight size={15} /></a>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!menuOpen}>
          {[...navItems, { label: "Contact", href: "#contact" }].map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={16} /></a>)}
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid page-width">
            <div className="hero-copy">
              <p className="hero-name">{profile.location} · {profile.headline}</p>
              <h1>Building useful software, thoughtfully.</h1>
              <div className="hero-intro">
                <p>I’m {profile.name}, focused on full-stack web applications and applied AI. I work from the first interface through the systems that make a product dependable.</p>
              </div>
              <div className="hero-actions">
                <a className="button-primary" href="#work">View projects <ArrowRight size={17} /></a>
                <a className="button-secondary" href="#contact">Get in touch <ArrowUpRight size={17} /></a>
              </div>
              <p className="hero-availability">{profile.availability}</p>
            </div>
            <div className="hero-portrait-wrap" data-reveal>
              <img className="hero-portrait" src={profile.avatarUrl || fallbackProfile.avatarUrl} alt={`Portrait of ${profile.name}`} />
              <p className="portrait-caption">Full-stack development <span aria-hidden="true">·</span> Applied AI</p>
            </div>
          </div>
        </section>

        <section id="work" className="work-section section-space">
          <div className="page-width section-heading" data-reveal>
            <p className="mono-label">Selected work</p>
            <h2>Projects shaped around<br /><span>real problems.</span></h2>
            <p>A selection of product and engineering work, from AI-assisted workflows to community platforms.</p>
          </div>
          <div className="project-list page-width">
            {leadProjects.map((project, index) => (
              <article className="project-showcase" key={project.id}>
                <div className="project-title-row">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{project.title}</h3>
                  <p>{project.category}</p>
                </div>
                <div className={`project-body ${index % 2 ? "project-reverse" : ""}`}>
                  <button className="project-visual-button" onClick={() => setSelectedProject(project)} aria-label={`Open ${project.title} case study`} data-reveal>
                    <ProjectArtwork project={project} />
                  </button>
                  <div className="project-summary" data-reveal>
                    <p className="project-lead">{project.summary}</p>
                    <div className="tech-list">{project.technologies.split(",").filter(Boolean).map(tech => <span key={tech.trim()}>{tech.trim()}</span>)}</div>
                    <div className="project-links">
                      <button className="text-link" onClick={() => setSelectedProject(project)}>Read case study <ArrowRight size={17} /></button>
                      {project.liveUrl && <a className="icon-text-link" href={project.liveUrl} target="_blank" rel="noreferrer">Live project <ArrowUpRight size={16} /></a>}
                      {project.repoUrl && <a className="icon-text-link" href={project.repoUrl} target="_blank" rel="noreferrer">Source <Github size={15} /></a>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {otherProjects.length > 0 && (
            <div className="other-work page-width" data-reveal>
              <h3>More projects</h3>
              {otherProjects.map(project => (
                <div className="other-work-row" key={project.id}>
                  <div><span>{project.category}</span><h4>{project.title}</h4></div>
                  <p>{project.summary}</p>
                  <div className="other-work-actions">
                    <button onClick={() => setSelectedProject(project)} aria-label={`Read about ${project.title}`}><ArrowRight size={19} /></button>
                    {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label={`Visit ${project.title}`}><ArrowUpRight size={19} /></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {leadProjects.length === 0 && <p className="empty-message page-width">Projects will be added here soon.</p>}
        </section>

        <section id="expertise" className="expertise-section section-space">
          <div className="page-width expertise-layout">
            <div className="expertise-intro" data-reveal>
              <p className="mono-label">Areas of practice</p>
              <h2>Tools for<br />the work.</h2>
              <p>My day-to-day skills span interface engineering, APIs, data, and applied AI. The technologies below come from my current portfolio profile.</p>
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-link">Explore GitHub <ArrowUpRight size={17} /></a>
            </div>
            <div className="skill-matrix">
              {groupedSkills.map(([category, categorySkills], groupIndex) => (
                <div className="skill-group" key={category} data-reveal data-delay={groupIndex * 60}>
                  <div className="skill-group-heading"><h3>{category}</h3></div>
                  <ul className="skill-tags">
                    {categorySkills.map(skill => <li key={skill.id}>{skill.name}</li>)}
                  </ul>
                </div>
              ))}
              {groupedSkills.length === 0 && <p className="empty-message">Technical skills will be added here soon.</p>}
            </div>
          </div>
        </section>

        <section id="about" className="about-section section-space">
          <div className="page-width">
            <p className="mono-label" data-reveal>A little about how I work</p>
            <div className="about-statement" data-reveal>
              <h2>I enjoy working across the full product cycle: shaping an interface, understanding the data, and making the systems behind it reliable.</h2>
            </div>
            <div className="about-grid">
              <div className="about-bio" data-reveal>
                <h3>{profile.name}</h3>
                <p>{profile.bio}</p>
                <div className="about-socials">
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a>
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={17} />GitHub</a>
                </div>
              </div>
              <div className="principles-list">
                {[
                  ["Start with the problem", "Understand what a product needs to do before adding complexity."],
                  ["Make the details dependable", "Treat validation, maintainability, and clear architecture as part of the user experience."],
                  ["Keep learning", "Use each build to test ideas, improve the work, and share useful lessons."],
                ].map(([title, copy], index) => (
                  <div className="principle" key={title} data-reveal data-delay={index * 70}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="journal" className="journal-section section-space">
          <div className="page-width section-heading journal-heading" data-reveal>
            <p className="mono-label">Journal</p>
            <h2>Notes from the<br /><span>work in progress.</span></h2>
          </div>
          <div className="page-width article-list">
            {data.blogs.map((blog, index) => (
              <button className="article-row" key={blog.id} onClick={() => setSelectedBlog(blog)} data-reveal data-delay={index * 60}>
                <span className="article-index">{String(index + 1).padStart(2, "0")}</span>
                <div><p>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · Engineering notes</p><h3>{blog.title}</h3><span>{blog.excerpt}</span></div>
                <span className="article-arrow"><ArrowUpRight size={22} /></span>
              </button>
            ))}
            {data.blogs.length === 0 && <p className="empty-message">No journal entries have been published yet.</p>}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="page-width contact-inner" data-reveal>
            <p className="mono-label">Contact</p>
            <h2>Let’s talk about<br /><span>what you’re building.</span></h2>
            <div className="contact-actions">
              <a className="contact-primary" href={`mailto:${profile.email}`}>Email Anwar <ArrowUpRight size={21} /></a>
              <button className="copy-button" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={20} /> : <Copy size={20} />}{copied ? "Copied" : "Copy email"}</button>
              <span className="contact-email">{profile.email}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <a href="#top" className="brand-mark" aria-label={`${profile.name}, back to top`}><span>anwar</span><b>.</b></a>
        <p>Full-stack development · Applied AI<br />© {new Date().getFullYear()} {profile.name}</p>
        <div className="footer-links"><a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a><a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a><a href="#top">Back to top ↑</a></div>
      </footer>

      <Dialog open={!!selectedProject} onOpenChange={open => !open && setSelectedProject(null)}>
        <DialogContent className="case-dialog">
          {selectedProject && (
            <>
              <DialogHeader className="case-dialog-header">
                <p className="mono-label">{selectedProject.category}</p>
                <DialogTitle>{selectedCase?.title ?? selectedProject.title}</DialogTitle>
                <DialogDescription>{selectedProject.summary}</DialogDescription>
              </DialogHeader>
              <div className="case-dialog-scroll">
                <ProjectArtwork project={selectedProject} compact />
                {selectedCase ? (
                  <div className="case-chapters">
                    {[["The challenge", selectedCase.challenge], ["The approach", selectedCase.approach], ["The outcome", selectedCase.outcome]].map(([title, copy], index) => (
                      <section key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></section>
                    ))}
                  </div>
                ) : <p className="case-description">{selectedProject.description}</p>}
                <div className="case-dialog-footer">
                  <div className="tech-list">{selectedProject.technologies.split(",").filter(Boolean).map(tech => <span key={tech.trim()}>{tech.trim()}</span>)}</div>
                  <div>{selectedProject.repoUrl && <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer"><Github size={17} />View source</a>}{selectedProject.liveUrl && <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer">Visit live project<ArrowUpRight size={17} /></a>}</div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedBlog} onOpenChange={open => !open && setSelectedBlog(null)}>
        <DialogContent className="article-dialog">
          {selectedBlog && (
            <>
              <DialogHeader>
                <p className="mono-label">ENGINEERING NOTES · {new Date(selectedBlog.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                <DialogTitle>{selectedBlog.title}</DialogTitle>
                <DialogDescription>{selectedBlog.excerpt}</DialogDescription>
              </DialogHeader>
              <div className="article-content">{selectedBlog.content.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
              <a className="article-back" href={`mailto:${profile.email}?subject=${encodeURIComponent(`About: ${selectedBlog.title}`)}`}><Mail size={16} />Discuss this note</a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PortfolioLoader() {
  return <div className="portfolio-state"><div className="loader-mark">A<span>UH</span></div><div className="loader-line"><span /></div><p>Assembling the portfolio…</p></div>;
}

function PortfolioError({ onRetry }: { onRetry: () => void }) {
  return <div className="portfolio-state"><p className="mono-label">CONNECTION INTERRUPTED</p><h1>The portfolio couldn’t load.</h1><p>Please check the connection and try again.</p><button onClick={onRetry}><ArrowLeft size={17} />Try again</button></div>;
}
