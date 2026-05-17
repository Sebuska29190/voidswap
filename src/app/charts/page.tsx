"use client";

import { useState, useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import { motion } from "framer-motion";
import { Clock, TrendingUp, BarChart3 } from "lucide-react";

const timeframes = ["1h", "4h", "1d", "1w", "1m"];

const indicators = [
  { label: "EMA (12, 26)", active: true },
  { label: "RSI (14)", active: false },
  { label: "MACD", active: false },
  { label: "Bollinger Bands", active: false },
  { label: "Volume", active: true },
];

// Mock data generator
function generateMockData(count: number) {
  const data = [];
  let price = 3200;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * 50;
    price += change;
    const open = price;
    const close = price + (Math.random() - 0.5) * 20;
    const high = Math.max(open, close) + Math.random() * 15;
    const low = Math.min(open, close) - Math.random() * 15;
    data.push({
      time: (now - i * 3600) as any,
      open,
      high,
      low,
      close,
    });
  }
  return data;
}

export default function ChartsPage() {
  const [timeframe, setTimeframe] = useState("1d");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#6b7280",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    candleSeries.setData(generateMockData(200));
    chartRef.current = chart;

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
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Charts</h1>
            <p className="text-gray-500 text-sm mt-1">
              ETH/USD · Technical Analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">$3,245.12</span>
            <span className="text-emerald-400 text-sm">+3.2%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart */}
          <div className="lg:col-span-3">
            <div className="glass rounded-xl p-4">
              {/* Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        timeframe === tf
                          ? "bg-violet-500/20 text-violet-300"
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {indicators
                    .filter((i) => i.active)
                    .map((ind) => (
                      <span
                        key={ind.label}
                        className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded text-xs"
                      >
                        {ind.label}
                      </span>
                    ))}
                </div>
              </div>

              <div ref={chartContainerRef} className="w-full" />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <h3 className="font-semibold mb-3">Indicators</h3>
              <div className="space-y-2">
                {indicators.map((ind) => (
                  <label
                    key={ind.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">{ind.label}</span>
                    <div
                      className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
                        ind.active ? "bg-violet-500" : "bg-white/10"
                      }`}
                    />
                  </label>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-4"
            >
              <h3 className="font-semibold mb-3">Market Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">24h Volume</span>
                  <span>$18.2B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">24h High</span>
                  <span>$3,312.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">24h Low</span>
                  <span>$3,190.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Market Cap</span>
                  <span>$390B</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
