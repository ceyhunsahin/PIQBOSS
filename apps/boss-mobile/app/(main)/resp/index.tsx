import { useTranslation } from 'react-i18next';
import { PlaceholderDashboard } from '@/components/ui/PlaceholderDashboard';

export default function RespHome()
{
  const { t } = useTranslation();
  return <PlaceholderDashboard title={t('menu.dash')} subtitle={t('comingSoon')} />;
}
