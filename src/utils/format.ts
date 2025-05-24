import { useMemo } from 'react';

export const formatCurrency = (value: number, locale = 'en-US') => {
  const hasFraction = value % 1 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export function formattedDate(isoDate?: string): string {
  return useMemo(() => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [isoDate]);
}
