import { useTranslation } from 'react-i18next';
import { PlaceholderDashboard } from '@/components/ui/PlaceholderDashboard';

export default function RestDashboard()
{
  const { t } = useTranslation();
  return <PlaceholderDashboard title={t('menu.dashRest')} subtitle={t('comingSoon')} />;
}
