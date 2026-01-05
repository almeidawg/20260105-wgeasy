import { chromium, type Browser } from "playwright";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

type ScrapeInput = {
  termo?: string;
  url?: string;
};

type ScrapeResult = {
  imagem_url: string | null;
  fonte: string | null;
};

let browserPromise: Promise<Browser> | null = null;
let supabaseClient: SupabaseClient | null = null;

const cache = new Map<string, { data: ScrapeResult; expiresAt: number }>();
const CACHE_TTL_MS = Number(process.env.SCRAPER_CACHE_TTL_MS || 1000 * 60 * 60 * 24);
const MAX_CONCURRENT_SCRAPES = Number(process.env.SCRAPER_MAX_CONCURRENT || 2);
const SCRAPER_TABLE = process.env.SCRAPER_CACHE_TABLE || "scraping_cache";

let activeScrapes = 0;
const waitQueue: Array<() => void> = [];

function enqueue() {
  return new Promise<void>((resolve) => {
    if (activeScrapes < MAX_CONCURRENT_SCRAPES) {
      activeScrapes += 1;
      resolve();
      return;
    }
    waitQueue.push(() => {
      activeScrapes += 1;
      resolve();
    });
  });
}

function dequeue() {
  activeScrapes = Math.max(0, activeScrapes - 1);
  const next = waitQueue.shift();
  if (next) next();
}

function buildSearchUrl(termo: string) {
  return `https://www.leroymerlin.com.br/search?term=${encodeURIComponent(termo)}`;
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

function getCacheKey(input: ScrapeInput) {
  return crypto.createHash("sha1").update(JSON.stringify(input)).digest("hex");
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseClient = createClient(url, key, { auth: { persistSession: false } });
  return supabaseClient;
}

function extractFromHtml(html: string): string | null {
  const urls = new Set<string>();
  const add = (value?: string | null) => {
    if (!value) return;
    const url = value.trim();
    if (url.includes("cdn.leroymerlin.com.br/products/")) {
      urls.add(url);
    }
  };

  const matches = html.matchAll(/https?:\/\/cdn\.leroymerlin\.com\.br\/products\/[^"'\s)<>]+/gi);
  for (const match of matches) add(match[0]);

  const srcsetMatches = html.matchAll(/srcset="([^"]+)"/gi);
  for (const match of srcsetMatches) {
    match[1].split(",").forEach((part) => {
      const url = part.trim().split(" ")[0];
      add(url);
    });
  }

  const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogMatch?.[1]) add(ogMatch[1]);

  for (const url of urls) {
    if (/\.(png|jpg|jpeg|webp)(\?|$)/i.test(url)) {
      return url;
    }
  }

  return urls.size > 0 ? Array.from(urls)[0] : null;
}

async function scrapeLeroyImage(input: ScrapeInput): Promise<ScrapeResult> {
  const cacheKey = getCacheKey(input);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(SCRAPER_TABLE)
        .select("imagem_url, fonte")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (!error && data?.imagem_url) {
        const result = { imagem_url: data.imagem_url, fonte: data.fonte || null };
        cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
      }
    } catch {
      // Sem cache persistente disponível
    }
  }

  await enqueue();
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    let targetUrl = input.url || "";
    let fonte: string | null = null;

    if (!targetUrl && input.termo) {
      targetUrl = buildSearchUrl(input.termo);
      fonte = "leroy_search";
    }

    if (!targetUrl) {
      const result = { imagem_url: null, fonte: null };
      cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }

    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1200);
    const html = await page.content();
    const imagem_url = extractFromHtml(html);

    const result = {
      imagem_url: imagem_url || null,
      fonte: fonte || (input.url ? "page" : "leroy_search"),
    };
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    if (supabase && result.imagem_url) {
      try {
        await supabase.from(SCRAPER_TABLE).upsert({
          cache_key: cacheKey,
          imagem_url: result.imagem_url,
          fonte: result.fonte,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Ignora erro de persistência
      }
    }

    return result;
  } finally {
    await page.close();
    dequeue();
  }
}

export async function buscarImagemProduto(input: ScrapeInput): Promise<ScrapeResult> {
  return scrapeLeroyImage(input);
}
