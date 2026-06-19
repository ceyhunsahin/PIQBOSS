import { useTranslation } from 'react-i18next';
import { PlaceholderDashboard } from '@/components/ui/PlaceholderDashboard';

export default function OffDashboard()
{
  const { t } = useTranslation();
  return <PlaceholderDashboard title={t('menu.dashOff')} subtitle={t('comingSoon')} />;
}
