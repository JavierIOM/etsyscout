#!/usr/bin/env node
// Etsy MCP server: read-only Etsy Open API v3 tools for Claude Desktop (or any MCP client).
// Zero dependencies. Speaks MCP over stdio, one JSON-RPC message per line.
//
// The API key is never passed in the client config. It comes from, in order:
//   1. ETSY_API_KEY already in the environment
//   2. ETSY_API_KEY read from the dotenv file named by ETSY_MCP_ENV_FILE
// The value must be "keystring:sharedsecret"; Etsy rejects the keystring on its own.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';

const SERVER_VERSION = '1.13.0';
const API = 'https://openapi.etsy.com/v3/application';
const MAX_TEXT = 150_000; // keep tool results a sane size for the client

const log = (...args) => process.stderr.write(`[etsy-mcp] ${args.join(' ')}\n`);

// ---------------------------------------------------------------- key loading

function readKeyFromEnvFile(path) {
  const file = path.replace(/^~(?=$|[\\/])/, homedir());
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    log(`could not read ETSY_MCP_ENV_FILE (${err.code})`);
    return undefined;
  }
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.trim().match(/^(?:export\s+)?ETSY_API_KEY\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[1].trim();
    if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
    else val = val.replace(/\s+#.*$/, '');
    return val || undefined;
  }
  return undefined;
}

let apiKey = process.env.ETSY_API_KEY;
if (!apiKey && process.env.ETSY_MCP_ENV_FILE) apiKey = readKeyFromEnvFile(process.env.ETSY_MCP_ENV_FILE);
if (!apiKey) log('no ETSY_API_KEY found; tools will return an error until one is set');
else if (!apiKey.includes(':')) log('ETSY_API_KEY has no ":"; Etsy needs "keystring:sharedsecret"');

// ---------------------------------------------------------------- Etsy client

class ToolError extends Error {}

async function etsy(path, query = {}) {
  if (!apiKey) throw new ToolError('ETSY_API_KEY is not set. Put it in the environment or point ETSY_MCP_ENV_FILE at a .env that has it.');
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  let res;
  try {
    res = await fetch(url, {
      headers: { 'x-api-key': apiKey, accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new ToolError(`Etsy request failed on ${path}: ${err.name === 'TimeoutError' ? 'timed out after 15s' : err.message}`);
  }
  const text = await res.text();
  if (!res.ok) throw new ToolError(`Etsy API ${res.status} on ${path}: ${text.slice(0, 500)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new ToolError(`Etsy API returned non-JSON on ${path}: ${text.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------- shaping

const iso = (ts) => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null);
const money = (p) => (p ? { amount: Number((p.amount / p.divisor).toFixed(2)), currency: p.currency_code } : null);
const cleanUrl = (u) => (u ? u.split('?')[0] : null);

function slimListing(l, { description = false } = {}) {
  const out = {
    listing_id: l.listing_id,
    title: l.title,
    price: money(l.price),
    favourites: l.num_favorers,
    views: l.views,
    quantity: l.quantity,
    tags: l.tags,
    materials: l.materials?.length ? l.materials : undefined,
    who_made: l.who_made,
    shop_id: l.shop_id,
    taxonomy_id: l.taxonomy_id,
    created: iso(l.original_creation_timestamp ?? l.created_timestamp ?? l.creation_timestamp),
    updated: iso(l.updated_timestamp ?? l.last_modified_timestamp),
    url: cleanUrl(l.url),
  };
  if (description) out.description = l.description;
  return out;
}

function slimShop(s) {
  return {
    shop_id: s.shop_id,
    shop_name: s.shop_name,
    title: s.title,
    url: cleanUrl(s.url),
    currency: s.currency_code,
    active_listings: s.listing_active_count,
    sales: s.transaction_sold_count,
    favourites: s.num_favorers,
    review_average: s.review_average,
    review_count: s.review_count,
    country: s.shop_location_country_iso,
    on_holiday: s.is_vacation,
    created: iso(s.created_timestamp ?? s.create_date),
    announcement: s.announcement ? s.announcement.slice(0, 500) : undefined,
  };
}

function slimReview(r) {
  return {
    listing_id: r.listing_id,
    rating: r.rating,
    review: r.review,
    language: r.language,
    created: iso(r.created_timestamp ?? r.create_timestamp),
  };
}

async function resolveShopId({ shop_id, shop_name }) {
  if (shop_id) return shop_id;
  if (!shop_name) throw new ToolError('Give either shop_id or shop_name.');
  const found = await etsy('/shops', { shop_name, limit: 25 });
  const exact = found.results?.find((s) => s.shop_name.toLowerCase() === shop_name.toLowerCase());
  const shop = exact ?? found.results?.[0];
  if (!shop) throw new ToolError(`No Etsy shop found matching "${shop_name}".`);
  return shop.shop_id;
}

// ---------------------------------------------------------------- tools

const sortProps = {
  sort_on: { type: 'string', enum: ['created', 'price', 'updated', 'score'], description: 'Sort field. "score" (relevance) only works with keywords.' },
  sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
};
const pageProps = {
  limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  offset: { type: 'integer', minimum: 0, default: 0 },
};
const shopProps = {
  shop_id: { type: 'integer', description: 'Numeric Etsy shop ID.' },
  shop_name: { type: 'string', description: 'Shop name as in the etsy.com/shop/<name> URL. Used when shop_id is not given.' },
};

const tools = [
  {
    name: 'etsy_search_listings',
    description: 'Search active Etsy listings by keyword. Returns the total match count plus a page of listings with price, favourites, views, tags and URL. Use it for market research: what sells, at what price, with which tags.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search terms, e.g. "laser cut coaster".' },
        ...pageProps,
        sort_on: { ...sortProps.sort_on, default: 'score' },
        sort_order: sortProps.sort_order,
        min_price: { type: 'number', description: 'Minimum price filter.' },
        max_price: { type: 'number', description: 'Maximum price filter.' },
        taxonomy_id: { type: 'integer', description: 'Limit to one seller taxonomy category.' },
        shop_location: { type: 'string', description: 'Limit to shops in this location, e.g. "United Kingdom".' },
        include_description: { type: 'boolean', default: false, description: 'Include full listing descriptions (much longer output).' },
      },
      required: ['keywords'],
    },
    async run(a) {
      const data = await etsy('/listings/active', {
        keywords: a.keywords,
        limit: a.limit ?? 25,
        offset: a.offset ?? 0,
        sort_on: a.sort_on ?? 'score',
        sort_order: a.sort_order ?? 'desc',
        min_price: a.min_price,
        max_price: a.max_price,
        taxonomy_id: a.taxonomy_id,
        shop_location: a.shop_location,
      });
      return { total: data.count, listings: data.results.map((l) => slimListing(l, { description: a.include_description })) };
    },
  },
  {
    name: 'etsy_get_listing',
    description: 'Full detail for one Etsy listing: title, description, price, tags, materials, stats, images and shop. Optionally its reviews.',
    inputSchema: {
      type: 'object',
      properties: {
        listing_id: { type: 'integer', description: 'The number in etsy.com/listing/<id>/...' },
        include_images: { type: 'boolean', default: true },
        include_reviews: { type: 'boolean', default: false, description: 'Also fetch up to 25 reviews for this listing.' },
      },
      required: ['listing_id'],
    },
    async run(a) {
      const includes = ['Shop', ...(a.include_images === false ? [] : ['Images'])];
      const [l, reviews] = await Promise.all([
        etsy(`/listings/${a.listing_id}`, { includes }),
        a.include_reviews ? etsy(`/listings/${a.listing_id}/reviews`, { limit: 25 }) : null,
      ]);
      const out = slimListing(l, { description: true });
      out.state = l.state;
      out.processing_days = l.processing_min != null ? [l.processing_min, l.processing_max] : undefined;
      out.personalisable = l.is_personalizable;
      if (l.shop) out.shop = { shop_id: l.shop.shop_id, shop_name: l.shop.shop_name, url: cleanUrl(l.shop.url) };
      if (l.images) out.images = l.images.map((i) => i.url_570xN ?? i.url_fullxfull);
      if (reviews) out.reviews = { total: reviews.count, items: reviews.results.map(slimReview) };
      return out;
    },
  },
  {
    name: 'etsy_find_shop',
    description: 'Look up Etsy shops by name. Returns shop ID, sales count, review average, active listing count, favourites and more.',
    inputSchema: {
      type: 'object',
      properties: {
        shop_name: { type: 'string', description: 'Full or partial shop name.' },
        limit: { type: 'integer', minimum: 1, maximum: 25, default: 5 },
      },
      required: ['shop_name'],
    },
    async run(a) {
      const data = await etsy('/shops', { shop_name: a.shop_name, limit: a.limit ?? 5 });
      return { total: data.count, shops: data.results.map(slimShop) };
    },
  },
  {
    name: 'etsy_shop_listings',
    description: "A shop's active listings with price, favourites, views and tags. Good for auditing a shop or studying a competitor.",
    inputSchema: {
      type: 'object',
      properties: {
        ...shopProps,
        ...pageProps,
        sort_on: { ...sortProps.sort_on, enum: ['created', 'price', 'updated'], default: 'created' },
        sort_order: sortProps.sort_order,
        include_description: { type: 'boolean', default: false },
      },
    },
    async run(a) {
      const shopId = await resolveShopId(a);
      const data = await etsy(`/shops/${shopId}/listings/active`, {
        limit: a.limit ?? 25,
        offset: a.offset ?? 0,
        sort_on: a.sort_on ?? 'created',
        sort_order: a.sort_order ?? 'desc',
      });
      return { shop_id: shopId, total: data.count, listings: data.results.map((l) => slimListing(l, { description: a.include_description })) };
    },
  },
  {
    name: 'etsy_shop_reviews',
    description: "A shop's most recent reviews: rating, text, date and which listing.",
    inputSchema: {
      type: 'object',
      properties: { ...shopProps, ...pageProps },
    },
    async run(a) {
      const shopId = await resolveShopId(a);
      const data = await etsy(`/shops/${shopId}/reviews`, { limit: a.limit ?? 25, offset: a.offset ?? 0 });
      return { shop_id: shopId, total: data.count, reviews: data.results.map(slimReview) };
    },
  },
  {
    name: 'etsy_api_get',
    description: 'Raw read-only GET against any Etsy Open API v3 endpoint that works with an API key alone, returning Etsy\'s JSON unchanged. Examples: /seller-taxonomy/nodes, /listings/{id}/images, /shops/{id}/sections, /listings/batch?listing_ids=1,2. Endpoints needing OAuth (receipts, orders, private shop data) will fail with 401/403.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path after /v3/application, e.g. "/seller-taxonomy/nodes".' },
        query: { type: 'object', description: 'Query parameters as key/value pairs.', additionalProperties: { type: ['string', 'number', 'boolean', 'array'] } },
      },
      required: ['path'],
    },
    async run(a) {
      const path = String(a.path).replace(/^(https:\/\/openapi\.etsy\.com)?\/v3\/application/, '');
      if (!/^\/[A-Za-z0-9_\-/]+$/.test(path)) throw new ToolError('path must look like "/listings/123/images" (letters, digits, -, _ and / only).');
      return etsy(path, a.query ?? {});
    },
  },
];

const toolsByName = new Map(tools.map((t) => [t.name, t]));

// ---------------------------------------------------------------- MCP plumbing

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function asText(data) {
  let text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT) + `\n\n[truncated at ${MAX_TEXT} characters; ask for fewer results]`;
  return text;
}

async function callTool(params) {
  const tool = toolsByName.get(params?.name);
  if (!tool) return { content: [{ type: 'text', text: `Unknown tool: ${params?.name}` }], isError: true };
  try {
    const data = await tool.run(params.arguments ?? {});
    return { content: [{ type: 'text', text: asText(data) }] };
  } catch (err) {
    if (!(err instanceof ToolError)) log(`tool ${tool.name} crashed: ${err.stack ?? err}`);
    return { content: [{ type: 'text', text: err.message }], isError: true };
  }
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;
  switch (method) {
    case 'initialize':
      return send({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? '2025-06-18',
          capabilities: { tools: {} },
          serverInfo: { name: 'etsy', title: 'Etsy (read-only)', version: SERVER_VERSION },
          instructions:
            'Read-only access to the public Etsy Open API v3. Prices come back in each shop\'s own currency. ' +
            'The key is limited to 5 requests a second and 5,000 a day, so prefer one well-aimed search over many small ones.',
        },
      });
    case 'ping':
      return isRequest && send({ jsonrpc: '2.0', id, result: {} });
    case 'tools/list':
      return send({ jsonrpc: '2.0', id, result: { tools: tools.map(({ run, ...t }) => t) } });
    case 'tools/call':
      return send({ jsonrpc: '2.0', id, result: await callTool(params) });
    default:
      if (isRequest) send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

const pending = new Set();
const rl = createInterface({ input: process.stdin });

rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }
  const p = handle(msg)
    .catch((err) => {
      log(`handler error: ${err.stack ?? err}`);
      if (msg.id !== undefined && msg.id !== null) send({ jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: 'Internal error' } });
    })
    .finally(() => pending.delete(p));
  pending.add(p);
});

rl.on('close', async () => {
  await Promise.allSettled([...pending]);
  process.exit(0);
});

log(`started v${SERVER_VERSION}`);
