import React from 'react';

interface ActiveProposalsPanelProps {
    proposalCount: number;
    activeProposals: any[];
    setIsProposalModalOpen: (val: boolean) => void;
    handleVote: (id: number, support: boolean) => void;
    isVoting: boolean;
    isConfirmingVote: boolean;
    votingOnId: number | null;
    handleExecute: (id: number) => void;
    isExecuting: boolean;
    isConfirmingExecute: boolean;
    executingId: number | null;
}

export default function ActiveProposalsPanel({
    proposalCount,
    activeProposals,
    setIsProposalModalOpen,
    handleVote,
    isVoting,
    isConfirmingVote,
    votingOnId,
    handleExecute,
    isExecuting,
    isConfirmingExecute,
    executingId
}: ActiveProposalsPanelProps) {
    return (
        <div className="glass-card p-6 min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">
                    Active Proposals <span className="text-primary-400 ml-2 text-lg">({proposalCount})</span>
                </h2>
                <button
                    onClick={() => setIsProposalModalOpen(true)}
                    className="bg-white/5 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                    + New Proposal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {activeProposals.length === 0 && (
                    <div className="col-span-full text-center py-8 text-neutral-400 border border-white/10 border-dashed rounded-xl">
                        No active proposals at the moment.
                    </div>
                )}
                {activeProposals.map((prop) => (
                    <div key={prop.id} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-neutral-300">#{prop.id}</span>
                                    <h3 className="font-bold text-white text-lg">{prop.targetRWA}</h3>
                                </div>
                                <p className="text-sm text-neutral-400">{prop.description}</p>
                            </div>
                            <span
                                className={`text-xs px-3 py-1 rounded-full border ${
                                    prop.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                                }`}
                            >
                                {prop.status}
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1 relative">
                                <span className="text-emerald-400">Yes: {prop.yesVotes.toLocaleString()}</span>
                                <span className="text-red-400">No: {prop.noVotes.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-red-500/20 rounded-full overflow-hidden flex relative">
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${prop.yesVotes + prop.noVotes > 0 ? (prop.yesVotes / (prop.yesVotes + prop.noVotes)) * 100 : 50}%` }}
                                />
                                {/* 50% Threshold Marker */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 z-10"></div>
                            </div>
                        </div>

                        {prop.status === 'Active' && (
                            prop.hasVoted ? (
                                <div className="w-full">
                                    <button disabled className="w-full py-2 bg-white/5 text-white/50 border border-white/10 rounded-lg cursor-not-allowed">
                                        ✓ Voted
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleVote(prop.id, true)}
                                        disabled={isVoting || isConfirmingVote}
                                        className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isVoting && votingOnId === prop.id ? '...' : 'Vote Yes'}
                                    </button>
                                    <button
                                        onClick={() => handleVote(prop.id, false)}
                                        disabled={isVoting || isConfirmingVote}
                                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isVoting && votingOnId === prop.id ? '...' : 'Vote No'}
                                    </button>
                                </div>
                            )
                        )}

                        {(prop.status === 'Pending Execution' || prop.status === 'Pending Execution (Fast-Track)') && (
                            <div className="w-full">
                                <button
                                    onClick={() => handleExecute(prop.id)}
                                    disabled={isExecuting || isConfirmingExecute}
                                    className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isExecuting && executingId === prop.id
                                        ? 'Confirming...'
                                        : isConfirmingExecute && executingId === prop.id
                                        ? 'Executing...'
                                        : 'Execute Proposal'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
