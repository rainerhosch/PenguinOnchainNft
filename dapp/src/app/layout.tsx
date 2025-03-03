import type { Metadata } from "next";
import localFont from "next/font/local";
import NextWalletProvider from "../components/NextWalletProvider"

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
  title: "Penguin Onchain",
  description: "Penguin Onchain is more than just an NFT—it's a decentralized, interactive digital identity. Whether you're an artist, collector, or Web3 enthusiast, this project opens new possibilities for self-expression, community-driven rarity, and sustainable blockchain innovation.",
  openGraph: {
    title: "Penguin Onchain",
    description: "Penguin Onchain is a decentralized, interactive NFT identity.",
    url: "https://penguinonchain.top",
    type: "website",
    images: [
      {
        url: "/OG-Image1000.png",
        width: 1200,
        height: 630,
        alt: "Penguin Onchain NFT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@onchainpengo", 
    title: "Penguin Onchain",
    description: "A decentralized, interactive NFT identity.",
    images: ["/OG-Image1000.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${avenueMono.variable} ${roobert.variable} antialiased`}
      >
        <NextWalletProvider>
          {children}
        </NextWalletProvider>
      </body>
    </html>
  );
}
