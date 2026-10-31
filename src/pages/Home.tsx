import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  Menu,
  MapPin,
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

  const profile = data?.profile ?? fallbackProfile;
  const groupedSkills = useMemo(() => {
    const groups = new Map<string, PublicPortfolio["skills"]>();
    data?.skills.forEach(skill => groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]));
    return Array.from(groups.entries());
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
        <a href="#top" className="brand-mark" aria-label="Anwar Ul Haq, back to top"><span>A</span><b>UH</b></a>
        <nav className="pill-nav" aria-label="Main navigation">
          {navItems.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contact">Let’s talk <ArrowUpRight size={15} /></a>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[...navItems, { label: "Contact", href: "#contact" }].map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={16} /></a>)}
            <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin dashboard<ArrowUpRight size={16} /></Link>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid page-width">
            <div className="hero-copy">
              <div className="hero-status"><span className="status-pulse" />{profile.availability}</div>
              <p className="hero-name">{profile.name} — {profile.location}</p>
              <h1><span>FULL-STACK</span><span className="hero-outline">AI ENGINEER.</span></h1>
              <div className="hero-intro">
                <p>{profile.subheadline}. Building intelligent products from interface to infrastructure.</p>
                <a href="#work" className="round-link" aria-label="Explore selected work"><ArrowDown size={23} /></a>
              </div>
            </div>
            <div className="hero-portrait-wrap" data-reveal>
              <div className="portrait-backdrop" />
              <img className="hero-portrait" src={profile.avatarUrl || fallbackProfile.avatarUrl} alt={`${profile.name}, ${profile.headline}`} />
              <div className="hero-code-note">
                <div><span className="code-dot" /><span className="code-dot" /><span className="code-dot" /></div>
                <p><span>focus</span>: [</p>
                <p>&nbsp;&nbsp;"applied_ai",</p>
                <p>&nbsp;&nbsp;"full_stack"</p>
                <p>]</p>
              </div>
              <div className="portrait-caption"><span>Based in</span><strong>{profile.location}</strong><MapPin size={16} /></div>
            </div>
          </div>
          <div className="hero-stats page-width">
            <div><strong>15</strong><span>Public GitHub repositories</span></div>
            <div><strong>{String(data.projects.length).padStart(2, "0")}</strong><span>Selected product builds</span></div>
            <div><strong>02</strong><span>Engineering disciplines, one workflow</span></div>
            <p>Build. Understand.<br />Evaluate. Improve.</p>
          </div>
        </section>

        <section id="work" className="work-section section-space">
          <div className="page-width section-heading" data-reveal>
            <p className="mono-label">01 / SELECTED WORK</p>
            <h2>Products with a purpose.<br /><span>Systems built to last.</span></h2>
            <p>From AI automation to social-impact platforms, each build connects thoughtful interfaces with dependable engineering.</p>
          </div>
          <div className="project-list page-width">
            {leadProjects.map((project, index) => (
              <article className="project-showcase" key={project.id}>
                <div className="project-title-row">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3 data-project-title>{project.title}</h3>
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
              <h3>More engineering work</h3>
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
        </section>

        <section id="expertise" className="expertise-section section-space">
          <div className="page-width expertise-layout">
            <div className="expertise-intro" data-reveal>
              <p className="mono-label">02 / TECHNICAL RANGE</p>
              <h2>Beyond<br />the stack.</h2>
              <p>Frameworks are tools. The real work is choosing the right architecture, understanding the data, and shipping a coherent product.</p>
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-link">Explore GitHub <ArrowUpRight size={17} /></a>
            </div>
            <div className="skill-matrix">
              {groupedSkills.map(([category, categorySkills], groupIndex) => (
                <div className="skill-group" key={category} data-reveal data-delay={groupIndex * 60}>
                  <div className="skill-group-heading"><h3>{category}</h3><span>{String(categorySkills.length).padStart(2, "0")}</span></div>
                  {categorySkills.map(skill => (
                    <div className="skill-row" key={skill.id}>
                      <div><span>{skill.name}</span><span>{skill.level}%</span></div>
                      <div className="skill-track"><span style={{ width: `${skill.level}%` }} /></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about-section section-space">
          <div className="page-width">
            <p className="mono-label" data-reveal>03 / ENGINEERING MINDSET</p>
            <div className="about-statement" data-reveal>
              <h2>“The goal is not simply to use frameworks. It’s to understand how to build, test, evaluate, and improve real applications.”</h2>
            </div>
            <div className="about-grid">
              <div className="about-bio" data-reveal>
                <span className="about-initials">AUH</span>
                <p>{profile.bio}</p>
                <div className="about-socials">
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a>
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={17} />GitHub</a>
                </div>
              </div>
              <div className="principles-list">
                {[
                  ["Build with purpose", "Focus on meaningful problems rather than unnecessary complexity."],
                  ["Engineer for reliability", "Value validation, testing, maintainability, and clear architecture."],
                  ["Learn in public", "Share practical lessons, experiments, and improvements."],
                ].map(([title, copy], index) => (
                  <div className="principle" key={title} data-reveal data-delay={index * 70}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="journal" className="journal-section section-space">
          <div className="page-width section-heading journal-heading" data-reveal>
            <p className="mono-label">04 / FIELD NOTES</p>
            <h2>Thinking in systems.<br /><span>Writing with intent.</span></h2>
          </div>
          <div className="page-width article-list">
            {data.blogs.map((blog, index) => (
              <button className="article-row" key={blog.id} onClick={() => setSelectedBlog(blog)} data-reveal data-delay={index * 60}>
                <span className="article-index">{String(index + 1).padStart(2, "0")}</span>
                <div><p>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · Engineering notes</p><h3>{blog.title}</h3><span>{blog.excerpt}</span></div>
                <span className="article-arrow"><ArrowUpRight size={22} /></span>
              </button>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="page-width contact-inner" data-reveal>
            <p className="mono-label">05 / START A CONVERSATION</p>
            <h2>Have an idea?<br /><span>Let’s engineer it.</span></h2>
            <div className="contact-actions">
              <a className="contact-primary" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={25} /></a>
              <button className="copy-button" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={20} /> : <Copy size={20} />}{copied ? "Copied" : "Copy email"}</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <div className="brand-mark"><span>A</span><b>UH</b></div>
        <p>Full-stack development × Applied AI<br />© {new Date().getFullYear()} {profile.name}</p>
        <div className="footer-links"><a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a><a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a><Link to="/admin">Admin</Link><a href="#top">Back to top ↑</a></div>
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
