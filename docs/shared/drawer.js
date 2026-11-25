document.addEventListener("astro:page-load", () => {
  const drawer = document.getElementById("sidebar-drawer");
  if (!drawer) return;
  const overlay = document.getElementById("sidebar-overlay");
  const open = document.getElementById("sidebar-open");
  const close = document.getElementById("sidebar-close");
  const controller = new AbortController();
  const options = { signal: controller.signal };
  function setOpen(expanded, restoreFocus = true) {
    drawer.inert = !expanded;
    drawer.setAttribute("aria-hidden", String(!expanded));
    open.setAttribute("aria-expanded", String(expanded));
    drawer.style.transform = expanded ? "translateX(0)" : "translateX(-100%)";
    overlay.classList.toggle("hidden", !expanded);
    document.body.style.overflow = expanded ? "hidden" : "";
    if (expanded) close.focus();
    else if (restoreFocus) open.focus();
  }
  open.addEventListener("click", () => setOpen(true), options);
  close.addEventListener("click", () => setOpen(false), options);
  overlay.addEventListener("click", () => setOpen(false), options);
  drawer.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("a")) setOpen(false, false);
    },
    options,
  );
  drawer.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const links = drawer.querySelectorAll("button,a[href]");
      const first = links[0],
        last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    options,
  );
  document.addEventListener(
    "astro:before-swap",
    () => {
      controller.abort();
      setOpen(false, false);
    },
    { once: true },
  );
});
