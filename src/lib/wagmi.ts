"use client";

import { http, createStorage, cookieStorage } from "wagmi";
import {
  mainnet,
  base,
  polygon,
  arbitrum,
  optimism,
} from "wagmi/chains";
import { darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = "YOUR_WALLETCONNECT_PROJECT_ID"; // Replace with your WalletConnect Project ID

export const wagmiConfig = getDefaultConfig({
  appName: "VoidSwap",
  projectId,
  chains: [mainnet, base, polygon, arbitrum, optimism],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    ),
    [base.id]: http(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    ),
    [optimism.id]: http(
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    ),
  },
});

export const rainbowTheme = darkTheme({
  accentColor: "#7c3aed",
  accentColorForeground: "white",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});
