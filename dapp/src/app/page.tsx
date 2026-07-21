"use client";

import Image from "next/image";
import Link from "next/link";
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
            <main className="relative pt-24 sm:pt-32 pb-24">
                {/* Hero Section */}
                <section className="px-4 sm:px-8 pb-20 sm:pb-32">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                            {/* Text Content */}
                            <div className="text-center lg:text-left order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-400 mb-6 animate-fade-in-up">
                                    <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
                                    Welcome to Pengo V2 Ecosystem
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
                                    Draw it. Trade it. <br/>
                                    <span className="gradient-text">Govern it forever.</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-neutral-400 mb-4 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                                    <span className="text-white font-medium">Penguin Onchain</span> is a revolutionary decentralized ecosystem. Mint on-chain SVGs, trade the deflationary <span className="text-accent-400">$PENGO</span> bonding curve, and govern Real-World Assets (RWA) via the Community Vault!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8 animate-fade-in-up animation-delay-300">
                                    <Link href="/mint" className="btn-primary text-base px-8 py-4">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Mint NFT
                                    </Link>
                                    <Link href="/bonding-curve" className="btn-secondary text-base px-8 py-4">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        Trade $PENGO
                                    </Link>
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

                {/* The Four Pillars of Pengo Ecosystem */}
                <section className="px-4 sm:px-8 py-20 relative border-y border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">The Four Pillars</h2>
                            <p className="text-neutral-400 max-w-2xl mx-auto">An interconnected ecosystem where NFTs, DeFi, and Governance meet Real-World Assets.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Pillar 1: Bonding Curve */}
                            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary-500/50 transition-colors">
                                    <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">$PENGO Bonding Curve</h3>
                                <p className="text-neutral-400 mb-6">A fully decentralized, fair-launch token with a target of 10 ETH. Buy and Sell anytime. A 3% deflationary sell tax ensures the target is reached even faster!</p>
                                <Link href="/bonding-curve" className="text-primary-400 font-medium inline-flex items-center group-hover:text-primary-300">
                                    Start Trading
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Pillar 2: RWA Vault */}
                            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">RWA Yield Vault</h3>
                                <p className="text-neutral-400 mb-6">Once the bonding curve hits 10 ETH, liquidity migrates to Uniswap. The LP tokens are locked in the Strategy Vault to earn yields and invest in Real World Assets.</p>
                                <Link href="/governance" className="text-blue-400 font-medium inline-flex items-center group-hover:text-blue-300">
                                    View Vault
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Pillar 3: DAO Governance */}
                            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                    <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">DAO Governance</h3>
                                <p className="text-neutral-400 mb-6">Burn your NFTs to generate &quot;Share Power&quot;. Use this power to vote on DAO proposals, such as purchasing RWA assets or distributing yields.</p>
                                <Link href="/governance" className="text-purple-400 font-medium inline-flex items-center group-hover:text-purple-300">
                                    Join the DAO
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Pillar 4: Accessory Marketplace */}
                            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-amber-500/50 transition-colors">
                                    <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">On-Chain Marketplace</h3>
                                <p className="text-neutral-400 mb-6">Customize your Penguin with 100% on-chain SVG accessories. Buy and equip hats, eyewear, and gear using your tokens.</p>
                                <Link href="/marketplace" className="text-amber-400 font-medium inline-flex items-center group-hover:text-amber-300">
                                    Explore Accessories
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Architecture Diagram */}
                <section className="px-4 sm:px-8 py-20 relative">
                    <div className="max-w-5xl mx-auto">
                        <div className="glass-card p-8 lg:p-12 text-center">
                            <h2 className="text-3xl font-bold text-white mb-8">Ecosystem Flow</h2>
                            
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <div className="p-6 rounded-2xl bg-neutral-800/80 border border-white/10 shadow-xl max-w-[200px] w-full">
                                    <div className="text-xl font-bold text-white mb-2">Buy / Sell</div>
                                    <div className="text-sm text-neutral-400">Trade on Bonding Curve</div>
                                </div>

                                <svg className="w-8 h-8 md:w-12 md:h-12 text-primary-500 animate-pulse rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>

                                <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-600/20 to-accent-500/20 border border-primary-500/30 shadow-xl max-w-[200px] w-full">
                                    <div className="text-xl font-bold text-white mb-2">Hit 10 ETH</div>
                                    <div className="text-sm text-neutral-400">Liquidity migrated to Uniswap</div>
                                </div>

                                <svg className="w-8 h-8 md:w-12 md:h-12 text-blue-500 animate-pulse rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>

                                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 shadow-xl max-w-[200px] w-full">
                                    <div className="text-xl font-bold text-white mb-2">DAO Vault</div>
                                    <div className="text-sm text-neutral-400">LP locked. Burn NFT to vote!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
