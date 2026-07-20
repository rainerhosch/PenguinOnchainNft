"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  walletConnectWallet,
  coinbaseWallet,
  // zerionWallet, 
  // bitgetWallet, 
  // metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';
import {
  http
} from '@wagmi/core'
import {
  // monadTestnet, 
  sepolia
} from "wagmi/chains";
import {
  createConfig,
  WagmiProvider
} from "wagmi";
import { defineChain } from 'viem';

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
    public: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
});

if (typeof window !== "undefined") {
  indexedDB.deleteDatabase("walletconnect");
}

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const connectors = connectorsForWallets(
  [
    {
      groupName: "Others",
      wallets: [
        walletConnectWallet,
        coinbaseWallet,
        // zerionWallet, 
        // bitgetWallet, 
        // metaMaskWallet
      ]
    },
  ],
  {
    appName: "Rainbowkit Test",
    projectId: projectId || "ec1ad1e46b783592191fca2eb897e27d", // Ensure projectId is a string
    appDescription: "",
    appIcon: "",
    appUrl: "",
  }
);
export const config = createConfig({
  connectors,
  chains: [
    robinhoodChain,
    // sepolia
  ],
  transports: {
    [robinhoodChain.id]: http('https://robinhood-mainnet.g.alchemy.com/v2/08vne2jndkLeMxbs8GdFi6jtZrDfgBmB'),
    // [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/08vne2jndkLeMxbs8GdFi6jtZrDfgBmB'),
  },
  ssr: false,
});

export default function DynamicWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#acff00",
          accentColorForeground: "#000000",
          borderRadius: "medium",
          overlayBlur: "small",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
