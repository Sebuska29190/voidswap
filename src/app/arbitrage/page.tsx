"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Repeat2, TrendingUp, TrendingDown, RefreshCw, Filter } from "lucide-react";

const mockOpportunities = [
  {
    id: "1",
    pair: "ETH/USDC",
    buyOn: "Uniswap (Base)",
    sellOn: "Jupiter (Solana)",
    spread: "0.42%",
    profit: "$124.50",
    gas: "$3.20",
    net: "$121.30",
    liquidity: "High",
    confidence: 92,
  },
  {
    id: "2",
    pair: "WBTC/ETH",
    buyOn: "1inch (Ethereum)",
    sellOn: "Uniswap (Arbitrum)",
    spread: "0.38%",
    profit: "$89.20",
    gas: "$5.80",
    net: "$83.40",
    liquidity: "High",
    confidence: 87,
  },
  {
    id: "3",
    pair: "MATIC/USDC",
    buyOn: "Uniswap (Polygon)",
    sellOn: "Binance",
    spread: "0.25%",
    profit: "$45.00",
    gas: "$1.50",
    net: "$43.50",
    liquidity: "Medium",
    confidence: 78,
  },
  {
    id: "4",
    pair: "LINK/ETH",
    buyOn: "Binance",
    sellOn: "Uniswap (Ethereum)",
    spread: "0.18%",
    profit: "$32.80",
    gas: "$8.40",
    net: "$24.40",
    liquidity: "High",
    confidence: 65,
  },
];

export default function ArbitragePage() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Arbitrage Scanner</h1>
            <p className="text-gray-500 text-sm mt-1">
              Cross-chain & cross-DEX price disparities
            </p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active Opportunities", value: "4", change: "+2 (5m)" },
            { label: "Avg Spread", value: "0.31%", change: "+0.05%" },
            { label: "Potential 24h Profit", value: "$1,245", change: "+12%" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="text-gray-500 text-sm mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-emerald-400 text-sm">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Opportunities Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold">Live Opportunities</h2>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="text-left p-4 font-medium">Pair</th>
                  <th className="text-left p-4 font-medium">Buy On</th>
                  <th className="text-left p-4 font-medium">Sell On</th>
                  <th className="text-right p-4 font-medium">Spread</th>
                  <th className="text-right p-4 font-medium">Est. Profit</th>
                  <th className="text-right p-4 font-medium">Gas</th>
                  <th className="text-right p-4 font-medium">Net Profit</th>
                  <th className="text-center p-4 font-medium">Confidence</th>
                  <th className="text-center p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockOpportunities.map((opp, i) => (
                  <motion.tr
                    key={opp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium">{opp.pair}</span>
                    </td>
                    <td className="p-4 text-gray-400">{opp.buyOn}</td>
                    <td className="p-4 text-gray-400">{opp.sellOn}</td>
                    <td className="p-4 text-right text-emerald-400">
                      {opp.spread}
                    </td>
                    <td className="p-4 text-right">{opp.profit}</td>
                    <td className="p-4 text-right text-gray-400">{opp.gas}</td>
                    <td className="p-4 text-right font-medium">{opp.net}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
                            style={{ width: `${opp.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {opp.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button className="px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-all">
                        Execute
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <Repeat2 className="w-5 h-5 text-violet-400 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">How It Works</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                VoidSwap scans prices across Uniswap (Ethereum, Base, Polygon,
                Arbitrum), Jupiter (Solana), 1inch, and Binance. When a price
                discrepancy exceeds gas costs + 0.1% slippage, it&apos;s flagged as
                an opportunity. Confidence score is based on liquidity depth,
                historical success rate, and MEV resistance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
