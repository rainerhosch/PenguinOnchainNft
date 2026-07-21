"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function AppNavbar() {
    const { address, status } = useAccount();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'glass-dark border-b border-white/10 shadow-lg'
                    : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/pengo-header-logo.png"
                                alt="Penguin Onchain"
                                width={1280}
                                height={540}
                                className="sm:w-[120px] w-[100px]"
                                quality={100}
                                priority
                            />
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-1">
                                <Link
                                    href="/studio"
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Studio
                                </Link>
                                <Link
                                    href="/accessory-marketplace"
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Marketplace
                                </Link>
                                <Link
                                    href="/mint"
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/bonding-curve"
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    $PENGO
                                </Link>
                                <Link
                                    href="/governance"
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    DAO
                                </Link>
                            </div>

                            <div className="h-6 w-px bg-white/10" />

                            <ConnectButton />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-3">
                            <ConnectButton.Custom>
                                {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                                    const connected = mounted && account && chain;
                                    return (
                                        <button
                                            onClick={connected ? openAccountModal : openConnectModal}
                                            className="p-2 rounded-xl glass text-white text-xs"
                                        >
                                            {connected ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                    {account.displayName}
                                                </span>
                                            ) : (
                                                'Connect'
                                            )}
                                        </button>
                                    );
                                }}
                            </ConnectButton.Custom>

                            <button
                                onClick={toggleMobileMenu}
                                className="p-2.5 rounded-xl glass text-white transition-all hover:bg-white/10"
                            >
                                <svg
                                    className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-full left-0 right-0 glass-dark border-b border-white/10 transition-all duration-300 ${mobileMenuOpen
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <div className="px-4 py-4 space-y-2">
                        <Link
                            href="/studio"
                            className="flex items-center gap-3 px-4 py-3 text-white rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Pengo Studio</div>
                                <div className="text-xs text-neutral-400">Create accessories</div>
                            </div>
                        </Link>

                        <Link
                            href="/accessory-marketplace"
                            className="flex items-center gap-3 px-4 py-3 text-white rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Marketplace</div>
                                <div className="text-xs text-neutral-400">Browse accessories</div>
                            </div>
                        </Link>

                        <Link
                            href="/mint"
                            className="flex items-center gap-3 px-4 py-3 text-white rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Mint</div>
                                <div className="text-xs text-neutral-400">Get your Pengo</div>
                            </div>
                        </Link>

                        <Link
                            href="/bonding-curve"
                            className="flex items-center gap-3 px-4 py-3 text-white rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Buy $PENGO</div>
                                <div className="text-xs text-neutral-400">Bonding Curve</div>
                            </div>
                        </Link>

                        <Link
                            href="/governance"
                            className="flex items-center gap-3 px-4 py-3 text-white rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Governance</div>
                                <div className="text-xs text-neutral-400">Vault & DAO</div>
                            </div>
                        </Link>


                        {/* Wallet Info */}
                        {status === 'connected' && address && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="px-4 py-3 rounded-xl bg-white/5">
                                    <div className="text-xs text-neutral-500 mb-1">Connected Wallet</div>
                                    <div className="text-sm font-mono text-white">
                                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
