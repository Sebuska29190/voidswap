"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Play, Pause, StopCircle, Plus, Settings, TrendingUp } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  type: "DCA" | "Grid";
  status: "running" | "paused" | "stopped";
  pair: string;
  invested: string;
  value: string;
  pnl: string;
  pnlPercent: string;
  cycles: string;
  nextExecution: string;
}

const initialBots: BotData[] = [
  {
    id: "1",
    name: "ETH DCA Strategy",
    type: "DCA" as const,
    status: "running" as const,
    pair: "ETH/USDC",
    invested: "$500",
    value: "$543.20",
    pnl: "+$43.20",
    pnlPercent: "+8.6%",
    cycles: "12/100",
    nextExecution: "2h 15m",
  },
  {
    id: "2",
    name: "Grid: BTC Range 90-100K",
    type: "Grid" as const,
    status: "running" as const,
    pair: "BTC/USDC",
    invested: "$2,000",
    value: "$2,187.50",
    pnl: "+$187.50",
    pnlPercent: "+9.4%",
    cycles: "24/50",
    nextExecution: "Active",
  },
  {
    id: "3",
    name: "ARB Accumulation",
    type: "DCA" as const,
    status: "paused" as const,
    pair: "ARB/USDC",
    invested: "$300",
    value: "$285.00",
    pnl: "-$15.00",
    pnlPercent: "-5.0%",
    cycles: "6/50",
    nextExecution: "Paused",
  },
];

export default function BotsPage() {
  const [bots, setBots] = useState<BotData[]>(initialBots);

  const toggleStatus = (id: string) => {
    setBots(
      bots.map((b) => {
        if (b.id !== id) return b;
        if (b.status === "running") return { ...b, status: "paused" as const };
        return { ...b, status: "running" as const };
      })
    );
  };

  const stopBot = (id: string) => {
    setBots(bots.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trading Bots</h1>
            <p className="text-gray-500 text-sm mt-1">
              DCA & Grid trading automation
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 font-medium transition-all">
            <Plus className="w-4 h-4" />
            Deploy Bot
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Bots", value: "2", color: "text-emerald-400" },
            { label: "Total Invested", value: "$2,800", color: "text-white" },
            { label: "Total PnL", value: "+$215.70", color: "text-emerald-400" },
            { label: "Win Rate", value: "85%", color: "text-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="text-gray-500 text-sm">{stat.label}</div>
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bot List */}
        <div className="space-y-4">
          {bots.map((bot, i) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      bot.type === "DCA"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {bot.type === "DCA" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <Settings className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{bot.name}</div>
                    <div className="text-gray-500 text-sm">
                      {bot.type} · {bot.pair}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      bot.status === "running"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {bot.status === "running" ? "● Running" : "● Paused"}
                  </span>
                  <button
                    onClick={() => toggleStatus(bot.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {bot.status === "running" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => stopBot(bot.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Invested</div>
                  <div className="font-medium">{bot.invested}</div>
                </div>
                <div>
                  <div className="text-gray-500">Current Value</div>
                  <div className="font-medium">{bot.value}</div>
                </div>
                <div>
                  <div className="text-gray-500">PnL</div>
                  <div
                    className={`font-medium ${
                      bot.pnl.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {bot.pnl} ({bot.pnlPercent})
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Next Execution</div>
                  <div className="font-medium">{bot.nextExecution}</div>
                </div>
              </div>

              {/* Progress bar for cycles */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{bot.cycles}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    style={{
                      width: `${
                        (parseInt(bot.cycles.split("/")[0]) /
                          parseInt(bot.cycles.split("/")[1])) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Bot execution runs on our backend relay. Trades are signed and
            submitted through your connected wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
