"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export function useTopCoins(limit = 20) {
  const { data, error, isLoading } = useSWR<CoinData[]>(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  return {
    coins: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useCoinHistory(id: string, days = 7) {
  const { data, error } = useSWR<{ prices: [number, number][] }>(
    id ? `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}` : null,
    fetcher,
    { refreshInterval: 120_000 }
  );

  return {
    prices: data?.prices ?? [],
    isLoading: !data && !error,
  };
}

export interface GlobalData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  btc_dominance: number;
  market_cap_change_percentage_24h_usd: number;
}

export function useGlobalData() {
  const { data, error } = useSWR<{ data: GlobalData }>(
    `${COINGECKO_API}/global`,
    fetcher,
    { refreshInterval: 60_000 }
  );

  return {
    global: data?.data ?? null,
    isLoading: !data && !error,
  };
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  published_at: string;
  currencies?: { code: string; title: string }[];
}

export function useCryptoNews() {
  const { data, error } = useSWR<{ results: NewsItem[] }>(
    `https://cryptopanic.com/api/v1/posts/?auth_token=&kind=news&public=true`,
    fetcher,
    { refreshInterval: 300_000, revalidateOnFocus: false }
  );

  return {
    news: data?.results?.slice(0, 8) ?? [],
    isLoading: !data && !error,
  };
}

export function useFearGreedIndex() {
  const { data, error } = useSWR<{ data: { value: string; value_classification: string }[] }>(
    "https://api.alternative.me/fng/?limit=1",
    fetcher,
    { refreshInterval: 3600_000 }
  );

  return {
    value: data?.data?.[0]?.value ?? "50",
    classification: data?.data?.[0]?.value_classification ?? "Neutral",
    isLoading: !data && !error,
  };
}

export function useGasPrices() {
  const [gas, setGas] = useState({
    ethereum: { slow: 0, average: 0, fast: 0 },
    polygon: { slow: 0, average: 0, fast: 0 },
    base: { slow: 0, average: 0, fast: 0 },
  });

  useEffect(() => {
    async function fetchGas() {
      try {
        const [ethRes, polyRes] = await Promise.allSettled([
          fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey="),
          fetch("https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey="),
        ]);
        const eth = ethRes.status === "fulfilled" ? await ethRes.value.json() : null;
        const poly = polyRes.status === "fulfilled" ? await polyRes.value.json() : null;

        setGas({
          ethereum: {
            slow: eth?.result?.SafeGasPrice ? parseInt(eth.result.SafeGasPrice) : 5,
            average: eth?.result?.ProposeGasPrice ? parseInt(eth.result.ProposeGasPrice) : 8,
            fast: eth?.result?.FastGasPrice ? parseInt(eth.result.FastGasPrice) : 12,
          },
          polygon: {
            slow: poly?.result?.SafeGasPrice ? parseInt(poly.result.SafeGasPrice) : 30,
            average: poly?.result?.ProposeGasPrice ? parseInt(poly.result.ProposeGasPrice) : 50,
            fast: poly?.result?.FastGasPrice ? parseInt(poly.result.FastGasPrice) : 80,
          },
          base: {
            slow: eth?.result?.SafeGasPrice ? Math.max(1, parseInt(eth.result.SafeGasPrice) - 2) : 1,
            average: eth?.result?.ProposeGasPrice ? Math.max(2, parseInt(eth.result.ProposeGasPrice) - 1) : 3,
            fast: eth?.result?.FastGasPrice ? Math.max(3, parseInt(eth.result.FastGasPrice)) : 5,
          },
        });
      } catch {}
    }
    fetchGas();
    const interval = setInterval(fetchGas, 30_000);
    return () => clearInterval(interval);
  }, []);

  return gas;
}
