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

## Concept: a theatre programme

Selvana's story starts in theatre, so the site reads like a stage show and its printed programme:

- **The stage (hero).** The stage photo is dimmed, and a spotlight follows the cursor across the curtain. On phones the light drifts slowly on its own.
  - Over the photo, the name is set like a poster title, with a film-poster credits block underneath (roles, studio, school).
  - Three plain links follow: *See the work*, *Read the CV* and *Start a project*.
- **Intro and page changes.** Velvet curtains open on the first visit, and a curtain drops and lifts between pages.
- **Programme note.** A short statement lights up word by word as you read it. Beside it is a credits list of current and past roles, set with dot leaders.
- **Work index.** A numbered list of all 12 projects. On desktop, hovering a row shows a floating image of the project next to the cursor, and a **Grid** view is one click away. Both views filter by discipline, and the chosen view is remembered.
- **Project pages.**
  - A credits block (role, dot leaders, name) and a numbered scope list.
  - Gallery images carry plate numbers like a set of drawings ("PL. 03 / 16"). The lightbox counts the same way.
- **About & CV page.**
  - Name, role and key facts, a programme-style experience list and education.
  - "Selected credits", which lists every production with its role and links to it.
  - Expertise, tools and languages.
  - **Download CV (PDF)** prints the page as a clean CV through the print stylesheet.
- **Cursor.** On desktop it replaces the system cursor:
  - A small dot that inverts against any background, and a trailing ring.
  - Over links the ring grows. Over images it becomes a velvet disc that says what will happen (*View*, *Explore*, *Enlarge*, *Next*), and it shrinks briefly on click.
  - On the stage the ring widens to the edge of the spotlight. Text fields keep the normal text cursor.
- **Styling.** Buttons and labels are square-cornered and set in a drafting-style monospace, like annotations on a technical drawing, instead of rounded "app" pills.
- **Atmosphere.** Dust drifts through the spotlight beam and a fine film grain sits over the stage. The intro counts 000→100 while the stage loads and plays on every visit to the homepage.
- **Type in motion.**
  - Names and titles appear letter by letter.
  - Section labels decode like a typewriter as they appear.
  - Link text rolls up on hover.
  - The page-change curtain shows the name of the page you're going to.
- **Scroll and hover.**
  - The "With" brand ticker speeds up as you scroll and runs backwards when you scroll up.
  - Images lean slightly with scroll speed.
  - The index preview tilts as you move across rows, and portraits and project covers tilt in 3D under the cursor.
  - The lightbox zooms out of the thumbnail you clicked.
- **Scene marker.** A vertical "Scene 03 · Selected work" label on the right edge shows which part of the page you're in.
- **Arabic titles.** Arabic names are set in Aref Ruqaa, the closest free match to the calligraphy on the project boards. On Haret El Lamoun and Haret El Ghagar the Arabic title writes itself right to left.
- **Motion switch.** "Motion on/off" sits in the footer and the mobile menu. It follows the computer's reduced-motion setting by default and remembers the visitor's choice. With motion off, the custom cursor and all animation stop and every element is shown in place.

Fonts: Cormorant Garamond (display), Instrument Sans with its condensed widths (body and the credits block), IBM Plex Mono (labels), Aref Ruqaa (Arabic).

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
