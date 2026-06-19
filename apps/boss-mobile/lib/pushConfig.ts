/**
 * Push credential referansi — piqhub config.js + Firebase piqapp-push projesi.
 * Gizli dosyalar (.p8, service-account.json) yalnizca merkezi PIQHUB sunucusunda.
 *
 * Firebase Console (piqapp-push / 898646514918):
 *   Android PiqBoss: com.piqpos.boss  → mobilesdk 2982a4fd449618dfd0ef27
 *   iOS PiqBoss:     com.piqsoft.boss → mobilesdk 55fc516dd7778b3dd0ef27
 *
 * iOS NOT: Swift AppDelegate + FirebaseApp.configure() native Swift icindir.
 * Boss-mobile (Expo) icin Firebase iOS SDK gerekmez — expo-notifications native APNs
 * token uretir, PIQHUB apns.js ile gonderir. Firebase Console'da PiqBoss iOS icin
 * APNs Auth Key (.p8) yuklemen yeterli (FCM uzerinden iOS relay icin).
 *
 * PIQHUB config.js + sunucu dosyalari (client'a KONMAZ):
 *   AuthKey_A3F97G6QPB.p8 → PIQHUB/plugins/push/
 *   apns.keyId     = A3F97G6QPB
 *   apns.teamId    = C8WGAHMLTR
 *   apns.topics.BOSS = com.piqsoft.boss
 *   apns.topics.MOB  = com.piq.piqapp
 */
export const PUSH_CONFIG = {
  app: 'BOSS',
  module: 'boss',
  apns: {
    keyId: 'A3F97G6QPB',
    teamId: 'C8WGAHMLTR',
    topicPiqApp: 'com.piq.piqapp',
    topicPiqBoss: 'com.piqsoft.boss'
  },
  fcm: {
    projectNumber: '898646514918',
    projectId: 'piqapp-push',
    androidAppId: '1:898646514918:android:2982a4fd449618dfd0ef27',
    androidPackage: 'com.piqpos.boss',
    iosAppId: '1:898646514918:ios:55fc516dd7778b3dd0ef27'
  },
  /** piqoff socket event — piqhub.js set-push-token koprüsü */
  socketEvent: 'set-push-token' as const,
  /** Bildirime tiklaninca acilacak ekran */
  defaultRoute: '/(main)/boss/pos' as const
};
