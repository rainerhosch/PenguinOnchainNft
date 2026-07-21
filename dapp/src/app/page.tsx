"use client";

import Image from "next/image";
import image1 from "@/app/images/pengo-1.png";
import image2 from "@/app/images/pengo-2.png";
import image3 from "@/app/images/pengo-3.png";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-mesh overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-400 mb-6 animate-fade-in-up">
                  <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
                  Fully on-chain · Fully yours
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
                  Draw it. Own it.{" "}
                  <span className="gradient-text">Live it forever</span>
                </h1>

                <p className="text-lg sm:text-xl text-neutral-400 mb-4 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                  <span className="text-white font-medium">Penguin Onchain</span> is a living digital identity and a fully decentralized ecosystem.
                  Mint NFTs, trade on the <span className="text-accent-400">$PENGO</span> token bonding curve, and use your NFT's Voting Power to govern real-world asset (RWA) investments in the Community Vault.
                </p>
                <p className="text-base text-neutral-500 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                  Draw it. Trade it. Govern it. Earn yields based on your on-chain Net Worth.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
                  <a href="/mint" className="btn-primary text-base px-8 py-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Mint Your Pengo
                  </a>
                  <a href="/studio" className="btn-secondary text-base px-8 py-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Open Studio
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative order-1 lg:order-2 animate-fade-in-up">
                <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-accent-500/20 to-primary-600/30 rounded-3xl blur-2xl animate-pulse-glow" />

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
                { value: "100%", label: "Art & metadata live on-chain—yours forever" },
                { value: "25 ETH", label: "Target Liquidity on the $PENGO Bonding Curve" },
                { value: "RWA", label: "Yields governed by DAO Voting Power" },
                { value: "∞", label: "Ways to customize your on-chain identity" },
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
                Why collectors &amp; creators choose{" "}
                <span className="gradient-text">Pengo</span>
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Most NFTs freeze the day they mint. Pengo keeps evolving—with art, traits, and
                value that stay on the blockchain where you control them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Create on-chain, not on IPFS hopes</h3>
                <p className="text-neutral-400">
                  Sketch accessories in the Studio. Commit pixels to the chain. Your look is not
                  hosted on a server that can go dark tomorrow.
                </p>
              </div>

              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Rarity you build yourself</h3>
                <p className="text-neutral-400">
                  Traits grow with every accessory you add. Community-driven rarity—not a
                  fixed trait table decided before you arrived.
                </p>
              </div>

              <div className="feature-card group">
                <div className="feature-icon">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">A creator economy that pays</h3>
                <p className="text-neutral-400">
                  List accessories, buy looks you love, trade peer-to-peer. Zero marketplace fees—
                  more value stays with artists and holders.
                </p>
              </div>

              <div className="feature-card group">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #acff00, #8acc00)' }}>
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Governed RWA Vault</h3>
                <p className="text-neutral-400">
                  Holders use their NFT Share Power to vote on tokenized Real-World Assets (AAPL, Google, Gold). Yields are distributed directly to your wallet based on your Net Worth.
                </p>
                <a href="/our-programs" className="btn-secondary inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 mt-3 transition-colors">
                  See the economics
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-8 py-20 sm:py-32 bg-gradient-to-b from-transparent via-primary-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                From zero to <span className="gradient-text">icon</span> in three moves
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                No art degree required. No waiting on a team to &quot;reveal.&quot; You mint, you style, you flex.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect & mint",
                  description: "Link your wallet and mint a Pengo from the limited 20K supply. Your base identity lands on-chain in seconds."
                },
                {
                  step: "02",
                  title: "Style in the Studio",
                  description: "Draw custom accessories pixel-by-pixel or equip marketplace pieces. Every change upgrades how your NFT is rendered."
                },
                {
                  step: "03",
                  title: "Trade, earn, govern",
                  description: "List looks, grow traits, and join programs that reward creators, ambassadors, and holders who build with us."
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
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-500/50 to-transparent" />
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 pointer-events-none" />

              <p className="text-sm font-medium text-primary-400 mb-3 relative tracking-wide uppercase">
                Fully on-chain · Fully yours
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative">
                Don&apos;t collect a screenshot.{" "}
                <span className="gradient-text">Own an identity</span>
              </h2>
              <p className="text-neutral-400 mb-8 max-w-xl mx-auto relative">
                Supply is capped. Creativity isn&apos;t. Mint while supply lasts, open the Studio,
                and leave a Pengo only you could have made.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <a href="/mint" className="btn-primary text-base px-8 py-4">
                  Mint now
                </a>
                <a href="/getting-started" className="btn-secondary text-base px-8 py-4">
                  Quick start guide
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
