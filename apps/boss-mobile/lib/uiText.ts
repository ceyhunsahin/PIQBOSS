import { useTranslation } from 'react-i18next';
import i18n from './i18n';

export function emptyLabel(): string
{
  return i18n.t('mobileExtra.emptyValue');
}

export function useEmptyLabel(): string
{
  const { t } = useTranslation();
  return t('mobileExtra.emptyValue');
}

export function useRangeSeparator(): string
{
  const { t } = useTranslation();
  return t('mobileExtra.rangeSeparator');
}
