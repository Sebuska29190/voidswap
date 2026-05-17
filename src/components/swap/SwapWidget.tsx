"use client";

import { useState, useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Settings,
  RefreshCw,
  Info,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
} from "lucide-react";
import { TokenSelectModal } from "./TokenSelectModal";
import type { Token, SwapQuote } from "@/types";
import { TOKEN_LISTS } from "@/lib/prices";
import { formatEther } from "viem";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 2.0];

export default function SwapWidget() {
  const { address, isConnected } = useAccount();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [mode, setMode] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tokenModal, setTokenModal] = useState<"from" | "to" | null>(null);
  const [showChart, setShowChart] = useState(false);

  const chainId = 1; // default to Ethereum
  const tokens = useMemo(() => TOKEN_LISTS[chainId] ?? TOKEN_LISTS[1], [chainId]);

  const { data: fromBalance } = useBalance({
    address,
    token: fromToken?.address as `0x${string}` | undefined,
    chainId,
  });

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    if (fromBalance) {
      setFromAmount(formatEther(fromBalance.value));
    }
  };

  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    if (val && parseFloat(val) > 0) {
      const mockPrice = mode === "market" ? 3245.12 : parseFloat(limitPrice) || 3245.12;
      const estimated = parseFloat(val) * mockPrice * 0.997; // 0.3% fee
      setToAmount(estimated.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Swap Widget + Chart */}
      <div className="flex-1 space-y-4">
        {/* Price Chart Preview (when visible) */}
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 200 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="h-full flex items-center justify-center text-gray-500 text-sm bg-gradient-to-b from-black/0 to-black/0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-700" />
                <span className="ml-2">Chart loading...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Swap Form */}
        <div className="glass rounded-2xl p-5 max-w-md mx-auto lg:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setMode("market")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "market"
                    ? "bg-violet-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setMode("limit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "limit"
                    ? "bg-violet-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Limit
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowChart(!showChart)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showChart
                    ? "bg-violet-500/20 text-violet-400"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slippage Settings */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/5 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Slippage Tolerance</span>
                  {slippage > 1 && (
                    <span className="text-yellow-400">High slippage ⚠</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {SLIPPAGE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSlippage(s);
                        setCustomSlippage("");
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        slippage === s && !customSlippage
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Limit Price Input */}
          {mode === "limit" && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Limit Price</div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  USD
                </span>
              </div>
            </div>
          )}

          {/* From Token */}
          <div className="bg-white/5 rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">You Pay</span>
              {isConnected && fromBalance && (
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Balance: {parseFloat(formatEther(fromBalance.value)).toFixed(4)}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setTokenModal("from")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
              >
                {fromToken ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px] font-bold">
                      {fromToken.symbol[0]}
                    </div>
                    <span className="text-sm font-medium">{fromToken.symbol}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Select token</span>
                )}
              </button>
            </div>
            {fromAmount && (
              <div className="text-xs text-gray-500 mt-1">
                ~$
                {(parseFloat(fromAmount) * 3245.12).toLocaleString()}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="w-9 h-9 rounded-full bg-[#1a1a2e] border-4 border-black flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowDownUp className="w-4 h-4 text-violet-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">You Receive</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
              />
              <button
                onClick={() => setTokenModal("to")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
              >
                {toToken ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px] font-bold">
                      {toToken.symbol[0]}
                    </div>
                    <span className="text-sm font-medium">{toToken.symbol}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Select token</span>
                )}
              </button>
            </div>
            {toAmount && (
              <div className="text-xs text-gray-500 mt-1">
                ~$
                {(parseFloat(toAmount) * 3245.12).toLocaleString()}
              </div>
            )}
          </div>

          {/* Route Info */}
          {fromAmount && toAmount && (
            <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Rate</span>
                <span>
                  1 {fromToken?.symbol ?? "ETH"} = {3245.12}{" "}
                  {toToken?.symbol ?? "USDC"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Impact</span>
                <span className="text-emerald-400">&lt; 0.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="text-violet-400">Uniswap → 1inch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Gas</span>
                <span>$3.42</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-sm hover:opacity-90 transition-all glow">
              Connect Wallet
            </button>
          ) : loading ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-violet-500/50 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" /> Swapping...
            </button>
          ) : (
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-sm hover:opacity-90 transition-all">
              {mode === "market" ? "Swap" : "Place Limit Order"}
            </button>
          )}
        </div>
      </div>

      {/* Right: Token Info Panel */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Price Card */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">ETH/USDC Price</h3>
          </div>
          <div className="text-2xl font-bold">$3,245.12</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-emerald-400 text-sm">+3.25%</span>
            <span className="text-gray-500 text-xs">24h</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div>
              <div className="text-gray-500">24h High</div>
              <div className="font-medium">$3,312.50</div>
            </div>
            <div>
              <div className="text-gray-500">24h Low</div>
              <div className="font-medium">$3,190.80</div>
            </div>
            <div>
              <div className="text-gray-500">24h Volume</div>
              <div className="font-medium">$18.2B</div>
            </div>
            <div>
              <div className="text-gray-500">Liquidity</div>
              <div className="font-medium text-emerald-400">$245M</div>
            </div>
          </div>
        </div>

        {/* Order Book Preview */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-sm">Order Book</h3>
          </div>
          <div className="space-y-1 text-xs">
            {[
              { price: 3245.5, amount: 12.5, total: 40568.75, side: "ask" },
              { price: 3245.0, amount: 8.3, total: 26933.5, side: "ask" },
              { price: 3244.8, amount: 15.2, total: 49320.96, side: "ask" },
              { price: 3244.5, amount: 5.1, total: 16546.95, side: "ask" },
            ].map((order, i) => (
              <div
                key={i}
                className="flex justify-between text-red-400/80 relative"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/5 rounded"
                  style={{
                    width: `${(order.total / 49320.96) * 100}%`,
                  }}
                />
                <span className="relative z-10">
                  {order.price.toFixed(1)}
                </span>
                <span className="relative z-10">{order.amount}</span>
                <span className="relative z-10">
                  ${order.total.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="text-center text-white font-medium py-1 border-y border-white/5 my-1">
              $3,244.20
            </div>
            {[
              { price: 3243.8, amount: 10.2, total: 33086.76, side: "bid" },
              { price: 3243.5, amount: 7.8, total: 25299.3, side: "bid" },
              { price: 3243.0, amount: 20.5, total: 66481.5, side: "bid" },
              { price: 3242.5, amount: 3.2, total: 10376.0, side: "bid" },
            ].map((order, i) => (
              <div
                key={i}
                className="flex justify-between text-emerald-400/80 relative"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/5 rounded"
                  style={{
                    width: `${(order.total / 66481.5) * 100}%`,
                  }}
                />
                <span className="relative z-10">
                  {order.price.toFixed(1)}
                </span>
                <span className="relative z-10">{order.amount}</span>
                <span className="relative z-10">
                  ${order.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3">Recent Trades</h3>
          <div className="space-y-2 text-xs">
            {[
              { type: "buy", amount: "0.45 ETH", price: "$3,245", time: "12s ago" },
              { type: "sell", amount: "1.2 ETH", price: "$3,244", time: "34s ago" },
              { type: "buy", amount: "0.08 ETH", price: "$3,246", time: "1m ago" },
              { type: "buy", amount: "2.5 ETH", price: "$3,243", time: "2m ago" },
              { type: "sell", amount: "0.33 ETH", price: "$3,245", time: "3m ago" },
            ].map((trade, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      trade.type === "buy" ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span>{trade.amount}</span>
                </div>
                <span className="text-gray-400">{trade.price}</span>
                <span className="text-gray-500">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token Select Modal */}
      <TokenSelectModal
        open={tokenModal !== null}
        onClose={() => setTokenModal(null)}
        onSelect={(token) => {
          if (tokenModal === "from") {
            setFromToken(token);
          } else {
            setToToken(token);
          }
        }}
        chainId={chainId}
        excludeAddress={
          tokenModal === "from"
            ? toToken?.address
            : fromToken?.address
        }
      />
    </div>
  );
}
