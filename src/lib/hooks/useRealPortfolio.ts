"use client";

import { useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { mainnet, base, polygon, arbitrum, optimism } from "wagmi/chains";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { TOKEN_LISTS, type TokenInfo } from "@/lib/prices";

const SUPPORTED_CHAINS = [
  { chain: mainnet, label: "Ethereum", icon: "⟠" },
  { chain: base, label: "Base", icon: "🔵" },
  { chain: polygon, label: "Polygon", icon: "🟣" },
  { chain: arbitrum, label: "Arbitrum", icon: "🔴" },
  { chain: optimism, label: "Optimism", icon: "🟠" },
] as const;

export interface PortfolioToken {
  token: TokenInfo;
  chainId: number;
  chainLabel: string;
  chainIcon: string;
  balance: string;
  balanceFormatted: string;
  usdPrice: number;
  usdValue: number;
  logoURI?: string;
}

export interface PortfolioData {
  tokens: PortfolioToken[];
  totalUsdValue: number;
  isLoading: boolean;
  isConnected: boolean;
}

// Cache prices in memory to avoid hammering CoinGecko
const priceCache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

async function fetchPrices(addresses: { chainId: number; address: string }[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  // Group by chain for batched CoinGecko calls
  const byChain = new Map<number, string[]>();
  for (const { chainId, address } of addresses) {
    const key = `${chainId}:${address.toLowerCase()}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      result[key] = cached.price;
      continue;
    }
    if (!byChain.has(chainId)) byChain.set(chainId, []);
    byChain.get(chainId)!.push(address);
  }

  // Fetch uncached prices
  const platformMap: Record<number, string> = {
    1: "ethereum",
    8453: "base",
    137: "polygon-pos",
    42161: "arbitrum-one",
    10: "optimistic-ethereum",
  };

  for (const [chainId, addrs] of byChain) {
    const platform = platformMap[chainId];
    // ETH native address
    const hasNative = addrs.includes("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    const contractAddrs = addrs.filter(
      (a) => a !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    );

    try {
      if (hasNative) {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${chainId === 137 ? "matic-network" : "ethereum"}&vs_currencies=usd`
        );
        const data = await res.json();
        const nativeId = chainId === 137 ? "matic-network" : "ethereum";
        if (data[nativeId]?.usd) {
          const key = `${chainId}:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`;
          result[key] = data[nativeId].usd;
          priceCache.set(key, { price: data[nativeId].usd, ts: Date.now() });
        }
      }

      if (contractAddrs.length > 0) {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddrs.join(",")}&vs_currencies=usd`
        );
        const data = await res.json();
        for (const addr of contractAddrs) {
          const lc = addr.toLowerCase();
          if (data[lc]?.usd) {
            const key = `${chainId}:${lc}`;
            result[key] = data[lc].usd;
            priceCache.set(key, { price: data[lc].usd, ts: Date.now() });
          }
        }
      }
    } catch {
      // Silently fail for individual chain — prices will be 0
    }
  }

  return result;
}

export function useRealPortfolio(): PortfolioData {
  const { address, isConnected } = useAccount();

  // Get native balance for each chain — only enabled when address exists
  const ethBalance = useBalance({ address, chainId: mainnet.id, query: { enabled: !!address } });
  const baseBalance = useBalance({ address, chainId: base.id, query: { enabled: !!address } });
  const polygonBalance = useBalance({ address, chainId: polygon.id, query: { enabled: !!address } });
  const arbitrumBalance = useBalance({ address, chainId: arbitrum.id, query: { enabled: !!address } });
  const optimismBalance = useBalance({ address, chainId: optimism.id, query: { enabled: !!address } });

  // For popular ERC20 tokens, we'd need multicall — for now focus on native + top stablecoins
  const nativeBalances = [
    { chainId: mainnet.id, balance: ethBalance, label: "Ethereum", icon: "⟠" },
    { chainId: base.id, balance: baseBalance, label: "Base", icon: "🔵" },
    { chainId: polygon.id, balance: polygonBalance, label: "Polygon", icon: "🟣" },
    { chainId: arbitrum.id, balance: arbitrumBalance, label: "Arbitrum", icon: "🔴" },
    { chainId: optimism.id, balance: optimismBalance, label: "Optimism", icon: "🟠" },
  ];

  // Build list of addresses we need prices for
  const priceAddresses = useMemo(() => {
    const addrs: { chainId: number; address: string }[] = [];
    for (const nb of nativeBalances) {
      const tokenList = TOKEN_LISTS[nb.chainId] ?? [];
      for (const t of tokenList) {
        addrs.push({ chainId: nb.chainId, address: t.address });
      }
    }
    return addrs;
  }, []);

  const { data: priceData, isLoading: pricesLoading } = useQuery({
    queryKey: ["portfolio-prices", priceAddresses],
    queryFn: () => fetchPrices(priceAddresses),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: isConnected,
  });

  const tokens = useMemo<PortfolioToken[]>(() => {
    if (!isConnected || !address) return [];

    const result: PortfolioToken[] = [];

    for (const nb of nativeBalances) {
      const bal = nb.balance.data;
      if (!bal || bal.value === 0n) continue;

      const nativeSymbol = nb.chainId === 137 ? "MATIC" : "ETH";
      const priceKey = `${nb.chainId}:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`;
      const usdPrice = priceData?.[priceKey] ?? 0;
      const formatted = parseFloat(formatUnits(bal.value, bal.decimals));
      const usdValue = formatted * usdPrice;

      result.push({
        token: {
          symbol: nativeSymbol,
          name: nb.label === "Polygon" ? "MATIC" : "Ether",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          decimals: bal.decimals,
          chainId: nb.chainId,
        },
        chainId: nb.chainId,
        chainLabel: nb.label,
        chainIcon: nb.icon,
        balance: bal.value.toString(),
        balanceFormatted: formatted.toFixed(6),
        usdPrice,
        usdValue,
      });
    }

    return result.sort((a, b) => b.usdValue - a.usdValue);
  }, [isConnected, address, nativeBalances, priceData]);

  const totalUsdValue = useMemo(
    () => tokens.reduce((sum, t) => sum + t.usdValue, 0),
    [tokens]
  );

  const isLoading = nativeBalances.some((nb) => nb.balance.isLoading) || pricesLoading;

  return { tokens, totalUsdValue, isLoading, isConnected };
}
