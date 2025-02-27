"use client";

import Image from "next/image";
import { useState } from "react";
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
// import {
//     useLoginWithAbstract
// } from "@abstract-foundation/agw-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
export default function AppNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // const { logout } = useLoginWithAbstract();

    const { address, status } = useAccount();
    return (
        <>
            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
            )}
            <nav className="fixed left-2 right-2 z-50 sm:bg-[#563988] bg-[#563988] backdrop-blur-md border-b border-white/10 rounded-b-2xl sm:top-2 sm:rounded-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <a href="/">
                                <Image
                                    src="/pengo-header-logo.png"
                                    alt="Penguin Onchain"
                                    width={1280}
                                    height={540}
                                    className="sm:w-[110px] w-[90px]"
                                    quality={100}
                                    priority
                                />
                            </a>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center space-x-8">
                            <div className="hidden sm:flex items-center space-x-8">
                                <div className="relative group">
                                    <button className="text-white/80 hover:text-black transition-colors">
                                        <a href="#" className="block px-4 py-2 text-white/80 hover:text-black/30">Marketplace</a>
                                    </button>
                                    <button className="text-white/80 hover:text-black transition-colors">
                                        <a href="/studio" className="block px-4 py-2 text-white/80 hover:text-black/30">Studio</a>
                                    </button>
                                </div>
                            </div>
                            <div className="relative group ml-6">
                                <ConnectButton />
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="sm:hidden button-press-3d bg-black/80 border-b border-white/10 rounded-full justify-center">
                            <button
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }}
                                role="button"
                                className="text-white/50 transition-colors px-6 py-1"
                            >
                                <svg
                                    className="h-6 w-6"
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
                            <div className="sm:hidden fixed mobile-menu-animation top-16 left-2 right-2 bg-[#9252ff] border-b border-white/10 rounded-2xl z-1000">
                                <div className="px-2 pt-2 pb-3 space-y-1 text-sm">
                                    <div className="block px-3 py-2">
                                        {status === "connected" ? (
                                            <>
                                                <div className="flex flex-col gap-2 items-left">
                                                    <div className="relative group w-full h-40 bg-transfarent justify-items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="#" className="block px-3 py-2 text-white/80 hover:text-black/30"><StorefrontOutlinedIcon/> Marketplace</a>
                                                            </button>
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="/studio" className="block px-3 py-2 text-white/80 hover:text-black/30"><BrushOutlinedIcon/> Pengo Studio</a>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative group w-full bg-black/30 rounded-md">
                                                        <div className="mx-2 py-4">
                                                            <div className="pl-4 space-y-1 mt-2 border-l-2 border-[#c9ff33]/20">
                                                                <a className="text-white/70 transition-colors w-full font-mono text-left flex items-center justify-between cursor-default">Connected Wallet</a>
                                                                <a className="text-white/70 text-xs font-light font-mono transition-colors w-full text-left flex items-center justify-between cursor-default">{`${address?.slice(0, 4)}...${address?.slice(-10)}`}</a>
                                                            </div>
                                                            {/* <button
                                                                className="mt-2 font-mono rounded border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-1 hover:bg-white/20 text-xs h-8 px-4"
                                                                onClick={logout}
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                                    />
                                                                </svg>
                                                                Disconnect
                                                            </button> */}
                                                            <div className="my-4 justify-center text-center">
                                                                <ConnectButton />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <ConnectButton />
                                        )}
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
