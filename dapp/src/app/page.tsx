/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import image1 from "@/app/images/pengo-1.png"
import image2 from "@/app/images/pengo-2.png"
import image3 from "@/app/images/pengo-3.png"
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
// import abiJson from "../constants/erc721abi.json"
// import { erc721goerli } from "../constants/erc721goerli"
import {
  useLoginWithAbstract,
  useWriteContractSponsored,
} from "@abstract-foundation/agw-react";
import { useAccount, useWaitForTransactionReceipt, useContractWrite, useReadContract } from "wagmi";
import { getGeneralPaymasterInput } from "viem/zksync";
import { parseAbi } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export default function Home() {
  // const [maxPerWallet, setMintCount] = useState(0);
  // const { addToast } = useToasts()
  // const { address } = useAccount()
  const [price, setprice] = useState(0)
  const [value, setvalue] = useState(0)
  const [mintCount, setMintCount] = useState(0);
  const [mintNum, setmintNum] = useState(0)
  const [mintCountdata, setmintCountdata] = useState(0)
  const [mintLimit, setMintLimit] = useState(0)
  const [mintCostAmount, setMintCostAmount] = useState("0")

  const { logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const { writeContractSponsored, data: transactionHash } =
    useWriteContractSponsored();
  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });


  return (
    // 4b5ae4 9252ff 109753
    <div className="relative min-h-screen bg-[#9252ff] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#b152ff] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#b152ff] to-transparent opacity-10 blur-3xl"></div>

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-24 sm:pb-8 px-4 sm:px-8">
        {/* Hero Section with Stacked Image Slideshow */}
        <div className="relative h-[70vh] mb-16">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Stacked Images with Animation */}
            <div className="relative w-full max-w-4xl h-full">
              <div className="absolute inset-0 animate-slide-up-fade animation-delay-200">
                <Image
                  src={image1}
                  quality={50} // {number 1-100}
                  priority={true} // {false} | {true}
                  placeholder='empty' // "empty" | "blur" | "data:image/..."
                  alt="NFT Artwork 1"
                  fill
                  className="object-cover rounded-2xl shadow-2xl transform rotate-[3deg]"
                />
              </div>
              <div className="absolute inset-0 animate-slide-up-fade animation-delay-400">
                <Image
                  src={image2}
                  quality={50} // {number 1-100}
                  priority={true} // {false} | {true} 
                  placeholder='empty' // "empty" | "blur" | "data:image/..."
                  alt="NFT Artwork 2"
                  fill
                  className="object-cover rounded-2xl shadow-2xl transform rotate-[2deg]"
                />
              </div>
              <div className="absolute inset-0 animate-slide-up-fade animation-delay-200">
                <Image
                  src={image3}
                  quality={50} // {number 1-100}
                  priority={true} // {false} | {true}
                  placeholder='empty' // "empty" | "blur" | "data:image/..."
                  alt="NFT Artwork 3"
                  fill
                  className="object-cover rounded-2xl shadow-2xl transform rotate-[-2.5deg]"
                />
              </div>
            </div>
          </div>

          {/* Hero Text Overlay */}
          {/* Hero Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 sm:bg-white/50 backdrop-blur-sm rounded-3xl">
            <div className="text-center">
              <h3 className="text-2xl sm:text-6xl font-bold text-black px-12">
                The First
              </h3>
              <h1 className="text-md sm:text-5xl font-bold text-black px-12 sm:py-3">
                Fully Customizable On-Chain NFT
              </h1>
              <h4 className="text-md sm:text-5xl font-bold text-black mb-12 px-12">
                For Unique Digital Creations
              </h4>
              <p className="text-sm sm:font-normal font-light sm:text-xl text-black/80 mb-8 max-w-2xl sm:mx-auto mx-2">
                Introducing Pengo, the first on-chain customizable NFT that allows users to create and modify their digital Penguin avatars. Draw, customize, and trade unique assets directly on the blockchain for a truly personalized NFT experience.
              </p>
              <div className="flex gap-4 justify-center">
                <a href="/studio" target="_blank" className="text-sm sm:text-md px-8 py-3 bg-[#c9ff33] text-black font-bold rounded-full hover:bg-[#b3e52d] transition-all button-press-3d inline-block">
                  {/* Explore */}
                  Studio
                </a>
                <button className="text-sm sm:text-md px-8 py-3 bg-black/70 text-white font-bold rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm">
                  Accessory Market
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all">
            <h3 className="text-2xl font-bold mb-4">On-Chain Customization</h3>
            <p className="text-white/80">Draw and add accessories to your Pengo NFT directly through our blockchain-integrated canvas.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all">
            <h3 className="text-2xl font-bold mb-4">Dynamic NFT Assets</h3>
            <p className="text-white/80">Modify and upgrade your NFT over time with new traits, making each Pengo uniquely yours.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all">
            <h3 className="text-2xl font-bold mb-4">Asset Marketplace</h3>
            <p className="text-white/80">Buy, sell, and trade custom assets with other users, all securely recorded on-chain.</p>
          </div>
        </div>
      </main>


      {/* Mobile Bottom Navigation */}
      <Footer />
    </div>
  );
}
