"use client";

import Image from "next/image";
import image1 from "@/app/images/pengo-1.png";
import image2 from "@/app/images/pengo-2.png";
import image3 from "@/app/images/pengo-3.png";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { SiGitconnected } from "react-icons/si";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-mesh overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative pt-24 sm:pt-32">
        {/* Hero Section */}
        <section className="px-4 sm:px-8 pb-20 sm:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-400 mb-6 animate-fade-in-up">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  First Fully On-Chain NFT
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
                  Create Your{" "}
                  <span className="gradient-text">Unique Pengo</span>{" "}
                  NFT
                </h1>

                <p className="text-lg sm:text-xl text-neutral-400 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                  Introducing Pengo, the first on-chain customizable NFT. Draw, customize, and trade unique digital Penguin avatars directly on the blockchain.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
                  <a href="/studio" className="btn-primary text-base px-8 py-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Open Studio
                  </a>
                  <a href="/accessory-marketplace" className="btn-secondary text-base px-8 py-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Marketplace
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative order-1 lg:order-2 animate-fade-in-up">
                <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-pink-500/30 rounded-3xl blur-2xl animate-pulse-glow" />

                  {/* Image stack */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-4 animate-float" style={{ animationDelay: '0s' }}>
                      <Image
                        src={image1}
                        quality={80}
                        priority
                        placeholder="empty"
                        alt="Pengo NFT 1"
                        fill
                        className="object-contain rounded-2xl drop-shadow-2xl transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-4 animate-float" style={{ animationDelay: '2s' }}>
                      <Image
                        src={image2}
                        quality={80}
                        priority
                        placeholder="empty"
                        alt="Pengo NFT 2"
                        fill
                        className="object-contain rounded-2xl drop-shadow-2xl transform rotate-[4deg] hover:rotate-0 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-4 animate-float" style={{ animationDelay: '4s' }}>
                      <Image
                        src={image3}
                        quality={80}
                        priority
                        placeholder="empty"
                        alt="Pengo NFT 3"
                        fill
                        className="object-contain rounded-2xl drop-shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-8 py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "100%", label: "On-Chain Art, Your Assets is Yours." },
                { value: "20K", label: "Only 20,000 NFTs will be minted" },
                { value: "0", label: "No Trading Fees, On Accessory Marketplace" },
                { value: "24/7", label: "Available 24/7" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-neutral-400 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-8 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose <span className="gradient-text">Pengo</span>?
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Experience the future of NFT customization with our innovative on-chain technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">On-Chain Customization</h3>
                <p className="text-neutral-400">
                  Draw and add accessories to your Pengo NFT directly through our blockchain-integrated canvas. Every modification is permanently stored.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Dynamic NFT Assets</h3>
                <p className="text-neutral-400">
                  Modify and upgrade your NFT over time with new traits, making each Pengo uniquely yours. Your NFT evolves with you.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Asset Marketplace</h3>
                <p className="text-neutral-400">
                  Buy, sell, and trade custom assets with other users. All transactions are securely recorded on-chain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-8 py-20 sm:py-32 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Get started with Pengo in just a few simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description: "Connect your Web3 wallet to access the Pengo ecosystem"
                },
                {
                  step: "02",
                  title: "Create or Collect",
                  description: "Mint your own Pengo or browse the marketplace for unique designs"
                },
                {
                  step: "03",
                  title: "Customize & Trade",
                  description: "Add accessories, customize your Pengo, and trade on the marketplace"
                }
              ].map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass text-2xl font-bold gradient-text mb-6 group-hover:glow-sm transition-all duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400">{item.description}</p>

                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative">
                Ready to Create Your <span className="gradient-text">Pengo</span>?
              </h2>
              <p className="text-neutral-400 mb-8 max-w-xl mx-auto relative">
                Join the community of creators and collectors. Start designing your unique on-chain NFT today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <a href="/studio" className="btn-primary text-base px-8 py-4">
                  Start Creating
                </a>
                <a href="/getting-started" className="btn-secondary text-base px-8 py-4">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
