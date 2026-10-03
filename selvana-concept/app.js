/* Selvana Essam — portfolio concept.
 * Vanilla JS, no build step: hash router, page templates and motion.
 * Motion is progressive: with prefers-reduced-motion everything is shown statically. */
(() => {
  "use strict";

  const PROJECTS = window.SELVANA.projects;
  const CLD = "https://res.cloudinary.com/dcnm3ysw5";
  const EMAIL = "selvanaessam778@gmail.com";
  const PHONE = "+201501003126";
  const PHONE_LABEL = "+20 150 100 3126";
  const WHATSAPP = "201501003126";
  const INSTAGRAM = "https://www.instagram.com/selvanaessam";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  if (!reduceMotion) root.classList.add("motion");
  if (finePointer && !reduceMotion) root.classList.add("has-cursor");

  /* One name per discipline, used everywhere on the site. */
  const DISC = {
    direction: {
      name: "Art Direction & Set Design",
      title: "Art Direction <em>&amp;</em> Set Design",
      desc: "Developing visual concepts and directing the look, feel and composition of spaces, sets and imagery — from the first idea to the final image.",
      tags: "Campaign sets · Props · Visual styling · Locations",
      preview: "closer",
    },
    branding: {
      name: "Branding & Creative Direction",
      title: "Branding <em>&amp;</em> Creative Direction",
      desc: "Building distinctive brand worlds through identity, strategy and art direction — one cohesive experience across every touchpoint.",
      tags: "Identity · Packaging · Campaigns · Brand spaces",
      preview: "colt-coffee",
    },
    scenography: {
      name: "Scenography & Spatial Design",
      title: "Scenography <em>&amp;</em> Spatial Design",
      desc: "Designing immersive environments that turn stories into physical spaces through composition, atmosphere, materials and detail.",
      tags: "Scenography · Locations · Interiors · 3D visualization",
      preview: "haret-el-lamoun",
    },
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
  const txt = (s) => (isArabic(s) ? `<span lang="ar" dir="rtl">${esc(s)}</span>` : esc(s));

  const imgUrl = (path, w) => {
    const trim = path.startsWith("e_trim/");
    return `${CLD}/image/upload/${trim ? "e_trim/" : ""}f_auto,q_auto,w_${w}/${trim ? path.slice(7) : path}`;
  };
  const srcset = (path, ws) => ws.map((w) => `${imgUrl(path, w)} ${w}w`).join(", ");
  const pic = (path, { alt = "", sizes = "100vw", cls = "", eager = false, ws = [480, 800, 1200, 1600] } = {}) =>
    `<img${cls ? ` class="${cls}"` : ""} src="${imgUrl(path, 1200)}" srcset="${srcset(path, ws)}" sizes="${sizes}" alt="${esc(alt)}" ${
      eager ? 'fetchpriority="high"' : 'loading="lazy"'
    } decoding="async">`;
  const videoTag = (path, w, label) =>
    `<video class="lazy-video" muted loop playsinline preload="none" aria-label="${esc(label)}" poster="${CLD}/video/upload/so_0,f_jpg,q_auto,w_${w}/${path}.jpg" data-src="${CLD}/video/upload/q_auto,w_${w}/${path}.mp4"></video>`;

  /* ---------- Shared blocks ---------- */
  const typeTag = (p) => (p.type === "Client project" ? "" : `<span class="card__tag">${esc(p.type.split(" ·")[0])}</span>`);

  const card = (p, i) => `
    <a class="card" href="#/work/${p.slug}" data-d="${p.discipline}" data-cursor="View" data-reveal style="--d:${(i % 3) * 0.08}s">
      <div class="card__media">
        ${typeTag(p)}
        ${pic(p.cover, { alt: `${p.title} — ${p.subtitle}`, sizes: "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw", ws: [480, 800, 1200] })}
        ${pic(p.hover, { alt: "", cls: "card__hover", sizes: "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw", ws: [480, 800, 1200] })}
      </div>
      <div class="card__info">
        <span class="card__disc">${esc(DISC[p.discipline].name)}</span>
        <h3 class="card__title">${esc(p.title)}<small>${txt(p.subtitle)}</small></h3>
      </div>
      <p class="card__sum">${esc(p.summary)}</p>
    </a>`;

  const contactHTML = () => `
    <section class="contact section" id="contact" aria-labelledby="contact-title">
      <div class="wrap">
        <p class="eyebrow" data-reveal>Contact</p>
        <div class="contact__grid">
          <div>
            <h2 id="contact-title" class="display contact__title" data-split>Have a brand, a set or a space <em>in mind?</em></h2>
            <p class="hero__sub" data-reveal>Tell me a little about it — a campaign, a café, a production — and let’s see what world it could become.</p>
            <div class="contact__direct" data-reveal>
              <div class="contact__line"><span>Email</span><span class="contact__val"><a href="mailto:${EMAIL}">${EMAIL}</a> <button class="copy" data-copy="${EMAIL}" aria-label="Copy email address">Copy</button></span></div>
              <div class="contact__line"><span>Phone</span><a href="tel:${PHONE}">${PHONE_LABEL}</a></div>
              <div class="contact__line"><span>Instagram</span><a href="${INSTAGRAM}" target="_blank" rel="noopener">@selvanaessam ↗</a></div>
              <div class="contact__line"><span>Based in</span><span class="contact__val">Alexandria, Egypt</span></div>
            </div>
          </div>
          <form class="form" id="brief" novalidate data-reveal style="--d:.15s">
            <div>
              <label for="f-name">Your name &amp; brand</label>
              <input id="f-name" name="name" autocomplete="name" placeholder="e.g. Mona — Lavender Café" />
            </div>
            <fieldset>
              <legend>What do you need?</legend>
              <div class="types">
                ${["Art direction", "Set design", "Branding", "Packaging", "Interior / space", "Scenography", "Something else"]
                  .map((t) => `<button type="button" class="type" aria-pressed="false">${t}</button>`)
                  .join("")}
              </div>
            </fieldset>
            <div>
              <label for="f-msg">Tell me about it</label>
              <textarea id="f-msg" name="message" placeholder="The project, the timing, and anything I should know"></textarea>
            </div>
            <div class="form__actions">
              <button class="btn btn--light magnetic" type="submit" data-via="email">Send by email <span class="arrow">→</span></button>
              <button class="btn btn--ghost magnetic" type="button" data-via="whatsapp">Send on WhatsApp</button>
            </div>
            <p class="form__note">Opens your email app or WhatsApp with the brief already written. Nothing is stored on this site.</p>
          </form>
        </div>
      </div>
    </section>`;

  /* ---------- Pages ---------- */
  function homeHTML() {
    const names = ["LAVERN", "COLT Coffee", "Horse Park", "Marbat", "CHAI", "Smile Café", "Closer", "Re-Play"];
    const track = names.map((n) => `<span class="marquee__item">${n}</span><span class="marquee__star" aria-hidden="true">✦</span>`).join("");
    const count = (d) => PROJECTS.filter((p) => p.discipline === d).length;

    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__media" id="heroMedia">
        <picture>
          <source media="(max-width: 699px)" srcset="assets/stage-portrait.webp" />
          <img src="assets/stage-1536.webp" srcset="assets/stage-960.webp 960w, assets/stage-1536.webp 1536w" sizes="100vw"
            alt="Selvana on a theatre stage in a gold gown, in front of a red velvet curtain" fetchpriority="high" />
        </picture>
      </div>
      <div class="hero__content" id="heroContent">
        <div>
          <p class="eyebrow hero__eyebrow" data-reveal style="--d:.05s">Selvana Essam · Creative Director · Alexandria</p>
          <h1 id="hero-title" class="display hero__title" data-split style="--d:.1s">Visual worlds for <em>brands,</em> stages &amp; spaces.</h1>
          <p class="hero__sub" data-reveal style="--d:.45s">I lead <strong>art direction, branding and set design</strong> — from the first idea to the finished set. Trained in scenography, building brands since 2020.</p>
          <div class="hero__ctas" data-reveal style="--d:.6s">
            <a class="btn btn--light magnetic" href="#/work">See the work <span class="arrow">→</span></a>
            <a class="btn btn--ghost magnetic" href="#/contact">Start a project</a>
          </div>
        </div>
        <div class="hero__side" data-reveal style="--d:.75s">
          <span class="status"><i></i>Open to new projects · 2026</span>
          <span class="scroll-cue">Scroll<i></i></span>
        </div>
      </div>
    </section>

    <section class="marquee" aria-label="Brands and productions: ${names.join(", ")}">
      <div class="marquee__track" aria-hidden="true">${track}</div>
      ${reduceMotion ? "" : `<div class="marquee__track" aria-hidden="true">${track}</div>`}
    </section>

    <section class="section" aria-labelledby="approach">
      <div class="wrap">
        <p class="eyebrow" data-reveal>The approach</p>
        <h2 id="approach" class="statement__text" data-scrub style="margin-top:28px">Theatre taught me that every space tells a story. Now I bring that to brands — designing the <em>identity</em>, the <em>set</em> and the <em>room</em> people walk into.</h2>
        <div class="stats">
          <div class="stat" data-reveal><div class="stat__num">2020</div><p class="stat__label">Directing brands since — starting with Vana Room</p></div>
          <div class="stat" data-reveal style="--d:.08s"><div class="stat__num"><span data-count="45">45</span>+</div><p class="stat__label">Creatives led as Team Leader at Bab Ashra Art Space</p></div>
          <div class="stat" data-reveal style="--d:.16s"><div class="stat__num" data-count="${PROJECTS.length}">${PROJECTS.length}</div><p class="stat__label">Selected projects across brands, sets &amp; spaces</p></div>
          <div class="stat" data-reveal style="--d:.24s"><div class="stat__num" data-count="3">3</div><p class="stat__label">Disciplines, one way of working — story first</p></div>
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="services" style="padding-top:0">
      <div class="wrap">
        <div class="section__head">
          <div><p class="eyebrow" data-reveal>What I do</p><h2 id="services" class="display h-lg" data-split>Three disciplines, <em>one story.</em></h2></div>
        </div>
        <div class="disc">
          ${Object.entries(DISC)
            .map(
              ([key, d], i) => `
            <a class="disc__row" href="#/work?d=${key}" data-disc="${key}" data-cursor="Explore" data-reveal style="--d:${i * 0.08}s">
              <span class="disc__num">0${i + 1}</span>
              <h3 class="disc__title">${d.title}</h3>
              <div class="disc__desc">${esc(d.desc)}<div class="disc__tags">${esc(d.tags)}</div></div>
              <span class="disc__go">${count(key)} projects <b aria-hidden="true">→</b></span>
              <div class="disc__thumbs" aria-hidden="true">${PROJECTS.filter((p) => p.discipline === key)
                .map((p) => pic(p.cover, { sizes: "132px", ws: [320] }))
                .join("")}</div>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="featured section" aria-labelledby="selected">
      <div class="wrap">
        <div class="section__head">
          <div><p class="eyebrow" data-reveal>Selected work</p><h2 id="selected" class="display h-lg" data-split>Three worlds, <em>start to finish.</em></h2></div>
          <a class="link-arrow" href="#/work" data-reveal>All ${PROJECTS.length} projects <span>→</span></a>
        </div>
        <div class="stack">
          ${FEATURED.map(bySlug)
            .map(
              (p, i) => `
            <div class="stack__item">
              <a class="fcard" href="#/work/${p.slug}" data-cursor="View">
                <div class="fcard__media">${
                  p.video ? videoTag(p.video, 1280, `${p.title} campaign film`) : pic(p.cover, { alt: p.title, sizes: "(max-width: 860px) 100vw, 60vw" })
                }</div>
                <div class="fcard__body">
                  <div>
                    <span class="fcard__num">0${i + 1} / 0${FEATURED.length}</span>
                    <h3 class="fcard__title">${esc(p.title)}</h3>
                    <p class="fcard__sub">${esc(p.summary)}</p>
                  </div>
                  <div class="fcard__meta"><span class="chip">${esc(DISC[p.discipline].name)}</span>${p.roles.map((r) => `<span class="chip">${esc(r)}</span>`).join("")}</div>
                </div>
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
        <div class="section__head">
          <div><p class="eyebrow" data-reveal>All projects</p><h2 id="all-work" class="display h-lg" data-split>The <em>work.</em></h2></div>
          <div class="filters" role="group" aria-label="Filter projects by discipline" data-reveal>
            <button class="filter" data-f="all" aria-pressed="true">All<sup>${PROJECTS.length}</sup></button>
            ${Object.entries(DISC)
              .map(([k, d]) => `<button class="filter" data-f="${k}" aria-pressed="false">${esc(d.name)}<sup>${count(k)}</sup></button>`)
              .join("")}
          </div>
        </div>
        <div class="grid" id="grid">${PROJECTS.map(card).join("")}</div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="process" style="padding-top:0">
      <div class="wrap">
        <div class="section__head">
          <div><p class="eyebrow" data-reveal>How a project runs</p><h2 id="process" class="display h-md" data-split>From the first brief <em>to the finished set.</em></h2></div>
        </div>
        <div class="process">
          ${[
            ["Listen & research", "Your brief, your audience and the story behind the brand. Research and references come first."],
            ["Concept & moodboard", "One clear idea, shown through moodboards and visual direction you can react to early."],
            ["Design & visualize", "The identity, set or space developed in detail — with 3D visualizations and technical drawings."],
            ["Build & direct", "Working with makers, designers and crews to take it from drawing to the finished set."],
          ]
            .map(
              ([t, d], i) => `<div class="step" data-reveal style="--d:${i * 0.1}s"><span class="step__num">0${i + 1}</span><h3 class="step__title">${t}</h3><p>${d}</p></div>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="hello" style="padding-top:0">
      <div class="wrap teaser">
        <figure class="teaser__img" data-reveal="img"><img src="assets/portrait.webp" alt="Portrait of Selvana Essam on stage" loading="lazy" decoding="async" /></figure>
        <div class="teaser__body">
          <p class="eyebrow" data-reveal>About</p>
          <h2 id="hello" class="display h-lg" data-split>Hi, I’m <em>Selvana.</em></h2>
          <p class="lead" data-reveal>A Creative Director and Art Director with a background in scenography.</p>
          <p class="muted" data-reveal>I grew up on stage — acting, singing and building décor — then studied scenography at the Faculty of Fine Arts. Since 2020 I’ve directed brands like Vana Room, and today I’m Creative Director &amp; Partner at Vana Creative Studio.</p>
          <a class="link-arrow" href="#/about" data-reveal>More about me <span>→</span></a>
        </div>
      </div>
    </section>

    ${contactHTML()}`;
  }

  function projectHTML(p) {
    const i = PROJECTS.indexOf(p);
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const d = DISC[p.discipline];
    const portrait = p.slug === "closer" || p.slug === "lavern";
    let lbIndex = 0;
    const gallery = p.gallery
      .map((g, k) => {
        const span = !portrait && k % 5 === 0 ? "g--full" : "";
        if (g.startsWith("video:")) {
          return `<figure class="g ${span}" data-reveal="img">${videoTag(g.slice(6), 1280, `${p.title} film ${k + 1}`)}</figure>`;
        }
        const sizes = span ? "(max-width: 600px) 100vw, 1400px" : "(max-width: 600px) 100vw, 50vw";
        return `<figure class="g ${span}" data-reveal="img" data-lb-i="${lbIndex++}" data-full="${imgUrl(g, 2000)}" data-cursor="Enlarge" tabindex="0" role="button" aria-label="Enlarge image ${k + 1} of ${esc(p.title)}">${pic(g, {
          alt: `${p.title} — image ${k + 1}`,
          sizes,
        })}</figure>`;
      })
      .join("");

    return `
    <article>
      <header class="p-head">
        <div class="wrap">
          <nav class="crumbs" aria-label="Breadcrumb" data-reveal>
            <a href="#/work">← All work</a><span aria-hidden="true">/</span><a href="#/work?d=${p.discipline}">${esc(d.name)}</a>
          </nav>
          <h1 class="display p-title" data-split>${esc(p.title)}</h1>
          <p class="eyebrow eyebrow--plain" data-reveal style="margin-top:18px">${txt(p.subtitle)}</p>
          <dl class="p-meta" data-reveal>
            <div><dt>Role</dt><dd>${esc(p.roles.join(", "))}</dd></div>
            <div><dt>Discipline</dt><dd>${esc(d.name)}</dd></div>
            <div><dt>Type</dt><dd>${esc(p.type)}</dd></div>
            <div><dt>Similar project?</dt><dd><a class="link-arrow" href="#/contact">Let’s talk <span>→</span></a></dd></div>
          </dl>
        </div>
      </header>

      <div class="wrap">
        <figure class="p-cover" data-reveal="img">${
          p.video ? videoTag(p.video, 1600, `${p.title} campaign film`) : pic(p.cover, { alt: `${p.title} — cover image`, eager: true, sizes: "100vw" })
        }</figure>
      </div>

      <section class="section section--tight" aria-label="About the project">
        <div class="wrap p-story">
          <aside class="p-story__aside">
            <p class="eyebrow" data-reveal>Scope</p>
            <ul class="scope" data-reveal>${p.scope.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          </aside>
          <div class="p-story__body">
            ${p.body.map((b, k) => `<p class="${k === 0 ? "lead" : ""}" data-reveal>${esc(b)}</p>`).join("")}
            ${p.renders ? `<p class="note" data-reveal>Includes 3D visualizations and concept renders</p>` : ""}
          </div>
        </div>
      </section>

      <section class="section section--tight" aria-label="Gallery" style="padding-top:0">
        <div class="wrap"><div class="gallery">${gallery}</div></div>
      </section>

      <a class="next" href="#/work/${next.slug}" data-cursor="Next">
        <div class="next__bg">${pic(next.cover, { alt: "", sizes: "100vw" })}</div>
        <div class="wrap">
          <p class="eyebrow">Next project · ${esc(DISC[next.discipline].name)}</p>
          <h2 class="display next__title">${esc(next.title)} <span aria-hidden="true">→</span></h2>
        </div>
      </a>
    </article>
    ${contactHTML()}`;
  }

  function aboutHTML() {
    const jobs = [
      ["2025 — Present", "Vana Creative Studio", "Creative Director & Partner", "I lead creative direction across branding, art direction, spatial design, set design and visual communication — from the first brief and research through execution — and coordinate with clients, designers and collaborators. Projects include COLT Coffee, Smile Café, CHAI, Marbat, Horse Park and Serj."],
      ["2020 — Present", "Vana Room", "Creative Director", "A local Egyptian home décor brand. I direct its visual direction, identity and creative language — product concepts, styling, packaging and visual communication — and contribute to positioning, product development and expansion."],
      ["2023 — 2026", "Bab Ashra Art Space", "Team Leader", "Led and coordinated a multidisciplinary team of 45+ instructors and art assistants, managing workflow, scheduling and day-to-day creative operations for workshops and creative programs."],
      ["Early years — University", "Theatre & Performing Arts", "Creative & performance background", "Years of acting, singing, stage décor and set environments — the foundation for storytelling, stage composition, atmosphere and audience experience, and the reason I studied scenography."],
    ];
    const skills = [
      ["Creative Direction", "Creative strategy, concept development, art direction, visual storytelling, brand direction"],
      ["Branding", "Brand identity, brand development, packaging, campaign direction, product styling, brand experience"],
      ["Spatial & Scenography", "Set design, scenography, spatial design, interior & exterior design, environmental design, 3D visualization"],
      ["Leadership", "Creative team leadership, project management, client communication, creative operations, presentation & pitching"],
      ["3D & Visualization", "3ds Max, V-Ray, Unreal Engine"],
      ["Design & Technical", "Photoshop, Illustrator, InDesign, AutoCAD, Canva"],
      ["Interactive / Experiential", "TouchDesigner, Resolume Arena, MadMapper"],
      ["Languages", "Arabic (native), English (upper-intermediate)"],
    ];
    return `
    <section class="a-hero" aria-labelledby="about-title">
      <div class="wrap a-hero__grid">
        <div>
          <p class="eyebrow" data-reveal>About</p>
          <h1 id="about-title" class="display a-hero__title" data-split>I build visual worlds — <em>story first.</em></h1>
          <ul class="facts" data-reveal>
            <li><span>Based in</span>Alexandria, Egypt</li>
            <li><span>Now</span>Creative Director &amp; Partner, Vana Creative Studio</li>
            <li><span>Studied</span>Scenography, Faculty of Fine Arts — 2026, Very Good with Honors</li>
            <li><span>Works on</span>Brand campaigns, identities, sets, interiors &amp; productions</li>
          </ul>
        </div>
        <figure class="a-hero__img" data-reveal="img"><img src="assets/portrait.webp" alt="Portrait of Selvana Essam on stage" decoding="async" /></figure>
      </div>
    </section>

    <section class="section section--tight" aria-label="Practice" style="padding-top:0">
      <div class="wrap pillars">
        ${[
          ["Practice", "A multidisciplinary Creative Director and Art Director with a background in scenography, set design, spatial design, branding and visual storytelling."],
          ["From research to execution", "Across studios, brands, cultural spaces and productions, I take concepts from research and narrative into cohesive identities, physical environments and immersive experiences."],
          ["Storytelling and space", "Theatre and scenography shaped how I design: around story, atmosphere, space — and the experience of the audience."],
        ]
          .map(([t, d], i) => `<div class="pillar" data-reveal style="--d:${i * 0.1}s"><h3>${t}</h3><p>${d}</p></div>`)
          .join("")}
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="exp">
      <div class="wrap">
        <div class="section__head"><div><p class="eyebrow" data-reveal>Experience</p><h2 id="exp" class="display h-md" data-split>Where I’ve <em>worked.</em></h2></div></div>
        <div class="timeline">
          ${jobs
            .map(
              ([when, org, role, desc]) =>
                `<div class="tl" data-reveal><span class="tl__when">${when}</span><h3 class="tl__org">${esc(org)}<span class="tl__role">${esc(role)}</span></h3><p class="tl__desc">${esc(desc)}</p></div>`
            )
            .join("")}
          <div class="tl" data-reveal><span class="tl__when">Graduated 2026</span><h3 class="tl__org">Faculty of Fine Arts<span class="tl__role">Scenography Department · Very Good with Honors</span></h3><p class="tl__desc">Graduation project: <a class="link-btn" href="#/work/bridge-to-terabithia">Bridge to Terabithia</a>. Focus on scenography, set design, spatial storytelling and visual world-building.</p></div>
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="skills">
      <div class="wrap">
        <div class="section__head"><div><p class="eyebrow" data-reveal>Expertise &amp; tools</p><h2 id="skills" class="display h-md" data-split>What I <em>bring.</em></h2></div></div>
        <div class="skills">${skills.map(([t, d]) => `<div class="skill" data-reveal><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
      </div>
    </section>

    ${contactHTML()}`;
  }

  const notFoundHTML = () => `
    <section class="a-hero"><div class="wrap">
      <p class="eyebrow">404</p>
      <h1 class="display a-hero__title">This scene <em>isn’t built yet.</em></h1>
      <p style="margin-top:28px"><a class="btn magnetic" href="#/">Back to the stage <span class="arrow">→</span></a></p>
    </div></section>`;

  /* ---------- Router ---------- */
  const view = $("#view");
  const header = $("#header");
  let current = null; // { key, kind }
  let firstRender = true;
  let navigating = false;

  function parseRoute() {
    const raw = location.hash.replace(/^#/, "") || "/";
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
    if (parts[0] === "about") return { key: "about", kind: "about", params };
    return { key: "404", kind: "404", params };
  }

  const TITLES = {
    home: "Selvana Essam — Creative Director · Art Direction, Branding & Set Design",
    about: "About — Selvana Essam, Creative Director",
    404: "Not found — Selvana Essam",
  };

  function render(route) {
    cleanupPage();
    if (route.kind === "home") view.innerHTML = homeHTML();
    else if (route.kind === "project") view.innerHTML = projectHTML(route.project);
    else if (route.kind === "about") view.innerHTML = aboutHTML();
    else view.innerHTML = notFoundHTML();

    document.title = route.kind === "project" ? `${route.project.title} — ${route.project.subtitle} · Selvana Essam` : TITLES[route.kind];
    document.body.dataset.page = route.kind;
    updateNav(route);
    current = route;
    initPage(route);
  }

  function updateNav(route) {
    $$(".nav a").forEach((a) => {
      const n = a.dataset.nav;
      const on =
        (n === "work" && (route.kind === "project" || route.target === "#work")) ||
        (n === "about" && route.kind === "about") ||
        (n === "contact" && route.target === "#contact");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function scrollToTarget(route, smooth) {
    if (route.target) {
      const el = $(route.target);
      if (el) {
        const anchor = route.target === "#work" ? $(".section__head", el) : el;
        const offset = route.target === "#work" ? header.offsetHeight + 24 : 0;
        const y = anchor.getBoundingClientRect().top + window.scrollY - offset;
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
    // Same page (e.g. Home → Work section): just move, no curtain.
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

  window.addEventListener("hashchange", navigate);

  /* ---------- First-visit intro: the curtain rises ---------- */
  function playIntro(route) {
    const intro = $("#intro");
    const heroContent = $("#heroContent");
    let seen = false;
    try {
      seen = sessionStorage.getItem("selvana-intro") === "1";
      sessionStorage.setItem("selvana-intro", "1");
    } catch {
      seen = false;
    }
    if (reduceMotion || seen || route.kind !== "home" || route.target) {
      if (heroContent) revealNow(heroContent);
      return;
    }
    intro.classList.add("is-playing");
    document.body.classList.add("is-locked");
    const heroImg = $("#heroMedia img");
    const ready = heroImg && !heroImg.complete ? new Promise((r) => heroImg.addEventListener("load", r, { once: true })) : Promise.resolve();
    Promise.all([Promise.race([ready, wait(1600)]), wait(1100)]).then(() => {
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
            const s = document.createElement("span");
            s.textContent = part;
            s.style.setProperty("--i", i++);
            w.appendChild(s);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add("split");
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
            const c = e.target.querySelector("[data-count]") || (e.target.matches("[data-count]") ? e.target : null);
            if (c) countUp(c);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    $$("[data-split]", view).forEach(splitWords);
    $$("[data-reveal], [data-split]", view).forEach((el) => {
      if (!el.closest("#heroContent")) io.observe(el);
    });
  }

  function countUp(el) {
    const to = Number(el.dataset.count);
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const k = clamp((t - t0) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Statement: words light up as you read down the page. */
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

  /* ---------- Work filter ---------- */
  function applyFilter(f, animate = true) {
    const grid = $("#grid");
    if (!grid) return;
    $$(".filter", view).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === f)));
    const cards = $$(".card", grid);
    const show = (c) => f === "all" || c.dataset.d === f;
    if (!animate || reduceMotion) {
      cards.forEach((c) => {
        c.hidden = !show(c);
        c.classList.remove("is-out");
        c.classList.add("is-in");
      });
      return;
    }
    cards.forEach((c) => {
      if (!show(c)) c.classList.add("is-out");
    });
    setTimeout(() => {
      cards.forEach((c) => {
        c.hidden = !show(c);
        if (show(c)) {
          c.classList.add("is-out", "is-in");
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove("is-out")));
        }
      });
    }, 320);
  }

  /* ---------- Discipline hover preview ---------- */
  let floatPreview = null;
  const fp = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  function initFloatPreview() {
    if (!finePointer || reduceMotion) return;
    if (!floatPreview) {
      floatPreview = document.createElement("div");
      floatPreview.className = "float-preview";
      floatPreview.setAttribute("aria-hidden", "true");
      floatPreview.innerHTML = Object.entries(DISC)
        .map(([k, d]) => `<img data-k="${k}" src="${imgUrl(bySlug(d.preview).cover, 600)}" alt="" loading="lazy">`)
        .join("");
      document.body.appendChild(floatPreview);
    }
    $$(".disc__row", view).forEach((row) => {
      row.addEventListener("mouseenter", (e) => {
        fp.x = fp.tx = e.clientX;
        fp.y = fp.ty = e.clientY;
        fp.on = true;
        floatPreview.classList.add("is-on");
        $$("img", floatPreview).forEach((im) => im.classList.toggle("is-on", im.dataset.k === row.dataset.disc));
      });
      row.addEventListener("mouseleave", () => {
        fp.on = false;
        floatPreview.classList.remove("is-on");
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbStage = $(".lightbox__stage", lb);
  const lbCount = $(".lightbox__count", lb);
  let lbItems = [];
  let lbIdx = 0;
  let lbReturn = null;

  function lbShow(i) {
    lbIdx = (i + lbItems.length) % lbItems.length;
    const it = lbItems[lbIdx];
    lbStage.innerHTML = `<img src="${it.dataset.full}" alt="${esc($("img", it).alt)}">`;
    const im = $("img", lbStage);
    const done = () => requestAnimationFrame(() => im.classList.add("is-in"));
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
    lbShow(i);
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
      history.replaceState(null, "", hash);
      current = parseRoute();
      return;
    }
    const type = e.target.closest(".type");
    if (type) {
      type.setAttribute("aria-pressed", String(type.getAttribute("aria-pressed") !== "true"));
      return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const value = copy.dataset.copy;
      const ok = () => toast("Email copied");
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(ok, () => toast(value));
      else toast(value);
      return;
    }
    const via = e.target.closest("[data-via]");
    if (via && via.dataset.via === "whatsapp") {
      e.preventDefault();
      sendBrief("whatsapp", via.closest("form"));
      return;
    }
    const g = e.target.closest("[data-lb-i]");
    if (g) lbOpen(Number(g.dataset.lbI));
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "brief") return;
    e.preventDefault();
    sendBrief("email", e.target);
  });

  function sendBrief(channel, form) {
    const name = form.elements.name.value.trim();
    const msg = form.elements.message.value.trim();
    const types = $$(".type[aria-pressed='true']", form).map((b) => b.textContent);
    const body = [
      "Hi Selvana,",
      "",
      msg || "I’d love to talk about a project.",
      "",
      types.length ? `What I need: ${types.join(", ")}` : "",
      name ? `— ${name}` : "",
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (channel === "whatsapp") {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    } else {
      const subject = `New project${types.length ? ` — ${types.join(", ")}` : ""}${name ? ` — ${name}` : ""}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

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

  /* ---------- Custom cursor + magnetic buttons ---------- */
  const cursor = $("#cursor");
  const cursorLabel = $(".cursor__label", cursor);
  const cur = { x: -100, y: -100, tx: -100, ty: -100 };
  if (finePointer && !reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      cur.tx = e.clientX;
      cur.ty = e.clientY;
      fp.tx = e.clientX;
      fp.ty = e.clientY;
    }, { passive: true });
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      const overField = e.target.closest("input, textarea");
      cursor.classList.toggle("is-big", Boolean(t));
      cursor.classList.toggle("is-hidden", Boolean(overField));
      cursorLabel.textContent = t ? t.dataset.cursor : "";
    });
    root.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    root.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));

    document.addEventListener("mousemove", (e) => {
      const m = e.target.closest(".magnetic");
      $$(".magnetic.is-pulled").forEach((el) => {
        if (el !== m) {
          el.classList.remove("is-pulled");
          el.style.transform = "";
        }
      });
      if (!m) return;
      const r = m.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      m.classList.add("is-pulled");
      m.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
    }, { passive: true });
  }

  /* ---------- Scroll-driven motion (one rAF loop) ---------- */
  let lastY = window.scrollY;
  function frame() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const page = current ? current.kind : "home";
    const menuOpen = document.body.classList.contains("menu-open");

    // Header: transparent over the hero, solid everywhere else, hides while scrolling down.
    const hero = page === "home" ? $(".hero", view) : null;
    const overHero = hero && y < hero.offsetHeight - header.offsetHeight;
    header.classList.toggle("on-dark", Boolean(overHero) && !menuOpen);
    header.classList.toggle("is-solid", !overHero && y > 8 && !menuOpen);
    if (!menuOpen && lb.hidden) {
      if (y > lastY + 4 && y > 320) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 120) header.classList.remove("is-hidden");
    }
    lastY = y;

    // Reading progress on project pages.
    const prog = $("#progress");
    if (page === "project") {
      const max = document.documentElement.scrollHeight - vh;
      prog.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    } else prog.style.transform = "scaleX(0)";

    if (!reduceMotion) {
      // Hero parallax.
      if (hero && y < vh * 1.2) {
        const media = $("#heroMedia", view);
        const content = $("#heroContent", view);
        if (media) media.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
        if (content) content.style.opacity = String(clamp(1 - y / (vh * 0.7)));
      }

      // Statement words.
      if (scrubEl && scrubWords.length) {
        const r = scrubEl.getBoundingClientRect();
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25));
        const n = Math.round(p * scrubWords.length);
        scrubWords.forEach((w, i) => w.classList.toggle("on", i < n));
      }

      // Featured stack: earlier cards sink back as the next one arrives.
      if (window.innerWidth > 860) {
        const items = $$(".stack__item", view);
        items.forEach((it, i) => {
          const fc = it.firstElementChild;
          const nextIt = items[i + 1];
          if (!nextIt) return;
          const h = fc.offsetHeight;
          const p = clamp((it.getBoundingClientRect().top + h - nextIt.getBoundingClientRect().top) / h);
          fc.style.transform = `scale(${1 - p * 0.08})`;
          const dim = $(".fcard__dim", fc);
          if (dim) dim.style.opacity = String(p * 0.55);
        });
      }

      // Cursor + discipline preview follow with easing.
      if (finePointer) {
        cur.x += (cur.tx - cur.x) * 0.22;
        cur.y += (cur.ty - cur.y) * 0.22;
        cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
        if (floatPreview && fp.on) {
          fp.x += (fp.tx - fp.x) * 0.14;
          fp.y += (fp.ty - fp.y) * 0.14;
          floatPreview.style.left = `${fp.x}px`;
          floatPreview.style.top = `${fp.y}px`;
        }
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Page lifecycle ---------- */
  function cleanupPage() {
    io?.disconnect();
    vio?.disconnect();
    if (floatPreview) floatPreview.classList.remove("is-on");
    fp.on = false;
    cursor.classList.remove("is-big");
  }

  function initPage(route) {
    initScrub();
    initReveals();
    initVideos();
    initFloatPreview();
    if (route.kind === "home") {
      const f = route.params.get("d");
      if (f && DISC[f]) applyFilter(f, false);
    }
    if (!reduceMotion) $$("[data-count]", view).forEach((c) => (c.textContent = "0"));
  }

  navigate();
  requestAnimationFrame(frame);
})();
