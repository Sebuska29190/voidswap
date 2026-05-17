# VoidSwap 🔮

**Next-gen cross-chain DEX aggregator.** Swap, arbitrage, and track your DeFi portfolio across Ethereum, Base, Polygon, Arbitrum, Optimism, and Solana.

![VoidSwap](public/og-image.png)

## Features

- ⚡ **Cross-Chain Swaps** — Market & Limit orders via Uniswap, 1inch, Jupiter, Binance
- 🔍 **Arbitrage Scanner** — Real-time cross-DEX price disparities with confidence scoring
- 📊 **Portfolio Tracker** — Multi-chain wallet tracking, PnL, allocation
- 📈 **Trading Charts** — Professional candlestick charts with EMA, RSI, MACD, Volume
- 🔔 **Price Alerts** — Push notifications when prices cross your thresholds
- 🤖 **Trading Bots** — DCA (Dollar Cost Average) & Grid trading automation
- 🦊 **Wallet Connect** — MetaMask, WalletConnect, Rainbow, Phantom, and more

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 + TypeScript |
| **Web3** | wagmi v2 + viem + RainbowKit |
| **Styling** | Tailwind CSS v4 + Framer Motion |
| **Charts** | TradingView Lightweight Charts |
| **DEX APIs** | 0x API, Jupiter API, 1inch API, Binance API |

## Getting Started

### Prerequisites

- Node.js 18+
- [WalletConnect Project ID](https://cloud.walletconnect.com)
- [Alchemy API Key](https://www.alchemy.com)

### Installation

```bash
git clone https://github.com/Sebuska29190/voidswap.git
cd voidswap
cp .env.local.example .env.local
# Edit .env.local with your API keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key
NEXT_PUBLIC_1INCH_KEY=your_1inch_key
```

## Architecture

```
src/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Portfolio overview
│   ├── swap/         # Swap widget page
│   ├── portfolio/    # Full portfolio tracker
│   ├── charts/       # TradingView charts + TA
│   ├── arbitrage/    # Cross-DEX scanner
│   ├── alerts/       # Price alert manager
│   └── bots/         # DCA/Grid bot dashboard
├── components/
│   ├── swap/         # Core swap widget
│   └── layout/       # Navbar, providers
├── lib/              # API clients, price fetchers
└── types/            # TypeScript definitions
```

## Supported Chains

- Ethereum (mainnet)
- Base
- Polygon
- Arbitrum
- Optimism
- Solana (via Jupiter)

## License

MIT — Built by [Buska](https://github.com/Sebuska29190)
