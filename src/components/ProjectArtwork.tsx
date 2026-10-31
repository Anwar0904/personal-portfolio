import type { PortfolioProject } from "@/providers/trpc";

export function ProjectArtwork({ project, compact = false }: { project: PortfolioProject; compact?: boolean }) {
  if (project.imageUrl) {
    return (
      <div className="project-artwork project-artwork-image">
        <img src={project.imageUrl} alt={`${project.title} project preview`} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`project-artwork project-artwork-placeholder${compact ? " is-compact" : ""}`}>
      <p>{project.category}</p>
      <strong>{project.title}</strong>
      <span>{project.summary}</span>
    </div>
  );
}
