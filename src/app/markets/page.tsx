"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { useTopCoins } from "@/lib/hooks/useMarketData";
import Link from "next/link";

type SortField = "market_cap" | "current_price" | "price_change_percentage_24h" | "total_volume";
type SortDir = "asc" | "desc";

export default function MarketsPage() {
  const { coins, isLoading } = useTopCoins(50);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterGainers, setFilterGainers] = useState(false);

  const filtered = useMemo(() => {
    let result = [...coins];

    if (search) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterGainers) {
      result = result.filter((c) => c.price_change_percentage_24h > 0);
    }

    result.sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      return (a[sortField] - b[sortField]) * mul;
    });

    return result;
  }, [coins, search, sortField, sortDir, filterGainers]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Markets</h1>
            <p className="text-gray-500 text-sm">
              Real-time cryptocurrency prices
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterGainers(!filterGainers)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterGainers
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Top Gainers
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="text-left p-4 font-medium w-10">#</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th
                    className="text-right p-4 font-medium cursor-pointer hover:text-white"
                    onClick={() => toggleSort("current_price")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Price <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right p-4 font-medium cursor-pointer hover:text-white"
                    onClick={() => toggleSort("price_change_percentage_24h")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      24h <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right p-4 font-medium cursor-pointer hover:text-white hidden md:table-cell"
                    onClick={() => toggleSort("market_cap")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Market Cap <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right p-4 font-medium hidden lg:table-cell"
                    onClick={() => toggleSort("total_volume")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Volume 24h <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-center p-4 font-medium w-20 hidden sm:table-cell">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-white/5 rounded w-5" /></td>
                        <td className="p-4"><div className="h-4 bg-white/5 rounded w-32" /></td>
                        <td className="p-4"><div className="h-4 bg-white/5 rounded w-20 ml-auto" /></td>
                        <td className="p-4"><div className="h-4 bg-white/5 rounded w-16 ml-auto" /></td>
                        <td className="p-4 hidden md:table-cell"><div className="h-4 bg-white/5 rounded w-24 ml-auto" /></td>
                        <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-white/5 rounded w-20 ml-auto" /></td>
                        <td className="p-4 hidden sm:table-cell" />
                      </tr>
                    ))
                  : filtered.map((coin, i) => (
                      <motion.tr
                        key={coin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => window.open(`https://www.coingecko.com/en/coins/${coin.id}`, "_blank")}
                      >
                        <td className="p-4 text-gray-500 text-xs">{i + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={coin.image}
                              alt={coin.symbol}
                              className="w-6 h-6 rounded-full"
                            />
                            <div>
                              <span className="font-medium">
                                {coin.symbol.toUpperCase()}
                              </span>
                              <span className="text-gray-500 ml-1.5 hidden sm:inline">
                                {coin.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium">
                          ${coin.current_price.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              coin.price_change_percentage_24h >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-400 hidden md:table-cell">
                          ${(coin.market_cap / 1e9).toFixed(2)}B
                        </td>
                        <td className="p-4 text-right text-gray-400 hidden lg:table-cell">
                          ${(coin.total_volume / 1e9).toFixed(2)}B
                        </td>
                        <td className="p-4 text-center hidden sm:table-cell">
                          {coin.sparkline_in_7d?.price && (
                            <div className="w-16 h-8 inline-block">
                              <svg viewBox="0 0 50 20" className="w-full h-full">
                                <path
                                  d={
                                    "M" +
                                    coin.sparkline_in_7d.price
                                      .filter((_: number, j: number) => j % 5 === 0)
                                      .map((p: number, j: number) => `${j * 5},${20 - ((p - Math.min(...coin.sparkline_in_7d!.price)) / (Math.max(...coin.sparkline_in_7d!.price) - Math.min(...coin.sparkline_in_7d!.price) || 1)) * 18}`)
                                      .join(" L")
                                  }
                                  fill="none"
                                  stroke={
                                    coin.price_change_percentage_24h >= 0
                                      ? "#22c55e"
                                      : "#ef4444"
                                  }
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
