"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import type { Token } from "@/types";
import { TOKEN_LISTS } from "@/lib/prices";

interface TokenSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  chainId: number;
  excludeAddress?: string;
}

export function TokenSelectModal({
  open,
  onClose,
  onSelect,
  chainId,
  excludeAddress,
}: TokenSelectModalProps) {
  const [search, setSearch] = useState("");

  const tokens = (TOKEN_LISTS[chainId] ?? TOKEN_LISTS[1])
    .filter((t) => t.address !== excludeAddress)
    .filter(
      (t) =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Select Token</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or symbol"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
              {tokens.map((t) => (
                <button
                  key={t.address}
                  onClick={() => {
                    onSelect(t as Token);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {t.symbol[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{t.name}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    ${t.symbol === "ETH" ? "3,245" : t.symbol === "USDC" ? "1.00" : "—"}
                  </div>
                </button>
              ))}
              {tokens.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-6">
                  No tokens found
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
