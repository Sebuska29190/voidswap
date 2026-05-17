"use client";

import { useState, useCallback, useMemo } from "react";
import { useAccount, useBalance, useSendTransaction, useSimulateContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { Settings, ArrowDownUp, RefreshCw } from "lucide-react";
import type { Token, SwapQuote } from "@/types";

const POPULAR_TOKENS: Token[] = [
  { address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ether", decimals: 18, chainId: 1, price: 3200 },
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, chainId: 1, price: 1 },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether", decimals: 6, chainId: 1, price: 1 },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8, chainId: 1, price: 68000 },
];

const PRESET_SLIPPAGE = [0.1, 0.5, 1] as const;

type QuoteState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; quote: SwapQuote }
  | { status: "error"; error: string };

type TabMode = "market" | "limit";

const EXPIRY_OPTIONS = [
  { label: "5 min", value: 300 },
  { label: "15 min", value: 900 },
  { label: "1 hour", value: 3600 },
  { label: "4 hours", value: 14400 },
  { label: "24 hours", value: 86400 },
] as const;

function TokenSelector({
  token,
  tokens,
  amount,
  onTokenChange,
  onAmountChange,
  balance,
  balanceUSD,
  side,
}: {
  token: Token | null;
  tokens: Token[];
  amount: string;
  onTokenChange: (t: Token) => void;
  onAmountChange: (v: string) => void;
  balance: string;
  balanceUSD: number;
  side: "from" | "to";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/[0.07]">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span>{side === "from" ? "You Pay" : "You Receive"}</span>
        {balance && (
          <button
            type="button"
            className="hover:text-zinc-300"
            onClick={() => {
              if (side === "from" && balance) {
                onAmountChange(formatEther(BigInt(balance)));
              }
            }}
          >
            Balance: {parseFloat(formatEther(BigInt(balance || "0"))).toFixed(4)}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20"
        >
          {token ? (
            <>
              {token.logoURI ? (
                <img src={token.logoURI} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold">
                  {token.symbol[0]}
                </div>
              )}
              <span>{token.symbol}</span>
            </>
          ) : (
            <span className="text-zinc-400">Select token</span>
          )}
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            if ((v.match(/\./g) || []).length <= 1) onAmountChange(v);
          }}
          readOnly={side === "to"}
          className="flex-1 bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-zinc-600"
        />
      </div>
      {token?.price && amount && (
        <div className="mt-1 text-right text-xs text-zinc-500">
          ~${(parseFloat(amount || "0") * token.price).toFixed(2)}
        </div>
      )}
      {balanceUSD > 0 && (
        <div className="mt-1 text-right text-xs text-zinc-500">
          ${balanceUSD.toFixed(2)}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-4 right-4 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl">
            {tokens.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  onTokenChange(t);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10"
              >
                {t.logoURI ? (
                  <img src={t.logoURI} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold">
                    {t.symbol[0]}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-medium">{t.symbol}</div>
                  <div className="text-xs text-zinc-500">{t.name}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm">
                    {parseFloat(formatEther(BigInt(balance || "0"))).toFixed(4)}
                  </div>
                  {t.price && (
                    <div className="text-xs text-zinc-500">
                      ${(parseFloat(formatEther(BigInt(balance || "0"))) * t.price).toFixed(2)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SwapWidget() {
  const { address, isConnected } = useAccount();
  const [tabMode, setTabMode] = useState<TabMode>("market");
  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState<QuoteState>({ status: "idle" });
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Limit order state
  const [limitPrice, setLimitPrice] = useState("");
  const [expiry, setExpiry] = useState<number>(EXPIRY_OPTIONS[2].value);

  // Wagmi hooks
  const { data: fromBalance } = useBalance({
    address,
    token: fromToken.address === "0x0000000000000000000000000000000000000000" ? undefined : fromToken.address as `0x${string}`,
  });

  const { data: toBalance } = useBalance({
    address,
    token: toToken.address === "0x0000000000000000000000000000000000000000" ? undefined : toToken.address as `0x${string}`,
  });

  const fromBalanceFormatted = fromBalance?.value?.toString() || "0";
  const fromBalanceUSD = fromBalance ? parseFloat(formatEther(fromBalance.value)) * (fromToken.price || 0) : 0;
  const toBalanceUSD = toBalance ? parseFloat(formatEther(toBalance.value)) * (toToken.price || 0) : 0;

  const fromAmountWei = useMemo(() => {
    try {
      return parseEther(fromAmount || "0");
    } catch {
      return BigInt(0);
    }
  }, [fromAmount]);

  const insufficientBalance = useMemo(() => {
    if (!fromAmount || !fromBalance) return false;
    return fromAmountWei > fromBalance.value;
  }, [fromAmount, fromBalance, fromAmountWei]);

  // Simulate swap contract call
  const { data: simData, isLoading: simLoading } = useSimulateContract({
    address: fromToken.address as `0x${string}`,
    abi: [],
    functionName: "transfer",
    args: [],
    query: { enabled: isConnected && !!fromAmount && !insufficientBalance },
  });

  const { sendTransaction, isPending: txPending } = useSendTransaction();

  // Fetch quote
  const fetchQuote = useCallback(async () => {
    if (!fromAmount || !fromToken || !toToken) return;
    setQuote({ status: "loading" });
    try {
      const res = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: fromAmount,
          chainId: fromToken.chainId,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to fetch quote");
      }
      const data: SwapQuote = await res.json();
      setQuote({ status: "success", quote: data });
      setToAmount(data.toAmount);
    } catch (e) {
      setQuote({ status: "error", error: (e as Error).message || "Quote fetch failed" });
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = useCallback(() => {
    const tmpT = fromToken;
    setFromToken(toToken);
    setToToken(tmpT);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setQuote({ status: "idle" });
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleSwap = useCallback(() => {
    if (!simData?.request) return;
    sendTransaction(simData.request);
  }, [simData, sendTransaction]);

  const activeSlippage = customSlippage ? parseFloat(customSlippage) : slippage;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setTabMode("market")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                tabMode === "market" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setTabMode("limit")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                tabMode === "limit" ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Limit
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </button>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
                  <div className="mb-3 text-sm font-medium text-zinc-300">Slippage Tolerance</div>
                  <div className="mb-3 flex gap-2">
                    {PRESET_SLIPPAGE.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSlippage(s);
                          setCustomSlippage("");
                        }}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          slippage === s && !customSlippage
                            ? "bg-violet-600 text-white"
                            : "bg-white/10 text-zinc-400 hover:bg-white/20"
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Custom"
                      value={customSlippage}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, "");
                        setCustomSlippage(v);
                      }}
                      className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-violet-500"
                    />
                    <span className="text-sm text-zinc-500">%</span>
                  </div>
                  {activeSlippage > 5 && (
                    <div className="mt-2 text-xs text-amber-400">
                      High slippage tolerance. Transactions may be frontrun.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Token Selectors */}
        <div className="space-y-1 px-1 pb-1">
          <TokenSelector
            token={fromToken}
            tokens={POPULAR_TOKENS}
            amount={fromAmount}
            onTokenChange={setFromToken}
            onAmountChange={setFromAmount}
            balance={fromBalanceFormatted}
            balanceUSD={fromBalanceUSD}
            side="from"
          />
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-black bg-violet-600 text-white transition-colors hover:bg-violet-500"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>
          <TokenSelector
            token={toToken}
            tokens={POPULAR_TOKENS}
            amount={toAmount}
            onTokenChange={setToToken}
            onAmountChange={() => {}}
            balance={toBalance?.value?.toString() || "0"}
            balanceUSD={toBalanceUSD}
            side="to"
          />
        </div>

        {/* Limit Order Panel */}
        {tabMode === "limit" && (
          <div className="mx-1 mb-2 space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div>
              <div className="mb-1 text-xs text-zinc-500">Limit Price</div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-zinc-500">Expiry</div>
              <div className="flex gap-1.5">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExpiry(opt.value)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                      expiry === opt.value
                        ? "bg-violet-600/30 text-violet-300"
                        : "bg-white/5 text-zinc-500 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quote Info */}
        {quote.status === "loading" && (
          <div className="mx-1 mb-2 flex items-center justify-center gap-2 rounded-xl bg-white/[0.02] py-3 text-sm text-zinc-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Fetching best quote...
          </div>
        )}

        {quote.status === "success" && (
          <div className="mx-1 mb-2 space-y-1.5 rounded-xl bg-white/[0.02] px-3 py-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Price</span>
              <span className="text-zinc-300">
                1 {quote.quote.fromToken.symbol} = {parseFloat(quote.quote.price).toFixed(6)} {quote.quote.toToken.symbol}
              </span>
            </div>
            {quote.quote.priceImpact > 0.5 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Price Impact</span>
                <span className={quote.quote.priceImpact > 3 ? "text-red-400" : "text-amber-400"}>
                  {quote.quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
            {quote.quote.route.length > 0 && (
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Route</span>
                <div className="flex items-center gap-1">
                  {quote.quote.route.map((r, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-zinc-600">→</span>}
                      <span className="rounded bg-white/10 px-1.5 py-0.5">{r.exchange}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Gas</span>
              <span className="text-zinc-300">
                {formatEther(BigInt(quote.quote.gas))} ETH (${parseFloat(quote.quote.estimatedGasUSD).toFixed(2)})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Network</span>
              <span className="text-zinc-300">{quote.quote.exchange}</span>
            </div>
          </div>
        )}

        {quote.status === "error" && (
          <div className="mx-1 mb-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-400">
            {quote.error}
          </div>
        )}

        {insufficientBalance && (
          <div className="mx-1 mb-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-400">
            Insufficient {fromToken.symbol} balance
          </div>
        )}

        {/* Action Button */}
        <div className="px-1 pb-2">
          {!isConnected ? (
            <button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-base font-semibold text-white transition-all hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500"
            >
              Connect Wallet
            </button>
          ) : tabMode === "limit" ? (
            <button
              type="button"
              disabled={!limitPrice || !fromAmount || txPending}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-base font-semibold text-white transition-all hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:hover:scale-100"
            >
              {txPending ? "Placing Order..." : "Place Limit Order"}
            </button>
          ) : quote.status === "loading" || simLoading ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/50 py-3.5 text-base font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4 animate-spin" />
              Swapping...
            </button>
          ) : fromAmount ? (
            <button
              type="button"
              onClick={handleSwap}
              disabled={insufficientBalance || !quote || quote.status !== "success" || txPending}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-base font-semibold text-white transition-all hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:hover:scale-100"
            >
              {txPending ? "Confirming..." : "Swap"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-white/10 py-3.5 text-base font-semibold text-zinc-500"
            >
              Enter an amount
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
