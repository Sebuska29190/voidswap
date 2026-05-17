"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ExternalLink, PieChart } from "lucide-react";

const positions = [
  { chain: "Ethereum", tokens: [
    { symbol: "ETH", balance: "1.45", usd: "$4,705", pnl: "+$245", pnlPercent: "+5.5%", share: 45 },
    { symbol: "USDC", balance: "5,000", usd: "$5,000", pnl: "+$0", pnlPercent: "0%", share: 30 },
    { symbol: "LINK", balance: "50", usd: "$711", pnl: "+$51", pnlPercent: "+7.8%", share: 15 },
  ]},
  { chain: "Base", tokens: [
    { symbol: "ETH", balance: "0.5", usd: "$1,622", pnl: "+$89", pnlPercent: "+5.8%", share: 60 },
    { symbol: "cbETH", balance: "0.3", usd: "$975", pnl: "+$12", pnlPercent: "+1.2%", share: 40 },
  ]},
  { chain: "Polygon", tokens: [
    { symbol: "MATIC", balance: "2,500", usd: "$1,125", pnl: "-$75", pnlPercent: "-6.3%", share: 100 },
  ]},
];

const totalValue = "$14,138";
const totalPnl = "+$322";
const totalPnlPercent = "+2.3%";

export default function PortfolioPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">View your portfolio across all chains</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-gray-500 mt-1">Across all connected chains</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalValue}</div>
            <div className="text-emerald-400 text-sm">
              {totalPnl} ({totalPnlPercent})
            </div>
          </div>
        </div>

        {/* Allocation Pie (simplified) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold">Allocation</h2>
            </div>
            <div className="space-y-3">
              {positions.flatMap(p => p.tokens).slice(0, 5).map((t) => (
                <div key={t.symbol}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.symbol}</span>
                    <span className="text-gray-400">{t.share}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ width: `${t.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chain Breakdown */}
          <div className="lg:col-span-2 space-y-4">
            {positions.map((chain, i) => (
              <motion.div
                key={chain.chain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold">{chain.chain}</h3>
                  <span className="text-sm text-gray-500">
                    {chain.tokens.reduce((a, t) => {
                      const num = parseFloat(t.usd.replace(/[$,]/g, ""));
                      return a + num;
                    }, 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {chain.tokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold">
                          {token.symbol[0]}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-gray-500 text-sm">
                            {token.balance} tokens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{token.usd}</div>
                        <div
                          className={`text-sm ${
                            token.pnl.startsWith("+")
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {token.pnl} ({token.pnlPercent})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
