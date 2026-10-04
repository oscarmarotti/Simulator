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
| `index.html` | Page shell: header, mobile menu, footer, lightbox, curtains, cursor |
| `styles.css` | Design tokens, layout, motion states, and the print layout for the CV |
| `app.js` | In-page router (`#/`, `#/work`, `#/work/<slug>`, `#/cv`, `#/contact`), page templates, motion, cursor |
| `data.js` | The 12 projects: titles, roles, scope, text, cover/hover images, galleries, films |
| `assets/` | Hero, portrait and social image, recompressed to WebP (2 MB PNG → 63 KB) |

## Concept: a quiet stage

One idea per screen, images first, and very little text. Two typefaces (Cormorant Garamond for titles, Instrument Sans for text) in two text sizes. Aref Ruqaa is used only for Arabic.

The home page has six parts:

1. **Stage.** The stage photo, dimmed. A spotlight follows the cursor (on phones it drifts) with dust floating in the beam. On top sit the name and one line.
2. **Approach.** One sentence, which lights up word by word as you scroll to it.
3. **Selected work.** Three projects as large images that stack as you scroll. Each shows only its title and discipline.
4. **All projects.** A list of titles. Hovering one shows its image next to the cursor and dims the rest. On phones each row has a thumbnail. It can be filtered by *Set design*, *Branding* or *Scenography*.
5. **About.** A portrait, two sentences and a link to the CV.
6. **Contact.** One large email address, plus WhatsApp, phone and Instagram.

The other pages:

- **Project pages:** title (the Arabic name writes itself on the two Arabic-named projects), one line of roles, the cover, the scope and text, the gallery and the next project.
- **About page (the CV):** experience, education and skills, plus a **Download CV** button that prints a clean CV.

Motion: on the first visit the curtain opens, and a curtain titled with the destination page drops between pages. Names appear letter by letter and images open with a curtain wipe. The lightbox zooms out of the thumbnail you clicked.

Cursor (desktop): a dot plus a trailing ring that grows over links and says *View* or *Enlarge* over images. Portraits and covers tilt slightly under it.

The **Motion** switch in the footer turns animation off or on. It follows the system setting by default.

Finishing touches:

- **Real velvet.** The intro curtain, the page-change curtain and the closing curtains use velvet taken from the stage photo itself (`assets/velvet.webp`, 23 KB).
- **The show ends as you scroll.** The stage stays pinned while the curtains close over it, then the site continues.
- **Smooth scrolling** on desktop ([Lenis](https://github.com/darkroomengineering/lenis)). Phones keep their native scrolling.
- **Images fade in** once loaded instead of popping in. Hovering a project starts loading its cover so the page opens instantly.
- **Sharpness.** Every image is served up to its original resolution (stored as `widths` in `data.js`) and never upscaled. The featured LAVERN card and cover use the sharpest still instead of the 960 px film, and the film sits in the gallery.
- **Clean cursor.** Dark ink on light sections, cream on dark ones, instead of colour inversion.
- **Fonts first.** The intro waits for the fonts, so the name never flashes in a fallback typeface.

## How each review issue was fixed

| Review issue | Fix |
| --- | --- |
| The first screen was a blank white page | The stage photo, name, role and links are on the first screen immediately |
| The top bar overlapped the content | The header is transparent only over the stage. Everywhere else it has a solid background with a blur, and it hides while you scroll down |
| The 3D carousel hid the work and showed text backwards | A front-facing work index and grid, plus three large featured projects |
| Names didn't match across the site | One name per discipline everywhere: **Art Direction & Set Design**, **Branding & Creative Direction**, **Scenography & Spatial Design** |
| There was no "work with me" moment | "Start a project" in the header, on the stage, on every project page and in the CV. The contact form opens email or WhatsApp with the brief already written and also copies it |
| "Featured" showed only one project | Three featured projects |
| The About photo cut off the face | The portrait is cropped from the stage photo with the face fully in frame |
| The homepage loaded 14–17 MB | Images are sized to the screen and lazy-loaded, and films only load and play while on screen |
| Grey labels were hard to read | Every text colour meets WCAG AA contrast |
| Possible AI-generated images | Projects whose own scope lists 3D work are labelled "Includes 3D visualizations and concept renders" |

## Confirm with the client before going live

1. **WhatsApp**: does +20 150 100 3126 have WhatsApp?
2. **Name spellings.** These were changed; please confirm each one:
   - **CHAIi → CHAI**: the logo in the renders reads "CHAI".
   - **Hara El Lymon → Haret El Lamoun** (حارة الليمون).
   - **Hara El Ghagar → Haret El Ghagar** (حارة الغجر).
   - **Smile Café**: the logo in the images says "Smile Line". Which name is correct?
3. **Portrait**: a proper portrait photo would beat the crop from the stage photo.
4. **Image files named `ChatGPT_Image_…`** (Haret El Lamoun, Haret El Ghagar, Re-Play): rename them on Cloudinary, and replace any that aren't Selvana's own renders.
5. **CV PDF**: the print layout works now. A designed PDF could replace it later.
6. **Arabic font**: the boards use a calligraphy font that isn't on Google Fonts. If the original font file is available, it can replace Aref Ruqaa in one line of `styles.css`.

## For production

This concept routes pages in-page (the URL shows `#/…` where the browser allows it). For search engines, rebuild the same templates as real pages, for example in Next.js (which the current site already uses). Each project and the CV would get its own URL and title, and the design would stay the same.
