# Changelog

All notable changes to Etsy Scout are documented here.

---

## [1.12.0] — 2026-04-16

### Added
- Listing Analyser now fetches own listing data via the Etsy API (title, description, tags, price, reviews) — faster and more reliable than scraping
- Current tags displayed in the "Your Listing" summary card with unused slot count highlighted
- AI tag suggestions now show exactly how many slots they fill ("brings you to X/13")

### Changed
- AI is now told about existing tags and only suggests NEW ones to fill remaining slots — no more duplicate suggestions
- Tag suggestion count is dynamic: always fills up to the 13-tag limit exactly
- Reverted AI model to `claude-haiku-4-5-20251001` — Sonnet was hitting Netlify's 10s timeout

### Fixed
- Listing Analyser no longer requires `SCRAPE_DO_TOKEN` if `ETSY_API_KEY` is set — falls back to scrape.do only if API unavailable

---

## [1.11.0] — 2026-04-16

### Added
- New `/shop` page — Shop Audit tool: enter your Etsy shop name to get a full audit of all active listings
- Rules-based analysis per listing: title length, tag count (out of 13), description length
- Per-listing score (0–100) with issues (red) and warnings (amber) flagged inline
- Listings sorted worst-first so the most urgent fixes are at the top
- "Analyse" button per listing links directly to the Listing Analyser with the URL pre-filled
- Shop Audit added to nav on Market Search and Listing Analyser pages

---

## [1.10.0] — 2026-04-16

### Added
- "Copy tags" button on the keyword frequency panel — copies top 13 keywords to clipboard in comma-separated format, ready to paste into Etsy tags

---

## [1.9.0] — 2026-03-12

### Fixed
- Claude AI suggestions broken — corrected model ID from `claude-haiku-4-5` to `claude-haiku-4-5-20251001` (Anthropic API now requires fully-qualified model IDs)

---

## [1.8.0] — 2026-03-11

### Fixed
- Price extraction for `ProductGroup` variant listings — Etsy uses `hasVariant[]` instead of `offers` on the top-level JSON-LD block; now iterates variants and takes the maximum GBP price
- Removed greedy `£XX.XX` regex fallback that was matching unrelated prices from related listings on the page
- Removed broken Etsy embedded JSON regex fallbacks that returned wrong prices

---

## [1.7.0] — 2026-03-11

### Added
- AI-generated description bullet points inside the "Description missing key information" recommendation card — specific, product-aware examples (size, material, colour) rather than generic advice
- AI-generated pricing copy inside price recommendations — a ready-to-use description sentence to justify under/over pricing
- Extended AI prompt: passes missing description elements and price ratio to Claude so suggestions are context-aware
- `descriptionBullets` and `pricingCopy` fields added to AI response schema

### Fixed
- £0.00 price on variant listings — Etsy uses `AggregateOffer` with `lowPrice` instead of `price` when a listing has size/colour variants; now falls back correctly

---

## [1.6.0] — 2026-03-11

### Added
- Claude AI suggestions in Listing Analyser — generates a specific improved title and 7 suggested tags based on the actual listing + competitor data
- AI explanation: one sentence describing the key change made and why
- Uses `claude-haiku-4-5` for fast response within Netlify function timeout
- Requires `ANTHROPIC_API_KEY` env var in Netlify — degrades gracefully if absent

---

## [1.5.0] — 2026-03-11

### Added
- New `/analyse` page — Listing Analyser tool
  - Paste any Etsy listing URL to get a full competitive breakdown
  - Scrapes your listing details (title, price, reviews, sales, description) via scrape.do
  - Auto-derives competition search query from your title keywords
  - Fetches competing listings in parallel for speed
  - Recommendations engine: price positioning, title length, trademark risk, description gaps, review status, cross-sell opportunities
  - Keyword Gap panel: words appearing in competitor titles that are missing from yours
  - Competition price distribution histogram with your price highlighted
  - Market stats: competing listings, sweet spot, avg/range
- Navigation links (Market Search / Listing Analyser) added to both pages

---

## [1.4.0] — 2026-03-11

### Added
- Market Intelligence panel: Market Verdict, Competition Level, Price Sweet Spot — shown above raw stats
- Keyword frequency panel: top 15 words from competitor listing titles with proportional bars — use in your own listing title and tags
- Market Verdict logic: OPPORTUNITY / EMERGING / NICHE / SATURATED based on listing count + avg favorites (API) or count alone (scrape)
- Competition level: LOW / MEDIUM / HIGH with badge showing total listing count
- Price Sweet Spot: median of top-favorited listings (API) or overall median (scrape)
- 8-second fetch timeout on scrape.do requests to prevent Netlify function crashes

### Fixed
- Reverted `render=true` on scrape.do — was causing Netlify function timeout crashes (10s limit exceeded)
- Top listings table now sorts by price ascending in scrape mode (favorites all zero — not meaningful)

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
