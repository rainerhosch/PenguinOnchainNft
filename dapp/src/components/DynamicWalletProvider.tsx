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
  monadTestnet, 
  sepolia 
} from "wagmi/chains";
import { 
  createConfig, 
  WagmiProvider 
} from "wagmi";

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
  chains: [monadTestnet, sepolia],
  transports: {
    [monadTestnet.id]: http(),
    // [sepolia.id]: http(),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/08vne2jndkLeMxbs8GdFi6jtZrDfgBmB'),
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
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
