import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoidSwap — Cross-Chain DEX Aggregator",
  description:
    "Swap, arbitrage, and track your DeFi portfolio across Ethereum, Base, Polygon, Arbitrum, and Solana.",
  openGraph: {
    title: "VoidSwap",
    description: "Next-gen cross-chain DEX aggregator",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Providers>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
