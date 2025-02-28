"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
export default function AppNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { address, status } = useAccount();
    const [account, setAccount] = useState<{ address: string | undefined; status: string }>({ address: undefined, status: "disconnected" });
    useEffect(() => {
        setAccount({ address, status });
    }, [address, status]);

    return (
        <>
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileMenuOpen(false)} />
            )}
            <nav className="fixed left-2 right-2 z-50 sm:bg-[#563988] bg-[#563988] border-b border-white/10 rounded-b-2xl sm:top-2 sm:rounded-full">
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
                        {/* <div className="sm:hidden button-press-3d bg-black/80 border-b border-white/10 rounded-full justify-center">
                            <button
                                onClick={() => {
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
                        </div> */}
                        {/* Mobile Menu Button Fixed */}
                        <div className="sm:hidden button-press-3d bg-black/80 border-b border-white/10 rounded-full justify-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                role="button"
                                className="text-white/50 transition-colors px-6 py-1"
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
                        {/* {mobileMenuOpen && (
                            <div className="sm:hidden fixed mobile-menu-animation top-16 left-2 right-2 bg-[#9252ff] border-b border-white/10 rounded-2xl z-1000">
                                <div className="px-2 pt-2 pb-3 space-y-1 text-sm">
                                    <div className="block px-3 py-2">
                                        {status === "connected" ? (
                                            <>
                                                <div className="flex flex-col gap-2 items-left">
                                                    <div className="relative group w-full h-40 bg-transfarent justify-items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="#" className="block px-3 py-2 text-white/80 hover:text-black/30"><StorefrontOutlinedIcon /> Marketplace</a>
                                                            </button>
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="/studio" className="block px-3 py-2 text-white/80 hover:text-black/30"><BrushOutlinedIcon /> Pengo Studio</a>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative group w-full bg-black/30 rounded-md">
                                                        <div className="mx-2 py-4">
                                                            <div className="pl-4 space-y-1 mt-2 border-l-2 border-[#c9ff33]/20">
                                                                <a className="text-white/70 transition-colors w-full font-mono text-left flex items-center justify-between cursor-default">Connected Wallet</a>
                                                                <a className="text-white/70 text-xs font-light font-mono transition-colors w-full text-left flex items-center justify-between cursor-default">{`${account.address ? `${account.address.slice(0, 4)}...${account.address.slice(-10)}` : "Not Connected"}`}</a>
                                                            </div>
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
                        )} */}
                        {/* Mobile Menu Fixed*/}
                        {mobileMenuOpen && (
                            <div
                                className={`sm:hidden fixed top-16 left-2 right-2 bg-[#9252ff] border-b border-white/10 rounded-2xl z-50 transition-all duration-300 ${
                                    mobileMenuOpen ? "mobile-menu-animation" : "mobile-menu-exit"
                                }`}
                            >
                                <div className="px-2 pt-2 pb-3 space-y-1 text-sm">
                                    <div className="block px-3 py-2">
                                        {status === "connected" ? (
                                            <>
                                                <div className="flex flex-col gap-2 items-left">
                                                    <div className="relative group w-full h-40 bg-transfarent justify-items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="#" className="block px-3 py-2 text-white/80 hover:text-black/30">
                                                                    <StorefrontOutlinedIcon /> Marketplace
                                                                </a>
                                                            </button>
                                                            <button className="text-white/80 hover:text-black transition-colors text-white gap-1 text-sm rounded-md">
                                                                <a href="/studio" className="block px-3 py-2 text-white/80 hover:text-black/30">
                                                                    <BrushOutlinedIcon /> Pengo Studio
                                                                </a>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative group w-full bg-black/30 rounded-md">
                                                        <div className="mx-2 py-4">
                                                            <div className="pl-4 space-y-1 mt-2 border-l-2 border-[#c9ff33]/20">
                                                                <a className="text-white/70 transition-colors w-full font-mono text-left flex items-center justify-between cursor-default">
                                                                    Connected Wallet
                                                                </a>
                                                                <a className="text-white/70 text-xs font-light font-mono transition-colors w-full text-left flex items-center justify-between cursor-default">
                                                                    {`${account.address ? `${account.address.slice(0, 4)}...${account.address.slice(-10)}` : "Not Connected"}`}
                                                                </a>
                                                            </div>
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
