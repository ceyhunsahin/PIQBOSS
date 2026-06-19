/** Manuel — mobileDetailQueries.json quick insight sorgulari */
export const ExtraQueryIds = {
  BOSS_POS_QUICKMONTHFAVORITE: 'BOSS_POS_quickMonthFavorite',
  BOSS_POS_QUICKWEEKFAVORITE: 'BOSS_POS_quickWeekFavorite',
  BOSS_POS_QUICKRANGEPROMOTOPPRODUCT: 'BOSS_POS_quickRangePromoTopProduct',
  BOSS_POS_QUICKRANGEBESTGROUP: 'BOSS_POS_quickRangeBestGroup',
  BOSS_POS_QUICKDISCOUNTMONTH: 'BOSS_POS_quickDiscountMonth',
  BOSS_POS_QUICKLOYALTYMONTH: 'BOSS_POS_quickLoyaltyMonth',
  BOSS_POS_QUICKMONTHCA: 'BOSS_POS_quickMonthCa',
  BOSS_POS_QUICKLASTYEARMONTHCA: 'BOSS_POS_quickLastYearMonthCa',
  BOSS_POS_QUICKBESTMONTHCA: 'BOSS_POS_quickBestMonthCa',
  BOSS_POS_QUICKBESTWEEKCA: 'BOSS_POS_quickBestWeekCa',
  BOSS_POS_QUICKBESTDAYMONTHCA: 'BOSS_POS_quickBestDayMonthCa',
  BOSS_POS_QUICKBESTDAYWEEKCA: 'BOSS_POS_quickBestDayWeekCa',
  BOSS_POS_QUICKBESTMONTHMARGIN: 'BOSS_POS_quickBestMonthMargin',
  BOSS_POS_QUICKBESTMONTHBASKET: 'BOSS_POS_quickBestMonthBasket'
} as const;

export type ExtraQueryId = typeof ExtraQueryIds[keyof typeof ExtraQueryIds];
