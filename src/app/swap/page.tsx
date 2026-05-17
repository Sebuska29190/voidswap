"use client";

import SwapWidget from "@/components/swap/SwapWidget";

export default function SwapPage() {
  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Swap</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cross-chain swaps via Uniswap, 1inch, Jupiter & more
          </p>
        </div>
        <SwapWidget />
      </div>
    </div>
  );
}
