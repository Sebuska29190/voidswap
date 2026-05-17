export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  price: string;
  priceImpact: number;
  route: SwapRoute[];
  gas: string;
  estimatedGasUSD: string;
  exchange: string;
}

export interface SwapRoute {
  exchange: string;
  percent: number;
  from: string;
  to: string;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenA: Token;
  tokenB: Token;
  buyExchange: string;
  sellExchange: string;
  spreadPercent: number;
  estimatedProfitUSD: number;
  gasCostUSD: number;
  netProfitUSD: number;
  timestamp: number;
  volume24h: number;
  liquidityScore: number;
}

export interface PortfolioPosition {
  token: Token;
  balance: string;
  balanceUSD: number;
  avgCostUSD: number;
  pnlUSD: number;
  pnlPercent: number;
  shareOfPortfolio: number;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceAlert {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  chainId: number;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: number;
}

export interface BotConfig {
  id: string;
  type: "dca" | "grid";
  status: "running" | "paused" | "stopped";
  tokenA: Token;
  tokenB: Token;
  chainId: number;
  config: DCAConfig | GridConfig;
  createdAt: number;
  totalInvested: number;
  currentValue: number;
  pnl: number;
}

export interface DCAConfig {
  amount: number;
  interval: "1h" | "4h" | "12h" | "1d" | "1w";
  nextExecution: number;
  totalCycles: number;
  completedCycles: number;
}

export interface GridConfig {
  upperPrice: number;
  lowerPrice: number;
  gridCount: number;
  investmentPerGrid: number;
  totalInvestment: number;
}
