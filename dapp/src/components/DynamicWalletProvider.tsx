"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  walletConnectWallet,
  // metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';
// import { abstractWallet } from "@abstract-foundation/agw-react/connectors";
import { monadTestnet, sepolia  } from "wagmi/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";

const connectors = connectorsForWallets(
  [
    {
    //   groupName: "Abstract",
    //   wallets: [
    //     abstractWallet,
    //     // metaMaskWallet,
    //     // walletConnectWallet
    //   ]
    // },
    // {
      groupName: "Others",
      wallets: [
        walletConnectWallet
      ]
    },
  ],
  {
    appName: "Rainbowkit Test",
    projectId: "2942d557e618dbdf5a0d818adb0b190e",
    appDescription: "",
    appIcon: "",
    appUrl: "",
  }
);

export const config = createConfig({
  connectors,
  chains: [sepolia,monadTestnet ],
  transports: {
    [sepolia .id]: http(),
    [monadTestnet .id]: http(),
  },
  ssr: true,
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
