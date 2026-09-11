import { Merchant } from '@/types';
import { colors } from '@/theme/theme';

export function merchantStatusPill(merchant: Merchant): { label: string; bg: string; color: string } {
  if (!merchant.isOpen) {
    return { label: 'Closed', bg: colors.dangerBg, color: colors.danger };
  }
  if (merchant.tagline.toLowerCase().startsWith('closes')) {
    return { label: merchant.tagline, bg: colors.warningBg, color: colors.warning };
  }
  return { label: merchant.tagline, bg: colors.successBg, color: colors.success };
}
