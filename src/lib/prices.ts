const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const BINANCE_BASE = "https://api.binance.com/api/v3";

export interface PriceQuote {
  price: number;
  exchange: string;
  liquidity?: number;
}

export async function getTokenPrice(
  address: string,
  chainId: number
): Promise<number> {
  const platform = chainToPlatform(chainId);
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/simple/token_price/${platform}?contract_addresses=${address}&vs_currencies=usd`
    );
    const data = await res.json();
    return data[address.toLowerCase()]?.usd ?? 0;
  } catch {
    return 0;
  }
}

export async function getBinancePrice(symbol: string): Promise<PriceQuote> {
  try {
    const res = await fetch(`${BINANCE_BASE}/ticker/price?symbol=${symbol}USDT`);
    const data = await res.json();
    return { price: parseFloat(data.price), exchange: "Binance" };
  } catch {
    return { price: 0, exchange: "Binance" };
  }
}

export async function getUniswapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  chainId: number
): Promise<{ toAmount: string; priceImpact: number }> {
  // Uses 0x API or Uniswap Universal Router
  const zeroXApi = {
    1: "ethereum",
    8453: "base",
    137: "polygon",
    42161: "arbitrum",
    10: "optimism",
  }[chainId];
  try {
    const res = await fetch(
      `https://api.0x.org/swap/permit2/quote?sellToken=${fromToken}&buyToken=${toToken}&sellAmount=${amount}&chainId=${chainId}`
    );
    const data = await res.json();
    return {
      toAmount: data.buyAmount,
      priceImpact: data.priceImpact ?? 0,
    };
  } catch {
    return { toAmount: "0", priceImpact: 0 };
  }
}

export async function getJupiterQuote(
  fromMint: string,
  toMint: string,
  amount: string
): Promise<{ toAmount: string; priceImpact: number }> {
  try {
    const res = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}&slippageBps=50`
    );
    const data = await res.json();
    return {
      toAmount: data.outAmount,
      priceImpact: data.priceImpactPct ?? 0,
    };
  } catch {
    return { toAmount: "0", priceImpact: 0 };
  }
}

export async function get1inchQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  chainId: number
): Promise<{ toAmount: string; priceImpact: number }> {
  try {
    const res = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/quote?src=${fromToken}&dst=${toToken}&amount=${amount}`,
      { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_KEY}` } }
    );
    const data = await res.json();
    return {
      toAmount: data.toAmount,
      priceImpact: data.estimatedPriceImpact ?? 0,
    };
  } catch {
    return { toAmount: "0", priceImpact: 0 };
  }
}

function chainToPlatform(chainId: number): string {
  const map: Record<number, string> = {
    1: "ethereum",
    8453: "base",
    137: "polygon-pos",
    42161: "arbitrum-one",
    10: "optimistic-ethereum",
  };
  return map[chainId] ?? "ethereum";
}

export const TOKEN_LISTS: Record<number, TokenInfo[]> = {
  1: [
    { symbol: "ETH", name: "Ether", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, chainId: 1 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, chainId: 1 },
    { symbol: "USDT", name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, chainId: 1 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, chainId: 1 },
    { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, chainId: 1 },
    { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, chainId: 1 },
    { symbol: "AAVE", name: "Aave", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18, chainId: 1 },
  ],
  8453: [
    { symbol: "ETH", name: "Ether", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, chainId: 8453 },
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, chainId: 8453 },
    { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, chainId: 8453 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, chainId: 8453 },
  ],
  137: [
    { symbol: "MATIC", name: "Polygon", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, chainId: 137 },
    { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, chainId: 137 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, chainId: 137 },
    { symbol: "DAI", name: "Dai", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, chainId: 137 },
    { symbol: "LINK", name: "Chainlink", address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", decimals: 18, chainId: 137 },
  ],
  42161: [
    { symbol: "ETH", name: "Ether", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, chainId: 42161 },
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, chainId: 42161 },
    { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, chainId: 42161 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8, chainId: 42161 },
  ],
};

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}
