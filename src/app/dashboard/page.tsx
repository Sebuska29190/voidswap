"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowLeftRight,
  Repeat2,
  Bell,
  Bot,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Portfolio Value", value: "$12,458.32", change: "+5.2%", icon: DollarSign, positive: true },
  { label: "24h Volume", value: "$3,241.89", change: "-2.1%", icon: Activity, positive: false },
  { label: "Active Bots", value: "3", change: "+1", icon: Bot, positive: true },
  { label: "Open Arbitrage", value: "2", change: "+2", icon: Repeat2, positive: true },
];

const quickActions = [
  { href: "/swap", label: "Swap", icon: ArrowLeftRight, desc: "Exchange tokens" },
  { href: "/arbitrage", label: "Scan Arbitrage", icon: Repeat2, desc: "Find profits" },
  { href: "/alerts", label: "Create Alert", icon: Bell, desc: "Monitor prices" },
  { href: "/bots", label: "Deploy Bot", icon: Bot, desc: "Automate trading" },
];

const recentTokens = [
  { symbol: "ETH", name: "Ether", price: "$3,245.12", change: "+3.2%", balance: "1.45", usd: "$4,705.42" },
  { symbol: "USDC", name: "USD Coin", price: "$1.00", change: "0.0%", balance: "5,000", usd: "$5,000.00" },
  { symbol: "ARB", name: "Arbitrum", price: "$0.85", change: "-1.5%", balance: "1,200", usd: "$1,020.00" },
  { symbol: "LINK", name: "Chainlink", price: "$14.23", change: "+7.8%", balance: "50", usd: "$711.50" },
];

export default function DashboardPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back{isConnected ? "" : " to VoidSwap"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isConnected
              ? "Here's your portfolio overview"
              : "Connect your wallet to see your portfolio"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div
                className={`text-sm mt-1 ${
                  stat.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all">
                  <action.icon className="w-6 h-6 text-violet-400 mb-2" />
                  <div className="font-medium">{action.label}</div>
                  <div className="text-gray-500 text-sm">{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-lg font-semibold">Top Holdings</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentTokens.map((token) => (
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
                    <div className="text-gray-500 text-sm">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{token.usd}</div>
                  <div className="text-gray-500 text-sm">
                    {token.balance} {token.symbol}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">{token.price}</div>
                  <div
                    className={`text-sm ${
                      token.change.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {token.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
