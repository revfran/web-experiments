import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const URL = 'https://www.ing.es/cuenta-nomina-ing/plan-amigo-mgm';

// Text patterns that indicate the plan's current state.
// Checked case-insensitively against the full page body text.
const INACTIVE_PATTERNS = [
  'plan amigo está pausado',
  'plan amigo está temporalmente',
  'en estos momentos no está disponible',
  'no está disponible',
  'próximamente',
  'en pausa',
  'pausado',
];
const ACTIVE_PATTERNS = [
  'invita a tus amigos',
  'comparte tu código',
  'consigue hasta',
  'código de amigo',
  'recomienda',
  'plan amigo está activo',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'es-ES',
});
const page = await context.newPage();

let status = 'unknown';

try {
  console.log(`Navigating to ${URL} ...`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });

  // Give any lazy-loaded content a moment to settle.
  await page.waitForTimeout(2000);

  const bodyText = (await page.innerText('body')).toLowerCase();

  if (INACTIVE_PATTERNS.some((p) => bodyText.includes(p.toLowerCase()))) {
    status = 'inactive';
  } else if (ACTIVE_PATTERNS.some((p) => bodyText.includes(p.toLowerCase()))) {
    status = 'active';
  }

  console.log(`Status detected: ${status}`);
} catch (err) {
  console.error(`Check failed: ${err.message}`);
  status = 'unknown';
} finally {
  await browser.close();
}

const data = { status, checked: new Date().toISOString(), url: URL };
const outPath = join(__dirname, '..', 'ing-plan-data.json');
writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Written → ${outPath} (status: ${status})`);
