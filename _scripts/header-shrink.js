/*
  homepage: the nav bar is fixed at its compact size over an in-flow .hero
  section. as the hero scrolls away, the bar's title (.home) and menu (nav)
  glide from a big, centred spot over the bottom of the hero into their bar
  slots, while the bar's surface, logo and hero panels cross-fade.

  the motion is built as scroll-linked Web Animations (ScrollTimeline) of
  transform and opacity only, which the browser runs on the compositor in
  lockstep with scrolling - so it stays smooth even while the hero's sim
  (a same-origin iframe sharing this page's main thread) is busy. browsers
  without ScrollTimeline fall back to a requestAnimationFrame driver that
  sets --dock on the header and hero.
*/

{
  const init = () => {
    const header = document.querySelector("header[data-big]");
    const hero = document.querySelector(".hero");

    if (!header || !hero) {
      return;
    }

    const root = document.documentElement;
    const scroller = document.scrollingElement || root;
    const home = header.querySelector(".home");
    const text = header.querySelector(".title-text") || home;
    const title = header.querySelector(".title");
    const subtitle = header.querySelector(".subtitle");
    const logo = header.matches("[data-sim]") ? header.querySelector(".logo") : null;
    const nav = header.querySelector("nav");
    const toggle = header.querySelector(".nav-toggle");
    // must match $collapse in _styles/header.scss
    const mobile = window.matchMedia("(max-width: 700px)");

    // biggest scale for the hero title (2rem hero title / 1.2rem bar title)
    const maxScale = 2 / 1.2;
    // space kept free under the menu for the scroll cue, between title and
    // menu, at the sides of the title, and extra lift (fraction of the hero
    // height) above the bottom of the hero
    const cueSpace = 76;
    const gap = 44;
    const lift = 0.01;
    const side = 56;
    // hysteresis around the point the bar takes on the site's theme colours
    const compactOn = 0.9;
    const compactOff = 0.85;
    // samples per keyframe track; the path is a curve (smoothstep plus the
    // hero's own scroll), so it's approximated by short linear segments
    const steps = 32;

    const scrollLinked = typeof window.ScrollTimeline === "function";

    let layout = null;
    let animations = [];
    let compact = false;

    // layout offsets relative to the (fixed, top-left) header; offset* ignore
    // transforms and translate, so measuring never needs to undo them
    const box = (element) => {
      let left = 0;
      let top = 0;
      let node = element;
      while (node && node !== header) {
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent;
      }
      return { left, top, width: element.offsetWidth, height: element.offsetHeight };
    };

    const measure = () => {
      const width = root.clientWidth;
      const heroHeight = hero.offsetHeight;
      const h = box(home);
      const t = box(text);
      const menuOpen = !!(toggle && toggle.checked);
      const navShown = nav && !menuOpen && nav.getClientRects().length > 0;
      const n = navShown ? box(nav) : null;

      const scale = Math.max(1, Math.min(maxScale, (width - side * 2) / t.width));
      const bottom = heroHeight - cueSpace - heroHeight * lift;
      const navTop = n ? bottom - n.height : bottom;
      const titleBottom = n ? navTop - gap : bottom;
      // centre the title text (not the whole .home, which also holds the
      // logo and stretches across the bar)
      const homeLeft = width / 2 - scale * (t.left - h.left + t.width / 2);
      const homeTop = titleBottom - scale * (t.top - h.top + t.height);

      // the bar keeps the subtitle left-aligned under the title; over the
      // hero it's shifted to sit centred under it
      const centre =
        title && subtitle ? Math.max((title.offsetWidth - subtitle.offsetWidth) / 2, 0) : 0;

      layout = {
        distance: Math.max(heroHeight - header.offsetHeight, 1),
        scale,
        centre,
        home: { x: homeLeft - h.left, y: homeTop - h.top },
        nav: n && { x: (width - n.width) / 2 - n.left, y: navTop - n.top },
        navDocks: !mobile.matches,
      };
    };

    // 0 at the top of the page -> 1 once <main> reaches the bar; smoothstep,
    // so the title first rides up with the hero, then eases into the bar
    const dockAt = (y) => {
      const p = Math.min(Math.max(y / layout.distance, 0), 1);
      return p * p * (3 - 2 * p);
    };

    const homeTransform = (y) => {
      const rest = 1 - dockAt(y);
      return (
        `translate(${layout.home.x * rest}px, ${(layout.home.y - y) * rest}px) ` +
        `scale(${1 + (layout.scale - 1) * rest})`
      );
    };

    const subtitleTransform = (y) =>
      `translateX(${layout.centre * (1 - dockAt(y))}px)`;

    const navTransform = (y) => {
      if (!layout.navDocks) {
        // mobile: rides with the hero and fades out
        return `translate(${layout.nav.x}px, ${layout.nav.y - y}px)`;
      }
      const rest = 1 - dockAt(y);
      return `translate(${layout.nav.x * rest}px, ${(layout.nav.y - y) * rest}px)`;
    };

    const fade = (from, rate) => (y) => {
      const dock = dockAt(y);
      return Math.min(Math.max(from === 0 ? dock : 1 - dock * rate, 0), 1);
    };

    // --- compositor path -------------------------------------------------

    const build = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      measure();

      const max = Math.max(scroller.scrollHeight - scroller.clientHeight, 1);
      const end = Math.min(layout.distance, max);
      const timeline = new ScrollTimeline({ source: scroller, axis: "block" });

      // keyframes over the page's whole scroll range: sampled across the
      // dock distance, then held at the docked value to the bottom
      const track = (property, value) => {
        const frames = [];
        for (let i = 0; i <= steps; i++) {
          const y = (end * i) / steps;
          frames.push({ offset: y / max, [property]: String(value(y)) });
        }
        if (end < max) {
          frames.push({ offset: 1, [property]: String(value(max)) });
        }
        return frames;
      };

      const add = (target, frames, pseudoElement) => {
        if (!target) {
          return;
        }
        const options = { timeline, fill: "both", easing: "linear" };
        if (pseudoElement) {
          options.pseudoElement = pseudoElement;
        }
        animations.push(target.animate(frames, options));
      };

      add(home, track("transform", homeTransform));
      add(subtitle, track("transform", subtitleTransform));
      add(header, track("opacity", fade(0)), "::before");
      add(text, track("opacity", fade(1, 1.6)), "::before");
      add(logo, track("opacity", fade(0)));
      add(hero, track("opacity", fade(1, 4)), "::after");

      if (nav && layout.nav) {
        add(nav, track("transform", navTransform));
        if (layout.navDocks) {
          add(nav, track("opacity", fade(1, 1.6)), "::before");
        } else {
          add(nav, track("opacity", fade(1, 2.5)));
        }
      } else if (nav) {
        nav.style.transform = "";
      }
    };

    // --- fallback path ---------------------------------------------------

    let ticking = false;

    const frame = () => {
      ticking = false;
      if (!layout) {
        measure();
      }
      const y = window.scrollY;
      const dock = dockAt(y).toFixed(4);
      // scoped to the two elements that read it, not :root, so a frame
      // doesn't restyle the whole page
      header.style.setProperty("--dock", dock);
      hero.style.setProperty("--dock", dock);
      home.style.transform = homeTransform(y);
      if (subtitle) {
        subtitle.style.transform = subtitleTransform(y);
      }
      if (nav) {
        nav.style.transform = layout.nav ? navTransform(y) : "";
      }
    };

    // --- shared ------------------------------------------------------------

    // the only per-scroll main-thread work on the compositor path: flip the
    // bar's colour tokens once docked (a cheap attribute toggle on change)
    const syncCompact = () => {
      if (!layout) {
        return;
      }
      const dock = dockAt(window.scrollY);
      if (!compact && dock >= compactOn) {
        compact = true;
      } else if (compact && dock <= compactOff) {
        compact = false;
      } else {
        return;
      }
      header.toggleAttribute("data-compact", compact);
    };

    const onScroll = () => {
      syncCompact();
      if (!scrollLinked && !ticking) {
        ticking = true;
        window.requestAnimationFrame(frame);
      }
    };

    let pending = false;
    const rebuild = () => {
      if (pending) {
        return;
      }
      pending = true;
      window.requestAnimationFrame(() => {
        pending = false;
        if (scrollLinked) {
          build();
        } else {
          layout = null;
          frame();
        }
        syncCompact();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    mobile.addEventListener("change", rebuild);
    toggle?.addEventListener("change", rebuild);
    document.fonts?.ready.then(rebuild);
    window.addEventListener("load", rebuild);
    // keyframe offsets are fractions of the page's scroll range, so rebuild
    // when the page grows or shrinks (images, embeds loading)
    if ("ResizeObserver" in window) {
      new ResizeObserver(rebuild).observe(document.body);
    }

    rebuild();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
