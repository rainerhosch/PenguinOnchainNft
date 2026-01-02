'use client';
import React from 'react';
import Link from 'next/link';

const OurProgramsPage = () => {
    return (
        <div className="min-h-screen bg-gradient-mesh">
            {/* Grid Pattern */}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            {/* Glow Effects */}
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-1/3 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Our Programs</h1>
                            <p className="text-sm text-neutral-400 hidden sm:block">Empowering creators, rewarding community</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-400 mb-6">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                        Now Open for Applications
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Build the Future of <span className="gradient-text">Pengo</span> With Us
                    </h1>
                    <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
                        At Pengo, we believe in the power of community. Our programs are designed to reward creativity, foster collaboration, and empower every member to shape our ecosystem.
                    </p>
                </div>
            </section>

            {/* Staking Rewards Highlight Section */}
            <section className="px-4 sm:px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            {/* Content */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-4">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Value-Backed NFT
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    Pengo = <span className="text-green-400">Digital Shares</span>
                                </h2>

                                <p className="text-lg text-neutral-300 mb-6">
                                    Pengo isn't just digital art, it's like holding shares in a growing ecosystem. When you mint a Pengo, your funds go directly into our <strong className="text-white">Staking Pool</strong>, generating passive income for all holders.
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl semibold text-green-400">40%</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Distributed to Holders</h4>
                                            <p className="text-sm text-neutral-400">40% of staking yields are distributed to NFT holders, claimable directly from the dApp.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl semibold text-cyan-400">40%</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Reinvested in Pool</h4>
                                            <p className="text-sm text-neutral-400">40% is compounded back into the staking pool, continuously increasing its size and future rewards.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl semibold text-cyan-400">20%</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Foundation Growth</h4>
                                            <p className="text-sm text-neutral-400">20% of staking yields are distributed to the foundation, supporting the ecosystem's growth and development.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="font-medium text-white">Floor Price Growth</span>
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                        As the staking pool grows, Pengo's intrinsic value increases proportionally, creating natural floor price appreciation tied to real yield, not speculation.
                                    </p>
                                </div>
                            </div>

                            {/* Visual Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass p-6 rounded-2xl text-center">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">Passive</div>
                                    <div className="text-sm text-neutral-400">Income Stream</div>
                                </div>

                                <div className="glass p-6 rounded-2xl text-center">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">Growing</div>
                                    <div className="text-sm text-neutral-400">Pool Size</div>
                                </div>

                                <div className="glass p-6 rounded-2xl text-center">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">On-Chain</div>
                                    <div className="text-sm text-neutral-400">Transparent</div>
                                </div>

                                <div className="glass p-6 rounded-2xl text-center">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">Community</div>
                                    <div className="text-sm text-neutral-400">Owned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="px-4 sm:px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Creator Program */}
                        <div className="feature-card group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="feature-icon mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400 mb-4">For Artists</span>
                                <h2 className="text-2xl font-bold text-white mb-4">Creator Program</h2>
                                <p className="text-neutral-400 mb-6">
                                    Join our exclusive Creator Program and turn your artistic vision into on-chain accessories. Collaborate with other talented artists, participate in themed workshops, and showcase your creations to the entire Pengo community.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Earn royalties on every sale of your designs',
                                        'Access to exclusive creator tools and resources',
                                        'Featured spotlight on our social channels',
                                        'Early access to new platform features'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-neutral-300">
                                            <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <a href="https://discord.gg/penguinonchain" target="_blank" className="btn-primary text-sm">
                                    Apply as Creator
                                </a>
                            </div>
                        </div>

                        {/* DAO Governance */}
                        <div className="feature-card group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="feature-icon mb-6" style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--secondary-500))' }}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent-500/20 text-accent-400 mb-4">Community Driven</span>
                                <h2 className="text-2xl font-bold text-white mb-4">DAO Voting System</h2>
                                <p className="text-neutral-400 mb-6">
                                    Your voice matters! Our decentralized governance system empowers Pengo holders to directly influence the future of the platform. Vote on new accessory designs, propose features, and help shape community initiatives.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        '1 Pengo = 1 Vote on all proposals',
                                        'Propose new features and improvements',
                                        'Vote on official accessory collections',
                                        'Transparent, on-chain governance'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-neutral-300">
                                            <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#" className="btn-secondary text-sm">
                                    Coming Soon
                                </a>
                            </div>
                        </div>

                        {/* Ambassador Program */}
                        <div className="feature-card group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="feature-icon mb-6" style={{ background: 'linear-gradient(135deg, var(--secondary-500), var(--primary-600))' }}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary-500/20 text-secondary-400 mb-4">For Advocates</span>
                                <h2 className="text-2xl font-bold text-white mb-4">Ambassador Program</h2>
                                <p className="text-neutral-400 mb-6">
                                    Become the face of Pengo in your community! Ambassadors help spread the word, onboard new users, and represent our values across the Web3 space. Exclusive perks and recognition await.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Exclusive ambassador-only NFT rewards',
                                        'Direct line to the Pengo team',
                                        'Monthly community calls and AMAs',
                                        'Recognition on our Ambassador Wall'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-neutral-300">
                                            <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <a href="https://discord.gg/penguinonchain" target="_blank" className="btn-primary text-sm">
                                    Join as Ambassador
                                </a>
                            </div>
                        </div>

                        {/* Referral Program */}
                        {/* <div className="feature-card group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="feature-icon mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 mb-4">For Everyone</span>
                                <h2 className="text-2xl font-bold text-white mb-4">Referral Rewards</h2>
                                <p className="text-neutral-400 mb-6">
                                    Share Pengo with friends and earn rewards! Our referral program gives you a percentage of every mint and marketplace transaction made by users you bring to the platform.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Earn up to 5% on referred mints',
                                        'Passive income from marketplace fees',
                                        'Real-time tracking dashboard',
                                        'No limits on referrals'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-neutral-300">
                                            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#" className="btn-secondary text-sm">
                                    Coming Soon
                                </a>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 sm:p-12 relative overflow-hidden text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative">
                            Ready to <span className="gradient-text">Get Started</span>?
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-xl mx-auto relative">
                            Whether you're an artist, a community builder, or simply passionate about Web3, there's a place for you in Pengo. Join us and help shape the future of on-chain NFTs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                            <a href="https://discord.gg/penguinonchain" target="_blank" className="btn-primary text-base px-8 py-4">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                                </svg>
                                Join Discord
                            </a>
                            <Link href="/getting-started" className="btn-secondary text-base px-8 py-4">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OurProgramsPage;
