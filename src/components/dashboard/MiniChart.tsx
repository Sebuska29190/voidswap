"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, AreaSeries, ColorType } from "lightweight-charts";

interface MiniChartProps {
  prices: [number, number][];
  color?: "green" | "red";
}

export function MiniChart({ prices, color = "green" }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current || prices.length < 2) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 60,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });

    const lineSeries = chart.addSeries(AreaSeries);
    lineSeries.setData(
      prices.map(([t, p]: [number, number], i: number) => ({
        time: (Math.floor(Date.now() / 1000) - (prices.length - i) * 3600) as any,
        value: p,
      }))
    );
    lineSeries.applyOptions({
      lineColor: color === "green" ? "#22c55e" : "#ef4444",
      topColor: color === "green" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
      bottomColor: "transparent",
      lineWidth: 2,
    });

    chartRef.current = chart;
    return () => chart.remove();
  }, [prices, color]);

  return <div ref={containerRef} className="w-full" />;
}
