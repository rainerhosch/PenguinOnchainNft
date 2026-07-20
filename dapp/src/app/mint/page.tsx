'use client'
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';
import AppNavbar from "../../components/AppNavBar";
import PengosMintComponent, { MintData } from "../../components/mint/PengosMintComponeV2"

const traits = [
    { category: "Body Color", name: "Zombie", percentage: "1.5%", rarity: "legendary" },
    { category: "Body Color", name: "Arctic", percentage: "3.5%", rarity: "epic" },
    { category: "Body Color", name: "Fire", percentage: "7.5%", rarity: "rare" },
    { category: "Body Color", name: "Female", percentage: "43.75%", rarity: "common" },
    { category: "Body Color", name: "Male", percentage: "43.75%", rarity: "common" },
    { category: "Top Eye Color", name: "Zombie Eye", percentage: "1.5%", rarity: "legendary" },
    { category: "Top Eye Color", name: "Ancestors", percentage: "5%", rarity: "epic" },
    { category: "Top Eye Color", name: "Sleepy", percentage: "10%", rarity: "rare" },
    { category: "Top Eye Color", name: "Purple Shade", percentage: "30%", rarity: "uncommon" },
    { category: "Top Eye Color", name: "Standard", percentage: "55%", rarity: "common" },
];

const rarityColors: { [key: string]: string } = {
    legendary: "text-yellow-400",
    epic: "text-primary-400",
    rare: "text-accent-400",
    uncommon: "text-green-400",
    common: "text-neutral-400"
};

const rarityBadgeColors: { [key: string]: string } = {
    legendary: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    epic: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    rare: "bg-accent-500/20 text-accent-400 border-accent-500/30",
    uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
    common: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
};

// Format large numbers with commas
function formatNumber(num: string): string {
    const n = parseInt(num, 10);
    if (isNaN(n)) return '...';
    return n.toLocaleString();
}

export default function MintPage() {
    const [mintData, setMintData] = useState<MintData | null>(null);

    const handleDataLoad = useCallback((data: MintData) => {
        setMintData(data);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-mesh">
            {/* Grid Pattern */}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            {/* Glow Effects */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed top-1/2 right-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />

            <AppNavbar />

            <Toaster
                position="bottom-right"
                reverseOrder={true}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(24, 24, 27, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                    },
                }}
            />

            <main className="relative pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Mint Your <span className="gradient-text">Pengo</span>
                        </h1>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Join the Pengo community by minting your unique on-chain NFT. Each Pengo is randomly generated with various traits and rarities.
                        </p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* Mint Card */}
                        <div className="lg:sticky lg:top-24">
                            <PengosMintComponent onDataLoad={handleDataLoad} />
                        </div>

                        {/* Traits Section */}
                        <div className="space-y-6">
                            {/* Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-bold gradient-text">
                                        {mintData ? formatNumber(mintData.totalMinted) + '/' + formatNumber(mintData.maxSupply) : '...'}
                                    </div>
                                    <div className="text-sm text-neutral-400">Total Supply</div>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <div className="text-2xl font-bold gradient-text">
                                        {mintData ? mintData.maxMintPerWallet : '...'}
                                    </div>
                                    <div className="text-sm text-neutral-400">Max per Wallet</div>
                                </div>
                            </div>

                            {/* Traits Table */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    DNA Traits Distribution
                                </h2>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {traits.map((trait, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${trait.rarity === 'legendary' ? 'bg-yellow-400' : trait.rarity === 'epic' ? 'bg-primary-400' : trait.rarity === 'rare' ? 'bg-accent-400' : trait.rarity === 'uncommon' ? 'bg-green-400' : 'bg-neutral-400'}`} />
                                                <div>
                                                    <div className={`font-medium ${rarityColors[trait.rarity]}`}>{trait.name}</div>
                                                    <div className="text-xs text-neutral-500">{trait.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${rarityBadgeColors[trait.rarity]}`}>
                                                    {trait.rarity}
                                                </span>
                                                <span className="text-sm font-mono text-neutral-300">{trait.percentage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rarity Legend */}
                            <div className="glass-card p-4">
                                <h3 className="text-sm font-semibold text-neutral-400 mb-3">Rarity Tiers</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { name: "Legendary", color: "bg-yellow-400" },
                                        { name: "Epic", color: "bg-primary-400" },
                                        { name: "Rare", color: "bg-accent-400" },
                                        { name: "Uncommon", color: "bg-green-400" },
                                        { name: "Common", color: "bg-neutral-400" },
                                    ].map((rarity) => (
                                        <div key={rarity.name} className="flex items-center gap-2 text-sm text-neutral-300">
                                            <div className={`w-3 h-3 rounded-full ${rarity.color}`} />
                                            {rarity.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-16 grid md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">100% On-Chain</h3>
                            <p className="text-sm text-neutral-400">Your Pengo lives entirely on the blockchain. No external dependencies.</p>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Fully Customizable</h3>
                            <p className="text-sm text-neutral-400">Add accessories and personalize your Pengo using our Studio.</p>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Active Community</h3>
                            <p className="text-sm text-neutral-400">Join thousands of Pengo holders in our thriving ecosystem.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
};
