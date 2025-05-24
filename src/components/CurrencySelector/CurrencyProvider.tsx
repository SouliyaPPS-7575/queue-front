// src/contexts/CurrencyContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useCurrency } from '~/hooks/event/useCurrency';

interface CurrencyContextType {
  displayCurrency: string;
  currency: string;
  rate: number;
  convert: (value: number) => number;
  setCurrency: (ccy: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currencies } = useCurrency();
  const [currency, setCurrency] = useState<string>('USD');
  const [rate, setRate] = useState<number>(1);
  const displayCurrency = useMemo(() => {
    switch (currency) {
      case 'THB':
        return '฿';
      case 'USD':
        return '$';
      case 'LAK':
        return 'LAK';
      default:
        return currency;
    }
  }, [currency]);

  useEffect(() => {
    const selected = currencies.find(
      (c) => c.ccy === currency && c.type === 'SELL',
    );
    if (selected) {
      setRate(Number(selected.rate));
    }
  }, [currency, currencies]);

  const convert = useCallback((value: number) => {
    return value / rate;
  }, [rate]);

  return (
    <CurrencyContext.Provider
      value={{ currency, displayCurrency, rate, convert, setCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error(
      'useCurrencyContext must be used within a CurrencyProvider',
    );
  }
  return context;
};

export const formatCurrency = (
  value: number,
  locale = 'en-US',
) => {
  const hasFraction = value % 1 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};
