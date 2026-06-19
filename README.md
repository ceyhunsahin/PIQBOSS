# piqboss-arge

Piqboss yeni nesil **mobil frontend** (React Native + Expo + TypeScript).

**Mimari direktif:** `D:/PIQSOFT/piqoff/www/src/boss/BOSS_MIMARI.md`  
**piqoff'a frontend kodu yazilmaz** — yalnizca bu repo.

## Kapsam

| Konu | Karar |
|---|---|
| Backend | Mevcut off gensrv (piqoff) — yeniden yazilmaz |
| Iletisim | Socket.IO — mobil **yalniz `sql-safe` + queryId** |
| Login | gensrv `login` — `[user, pwd, BOSS, db]` veya token `[sha, BOSS, db]` |
| Firma | Selectbox + secure-store (`tenantConfig.ts`) |
| prm/acs | Login sonrasi `MOBILE_LOAD_*` queryId (sql-safe) |
| Menu | `lib/menu.ts` — acs'e gore POS/OFF/REST + Resp |
| Cache | Yok (TanStack/MMKV yok) |

## Yapı

```
apps/boss-mobile/
  app/(setup)/server.tsx    # IP/host
  app/(auth)/login.tsx      # firma + login
  app/(main)/boss|resp/     # sabit ekranlar, menu acs ile filtrelenir
  lib/socket.ts             # emitAsync, login, sql-safe
  lib/sql.ts                # sqlSafe()
  lib/auth.ts               # oturum + prm/acs yukleme
  lib/menu.ts               # dinamik menu
packages/shared/            # QueryIds, SystemQueryIds, Zod (sadece sabitler/tipler)
tools/extract-sql-inventory.mjs   # SQL govdeleri → piqoff/plugins/queries
docs/FAZ0_SQL_ENVANTER.md
docs/SYSTEM_QUERIES.md      # MOBILE_LOAD_* sozlesmesi + registry konumu
```

## Kurulum

```bash
npm install
npm run faz0:inventory      # PIQOFF_ROOT=D:/PIQSOFT/piqoff → piqoff/plugins/queries/
npm run shared:build
npm run mobile:start          # npx expo start -c
```

Off'ta `sql-safe` icin: SQL govdeleri (`mobileQueryRegistry.json` + `mobileDetailQueries.json`)
`piqoff/plugins/queries` icinde bundle'lidir; ek ortam degiskeni gerekmez.

```bash
cd /path/to/piqoff && node server.js
```

Registry'yi yeniden uretmek icin (kaynak: piqoff dashboard.js):

```bash
PIQOFF_ROOT=D:/PIQSOFT/piqoff node tools/extract-sql-inventory.mjs   # → piqoff/plugins/queries
```

## Faz durumu

- **Faz 0** — SQL envanter + QueryIds (bu repo)
- **Faz 2** — `mobileSqlGateway.js` (piqoff — ayri is)
- **Faz 3** — setup + login + menu (bu repo)
- **Faz 4** — POS KPI (`features/boss-pos`, 13 queryId — dashboard.js getSalesData/getExtra)

Plugin olmadan login calisir; dashboard KPI ve prm/acs icin off'ta `sql-safe` gerekir.
