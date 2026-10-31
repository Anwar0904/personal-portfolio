import { useEffect } from "react";

export function usePortfolioMotion(dependency: unknown) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const delay = Number(element.dataset.delay ?? 0);
        element.animate(
          [{ opacity: 0, transform: "translateY(34px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 750, delay, easing: "cubic-bezier(0.19, 1, 0.22, 1)", fill: "both" },
        );
        observer.unobserve(element);
      }
    }, { threshold: 0.12 });
    elements.forEach(element => observer.observe(element));

    let frame = 0;
    const updateTitles = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>("[data-project-title]").forEach(title => {
        const section = title.closest("article");
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        title.style.transform = `translate3d(0, ${(progress - 0.5) * 42}px, 0)`;
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateTitles); };
    updateTitles();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [dependency]);
}
