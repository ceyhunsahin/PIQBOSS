import type { AccessRow } from '@piqboss/shared';
import { parseAccessValue } from './prmAcs';

export type MenuItem = {
  id: string;
  module: 'boss' | 'resp';
  sector?: 'pos' | 'off' | 'rest';
  route: `/(main)/boss/${string}` | '/(main)/resp/index';
  labelKey: string;
};

const BOSS_SECTORS: MenuItem[] = [
  { id: 'dash', module: 'boss', sector: 'pos', route: '/(main)/boss/pos', labelKey: 'menu.dash' },
  { id: 'dashOff', module: 'boss', sector: 'off', route: '/(main)/boss/off', labelKey: 'menu.dashOff' },
  { id: 'dashRest', module: 'boss', sector: 'rest', route: '/(main)/boss/rest', labelKey: 'menu.dashRest' }
];

const RESP_MENU: MenuItem[] = [
  { id: 'respHome', module: 'resp', route: '/(main)/resp/index', labelKey: 'menu.dash' }
];

function hasBossApp(userApp?: string): boolean
{
  return (userApp ?? '').toUpperCase().includes('BOSS');
}

function hasRespApp(userApp?: string): boolean
{
  return (userApp ?? '').toUpperCase().includes('RESP');
}

function sectorAllowed(pageId: string, accessRows: AccessRow[]): boolean
{
  const rows = accessRows.filter((r) => r.PAGE === pageId);
  if(rows.length === 0)
  {
    return true;
  }
  return rows.some((r) => parseAccessValue(r.VALUE).visible !== false);
}

export function buildMenu(userApp?: string, accessRows: AccessRow[] = []): MenuItem[]
{
  const items: MenuItem[] = [];
  if(hasBossApp(userApp))
  {
    for(const sector of BOSS_SECTORS)
    {
      if(sectorAllowed(sector.id, accessRows))
      {
        items.push(sector);
      }
    }
  }
  if(hasRespApp(userApp))
  {
    items.push(...RESP_MENU);
  }
  if(items.length === 0)
  {
    return [...BOSS_SECTORS];
  }
  return items;
}
