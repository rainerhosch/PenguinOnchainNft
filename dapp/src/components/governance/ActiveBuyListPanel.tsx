import React from 'react';

interface ActiveBuyListPanelProps {
    activeBuyList: { address: string; symbol: string; isValid: boolean }[];
}

export default function ActiveBuyListPanel({ activeBuyList }: ActiveBuyListPanelProps) {
    return (
        <div className="glass-card p-4 sm:p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Active Buy List
            </h2>
            <div className="space-y-3">
                {activeBuyList.length === 0 ? (
                    <div className="text-sm text-neutral-500 text-center py-4 border border-white/10 border-dashed rounded-xl">
                        No active tokens in buy list.
                    </div>
                ) : (
                    activeBuyList.map((rwa, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-emerald-400">{rwa.symbol.charAt(0)}</span>
                                </div>
                                <span className="font-bold text-white text-sm">{rwa.symbol}</span>
                            </div>
                            <a
                                href={`https://sepolia.etherscan.io/token/${rwa.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-primary-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
