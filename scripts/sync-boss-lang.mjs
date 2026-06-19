import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOSS_LANG_DIR = process.env.BOSS_LANG_DIR ?? 'D:/PIQSOFT/piqoff/www/src/boss/meta/lang';
const OUT_DIR = join(__dirname, '../apps/boss-mobile/locale');

const LANGS = ['tr.js', 'fr.js', 'en.js'];

mkdirSync(OUT_DIR, { recursive: true });

for(const file of LANGS)
{
  const srcPath = join(BOSS_LANG_DIR, file);
  const raw = readFileSync(srcPath, 'utf8');
  const outPath = join(OUT_DIR, file.replace('.js', '.ts'));
  writeFileSync(outPath, `// @ts-nocheck — Boss meta/lang birebir kopya (duplicate key'ler legacy JS ile uyumlu)\n${raw}\n`, 'utf8');
  console.log(`[sync-boss-lang] ${srcPath} -> ${outPath}`);
}

console.log('[sync-boss-lang] done — Boss meta/lang dosyalari birebir kopyalandi');
