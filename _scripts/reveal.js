/*
  fades and lifts content into view as it scrolls into the viewport.
  only opacity/translate are animated (see .reveal-ready in all.scss), so
  nothing here changes layout or scroll position.
*/

{
  // must match the selector list for .reveal-ready in _styles/all.scss
  const selector = [
    ".card",
    ".news-card",
    ".opening-card",
    ".citation",
    ".post-excerpt",
    '.portrait:not([data-style="tiny"])',
    ".feature",
    ".figure",
    ".alert",
    ".post-nav-link",
    "main section > h2",
  ].join(", ");

  // delay between items revealed together, and the cap on it
  const stagger = 70;
  const maxSteps = 6;

  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  if ("IntersectionObserver" in window && motionOk) {
    const root = document.documentElement;

    // hide revealable content before the body renders, so there's no
    // flash of content that then disappears and animates back in
    root.classList.add("reveal-ready");

    const init = () => {
      try {
        const observer = new IntersectionObserver(
          (entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting);
            visible.forEach((entry, index) => {
              const delay = Math.min(index, maxSteps) * stagger;
              entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
        );

        for (const element of document.querySelectorAll(selector)) {
          if (!element.closest("header")) observer.observe(element);
        }
      } catch (error) {
        // never leave content stuck hidden
        console.error(error);
        root.classList.remove("reveal-ready");
      }
    };

    // scripts load in <head>, so wait for the body to exist
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
}
