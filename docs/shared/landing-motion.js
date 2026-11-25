import { gsap } from "gsap";

document.addEventListener("astro:page-load", () => {
  const intro = document.querySelector("[data-intro]");
  if (!intro) return;
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(intro.children, {
      y: 8,
      opacity: 0.8,
      duration: 0.4,
      stagger: 0.045,
      clearProps: "transform,opacity",
    });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        gsap.from(entry.target, {
          y: 10,
          opacity: 0.85,
          duration: 0.42,
          clearProps: "transform,opacity",
        });
        observer.unobserve(entry.target);
      }
    });
    document
      .querySelectorAll("[data-reveal]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  });
  document.addEventListener("astro:before-swap", () => media.revert(), {
    once: true,
  });
});
