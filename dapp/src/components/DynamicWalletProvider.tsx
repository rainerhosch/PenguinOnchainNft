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
// import { abstractWallet } from "@abstract-foundation/agw-react/connectors";
import { monadTestnet, sepolia } from "wagmi/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";

if (typeof window !== "undefined") {
  indexedDB.deleteDatabase("walletconnect");
}
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
    projectId: "d841c21dbf51af2d65b5c2cfc5232ee6",
    appDescription: "",
    appIcon: "",
    appUrl: "",
  }
);
export const config = createConfig({
  connectors,
  chains: [sepolia, monadTestnet],
  transports: {
    [sepolia.id]: http(),
    [monadTestnet.id]: http(),
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
