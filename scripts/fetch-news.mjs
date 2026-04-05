import Parser from 'rss-parser';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'web-experiments-news-bot/1.0' },
});

// Each section lists feeds in priority order. Items are collected from each
// feed in turn until `count` is reached (or all feeds are exhausted).
const SECTIONS = [
  {
    category: 'zaragoza',
    count: 10,
    feeds: [
      'https://www.elperiodicodearagon.com/rss/',
      'https://www.europapress.es/rss/rss.aspx?ch=00001&seccion=zaragoza',
    ],
  },
  {
    category: 'tennis',
    count: 6,
    feeds: [
      'https://feeds.bbci.co.uk/sport/tennis/rss.xml',
    ],
  },
  {
    category: 'videogames',
    count: 10,
    feeds: [
      'https://www.gamesindustry.biz/feed/news',
      'https://www.gamesindustry.biz/feed/features',
      'https://www.pcgamer.com/rss/',
      'https://www.rockpapershotgun.com/feed',
    ],
  },
];

async function fetchFeed(url) {
  console.log(`  Fetching ${url}`);
  const feed = await parser.parseURL(url);
  const source = new URL(url).hostname.replace(/^www\./, '');
  return feed.items.map((item) => ({
    title: item.title?.trim() ?? '',
    link: item.link ?? item.guid ?? '',
    source,
    date: item.pubDate ?? item.isoDate ?? '',
  }));
}

async function fetchSection({ category, count, feeds }) {
  console.log(`[${category}]`);
  const collected = [];
  const seen = new Set();

  for (const url of feeds) {
    if (collected.length >= count) break;
    try {
      const items = await fetchFeed(url);
      for (const item of items) {
        if (collected.length >= count) break;
        if (item.title && !seen.has(item.title)) {
          seen.add(item.title);
          collected.push(item);
        }
      }
      console.log(`  → ${collected.length}/${count} after ${url}`);
    } catch (err) {
      console.error(`  ✗ ${url}: ${err.message}`);
    }
  }

  console.log(`[${category}] done — ${collected.length} items`);
  return collected;
}

const data = { updated: new Date().toISOString() };

for (const section of SECTIONS) {
  data[section.category] = await fetchSection(section);
}

const outPath = join(__dirname, '..', 'news-data.json');
writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nWritten → ${outPath}`);
