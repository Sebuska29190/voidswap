"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useTopCoins } from "@/lib/hooks/useMarketData";

function PriceTicker() {
  const { coins } = useTopCoins(6);

  return (
    <div className="flex-1 overflow-hidden">
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...coins, ...coins].map((coin, i) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-2 text-sm">
            <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full" />
            <span className="font-medium text-white">
              {coin.symbol.toUpperCase()}
            </span>
            <span className="text-white/80">
              ${coin.current_price.toLocaleString()}
            </span>
            <span
              className={`text-xs ${
                coin.price_change_percentage_24h >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {coin.price_change_percentage_24h >= 0 ? "+" : ""}
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-12 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center h-full ml-[220px]">
        {/* Live Price Ticker */}
        <div className="flex-1 px-4">
          <PriceTicker />
        </div>

        {/* Wallet Connect */}
        <div className="px-3 shrink-0">
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
