import React from 'react';

interface EcosystemTreasuryPanelProps {
    ecosystemAssets: { tokenName: string; amount: string }[];
}

export default function EcosystemTreasuryPanel({ ecosystemAssets }: EcosystemTreasuryPanelProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Treasury
                </h2>
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
