"use client";

import { useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { mainnet, base, polygon, arbitrum, optimism } from "wagmi/chains";
import { useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, erc20Abi } from "viem";
import { TOKEN_LISTS, type TokenInfo } from "@/lib/prices";

export interface PortfolioToken {
  token: TokenInfo;
  chainId: number;
  chainLabel: string;
  chainIcon: string;
  balance: string;
  balanceFormatted: string;
  usdPrice: number;
  usdValue: number;
}

export interface PortfolioData {
  tokens: PortfolioToken[];
  totalUsdValue: number;
  isLoading: boolean;
  isConnected: boolean;
}

const CHAIN_META: Record<number, { label: string; icon: string }> = {
  1: { label: "Ethereum", icon: "⟠" },
  8453: { label: "Base", icon: "🔵" },
  137: { label: "Polygon", icon: "🟣" },
  42161: { label: "Arbitrum", icon: "🔴" },
  10: { label: "Optimism", icon: "🟠" },
};

const CHAIN_COINGECKO_ID: Record<number, string> = {
  1: "ethereum",
  8453: "base",
  137: "polygon-pos",
  42161: "arbitrum-one",
  10: "optimistic-ethereum",
};

// Fallback: tokeny które mają tę samą cenę na każdej sieci (stablecoiny, BTC)
const STABLE_PRICE_FALLBACKS: Record<string, string> = {
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Base USDC -> Ethereum USDC
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": "0x6b175474e89094c44da98b954eedeac495271d0f", // Base DAI -> Ethereum DAI
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Polygon USDC -> Ethereum USDC
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": "0x6b175474e89094c44da98b954eedeac495271d0f", // Polygon DAI -> Ethereum DAI
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Arbitrum USDC -> Ethereum USDC
  "0x912ce59144191c1204e64559fe8253a0e49e6548": "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB -> nie ma fallbacku
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // Arbitrum WBTC -> Ethereum WBTC
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Polygon WETH -> Ethereum WETH
};

const COINGECKO_NATIVE_ID: Record<number, string> = {
  1: "ethereum",
  8453: "ethereum",    // Base uses ETH
  137: "matic-network",
  42161: "ethereum",   // Arbitrum uses ETH
  10: "ethereum",      // Optimism uses ETH
};

const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Price cache — 60s TTL
const priceCache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000;

async function fetchPrices(
  entries: { chainId: number; address: string }[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  // Check cache first
  const uncached: { chainId: number; address: string }[] = [];
  for (const e of entries) {
    const key = `${e.chainId}:${e.address.toLowerCase()}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      result[key] = cached.price;
    } else {
      uncached.push(e);
    }
  }

  if (uncached.length === 0) return result;

  // Separate native vs ERC20 per chain
  const byChain = new Map<number, { native: boolean; erc20: string[] }>();
  for (const u of uncached) {
    if (!byChain.has(u.chainId))
      byChain.set(u.chainId, { native: false, erc20: [] });
    const entry = byChain.get(u.chainId)!;
    if (u.address.toLowerCase() === NATIVE_ADDRESS.toLowerCase()) {
      entry.native = true;
    } else {
      entry.erc20.push(u.address);
    }
  }

  // First pass: fetch prices per chain
  for (const [chainId, group] of byChain) {
    try {
      // Native price
      if (group.native) {
        const nativeId = COINGECKO_NATIVE_ID[chainId] ?? "ethereum";
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${nativeId}&vs_currencies=usd`
        );
        const data = await res.json();
        if (data[nativeId]?.usd) {
          const key = `${chainId}:${NATIVE_ADDRESS.toLowerCase()}`;
          result[key] = data[nativeId].usd;
          priceCache.set(key, { price: data[nativeId].usd, ts: Date.now() });
        }
      }

      // ERC20 prices — batched
      if (group.erc20.length > 0) {
        const platform = CHAIN_COINGECKO_ID[chainId];
        if (platform) {
          // Skip base platform entirely if we hit rate limits often
          const chunkSize = 30;
          for (let i = 0; i < group.erc20.length; i += chunkSize) {
            const chunk = group.erc20.slice(i, i + chunkSize);
            try {
              const res = await fetch(
                `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${chunk.join(",")}&vs_currencies=usd`
              );
              const data = await res.json();
              for (const addr of chunk) {
                const lc = addr.toLowerCase();
                if (data[lc]?.usd) {
                  const key = `${chainId}:${lc}`;
                  result[key] = data[lc].usd;
                  priceCache.set(key, { price: data[lc].usd, ts: Date.now() });
                }
              }
            } catch {
              // CoinGecko error for this chunk (rate limit, etc.) — skip silently
            }
          }
        }
      }
    } catch {
      // Skip failed chain
    }
  }

  // Second pass: fallback — for tokens still missing a price, try the mainnet
  // Ethereum address if a stable price fallback exists
  const ethereumGroup = byChain.get(1);
  const ethereumPrices: Record<string, number> = {};
  if (ethereumGroup?.erc20.length) {
    // Collect already-fetched Ethereum prices
    for (const addr of ethereumGroup.erc20) {
      const key = `1:${addr.toLowerCase()}`;
      if (result[key] !== undefined) {
        ethereumPrices[addr.toLowerCase()] = result[key];
      }
    }
    // If we don't have them yet, fetch Ethereum prices for the missing tokens
    const ethereumMissing = [...byChain.entries()]
      .filter(([cid]) => cid !== 1)
      .flatMap(([_, g]) => g.erc20)
      .map((addr) => STABLE_PRICE_FALLBACKS[addr.toLowerCase()])
      .filter(Boolean) as string[];
    const uniqueMissing = [...new Set(ethereumMissing)];
    const toFetch = uniqueMissing.filter((addr) => !(addr in ethereumPrices));
    if (toFetch.length > 0) {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${toFetch.join(",")}&vs_currencies=usd`
        );
        const data = await res.json();
        for (const addr of toFetch) {
          if (data[addr]?.usd) {
            ethereumPrices[addr] = data[addr].usd;
          }
        }
      } catch {
        // Ignore fallback fetch error
      }
    }
  }

  // Apply fallbacks to missing tokens
  for (const [chainId, group] of byChain) {
    if (chainId === 1) continue;
    for (const addr of group.erc20) {
      const key = `${chainId}:${addr.toLowerCase()}`;
      if (result[key] !== undefined) continue; // already has a price
      const ethereumAddr = STABLE_PRICE_FALLBACKS[addr.toLowerCase()];
      if (ethereumAddr && ethereumPrices[ethereumAddr] !== undefined) {
        result[key] = ethereumPrices[ethereumAddr];
        priceCache.set(key, { price: ethereumPrices[ethereumAddr], ts: Date.now() });
      }
    }
  }

  return result;
}

export function useRealPortfolio(): PortfolioData {
  const { address, isConnected } = useAccount();

  // 1. Native balances
  const ethBalance = useBalance({
    address,
    chainId: mainnet.id,
    query: { enabled: !!address },
  });
  const baseBalance = useBalance({
    address,
    chainId: base.id,
    query: { enabled: !!address },
  });
  const polygonBalance = useBalance({
    address,
    chainId: polygon.id,
    query: { enabled: !!address },
  });
  const arbitrumBalance = useBalance({
    address,
    chainId: arbitrum.id,
    query: { enabled: !!address },
  });
  const optimismBalance = useBalance({
    address,
    chainId: optimism.id,
    query: { enabled: !!address },
  });

  const nativeBalances = [
    { chainId: mainnet.id, label: "Ethereum", icon: "⟠", bal: ethBalance },
    { chainId: base.id, label: "Base", icon: "🔵", bal: baseBalance },
    { chainId: polygon.id, label: "Polygon", icon: "🟣", bal: polygonBalance },
    { chainId: arbitrum.id, label: "Arbitrum", icon: "🔴", bal: arbitrumBalance },
    { chainId: optimism.id, label: "Optimism", icon: "🟠", bal: optimismBalance },
  ];

  // 2. ERC20 balanceOf via multicall for each chain
  // We need to build readContracts for each chain
  const erc20Contracts = useMemo(() => {
    if (!address) return [];
    const contracts: {
      address: `0x${string}`;
      abi: typeof erc20Abi;
      functionName: "balanceOf";
      args: readonly [`0x${string}`];
      chainId: number;
    }[] = [];
    for (const [chainIdStr, tokens] of Object.entries(TOKEN_LISTS)) {
      const chainId = parseInt(chainIdStr);
      for (const t of tokens) {
        // Skip native address — already handled by useBalance
        if (t.address.toLowerCase() === NATIVE_ADDRESS.toLowerCase()) continue;
        contracts.push({
          address: t.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
          chainId,
        });
      }
    }
    return contracts;
  }, [address]);

  const erc20Results = useReadContracts({
    contracts: erc20Contracts,
    query: { enabled: !!address && erc20Contracts.length > 0 },
  });

  // 3. Prices for all tokens (native + ERC20)
  const priceEntries = useMemo(() => {
    const entries: { chainId: number; address: string }[] = [];
    for (const [chainIdStr, tokens] of Object.entries(TOKEN_LISTS)) {
      const chainId = parseInt(chainIdStr);
      for (const t of tokens) {
        entries.push({ chainId, address: t.address });
      }
    }
    return entries;
  }, []);

  const {
    data: priceData,
    isLoading: pricesLoading,
  } = useQuery({
    queryKey: ["portfolio-prices", priceEntries],
    queryFn: () => fetchPrices(priceEntries),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: isConnected,
  });

  // 4. Assemble final token list
  const tokens = useMemo<PortfolioToken[]>(() => {
    if (!isConnected || !address) return [];

    const result: PortfolioToken[] = [];

    // Populate native tokens
    for (const nb of nativeBalances) {
      const bal = nb.bal.data;
      if (!bal || bal.value === 0n) continue;
      const nativeSymbol = nb.chainId === 137 ? "MATIC" : "ETH";
      const priceKey = `${nb.chainId}:${NATIVE_ADDRESS.toLowerCase()}`;
      const usdPrice = priceData?.[priceKey] ?? 0;
      const formatted = parseFloat(formatUnits(bal.value, bal.decimals));
      const usdValue = formatted * usdPrice;
      if (usdValue <= 0 && formatted === 0) continue;

      result.push({
        token: {
          symbol: nativeSymbol,
          name: nb.label === "Polygon" ? "MATIC" : "Ether",
          address: NATIVE_ADDRESS,
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

    // Populate ERC20 tokens from multicall results
    const erc20Data = erc20Results.data ?? [];
    let erc20Idx = 0;
    for (const [chainIdStr, tokens] of Object.entries(TOKEN_LISTS)) {
      const chainId = parseInt(chainIdStr);
      const meta = CHAIN_META[chainId] ?? { label: `Chain ${chainId}`, icon: "⛓" };
      for (const t of tokens) {
        if (t.address.toLowerCase() === NATIVE_ADDRESS.toLowerCase()) continue;
        const balResult = erc20Data[erc20Idx];
        erc20Idx++;
        if (!balResult || balResult.error || !balResult.result) continue;
        const value = balResult.result as bigint;
        if (value === 0n) continue;

        const priceKey = `${chainId}:${t.address.toLowerCase()}`;
        const usdPrice = priceData?.[priceKey] ?? 0;
        const formatted = parseFloat(formatUnits(value, t.decimals));
        const usdValue = formatted * usdPrice;

        result.push({
          token: t,
          chainId,
          chainLabel: meta.label,
          chainIcon: meta.icon,
          balance: value.toString(),
          balanceFormatted: formatted.toFixed(6),
          usdPrice,
          usdValue,
        });
      }
    }

    return result.sort((a, b) => b.usdValue - a.usdValue);
  }, [isConnected, address, nativeBalances, priceData, erc20Results.data]);

  const totalUsdValue = useMemo(
    () => tokens.reduce((sum, t) => sum + t.usdValue, 0),
    [tokens]
  );

  const isLoading =
    nativeBalances.some((nb) => nb.bal.isLoading) ||
    pricesLoading ||
    erc20Results.isLoading;

  return { tokens, totalUsdValue, isLoading, isConnected };
}
