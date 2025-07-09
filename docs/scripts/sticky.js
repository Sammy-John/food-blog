function scrollWithOffset(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const cta = document.querySelector(".cta-banner");
  const header = document.querySelector(".site-header");

  const baseOffset = (cta?.offsetHeight || 0) + (header?.offsetHeight || 0);
  const padding = 24; // or try 64–128 if needed

  const targetY = target.getBoundingClientRect().top + window.scrollY - baseOffset - padding;

  // Delay to allow layout to settle
  setTimeout(() => {
    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });
  }, 50);

  target.classList.add("highlight-scroll");
  setTimeout(() => target.classList.remove("highlight-scroll"), 1600);
}
