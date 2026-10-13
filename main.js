(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Los mechones se destapan de izquierda a derecha al entrar en pantalla.
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Se observa la sección: un SVG recortado del todo no cuenta como visible.
        entry.target.querySelectorAll(":scope > .strands").forEach((svg) => svg.classList.add("is-drawn"));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    new Set([...document.querySelectorAll("main .strands")].map((svg) => svg.parentElement)).forEach((field) => io.observe(field));
    // Red de seguridad: si el observador no llega a dispararse, los mechones se muestran igual.
    setTimeout(() => document.querySelectorAll("main .strands").forEach((svg) => svg.classList.add("is-drawn")), 2500);
  } else {
    document.querySelectorAll(".strands").forEach((svg) => svg.classList.add("is-drawn"));
  }

  // Deriva suave de los mechones con el scroll.
  // Solo los mechones de la portada, y poco: el resto tiene su sitio medido.
  const drifting = [...document.querySelectorAll(".hero .strands")];
  let ticking = false;
  const drift = () => {
    const vh = window.innerHeight;
    drifting.forEach((svg) => {
      const box = document.querySelector(".hero").getBoundingClientRect();
      if (box.bottom < 0) return;
      const progress = Math.max(-1, Math.min(1, -box.top / vh));
      svg.style.translate = `0 ${progress * -10}px`;
    });
    ticking = false;
  };
  if (!reduce) {
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(drift); ticking = true; }
    }, { passive: true });
    drift();
  }

  // La barra fija se aparta al llegar al pie, que ya tiene los contactos.
  const dock = document.querySelector(".dock");
  const foot = document.querySelector(".foot");
  if (dock && foot && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      dock.classList.toggle("is-hidden", entry.isIntersecting);
    }, { threshold: 0.35 }).observe(foot);
  }

  // Solo una caja de servicios abierta a la vez en el móvil.
  const boxes = document.querySelectorAll(".box");
  const narrow = window.matchMedia("(max-width: 47.99rem)");
  boxes.forEach((box) => {
    box.addEventListener("toggle", () => {
      if (!box.open || !narrow.matches) return;
      boxes.forEach((other) => { if (other !== box) other.open = false; });
    });
  });
})();
