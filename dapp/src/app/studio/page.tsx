'use client'
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import image1 from "@/app/images/pengo-base.svg";
import AppNavbar from "@/components/AppNavBar";
import Editor from '@/components/studio/Editor';
import NftList from '@/components/showcase/ListNfts';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Toaster } from 'react-hot-toast';
import { Address } from 'viem';
import {
    useAccount,
    useReadContract,
} from "wagmi";
import PengoContract from "@/constants/PengoContract.json";

function StudioPage() {
    const [hideOptions, setHideOptions] = useState(false);
    const [hideDrawingCanvas, setHideDrawingCanvas] = useState(true);

    const [hideOptionsNfts, setHideOptionsNfts] = useState(false);
    const [showNftList, setShowNftList] = useState(true);
    const { address, status, chain } = useAccount();

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];
    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: balanceCount } = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: "balanceOf",
        args: [address],
    });
    console.log("balanceCount", balanceCount);

    const initializeCanvas = () => {
        setHideOptions(!hideOptions);
        setHideDrawingCanvas(!hideDrawingCanvas);
    };

    const removeCanvas = () => {
        setHideOptions(false);
        setHideDrawingCanvas(true);
    };

    const showList = () => {
        setHideOptionsNfts(!hideOptionsNfts);
        setShowNftList(!showNftList);
    };

    const hideList = () => {
        setHideOptionsNfts(true);
        setShowNftList(false);
    };

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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    PENGO <span className="font-light gradient-text">Studio</span>
                                </h1>
                                <p className="text-sm text-neutral-400">Create and customize your Pengo accessories</p>
                            </div>
                        </div>
                    </div>

                    {/* Connected State with Pengos */}
                    {(status == 'connected' || address != undefined) && Number(balanceCount) > 0 && (
                        <div className="space-y-6">
                            {/* Control Bar */}
                            <div className="glass-card p-4 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-white">Accessory Editor</h2>
                                            <p className="text-xs text-neutral-400">Draw custom accessories for your Pengo</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {hideDrawingCanvas ? (
                                            <button
                                                onClick={initializeCanvas}
                                                className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Open Canvas
                                            </button>
                                        ) : (
                                            <button
                                                onClick={removeCanvas}
                                                className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Close Canvas
                                            </button>
                                        )}

                                        {showNftList ? (
                                            <button
                                                onClick={hideList}
                                                className="glass text-sm py-2.5 px-4 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                                Hide Collection
                                            </button>
                                        ) : (
                                            <button
                                                onClick={showList}
                                                className="glass text-sm py-2.5 px-4 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Show Collection
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NFT Collection */}
                            {showNftList && (
                                <div className="glass-card p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-white">Your Pengo Collection</h2>
                                            <p className="text-xs text-neutral-400">Select a Pengo to customize</p>
                                        </div>
                                    </div>
                                    <NftList />
                                </div>
                            )}

                            {/* Canvas Editor */}
                            {hideOptions && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                            <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-white">Drawing workspace</h2>
                                            <p className="text-xs text-neutral-400">
                                                Colors left · canvas center · mint on the right
                                            </p>
                                        </div>
                                    </div>
                                    <Editor />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Connected but no Pengos */}
                    {(status == 'connected' || address != undefined) && Number(balanceCount) == 0 && (
                        <div className="glass-card p-8 sm:p-12 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No Pengos Found</h2>
                            <p className="text-neutral-400 mb-8">
                                You don't own any Pengo NFTs yet. Mint your first Pengo or purchase one from the marketplace to start customizing!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/mint" className="btn-primary py-3 px-6 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Mint Pengo
                                </Link>
                                <a
                                    href="https://magiceden.io/collections/monad-testnet/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary py-3 px-6 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Browse Marketplace
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Disconnected State */}
                    {(status === 'disconnected' || status === 'connecting' || address === undefined) && (
                        <div className="glass-card p-8 sm:p-12 text-center max-w-2xl mx-auto">
                            {/* Animated Pengo Preview */}
                            <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-accent-500/20 to-secondary-500/30 rounded-3xl blur-2xl animate-pulse-glow" />
                                <div className="relative glass rounded-3xl p-6 h-full flex items-center justify-center">
                                    <Image
                                        src={image1}
                                        alt="Pengo"
                                        width={180}
                                        height={180}
                                        className="drop-shadow-2xl"
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Welcome to <span className="gradient-text">Pengo Studio</span>
                            </h2>
                            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                                Connect your wallet to access the studio and start creating custom accessories for your Pengo NFTs.
                            </p>

                            <div className="flex justify-center mb-8">
                                <ConnectButton />
                            </div>

                            {/* Features Preview */}
                            <div className="grid sm:grid-cols-3 gap-4 mt-12">
                                <div className="p-4 rounded-xl bg-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-medium text-white text-sm mb-1">Draw Accessories</h3>
                                    <p className="text-xs text-neutral-500">Create pixel-perfect designs</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-medium text-white text-sm mb-1">View Collection</h3>
                                    <p className="text-xs text-neutral-500">Manage your Pengos</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-secondary-500/20 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h3 className="font-medium text-white text-sm mb-1">Save On-Chain</h3>
                                    <p className="text-xs text-neutral-500">Store forever on blockchain</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudioPage;
