import type { Currency } from '@/store/useStore';

export function formatMoney(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} ${currency}`;
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(amount)
  );
}
