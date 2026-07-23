import React from 'react';
import { formatEther } from 'viem';

interface ProfilePanelProps {
    pengoBalance: string;
    rawPengoBalance: bigint;
    totalPower: string;
    userNFTs: any[];
    selectedNftToBurn: string;
    setSelectedNftToBurn: (id: string) => void;
    burnAmount: string;
    setBurnAmount: (val: string) => void;
    handleBurn: () => void;
    isBurning: boolean;
    isConfirmingBurn: boolean;
    isConfirmedBurn: boolean;
}

export default function ProfilePanel({
    pengoBalance,
    rawPengoBalance,
    totalPower,
    userNFTs,
    selectedNftToBurn,
    setSelectedNftToBurn,
    burnAmount,
    setBurnAmount,
    handleBurn,
    isBurning,
    isConfirmingBurn,
    isConfirmedBurn
}: ProfilePanelProps) {
    return (
        <div className="glass-card p-4 sm:p-5 md:p-6 border border-primary-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-lg font-bold text-white mb-6 relative z-10">Your Profile</h2>

            <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-2 border border-white/10 flex justify-between items-center">
                    <span className="text-neutral-400">Balance</span>
                    <span className="text-sm font-bold text-white">{pengoBalance} $PENGO</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/10 flex justify-between items-center">
                    <span className="text-neutral-400">Total Share Power</span>
                    <span className="text-sm font-bold text-primary-400 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {totalPower}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mt-8 mb-4">Burn to Boost</h3>
            <div className="space-y-4">
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x custom-scrollbar">
                    {userNFTs.length === 0 ? (
                        <div className="text-sm text-neutral-500 w-full text-center py-4 border border-white/10 border-dashed rounded-xl">No NFTs found. Please mint one first.</div>
                    ) : (
                        userNFTs.map(nft => (
                            <button
                                key={nft.id}
                                onClick={() => setSelectedNftToBurn(nft.id)}
                                className={`flex-shrink-0 w-32 snap-center rounded-2xl border p-2 transition-all ${selectedNftToBurn === nft.id ? 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500/50' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
                            >
                                <div className="aspect-square rounded-xl bg-black/0 mb-2 overflow-hidden flex items-center justify-center relative">
                                    <img src={nft.image} alt={nft.name} className="w-24 h-24 object-contain rounded-lg" />
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-white text-xs truncate">{nft.name}</div>
                                    <div className="text-xs text-primary-400 font-medium mt-1 flex items-center justify-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        {nft.power}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="relative">
                    <input
                        type="number"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        placeholder="Amount of PENGO to burn"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-primary-500"
                    />
                    <button
                        className="absolute right-2 top-2 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                        onClick={() => setBurnAmount(formatEther(rawPengoBalance))}
                    >
                        MAX
                    </button>
                </div>

                <button
                    onClick={handleBurn}
                    disabled={isBurning || isConfirmingBurn || !burnAmount}
                    className="w-full py-3 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:hover:bg-red-500/20 disabled:hover:text-red-500 rounded-xl font-bold transition-all"
                >
                    {isBurning ? "Confirming..." : isConfirmingBurn ? "Burning..." : "🔥 Burn $PENGO"}
                </button>

                {isConfirmedBurn && (
                    <div className="text-emerald-400 text-sm text-center font-medium">Burn successful!</div>
                )}
            </div>
        </div>
    );
}
