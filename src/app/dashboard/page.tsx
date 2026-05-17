"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowLeftRight,
  Repeat2,
  Bell,
  Bot,
  Fuel,
  TriangleAlert,
  Newspaper,
  Wallet,
  ExternalLink,
  Copy,
} from "lucide-react";
import {
  useTopCoins,
  useGlobalData,
  useFearGreedIndex,
  useGasPrices,
  useCryptoNews,
} from "@/lib/hooks/useMarketData";
import { useRealPortfolio } from "@/lib/hooks/useRealPortfolio";
import { useAccount } from "wagmi";
import { useState } from "react";

function formatUSD(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function PortfolioSummary() {
  const { tokens, totalUsdValue, isLoading, isConnected } = useRealPortfolio();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Connect Your Wallet</h3>
        <p className="text-gray-500 text-sm">
          Connect to see your portfolio across 5 chains
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Your Portfolio</h3>
        {address && (
          <button
            onClick={copyAddress}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400"
          >
            {copied ? "Copied!" : <Copy className="w-3 h-3" />}
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold mb-1">
            {formatUSD(totalUsdValue)}
          </div>
          <p className="text-gray-500 text-xs mb-4">
            Across {tokens.length} token{tokens.length !== 1 ? "s" : ""} on{" "}
            {new Set(tokens.map((t) => t.chainId)).size} chain
            {new Set(tokens.map((t) => t.chainId)).size !== 1 ? "s" : ""}
          </p>

          <div className="space-y-2">
            {tokens.slice(0, 5).map((t) => (
              <div
                key={`${t.chainId}-${t.token.address}`}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{t.chainIcon}</span>
                  <span className="font-medium truncate">
                    {t.token.symbol}
                  </span>
                  <span className="text-gray-500 text-xs hidden sm:inline">
                    {t.chainLabel}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="font-medium">
                    {parseFloat(t.balanceFormatted).toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatUSD(t.usdValue)}
                  </div>
                </div>
              </div>
            ))}
            {tokens.length > 5 && (
              <Link
                href="/portfolio"
                className="block text-center text-xs text-violet-400 hover:text-violet-300 pt-1"
              >
                + {tokens.length - 5} more tokens →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { coins, isLoading: coinsLoading } = useTopCoins(8);
  const { global } = useGlobalData();
  const { value: fearGreed, classification } = useFearGreedIndex();
  const gas = useGasPrices();
  const { news, isLoading: newsLoading } = useCryptoNews();
  const { tokens: portfolioTokens } = useRealPortfolio();

  const marketChange = global?.market_cap_change_percentage_24h_usd ?? 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              {isConnected
                ? `${portfolioTokens.length} token${portfolioTokens.length !== 1 ? "s" : ""} tracked live`
                : "Real-time market overview"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Fear & Greed */}
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <TriangleAlert
                className={`w-4 h-4 ${
                  parseInt(fearGreed) > 50 ? "text-emerald-400" : "text-red-400"
                }`}
              />
              <div>
                <div className="text-xs text-gray-500">Fear & Greed</div>
                <div className="text-sm font-medium">{fearGreed}/100</div>
              </div>
            </div>
            {/* 24h Market Change */}
            <div
              className={`glass rounded-xl px-4 py-2 flex items-center gap-2 ${
                marketChange >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {marketChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <div>
                <div className="text-xs text-gray-400">Market 24h</div>
                <div className="text-sm font-medium">
                  {marketChange >= 0 ? "+" : ""}
                  {marketChange.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Market Cap",
              value: global ? formatUSD(global.total_market_cap.usd) : "—",
              icon: DollarSign,
              change: `${marketChange >= 0 ? "+" : ""}${marketChange.toFixed(2)}%`,
              positive: marketChange >= 0,
            },
            {
              label: "24h Volume",
              value: global ? formatUSD(global.total_volume.usd) : "—",
              icon: Activity,
              change: "Global",
              positive: true,
            },
            {
              label: "ETH Gas",
              value: `${gas.ethereum.average} Gwei`,
              icon: Fuel,
              change: `Fast: ${gas.ethereum.fast}`,
              positive: true,
            },
            {
              label: "BTC Dominance",
              value: global ? `${global.btc_dominance.toFixed(1)}%` : "—",
              icon: TrendingUp,
              change: "of market",
              positive: true,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs uppercase tracking-wider">
                  {stat.label}
                </span>
                <stat.icon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div
                className={`text-xs mt-0.5 ${
                  stat.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid — responsive 3-column */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Coin List — 2 columns */}
          <div className="xl:col-span-2 space-y-4">
            {/* Portfolio summary — always visible when wallet connected */}
            <PortfolioSummary />

            {/* Top Coins */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-semibold">Top Cryptocurrencies</h2>
                <Link
                  href="/markets"
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {coinsLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 animate-pulse">
                        <div className="h-5 bg-white/5 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-white/5 rounded w-1/4" />
                      </div>
                    ))
                  : coins.map((coin, i) => (
                      <motion.div
                        key={coin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-gray-500 text-xs w-5 text-right shrink-0">
                            {i + 1}
                          </span>
                          <img
                            src={coin.image}
                            alt={coin.symbol}
                            className="w-7 h-7 rounded-full shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">
                              {coin.symbol.toUpperCase()}
                            </div>
                            <div className="text-gray-500 text-xs truncate">
                              {coin.name}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="text-sm font-medium">
                            ${coin.current_price.toLocaleString()}
                          </div>
                          <div
                            className={`text-xs ${
                              coin.price_change_percentage_24h >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: "/swap", label: "Swap", icon: ArrowLeftRight, desc: "Exchange tokens" },
                { href: "/arbitrage", label: "Arbitrage", icon: Repeat2, desc: "Find profits" },
                { href: "/alerts", label: "Create Alert", icon: Bell, desc: "Monitor prices" },
                { href: "/bots", label: "Deploy Bot", icon: Bot, desc: "Auto trade" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="glass glass-hover rounded-xl p-3 cursor-pointer transition-all">
                    <action.icon className="w-5 h-5 text-violet-400 mb-1.5" />
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-gray-500 text-xs">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Panel — News + Gas + Sentiment */}
          <div className="space-y-4">
            {/* Gas Tracker */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Fuel className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-sm">Gas Tracker</h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { chain: "Ethereum", slow: gas.ethereum.slow, avg: gas.ethereum.average, fast: gas.ethereum.fast },
                  { chain: "Base", slow: gas.base.slow, avg: gas.base.average, fast: gas.base.fast },
                  { chain: "Polygon", slow: gas.polygon.slow, avg: gas.polygon.average, fast: gas.polygon.fast },
                ].map((g) => (
                  <div key={g.chain} className="flex items-center justify-between">
                    <span className="text-gray-400 w-16">{g.chain}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-400">{g.slow}</span>
                      <span className="text-white">{g.avg}</span>
                      <span className="text-red-400">{g.fast}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-sm">Crypto News</h3>
              </div>
              <div className="space-y-2">
                {newsLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-white/5 rounded w-full mb-1" />
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                      </div>
                    ))
                  : news.slice(0, 5).map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-gray-400 hover:text-white transition-colors leading-relaxed"
                      >
                        <span className="text-violet-400">
                          {item.source ?? "News"}
                        </span>{" "}
                        {item.title}
                      </a>
                    ))}
              </div>
            </div>

            {/* Fear & Greed Detail */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Market Sentiment</span>
                <span
                  className={`text-sm font-bold ${
                    parseInt(fearGreed) > 50
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {classification}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    parseInt(fearGreed) > 50
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{ width: `${fearGreed}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
