import { QueryIds, type RestDashboardSnapshot } from '@piqboss/shared';

export type RestFieldMap = {
  col: string;
  key: keyof RestDashboardSnapshot;
};

export type RestQueryDef = {
  queryId: string;
  value: 'range' | 'none';
  fields: RestFieldMap[];
};

export const REST_DASHBOARD_QUERIES: RestQueryDef[] = [
  { queryId: QueryIds.BOSS_REST_DAILYORDERTOTAL, value: 'range', fields: [{ col: 'ORDER_TOTAL', key: 'orderTotal' }] },
  { queryId: QueryIds.BOSS_REST_DAILYORDERCOUNT, value: 'range', fields: [{ col: 'ORDER_COUNT', key: 'orderCount' }] },
  { queryId: QueryIds.BOSS_REST_AVGORDERAMOUNT, value: 'range', fields: [{ col: 'AVG_ORDER', key: 'avgOrder' }] },
  { queryId: QueryIds.BOSS_REST_WAITINGORDERS, value: 'range', fields: [{ col: 'WAITING_COUNT', key: 'waitingOrders' }] },
  { queryId: QueryIds.BOSS_REST_COMPLETEDORDERS, value: 'range', fields: [{ col: 'COMPLETED_COUNT', key: 'completedOrders' }] },
  {
    queryId: QueryIds.BOSS_REST_TABLEOCCUPANCY,
    value: 'range',
    fields: [
      { col: 'OCCUPANCY_RATE', key: 'occupancyRate' },
      { col: 'OCCUPIED_TABLES', key: 'occupiedTables' },
      { col: 'TOTAL_TABLES', key: 'totalTables' }
    ]
  },
  { queryId: QueryIds.BOSS_REST_UNPRINTEDORDERS, value: 'range', fields: [{ col: 'UNPRINTED_COUNT', key: 'unprintedOrders' }] },
  { queryId: QueryIds.BOSS_REST_DAILYDISCOUNT, value: 'range', fields: [{ col: 'DISCOUNT_TOTAL', key: 'dailyDiscount' }] },
  { queryId: QueryIds.BOSS_REST_AVGPERPERSON, value: 'range', fields: [{ col: 'AVG_PER_PERSON', key: 'avgPerPerson' }] },
  { queryId: QueryIds.BOSS_REST_AVGPERTABLE, value: 'range', fields: [{ col: 'AVG_PER_TABLE', key: 'avgPerTable' }] },
  { queryId: QueryIds.BOSS_REST_OPENTABLES, value: 'none', fields: [{ col: 'OPEN_TABLES', key: 'openTables' }] },
  { queryId: QueryIds.BOSS_REST_TOTALGUESTS, value: 'range', fields: [{ col: 'TOTAL_GUESTS', key: 'totalGuests' }] },
  { queryId: QueryIds.BOSS_REST_AVGSERVICETIME, value: 'range', fields: [{ col: 'AVG_SERVICE_TIME', key: 'avgServiceTime' }] }
];
