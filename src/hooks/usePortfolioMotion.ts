import { useEffect } from "react";

export function usePortfolioMotion(dependency: unknown) {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const delay = Number(element.dataset.delay ?? 0);
        element.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 280, delay, easing: "ease-out", fill: "both" },
        );
        observer.unobserve(element);
      }
    }, { threshold: 0.12 });
    elements.forEach(element => observer.observe(element));
    return () => {
      observer.disconnect();
    };
  }, [dependency]);
}
