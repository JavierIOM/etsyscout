import { c as createComponent } from './astro-component_DanuDC3M.mjs';
import 'piccolore';
import { g as createRenderInstruction, r as renderTemplate, h as renderSlot, i as renderHead, e as addAttribute, j as renderComponent, m as maybeRenderHead } from './ssr-function_Bw1o9fVB.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Etsy Scout" } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="dark"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"', '><meta name="robots" content="noindex, nofollow"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>', "</title><!-- Apply saved theme before paint to prevent flash --><script>\n      const saved = localStorage.getItem('theme');\n      if (saved === 'light') {\n        document.documentElement.classList.remove('dark');\n      } else {\n        document.documentElement.classList.add('dark');\n      }\n    <\/script>", '</head> <body class="min-h-screen bg-white dark:bg-[#0f1117] text-slate-900 dark:text-slate-200 transition-colors duration-200"> ', " </body></html>"])), addAttribute(Astro2.generator, "content"), title, renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/Gavin/OneDrive/Documents/GitHub/etsy-scout/src/layouts/Layout.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const query = Astro2.url.searchParams.get("q") ?? "";
  const sortBy = Astro2.url.searchParams.get("sort") ?? "score";
  const minPrice = Astro2.url.searchParams.get("min") ?? "";
  const maxPrice = Astro2.url.searchParams.get("max") ?? "";
  const QUICK_SEARCHES = [
    "3d printed",
    "laser cut",
    "laser engraved",
    "personalised gift",
    "custom name sign",
    "wall art",
    "cable organizer",
    "planter",
    "keychain",
    "coaster set"
  ];
  let results = { listings: [], totalCount: 0 };
  if (query && true) {
    results.error = "ETSY_API_KEY environment variable is not set.";
  }
  function getPrice(l) {
    return l.price.amount / l.price.divisor;
  }
  const prices = results.listings.map(getPrice);
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPriceFound = prices.length ? Math.min(...prices) : 0;
  const maxPriceFound = prices.length ? Math.max(...prices) : 0;
  const avgFavorites = results.listings.length ? results.listings.reduce((a, b) => a + b.num_favorers, 0) / results.listings.length : 0;
  function buildHistogram(prices2, buckets = 8) {
    if (!prices2.length) return [];
    const min = Math.min(...prices2);
    const max = Math.max(...prices2);
    const range = max - min || 1;
    const step = range / buckets;
    const bars = Array.from({ length: buckets }, (_, i) => ({
      label: `£${(min + i * step).toFixed(0)}`,
      count: 0,
      pct: 0
    }));
    for (const p of prices2) {
      const idx = Math.min(Math.floor((p - min) / step), buckets - 1);
      bars[idx].count++;
    }
    const maxCount = Math.max(...bars.map((b) => b.count), 1);
    bars.forEach((b) => b.pct = b.count / maxCount * 100);
    return bars;
  }
  const histogram = buildHistogram(prices);
  const topListings = [...results.listings].sort((a, b) => b.num_favorers - a.num_favorers).slice(0, 25);
  const fmt = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": query ? `Etsy Scout — ${query}` : "Etsy Scout" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<header class="border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex items-center justify-between gap-4"> <div> <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white"> <span class="text-orange-500">›</span> Etsy Scout
</h1> <p class="text-xs text-slate-400 dark:text-slate-500">Market research for 3D print &amp; laser cut sellers</p> </div> <!-- Theme toggle --> <button id="theme-toggle" aria-label="Toggle light/dark theme" class="p-2 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-xs font-medium"> <span class="dark:hidden">Dark</span> <span class="hidden dark:inline">Light</span> </button> </header> <main class="max-w-6xl mx-auto px-6 py-8 space-y-8"> <!-- Search form --> <form method="GET" class="space-y-4"> <div class="flex gap-3"> <label for="q" class="sr-only">Search Etsy listings</label> <input type="text" id="q" name="q"${addAttribute(query, "value")} placeholder="Search Etsy listings..." class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm" autofocus> <button type="submit" class="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors">
Search
</button> </div> <!-- Filters row --> <div class="flex flex-wrap gap-4 items-center text-sm"> <div class="flex items-center gap-2"> <label for="sort" class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Sort</label> <select id="sort" name="sort" class="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"> <option value="score"${addAttribute(sortBy === "score", "selected")}>Relevance</option> <option value="created"${addAttribute(sortBy === "created", "selected")}>Newest</option> <option value="price"${addAttribute(sortBy === "price", "selected")}>Price</option> </select> </div> <div class="flex items-center gap-2"> <span class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Price</span> <span class="text-slate-400 dark:text-slate-500 text-sm">£</span> <label for="min" class="sr-only">Minimum price</label> <input type="number" id="min" name="min"${addAttribute(minPrice, "value")} placeholder="Min" min="0" class="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"> <span class="text-slate-400 dark:text-slate-600">—</span> <span class="text-slate-400 dark:text-slate-500 text-sm">£</span> <label for="max" class="sr-only">Maximum price</label> <input type="number" id="max" name="max"${addAttribute(maxPrice, "value")} placeholder="Max" min="0" class="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"> </div> </div> </form> <!-- Quick search chips --> <div class="flex flex-wrap gap-2"> ${QUICK_SEARCHES.map((term) => renderTemplate`<a${addAttribute(`/?q=${encodeURIComponent(term)}`, "href")}${addAttribute(`px-3 py-1 rounded-full text-xs border transition-colors ${query === term ? "bg-orange-600 border-orange-600 text-white" : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`, "class")}> ${term} </a>`)} </div> <!-- Error state --> ${results.error && renderTemplate`<div class="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-4 text-red-700 dark:text-red-300 text-sm"> ${results.error} </div>`} <!-- Results --> ${results.listings.length > 0 && renderTemplate`<div class="space-y-8"> <!-- Stats cards --> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> ${[
    { label: "Listings found", value: results.totalCount.toLocaleString() },
    { label: "Avg price", value: fmt(avgPrice) },
    { label: "Price range", value: `${fmt(minPriceFound)} – ${fmt(maxPriceFound)}` },
    { label: "Avg favorites", value: Math.round(avgFavorites).toLocaleString() }
  ].map(({ label, value }) => renderTemplate`<div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-2 border-t-orange-600 rounded p-4"> <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">${label}</p> <p class="text-xl font-bold text-slate-900 dark:text-white">${value}</p> </div>`)} </div> <!-- Price histogram --> <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6"> <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-6">Price Distribution</h2> <div class="flex items-end gap-2" style="height: 10rem;"> ${histogram.map((bar) => renderTemplate`<div class="flex-1 flex flex-col items-center justify-end gap-1 h-full"> <span class="text-xs text-slate-400 dark:text-slate-500 leading-none">${bar.count}</span> <div class="w-full bg-orange-600 rounded-t transition-all"${addAttribute(`height: ${Math.max(bar.pct, 2)}%`, "style")}></div> <span class="text-xs text-slate-400 dark:text-slate-500 truncate w-full text-center leading-none pt-1">${bar.label}</span> </div>`)} </div> </div> <!-- Top listings table --> <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden"> <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800"> <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
Top ${topListings.length} Listings by Favorites
</h2> </div> <div class="overflow-x-auto"> <table class="w-full text-sm"> <thead class="border-b border-slate-200 dark:border-slate-800"> <tr class="text-left"> <th class="px-6 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Title</th> <th class="px-6 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-right">Price</th> <th class="px-6 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-right">Favorites</th> <th class="px-6 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-right">Views</th> </tr> </thead> <tbody class="divide-y divide-slate-200 dark:divide-slate-800"> ${topListings.map((listing, i) => renderTemplate`<tr class="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"> <td class="px-6 py-3"> <a${addAttribute(listing.url, "href")} target="_blank" rel="noopener noreferrer"${addAttribute(listing.title, "title")} class="text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2 leading-snug"> <span class="text-slate-400 dark:text-slate-600 mr-2 tabular-nums">${i + 1}.</span> ${listing.title} </a> </td> <td class="px-6 py-3 text-right font-mono font-semibold text-green-600 dark:text-green-400"> ${fmt(getPrice(listing))} </td> <td class="px-6 py-3 text-right text-slate-600 dark:text-slate-300"> ${listing.num_favorers.toLocaleString()} </td> <td class="px-6 py-3 text-right text-slate-400 dark:text-slate-500"> ${listing.views.toLocaleString()} </td> </tr>`)} </tbody> </table> </div> </div> </div>`} <!-- Empty state (no query yet) --> ${!query && renderTemplate`<div class="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded"> <p class="text-sm text-slate-400 dark:text-slate-500">Pick a quick search above or type a keyword to scout the market.</p> <p class="text-xs text-slate-300 dark:text-slate-700 mt-2">Searches return up to 100 live listings ranked by favorites.</p> </div>`} </main> ${renderScript($$result2, "C:/Users/Gavin/OneDrive/Documents/GitHub/etsy-scout/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/Gavin/OneDrive/Documents/GitHub/etsy-scout/src/pages/index.astro", void 0);
const $$file = "C:/Users/Gavin/OneDrive/Documents/GitHub/etsy-scout/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
