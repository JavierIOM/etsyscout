# Etsy Scout

Market research tool for Etsy sellers — search live listings by keyword and instantly see price distribution, popularity rankings, and market trends.

Built for Javier's 3D printing and laser cutting Etsy shop.

## Features

- Keyword search with sort (relevance, newest, price) and price range filters
- Quick-click chips for common 3D print and laser cut search terms
- Stats dashboard: total listings, average price, min/max price, average favorites
- Price distribution histogram (pure CSS, no JS charting library)
- Top 25 listings ranked by favorites with direct links to each listing
- Dark theme by default with light theme toggle (preference saved to localStorage)
- Etsy-inspired light theme colour palette

## Stack

- [Astro 6](https://astro.build) — SSR, server-rendered per request
- [Tailwind CSS v4](https://tailwindcss.com) — via `@tailwindcss/vite`
- [Netlify](https://netlify.com) — hosting + serverless functions
- [Etsy Open API v3](https://developers.etsy.com) — live listing data

## Setup

### 1. Get an Etsy API key

1. Go to [etsy.com/developers](https://www.etsy.com/developers) and sign in
2. Create a new app (note: "etsy" cannot be in the app name — we use "messy-scout")
3. Copy the **Keystring** — this is your API key

### 2. Environment variables

Create a `.env` file (see `.env.example`):

```
ETSY_API_KEY=your_keystring_here
```

The shared secret is not required — we only query public listings (no OAuth needed).

### 3. Run locally

```sh
npm install
npm run dev
```

### 4. Deploy

Connect the GitHub repo to Netlify. Add `ETSY_API_KEY` as an environment variable in Netlify site settings. Requires Node 22.

## Project Structure

```
src/
  layouts/
    Layout.astro       # Base HTML, theme toggle script, footer
  pages/
    index.astro        # Main page — search, fetch, stats, UI
  styles/
    global.css         # Tailwind import + dark mode variant config
public/
  favicon.svg          # Orange magnifying glass logo
netlify.toml           # Build config (Node 22)
```

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
