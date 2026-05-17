"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeftRight,
  Repeat2,
  Wallet,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: ArrowLeftRight,
    title: "Cross-Chain Swaps",
    desc: "Swap any asset across 20+ chains in one click. No wrapping, no bridging friction.",
  },
  {
    icon: Repeat2,
    title: "Arbitrage Scanner",
    desc: "Real-time arbitrage opportunities across DEXs. Spot price gaps and execute instantly.",
  },
  {
    icon: Wallet,
    title: "Portfolio Tracker",
    desc: "Unified view of your entire multi-chain portfolio. P&L, exposure, and history in one place.",
  },
];

const stats = [
  { label: "TVL", value: 2800000000, suffix: "+", prefix: "$" },
  { label: "Chains", value: 24, suffix: "" },
  { label: "Users", value: 850000, suffix: "+" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-black text-white">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="h-[600px] w-[800px] translate-y-[-200px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="h-[400px] w-[600px] translate-y-[300px] translate-x-[-200px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 pt-32 text-center sm:pt-40">
        <FadeUp>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm text-violet-300">
            <Zap className="h-3.5 w-3.5" />
            Now Live on Mainnet
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            <span className="gradient-text">Swap Across Chains.</span>
            <br />
            Instantly.
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-zinc-400 sm:text-xl">
            VoidSwap finds the best route across every DEX and chain — so you
            get the rate, every time.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="mt-10 flex items-center gap-4">
            <a
              href="/swap"
              className="glow group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105 hover:from-violet-500 hover:to-fuchsia-500"
            >
              <Zap className="h-5 w-5" />
              Launch App
            </a>
            <a
              href="https://docs.voidswap.io"
              target="_blank"
              rel="noopener noreferrer"
              className="glass glass-hover rounded-xl px-8 py-3.5 text-base font-medium text-zinc-300 transition-all hover:text-white"
            >
              Documentation
            </a>
          </div>
        </FadeUp>
      </section>

      {/* Stats */}
      <FadeUp delay={0.4}>
        <section className="relative z-10 mt-24 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 py-8 backdrop-blur-sm"
            >
              <span className="text-3xl font-bold tracking-tight sm:text-4xl">
                {s.prefix}
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              </span>
              <span className="text-sm text-zinc-500">{s.label}</span>
            </div>
          ))}
        </section>
      </FadeUp>

      {/* Features */}
      <section className="relative z-10 mt-32 mb-32 grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-3">
        {features.map((f, i) => (
          <FadeUp key={f.title} delay={0.15 * i}>
            <div className="glass glass-hover group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30 sm:p-8">
              {/* Gradient border accent */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    padding: 1,
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(232,121,249,0.1))",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          </FadeUp>
        ))}
      </section>

      {/* Bottom CTA */}
      <FadeUp delay={0.3}>
        <section className="relative z-10 mb-32 flex flex-col items-center px-4 text-center">
          <div className="glass rounded-3xl border border-white/10 p-12 sm:p-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to trade across chains?
            </h2>
            <p className="mt-4 text-zinc-400">
              Connect your wallet and start swapping in seconds.
            </p>
            <a
              href="/swap"
              className="glow mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105 hover:from-violet-500 hover:to-fuchsia-500"
            >
              <Zap className="h-5 w-5" />
              Launch App
            </a>
          </div>
        </section>
      </FadeUp>

      {/* Footer */}
      <footer className="relative z-10 mb-8 flex w-full max-w-6xl items-center justify-between px-4 text-sm text-zinc-600">
        <span>© 2026 VoidSwap</span>
        <div className="flex items-center gap-6">
          <a href="#" className="transition-colors hover:text-zinc-400">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-zinc-400">
            Docs
          </a>
          <a href="#" className="transition-colors hover:text-zinc-400">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
