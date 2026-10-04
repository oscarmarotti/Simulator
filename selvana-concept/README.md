# Selvana Essam — portfolio & CV concept

A working redesign of [selvana.art](https://www.selvana.art/) as a portfolio and CV, built from the UI/UX review.
It's a static site with no build step: plain HTML, CSS and JavaScript. All text, projects, images and films come from the current site, and media still loads from Selvana's Cloudinary account.

## Run it

```bash
cd selvana-concept
python3 -m http.server 8080   # then open http://localhost:8080
```

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell: header, mobile menu, footer, lightbox, curtains, cursor, WhatsApp button |
| `styles.css` | Design tokens, layout, motion states, and the one-page print layout for the CV |
| `app.js` | In-page router (`#/`, `#/work`, `#/work/<slug>`, `#/cv`, `#/contact`), page templates, motion, cursor |
| `data.js` | The 12 projects (titles, roles, facts, curated galleries, films) and the size of every image |
| `assets/` | Hero, portrait, social image, velvet texture, and `selvana-essam-cv.pdf` |

## Concept: a quiet stage

One idea per screen, images first, and very little text. Two typefaces (Cormorant Garamond for titles, Instrument Sans for text). Aref Ruqaa is used only for Arabic.

The home page:

1. **Stage.** The stage photo, with a spotlight that follows the cursor and dust in the beam. Within five seconds a visitor reads who she is (*Selvana Essam*), what she does (*Creative direction, branding & set design*), for whom (*brands, campaigns and spaces · Alexandria, Egypt*) and who has hired her (*COLT Coffee · Horse Park · Marbat · CHAI*). Scrolling closes the curtains, and "Act II — The work" invites the visitor in.
2. **Selected work.** Proof first: COLT Coffee (built), Closer and LAVERN as large stacking cards, each with its discipline and status.
3. **Approach.** One sentence.
4. **All projects.** Every project marked *Client*, *Concept* or *Study*, filterable by *Set design*, *Branding* or *Scenography*.
5. **About.** A portrait, two sentences and a link to the CV.
6. **Contact.** *Message on WhatsApp* and *Email me*, with one line in Arabic.

Project pages: title, a facts line (client · city · year · status), roles, cover, story, a curated gallery (5–12 images instead of everything), the next project and the contact block. COLT shows the 3D render next to the built drive-thru.

The About page is the CV, with a **Download CV (PDF)** button.

Motion: the full curtain intro plays once per visit; after that a short version. A curtain titled with the destination drops between pages, and the project title glides from that curtain into the page. The **Motion** switch in the footer turns animation off or on (it follows the system setting by default).

WhatsApp is everywhere: the header menu, the footer, every contact block, and a floating button on phones (hidden over the stage and next to the contact block).

## This round

**From the engineering, UI and motion reviews**

- Fast clicks between pages no longer leave the wrong page on screen; the router always settles on the latest address.
- The skip link and in-page links no longer open a "not found" page.
- Screen readers hear headings as words, not letters; the hidden menu and the page behind the lightbox can't be reached with Tab.
- Every image has its size set, so lazy loading works (the Bridge page loads 2 images up front instead of the whole gallery) and the page doesn't jump.
- Smooth scrolling loads only on desktop; the animation loop sleeps when nothing moves; the grain and spotlight stop when off screen.
- Films play only while visible, have a Pause button, and don't autoplay with reduced motion or data saver.
- Lightbox opens instantly with the thumbnail, then sharpens; it zooms back to where it came from.
- Tap targets are at least 44 px; focus rings are visible on dark sections.

**From the CV-reader, recruiter and psychology reviews**

1. The curtain closes and invites the visitor into "Act II — The work".
2. Clearer first five seconds (role, audience, city, clients on the stage).
3. Proof first: built and shot client work leads.
4. A facts line on every project. Unknown facts are shown as dashed placeholders (for example *Year?*), never guessed.
5. Curated galleries with a consistent shape.
6. WhatsApp everywhere.
7. A shorter intro after the first visit.
8. A touch of Arabic in the contact block.
9. A real one-page CV PDF.

## Questions for Selvana before going live

Every dashed placeholder on the site is listed here. Answers go into `data.js` (replace `{ "tbc": "Year?" }` with the value).

1. **For each project:** client name, city, year, and whether it was built, launched or shot. Who else was on the team, and what was her exact part?
2. **Titles:** is "Creative Director & Partner, Vana Creative Studio" the right title? Same for Vana Room and Bab Ashra.
3. **LAVERN or LAVERNE?** And what is "Atlantis Homme"?
4. **AI-assisted images.** Files named `ChatGPT_Image_…` (Haret El Lamoun, Haret El Ghagar, Re-Play) should be labelled honestly or replaced with her own renders.
5. **Availability:** open to freelance, full-time, relocation? A LinkedIn link and an email on her own domain would help recruiters.
6. **Her name in Arabic,** spelled the way she writes it.
7. **An on-set photo** of her working, for the stage or About section, and one or two short client quotes.
8. **English level:** keep "upper-intermediate" or reword?
9. **Name spellings** changed from the current site: CHAIi → CHAI, Hara El Lymon → Haret El Lamoun, Hara El Ghagar → Haret El Ghagar, and Smile Café vs "Smile Line" (the logo in the images).
10. **WhatsApp:** confirm +20 150 100 3126 is the number to use.

## CV PDF

`assets/selvana-essam-cv.pdf` is printed from the About page's print layout. To regenerate it after editing the CV, open `#/cv` in Chrome, choose Print → Save as PDF (A4, background graphics on), and save over the file.

## For production

This concept routes pages in-page (the URL shows `#/…` where the browser allows it). For search engines, rebuild the same templates as real pages, for example in Next.js (which the current site already uses). Each project and the CV would get its own URL and title, and the design would stay the same.
