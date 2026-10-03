# Selvana Essam — portfolio redesign concept

A working redesign of [selvana.art](https://www.selvana.art/), built from the UI/UX review.
It's a static site with no build step: plain HTML, CSS and JavaScript. All text, projects, images and films come from her current site, and media still loads from her Cloudinary account.

## Run it

```bash
cd selvana-concept
python3 -m http.server 8080   # then open http://localhost:8080
```

Opening `index.html` directly also works.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell: header, mobile menu, footer, lightbox, curtains |
| `styles.css` | Design tokens (ivory, ink, velvet red, gold), layout, all motion states |
| `app.js` | Hash router (`#/`, `#/work`, `#/work/<slug>`, `#/about`, `#/contact`), page templates, motion |
| `data.js` | The 12 projects: titles, roles, scope, text, cover/hover images, galleries, films |
| `assets/` | Hero, portrait and social image, recompressed to WebP (2 MB PNG → 63 KB) |

## Concept: "the curtain rises"

Her story starts in theatre, so the motion uses stage language:

- **Intro.** On the first visit, two velvet curtains part to reveal her on stage. It plays once per session and lasts under 2 seconds.
- **Page changes.** A curtain drops and lifts between pages.
- **Headlines.** Lines rise word by word. Images open with a vertical "curtain wipe".
- **Approach statement.** The text lights up word by word as you scroll.
- **Featured projects.** Three cards stack like stage flats. Each one sinks back as the next arrives.
- **Disciplines.** Hovering a discipline shows a floating preview image. On phones the images show inline instead.
- **Work grid.** It can be filtered by discipline with an animated transition. Hovering a card swaps to a second image.
- **Desktop details.** A custom "View / Explore / Enlarge" cursor and buttons that pull slightly toward the pointer.
- **Reduced motion.** If the visitor's system asks for reduced motion, every animation is switched off and all content still shows.

## How each review issue was fixed

| Review issue | Fix |
| --- | --- |
| The first screen was a blank white page | The stage photo fills the first screen immediately, with a clear one-line offer and two buttons ("See the work", "Start a project") |
| The top bar overlapped the content | The header is transparent only over the hero. Everywhere else it has a solid background with a blur. It hides while you scroll down and returns when you scroll up |
| The 3D carousel hid the work and showed text backwards | Replaced with front-facing cards in a filterable grid, plus three large featured projects |
| Names didn't match across the site | One name per discipline everywhere: **Art Direction & Set Design**, **Branding & Creative Direction**, **Scenography & Spatial Design**. Typos fixed (see below) |
| There was no "work with me" moment | "Start a project" is always in the header, a "Let's talk" link sits on every project page, and a full contact section has a brief form that opens email or WhatsApp already filled in, plus a copy-email button |
| "Featured" showed only one project | Three featured projects |
| The About photo cut off her face | The portrait is now cropped from the stage photo with her face fully in frame |
| The homepage loaded 14–17 MB | Images are sized to the screen (`srcset`) and lazy-loaded, and films only load and play while on screen. A full homepage scroll is about 4.9 MB, and most of that is the LAVERN film |
| Grey labels were hard to read | Text colours were darkened to meet WCAG AA contrast |
| Possible AI-generated images | Projects whose own scope lists 3D work carry the label "Includes 3D visualizations and concept renders" |

Other additions:

- Accessibility: a skip link, visible focus states, a lightbox that works with the keyboard and with swipes, real alt text, and Arabic names marked as Arabic.
- Project pages: a reading-progress bar, a "Next project" link, and breadcrumbs back to the discipline.
- Social sharing: Open Graph tags and a preview image.

## Confirm with the client before going live

1. **"Open to new projects · 2026"**: is she actually taking work right now?
2. **WhatsApp**: does +20 150 100 3126 have WhatsApp?
3. **Name spellings.** I changed these; please confirm each one:
   - **CHAIi → CHAI**: the logo in the renders reads "CHAI".
   - **Hara El Lymon → Haret El Lamoun** (حارة الليمون).
   - **Hara El Ghagar → Haret El Ghagar** (حارة الغجر).
   - **Smile Café**: the logo in the images says "Smile Line". Which name is correct?
4. **Portrait**: a proper portrait photo would beat the crop from the stage photo.
5. **Image files named `ChatGPT_Image_…`** (Haret El Lamoun, Haret El Ghagar, Re-Play): rename them on Cloudinary. If any of them aren't her own renders, replace them.

## For production

This concept routes pages with `#`. For search engines, rebuild the same templates as real pages, for example in Next.js (which the current site already uses). Each project would get its own URL and title, and the design would stay the same.
