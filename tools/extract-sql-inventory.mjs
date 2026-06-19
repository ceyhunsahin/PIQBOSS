/**
 * Faz 0 — legacy Boss/Resp dashboard SQL envanteri.
 * Kaynak: piqoff repo (salt okunur).
 * Cikti:
 *   - SQL govdeleri (registry JSON) → piqoff/plugins/queries (backend; BOSS_MIMARI.md Bolum 24)
 *   - queryId sabitleri + docs → bu repo (frontend: packages/shared, docs/)
 *
 * PIQOFF_ROOT=D:/PIQSOFT/piqoff node tools/extract-sql-inventory.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARGE_ROOT = path.resolve(__dirname, '..');
const PIQOFF_ROOT = process.env.PIQOFF_ROOT ?? 'D:/PIQSOFT/piqoff';

const SOURCES = [
  { file: 'www/src/boss/pages/dashboard.js', prefix: 'BOSS_POS', label: 'Boss POS' },
  { file: 'www/src/boss/pages/dashboardOff.js', prefix: 'BOSS_OFF', label: 'Boss OFF' },
  { file: 'www/src/boss/pages/dashboardRest.js', prefix: 'BOSS_REST', label: 'Boss REST' },
  { file: 'www/src/resp/pages/dashboard.js', prefix: 'RESP', label: 'Resp' }
];

function findQueryObjectBlock(content)
{
  const marker = 'this.query';
  let idx = content.indexOf(marker);
  if(idx === -1)
  {
    return null;
  }
  idx = content.indexOf('=', idx);
  if(idx === -1)
  {
    return null;
  }
  let start = content.indexOf('{', idx);
  if(start === -1)
  {
    return null;
  }
  let depth = 0;
  let i = start;
  let state = 'code';
  while(i < content.length)
  {
    const c = content[i];
    if(state === 'code')
    {
      if(c === '/' && content[i + 1] === '/')
      {
        i += 2;
        while(i < content.length && content[i] !== '\n')
        {
          i++;
        }
        continue;
      }
      if(c === '/' && content[i + 1] === '*')
      {
        i += 2;
        while(i < content.length - 1 && !(content[i] === '*' && content[i + 1] === '/'))
        {
          i++;
        }
        i += 2;
        continue;
      }
      if(c === '"' || c === "'" || c === '`')
      {
        state = c;
        i++;
        continue;
      }
      if(c === '{')
      {
        depth++;
      }
      else if(c === '}')
      {
        depth--;
        if(depth === 0)
        {
          return content.slice(start, i + 1);
        }
      }
    }
    else if(state === '`')
    {
      if(c === '\\')
      {
        i += 2;
        continue;
      }
      if(c === '`')
      {
        state = 'code';
      }
    }
    else
    {
      if(c === '\\')
      {
        i += 2;
        continue;
      }
      if(c === quoteChar(state, c))
      {
        state = 'code';
      }
    }
    i++;
  }
  return null;
}

function quoteChar(state, c)
{
  return state;
}

function readStringAt(block, pos)
{
  const c = block[pos];
  if(c !== '"' && c !== "'" && c !== '`')
  {
    return null;
  }
  let i = pos + 1;
  let out = '';
  while(i < block.length)
  {
    const ch = block[i];
    if(ch === '\\')
    {
      out += block[i + 1] ?? '';
      i += 2;
      continue;
    }
    if(ch === c)
    {
      return { value: out, end: i + 1 };
    }
    out += ch;
    i++;
  }
  return null;
}

function parseParamArray(block, startIdx)
{
  const open = block.indexOf('[', startIdx);
  if(open === -1 || open > startIdx + 20)
  {
    return [];
  }
  let depth = 0;
  let i = open;
  while(i < block.length)
  {
    if(block[i] === '[')
    {
      depth++;
    }
    else if(block[i] === ']')
    {
      depth--;
      if(depth === 0)
      {
        const inner = block.slice(open + 1, i);
        const params = [];
        const re = /['"]([^'"]+)['"]/g;
        let m;
        while((m = re.exec(inner)))
        {
          params.push(m[1]);
        }
        return params;
      }
    }
    i++;
  }
  return [];
}

function parseNamedQueries(block)
{
  const entries = [];
  const keyRe = /(?:^|,|\n)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/g;
  let m;
  while((m = keyRe.exec(block)))
  {
    const key = m[1];
    const objStart = m.index + m[0].lastIndexOf('{');
    let depth = 0;
    let i = objStart;
    let state = 'code';
    while(i < block.length)
    {
      const c = block[i];
      if(state === 'code')
      {
        if(c === '"' || c === "'" || c === '`')
        {
          state = c;
        }
        else if(c === '{')
        {
          depth++;
        }
        else if(c === '}')
        {
          depth--;
          if(depth === 0)
          {
            const objBody = block.slice(objStart + 1, i);
            const qIdx = objBody.search(/query\s*:/);
            if(qIdx === -1)
            {
              break;
            }
            const qColon = objBody.indexOf(':', qIdx);
            let p = qColon + 1;
            while(p < objBody.length && /\s/.test(objBody[p]))
            {
              p++;
            }
            const str = readStringAt(objBody, p);
            if(str)
            {
              const paramIdx = objBody.search(/param\s*:/);
              const param = paramIdx >= 0 ? parseParamArray(objBody, paramIdx) : [];
              entries.push({ key, query: str.value.trim(), param });
            }
            break;
          }
        }
      }
      else if(state === '`')
      {
        if(block[i] === '\\')
        {
          i++;
        }
        else if(block[i] === '`')
        {
          state = 'code';
        }
      }
      else if(block[i] === '\\')
      {
        i++;
      }
      else if(block[i] === state)
      {
        state = 'code';
      }
      i++;
    }
  }
  return entries;
}

function classifyAdditive(query)
{
  const q = query.toUpperCase();
  if(/\bAVG\s*\(/.test(q))
  {
    return 'non-additive';
  }
  if(/\bCOUNT\s*\(\s*DISTINCT\b/.test(q))
  {
    return 'non-additive';
  }
  if(/\bTOP\s+\d+/.test(q) && !/\bGROUP\s+BY\b/.test(q))
  {
    return 'non-additive';
  }
  if(/\bSUM\s*\(/.test(q) || /\bCOUNT\s*\(\s*\*/.test(q) || /\bCOUNT\s*\(\s*[A-Z_]+\)/.test(q))
  {
    if(/\bGROUP\s+BY\b/.test(q) && !/\bCONVERT\s*\(\s*NVARCHAR\s*\(\s*10\s*\)/.test(q))
    {
      return 'non-additive';
    }
    return 'additive';
  }
  return 'review';
}

function toQueryIdConstant(queryId)
{
  return queryId.replace(/[^A-Z0-9_]/gi, '_').toUpperCase();
}

function writeMarkdown(entries)
{
  const byModule = {};
  for(const e of entries)
  {
    if(!byModule[e.module])
    {
      byModule[e.module] = [];
    }
    byModule[e.module].push(e);
  }
  let md = `# Faz 0 — SQL Envanteri (Boss / Resp mobil)\n\n`;
  md += `> Kaynak: \`${PIQOFF_ROOT}\` (salt okunur). Uretim: \`npm run faz0:inventory\`\n\n`;
  md += `| Metrik | Deger |\n|---|---|\n`;
  md += `| Toplam queryId | ${entries.length} |\n`;
  md += `| Additive | ${entries.filter(e => e.additive === 'additive').length} |\n`;
  md += `| Non-additive | ${entries.filter(e => e.additive === 'non-additive').length} |\n`;
  md += `| Review gerekli | ${entries.filter(e => e.additive === 'review').length} |\n\n`;
  for(const [module, list] of Object.entries(byModule))
  {
    md += `## ${module} (${list.length})\n\n`;
    md += `| queryId | Legacy key | param | additive |\n`;
    md += `|---|---|---|---|\n`;
    for(const e of list)
    {
      md += `| \`${e.queryId}\` | \`${e.key}\` | ${e.param.length} | ${e.additive} |\n`;
    }
    md += `\n`;
  }
  const outPath = path.join(ARGE_ROOT, 'docs/FAZ0_SQL_ENVANTER.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, 'utf8');
  console.log('Wrote', outPath);
}

function writeQueryIdsTs(entries)
{
  const lines = [
    '/** Otomatik uretim — elle duzenlemeyin. npm run faz0:inventory */',
    'export const QueryIds = {'
  ];
  for(const e of entries)
  {
    lines.push(`  ${toQueryIdConstant(e.queryId)}: ${JSON.stringify(e.queryId)},`);
  }
  lines.push('} as const;');
  lines.push('');
  lines.push('export type QueryId = typeof QueryIds[keyof typeof QueryIds];');
  lines.push('');
  const outPath = path.join(ARGE_ROOT, 'packages/shared/src/queryIds.ts');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Wrote', outPath);
}

function buildInventory()
{
  const all = [];
  for(const src of SOURCES)
  {
    const abs = path.join(PIQOFF_ROOT, src.file);
    if(!fs.existsSync(abs))
    {
      console.warn('SKIP (missing):', abs);
      continue;
    }
    const content = fs.readFileSync(abs, 'utf8');
    const block = findQueryObjectBlock(content);
    const named = block ? parseNamedQueries(block) : [];
    const inlineCount = (content.match(/this\.core\.sql\.execute/g) ?? []).length;
    for(const entry of named)
    {
      all.push({
        ...entry,
        queryId: `${src.prefix}_${entry.key}`,
        source: src.file,
        module: src.label,
        additive: classifyAdditive(entry.query)
      });
    }
    console.log(`${src.label}: ${named.length} named, ${inlineCount} execute calls`);
  }
  return all;
}

function writeRegistryJson(entries)
{
  const registry = {};
  for(const e of entries)
  {
    registry[e.queryId] = {
      query: e.query,
      param: e.param
    };
  }
  registry.MOBILE_LOAD_PARAM = {
    query: `SELECT * FROM PARAM
WHERE ((APP = @APP) OR (@APP = ''))
  AND ((USERS = @USERS) OR (@USERS = '-1') OR (USERS = ''))
  AND ((ID = @ID) OR (@ID = ''))
ORDER BY USERS DESC`,
    param: ['APP:string|50', 'USERS:string|50', 'ID:string|50']
  };
  registry.MOBILE_LOAD_ACCESS = {
    query: `SELECT * FROM ACCESS
WHERE ((APP = @APP) OR (@APP = ''))
  AND ((USERS = @USERS) OR (@USERS = '-1') OR (USERS = ''))
  AND ((ID = @ID) OR (@ID = ''))
  AND ((PAGE = @PAGE) OR (@PAGE = ''))
  AND ((ELEMENT = @ELEMENT) OR (@ELEMENT = ''))`,
    param: ['APP:string|50', 'USERS:string|50', 'ID:string|50', 'PAGE:string|50', 'ELEMENT:string|50']
  };
  registry.MOBILE_COMPANY_LIST = {
    query: 'SELECT TOP 50 GUID AS CODE, NAME FROM COMPANY_VW_01 ORDER BY NAME',
    param: []
  };
  registry.MOBILE_COMPANY_INFO = {
    query: 'SELECT TOP 1 GUID AS CODE, NAME FROM COMPANY_VW_01',
    param: []
  };
  registry.MOBILE_BOSS_USER_LIST = {
    query: "SELECT CODE, NAME, USER_APP FROM USERS WHERE STATUS = 1 AND USER_APP LIKE '%BOSS%' ORDER BY NAME",
    param: []
  };
  // SQL govdeleri backend'e aittir (BOSS_MIMARI.md Bolum 24): piqoff/plugins/queries
  const outDir = path.join(PIQOFF_ROOT, 'plugins/queries');
  const outPath = path.join(outDir, 'mobileQueryRegistry.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(registry, null, 2), 'utf8');
  console.log('Wrote', outPath, Object.keys(registry).length, 'entries');
}

const entries = buildInventory();
if(entries.length === 0)
{
  console.error('Envanter bos. PIQOFF_ROOT dogru mu?', PIQOFF_ROOT);
  process.exit(1);
}
writeMarkdown(entries);
writeQueryIdsTs(entries);
writeRegistryJson(entries);
console.log('Done. Total:', entries.length);
