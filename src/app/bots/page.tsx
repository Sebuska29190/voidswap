"use client";

import Link from "next/link";
import {
  Bot,
  Plus,
  ArrowLeftRight,
  Repeat2,
  Bell,
  ExternalLink,
} from "lucide-react";

export default function BotsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Trading Bots</h1>
          <p className="text-gray-500 text-sm">
            Deploy and manage automated trading strategies
          </p>
        </div>

        {/* Empty State */}
        <div className="glass rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Bots Deployed</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-2">
            Create automated trading strategies: DCA, grid trading, arbitrage
            scanning, or price-based triggers.
          </p>
          <p className="text-gray-600 text-xs mb-6">
            Bot engine available soon — DCA, Grid, and Arbitrage bots will run
            via a backend worker connected to your wallet.
          </p>

          {/* Placeholder feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {[
              {
                icon: ArrowLeftRight,
                label: "DCA Bot",
                desc: "Auto-buy at set intervals",
                status: "Coming soon",
              },
              {
                icon: Repeat2,
                label: "Grid Bot",
                desc: "Range-bound trading",
                status: "Coming soon",
              },
              {
                icon: Bell,
                label: "Alert Bot",
                desc: "Price trigger actions",
                status: "Coming soon",
              },
            ].map((feature) => (
              <div
                key={feature.label}
                className="glass rounded-xl p-4 text-left"
              >
                <feature.icon className="w-6 h-6 text-violet-400 mb-2" />
                <h4 className="font-semibold text-sm">{feature.label}</h4>
                <p className="text-gray-500 text-xs mb-2">{feature.desc}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                  {feature.status}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/swap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium"
            >
              Start Swapping
            </Link>
            <Link
              href="/arbitrage"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm font-medium"
            >
              Scan Arbitrage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
