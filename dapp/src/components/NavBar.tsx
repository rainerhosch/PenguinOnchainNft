"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import PengoContract from "../constants/PengoContract.json";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const deployment = PengoContract.networkDeployment[0];

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
            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-neutral-900/95 backdrop-blur-xl border-b border-white/5 shadow-lg'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <a href="/" className="flex items-center gap-3 group">
                                <Image
                                    src="/pengo-header-2.png"
                                    alt="Pengo"
                                    width={1280}
                                    height={540}
                                    className="w-[80px] sm:w-[120px] transition-transform duration-300 group-hover:scale-105"
                                    quality={100}
                                    priority
                                />
                            </a>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-1">
                            {/* Docs Dropdown */}
                            <div className="relative group">
                                <button className="px-4 py-2 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 rounded-lg hover:bg-white/5">
                                    Docs
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-2 w-52 rounded-xl glass-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 overflow-hidden">
                                    <div className="py-2">
                                        <a href="/getting-started" className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Getting Started
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Resources Dropdown */}
                            <div className="relative group">
                                <button className="px-4 py-2 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 rounded-lg hover:bg-white/5">
                                    Resources
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-2 w-52 rounded-xl glass-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 overflow-hidden">
                                    <div className="py-2">
                                        <a href={`${deployment.me}/${deployment.PengoAddress}`} target="_blank" className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                Collections
                                            </span>
                                        </a>
                                        <a href={`${deployment.explore}/token/${deployment.PengoAddress}`} target="_blank" className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Explore
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Programs Link */}
                            <a href="/our-programs" className="px-4 py-2 text-neutral-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                Programs
                            </a>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-3 ml-4">
                                <a href="/studio" className="btn-secondary text-sm px-5 py-2.5">
                                    Studio
                                </a>
                                <a href="/accessory-marketplace" className="btn-primary text-sm px-5 py-2.5">
                                    Marketplace
                                </a>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
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
                {mobileMenuOpen && (
                    <div className="md:hidden mobile-menu-animation fixed top-16 left-4 right-4 glass-dark rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-4 space-y-2">
                            {/* Docs Section */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Docs</p>
                                <a href="/getting-started" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Getting Started
                                </a>
                            </div>

                            <div className="border-t border-white/10 my-2"></div>

                            {/* Resources Section */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Resources</p>
                                <a href={`${deployment.me}/${deployment.PengoAddress}`} target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Collections
                                </a>
                                <a href={`${deployment.explore}/token/${deployment.PengoAddress}`} target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Explore
                                </a>
                            </div>

                            <div className="border-t border-white/10 my-2"></div>

                            {/* Programs */}
                            <a href="/our-programs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Programs
                            </a>

                            <div className="border-t border-white/10 my-2"></div>

                            {/* CTA Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <a href="/studio" className="btn-secondary text-sm py-3 text-center">
                                    Studio
                                </a>
                                <a href="/accessory-marketplace" className="btn-primary text-sm py-3 text-center">
                                    Marketplace
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
