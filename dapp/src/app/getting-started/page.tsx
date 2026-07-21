'use client'
import React, { useState } from 'react';
import Link from 'next/link';

const sections = [
    {
        id: "connect-wallet",
        title: "Connect Your Wallet",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        content: (
            <div className="space-y-4">
                <p>Your Pengo journey starts with one click. Connect a modern wallet and step into a world where every pixel you add can live forever on-chain.</p>
                <div className="glass-card p-6 space-y-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">1</span>
                        Supported Wallets
                    </h4>
                    <p className="text-neutral-400 pl-10">MetaMask, WalletConnect, Coinbase Wallet, and more. Install a wallet you trust, keep a little gas ready, and you are set.</p>
                </div>
                <div className="glass-card p-6 space-y-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">2</span>
                        Network Setup
                    </h4>
                    <p className="text-neutral-400 pl-10">When you connect, switch to the network shown on the Mint page. Your wallet will prompt you if the chain is not added yet—approve once and you are in.</p>
                </div>
            </div>
        )
    },
    {
        id: "mint-pengo",
        title: "Mint Your Pengo",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>Minting is your ticket in. Supply is capped at 20,000—every Pengo is a base identity you can style forever. Follow the steps and claim yours.</p>
                <div className="space-y-4">
                    {[
                        { step: "01", title: "Connect Your Wallet", desc: "Hit Connect Wallet, approve the request, and make sure you are on the correct network." },
                        { step: "02", title: "Prepare Your Funds", desc: "Keep enough native token for the mint price plus a small gas buffer. Check the Mint page for the live price." },
                        { step: "03", title: "Navigate to Mint Page", desc: "Open Mint, pick your quantity, and review the total—transparent pricing, no surprise reveal gimmicks." },
                        { step: "04", title: "Complete the Mint", desc: "Confirm Mint Pengo in your wallet. Seconds later, your fully on-chain identity is yours." },
                        { step: "05", title: "Start Customizing", desc: "Then open Studio: draw accessories, equip marketplace pieces, and start building rarity only you control." }
                    ].map((item, index) => (
                        <div key={index} className="glass-card p-5 flex gap-4 group hover:bg-white/10 transition-all">
                            <span className="text-2xl font-bold gradient-text">{item.step}</span>
                            <div>
                                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                                <p className="text-neutral-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: "customize-pengo",
        title: "Customize Your Pengo",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>This is the product. Fully on-chain customization means your edits are not a skin on a website—they rewrite how your NFT is rendered forever.</p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white">Draw Your Own</h4>
                        <p className="text-neutral-400 text-sm">Pixel-draw original accessories in Studio. Ship looks no generative pack ever planned.</p>
                    </div>

                    <div className="glass-card p-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white">Buy from Marketplace</h4>
                        <p className="text-neutral-400 text-sm">Browse the marketplace for community-made pieces—equip in one click, trade with zero marketplace fees.</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-accent-500">
                    <h4 className="font-semibold text-white mb-2">💡 Pro Tip: Trait Accumulation</h4>
                    <p className="text-neutral-400 text-sm">Accessories can unlock special traits as value stacks. Build a net-worth story on-chain—and a look nobody can screenshot-steal as the source of truth.</p>
                </div>
            </div>
        )
    },
    {
        id: "accessory-marketplace",
        title: "Accessory Marketplace",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>A zero-fee accessory marketplace where creators get paid and collectors upgrade identity—peer-to-peer, transparent, fully on-chain.</p>

                <div className="grid gap-4">
                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-3">🎨 Discover Unique Creations</h4>
                        <p className="text-neutral-400">Hunt rare fits and one-of-one drip from real artists. Every piece can change how your Pengo is rendered on-chain.</p>
                    </div>

                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-3">💰 Trade with Confidence</h4>
                        <p className="text-neutral-400">List, buy, and settle on-chain. No marketplace cut means more upside for the people who actually create and collect.</p>
                    </div>

                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-3">🤝 Join the Creator Economy</h4>
                        <p className="text-neutral-400">Artists: mint culture into the economy. Sell accessories, earn from demand, and get discovered by every wallet that opens Studio.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <a href="/accessory-marketplace" className="btn-primary">
                        Browse Marketplace
                    </a>
                    <a href="/studio" className="btn-secondary">
                        Create Accessories
                    </a>
                </div>
            </div>
        )
    },
    {
        id: "ecosystem-and-governance",
        title: "Trade & Govern ($PENGO)",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>Penguin Onchain is more than just art. The ecosystem runs on $PENGO, with real economic backing and DAO-governed yields.</p>
                
                <div className="space-y-4">
                    <div className="glass-card p-6 border-l-4 border-primary-500">
                        <h4 className="font-semibold text-white mb-2">1. The Bonding Curve</h4>
                        <p className="text-neutral-400 text-sm">
                            Buy and sell $PENGO on our native bonding curve. 
                            When the curve hits the 25 ETH target liquidity, the pool automatically migrates to a DEX (like Uniswap) to secure a permanent market.
                        </p>
                        <a href="/bonding-curve" className="text-primary-400 text-sm hover:underline mt-2 inline-block">Trade on the Curve →</a>
                    </div>
                    
                    <div className="glass-card p-6 border-l-4 border-accent-500">
                        <h4 className="font-semibold text-white mb-2">2. DAO & RWA Vault</h4>
                        <p className="text-neutral-400 text-sm">
                            The community vault holds funds used to invest in Real-World Assets (RWA) like Apple or Google stock tokens. 
                            If you own a Pengo NFT, you have Voting Power (Share Power) to propose and vote on what the vault buys.
                        </p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-green-500">
                        <h4 className="font-semibold text-white mb-2">3. Earn Yields</h4>
                        <p className="text-neutral-400 text-sm">
                            Profits generated by the RWA Vault are distributed back to NFT holders. 
                            Your slice of the yield is determined by your NFT's Net Worth (how many accessories you've equipped).
                        </p>
                        <a href="/governance" className="text-green-400 text-sm hover:underline mt-2 inline-block">Enter Governance →</a>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "join-community",
        title: "Join the Community",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>Penguin Onchain is a scene: pixel artists, collectors, and builders shipping a new standard for digital identity. Come for the Pengo—stay for the people.</p>

                <div className="grid md:grid-cols-2 gap-4">
                    <a href="https://discord.gg/penguinonchain" target="_blank" className="glass-card p-6 group hover:bg-white/10 transition-all block">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 flex items-center justify-center group-hover:bg-[#5865F2]/30 transition-colors">
                                <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Discord</h4>
                                <p className="text-neutral-400 text-sm">Join the conversation</p>
                            </div>
                        </div>
                        <p className="text-neutral-400 text-sm">Ship ideas, get Studio help, catch drops, and meet the people writing the next chapter of on-chain art.</p>
                    </a>

                    <a href="https://x.com/onchainpengo" target="_blank" className="glass-card p-6 group hover:bg-white/10 transition-all block">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Twitter / X</h4>
                                <p className="text-neutral-400 text-sm">Follow for updates</p>
                            </div>
                        </div>
                        <p className="text-neutral-400 text-sm">Launches, Studio teases, holder calls, and culture—follow so you never miss a mint window.</p>
                    </a>
                </div>
            </div>
        )
    },
    {
        id: "need-help",
        title: "Need Help?",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        content: (
            <div className="space-y-6">
                <p>Stuck on mint, Studio, or network setup? We would rather you mint confidently than guess. Support is one click away.</p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-3">📚 FAQ</h4>
                        <p className="text-neutral-400 text-sm mb-4">Quick answers on minting, networks, Studio, and marketplace flows.</p>
                        <a href="#" className="text-primary-400 hover:text-primary-300 text-sm font-medium">View FAQ →</a>
                    </div>

                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-3">💬 Support Team</h4>
                        <p className="text-neutral-400 text-sm mb-4">Still blocked? Ping support on Discord—real humans who ship this product.</p>
                        <a href="https://discord.gg/penguinonchain" target="_blank" className="text-primary-400 hover:text-primary-300 text-sm font-medium">Contact Support →</a>
                    </div>
                </div>
            </div>
        )
    }
];

const GettingStartedPage = () => {
    const [activeSection, setActiveSection] = useState(sections[0].id);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-mesh">
            {/* Grid Pattern */}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            {/* Glow Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Getting Started</h1>
                                <p className="text-sm text-neutral-400 hidden sm:block">Draw it. Own it. Live it forever — start here</p>
                            </div>
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg glass text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex max-w-7xl mx-auto">
                {/* Sidebar */}
                <aside className={`fixed md:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-72 glass-dark border-r border-white/5 p-6 transition-transform duration-300 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <nav className="space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeSection === section.id
                                        ? 'bg-primary-500/20 text-white border border-primary-500/30'
                                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className={activeSection === section.id ? 'text-primary-400' : ''}>
                                    {section.icon}
                                </span>
                                <span className="text-sm font-medium">{section.title}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Quick Links */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Quick Actions</p>
                        <div className="space-y-2">
                            <a href="/studio" className="btn-primary w-full text-sm py-2.5">
                                Open Studio
                            </a>
                            <a href="/accessory-marketplace" className="btn-secondary w-full text-sm py-2.5">
                                Marketplace
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10 md:pl-8">
                    <div className="max-w-3xl">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-primary-400">
                                    {sections.find(s => s.id === activeSection)?.icon}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                    {sections.find(s => s.id === activeSection)?.title}
                                </h2>
                            </div>
                        </div>

                        <div className="text-neutral-300 leading-relaxed">
                            {sections.find(s => s.id === activeSection)?.content}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GettingStartedPage;
