/*
  on the homepage, morphs the full-height hero header into the compact
  top nav bar as the user scrolls down.
*/

{
  const init = () => {
    const header = document.querySelector("header[data-big]");

    if (!header) {
      return;
    }

    // distance (px) of scroll over which the header fully shrinks - must
    // match $shrink-distance in _styles/header.scss
    const distance = 320;
    // the column (hero) -> row (nav bar) layout swap happens partway
    // through the shrink, while sizes are still visibly animating, so the
    // discrete layout change is masked by the ongoing motion instead of
    // landing as a jarring snap once everything has settled; the two
    // thresholds (rather than one) add hysteresis so a little scroll
    // jitter right at the boundary can't flicker the layout back and forth
    const compactOn = 0.55;
    const compactOff = 0.45;
    let ticking = false;
    let compact = false;

    const update = () => {
      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1);
      // set on the root so both the fixed header and its in-flow
      // .hero-spacer sibling (see header.html) can read it
      document.documentElement.style.setProperty("--shrink", progress);

      if (!compact && progress >= compactOn) {
        compact = true;
      } else if (compact && progress <= compactOff) {
        compact = false;
      }
      header.toggleAttribute("data-compact", compact);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
