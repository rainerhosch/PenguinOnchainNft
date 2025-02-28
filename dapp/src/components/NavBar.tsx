"use client";

import Image from "next/image";
import { useState } from "react";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        console.log("Before toggle:", mobileMenuOpen);
        setMobileMenuOpen((prev) => !prev);
        console.log("After toggle:", !mobileMenuOpen);
    };
    return (
        <>
            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileMenuOpen(false)} />
            )}

            <nav className="fixed top-2 left-2 right-2 z-50 sm:bg-black/70 bg-black/80 border-b border-white/10 rounded-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <a href="/">
                                <Image
                                    src="/pengo-header-2.png"
                                    alt="Penguin Onchain"
                                    width={1280}
                                    height={540}
                                    className="sm:w-[110px] w-[60px]"
                                    quality={100}
                                    priority
                                />
                            </a>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center space-x-8">
                            <div className="relative group ml-6">
                                <button className="text-white/80 hover:text-black transition-colors">
                                    Docs
                                    <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-6 w-48 rounded-md shadow-lg bg-white/70 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <div className="py-1">
                                        <a href="#getting-started" className="block px-4 py-2 text-sm text-black/40 hover:text-black">Getting Started</a>
                                        <a href="#tutorials" className="block px-4 py-2 text-sm text-black/40 hover:text-black">Tutorials</a>
                                        <a href="#api-reference" className="block px-4 py-2 text-sm text-black/40 hover:text-black">API Reference</a>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <button className="text-white/80 hover:text-black transition-colors">
                                    Resources
                                    <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-6 w-48 rounded-md shadow-lg bg-white/70 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <div className="py-1">
                                        <a href="#github" className="block px-4 py-2 text-sm text-black/40 hover:text-black">GitHub</a>
                                        <a href="#explore" className="block px-4 py-2 text-sm text-black/40 hover:text-black">Explore</a>
                                        <a href="#creator" className="block px-4 py-2 text-sm text-black/40 hover:text-black">Creator</a>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <button className="text-white/80 hover:text-black transition-colors">
                                    <a href="#programs" className="block px-4 py-2 text-white/80 hover:text-black">Programs</a>
                                </button>
                            </div>
                        </div>
                        
                        {/* Mobile Menu Button Fixed */}
                        <div className="sm:hidden button-press-3d bg-[#9252ff] border-b border-black/10 rounded-full justify-center">
                            <button
                                onClick={toggleMobileMenu}
                                role="button"
                                className="text-black/50 transition-colors px-6 py-1"
                            >
                                <svg
                                    className={`h-6 w-6 burger-icon ${mobileMenuOpen ? "open" : ""}`}
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

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <div className={`sm:hidden fixed top-20 left-4 right-4 bg-[#9252ff] border-b border-white/10 rounded-2xl z-50 transition-all duration-300 ${
                                mobileMenuOpen ? "mobile-menu-animation" : "mobile-menu-exit"
                            }`}>
                                <div className="px-2 pt-2 pb-3 space-y-1">
                                    <div className="block px-3 py-2">
                                        <button className="text-white/80 transition-colors w-full text-left flex items-center justify-between cursor-default">
                                            Docs
                                        </button>
                                        <div className="pl-4 space-y-2 mt-2 border-l-2 border-black/20">
                                            <a href="#getting-started" className="block text-sm text-white/80 hover:text-black">└─ Getting Started</a>
                                            <a href="#tutorials" className="block text-sm text-white/80 hover:text-black">└─ Tutorials</a>
                                            <a href="#api-reference" className="block text-sm text-white/80 hover:text-black">└─ API Reference</a>
                                        </div>
                                    </div>
                                    <div className="block px-3 py-2">
                                        <button className="text-white/80 transition-colors w-full text-left flex items-center justify-between cursor-default">
                                            Resources
                                        </button>
                                        <div className="pl-4 space-y-2 mt-2 border-l-2 border-black/20">
                                            <a href="#github" className="block text-sm text-white/80 hover:text-black">└─ GitHub</a>
                                            <a href="#explore" className="block text-sm text-white/80 hover:text-black">└─ Explore</a>
                                            <a href="#creator" className="block text-sm text-white/80 hover:text-black">└─ Creator</a>
                                        </div>
                                    </div>
                                    <a href="#programs" className="block px-3 py-2 text-white/80 hover:text-black">Programs</a>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </nav>
        </>
    );
}
