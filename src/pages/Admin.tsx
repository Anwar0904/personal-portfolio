import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  FileStack,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { EntityManager, type AdminItem, type EntityConfig, type EntityType, type FormRecord } from "@/components/admin/EntityManager";
import { useAuth } from "@/hooks/useAuth";
import { trpc, type AdminPortfolio } from "@/providers/trpc";

type Tab = "overview" | EntityType | "profile";
type ProfileFormValue = {
  name: string;
  headline: string;
  subheadline: string;
  bio: string;
  location: string;
  email: string;
  avatarUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  availability: string;
};

const emptyProfile: ProfileFormValue = {
  name: "", headline: "", subheadline: "", bio: "", location: "", email: "", avatarUrl: "", linkedinUrl: "", githubUrl: "", availability: "",
};

const tabs = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "projects" as const, label: "Projects", icon: BriefcaseBusiness },
  { id: "skills" as const, label: "Skills", icon: Boxes },
  { id: "caseStudies" as const, label: "Case studies", icon: FileStack },
  { id: "blogs" as const, label: "Blog posts", icon: BookOpenText },
  { id: "profile" as const, label: "Profile settings", icon: UserRound },
];

const asItems = (rows: readonly unknown[]) => rows as unknown as AdminItem[];

export default function Admin() {
  const { user, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const hash = window.location.hash.slice(1) as Tab;
    return tabs.some(tab => tab.id === hash) ? hash : "overview";
  });
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";
  const { data, isLoading: contentLoading, isError, refetch } = trpc.portfolio.admin.useQuery(undefined, { enabled: isAdmin });

  const onSuccess = (message: string) => async () => {
    await Promise.all([utils.portfolio.admin.invalidate(), utils.portfolio.public.invalidate()]);
    toast.success(message);
  };
  const onError = (error: { message: string }) => toast.error(error.message);
  const saveProject = trpc.portfolio.saveProject.useMutation({ onSuccess: onSuccess("Project saved"), onError });
  const saveSkill = trpc.portfolio.saveSkill.useMutation({ onSuccess: onSuccess("Skill saved"), onError });
  const saveCaseStudy = trpc.portfolio.saveCaseStudy.useMutation({ onSuccess: onSuccess("Case study saved"), onError });
  const saveBlog = trpc.portfolio.saveBlog.useMutation({ onSuccess: onSuccess("Blog post saved"), onError });
  const deleteProject = trpc.portfolio.deleteProject.useMutation({ onSuccess: onSuccess("Project deleted"), onError });
  const deleteSkill = trpc.portfolio.deleteSkill.useMutation({ onSuccess: onSuccess("Skill deleted"), onError });
  const deleteCaseStudy = trpc.portfolio.deleteCaseStudy.useMutation({ onSuccess: onSuccess("Case study deleted"), onError });
  const deleteBlog = trpc.portfolio.deleteBlog.useMutation({ onSuccess: onSuccess("Blog post deleted"), onError });
  const updateProfile = trpc.portfolio.updateProfile.useMutation({ onSuccess: onSuccess("Profile updated"), onError });

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `/admin#${tab}`);
  };

  const onSave = async (entity: EntityType, value: FormRecord) => {
    if (entity === "projects") return saveProject.mutateAsync(value as never);
    if (entity === "skills") return saveSkill.mutateAsync(value as never);
    if (entity === "caseStudies") return saveCaseStudy.mutateAsync(value as never);
    return saveBlog.mutateAsync(value as never);
  };
  const onDelete = async (entity: EntityType, id: number) => {
    if (entity === "projects") return deleteProject.mutateAsync({ id });
    if (entity === "skills") return deleteSkill.mutateAsync({ id });
    if (entity === "caseStudies") return deleteCaseStudy.mutateAsync({ id });
    return deleteBlog.mutateAsync({ id });
  };

  const configs = useMemo<EntityConfig[]>(() => [
    {
      entity: "projects", title: "Projects", singular: "project", description: "Manage the work showcased across the public portfolio.",
      defaults: { title: "", slug: "", summary: "", description: "", category: "Full-Stack", technologies: "", imageUrl: "", liveUrl: "", repoUrl: "", featured: true, published: true, sortOrder: data?.projects.length ?? 0 },
      secondary: item => `${String(item.category)} · ${String(item.technologies || "No technologies listed")}`,
      fields: [
        { name: "title", label: "Project title", kind: "text", required: true }, { name: "slug", label: "URL slug (optional)", kind: "text", placeholder: "generated-from-title" },
        { name: "category", label: "Category", kind: "text", required: true }, { name: "sortOrder", label: "Display order", kind: "number", min: 0, max: 9999, required: true },
        { name: "summary", label: "Short summary", kind: "textarea", required: true, placeholder: "A concise project pitch" },
        { name: "description", label: "Full description", kind: "textarea", required: true },
        { name: "technologies", label: "Technologies (comma separated)", kind: "text", full: true, placeholder: "Next.js, TypeScript, MongoDB" },
        { name: "imageUrl", label: "Cover image URL or local /images path", kind: "text", full: true },
        { name: "liveUrl", label: "Live project URL", kind: "url" }, { name: "repoUrl", label: "Repository URL", kind: "url" },
        { name: "featured", label: "Feature in selected work", kind: "switch" }, { name: "published", label: "Publish publicly", kind: "switch" },
      ],
    },
    {
      entity: "skills", title: "Skills", singular: "skill", description: "Maintain your technical matrix and proficiency indicators.",
      defaults: { name: "", category: "Frontend", level: 80, featured: true, published: true, sortOrder: data?.skills.length ?? 0 },
      secondary: item => `${String(item.category)} · Proficiency ${String(item.level)}%`,
      fields: [
        { name: "name", label: "Skill name", kind: "text", required: true }, { name: "category", label: "Category", kind: "text", required: true },
        { name: "level", label: "Proficiency (0–100)", kind: "number", min: 0, max: 100, required: true }, { name: "sortOrder", label: "Display order", kind: "number", min: 0, max: 9999, required: true },
        { name: "featured", label: "Feature skill", kind: "switch" }, { name: "published", label: "Publish publicly", kind: "switch" },
      ],
    },
    {
      entity: "caseStudies", title: "Case studies", singular: "case study", description: "Tell the challenge, approach, and outcome behind your builds.",
      defaults: { projectId: null, title: "", slug: "", challenge: "", approach: "", outcome: "", imageUrl: "", published: true },
      secondary: item => item.projectId ? `Linked to ${data?.projects.find(project => project.id === item.projectId)?.title ?? "project"}` : "Standalone case study",
      fields: [
        { name: "title", label: "Case study title", kind: "text", required: true, full: true }, { name: "slug", label: "URL slug (optional)", kind: "text" },
        { name: "projectId", label: "Linked project", kind: "select", nullable: true, options: data?.projects.map(project => ({ label: project.title, value: project.id })) ?? [] },
        { name: "imageUrl", label: "Cover image URL or local /images path", kind: "text", full: true },
        { name: "challenge", label: "The challenge", kind: "textarea", required: true }, { name: "approach", label: "The approach", kind: "textarea", required: true },
        { name: "outcome", label: "The outcome", kind: "textarea", required: true }, { name: "published", label: "Publish publicly", kind: "switch" },
      ],
    },
    {
      entity: "blogs", title: "Blog posts", singular: "blog post", description: "Publish engineering notes, lessons, and technical perspectives.",
      defaults: { title: "", slug: "", excerpt: "", content: "", coverUrl: "", published: true },
      secondary: item => String(item.excerpt),
      fields: [
        { name: "title", label: "Post title", kind: "text", required: true, full: true }, { name: "slug", label: "URL slug (optional)", kind: "text", full: true },
        { name: "excerpt", label: "Excerpt", kind: "textarea", required: true }, { name: "content", label: "Article content", kind: "textarea", required: true, placeholder: "Separate paragraphs with a blank line" },
        { name: "coverUrl", label: "Cover image URL or local /images path", kind: "text", full: true }, { name: "published", label: "Publish publicly", kind: "switch" },
      ],
    },
  ], [data]);

  if (isLoading) return <AdminLoading />;
  if (!user) return null;
  if (!isAdmin) return <AccessDenied onLogout={logout} />;

  const saving = saveProject.isPending || saveSkill.isPending || saveCaseStudy.isPending || saveBlog.isPending;
  const activeConfig = configs.find(config => config.entity === activeTab);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand"><span>A</span><b>UH</b><small>STUDIO</small></Link>
        <div className="admin-workspace-label">PORTFOLIO WORKSPACE</div>
        <nav aria-label="Admin navigation">
          {tabs.map(tab => <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => selectTab(tab.id)}><tab.icon size={18} /><span>{tab.label}</span>{tab.id !== "overview" && tab.id !== "profile" && data && <small>{data[tab.id].length}</small>}</button>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/" target="_blank">View public portfolio<ArrowUpRight size={16} /></Link>
          <div className="admin-user"><span>{user.name?.slice(0, 1).toUpperCase() ?? "A"}</span><div><strong>{user.name ?? "Administrator"}</strong><small>{user.email ?? "Admin account"}</small></div><button onClick={logout} aria-label="Sign out"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-mobile-nav"><div>{tabs.map(tab => <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}</div></div>
        {contentLoading ? <AdminLoading /> : isError || !data ? (
          <div className="admin-error"><Settings2 size={32} /><h1>Workspace unavailable</h1><p>The content service could not be reached.</p><button onClick={() => void refetch()}>Try again</button></div>
        ) : activeTab === "overview" ? (
          <Overview data={data} onSelect={selectTab} />
        ) : activeTab === "profile" ? (
          <ProfileForm profile={data.profile} saving={updateProfile.isPending} onSave={value => updateProfile.mutateAsync(value)} />
        ) : activeConfig ? (
          <EntityManager key={activeConfig.entity} config={activeConfig} rows={asItems(data[activeConfig.entity])} saving={saving} onSave={onSave} onDelete={onDelete} />
        ) : null}
      </main>
    </div>
  );
}

function Overview({ data, onSelect }: { data: AdminPortfolio; onSelect: (tab: Tab) => void }) {
  const counts = [
    { label: "Projects", value: data.projects.length, published: data.projects.filter(item => item.published).length, tab: "projects" as const, icon: BriefcaseBusiness },
    { label: "Skills", value: data.skills.length, published: data.skills.filter(item => item.published).length, tab: "skills" as const, icon: Boxes },
    { label: "Case studies", value: data.caseStudies.length, published: data.caseStudies.filter(item => item.published).length, tab: "caseStudies" as const, icon: FileStack },
    { label: "Blog posts", value: data.blogs.length, published: data.blogs.filter(item => item.published).length, tab: "blogs" as const, icon: BookOpenText },
  ];
  return (
    <section className="admin-panel admin-overview">
      <div className="admin-panel-heading"><div><p className="admin-kicker">WORKSPACE OVERVIEW</p><h1>Good work deserves a clear home.</h1><p>Manage every public-facing detail from one focused workspace.</p></div><Link className="admin-primary-button" to="/" target="_blank">View portfolio<ArrowUpRight size={17} /></Link></div>
      <div className="overview-metrics">{counts.map(count => <button key={count.label} onClick={() => onSelect(count.tab)}><div><count.icon size={20} /><span>{count.published} published</span></div><strong>{String(count.value).padStart(2, "0")}</strong><p>{count.label}</p><ArrowUpRight size={18} /></button>)}</div>
      <div className="overview-grid">
        <div className="overview-recent"><div className="overview-section-title"><div><p className="admin-kicker">RECENT WORK</p><h2>Project library</h2></div><button onClick={() => onSelect("projects")}>Manage all<ArrowUpRight size={15} /></button></div>{data.projects.slice(0, 4).map(project => <button className="overview-project" key={project.id} onClick={() => onSelect("projects")}><span>{project.category}</span><strong>{project.title}</strong><small>{project.published ? "Published" : "Draft"}</small><ArrowUpRight size={17} /></button>)}</div>
        <div className="overview-quick"><p className="admin-kicker">QUICK ACTIONS</p><h2>Keep it current.</h2><p>A current portfolio builds trust. Add your latest build, refresh your skills, or publish what you’ve learned.</p>{[{ label: "Manage projects", tab: "projects" as const }, { label: "Write a blog post", tab: "blogs" as const }, { label: "Update profile", tab: "profile" as const }].map(action => <button key={action.label} onClick={() => onSelect(action.tab)}><Plus size={16} />{action.label}<ArrowUpRight size={15} /></button>)}</div>
      </div>
    </section>
  );
}

function ProfileForm({ profile, saving, onSave }: { profile: AdminPortfolio["profile"]; saving: boolean; onSave: (value: ProfileFormValue) => Promise<unknown> }) {
  const [form, setForm] = useState<ProfileFormValue>(emptyProfile);
  useEffect(() => {
    if (profile) setForm({ name: profile.name, headline: profile.headline, subheadline: profile.subheadline, bio: profile.bio, location: profile.location, email: profile.email, avatarUrl: profile.avatarUrl, linkedinUrl: profile.linkedinUrl, githubUrl: profile.githubUrl, availability: profile.availability });
  }, [profile]);
  const update = (key: keyof ProfileFormValue, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await onSave(form); } catch { /* handled by mutation */ } };
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading"><div><p className="admin-kicker">PERSONAL DETAILS</p><h1>Profile settings</h1><p>Update the identity, introduction, and contact links used across the portfolio.</p></div></div>
      <form className="profile-editor" onSubmit={submit}>
        <div className="profile-preview"><img src={form.avatarUrl || "/images/anwar-avatar.png"} alt="Profile preview" /><strong>{form.name || "Your name"}</strong><span>{form.headline || "Your headline"}</span><small>Public profile preview</small></div>
        <div className="profile-fields admin-form-grid">
          {[
            ["name", "Display name", "text"], ["headline", "Professional headline", "text"], ["subheadline", "Role summary", "text"], ["location", "Location", "text"], ["email", "Contact email", "email"], ["availability", "Hero status line", "text"], ["avatarUrl", "Portrait URL or local /images path", "text"], ["linkedinUrl", "LinkedIn URL", "text"], ["githubUrl", "GitHub URL", "text"],
          ].map(([key, label, type]) => <label className={`admin-field ${key === "avatarUrl" || key === "availability" ? "field-full" : ""}`} key={key}><span>{label} *</span><input required type={type} value={form[key as keyof ProfileFormValue]} onChange={event => update(key as keyof ProfileFormValue, event.target.value)} /></label>)}
          <label className="admin-field field-full"><span>Professional bio *</span><textarea required rows={7} value={form.bio} onChange={event => update("bio", event.target.value)} /></label>
        </div>
        <div className="admin-form-actions"><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile changes"}</button></div>
      </form>
    </section>
  );
}

function AdminLoading() { return <div className="admin-state"><span className="admin-spinner" /><p>Loading workspace…</p></div>; }
function AccessDenied({ onLogout }: { onLogout: () => void }) { return <div className="admin-state"><LogOut size={30} /><h1>Admin access required</h1><p>Your account is signed in but does not have permission to manage this portfolio.</p><div><Link to="/">View portfolio</Link><button onClick={onLogout}>Sign out</button></div></div>; }
