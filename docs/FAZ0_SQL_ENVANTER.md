# Faz 0 — SQL Envanteri (Boss / Resp mobil)

> Kaynak: `D:/PIQSOFT/piqoff` (salt okunur). Uretim: `npm run faz0:inventory`

| Metrik | Deger |
|---|---|
| Toplam queryId | 232 |
| Additive | 84 |
| Non-additive | 114 |
| Review gerekli | 34 |

## Boss POS (64)

| queryId | Legacy key | param | additive |
|---|---|---|---|
| `BOSS_POS_dailySalesTotal` | `dailySalesTotal` | 2 | additive |
| `BOSS_POS_salesAvg` | `salesAvg` | 2 | non-additive |
| `BOSS_POS_dailySalesCount` | `dailySalesCount` | 2 | non-additive |
| `BOSS_POS_paymentByType` | `paymentByType` | 2 | non-additive |
| `BOSS_POS_posDevices` | `posDevices` | 2 | review |
| `BOSS_POS_posUsersBySafe` | `posUsersBySafe` | 3 | review |
| `BOSS_POS_posUserDetails` | `posUserDetails` | 4 | additive |
| `BOSS_POS_vatByRate` | `vatByRate` | 2 | non-additive |
| `BOSS_POS_salesTrend` | `salesTrend` | 2 | additive |
| `BOSS_POS_devicePayment` | `devicePayment` | 2 | non-additive |
| `BOSS_POS_topSellingProducts` | `topSellingProducts` | 2 | non-additive |
| `BOSS_POS_topSellingProductGroups` | `topSellingProductGroups` | 2 | non-additive |
| `BOSS_POS_dailyPriceChange` | `dailyPriceChange` | 2 | additive |
| `BOSS_POS_dailyRowDelete` | `dailyRowDelete` | 2 | additive |
| `BOSS_POS_dailyFullDelete` | `dailyFullDelete` | 2 | additive |
| `BOSS_POS_dailyRebateTicket` | `dailyRebateTicket` | 2 | non-additive |
| `BOSS_POS_dailyRebateTotal` | `dailyRebateTotal` | 2 | additive |
| `BOSS_POS_dailyCustomerTicket` | `dailyCustomerTicket` | 2 | non-additive |
| `BOSS_POS_dailyUseLoyalty` | `dailyUseLoyalty` | 2 | additive |
| `BOSS_POS_useDiscount` | `useDiscount` | 2 | additive |
| `BOSS_POS_useDiscountTicket` | `useDiscountTicket` | 2 | non-additive |
| `BOSS_POS_purchaseTotal` | `purchaseTotal` | 2 | additive |
| `BOSS_POS_purchasePrice` | `purchasePrice` | 2 | additive |
| `BOSS_POS_salePrice` | `salePrice` | 2 | additive |
| `BOSS_POS_purchasePriceDown` | `purchasePriceDown` | 2 | additive |
| `BOSS_POS_purchasePriceUp` | `purchasePriceUp` | 2 | additive |
| `BOSS_POS_salePriceDown` | `salePriceDown` | 2 | additive |
| `BOSS_POS_salePriceUp` | `salePriceUp` | 2 | additive |
| `BOSS_POS_balanceTicketCreated` | `balanceTicketCreated` | 2 | additive |
| `BOSS_POS_balanceTicketUnchecked` | `balanceTicketUnchecked` | 2 | additive |
| `BOSS_POS_balanceTicketNonTraite` | `balanceTicketNonTraite` | 2 | additive |
| `BOSS_POS_balanceTicketSupprime` | `balanceTicketSupprime` | 2 | additive |
| `BOSS_POS_balanceTicketConfirme` | `balanceTicketConfirme` | 2 | additive |
| `BOSS_POS_popupSupprimeDetail` | `popupSupprimeDetail` | 3 | review |
| `BOSS_POS_popupNonTraiteDetail` | `popupNonTraiteDetail` | 3 | non-additive |
| `BOSS_POS_popupConfirmeUsers` | `popupConfirmeUsers` | 2 | additive |
| `BOSS_POS_popupConfirmeDetail` | `popupConfirmeDetail` | 3 | review |
| `BOSS_POS_hourlySales` | `hourlySales` | 2 | non-additive |
| `BOSS_POS_zeroCostItems` | `zeroCostItems` | 0 | review |
| `BOSS_POS_redTagItems` | `redTagItems` | 2 | non-additive |
| `BOSS_POS_lowMarginGroups` | `lowMarginGroups` | 0 | review |
| `BOSS_POS_lowMarginCount` | `lowMarginCount` | 4 | non-additive |
| `BOSS_POS_lowMarginProducts` | `lowMarginProducts` | 4 | non-additive |
| `BOSS_POS_unsoldLossProducts` | `unsoldLossProducts` | 3 | review |
| `BOSS_POS_AllItemGroups` | `AllItemGroups` | 2 | non-additive |
| `BOSS_POS_totalItemGroups` | `totalItemGroups` | 0 | additive |
| `BOSS_POS_unsoldItemGroups` | `unsoldItemGroups` | 2 | non-additive |
| `BOSS_POS_monthlyItemGroups` | `monthlyItemGroups` | 2 | non-additive |
| `BOSS_POS_promoMarginStats` | `promoMarginStats` | 2 | additive |
| `BOSS_POS_promoMarginDetail` | `promoMarginDetail` | 2 | non-additive |
| `BOSS_POS_itemPurchaseHistory` | `itemPurchaseHistory` | 1 | non-additive |
| `BOSS_POS_itemSalesHistory` | `itemSalesHistory` | 1 | review |
| `BOSS_POS_itemSalesChart` | `itemSalesChart` | 1 | non-additive |
| `BOSS_POS_itemSearch` | `itemSearch` | 1 | review |
| `BOSS_POS_itemMarginDetail` | `itemMarginDetail` | 3 | non-additive |
| `BOSS_POS_itemBarcodes` | `itemBarcodes` | 1 | non-additive |
| `BOSS_POS_marginStatsByGroup` | `marginStatsByGroup` | 2 | non-additive |
| `BOSS_POS_marginDetailByGroup` | `marginDetailByGroup` | 3 | non-additive |
| `BOSS_POS_promoLoyaltyInfo` | `promoLoyaltyInfo` | 2 | non-additive |
| `BOSS_POS_groupLossItems` | `groupLossItems` | 3 | non-additive |
| `BOSS_POS_globalLossItems` | `globalLossItems` | 2 | non-additive |
| `BOSS_POS_discountDetail` | `discountDetail` | 3 | review |
| `BOSS_POS_butcherList` | `butcherList` | 2 | non-additive |
| `BOSS_POS_butcherChanges` | `butcherChanges` | 3 | review |

## Boss OFF (80)

| queryId | Legacy key | param | additive |
|---|---|---|---|
| `BOSS_OFF_dailyOrderTotal` | `dailyOrderTotal` | 2 | additive |
| `BOSS_OFF_dailyOrderCount` | `dailyOrderCount` | 2 | additive |
| `BOSS_OFF_orderAvg` | `orderAvg` | 2 | non-additive |
| `BOSS_OFF_pendingOrders` | `pendingOrders` | 2 | review |
| `BOSS_OFF_pendingOrderStats` | `pendingOrderStats` | 2 | additive |
| `BOSS_OFF_ordersConverted` | `ordersConverted` | 2 | non-additive |
| `BOSS_OFF_activeOfferStats` | `activeOfferStats` | 2 | additive |
| `BOSS_OFF_pendingOffers` | `pendingOffers` | 2 | review |
| `BOSS_OFF_offersConverted` | `offersConverted` | 2 | review |
| `BOSS_OFF_pendingShipmentStats` | `pendingShipmentStats` | 2 | additive |
| `BOSS_OFF_pendingShipments` | `pendingShipments` | 2 | review |
| `BOSS_OFF_shipmentsConverted` | `shipmentsConverted` | 2 | non-additive |
| `BOSS_OFF_dailySalesTotal` | `dailySalesTotal` | 2 | additive |
| `BOSS_OFF_dailySalesCount` | `dailySalesCount` | 2 | additive |
| `BOSS_OFF_salesAvg` | `salesAvg` | 2 | non-additive |
| `BOSS_OFF_dailyRebateTotal` | `dailyRebateTotal` | 2 | additive |
| `BOSS_OFF_dailyRebateCount` | `dailyRebateCount` | 2 | additive |
| `BOSS_OFF_purchaseTotal` | `purchaseTotal` | 2 | additive |
| `BOSS_OFF_purchaseCount` | `purchaseCount` | 2 | additive |
| `BOSS_OFF_purchaseRebateTotal` | `purchaseRebateTotal` | 2 | additive |
| `BOSS_OFF_purchaseRebateCount` | `purchaseRebateCount` | 2 | additive |
| `BOSS_OFF_priceDiffTotal` | `priceDiffTotal` | 2 | additive |
| `BOSS_OFF_priceDiffCount` | `priceDiffCount` | 2 | additive |
| `BOSS_OFF_fireRebateTotal` | `fireRebateTotal` | 2 | additive |
| `BOSS_OFF_fireRebateCount` | `fireRebateCount` | 2 | additive |
| `BOSS_OFF_depotTransferTotal` | `depotTransferTotal` | 2 | additive |
| `BOSS_OFF_depotTransferCount` | `depotTransferCount` | 2 | additive |
| `BOSS_OFF_topDebtCustomers` | `topDebtCustomers` | 2 | non-additive |
| `BOSS_OFF_totalDebtCredit` | `totalDebtCredit` | 0 | additive |
| `BOSS_OFF_customerSalesSummary` | `customerSalesSummary` | 2 | non-additive |
| `BOSS_OFF_customerPaymentSummary` | `customerPaymentSummary` | 2 | non-additive |
| `BOSS_OFF_customerBalance` | `customerBalance` | 1 | review |
| `BOSS_OFF_customerExtre` | `customerExtre` | 4 | non-additive |
| `BOSS_OFF_marginByGroup` | `marginByGroup` | 2 | non-additive |
| `BOSS_OFF_marginTotal` | `marginTotal` | 2 | additive |
| `BOSS_OFF_topProfitItems` | `topProfitItems` | 2 | non-additive |
| `BOSS_OFF_topLossItems` | `topLossItems` | 2 | non-additive |
| `BOSS_OFF_marginDetailByGroup` | `marginDetailByGroup` | 3 | non-additive |
| `BOSS_OFF_marginStatsByGroup` | `marginStatsByGroup` | 2 | non-additive |
| `BOSS_OFF_promoMarginStats` | `promoMarginStats` | 2 | additive |
| `BOSS_OFF_vatByRate` | `vatByRate` | 2 | non-additive |
| `BOSS_OFF_groupLossItems` | `groupLossItems` | 3 | non-additive |
| `BOSS_OFF_globalLossItems` | `globalLossItems` | 2 | non-additive |
| `BOSS_OFF_itemPurchaseHistory` | `itemPurchaseHistory` | 1 | non-additive |
| `BOSS_OFF_itemSalesHistory` | `itemSalesHistory` | 1 | review |
| `BOSS_OFF_itemSalesChart` | `itemSalesChart` | 1 | non-additive |
| `BOSS_OFF_overdueInstallments` | `overdueInstallments` | 1 | non-additive |
| `BOSS_OFF_upcomingInstallments` | `upcomingInstallments` | 2 | non-additive |
| `BOSS_OFF_installmentStats` | `installmentStats` | 1 | additive |
| `BOSS_OFF_priceChanges` | `priceChanges` | 2 | additive |
| `BOSS_OFF_priceChangeDetail` | `priceChangeDetail` | 3 | review |
| `BOSS_OFF_invoiceTrend` | `invoiceTrend` | 1 | non-additive |
| `BOSS_OFF_marginTrend` | `marginTrend` | 1 | non-additive |
| `BOSS_OFF_topSellingProducts` | `topSellingProducts` | 2 | non-additive |
| `BOSS_OFF_topSellingGroups` | `topSellingGroups` | 2 | non-additive |
| `BOSS_OFF_salesByCustomerGroup` | `salesByCustomerGroup` | 2 | non-additive |
| `BOSS_OFF_monthlyItemGroups` | `monthlyItemGroups` | 2 | non-additive |
| `BOSS_OFF_topCustomersSales` | `topCustomersSales` | 2 | non-additive |
| `BOSS_OFF_paymentTypes` | `paymentTypes` | 2 | non-additive |
| `BOSS_OFF_openSalesInvoiceStats` | `openSalesInvoiceStats` | 2 | non-additive |
| `BOSS_OFF_openPurchaseInvoiceStats` | `openPurchaseInvoiceStats` | 2 | non-additive |
| `BOSS_OFF_openPurchaseInvoicesList` | `openPurchaseInvoicesList` | 2 | non-additive |
| `BOSS_OFF_openSalesInvoicesList` | `openSalesInvoicesList` | 2 | non-additive |
| `BOSS_OFF_incompleteShippedOrdersList` | `incompleteShippedOrdersList` | 2 | review |
| `BOSS_OFF_overduePayments` | `overduePayments` | 0 | review |
| `BOSS_OFF_encaissementList` | `encaissementList` | 2 | non-additive |
| `BOSS_OFF_fireDocuments` | `fireDocuments` | 1 | review |
| `BOSS_OFF_connOrdersToBl` | `connOrdersToBl` | 5 | additive |
| `BOSS_OFF_connOrdersToInv` | `connOrdersToInv` | 5 | additive |
| `BOSS_OFF_connBlToInv` | `connBlToInv` | 5 | additive |
| `BOSS_OFF_connBlToOrder` | `connBlToOrder` | 5 | additive |
| `BOSS_OFF_customerProfitability` | `customerProfitability` | 2 | non-additive |
| `BOSS_OFF_topPurchasingSuppliers` | `topPurchasingSuppliers` | 2 | non-additive |
| `BOSS_OFF_tahsilatTotal` | `tahsilatTotal` | 2 | additive |
| `BOSS_OFF_odemeTotal` | `odemeTotal` | 2 | additive |
| `BOSS_OFF_orderPriceDiff` | `orderPriceDiff` | 0 | review |
| `BOSS_OFF_purchaseInvoicePriceDiff` | `purchaseInvoicePriceDiff` | 2 | non-additive |
| `BOSS_OFF_stockDlcExpiring1Month` | `stockDlcExpiring1Month` | 2 | review |
| `BOSS_OFF_incompleteShippedOrdersStats` | `incompleteShippedOrdersStats` | 2 | non-additive |
| `BOSS_OFF_itemInvoiceSalesStats` | `itemInvoiceSalesStats` | 2 | non-additive |

## Boss REST (40)

| queryId | Legacy key | param | additive |
|---|---|---|---|
| `BOSS_REST_dailyOrderTotal` | `dailyOrderTotal` | 2 | additive |
| `BOSS_REST_dailyOrderCount` | `dailyOrderCount` | 2 | additive |
| `BOSS_REST_avgOrderAmount` | `avgOrderAmount` | 2 | non-additive |
| `BOSS_REST_waitingOrders` | `waitingOrders` | 2 | additive |
| `BOSS_REST_completedOrders` | `completedOrders` | 2 | non-additive |
| `BOSS_REST_tableOccupancy` | `tableOccupancy` | 2 | non-additive |
| `BOSS_REST_tableOccupancyList` | `tableOccupancyList` | 2 | non-additive |
| `BOSS_REST_unprintedOrders` | `unprintedOrders` | 2 | additive |
| `BOSS_REST_cancellationRate` | `cancellationRate` | 2 | non-additive |
| `BOSS_REST_tableOccupancyByTable` | `tableOccupancyByTable` | 2 | non-additive |
| `BOSS_REST_dailyDiscount` | `dailyDiscount` | 2 | additive |
| `BOSS_REST_topSellingItems` | `topSellingItems` | 2 | non-additive |
| `BOSS_REST_waiterPerformance` | `waiterPerformance` | 2 | non-additive |
| `BOSS_REST_zoneSales` | `zoneSales` | 2 | non-additive |
| `BOSS_REST_popularProperties` | `popularProperties` | 2 | non-additive |
| `BOSS_REST_hourlyOrders` | `hourlyOrders` | 2 | non-additive |
| `BOSS_REST_orderTrend30Days` | `orderTrend30Days` | 0 | non-additive |
| `BOSS_REST_paymentByType` | `paymentByType` | 2 | non-additive |
| `BOSS_REST_waitingOrderDetails` | `waitingOrderDetails` | 2 | non-additive |
| `BOSS_REST_unprintedOrderDetails` | `unprintedOrderDetails` | 2 | review |
| `BOSS_REST_waiterDetail` | `waiterDetail` | 3 | review |
| `BOSS_REST_zoneDetail` | `zoneDetail` | 3 | review |
| `BOSS_REST_propertyDetail` | `propertyDetail` | 3 | review |
| `BOSS_REST_avgPerPerson` | `avgPerPerson` | 2 | additive |
| `BOSS_REST_avgPerTable` | `avgPerTable` | 2 | non-additive |
| `BOSS_REST_openTables` | `openTables` | 0 | additive |
| `BOSS_REST_totalGuests` | `totalGuests` | 2 | additive |
| `BOSS_REST_avgServiceTime` | `avgServiceTime` | 2 | non-additive |
| `BOSS_REST_peakHour` | `peakHour` | 2 | non-additive |
| `BOSS_REST_mostActiveZone` | `mostActiveZone` | 2 | non-additive |
| `BOSS_REST_mostActiveWaiter` | `mostActiveWaiter` | 2 | non-additive |
| `BOSS_REST_dailyOrderDetails` | `dailyOrderDetails` | 2 | review |
| `BOSS_REST_completedOrderDetails` | `completedOrderDetails` | 2 | review |
| `BOSS_REST_avgOrderAmountDetails` | `avgOrderAmountDetails` | 3 | review |
| `BOSS_REST_dailyRevenueDetails` | `dailyRevenueDetails` | 3 | review |
| `BOSS_REST_tableOccupancyDetails` | `tableOccupancyDetails` | 2 | non-additive |
| `BOSS_REST_monthlyItemGroups` | `monthlyItemGroups` | 2 | non-additive |
| `BOSS_REST_monthlyGroupItems` | `monthlyGroupItems` | 3 | non-additive |
| `BOSS_REST_productGroups` | `productGroups` | 2 | non-additive |
| `BOSS_REST_productGroupItems` | `productGroupItems` | 3 | non-additive |

## Resp (48)

| queryId | Legacy key | param | additive |
|---|---|---|---|
| `RESP_dailySalesTotal` | `dailySalesTotal` | 2 | additive |
| `RESP_salesAvg` | `salesAvg` | 2 | non-additive |
| `RESP_dailySalesCount` | `dailySalesCount` | 2 | non-additive |
| `RESP_vatByRate` | `vatByRate` | 2 | non-additive |
| `RESP_topSellingProducts` | `topSellingProducts` | 2 | non-additive |
| `RESP_topSellingProductGroups` | `topSellingProductGroups` | 2 | non-additive |
| `RESP_salesTrend` | `salesTrend` | 2 | additive |
| `RESP_dailyPriceChange` | `dailyPriceChange` | 2 | additive |
| `RESP_dailyRowDelete` | `dailyRowDelete` | 2 | additive |
| `RESP_dailyFullDelete` | `dailyFullDelete` | 2 | additive |
| `RESP_dailyRebateTicket` | `dailyRebateTicket` | 2 | non-additive |
| `RESP_dailyRebateTotal` | `dailyRebateTotal` | 2 | additive |
| `RESP_dailyCustomerTicket` | `dailyCustomerTicket` | 2 | non-additive |
| `RESP_dailyUseLoyalty` | `dailyUseLoyalty` | 2 | additive |
| `RESP_useDiscount` | `useDiscount` | 2 | additive |
| `RESP_useDiscountTicket` | `useDiscountTicket` | 2 | non-additive |
| `RESP_paymentByTypeSale` | `paymentByTypeSale` | 2 | non-additive |
| `RESP_paymentByTypeRebate` | `paymentByTypeRebate` | 2 | non-additive |
| `RESP_vatBySale` | `vatBySale` | 2 | non-additive |
| `RESP_purchaseTotal` | `purchaseTotal` | 2 | additive |
| `RESP_purchasePrice` | `purchasePrice` | 2 | additive |
| `RESP_salePrice` | `salePrice` | 2 | additive |
| `RESP_purchasePriceDown` | `purchasePriceDown` | 2 | additive |
| `RESP_purchasePriceUp` | `purchasePriceUp` | 2 | additive |
| `RESP_salePriceDown` | `salePriceDown` | 2 | additive |
| `RESP_salePriceUp` | `salePriceUp` | 2 | additive |
| `RESP_balanceTicketCreated` | `balanceTicketCreated` | 2 | additive |
| `RESP_balanceTicketUnchecked` | `balanceTicketUnchecked` | 2 | additive |
| `RESP_balanceTicketNonTraite` | `balanceTicketNonTraite` | 2 | additive |
| `RESP_balanceTicketSupprime` | `balanceTicketSupprime` | 2 | additive |
| `RESP_balanceTicketConfirme` | `balanceTicketConfirme` | 2 | additive |
| `RESP_AllItemGroups` | `AllItemGroups` | 2 | non-additive |
| `RESP_totalItemGroups` | `totalItemGroups` | 0 | additive |
| `RESP_unsoldItemGroups` | `unsoldItemGroups` | 2 | non-additive |
| `RESP_monthlyItemGroups` | `monthlyItemGroups` | 2 | non-additive |
| `RESP_promoMarginStats` | `promoMarginStats` | 2 | additive |
| `RESP_promoMarginDetail` | `promoMarginDetail` | 2 | non-additive |
| `RESP_itemPurchaseHistory` | `itemPurchaseHistory` | 1 | non-additive |
| `RESP_itemSalesHistory` | `itemSalesHistory` | 1 | review |
| `RESP_itemSalesChart` | `itemSalesChart` | 1 | non-additive |
| `RESP_marginStatsByGroup` | `marginStatsByGroup` | 2 | non-additive |
| `RESP_marginDetailByGroup` | `marginDetailByGroup` | 3 | non-additive |
| `RESP_promoLoyaltyInfo` | `promoLoyaltyInfo` | 2 | non-additive |
| `RESP_groupLossItems` | `groupLossItems` | 3 | non-additive |
| `RESP_globalLossItems` | `globalLossItems` | 2 | non-additive |
| `RESP_discountDetail` | `discountDetail` | 3 | review |
| `RESP_butcherList` | `butcherList` | 2 | non-additive |
| `RESP_butcherChanges` | `butcherChanges` | 3 | review |

