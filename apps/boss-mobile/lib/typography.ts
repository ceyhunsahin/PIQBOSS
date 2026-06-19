import { Platform, type TextStyle } from 'react-native';

/** Daha net metin — sistem font ölçeği ve Android padding kapalı */
export const textSharp =
{
  allowFontScaling: false,
  ...(Platform.OS === 'android' ? { includeFontPadding: false } : {})
} as TextStyle;
