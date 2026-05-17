"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
} from "lightweight-charts";
import SwapWidget from "@/components/swap/SwapWidget";
import { useTopCoins } from "@/lib/hooks/useMarketData";
import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";

const timeframes = ["1h", "4h", "1d", "1w", "1m"];

function generateMockCandles(count: number) {
  const data = [];
  let price = 3245;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * 30;
    price += change;
    const open = price;
    const close = price + (Math.random() - 0.5) * 15;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    data.push({
      time: (now - i * 3600) as any,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
  }
  return data;
}

function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState("1d");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    candleSeries.setData(generateMockCandles(200));

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">ETH/USDC</h2>
            <span className="text-emerald-400 text-sm font-medium">
              +3.25%
            </span>
          </div>
          <div className="text-3xl font-bold mt-1">$3,245.12</div>
        </div>
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeframe === tf
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

export default function SwapPage() {
  const { coins } = useTopCoins(5);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold gradient-text">Swap</h1>
          <p className="text-gray-500 text-sm">
            Cross-chain swaps via Uniswap, 1inch, Jupiter & Binance
          </p>
        </div>

        {/* Quick Token Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {coins.slice(0, 6).map((coin) => (
            <div
              key={coin.id}
              className="glass rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 hover:bg-white/10 cursor-pointer transition-all"
            >
              <img
                src={coin.image}
                alt={coin.symbol}
                className="w-5 h-5 rounded-full"
              />
              <div className="text-sm font-medium">{coin.symbol.toUpperCase()}</div>
              <div className="text-sm">${coin.current_price.toLocaleString()}</div>
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
          ))}
        </div>

        {/* Main Layout: Chart + Swap Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            <PriceChart />
          </div>
          <div className="xl:col-span-2">
            <SwapWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
