/*
  homepage hero simulation: view-only until clicked, so the mouse wheel and
  touch scroll the page instead of driving the 3D camera. once active, it's
  released again by Esc, the Exit button, the pointer leaving it, or the
  hero scrolling mostly out of view.
*/

{
  const init = () => {
    const hero = document.querySelector(".hero[data-sim]");

    if (!hero) {
      return;
    }

    const frame = hero.querySelector(".hero-sim");
    const shield = hero.querySelector(".hero-sim-shield");
    const exit = hero.querySelector(".hero-sim-exit");

    if (!frame || !shield) {
      return;
    }

    const isActive = () => hero.hasAttribute("data-active");

    const activate = () => {
      hero.setAttribute("data-active", "");
      frame.focus();
    };

    const release = () => {
      if (!isActive()) {
        return;
      }
      hero.removeAttribute("data-active");
      if (document.activeElement === frame) {
        frame.blur();
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape") {
        release();
      }
    };

    shield.addEventListener("click", activate);
    exit?.addEventListener("click", release);
    frame.addEventListener("mouseleave", release);
    document.addEventListener("keydown", onKey);

    // keys pressed while the sim has focus go to the iframe's own document
    // (same origin, /sim), so listen there too; re-attach on every load
    const listenInFrame = () => {
      try {
        frame.contentWindow.addEventListener("keydown", onKey);
      } catch {
        // cross-origin sim (e.g. hero-sim pointed elsewhere): parent Esc only
      }
    };
    frame.addEventListener("load", listenInFrame);
    listenInFrame();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio < 0.5) {
            release();
          }
        },
        { threshold: [0, 0.5] }
      ).observe(hero);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
