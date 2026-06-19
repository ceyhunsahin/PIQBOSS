import * as Linking from 'expo-linking';

/**
 * Metni WhatsApp'a yollar. Uygulama kuruluysa whatsapp:// scheme'i,
 * de\u011filse wa.me web fallback'i a\u00e7\u0131l\u0131r.
 */
export async function shareToWhatsApp(text: string, phone?: string): Promise<boolean>
{
  const encoded = encodeURIComponent(text);
  const target = phone ? `phone=${phone.replace(/[^\d]/g, '')}&` : '';
  const appUrl = `whatsapp://send?${target}text=${encoded}`;
  const webUrl = `https://wa.me/${phone ? phone.replace(/[^\d]/g, '') : ''}?text=${encoded}`;
  try
  {
    const canOpen = await Linking.canOpenURL(appUrl);
    await Linking.openURL(canOpen ? appUrl : webUrl);
    return true;
  }
  catch
  {
    try
    {
      await Linking.openURL(webUrl);
      return true;
    }
    catch
    {
      return false;
    }
  }
}
