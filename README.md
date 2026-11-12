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
2. Create a new app (note: "etsy" cannot be in the app name, so we use "messy-scout")
3. Copy the **Keystring** and the **Shared secret**

### 2. Environment variables

Create a `.env` file (see `.env.example`):

```
ETSY_API_KEY=your_keystring:your_shared_secret
```

The value is the keystring and shared secret joined by a colon. Etsy's v3 API sends both in the `x-api-key` header, and the keystring on its own is rejected with "Shared secret is required". No OAuth is needed because we only read public data.

### 3. Run locally

```sh
npm install
npm run dev
```

### 4. Deploy

Connect the GitHub repo to Netlify. Add `ETSY_API_KEY` as an environment variable in Netlify site settings. Requires Node 22.

## Claude Desktop MCP server

`mcp/etsy-mcp.mjs` gives Claude Desktop (or any MCP client) read-only Etsy tools using the same key. It has no dependencies and needs Node 18 or later.

| Tool | What it does |
| --- | --- |
| `etsy_search_listings` | Keyword search with price, favourites, views and tags |
| `etsy_get_listing` | One listing in full, with images and optional reviews |
| `etsy_find_shop` | Shop lookup by name: sales, reviews, listing count |
| `etsy_shop_listings` | A shop's active listings |
| `etsy_shop_reviews` | A shop's recent reviews |
| `etsy_api_get` | Raw GET on any key-only v3 endpoint |

Add it to `claude_desktop_config.json` (`%APPDATA%\Claude\` on Windows, `~/Library/Application Support/Claude/` on macOS), then fully quit and reopen Claude Desktop:

```json
{
  "mcpServers": {
    "etsy": {
      "command": "node",
      "args": ["/absolute/path/to/etsy-scout/mcp/etsy-mcp.mjs"],
      "env": { "ETSY_MCP_ENV_FILE": "/absolute/path/to/your/.env" }
    }
  }
}
```

The server reads `ETSY_API_KEY` from its own environment first, then from the dotenv file named by `ETSY_MCP_ENV_FILE`. Pointing at a file keeps the key out of the Claude config. Logs go to stderr, which Claude Desktop writes to `mcp-server-etsy.log` in its logs folder.

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
mcp/
  etsy-mcp.mjs         # Read-only Etsy MCP server for Claude Desktop
netlify.toml           # Build config (Node 22)
```

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
