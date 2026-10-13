/*
  manages light/dark mode.
*/

{
  // immediately load saved (or default) mode before page renders
  document.documentElement.dataset.dark =
    window.localStorage.getItem("dark-mode") ?? "false";

  const onLoad = () => {
    // update toggle button to match loaded mode
    document.querySelector(".dark-toggle").checked =
      document.documentElement.dataset.dark === "true";
  };

  // after page loads
  window.addEventListener("load", onLoad);

  // when user toggles mode button
  window.onDarkToggleChange = (event) => {
    const value = event.target.checked;
    const apply = () => {
      document.documentElement.dataset.dark = value;
      window.localStorage.setItem("dark-mode", value);
    };

    // cross-fade between themes where view transitions are supported
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (document.startViewTransition && motionOk)
      document.startViewTransition(apply);
    else apply();
  };
}
