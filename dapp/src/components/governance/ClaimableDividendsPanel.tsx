import React from 'react';

interface ClaimableDividendsPanelProps {
    dividends: { rwa: string; address: string; amount: string; value: string; canClaim: boolean }[];
    handleClaim: (address: `0x${string}`) => void;
    isClaiming: boolean;
    isConfirmingClaim: boolean;
}

export default function ClaimableDividendsPanel({
    dividends,
    handleClaim,
    isClaiming,
    isConfirmingClaim
}: ClaimableDividendsPanelProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Claimable Dividends
                </h2>
            </div>

            <div className="space-y-3">
                {dividends.map((div, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 bg-white/5 rounded-xl border ${div.canClaim ? 'border-primary-500/50' : 'border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center border border-white/10">
                                <span className="text-xs font-bold text-white">{div.rwa.charAt(1)}</span>
                            </div>
                            <div>
                                <div className="font-bold text-white">{div.rwa}</div>
                                <div className={`text-sm ${div.canClaim ? 'text-emerald-400' : 'text-neutral-500'}`}>{div.value}</div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <div className="font-bold text-white text-lg">{div.amount}</div>
                            <button
                                onClick={() => handleClaim(div.address as `0x${string}`)}
                                disabled={!div.canClaim || isClaiming || isConfirmingClaim}
                                className="text-sm px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-neutral-600"
                            >
                                {isClaiming ? "Confirming..." : isConfirmingClaim ? "Claiming..." : "Claim"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
