import type { Metadata } from "next";
import localFont from "next/font/local";
import NextWalletProvider from "../components/NextWalletProvider"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

// Default Fonts from Next.js
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Abstract Fonts
const avenueMono = localFont({
  src: "./fonts/Avenue Mono.ttf",
  variable: "--font-avenue-mono",
  weight: "100, 900",
});
const roobert = localFont({
  src: [
    { path: "./fonts/Roobert-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Roobert-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Roobert-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Roobert-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Roobert-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Roobert-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-roobert",
});

export const metadata: Metadata = {
  title: "Penguin Onchain | Draw it. Own it. Live it forever.",
  description:
    "Fully on-chain. Fully yours. Mint a Pengo, customize pixel art on-chain, trade accessories with zero fees, and hold a living digital identity with real ecosystem upside.",
  metadataBase: new URL("https://penguinonchain.top"),
  openGraph: {
    title: "Penguin Onchain — Fully on-chain. Fully yours.",
    description:
      "Draw it. Own it. Live it forever. Customizable on-chain Penguins, accessory marketplace, and community-powered value.",
    url: "https://penguinonchain.top",
    type: "website",
    images: [
      {
        url: "/OG-Studio.png",
        width: 1200,
        height: 630,
        alt: "Penguin Onchain NFT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@onchainpengo",
    title: "Penguin Onchain — Fully on-chain. Fully yours.",
    description: "Draw it. Own it. Live it forever. On-chain customizable Pengo NFTs.",
    images: ["/OG-Studio.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${avenueMono.variable} ${roobert.variable} antialiased`}
      >
        <NextWalletProvider>
          {children}
          <Analytics />
        </NextWalletProvider>
      </body>
    </html>
  );
}
