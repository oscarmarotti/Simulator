/* Selvana Essam — portfolio & CV.
 * Vanilla JS, no build step: in-page router, page templates and motion.
 * Motion follows the system setting by default; the "Motion" switch in the footer overrides it.
 * One requestAnimationFrame loop runs only while something is moving, and sleeps otherwise. */
(() => {
  "use strict";

  const DATA = window.SELVANA;
  const PROJECTS = DATA.projects;
  const DIMS = DATA.dims || {};
  const CLD = "https://res.cloudinary.com/dcnm3ysw5";
  const EMAIL = "selvanaessam778@gmail.com";
  const PHONE = "+201501003126";
  const PHONE_LABEL = "+20 150 100 3126";
  const WHATSAPP = "201501003126";
  const WA_URL = `https://wa.me/${WHATSAPP}`;
  const INSTAGRAM = "https://www.instagram.com/selvanaessam";
  const LENIS_SRC = "https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isPhone = () => window.innerWidth <= 860;
  const root = document.documentElement;
  const conn = navigator.connection || {};
  const saveData = Boolean(conn.saveData) || /(^|-)2g|3g/.test(conn.effectiveType || "");

  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    const saved = localStorage.getItem("selvana-motion");
    if (saved) reduceMotion = saved === "reduced";
  } catch {
    /* storage unavailable: follow the system setting */
  }
  function applyMotion() {
    root.classList.toggle("motion", !reduceMotion);
    root.classList.toggle("reduced", reduceMotion);
    root.classList.toggle("has-cursor", finePointer && !reduceMotion);
    document.querySelectorAll(".motion-toggle").forEach((b) => {
      b.setAttribute("aria-pressed", String(!reduceMotion));
      b.querySelector("span").textContent = reduceMotion ? "Motion off" : "Motion on";
    });
  }
  applyMotion();

  /* One short name per discipline, used everywhere. */
  const DISC = {
    direction: { name: "Set design", preview: "closer" },
    branding: { name: "Branding", preview: "colt-coffee" },
    scenography: { name: "Scenography", preview: "haret-el-lamoun" },
  };
  const FEATURED = ["colt-coffee", "closer", "lavern"];
  const CLIENTS = ["COLT Coffee", "Horse Park", "Marbat", "CHAI"];

  /* ---------- Helpers ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug);
  const isArabic = (s) => /[؀-ۿ]/.test(s);
  // Frame-rate independent easing: the same feel at 60 Hz and 120 Hz.
  const ease = (k, dt) => 1 - Math.pow(1 - k, dt / 16.667);
  const storage = {
    get(k, area = "localStorage") {
      try {
        return window[area].getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v, area = "localStorage") {
      try {
        window[area].setItem(k, v);
      } catch {
        /* storage unavailable: the choice just isn't remembered */
      }
    },
  };
  const newTab = '<span class="sr-only"> (opens in a new tab)</span>';
  // A fact still to be confirmed with Selvana shows as a marked placeholder.
  const fact = (v) => (v && typeof v === "object" ? `<span class="tbc" title="To confirm with Selvana">${esc(v.tbc)}</span>` : esc(v));

  /* ---------- Media URLs ---------- */
  // Optional self-hosted media map (a sandboxed preview can't load images from Cloudinary).
  const LOCAL = window.SELVANA_LOCAL || null;
  // Paths may start with transformations ("e_trim/", "c_crop,…/") that are applied before sizing.
  const splitPath = (path) => {
    const i = path.search(/(^|\/)v\d+\//);
    return i > 0 ? [path.slice(0, i + 1), path.slice(i + 1)] : ["", path];
  };
  const imgUrl = (path, w) => {
    if (LOCAL) return LOCAL.img(path, w);
    const [pre, rest] = splitPath(path);
    return `${CLD}/image/upload/${pre}f_auto,q_auto,w_${w}/${rest}`;
  };
  const maxW = (path) => (DIMS[path] ? DIMS[path][0] : 4000);
  const widthsFor = (path, ws) => {
    const max = maxW(path);
    return [...new Set([...ws.filter((w) => w < max), Math.min(max, ws[ws.length - 1])])];
  };
  const srcset = (path, ws) =>
    LOCAL ? LOCAL.srcset(path) : widthsFor(path, ws).map((w) => `${imgUrl(path, w)} ${w}w`).join(", ");
  const pic = (path, { alt = "", sizes = "100vw", cls = "", eager = false, ws = [480, 800, 1200, 1600, 2000, 2400] } = {}) => {
    const d = DIMS[path];
    return `<img${cls ? ` class="${cls}"` : ""} src="${esc(imgUrl(path, Math.min(1200, maxW(path))))}" srcset="${esc(srcset(path, ws))}" sizes="${sizes}"${
      d ? ` width="${d[0]}" height="${d[1]}"` : ""
    } alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  };
  // Films are sized to the screen and use Cloudinary's lighter "eco" quality.
  const videoTag = (path, label) => {
    const w = isPhone() ? 720 : 1280;
    const poster = LOCAL ? LOCAL.poster(path) : `${CLD}/video/upload/so_0,f_auto,q_auto,w_${w}/${path}.jpg`;
    const src = LOCAL ? LOCAL.video(path) : `${CLD}/video/upload/q_auto:eco,vc_auto,w_${w}/${path}.mp4`;
    return `<video class="lazy-video" muted loop playsinline preload="none" aria-label="${esc(label)}" data-poster="${esc(poster)}" data-src="${esc(src)}"></video>
      <button class="vbtn" type="button" aria-label="Pause film">Pause</button>`;
  };

  /* ---------- Shared blocks ---------- */
  const contactHTML = () => `
    <section class="section dark contact" id="contact" aria-labelledby="contact-title">
      <div class="wrap contact__inner">
        <h2 id="contact-title" class="title t-xl" data-split>Let’s make <em>something.</em></h2>
        <div class="contact__actions" data-reveal>
          <a class="btn btn--light" href="${WA_URL}" target="_blank" rel="noopener">Message on WhatsApp${newTab}</a>
          <a class="btn btn--ghost" href="mailto:${EMAIL}">Email me</a>
        </div>
        <p class="contact__ar" lang="ar" dir="rtl" data-reveal>تواصل عبر واتساب</p>
        <div class="contact__more" data-reveal>
          <span class="contact__mail">${EMAIL}</span>
          <button type="button" data-copy="${EMAIL}">Copy email</button>
          <a href="tel:${PHONE}">${PHONE_LABEL}</a>
          <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram ↗${newTab}</a>
        </div>
      </div>
    </section>`;

  const factsLine = (p) =>
    [fact(p.facts.client), p.facts.city ? fact(p.facts.city) : "", fact(p.facts.year), fact(p.facts.status)].filter(Boolean).join(" · ");

  /* ---------- Pages ---------- */
  function homeHTML() {
    return `
    <div class="stage-pin" id="stagePin">
    <section class="stage" id="stage" aria-labelledby="hero-title">
      <div class="stage__media" id="heroMedia">
        <picture>
          <source media="(max-width: 699px)" srcset="assets/stage-portrait.webp" />
          <img src="assets/stage-1536.webp" srcset="assets/stage-960.webp 960w, assets/stage-1536.webp 1536w" sizes="100vw" width="1536" height="1024"
            alt="Selvana on a theatre stage in a gold gown, in front of a red velvet curtain" fetchpriority="high" />
        </picture>
      </div>
      <div class="stage__light" aria-hidden="true"><div class="stage__shade"></div><div class="stage__warm"></div></div>
      <canvas class="stage__dust" id="dust" aria-hidden="true"></canvas>
      <div class="stage__fade" aria-hidden="true"></div>
      <div class="stage__grain" aria-hidden="true"></div>
      <div class="stage__inner wrap" id="heroContent">
        <h1 id="hero-title" class="stage__name" data-split="chars" style="--d:.1s">Selvana <em>Essam</em></h1>
        <p class="stage__role" data-reveal style="--d:.55s">Creative direction, branding &amp; set design</p>
        <p class="stage__line" data-reveal style="--d:.7s">For brands, campaigns and spaces · Alexandria, Egypt</p>
        <p class="stage__clients" data-reveal style="--d:.85s"><span class="sr-only">Clients include </span>${CLIENTS.map(esc).join('<span aria-hidden="true"> · </span>')}</p>
      </div>
      <div class="stage__curtain stage__curtain--l velvet" aria-hidden="true"></div>
      <div class="stage__curtain stage__curtain--r velvet" aria-hidden="true"></div>
      <a class="stage__act" href="#selected" aria-hidden="true" tabindex="-1"><span>Act II</span><b>The work</b><i>↓</i></a>
    </section>
    </div>

    <section class="section dark selected" id="selected" aria-labelledby="selected-title">
      <div class="wrap">
        <div class="head">
          <h2 id="selected-title" class="small" data-reveal>Selected work</h2>
          <a class="small link" href="#/work" data-reveal>All projects <span aria-hidden="true">→</span></a>
        </div>
        <div class="stack">
          ${FEATURED.map(bySlug)
            .map(
              (p) => `
            <div class="stack__item">
              <a class="fcard" href="#/work/${p.slug}" data-cursor="View">
                ${pic(p.cover, { alt: "", sizes: "(max-width: 1440px) 100vw, 1330px" })}
                <div class="fcard__caption"><h3 class="fcard__title">${esc(p.title)}</h3><p class="small">${esc(DISC[p.discipline].name)} · ${fact(p.facts.status)}</p></div>
                <span class="fcard__dim"></span>
              </a>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-label="Approach">
      <div class="wrap statement">
        <h2 class="title" data-split>Theatre taught me that every space tells a story. Now I build those spaces for <em>brands.</em></h2>
      </div>
    </section>

    <section class="section" id="work" aria-labelledby="all-work" style="padding-top:0">
      <div class="wrap">
        <div class="head">
          <h2 id="all-work" class="title t-lg" data-split>All projects</h2>
          <div class="filters" role="group" aria-label="Filter projects" data-reveal>
            <button class="filter" data-f="all" aria-pressed="true">All</button>
            ${Object.entries(DISC)
              .map(([k, d]) => `<button class="filter" data-f="${k}" aria-pressed="false">${d.name}</button>`)
              .join("")}
          </div>
        </div>
        <div class="list">
          ${PROJECTS.map(
            (p, i) => `
            <a class="row" href="#/work/${p.slug}" data-d="${p.discipline}" data-preview="${esc(imgUrl(p.cover, 640))}" data-reveal style="--d:${Math.min(i, 6) * 0.04}s">
              <img class="row__thumb" src="${esc(imgUrl(p.cover, 320))}" alt="" width="72" height="90" loading="lazy" decoding="async">
              <span class="row__title">${esc(p.title)}</span>
              <span class="row__meta">${esc(DISC[p.discipline].name)} · <span class="row__kind row__kind--${p.kind.toLowerCase()}">${esc(p.kind)}</span></span>
            </a>`
          ).join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="hello" style="padding-top:0">
      <div class="wrap about">
        <figure class="about__img tilt" data-reveal="img"><img src="assets/portrait.webp" width="572" height="840" alt="Portrait of Selvana Essam on stage" loading="lazy" decoding="async" /></figure>
        <div class="about__body">
          <h2 id="hello" class="title t-lg" data-split>Hi, I’m <em>Selvana.</em></h2>
          <p data-reveal>A creative director with a background in scenography. I lead Vana Creative Studio and have directed brands since 2020.</p>
          <a class="link" href="#/cv" data-reveal>About me &amp; CV <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    ${contactHTML()}`;
  }

  function galleryHTML(p) {
    const portrait = p.slug === "closer" || p.slug === "lavern";
    const ratio = portrait ? "4 / 5" : "3 / 2";
    const stills = p.gallery.filter((g) => typeof g !== "string" || !g.startsWith("video:")).length;
    let lbIndex = 0;
    let n = 0;
    const cell = (src, { full = false, board = false, label = "" } = {}) => {
      n++;
      const d = DIMS[src];
      const style = full && d ? `aspect-ratio:${d[0]} / ${d[1]}` : `aspect-ratio:${ratio}`;
      return `<figure class="g${full ? " g--full" : ""}${board ? " g--board" : ""}" style="${style}" data-reveal="img" data-lb-i="${lbIndex++}" data-full="${esc(
        imgUrl(src, Math.min(2000, maxW(src)))
      )}" data-cursor="Enlarge" tabindex="0" role="button" aria-label="Enlarge image ${n} of ${stills}, ${esc(p.title)}">${pic(src, {
        alt: `${p.title}, image ${n} of ${stills}${label ? `, ${label}` : ""}`,
        sizes: full ? "(max-width: 860px) 77vw, (max-width: 1440px) 100vw, 1330px" : "(max-width: 860px) 77vw, 50vw",
      })}${label ? `<figcaption class="g__label">${esc(label)}</figcaption>` : ""}</figure>`;
    };
    let k = 0;
    return p.gallery
      .map((g) => {
        if (typeof g === "string" && g.startsWith("video:")) {
          return `<figure class="g g--video" style="aspect-ratio:${ratio}" data-reveal="img">${videoTag(g.slice(6), `${p.title} film`)}</figure>`;
        }
        if (g.pair) {
          // Render and built photo, side by side: the strongest proof on the site.
          return `<div class="g-pair">${g.pair.map((src, i) => cell(src, { label: g.labels[i] })).join("")}</div>`;
        }
        const board = Boolean(g.board);
        const src = board ? g.src : g;
        const full = !board && !portrait && k % 3 === 0 && maxW(src) >= 1600;
        k++;
        return cell(src, { full, board });
      })
      .join("");
  }

  function projectHTML(p) {
    const i = PROJECTS.indexOf(p);
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const arabic = isArabic(p.subtitle);
    return `
    <article>
      <header class="p-head">
        <div class="wrap">
          <a class="small back" href="#/work" data-reveal>← All projects</a>
          <h1 class="title t-xl p-title" data-split="chars">${esc(p.title)}</h1>
          ${arabic ? `<p class="ar-title" lang="ar" dir="rtl" data-reveal="ar">${esc(p.subtitle)}</p>` : ""}
          <p class="p-facts" data-reveal>${factsLine(p)}</p>
          <p class="small p-meta" data-reveal>${esc(p.roles.join(", "))} · ${esc(arabic ? DISC[p.discipline].name : p.subtitle)}</p>
        </div>
      </header>

      <div class="wrap">
        <figure class="p-cover tilt" data-reveal="img">${pic(p.cover, { alt: `${p.title}, cover image`, eager: true, sizes: "(max-width: 1440px) 100vw, 1330px" })}</figure>
      </div>

      <section class="section" aria-label="About the project">
        <div class="wrap p-story">
          <div class="p-story__aside" data-reveal>
            <p class="small">Scope</p>
            <p>${esc(p.scope.join(", "))}</p>
          </div>
          <div class="p-story__body">
            ${p.body.map((b, k) => `<p class="${k === 0 ? "lead" : ""}" data-reveal>${esc(b)}</p>`).join("")}
            ${p.renders ? `<p class="small" data-reveal>Includes 3D visualizations and concept renders.</p>` : ""}
          </div>
        </div>
      </section>

      <section class="section" aria-label="Gallery" style="padding-top:0">
        <div class="wrap"><div class="gallery">${galleryHTML(p)}</div></div>
      </section>

      <a class="next" href="#/work/${next.slug}" data-cursor="Next">
        <div class="next__bg">${pic(next.cover, { alt: "", sizes: "100vw" })}</div>
        <div class="wrap">
          <p class="small">Next project</p>
          <h2 class="title t-xl">${esc(next.title)}</h2>
        </div>
      </a>
    </article>
    ${contactHTML()}`;
  }

  function cvHTML() {
    const jobs = [
      ["2025 — now", "Creative Director & Partner, Vana Creative Studio", "Creative direction across branding, art direction, spatial and set design, from brief to execution. Projects include COLT Coffee, Smile Café, CHAI, Marbat and Horse Park."],
      ["2020 — now", "Creative Director, Vana Room", "Visual direction, identity, product styling and packaging for an Egyptian home décor brand."],
      ["2023 — 2026", "Team Leader, Bab Ashra Art Space", "Led a team of 45+ instructors and art assistants across workshops and creative programs."],
      ["Early years", "Theatre & performing arts", "Years of acting, singing and building stage décor led me to study scenography."],
    ];
    const skills = [
      ["Direction", "Creative strategy, concept development, art direction, visual storytelling"],
      ["Branding", "Identity, packaging, campaign direction, product styling"],
      ["Space", "Set design, scenography, interior and exterior design, 3D visualization"],
      ["Tools", "3ds Max, V-Ray, Unreal Engine, AutoCAD, Photoshop, Illustrator, InDesign, TouchDesigner, Resolume, MadMapper"],
      ["Languages", "Arabic (native), English (upper-intermediate)"],
    ];
    const rows = (list, plain = false) =>
      list
        .map(
          ([a, b, c]) =>
            `<div class="cv-row" data-reveal><span class="small">${a}</span><div>${plain ? `<p>${esc(b)}</p>` : `<h3>${esc(b)}</h3>`}${c ? `<p>${esc(c)}</p>` : ""}</div></div>`
        )
        .join("");
    return `
    <section class="cv-head" aria-labelledby="cv-title">
      <div class="wrap cv-head__grid">
        <div class="cv-head__body">
          <p class="small" data-reveal>About &amp; CV</p>
          <h1 id="cv-title" class="title t-xl" data-split="chars">Selvana <em>Essam</em></h1>
          <p class="lead" data-reveal>Creative director, art director and scenographer in Alexandria, Egypt.</p>
          <p data-reveal>Theatre and scenography shape how I design: around story, atmosphere and the people who walk into a space. I take ideas from research to the finished set, for brands, cultural spaces and productions.</p>
          <p class="print-only cv-contact">${EMAIL} · ${PHONE_LABEL} (WhatsApp) · instagram.com/selvanaessam · Alexandria, Egypt</p>
          <div class="cv-actions" data-reveal>
            <a class="btn print-btn" href="assets/selvana-essam-cv.pdf" download>Download CV (PDF) <span aria-hidden="true">↓</span></a>
            <a class="btn btn--ghost" href="#/contact">Get in touch</a>
          </div>
        </div>
        <figure class="cv-head__img tilt" data-reveal="img"><img src="assets/portrait.webp" width="572" height="840" alt="Portrait of Selvana Essam on stage" decoding="async" /></figure>
      </div>
    </section>

    <section class="wrap cv" aria-label="CV">
      <div class="cv-block"><h2 data-reveal>Experience</h2><div class="cv-rows">${rows(jobs)}</div></div>
      <div class="cv-block"><h2 data-reveal>Education</h2><div class="cv-rows">${rows([
        ["2026", "Scenography, Faculty of Fine Arts, Alexandria University", "Very Good with Honors. Graduation project: Bridge to Terabithia."],
      ])}</div></div>
      <div class="cv-block"><h2 data-reveal>Skills</h2><div class="cv-rows">${rows(skills, true)}</div></div>
    </section>

    ${contactHTML()}`;
  }

  const notFoundHTML = () => `
    <section class="cv-head"><div class="wrap cv-head__body">
      <h1 class="title t-xl">This scene <em>isn’t built yet.</em></h1>
      <a class="btn" href="#/">Back to the stage</a>
    </div></section>`;

  /* ---------- Element refs ---------- */
  const view = $("#view");
  const header = $("#header");
  const progress = $("#progress");
  const curtain = $("#curtain");
  const curtainMark = $(".curtain__mark", curtain);
  const lb = $("#lightbox");
  const menu = $("#menu");
  const menuBtn = $("#menuBtn");
  const fab = $("#waFab");

  /* ---------- Smooth scrolling (desktop, motion on), loaded without blocking the page ---------- */
  let lenis = null;
  let lenisLoading = false;
  function setupLenis() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    if (!finePointer || reduceMotion) return;
    if (!window.Lenis) {
      if (lenisLoading) return;
      lenisLoading = true;
      const s = document.createElement("script");
      s.src = LENIS_SRC;
      s.async = true;
      s.onload = () => {
        lenisLoading = false;
        setupLenis();
      };
      s.onerror = () => (lenisLoading = false);
      document.head.appendChild(s);
      return;
    }
    lenis = new window.Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", wake);
    if (document.body.classList.contains("is-locked")) lenis.stop();
    wake();
  }
  function scrollToY(y, smooth) {
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(y, { immediate: !smooth, duration: 1.4, force: true });
    } else window.scrollTo({ top: y, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    wake();
  }
  function lock(on) {
    document.body.classList.toggle("is-locked", on);
    if (!lenis) return;
    if (on) lenis.stop();
    else lenis.start();
  }
  // Keep keyboard and screen-reader focus inside an open overlay.
  function inertOutside(keep, on) {
    [header, view, $("#footer"), menu, fab].forEach((el) => {
      if (el && el !== keep && !el.contains(keep)) el.inert = on;
    });
  }

  /* ---------- Router ---------- */
  let current = null;
  let renderedPath = "";
  let firstRender = true;
  let navigating = false;
  let routePath = location.hash.replace(/^#/, "") || "/";

  function parseRoute() {
    const raw = routePath || "/";
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    const parts = path.split("/").filter(Boolean);
    const base = { path: raw, params };
    if (parts.length === 0) return { ...base, key: "home", kind: "home", target: null };
    if (parts[0] === "work" && parts[1]) {
      const p = bySlug(parts[1]);
      return p ? { ...base, key: `p:${p.slug}`, kind: "project", project: p } : { ...base, key: "404", kind: "404" };
    }
    if (parts[0] === "work") return { ...base, key: "home", kind: "home", target: "#work" };
    if (parts[0] === "contact") return { ...base, key: "home", kind: "home", target: "#contact" };
    if (parts[0] === "cv" || parts[0] === "about") return { ...base, key: "cv", kind: "cv" };
    return { ...base, key: "404", kind: "404" };
  }

  const TITLES = {
    home: "Selvana Essam — Creative Director",
    cv: "About & CV — Selvana Essam",
    404: "Not found — Selvana Essam",
  };
  const curtainLabel = (r) =>
    r.kind === "project" ? r.project.title : r.kind === "cv" ? "About & CV" : r.target === "#work" ? "Work" : r.target === "#contact" ? "Contact" : "Selvana";

  function render(route, { holdReveals = false } = {}) {
    cleanupPage();
    if (route.kind === "home") view.innerHTML = homeHTML();
    else if (route.kind === "project") view.innerHTML = projectHTML(route.project);
    else if (route.kind === "cv") view.innerHTML = cvHTML();
    else view.innerHTML = notFoundHTML();
    document.title = route.kind === "project" ? `${route.project.title} — Selvana Essam` : TITLES[route.kind];
    updateNav(route);
    current = route;
    renderedPath = route.path;
    initPage(route, holdReveals);
  }

  function updateNav(route) {
    $$(".nav a").forEach((a) => {
      const n = a.dataset.nav;
      const on =
        (n === "work" && (route.kind === "project" || route.target === "#work")) ||
        (n === "cv" && route.kind === "cv") ||
        (n === "contact" && route.target === "#contact");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function scrollToTarget(route, smooth) {
    if (route.target) {
      const el = $(route.target);
      if (el) {
        scrollToY(el.getBoundingClientRect().top + window.scrollY - (route.target === "#work" ? header.offsetHeight : 0), smooth);
        return;
      }
    }
    if (!smooth) scrollToY(0, false);
  }

  function applyParams(route) {
    if (route.kind !== "home") return;
    const f = route.params.get("d");
    applyFilter(f && DISC[f] ? f : "all", false);
  }

  async function navigate() {
    const route = parseRoute();
    closeMenu();
    if (!lb.hidden) lbClose(true);
    if (firstRender) {
      firstRender = false;
      render(route);
      setupLenis();
      scrollToTarget(route, false);
      playIntro(route);
      return;
    }
    if (navigating) return; // the latest address is picked up when the running transition ends
    if (current && route.key === current.key) {
      current = route;
      renderedPath = route.path;
      updateNav(route);
      applyParams(route);
      if (route.target) scrollToTarget(route, true);
      else scrollToY(0, true);
      return;
    }
    navigating = true;
    finishIntro();
    if (reduceMotion) {
      render(route);
      scrollToTarget(route, false);
      view.focus({ preventScroll: true });
      revealHero();
    } else {
      // The velvet drops, names the destination, holds, then rises back up.
      curtainMark.textContent = curtainLabel(route);
      curtain.classList.add("is-down");
      await wait(560);
      render(route, { holdReveals: true });
      scrollToTarget(route, false);
      view.focus({ preventScroll: true });
      await wait(260);
      const flip = route.kind === "project" ? prepareTitleFlip() : null;
      curtain.classList.remove("is-down");
      flip?.play();
      await wait(200);
      startReveals();
      revealHero();
      await wait(560);
    }
    navigating = false;
    if (routePath !== renderedPath) navigate();
  }

  // Links are routed in-page; the URL is updated where the browser allows it
  // (sandboxed previews refuse history changes, so the route also lives in memory).
  function go(hash) {
    routePath = hash.replace(/^#/, "") || "/";
    if (location.hash !== hash) {
      try {
        history.pushState(null, "", hash);
      } catch {
        /* keep the in-memory route */
      }
    }
    navigate();
  }
  document.addEventListener("click", (e) => {
    const skip = e.target.closest(".skip");
    if (skip) {
      e.preventDefault();
      view.focus();
      return;
    }
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });
  const fromLocation = () => {
    const h = location.hash.replace(/^#/, "");
    if (h && !h.startsWith("/")) return; // plain anchors are not routes
    if ((h || "/") === routePath) return;
    routePath = h || "/";
    navigate();
  };
  window.addEventListener("popstate", fromLocation);
  window.addEventListener("hashchange", fromLocation);

  /* ---------- Intro: the curtain opens once per visit; later visits get a short version ---------- */
  let introDone = null;
  function finishIntro() {
    if (introDone) introDone();
  }
  function revealHero() {
    const hc = $("#heroContent", view);
    if (hc) revealNow(hc);
  }
  function playIntro(route) {
    const intro = $("#intro");
    if (reduceMotion || route.kind !== "home" || route.target) {
      revealHero();
      return;
    }
    const seen = storage.get("selvana-intro", "sessionStorage") === "1";
    storage.set("selvana-intro", "1", "sessionStorage");
    intro.classList.add("is-playing");
    if (seen) intro.classList.add("is-short");
    lock(true);
    let ended = false;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const open = () => {
      intro.classList.add("is-open");
      const media = $("#heroMedia", view);
      media?.animate?.([{ transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 2000, easing: "cubic-bezier(.16,1,.3,1)" });
      later(revealHero, 450);
      later(() => lock(false), 650);
      later(cleanup, 1500);
    };
    const cleanup = () => {
      ended = true;
      timers.forEach(clearTimeout);
      intro.classList.remove("is-playing", "is-open", "is-short", "is-mark", "is-mark-out");
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.removeEventListener(t, skip, true));
      introDone = null;
      lock(false);
      revealHero();
    };
    const skip = () => !ended && cleanup();
    introDone = skip;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.addEventListener(t, skip, { capture: true, passive: true }));
    if (seen) {
      later(open, 80);
      return;
    }
    // Full version: the name writes on once the fonts are ready, fades, then the curtains part.
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, wait(1200)]).then(() => {
      if (ended) return;
      intro.classList.add("is-mark");
      later(() => intro.classList.add("is-mark-out"), 950);
      later(open, 1250);
    });
  }

  /* ---------- Reveals ---------- */
  let io = null;
  function splitWords(el) {
    if (el.classList.contains("split")) return;
    const chars = el.dataset.split === "chars";
    // Screen readers get the whole text once; the animated pieces are hidden from them.
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const w = document.createElement("span");
            w.className = "w";
            w.setAttribute("aria-hidden", "true");
            (chars ? Array.from(part) : [part]).forEach((piece) => {
              const s = document.createElement("span");
              s.textContent = piece;
              s.style.setProperty("--i", i++);
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.tagName === "EM") n.setAttribute("aria-hidden", "true");
          walk(n);
        }
      });
    };
    walk(el);
    el.classList.add("split");
    if (chars) el.classList.add("split--chars");
  }

  function revealNow(scope) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => $$("[data-reveal], [data-split]", scope).forEach((el) => el.classList.add("is-in")))
    );
  }

  function prepareReveals() {
    io?.disconnect();
    io = null;
    if (reduceMotion) return;
    $$("[data-split]", view).forEach(splitWords);
  }
  function startReveals() {
    if (reduceMotion || io) return;
    io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    $$("[data-reveal], [data-split]", view).forEach((el) => {
      if (!el.closest("#heroContent") && !el.classList.contains("is-in")) io.observe(el);
    });
  }

  /* The project title travels from the curtain to its place on the page. */
  function prepareTitleFlip() {
    const title = $(".p-title", view);
    if (!title) return null;
    const from = curtainMark.getBoundingClientRect();
    const to = title.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(title).fontSize);
    if (!from.width || to.height > fs * 1.6 || to.top > window.innerHeight) return null; // wraps or off screen: normal reveal
    const markFs = parseFloat(getComputedStyle(curtainMark).fontSize);
    const clone = document.createElement("div");
    clone.className = "flip-title";
    clone.setAttribute("aria-hidden", "true");
    clone.textContent = title.textContent;
    clone.style.cssText = `left:${from.left}px;top:${from.top}px;font-size:${markFs}px;`;
    document.body.appendChild(clone);
    curtainMark.style.visibility = "hidden";
    title.classList.add("is-in", "is-flipping");
    return {
      play() {
        const c = clone.getBoundingClientRect();
        const s = fs / markFs;
        const anim = clone.animate(
          [
            { transform: "translate(0,0) scale(1)", color: "#f5f1ea" },
            { transform: `translate(${to.left - c.left}px, ${to.top - c.top}px) scale(${s})`, color: "#14110e" },
          ],
          { duration: 760, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
        );
        const done = () => {
          title.classList.remove("is-flipping");
          clone.remove();
          curtainMark.style.visibility = "";
        };
        anim.onfinish = done;
        setTimeout(done, 1200);
      },
    };
  }

  /* ---------- Videos: load and play only while visible; a pause button on each ---------- */
  let vio = null;
  function initVideos() {
    vio?.disconnect();
    vio = null;
    const vids = $$("video.lazy-video", view);
    const manual = reduceMotion || saveData;
    if (manual) {
      // No autoplay: the visitor starts each film (motion off or a data-saving connection).
      vids.forEach((v) => {
        v.poster = v.dataset.poster;
        v.preload = "none";
        v.controls = true;
        v.nextElementSibling?.remove();
        if (!v.getAttribute("src")) v.src = v.dataset.src;
      });
      return;
    }
    vio = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.poster) v.poster = v.dataset.poster;
            if (!v.getAttribute("src")) v.src = v.dataset.src;
            if (!v.dataset.paused) v.play()?.catch(() => {});
          } else v.pause();
        }),
      { rootMargin: "300px 0px" }
    );
    vids.forEach((v) => vio.observe(v));
  }

  /* ---------- Project filter ---------- */
  let filterTimer = 0;
  function applyFilter(f, animate = true) {
    const work = $("#work", view);
    if (!work) return;
    clearTimeout(filterTimer);
    $$(".filter", work).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === f)));
    const items = $$(".row", work);
    const show = (c) => f === "all" || c.dataset.d === f;
    if (!animate || reduceMotion) {
      items.forEach((c) => {
        c.hidden = !show(c);
        c.classList.remove("is-out");
        c.classList.add("is-in");
      });
      return;
    }
    items.forEach((c) => c.classList.toggle("is-out", !show(c) || c.hidden));
    filterTimer = setTimeout(() => {
      items.forEach((c) => {
        c.hidden = !show(c);
        if (show(c)) {
          c.classList.add("is-in");
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove("is-out")));
        }
      });
    }, 280);
  }

  /* ---------- Images fade in once loaded ---------- */
  document.addEventListener(
    "load",
    (e) => {
      if (e.target.tagName === "IMG") e.target.classList.add("is-loaded");
    },
    true
  );
  const markLoaded = () => $$("img", view).forEach((im) => im.complete && im.naturalWidth && im.classList.add("is-loaded"));

  // Hovering a project starts loading its cover, so the page opens instantly.
  const preloaded = new Set();
  function preloadProject(slug) {
    const p = bySlug(slug);
    if (!p || preloaded.has(slug)) return;
    preloaded.add(slug);
    const im = new Image();
    im.src = imgUrl(p.cover, Math.min(1600, maxW(p.cover)));
  }

  /* ---------- Floating preview over the project list ---------- */
  let floatPreview = null;
  let previewTimer = 0;
  const fp = { x: 0, y: 0, tx: 0, ty: 0, on: false, rot: 0 };
  function showPreview(src) {
    if (!floatPreview) {
      floatPreview = document.createElement("div");
      floatPreview.className = "float-preview";
      floatPreview.setAttribute("aria-hidden", "true");
      document.body.appendChild(floatPreview);
    }
    let im = $$("img", floatPreview).find((x) => x.dataset.src === src);
    if (!im) {
      im = document.createElement("img");
      im.dataset.src = src;
      im.src = src;
      im.alt = "";
      floatPreview.appendChild(im);
    }
    if (!fp.on) {
      fp.x = fp.tx;
      fp.y = fp.ty;
    }
    fp.on = true;
    floatPreview.classList.add("is-on");
    $$("img", floatPreview).forEach((x) => x.classList.toggle("is-on", x === im));
    wake();
  }
  function hidePreview() {
    clearTimeout(previewTimer);
    fp.on = false;
    floatPreview?.classList.remove("is-on");
  }

  /* ---------- Lightbox: opens from the thumbnail at once, then sharpens ---------- */
  const lbStage = $(".lightbox__stage", lb);
  const lbCount = $(".lightbox__count", lb);
  let lbItems = [];
  let lbIdx = 0;
  let lbReturn = null;
  let lbHideTimer = 0;

  function lbImage(it) {
    const thumb = $("img", it);
    const im = document.createElement("img");
    im.alt = thumb ? thumb.alt : "";
    im.src = thumb && thumb.currentSrc ? thumb.currentSrc : it.dataset.full;
    const full = new Image();
    full.onload = () => {
      if (im.isConnected) im.src = it.dataset.full;
    };
    full.src = it.dataset.full;
    return im;
  }
  function lbShow(i, { origin = null, dir = 0 } = {}) {
    lbIdx = (i + lbItems.length) % lbItems.length;
    const it = lbItems[lbIdx];
    const im = lbImage(it);
    lbStage.replaceChildren(im);
    lbCount.textContent = `${lbIdx + 1} / ${lbItems.length}`;
    if (reduceMotion || !im.animate) return;
    requestAnimationFrame(() => {
      if (origin) {
        const a = origin.getBoundingClientRect();
        const b = im.getBoundingClientRect();
        if (b.width) {
          const dx = a.left + a.width / 2 - (b.left + b.width / 2);
          const dy = a.top + a.height / 2 - (b.top + b.height / 2);
          im.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }, { transform: "none" }], {
            duration: 700,
            easing: "cubic-bezier(.16,1,.3,1)",
          });
        }
      } else if (dir) {
        im.animate([{ transform: `translateX(${dir * 16}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 350, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    });
  }
  function lbOpen(i) {
    lbItems = $$("[data-lb-i]", view);
    if (!lbItems.length) return;
    clearTimeout(lbHideTimer);
    lbReturn = document.activeElement;
    lb.hidden = false;
    lock(true);
    inertOutside(lb, true);
    requestAnimationFrame(() => lb.classList.add("is-open"));
    lbShow(i, { origin: lbItems[i] });
    $(".lightbox__close", lb).focus();
  }
  function lbClose(instant = false) {
    const im = $("img", lbStage);
    const target = lbItems[lbIdx];
    lb.classList.remove("is-open");
    lock(false);
    inertOutside(lb, false);
    if (!instant && !reduceMotion && im && target && im.animate) {
      const a = target.getBoundingClientRect();
      const b = im.getBoundingClientRect();
      if (b.width && a.bottom > 0 && a.top < window.innerHeight) {
        const dx = a.left + a.width / 2 - (b.left + b.width / 2);
        const dy = a.top + a.height / 2 - (b.top + b.height / 2);
        im.animate([{ transform: "none" }, { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }], {
          duration: 450,
          easing: "cubic-bezier(.65,0,.35,1)",
          fill: "forwards",
        });
      }
    }
    lbHideTimer = setTimeout(
      () => {
        lb.hidden = true;
        lbStage.replaceChildren();
      },
      instant ? 0 : 440
    );
    if (!instant) lbReturn?.focus?.({ preventScroll: true });
  }
  lb.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lb]")?.dataset.lb;
    if (a === "close") lbClose();
    else if (a === "prev") lbShow(lbIdx - 1, { dir: -1 });
    else if (a === "next") lbShow(lbIdx + 1, { dir: 1 });
    else if (e.target === lb || e.target === lbStage) lbClose();
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) lbShow(lbIdx + (dx < 0 ? 1 : -1), { dir: dx < 0 ? 1 : -1 });
    touchX = null;
  });

  /* ---------- Mobile menu ---------- */
  function openMenu() {
    menu.hidden = false;
    document.body.classList.add("menu-open");
    lock(true);
    inertOutside(menu, true);
    header.inert = false;
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
    wake();
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    lock(false);
    inertOutside(menu, false);
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    setTimeout(() => {
      if (!menu.classList.contains("is-open")) menu.hidden = true;
    }, 700);
  }
  menuBtn.addEventListener("click", () => {
    if (menu.hidden || !menu.classList.contains("is-open")) openMenu();
    else {
      closeMenu();
      menuBtn.focus();
    }
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  /* ---------- Toast ---------- */
  let toastT = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-on"), 2200);
  }

  /* ---------- Delegated interactions ---------- */
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".filter");
    if (f) {
      applyFilter(f.dataset.f);
      const hash = f.dataset.f === "all" ? "#/work" : `#/work?d=${f.dataset.f}`;
      routePath = hash.slice(1);
      try {
        history.replaceState(null, "", hash);
      } catch {
        /* keep the in-memory route */
      }
      current = parseRoute();
      return;
    }
    const act = e.target.closest(".stage__act");
    if (act) {
      e.preventDefault();
      const sel = $("#selected", view);
      if (sel) scrollToY(sel.getBoundingClientRect().top + window.scrollY, true);
      return;
    }
    const vb = e.target.closest(".vbtn");
    if (vb) {
      const v = vb.previousElementSibling;
      if (v.paused) {
        delete v.dataset.paused;
        if (!v.getAttribute("src")) v.src = v.dataset.src;
        v.play()?.catch(() => {});
        vb.textContent = "Pause";
        vb.setAttribute("aria-label", "Pause film");
      } else {
        v.dataset.paused = "1";
        v.pause();
        vb.textContent = "Play";
        vb.setAttribute("aria-label", "Play film");
      }
      return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const value = copy.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(() => toast("Email copied"), () => toast(value));
      else toast(value);
      return;
    }
    if (e.target.closest(".motion-toggle")) {
      toggleMotion();
      return;
    }
    const g = e.target.closest("[data-lb-i]");
    if (g) lbOpen(Number(g.dataset.lbI));
  });

  // Switching motion re-renders the page and keeps the reader at the same section.
  function toggleMotion() {
    const sections = Array.from(view.children);
    const anchorIdx = sections.findIndex((s) => s.getBoundingClientRect().bottom > header.offsetHeight);
    const anchorOff = anchorIdx >= 0 ? sections[anchorIdx].getBoundingClientRect().top : 0;
    reduceMotion = !reduceMotion;
    storage.set("selvana-motion", reduceMotion ? "reduced" : "full");
    applyMotion();
    setupLenis();
    if (current) {
      render(current);
      if (!reduceMotion) revealNow(view);
      const now = view.children[anchorIdx];
      if (now) scrollToY(now.getBoundingClientRect().top + window.scrollY - anchorOff, false);
    }
    if (document.body.classList.contains("is-locked")) lenis?.stop();
    toast(reduceMotion ? "Motion off" : "Motion on");
  }

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowRight") lbShow(lbIdx + 1, { dir: 1 });
      if (e.key === "ArrowLeft") lbShow(lbIdx - 1, { dir: -1 });
      if (e.key === "Tab") {
        // Keep Tab inside the viewer.
        const f = $$("button", lb);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
      return;
    }
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      menuBtn.focus();
    }
    const g = e.target.closest?.("[data-lb-i]");
    if (g && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      lbOpen(Number(g.dataset.lbI));
    }
  });
  // A focused link inside the header must never be hidden behind it.
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  $("#toTop").addEventListener("click", () => scrollToY(0, true));

  /* ---------- Cursor: an exact dot, a close trailing ring, and the stage spotlight ---------- */
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  const ringLabel = $(".cursor-ring__label", ring);
  const cur = { x: -100, y: -100, rx: -100, ry: -100, tx: -100, ty: -100 };
  // The spotlight rests on Selvana's face and follows the pointer only while it's on the stage.
  const REST = { x: 49, y: 31 };
  const spot = { x: REST.x, y: REST.y, tx: REST.x, ty: REST.y };
  let lastMove = 0;
  if (finePointer) {
    window.addEventListener(
      "mousemove",
      (e) => {
        cur.tx = fp.tx = e.clientX;
        cur.ty = fp.ty = e.clientY;
        lastMove = performance.now();
        const st = els.stage;
        if (st && stageVisible && !reduceMotion) {
          const r = st.getBoundingClientRect();
          const inside = e.clientY > Math.max(r.top, header.offsetHeight + 8) && e.clientY < r.bottom;
          spot.tx = inside ? ((e.clientX - r.left) / r.width) * 100 : REST.x;
          spot.ty = inside ? ((e.clientY - r.top) / r.height) * 100 : REST.y;
        }
        wake();
        if (reduceMotion) return;
        // Buttons lean toward the pointer; portraits and covers tilt in 3D.
        const m = e.target.closest(".btn");
        const tiltEl = e.target.closest(".tilt");
        $$(".is-pulled, .is-tilted").forEach((el) => {
          if (el !== m && el !== tiltEl) {
            el.classList.remove("is-pulled", "is-tilted");
            el.style.transform = "";
          }
        });
        if (m) {
          const r = m.getBoundingClientRect();
          m.classList.add("is-pulled");
          m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.14}px, ${(e.clientY - r.top - r.height / 2) * 0.24}px)`;
        }
        if (tiltEl) {
          const r = tiltEl.getBoundingClientRect();
          tiltEl.classList.add("is-tilted");
          tiltEl.style.transform = `perspective(1000px) rotateY(${(((e.clientX - r.left) / r.width - 0.5) * 5).toFixed(2)}deg) rotateX(${(-((e.clientY - r.top) / r.height - 0.5) * 5).toFixed(2)}deg)`;
        }
      },
      { passive: true }
    );
    document.addEventListener("mouseover", (e) => {
      if (reduceMotion) return;
      const media = e.target.closest("[data-cursor]");
      const link = !media && e.target.closest("a, button, [role='button']");
      const field = e.target.closest("input, textarea");
      const onStage = !media && !link && e.target.closest("#stage");
      ring.classList.toggle("is-media", Boolean(media));
      dot.classList.toggle("is-media", Boolean(media));
      ring.classList.toggle("is-link", Boolean(link));
      ring.classList.toggle("is-hidden", Boolean(field || onStage));
      dot.classList.toggle("is-hidden", Boolean(field));
      ringLabel.textContent = media ? media.dataset.cursor : "";
      const dark = Boolean(e.target.closest(".dark, .stage, .next, .footer, .menu, .lightbox"));
      dot.classList.toggle("on-dark", dark);
      ring.classList.toggle("on-dark", dark);
      const proj = e.target.closest('a[href^="#/work/"]');
      if (proj) preloadProject(proj.getAttribute("href").split("/")[2]);
      const pv = e.target.closest("[data-preview]");
      clearTimeout(previewTimer);
      if (pv) previewTimer = setTimeout(() => showPreview(pv.dataset.preview), fp.on ? 0 : 70);
      else if (fp.on) hidePreview();
    });
    window.addEventListener("mousedown", () => ring.classList.add("is-down"));
    window.addEventListener("mouseup", () => ring.classList.remove("is-down"));
    root.addEventListener("mouseleave", () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
      spot.tx = REST.x;
      spot.ty = REST.y;
      wake();
    });
    root.addEventListener("mouseenter", () => {
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    });
  }

  /* ---------- Stage dust: specks drifting through the spotlight ---------- */
  const dust = { el: null, ctx: null, w: 0, h: 0, dpr: 1, parts: [], skip: false };
  function setupDust() {
    dust.el = $("#dust", view);
    dust.ctx = null;
    if (!dust.el) return;
    dust.ctx = dust.el.getContext("2d");
    sizeDust();
    const n = finePointer ? 90 : 40;
    dust.parts = Array.from({ length: n }, () => ({
      x: Math.random() * dust.w,
      y: Math.random() * dust.h,
      r: (0.5 + Math.random() * 1.7) * dust.dpr,
      vx: (Math.random() - 0.5) * 0.18 * dust.dpr,
      vy: -(0.05 + Math.random() * 0.22) * dust.dpr,
      a: 0.35 + Math.random() * 0.65,
      o: Math.random() * 6.28,
    }));
  }
  function sizeDust() {
    if (!dust.el) return;
    dust.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    dust.w = dust.el.width = Math.round(dust.el.clientWidth * dust.dpr);
    dust.h = dust.el.height = Math.round(dust.el.clientHeight * dust.dpr);
  }
  function drawDust(t, step) {
    const { ctx, w, h } = dust;
    if (!ctx || !w) return;
    ctx.clearRect(0, 0, w, h);
    const sx = (spot.x / 100) * w;
    const sy = (spot.y / 100) * h;
    const R = Math.max(window.innerWidth, window.innerHeight) * 0.34 * dust.dpr;
    ctx.fillStyle = "#ffe2b8";
    for (const p of dust.parts) {
      p.x += (p.vx + Math.sin(t / 1400 + p.o) * 0.08) * step;
      p.y += p.vy * step;
      if (p.y < -5) p.y = h + 5;
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      const k = 1 - Math.hypot(p.x - sx, p.y - sy) / R;
      if (k <= 0.02) continue;
      ctx.globalAlpha = k * k * p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Cached page elements and sizes ---------- */
  const els = {};
  let stageVisible = false;
  let stageIO = null;
  function cacheEls() {
    els.stage = $("#stage", view);
    els.pin = $("#stagePin", view);
    els.light = els.stage ? $(".stage__light", els.stage) : null;
    els.curtL = els.stage ? $(".stage__curtain--l", els.stage) : null;
    els.curtR = els.stage ? $(".stage__curtain--r", els.stage) : null;
    els.act = els.stage ? $(".stage__act", els.stage) : null;
    els.media = $("#heroMedia", view);
    els.content = $("#heroContent", view);
    els.stack = $$(".stack__item", view).map((it) => ({ it, fc: it.firstElementChild, dim: $(".fcard__dim", it) }));
    els.contact = $("#contact", view);
    measure();
    stageIO?.disconnect();
    stageVisible = false;
    if (els.pin) {
      stageIO = new IntersectionObserver(([e]) => {
        stageVisible = e.isIntersecting;
        els.stage.classList.toggle("is-offstage", !stageVisible);
        wake();
      });
      stageIO.observe(els.pin);
    }
  }
  const size = { pinH: 0, vh: 0, vw: 0, docH: 0, cardH: 0, contactTop: Infinity, stageW: 0, stageH: 0 };
  function measure() {
    size.vh = window.innerHeight;
    size.vw = window.innerWidth;
    size.pinH = els.pin ? els.pin.offsetHeight : 0;
    size.docH = document.documentElement.scrollHeight;
    size.cardH = els.stack && els.stack[0] ? els.stack[0].fc.offsetHeight : 0;
    size.contactTop = els.contact ? els.contact.offsetTop : Infinity;
    size.stageW = els.stage ? els.stage.clientWidth : 0;
    size.stageH = els.stage ? els.stage.clientHeight : 0;
  }
  window.addEventListener("resize", () => {
    measure();
    sizeDust();
    lenis?.resize();
    wake();
  });

  /* ---------- One animation loop that sleeps when nothing moves ---------- */
  let rafId = 0;
  let lastT = 0;
  let lastY = window.scrollY;
  let lastScrollAt = 0;
  let headerHidden = false;
  function wake() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }
  ["scroll", "wheel", "touchmove", "keydown"].forEach((t) => window.addEventListener(t, wake, { passive: true }));

  function frame(t) {
    rafId = 0;
    const dt = Math.min(64, lastT ? t - lastT : 16.667);
    lastT = t;
    if (lenis) lenis.raf(t);

    // Reads first.
    const y = window.scrollY;
    const vh = size.vh || window.innerHeight;
    const page = current ? current.kind : "home";
    const menuOpen = document.body.classList.contains("menu-open");
    if (y !== lastY) lastScrollAt = t;
    const stackRects = !reduceMotion && size.vw > 860 && els.stack && els.stack.length ? els.stack.map((s) => s.it.getBoundingClientRect().top) : null;

    // Then writes.
    const overStage = els.pin && y < size.pinH - 8;
    header.classList.toggle("on-dark", Boolean(overStage) && !menuOpen);
    header.classList.toggle("is-solid", !overStage && y > 8 && !menuOpen);
    if (!menuOpen && lb.hidden && !header.contains(document.activeElement)) {
      // The header stays put over the stage and hides only while reading further down.
      if (!overStage && y > lastY + 4 && y > 320) headerHidden = true;
      else if (y < lastY - 4 || overStage) headerHidden = false;
      header.classList.toggle("is-hidden", headerHidden);
    }
    if (fab) {
      const nearContact = y + vh > size.contactTop + 120;
      fab.classList.toggle("is-hidden", Boolean(menuOpen || !lb.hidden || nearContact || document.body.classList.contains("is-locked") || overStage));
    }
    lastY = y;

    progress.style.transform = page === "project" && size.docH > vh ? `scaleX(${clamp(y / (size.docH - vh)).toFixed(4)})` : "scaleX(0)";

    let busy = Boolean(lenis && lenis.isScrolling) || t - lastScrollAt < 120;

    if (!reduceMotion) {
      if (els.stage && stageVisible) {
        // While the stage is pinned, scrolling closes the curtains, leaving a seam of light.
        const p = clamp(y / Math.max(1, size.pinH - vh));
        const e = p * p * (3 - 2 * p);
        const open = 1 - e * 0.96;
        els.curtL.style.transform = `translate3d(${(-101 * open).toFixed(2)}%,0,0)`;
        els.curtR.style.transform = `translate3d(${(101 * open).toFixed(2)}%,0,0)`;
        els.media.style.transform = `scale(${(1 + e * 0.08).toFixed(4)})`;
        els.content.style.opacity = String(clamp(1 - e * 1.6).toFixed(3));
        els.act.style.opacity = String(clamp((e - 0.55) / 0.35).toFixed(3));
        els.act.style.pointerEvents = e > 0.6 ? "auto" : "none";

        const k = ease(0.08, dt);
        spot.x += (spot.tx - spot.x) * k;
        spot.y += (spot.ty - spot.y) * k;
        els.light.style.transform = `translate3d(${((spot.x / 100) * size.stageW).toFixed(1)}px, ${((spot.y / 100) * size.stageH).toFixed(1)}px, 0)`;
        const spotMoving = Math.abs(spot.tx - spot.x) + Math.abs(spot.ty - spot.y) > 0.05;
        // Dust drifts while the stage is visible (half rate on touch screens).
        dust.skip = !finePointer && !dust.skip;
        if (e < 0.97 && !dust.skip) drawDust(t, finePointer ? dt / 16.667 : (2 * dt) / 16.667);
        busy = busy || spotMoving || e < 0.97;
      }

      if (stackRects) {
        els.stack.forEach((s, i) => {
          const next = stackRects[i + 1];
          if (next === undefined) return;
          const h = size.cardH;
          const p = clamp((stackRects[i] + h - next) / h);
          s.fc.style.transform = p ? `scale(${(1 - p * 0.07).toFixed(4)})` : "";
          if (s.dim) s.dim.style.opacity = String((p * 0.55).toFixed(3));
        });
      }

      if (finePointer) {
        // The dot sits exactly on the pointer; the ring follows closely.
        cur.x = cur.tx;
        cur.y = cur.ty;
        const kr = ease(0.3, dt);
        cur.rx += (cur.tx - cur.rx) * kr;
        cur.ry += (cur.ty - cur.ry) * kr;
        dot.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
        ring.style.transform = `translate3d(${cur.rx.toFixed(1)}px, ${cur.ry.toFixed(1)}px, 0)`;
        busy = busy || Math.abs(cur.tx - cur.rx) + Math.abs(cur.ty - cur.ry) > 0.3 || t - lastMove < 100;
        if (floatPreview && fp.on) {
          const kf = ease(0.16, dt);
          const vx = fp.tx - fp.x;
          fp.x += vx * kf;
          fp.y += (fp.ty - fp.y) * kf;
          fp.rot += (clamp(vx * 0.02, -3, 3) - fp.rot) * kf;
          floatPreview.style.transform = `translate3d(${(fp.x + 32).toFixed(1)}px, ${fp.y.toFixed(1)}px, 0) translateY(-60%) rotate(${fp.rot.toFixed(2)}deg)`;
          busy = busy || Math.abs(vx) + Math.abs(fp.ty - fp.y) > 0.3;
        }
      }
    }
    if (busy) wake();
  }

  /* ---------- Page lifecycle ---------- */
  function cleanupPage() {
    io?.disconnect();
    io = null;
    vio?.disconnect();
    hidePreview();
    clearTimeout(filterTimer);
    ring.classList.remove("is-media", "is-link");
    dot.classList.remove("is-media");
  }

  function initPage(route, holdReveals) {
    cacheEls();
    requestAnimationFrame(markLoaded);
    prepareReveals();
    if (!holdReveals) startReveals();
    initVideos();
    setupDust();
    spot.x = spot.tx = REST.x;
    spot.y = spot.ty = REST.y;
    applyParams(route);
    lenis?.resize();
    requestAnimationFrame(measure);
    wake();
  }

  navigate();
})();
