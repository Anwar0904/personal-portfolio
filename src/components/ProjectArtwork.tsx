import { ArrowUpRight, Braces, Check, ShieldCheck } from "lucide-react";
import type { PortfolioProject } from "@/providers/trpc";

export function ProjectArtwork({ project, compact = false }: { project: PortfolioProject; compact?: boolean }) {
  if (project.imageUrl) {
    return (
      <div className={`project-artwork project-artwork-image ${project.slug === "blood-connect" ? "project-artwork-github" : ""}`}>
        <img src={project.imageUrl} alt={`${project.title} project preview`} loading="lazy" />
      </div>
    );
  }

  if (project.slug === "ai-content-agent") {
    return (
      <div className="project-artwork generated-art ai-art" aria-label="AI content automation pipeline illustration">
        <div className="mock-window-bar"><span /><span /><span /><p>content-agent / campaign-04</p></div>
        <div className="ai-art-body">
          <div className="ai-art-heading"><span>CAMPAIGN PIPELINE</span><span className="live-dot">READY</span></div>
          <div className="pipeline-steps">
            {["Idea", "Script", "Scenes", "Review"].map((step, index) => (
              <div className="pipeline-step" key={step}>
                <span>0{index + 1}</span><strong>{step}</strong>{index < 3 && <ArrowUpRight size={15} />}
              </div>
            ))}
          </div>
          <div className="ai-code-block">
            <p><span>const</span> workflow = <b>await</b> createCampaign({"{"}</p>
            <p>&nbsp;&nbsp;humanReview: <em>true</em>,</p>
            <p>&nbsp;&nbsp;provider: <i>"agnostic"</i></p>
            <p>{"}"});</p>
          </div>
        </div>
      </div>
    );
  }

  if (project.slug === "php2shell-guard") {
    return (
      <div className="project-artwork generated-art security-art" aria-label="PHP security assessment tool illustration">
        <div className="security-top"><ShieldCheck size={compact ? 26 : 40} /><span>PHP2SHELL / GUARD</span></div>
        <div className="security-terminal">
          <p>$ guard scan --target app.php</p>
          <p><span>→</span> Analyzing attack surface</p>
          <p><span>→</span> Checking vulnerability signatures</p>
          <p className="terminal-success"><Check size={15} /> Assessment ready</p>
        </div>
        <div className="security-grid">{["CVE", "PHP", "EDGE", "API"].map(item => <span key={item}>{item}</span>)}</div>
      </div>
    );
  }

  return (
    <div className="project-artwork generated-art generic-art" aria-label={`${project.title} abstract project artwork`}>
      <div className="generic-orbit orbit-one" /><div className="generic-orbit orbit-two" />
      <Braces className="generic-icon" strokeWidth={1.2} />
      <div className="generic-copy"><span>{project.category}</span><strong>{project.title}</strong><p>FULL-STACK / WEB EXPERIENCE</p></div>
    </div>
  );
}
