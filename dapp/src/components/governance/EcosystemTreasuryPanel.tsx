import React, { useState, useEffect } from 'react';

interface EcosystemTreasuryPanelProps {
    ecosystemAssets: { tokenName: string; amount: string }[];
}

export default function EcosystemTreasuryPanel({ ecosystemAssets }: EcosystemTreasuryPanelProps) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="glass-card p-4 sm:p-5 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Treasury
                </h2>
                <div className="flex items-center gap-2 text-neutral-400 text-xs sm:text-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <svg className={`w-3.5 h-3.5 ${countdown === 5 ? 'animate-spin text-primary-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update in {countdown}s</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {ecosystemAssets.map((asset, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                        <div className="text-neutral-400 text-sm mb-1">{asset.tokenName}</div>
                        <div className="text-lg font-bold text-white truncate max-w-full">{asset.amount}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
