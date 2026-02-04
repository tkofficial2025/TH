import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const FX_CACHE_KEY = 'fx_usd_jpy';
const FX_API = 'https://api.frankfurter.app/latest?from=USD&to=JPY';

export type Currency = 'JPY' | 'USD';

interface FxCache {
  date: string; // YYYY-MM-DD
  jpyPerUsd: number;
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** 1 USD = N JPY（取得できない場合は 150 をフォールバック） */
  jpyPerUsd: number;
  /** レート取得日 YYYY-MM-DD（キャッシュまたはAPI応答） */
  rateDate: string | null;
  loading: boolean;
  error: string | null;
  /** 円建て価格を選択中通貨でフォーマット（賃貸は type: 'rent'、売買は type: 'buy'） */
  formatPrice: (priceYen: number, type: 'rent' | 'buy') => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function todayString(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function loadCachedRate(): FxCache | null {
  try {
    const raw = localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxCache;
    if (parsed?.date && typeof parsed.jpyPerUsd === 'number' && parsed.jpyPerUsd > 0) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveCachedRate(date: string, jpyPerUsd: number) {
  try {
    localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ date, jpyPerUsd }));
  } catch {
    // ignore
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('JPY');
  const [jpyPerUsd, setJpyPerUsd] = useState<number>(150);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = todayString();
    const cached = loadCachedRate();
    if (cached && cached.date === today) {
      setJpyPerUsd(cached.jpyPerUsd);
      setRateDate(cached.date);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(FX_API)
      .then((res) => res.json())
      .then((data: { rates?: { JPY?: number }; date?: string }) => {
        if (cancelled) return;
        const rate = data?.rates?.JPY;
        const date = data?.date ?? today;
        if (typeof rate === 'number' && rate > 0) {
          setJpyPerUsd(rate);
          setRateDate(date);
          saveCachedRate(date, rate);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to fetch rate');
          const cached = loadCachedRate();
          if (cached) {
            setJpyPerUsd(cached.jpyPerUsd);
            setRateDate(cached.date);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = useCallback<CurrencyContextValue['formatPrice']>(
    (priceYen, type) => {
      if (currency === 'JPY') {
        if (type === 'rent') {
          if (priceYen >= 100000) return `¥${(priceYen / 10000).toFixed(0)}万/mo`;
          return `¥${priceYen.toLocaleString()}/mo`;
        }
        return `¥${(priceYen / 1000000).toFixed(1)}M`;
      }
      const usd = priceYen / jpyPerUsd;
      if (type === 'rent') {
        if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k/mo`;
        return `$${Math.round(usd).toLocaleString()}/mo`;
      }
      if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
      if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
      return `$${Math.round(usd).toLocaleString()}`;
    },
    [currency, jpyPerUsd]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      jpyPerUsd,
      rateDate,
      loading,
      error,
      formatPrice,
    }),
    [currency, jpyPerUsd, rateDate, loading, error, formatPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
