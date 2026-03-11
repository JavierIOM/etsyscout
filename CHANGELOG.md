# Changelog

All notable changes to Etsy Scout are documented here.

---

## [1.3.0] — 2026-03-11

### Added
- Listing thumbnails in results table — sourced from Etsy CDN (etsystatic.com); graceful fallback placeholder if no image found
- `render=true` added to scrape.do request to load full JS-rendered page for more results

### Changed
- JSON-LD and DOM scrapers now both always run and merge results (deduped by URL) — previously DOM was skipped if JSON-LD found anything

---

## [1.2.0] — 2026-03-11

### Added
- scrape.do fallback for when Etsy API key is pending or unavailable
  - Uses `https://www.etsy.com/uk/search?q=...` with `super=true` (no headless render)
  - Parses JSON-LD structured data first; falls back to DOM extraction via cheerio
  - Amber notice banner shown when scrape mode is active
  - Favorites/views columns hidden and stats card suppressed in scrape mode (data not available)
- `cheerio` dependency for HTML parsing in scrape fallback

### Changed
- `SCRAPE_DO_TOKEN` env var now activates fallback automatically if `ETSY_API_KEY` is absent

---

## [1.1.0] — 2026-03-10

### Added
- Export PDF button on results page — uses browser `window.print()` with a tailored print stylesheet (no extra dependencies)
- Print stylesheet hides search form, chips, header controls, and footer; renders stats, histogram, and listings table cleanly on white
- Print-only report header shows search query, active filters, and export date
- `print-color-adjust` ensures orange histogram bars render correctly in print/PDF output

---

## [1.0.0] — 2026-03-10

### Added
- Initial build: Astro 6 SSR + Tailwind v4 + Netlify adapter
- Keyword search against Etsy Open API v3 (server-side, API key never exposed)
- Sort options: relevance, newest, price
- Min/max price range filters
- Quick-click keyword chips for common 3D print and laser cut terms
- Stats dashboard: total listings found, average price, min/max price, average favorites
- Price distribution histogram (pure CSS bars, no JS chart library)
- Top 25 listings table ranked by favorites with clickable links
- Dark/light theme toggle — dark default, preference persisted to localStorage
- Etsy-inspired light theme: warm `#FAF7F4` background, `#222222` text, `#D9D9D9` borders
- Navy `#243B55` footer (Etsy-inspired) with version number and GitHub link
- Orange magnifying glass logo in header and favicon
- `noindex` meta tag (private tool)
- Accessible form labels (`for`/`id` associations on all inputs)
- Consistent focus rings across all interactive elements
- `title` attribute on clamped table links (shows full title on hover)
- 112.5% base font size for comfortable reading scale
- Node 22 specified in `netlify.toml` and `.nvmrc` (Astro 6 requirement)
- `.gitignore` includes `.claude/` and `.netlify/` build artifacts

---

## Notes

- Etsy API keys require manual approval — expect a wait after registration
- App name must not contain "etsy" — registered as "messy-scout"
- Shared secret not required for public listing searches (no OAuth)
