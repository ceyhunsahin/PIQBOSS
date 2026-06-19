/** Manuel — mobileDetailQueries.json popup sorgulari (this.query disi legacy popup SQL) */
export const DetailQueryIds = {
  BOSS_POS_POPUPSALESPAYMENTAMOUNT: 'BOSS_POS_popupSalesPaymentAmount',
  BOSS_POS_POPUPSALESVATDETAIL: 'BOSS_POS_popupSalesVatDetail',
  BOSS_POS_POPUPREBATETICKETLIST: 'BOSS_POS_popupRebateTicketList',
  BOSS_POS_POPUPREFUNDPAYMENTTOTAL: 'BOSS_POS_popupRefundPaymentTotal',
  BOSS_POS_POPUPPOSNETTTC: 'BOSS_POS_popupPosNetTtc',
  BOSS_POS_POPUPPRICEDESCLIST: 'BOSS_POS_popupPriceDescList',
  BOSS_POS_POPUPROWDELETELIST: 'BOSS_POS_popupRowDeleteList',
  BOSS_POS_POPUPFULLDELETELIST: 'BOSS_POS_popupFullDeleteList',
  BOSS_POS_POPUPREBATETOTALPAYMENT: 'BOSS_POS_popupRebateTotalPayment',
  BOSS_POS_POPUPALLITEMGROUPSLIST: 'BOSS_POS_popupAllItemGroupsList',
  BOSS_POS_POPUPUNSOLDGROUPSLIST: 'BOSS_POS_popupUnsoldGroupsList',
  BOSS_POS_POPUPBALANCETICKETSUMMARY: 'BOSS_POS_popupBalanceTicketSummary',
  BOSS_POS_POPUPBALANCETICKETAMOUNTS: 'BOSS_POS_popupBalanceTicketAmounts',
  BOSS_POS_POPUPSUPPRIMEUSERS: 'BOSS_POS_popupSupprimeUsers',
  BOSS_POS_POPUPNONTRAITEUSERS: 'BOSS_POS_popupNonTraiteUsers',
  BOSS_POS_POPUPPURCPRICEDOWNLIST: 'BOSS_POS_popupPurcPriceDownList',
  BOSS_POS_POPUPSALEPRICEDOWNLIST: 'BOSS_POS_popupSalePriceDownList',
  BOSS_POS_POPUPPURCPRICEUPLIST: 'BOSS_POS_popupPurcPriceUpList',
  BOSS_POS_POPUPSALEPRICEUPLIST: 'BOSS_POS_popupSalePriceUpList'
} as const;

export type DetailQueryId = typeof DetailQueryIds[keyof typeof DetailQueryIds];
