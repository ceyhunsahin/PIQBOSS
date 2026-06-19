# Sistem queryId — mobileSqlGateway registry

Mobil istemci (`piqboss-arge`) asagidaki queryId'leri `sql-safe` ile cagirir.
SQL govdesi backend'e aittir (BOSS_MIMARI.md Bolum 24): **`piqoff/plugins/queries/mobileQueryRegistry.json`** (+ detay icin `mobileDetailQueries.json`).

Off plugin (`mobileSqlGateway.js`) bu dosyalari kendi yanindaki `plugins/queries` klasorunden okur.

## MOBILE_LOAD_PARAM

```sql
SELECT * FROM PARAM
WHERE ((APP = @APP) OR (@APP = ''))
  AND ((USERS = @USERS) OR (@USERS = '-1') OR (USERS = ''))
  AND ((ID = @ID) OR (@ID = ''))
ORDER BY USERS DESC
```

param: `APP:string|50`, `USERS:string|50`, `ID:string|50`  
value: `BOSS`, `-1`, ``

## MOBILE_LOAD_ACCESS

```sql
SELECT * FROM ACCESS
WHERE ((APP = @APP) OR (@APP = ''))
  AND ((USERS = @USERS) OR (@USERS = '-1') OR (USERS = ''))
  AND ((ID = @ID) OR (@ID = ''))
  AND ((PAGE = @PAGE) OR (@PAGE = ''))
  AND ((ELEMENT = @ELEMENT) OR (@ELEMENT = ''))
```

param: `APP:string|50`, `USERS:string|50`, `ID:string|50`, `PAGE:string|50`, `ELEMENT:string|50`  
value: `BOSS`, `-1`, ``, ``, ``

## MOBILE_COMPANY_LIST (opsiyonel — firma selectbox)

```sql
SELECT TOP 50 CODE, NAME FROM COMPANY ORDER BY NAME
```

param: `[]`  
value: `[]`

> Bu dosya **sozlesme dokumani**dir. Gercek registry `piqoff/plugins/queries/` altinda `mobileSqlGateway.js` ile acilacaktir (Faz 2, piqoff tarafi).
