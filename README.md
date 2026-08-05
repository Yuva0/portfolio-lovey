# Laveena Wadhwani — Speech-Language Pathologist

Static one-page website (HTML + CSS + vanilla JS), built to be served straight from GitHub Pages. No build step, no dependencies.

## Structure

```
index.html              all sections (hero, services, about, conditions,
                        process, testimonials, FAQs, blog, contact)
assets/css/styles.css   design tokens + all styling, responsive
assets/js/main.js       nav, scroll-spy, reveal animations, slider, form
assets/img/             hero illustration, portrait, favicon (SVG placeholders)
.nojekyll               tells GitHub Pages to serve files as-is
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push to GitHub:
   ```bash
   git add -A && git commit -m "Add site" && git push -u origin main
   ```
2. Repo → **Settings** → **Pages**
3. **Source**: `Deploy from a branch` → Branch `main` → folder `/ (root)` → Save

Live in ~1 minute at `https://<username>.github.io/<repo>/`.

Custom domain: add it under Settings → Pages, and commit a `CNAME` file containing the domain.

All asset paths are relative, so the site works from a repo subpath as well as a root domain.

## Live contact details (already wired in)

| What | Where |
|---|---|
| Phone `+91 98907 51148` | `index.html` — `tel:` link, `wa.me/919890751148` (3 places), JSON-LD |
| Email `laveenawadhwanislp@gmail.com` | `index.html` contact list + JSON-LD, `assets/js/main.js` mailto fallback |
| Instagram `@lav_aslp` | `index.html` contact list |

## Still placeholder — swap before going live

| What | Where |
|---|---|
| Hero photo | replace `assets/img/hero.svg` (or point the `<img>` at a `.jpg`) |
| Portrait photo | replace `assets/img/portrait.svg` |
| Testimonials, blog posts, FAQs | `index.html` — plain markup, edit in place |

### Contact form

The form currently falls back to opening the visitor's email client. To receive submissions in an inbox instead, create a free [Formspree](https://formspree.io) form and swap the endpoint:

```html
<form id="contactForm" action="https://formspree.io/f/abcdwxyz" method="POST">
```

`main.js` detects the real endpoint and switches to AJAX submit with inline success/error status — no page reload.

## Notes

- Fonts load from Google Fonts (Fraunces + Plus Jakarta Sans); everything else is local.
- Accessible: skip link, focus styles, ARIA on nav/slider/form, `prefers-reduced-motion` respected.
- Colors, radii, shadows and fonts are CSS custom properties at the top of `styles.css`.
