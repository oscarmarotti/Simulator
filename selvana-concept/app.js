/* Selvana Essam — portfolio & CV.
 * Vanilla JS, no build step: in-page router, page templates and motion.
 * Motion follows the system setting by default; the "Motion" switch in the footer overrides it. */
(() => {
  "use strict";

  const PROJECTS = window.SELVANA.projects;
  const CLD = "https://res.cloudinary.com/dcnm3ysw5";
  const EMAIL = "selvanaessam778@gmail.com";
  const PHONE = "+201501003126";
  const PHONE_LABEL = "+20 150 100 3126";
  const WHATSAPP = "201501003126";
  const INSTAGRAM = "https://www.instagram.com/selvanaessam";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
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
  const FEATURED = ["lavern", "colt-coffee", "bridge-to-terabithia"];

  /* ---------- Helpers ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug);
  const isArabic = (s) => /[؀-ۿ]/.test(s);
  const storage = {
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* storage unavailable: the choice just isn't remembered */
      }
    },
  };

  // Optional self-hosted media map (a sandboxed preview can't load images from Cloudinary).
  const LOCAL = window.SELVANA_LOCAL || null;
  const imgUrl = (path, w) => {
    if (LOCAL) return LOCAL.img(path, w);
    const trim = path.startsWith("e_trim/");
    return `${CLD}/image/upload/${trim ? "e_trim/" : ""}f_auto,q_auto,w_${w}/${trim ? path.slice(7) : path}`;
  };
  const srcset = (path, ws) => (LOCAL ? LOCAL.srcset(path) : ws.map((w) => `${imgUrl(path, w)} ${w}w`).join(", "));
  const pic = (path, { alt = "", sizes = "100vw", cls = "", eager = false, ws = [480, 800, 1200, 1600] } = {}) =>
    `<img${cls ? ` class="${cls}"` : ""} src="${imgUrl(path, 1200)}" srcset="${srcset(path, ws)}" sizes="${sizes}" alt="${esc(alt)}" ${
      eager ? 'fetchpriority="high"' : 'loading="lazy"'
    } decoding="async">`;
  const videoTag = (path, w, label) => {
    const poster = LOCAL ? LOCAL.poster(path) : `${CLD}/video/upload/so_0,f_jpg,q_auto,w_${w}/${path}.jpg`;
    const src = LOCAL ? LOCAL.video(path) : `${CLD}/video/upload/q_auto,w_${w}/${path}.mp4`;
    return `<video class="lazy-video" muted loop playsinline preload="none" aria-label="${esc(label)}" poster="${poster}" data-src="${src}"></video>`;
  };

  /* ---------- Shared blocks ---------- */
  const contactHTML = () => `
    <section class="section dark contact" id="contact" aria-labelledby="contact-title">
      <div class="wrap contact__inner">
        <h2 id="contact-title" class="title t-xl" data-split>Let’s make <em>something.</em></h2>
        <a class="contact__mail" href="mailto:${EMAIL}" data-reveal>${EMAIL}</a>
        <div class="contact__more" data-reveal>
          <button type="button" data-copy="${EMAIL}">Copy email</button>
          <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp ↗</a>
          <a href="tel:${PHONE}">${PHONE_LABEL}</a>
          <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram ↗</a>
        </div>
      </div>
    </section>`;

  /* ---------- Pages ---------- */
  function homeHTML() {
    return `
    <section class="stage" id="stage" aria-labelledby="hero-title">
      <div class="stage__media" id="heroMedia">
        <picture>
          <source media="(max-width: 699px)" srcset="assets/stage-portrait.webp" />
          <img src="assets/stage-1536.webp" srcset="assets/stage-960.webp 960w, assets/stage-1536.webp 1536w" sizes="100vw"
            alt="Selvana on a theatre stage in a gold gown, in front of a red velvet curtain" fetchpriority="high" />
        </picture>
      </div>
      <div class="stage__shade" aria-hidden="true"></div>
      <div class="stage__warm" aria-hidden="true"></div>
      <canvas class="stage__dust" id="dust" aria-hidden="true"></canvas>
      <div class="stage__fade" aria-hidden="true"></div>
      <div class="stage__grain" aria-hidden="true"></div>
      <div class="stage__inner wrap" id="heroContent">
        <h1 id="hero-title" class="stage__name" data-split="chars" style="--d:.1s">Selvana <em>Essam</em></h1>
        <p class="stage__line" data-reveal style="--d:.7s">Creative director for brands, sets and spaces</p>
      </div>
    </section>

    <section class="section" aria-label="Approach">
      <div class="wrap statement">
        <h2 class="title" data-scrub>Theatre taught me that every space tells a story. Now I build those spaces for <em>brands.</em></h2>
        <a class="link" href="#/cv" data-reveal>About me <span>→</span></a>
      </div>
    </section>

    <section class="section dark" aria-labelledby="selected">
      <div class="wrap">
        <div class="head">
          <h2 id="selected" class="small" data-reveal>Selected work</h2>
          <a class="small link" href="#/work" data-reveal>All projects <span>→</span></a>
        </div>
        <div class="stack">
          ${FEATURED.map(bySlug)
            .map(
              (p) => `
            <div class="stack__item">
              <a class="fcard" href="#/work/${p.slug}" data-cursor="View">
                ${p.video ? videoTag(p.video, 1280, `${p.title} campaign film`) : pic(p.cover, { alt: p.title, sizes: "100vw" })}
                <div class="fcard__caption"><h3 class="fcard__title">${esc(p.title)}</h3><span class="small">${esc(DISC[p.discipline].name)}</span></div>
                <span class="fcard__dim"></span>
              </a>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" id="work" aria-labelledby="all-work">
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
            <a class="row" href="#/work/${p.slug}" data-d="${p.discipline}" data-cursor="View" data-preview="${imgUrl(p.cover, 600)}" data-reveal style="--d:${Math.min(i, 6) * 0.04}s">
              <img class="row__thumb" src="${imgUrl(p.cover, 320)}" alt="" loading="lazy" decoding="async">
              <span class="row__title">${esc(p.title)}</span>
              <span class="row__meta">${esc(DISC[p.discipline].name)}</span>
            </a>`
          ).join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="hello" style="padding-top:0">
      <div class="wrap about">
        <figure class="about__img tilt" data-reveal="img"><img src="assets/portrait.webp" alt="Portrait of Selvana Essam on stage" loading="lazy" decoding="async" /></figure>
        <div class="about__body">
          <h2 id="hello" class="title t-lg" data-split>Hi, I’m <em>Selvana.</em></h2>
          <p data-reveal>A creative director with a background in scenography. I lead Vana Creative Studio and have directed brands since 2020.</p>
          <a class="link" href="#/cv" data-reveal>Read my CV <span>→</span></a>
        </div>
      </div>
    </section>

    ${contactHTML()}`;
  }

  function projectHTML(p) {
    const i = PROJECTS.indexOf(p);
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const portrait = p.slug === "closer" || p.slug === "lavern";
    const arabic = isArabic(p.subtitle);
    let lbIndex = 0;
    const gallery = p.gallery
      .map((g, k) => {
        const full = !portrait && k % 3 === 0;
        if (g.startsWith("video:")) {
          return `<figure class="g${full ? " g--full" : ""}" data-reveal="img">${videoTag(g.slice(6), 1280, `${p.title} film ${k + 1}`)}</figure>`;
        }
        return `<figure class="g${full ? " g--full" : ""}" data-reveal="img" data-lb-i="${lbIndex++}" data-full="${imgUrl(g, 2000)}" data-cursor="Enlarge" tabindex="0" role="button" aria-label="Enlarge image ${k + 1} of ${esc(p.title)}">${pic(g, {
          alt: `${p.title}, image ${k + 1}`,
          sizes: full ? "(max-width: 860px) 100vw, 1400px" : "(max-width: 860px) 100vw, 50vw",
        })}</figure>`;
      })
      .join("");

    return `
    <article>
      <header class="p-head">
        <div class="wrap">
          <a class="small" href="#/work" data-reveal>← All projects</a>
          <h1 class="title t-xl p-title" data-split="chars">${esc(p.title)}</h1>
          ${arabic ? `<p class="ar-title" lang="ar" dir="rtl" data-reveal="ar">${esc(p.subtitle)}</p>` : ""}
          <p class="small p-meta" data-reveal>${esc(p.roles.join(", "))} · ${esc(arabic ? p.type : p.subtitle)}</p>
        </div>
      </header>

      <div class="wrap">
        <figure class="p-cover tilt" data-reveal="img">${
          p.video ? videoTag(p.video, 1600, `${p.title} campaign film`) : pic(p.cover, { alt: `${p.title}, cover image`, eager: true, sizes: "100vw" })
        }</figure>
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
        <div class="wrap"><div class="gallery">${gallery}</div></div>
      </section>

      <a class="next" href="#/work/${next.slug}" data-cursor="Next">
        <div class="next__bg">${pic(next.cover, { alt: "", sizes: "100vw" })}</div>
        <div class="wrap">
          <p class="small">Next project</p>
          <h2 class="title t-xl">${esc(next.title)}</h2>
        </div>
      </a>
    </article>`;
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
          <p class="small" data-reveal>About</p>
          <h1 id="cv-title" class="title t-xl" data-split="chars">Selvana <em>Essam</em></h1>
          <p class="lead" data-reveal>Creative director, art director and scenographer in Alexandria, Egypt.</p>
          <p data-reveal>Theatre and scenography shape how I design: around story, atmosphere and the people who walk into a space. I take ideas from research to the finished set, for brands, cultural spaces and productions.</p>
          <div class="cv-actions" data-reveal>
            <button class="btn print-btn" type="button" data-print>Download CV <span aria-hidden="true">↓</span></button>
            <a class="btn btn--ghost" href="#/contact">Get in touch</a>
          </div>
        </div>
        <figure class="cv-head__img tilt" data-reveal="img"><img src="assets/portrait.webp" alt="Portrait of Selvana Essam on stage" decoding="async" /></figure>
      </div>
    </section>

    <section class="wrap" aria-label="CV" style="padding-bottom:clamp(64px, 9vw, 120px)">
      <div class="cv-block"><h2 data-reveal>Experience</h2><div class="cv-rows">${rows(jobs)}</div></div>
      <div class="cv-block"><h2 data-reveal>Education</h2><div class="cv-rows">${rows([
        ["2026", "Scenography, Faculty of Fine Arts", "Very Good with Honors. Graduation project: Bridge to Terabithia."],
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

  /* ---------- Router ---------- */
  const view = $("#view");
  const header = $("#header");
  let current = null;
  let firstRender = true;
  let navigating = false;

  let routePath = location.hash.replace(/^#/, "") || "/";
  function parseRoute() {
    const raw = routePath || "/";
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return { key: "home", kind: "home", target: null, params };
    if (parts[0] === "work" && parts[1]) {
      const p = bySlug(parts[1]);
      return p ? { key: `p:${p.slug}`, kind: "project", project: p, params } : { key: "404", kind: "404", params };
    }
    if (parts[0] === "work") return { key: "home", kind: "home", target: "#work", params };
    if (parts[0] === "contact") return { key: "home", kind: "home", target: "#contact", params };
    if (parts[0] === "cv" || parts[0] === "about") return { key: "cv", kind: "cv", params };
    return { key: "404", kind: "404", params };
  }

  const TITLES = {
    home: "Selvana Essam — Creative Director",
    cv: "About — Selvana Essam",
    404: "Not found — Selvana Essam",
  };

  function render(route) {
    cleanupPage();
    if (route.kind === "home") view.innerHTML = homeHTML();
    else if (route.kind === "project") view.innerHTML = projectHTML(route.project);
    else if (route.kind === "cv") view.innerHTML = cvHTML();
    else view.innerHTML = notFoundHTML();
    document.title = route.kind === "project" ? `${route.project.title} — Selvana Essam` : TITLES[route.kind];
    updateNav(route);
    current = route;
    initPage(route);
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
        const y = el.getBoundingClientRect().top + window.scrollY - (route.target === "#work" ? header.offsetHeight : 0);
        window.scrollTo({ top: y, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
        return;
      }
    }
    if (!smooth) window.scrollTo(0, 0);
  }

  async function navigate() {
    const route = parseRoute();
    closeMenu();
    if (firstRender) {
      firstRender = false;
      render(route);
      scrollToTarget(route, false);
      playIntro(route);
      return;
    }
    if (current && route.key === current.key) {
      current = route;
      updateNav(route);
      if (route.kind === "home") applyFilter(route.params.get("d") || "all", false);
      if (route.target) scrollToTarget(route, true);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    if (navigating) return;
    navigating = true;
    const curtain = $("#curtain");
    $(".curtain__mark", curtain).textContent =
      route.kind === "project" ? route.project.title : route.kind === "cv" ? "About" : route.target === "#contact" ? "Contact" : "Selvana";
    if (!reduceMotion) {
      curtain.classList.remove("is-up");
      curtain.classList.add("is-down");
      await wait(600);
    }
    render(route);
    scrollToTarget(route, false);
    view.focus({ preventScroll: true });
    if (!reduceMotion) {
      curtain.classList.replace("is-down", "is-up");
      await wait(720);
      curtain.classList.remove("is-up");
    }
    navigating = false;
  }

  // Links are routed in-page; the URL is updated where the browser allows it
  // (sandboxed previews refuse history changes, so the route also lives in memory).
  function go(hash) {
    routePath = hash.replace(/^#/, "") || "/";
    try {
      history.pushState(null, "", hash);
    } catch {
      /* keep the in-memory route */
    }
    navigate();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });
  const fromLocation = () => {
    const h = location.hash.replace(/^#/, "") || "/";
    if (h === routePath) return;
    routePath = h;
    navigate();
  };
  window.addEventListener("popstate", fromLocation);
  window.addEventListener("hashchange", fromLocation);

  /* ---------- Intro: the curtain rises on every visit to the homepage ---------- */
  function playIntro(route) {
    const intro = $("#intro");
    const heroContent = $("#heroContent");
    if (reduceMotion || route.kind !== "home" || route.target) {
      if (heroContent) revealNow(heroContent);
      return;
    }
    intro.classList.add("is-playing");
    document.body.classList.add("is-locked");
    const heroImg = $("#heroMedia img");
    const ready = heroImg && !heroImg.complete ? new Promise((r) => heroImg.addEventListener("load", r, { once: true })) : Promise.resolve();
    const count = $("#introCount");
    const t0 = performance.now();
    let counting = true;
    const tick = (t) => {
      if (!counting) return;
      count.textContent = String(Math.round(clamp((t - t0) / 1300, 0, 0.99) * 100)).padStart(3, "0");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    Promise.all([Promise.race([ready, wait(1600)]), wait(1300)]).then(() => {
      counting = false;
      count.textContent = "100";
      intro.classList.add("is-open");
      const media = $("#heroMedia");
      if (media && media.animate) {
        media.animate([{ transform: "scale(1.14)" }, { transform: "scale(1)" }], { duration: 2200, easing: "cubic-bezier(.16,1,.3,1)" });
      }
      setTimeout(() => heroContent && revealNow(heroContent), 450);
      setTimeout(() => {
        intro.classList.remove("is-playing", "is-open");
        document.body.classList.remove("is-locked");
      }, 1350);
    });
  }

  /* ---------- Reveals ---------- */
  let io = null;
  function splitWords(el) {
    if (el.classList.contains("split")) return;
    const chars = el.dataset.split === "chars";
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
            (chars ? Array.from(part) : [part]).forEach((piece) => {
              const s = document.createElement("span");
              s.textContent = piece;
              s.style.setProperty("--i", i++);
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
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

  function initReveals() {
    if (reduceMotion) return;
    io?.disconnect();
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
    $$("[data-split]", view).forEach(splitWords);
    $$("[data-reveal], [data-split]", view).forEach((el) => {
      if (!el.closest("#heroContent")) io.observe(el);
    });
  }

  /* The approach sentence lights up word by word as you read. */
  let scrubWords = [];
  let scrubEl = null;
  function initScrub() {
    scrubEl = $("[data-scrub]", view);
    scrubWords = [];
    if (!scrubEl || reduceMotion) return;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else {
              const s = document.createElement("span");
              s.className = "sw";
              s.style.transition = "opacity .25s linear";
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(scrubEl);
    scrubWords = $$(".sw", scrubEl);
  }

  /* ---------- Videos: load and play only while visible ---------- */
  let vio = null;
  function initVideos() {
    vio?.disconnect();
    const vids = $$("video.lazy-video", view);
    if (reduceMotion) {
      vids.forEach((v) => {
        v.src = v.dataset.src;
        v.controls = true;
        v.preload = "metadata";
      });
      return;
    }
    vio = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.getAttribute("src")) v.src = v.dataset.src;
            const pr = v.play();
            if (pr) pr.catch(() => {});
          } else v.pause();
        }),
      { rootMargin: "150px 0px" }
    );
    vids.forEach((v) => vio.observe(v));
  }

  /* ---------- Project filter ---------- */
  function applyFilter(f, animate = true) {
    const work = $("#work", view);
    if (!work) return;
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
    items.forEach((c) => {
      if (!show(c)) c.classList.add("is-out");
    });
    setTimeout(() => {
      items.forEach((c) => {
        c.hidden = !show(c);
        if (show(c)) {
          c.classList.add("is-out", "is-in");
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove("is-out")));
        }
      });
    }, 300);
  }

  /* ---------- Floating preview over the project list ---------- */
  let floatPreview = null;
  const fp = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  function showPreview(src, e) {
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
      fp.x = fp.tx = e.clientX;
      fp.y = fp.ty = e.clientY;
    }
    fp.on = true;
    floatPreview.classList.add("is-on");
    $$("img", floatPreview).forEach((x) => x.classList.toggle("is-on", x === im));
  }
  function hidePreview() {
    fp.on = false;
    floatPreview?.classList.remove("is-on");
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbStage = $(".lightbox__stage", lb);
  const lbCount = $(".lightbox__count", lb);
  let lbItems = [];
  let lbIdx = 0;
  let lbReturn = null;

  function lbShow(i, origin) {
    lbIdx = (i + lbItems.length) % lbItems.length;
    const it = lbItems[lbIdx];
    lbStage.innerHTML = `<img src="${it.dataset.full}" alt="${esc($("img", it).alt)}">`;
    const im = $("img", lbStage);
    const done = () =>
      requestAnimationFrame(() => {
        if (origin && !reduceMotion && im.animate) {
          const a = origin.getBoundingClientRect();
          const b = im.getBoundingClientRect();
          if (b.width) {
            const dx = a.left + a.width / 2 - (b.left + b.width / 2);
            const dy = a.top + a.height / 2 - (b.top + b.height / 2);
            im.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }, { transform: "none" }], {
              duration: 750,
              easing: "cubic-bezier(.16,1,.3,1)",
            });
          }
        }
        im.classList.add("is-in");
      });
    if (im.complete) done();
    else im.addEventListener("load", done, { once: true });
    lbCount.textContent = `${lbIdx + 1} / ${lbItems.length}`;
  }
  function lbOpen(i) {
    lbItems = $$("[data-lb-i]", view);
    if (!lbItems.length) return;
    lbReturn = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => lb.classList.add("is-open"));
    lbShow(i, lbItems[i]);
    $(".lightbox__close", lb).focus();
  }
  function lbClose() {
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => {
      lb.hidden = true;
      lbStage.innerHTML = "";
    }, 350);
    lbReturn?.focus?.();
  }
  lb.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lb]")?.dataset.lb;
    if (a === "close") lbClose();
    else if (a === "prev") lbShow(lbIdx - 1);
    else if (a === "next") lbShow(lbIdx + 1);
    else if (e.target === lb || e.target === lbStage) lbClose();
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) lbShow(lbIdx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Mobile menu ---------- */
  const menu = $("#menu");
  const menuBtn = $("#menuBtn");
  function openMenu() {
    menu.hidden = false;
    document.body.classList.add("menu-open", "is-locked");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open", "is-locked");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    setTimeout(() => {
      if (!menu.classList.contains("is-open")) menu.hidden = true;
    }, 700);
  }
  menuBtn.addEventListener("click", () => (menu.hidden || !menu.classList.contains("is-open") ? openMenu() : closeMenu()));
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
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const value = copy.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(() => toast("Email copied"), () => toast(value));
      else toast(value);
      return;
    }
    if (e.target.closest(".motion-toggle")) {
      reduceMotion = !reduceMotion;
      storage.set("selvana-motion", reduceMotion ? "reduced" : "full");
      applyMotion();
      if (current) {
        render(current);
        if (!reduceMotion) revealNow(view);
      }
      toast(reduceMotion ? "Motion off" : "Motion on");
      return;
    }
    if (e.target.closest("[data-print]")) {
      window.print();
      return;
    }
    const g = e.target.closest("[data-lb-i]");
    if (g) lbOpen(Number(g.dataset.lbI));
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowRight") lbShow(lbIdx + 1);
      if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
      return;
    }
    if (e.key === "Escape") closeMenu();
    const g = e.target.closest?.("[data-lb-i]");
    if (g && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      lbOpen(Number(g.dataset.lbI));
    }
  });

  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Cursor: a dot, a trailing ring, and the stage spotlight ---------- */
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  const ringLabel = $(".cursor-ring__label", ring);
  const cur = { x: -100, y: -100, rx: -100, ry: -100, tx: -100, ty: -100 };
  const spot = { x: 50, y: 34, tx: 50, ty: 34, inside: false };
  if (finePointer) {
    window.addEventListener(
      "mousemove",
      (e) => {
        cur.tx = fp.tx = e.clientX;
        cur.ty = fp.ty = e.clientY;
        const stage = $("#stage", view);
        if (stage) {
          const r = stage.getBoundingClientRect();
          spot.inside = e.clientY >= r.top && e.clientY <= r.bottom;
          if (spot.inside) {
            spot.tx = ((e.clientX - r.left) / r.width) * 100;
            spot.ty = ((e.clientY - r.top) / r.height) * 100;
          }
        }
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
          m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
        }
        if (tiltEl) {
          const r = tiltEl.getBoundingClientRect();
          tiltEl.classList.add("is-tilted");
          tiltEl.style.transform = `perspective(1000px) rotateY(${(((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2)}deg) rotateX(${(-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2)}deg)`;
        }
      },
      { passive: true }
    );
    document.addEventListener("mouseover", (e) => {
      if (reduceMotion) return;
      const media = e.target.closest("[data-cursor]");
      const link = !media && e.target.closest("a, button, [role='button']");
      const field = e.target.closest("input, textarea");
      ring.classList.toggle("is-media", Boolean(media));
      dot.classList.toggle("is-media", Boolean(media));
      ring.classList.toggle("is-link", Boolean(link));
      ring.classList.toggle("is-stage", Boolean(!media && !link && e.target.closest("#stage")));
      ring.classList.toggle("is-hidden", Boolean(field));
      dot.classList.toggle("is-hidden", Boolean(field));
      ringLabel.textContent = media ? media.dataset.cursor : "";
      const pv = e.target.closest("[data-preview]");
      if (pv) showPreview(pv.dataset.preview, e);
      else if (fp.on) hidePreview();
    });
    window.addEventListener("mousedown", () => ring.classList.add("is-down"));
    window.addEventListener("mouseup", () => ring.classList.remove("is-down"));
    root.addEventListener("mouseleave", () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
      spot.inside = false;
    });
    root.addEventListener("mouseenter", () => {
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    });
  }

  /* ---------- Stage dust: specks drifting through the spotlight ---------- */
  const dust = { el: null, ctx: null, w: 0, h: 0, dpr: 1, parts: [] };
  function setupDust() {
    dust.el = $("#dust", view);
    dust.ctx = null;
    if (!dust.el) return;
    dust.ctx = dust.el.getContext("2d");
    sizeDust();
    dust.parts = Array.from({ length: 100 }, () => ({
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
  window.addEventListener("resize", sizeDust);
  function drawDust(t) {
    const { ctx, w, h } = dust;
    if (!ctx || !w) return;
    ctx.clearRect(0, 0, w, h);
    const sx = (spot.x / 100) * w;
    const sy = (spot.y / 100) * h;
    const R = Math.max(window.innerWidth, window.innerHeight) * 0.34 * dust.dpr;
    ctx.fillStyle = "#ffe2b8";
    for (const p of dust.parts) {
      p.x += p.vx + Math.sin(t / 1400 + p.o) * 0.08;
      p.y += p.vy;
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

  /* ---------- One animation loop for scroll and pointer motion ---------- */
  let lastY = window.scrollY;
  function frame(t) {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const page = current ? current.kind : "home";
    const menuOpen = document.body.classList.contains("menu-open");

    // Header: transparent over the stage, solid elsewhere, hides while scrolling down.
    const stage = page === "home" ? $("#stage", view) : null;
    const overStage = stage && y < stage.offsetHeight - header.offsetHeight;
    header.classList.toggle("on-dark", Boolean(overStage) && !menuOpen);
    header.classList.toggle("is-solid", !overStage && y > 8 && !menuOpen);
    if (!menuOpen && lb.hidden) {
      if (y > lastY + 4 && y > 320) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 120) header.classList.remove("is-hidden");
    }
    lastY = y;

    const prog = $("#progress");
    if (page === "project") {
      const max = document.documentElement.scrollHeight - vh;
      prog.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    } else prog.style.transform = "scaleX(0)";

    if (!reduceMotion) {
      // Stage: parallax and a spotlight that follows the pointer (or drifts on touch screens).
      if (stage && y < vh * 1.2) {
        const media = $("#heroMedia", view);
        if (media) media.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
        if (!(finePointer && spot.inside)) {
          spot.tx = 50 + Math.sin(t / 2600) * 10;
          spot.ty = 34 + Math.sin(t / 3700) * 6;
        }
        spot.x += (spot.tx - spot.x) * 0.08;
        spot.y += (spot.ty - spot.y) * 0.08;
        stage.style.setProperty("--sx", `${spot.x.toFixed(2)}%`);
        stage.style.setProperty("--sy", `${spot.y.toFixed(2)}%`);
        drawDust(t);
      }

      if (scrubEl && scrubWords.length) {
        const r = scrubEl.getBoundingClientRect();
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25));
        const n = Math.round(p * scrubWords.length);
        scrubWords.forEach((w, i) => (w.style.opacity = i < n ? "1" : "0.16"));
      }

      // Selected work: earlier cards sink back as the next one arrives.
      if (window.innerWidth > 860) {
        const items = $$(".stack__item", view);
        items.forEach((it, i) => {
          const fc = it.firstElementChild;
          const nextIt = items[i + 1];
          if (!nextIt) return;
          const h = fc.offsetHeight;
          const p = clamp((it.getBoundingClientRect().top + h - nextIt.getBoundingClientRect().top) / h);
          fc.style.transform = `scale(${1 - p * 0.07})`;
          const dim = $(".fcard__dim", fc);
          if (dim) dim.style.opacity = String(p * 0.55);
        });
      }

      if (finePointer) {
        cur.x += (cur.tx - cur.x) * 0.5;
        cur.y += (cur.ty - cur.y) * 0.5;
        cur.rx += (cur.tx - cur.rx) * 0.16;
        cur.ry += (cur.ty - cur.ry) * 0.16;
        dot.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
        ring.style.transform = `translate3d(${cur.rx}px, ${cur.ry}px, 0)`;
        if (floatPreview && fp.on) {
          const vx = fp.tx - fp.x;
          fp.x += vx * 0.14;
          fp.y += (fp.ty - fp.y) * 0.14;
          floatPreview.style.left = `${fp.x}px`;
          floatPreview.style.top = `${fp.y}px`;
          floatPreview.style.transform = `translate(-50%, -50%) scale(1) rotate(${clamp(vx * 0.05, -10, 10).toFixed(2)}deg)`;
        } else if (floatPreview && floatPreview.style.transform) floatPreview.style.transform = "";
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Page lifecycle ---------- */
  function cleanupPage() {
    io?.disconnect();
    vio?.disconnect();
    hidePreview();
    ring.classList.remove("is-media", "is-link", "is-stage");
    dot.classList.remove("is-media");
  }

  function initPage(route) {
    initScrub();
    initReveals();
    initVideos();
    setupDust();
    if (route.kind === "home") {
      const f = route.params.get("d");
      if (f && DISC[f]) applyFilter(f, false);
    }
  }

  navigate();
  requestAnimationFrame(frame);
})();
