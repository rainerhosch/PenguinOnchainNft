import React from "react";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';
import AppNavbar from "../../components/AppNavBar";
import ListItems from "../../components/accessory-marketplace/ListItems";

export default function AccessoryMarketplace() {
    return (
        <div className="min-h-screen bg-gradient-mesh">
            {/* Grid Pattern */}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />

            {/* Glow Effects */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed top-1/2 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    Accessory <span className="gradient-text">Marketplace</span>
                                </h1>
                                <p className="text-sm text-neutral-400">Discover and collect unique accessories for your Pengo</p>
                            </div>
                        </div>

                        <Link href="/studio" className="btn-secondary py-2.5 px-4 flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Accessory
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="glass-card p-4 sm:p-6 mb-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">100+</p>
                                <p className="text-xs text-neutral-500">Listed Items</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">50+</p>
                                <p className="text-xs text-neutral-500">Creators</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">5%</p>
                                <p className="text-xs text-neutral-500">Creator Fee</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                                <p className="text-xs text-neutral-500">On-Chain</p>
                            </div>
                        </div>
                    </div>

                    {/* Marketplace Content */}
                    <div className="glass-card p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">Available Accessories</h2>
                                    <p className="text-xs text-neutral-400">Browse and purchase unique items</p>
                                </div>
                            </div>
                        </div>

                        <ListItems />
                    </div>
                </div>
            </main>
        </div>
    );
}
