"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ExternalLink,
  PieChart,
  Copy,
  Send,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { useRealPortfolio } from "@/lib/hooks/useRealPortfolio";
import Link from "next/link";
import { useState } from "react";

function formatUSD(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

const CHAIN_EXPLORERS: Record<number, string> = {
  1: "https://etherscan.io/address/",
  8453: "https://basescan.org/address/",
  137: "https://polygonscan.com/address/",
  42161: "https://arbiscan.io/address/",
  10: "https://optimistic.etherscan.io/address/",
};

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { tokens, totalUsdValue, isLoading } = useRealPortfolio();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Group by chain
  const byChain = tokens.reduce(
    (acc, t) => {
      if (!acc[t.chainId]) acc[t.chainId] = [];
      acc[t.chainId].push(t);
      return acc;
    },
    {} as Record<number, typeof tokens>
  );

  const chainMeta: Record<number, { label: string; icon: string; color: string }> = {
    1: { label: "Ethereum", icon: "⟠", color: "from-blue-500 to-blue-600" },
    8453: { label: "Base", icon: "🔵", color: "from-blue-400 to-blue-500" },
    137: { label: "Polygon", icon: "🟣", color: "from-purple-500 to-purple-600" },
    42161: { label: "Arbitrum", icon: "🔴", color: "from-red-500 to-red-600" },
    10: { label: "Optimism", icon: "🟠", color: "from-orange-500 to-orange-600" },
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-gray-500">
            View your portfolio across Ethereum, Base, Polygon, Arbitrum & Optimism
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-gray-500 text-sm">
              {tokens.length} token{tokens.length !== 1 ? "s" : ""} across{" "}
              {Object.keys(byChain).length} chain
              {Object.keys(byChain).length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="glass rounded-xl px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white"
            >
              {viewMode === "list" ? "Grid" : "List"}
            </button>
          </div>
        </div>

        {/* Total Value */}
        <div className="glass rounded-xl p-6">
          <div className="text-sm text-gray-500 mb-1">Total Portfolio Value</div>
          {isLoading ? (
            <div className="h-10 bg-white/5 rounded w-48 animate-pulse" />
          ) : (
            <>
              <div className="text-4xl font-bold">
                {formatUSD(totalUsdValue)}
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Live prices via CoinGecko</span>
              </div>
            </>
          )}
        </div>

        {/* Tokens by Chain */}
        <div className="space-y-6">
          {Object.entries(byChain).map(([chainIdStr, chainTokens]) => {
            const chainId = parseInt(chainIdStr);
            const meta = chainMeta[chainId] ?? {
              label: `Chain ${chainId}`,
              icon: "⛓",
              color: "from-gray-500 to-gray-600",
            };
            const chainTotal = chainTokens.reduce((s, t) => s + t.usdValue, 0);
            const explorer = CHAIN_EXPLORERS[chainId];

            return (
              <div key={chainId} className="glass rounded-xl overflow-hidden">
                {/* Chain header */}
                <div
                  className={`px-5 py-3 bg-gradient-to-r ${meta.color} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{meta.label}</h3>
                      <div className="text-xs text-white/70">
                        {chainTokens.length} token{chainTokens.length !== 1 ? "s" : ""}
                        {explorer && address && (
                          <a
                            href={`${explorer}${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 underline hover:text-white"
                          >
                            Explorer ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatUSD(chainTotal)}</div>
                    <div className="text-xs text-white/70">Total</div>
                  </div>
                </div>

                {/* Token list */}
                <div className="divide-y divide-white/5">
                  {chainTokens.map((t) => (
                    <motion.div
                      key={t.token.address}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Token icon placeholder */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold shrink-0">
                          {t.token.symbol[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {t.token.symbol}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {meta.label} · {parseFloat(t.balanceFormatted).toFixed(6)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <div className="font-medium">
                          {formatUSD(t.usdValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ ${t.usdPrice.toFixed(t.usdPrice >= 1 ? 2 : 6)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if no tokens */}
        {tokens.length === 0 && !isLoading && (
          <div className="glass rounded-xl p-12 text-center">
            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tokens found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Your wallet appears empty across supported chains
            </p>
            <Link
              href="/swap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium"
            >
              <ArrowUpRight className="w-4 h-4" /> Get Started Swapping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
