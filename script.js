/* =========================================================
   DATA KARYA
   Ganti "src" dengan foto kamu sendiri, contoh: "images/foto1.jpg"
   type  : "photo" atau "video"
   Untuk video isi salah satu:
     video: "videos/karya.mp4"            (file video sendiri)
     embed: "https://www.youtube.com/embed/ID_VIDEO"   (YouTube)
   "src" pada video dipakai sebagai gambar sampul (thumbnail).
   ========================================================= */
const works = [
  { type: "photo", title: "Golden Hour",      meta: "Foto · Landscape",  src: "https://picsum.photos/seed/golden-hour/1200/800" },
  { type: "photo", title: "Urban Silence",    meta: "Foto · Street",     src: "https://picsum.photos/seed/urban-silence/1200/800" },
  { type: "video", title: "Cinematic Reel",   meta: "Video · Showreel",  src: "https://picsum.photos/seed/cinematic-reel/1200/800", video: "", embed: "" },
  { type: "photo", title: "Portrait Study",   meta: "Foto · Portrait",   src: "https://picsum.photos/seed/portrait-study/1200/800" },
  { type: "video", title: "Event Aftermovie", meta: "Video · Event",     src: "https://picsum.photos/seed/event-after/1200/800", video: "", embed: "" },
  { type: "photo", title: "Night Lights",     meta: "Foto · Night",      src: "https://picsum.photos/seed/night-lights/1200/800" },
];

/* ============ ELEMEN ============ */
const stage = document.getElementById("stage");
const dotsEl = document.getElementById("dots");
const counter = document.getElementById("counter");
const capTitle = document.getElementById("capTitle");
const capMeta = document.getElementById("capMeta");
const lightbox = document.getElementById("lightbox");
const lbBody = document.getElementById("lbBody");
const lbTitle = document.getElementById("lbTitle");

let list = [...works];
let index = 0;
let slides = [];

/* ============ BANGUN SLIDER ============ */
function build() {
  stage.innerHTML = "";
  dotsEl.innerHTML = "";
  slides = list.map((w, i) => {
    const el = document.createElement("div");
    el.className = "slide";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", `${i + 1} dari ${list.length}: ${w.title}`);

    const img = new Image();
    img.src = w.src;
    img.alt = w.title;
    img.draggable = false;
    img.onerror = () => { img.remove(); el.classList.add("fallback"); };
    el.appendChild(img);

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = w.type === "video" ? "Video" : "Foto";
    el.appendChild(badge);

    if (w.type === "video") {
      const p = document.createElement("span");
      p.className = "play";
      el.appendChild(p);
    }

    el.addEventListener("click", () => {
      if (moved) return;
      if (el.classList.contains("active")) openLightbox(w);
      else go(i);
    });
    stage.appendChild(el);

    const d = document.createElement("button");
    d.className = "dot";
    d.setAttribute("aria-label", `Ke karya ${i + 1}`);
    d.addEventListener("click", () => go(i));
    dotsEl.appendChild(d);
    return el;
  });
  index = 0;
  update();
}

/* ============ POSISI SLIDE (COVERFLOW) ============ */
function update() {
  const n = list.length;
  if (!n) return;
  const step = Math.min(stage.clientWidth * 0.34, 360);

  slides.forEach((s, i) => {
    let off = i - index;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const a = Math.abs(off);
    const x = off * step + dragOffset;
    s.style.transform =
      `translateX(-50%) translateX(${x}px) translateZ(${-a * 140}px) rotateY(${off * -16}deg) scale(${1 - a * 0.07})`;
    s.style.opacity = a > 2 ? 0 : 1 - a * 0.22;
    s.style.zIndex = 10 - a;
    s.style.pointerEvents = a > 2 ? "none" : "auto";
    s.classList.toggle("active", off === 0);
  });

  [...dotsEl.children].forEach((d, i) => d.classList.toggle("active", i === index));
  const w = list[index];
  counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
  capTitle.textContent = w.title;
  capMeta.textContent = w.meta;
}

function go(i) {
  const n = list.length;
  index = ((i % n) + n) % n;
  update();
}
const next = () => go(index + 1);
const prev = () => go(index - 1);

document.getElementById("next").addEventListener("click", next);
document.getElementById("prev").addEventListener("click", prev);

/* ============ SWIPE / DRAG ============ */
let startX = 0, dragOffset = 0, dragging = false, moved = false;

stage.addEventListener("pointerdown", (e) => {
  dragging = true; moved = false; startX = e.clientX; dragOffset = 0;
  stage.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  dragOffset = e.clientX - startX;
  if (Math.abs(dragOffset) > 6) moved = true;
  update();
});
function endDrag() {
  if (!dragging) return;
  dragging = false;
  stage.classList.remove("dragging");
  const threshold = 60;
  const d = dragOffset;
  dragOffset = 0;
  if (d < -threshold) next();
  else if (d > threshold) prev();
  else update();
  setTimeout(() => (moved = false), 0);
}
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

/* Scroll horizontal (trackpad) */
let wheelLock = false;
stage.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || wheelLock) return;
  e.preventDefault();
  wheelLock = true;
  e.deltaX > 0 ? next() : prev();
  setTimeout(() => (wheelLock = false), 500);
}, { passive: false });

/* Keyboard */
document.addEventListener("keydown", (e) => {
  if (!lightbox.hidden) { if (e.key === "Escape") closeLightbox(); return; }
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

window.addEventListener("resize", update);

/* ============ FILTER ============ */
document.querySelectorAll(".chip").forEach((c) =>
  c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
    c.classList.add("active");
    const f = c.dataset.filter;
    list = f === "all" ? [...works] : works.filter((w) => w.type === f);
    build();
  })
);

/* ============ LIGHTBOX ============ */
function openLightbox(w) {
  lbBody.innerHTML = "";
  if (w.type === "video" && w.embed) {
    const f = document.createElement("iframe");
    f.src = w.embed;
    f.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    lbBody.appendChild(f);
  } else if (w.type === "video" && w.video) {
    const v = document.createElement("video");
    v.src = w.video; v.controls = true; v.autoplay = true; v.poster = w.src;
    lbBody.appendChild(v);
  } else if (w.type === "video") {
    const n = document.createElement("div");
    n.className = "lb-note";
    n.textContent = "Belum ada file video. Isi properti 'video' atau 'embed' di script.js.";
    lbBody.appendChild(n);
  } else {
    const i = new Image();
    i.src = w.src; i.alt = w.title;
    lbBody.appendChild(i);
  }
  lbTitle.textContent = `${w.title} — ${w.meta}`;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.hidden = true;
  lbBody.innerHTML = "";
  document.body.style.overflow = "";
}
document.getElementById("lbClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

/* ============ NAV, REVEAL, COUNTER ============ */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

const countIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const target = +el.dataset.count;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? "+" : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();

/* ============ VIDEO SHOWREEL HERO ============ */
const heroVideo = document.getElementById("heroVideo");
if (heroVideo) {
  // Sembunyikan bagian video kalau file belum ada
  heroVideo.addEventListener("error", () => heroVideo.parentElement.classList.add("empty"));
  const p = heroVideo.play();
  if (p && p.catch) p.catch(() => {});
}

/* ============ CAHAYA KURSOR ============ */
const glow = document.getElementById("cursorGlow");
if (glow && matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let tx = innerWidth / 2, ty = innerHeight / 2, gx = tx, gy = ty;
  window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); });
  document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  (function loop() {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(loop);
  })();
}

build();
