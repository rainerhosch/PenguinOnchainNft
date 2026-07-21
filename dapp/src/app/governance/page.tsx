'use client'
import React, { useState } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import PengoEcosystem from '../../constants/PengoEcosystem.json';

const strategyAddress = PengoEcosystem.addresses.sepolia.PengoStrategyProxy as `0x${string}`;
const strategyAbi = PengoEcosystem.abis.PengoStrategy;
const tokenAddress = PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`;
const tokenAbi = PengoEcosystem.abis.PengoToken;

export default function GovernancePage() {
    const [burnAmount, setBurnAmount] = useState("");
    const { address } = useAccount();

    // 1. Read User Token Balance
    const { data: userTokenBalanceData } = useReadContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address }
    });
    const pengoBalance = userTokenBalanceData ? Number(formatEther(userTokenBalanceData as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";
    const rawPengoBalance = userTokenBalanceData ? (userTokenBalanceData as bigint) : BigInt(0);

    // 2. Read Proposal Count
    const { data: proposalCountData } = useReadContract({
        address: strategyAddress,
        abi: strategyAbi,
        functionName: 'proposalCount',
    });
    const proposalCount = proposalCountData ? Number(proposalCountData) : 0;

    // We can simulate reading proposals using useReadContracts if needed, but for UI sake, we'll mock them if count is 0
    // In a real production app, we would use an indexer (The Graph) or useReadContracts to fetch all active proposals.
    const mockProposals = [
        { id: 1, targetRWA: "Mock Apple (mAAPL)", description: "Buy $10,000 worth of AAPL for the vault", yesVotes: 45000, noVotes: 2000, status: "Active" },
        { id: 2, targetRWA: "Mock NVIDIA (mNVDA)", description: "Liquidate NVDA holdings", yesVotes: 120000, noVotes: 50000, status: "Executed" }
    ];

    const dividends = [
        { rwa: "mAAPL", amount: 15.5, value: "$2,325" },
        { rwa: "mGOLD", amount: 2.1, value: "$4,200" }
    ];

    // Mock NFT Data since the frontend doesn't have an indexer yet
    const userNFTs = [
        { id: "1", name: "Pengo #1", power: 1500, image: "https://api.dicebear.com/7.x/bottts/svg?seed=pengo1" }
    ];
    const totalPower = 1500;

    // 3. Write Contract (Burn for Power)
    const { data: burnHash, writeContract: writeBurn, isPending: isBurning } = useWriteContract();
    const { isLoading: isConfirmingBurn, isSuccess: isConfirmedBurn } = useWaitForTransactionReceipt({ hash: burnHash });

    const handleBurn = () => {
        if (!burnAmount || isNaN(Number(burnAmount))) return;
        writeBurn({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'burnForPower',
            args: [1, parseEther(burnAmount)], // Hardcoding tokenId 1 for demo
        });
    };

    return (
        <div className="min-h-screen bg-gradient-mesh">
            <div className="fixed inset-0 grid-pattern pointer-events-none" />
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />

            <AppNavbar />

            <main className="relative pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            DAO <span className="gradient-text">Governance & Vault</span>
                        </h1>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Burn $PENGO to boost your NFT's Share Power. Use your power to vote on RWA investments and claim dividends.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Profile & Boost Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                                        <span className="text-neutral-400">Total $PENGO</span>
                                        <span className="text-xl font-bold text-white">{pengoBalance}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                                        <span className="text-neutral-400">Total Share Power</span>
                                        <span className="text-xl font-bold text-primary-400 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {totalPower.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mt-8 mb-4">Burn to Boost</h3>
                                <div className="space-y-4">
                                    <select className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-primary-500">
                                        {userNFTs.map(nft => (
                                            <option key={nft.id} value={nft.id}>{nft.name} (Power: {nft.power})</option>
                                        ))}
                                    </select>
                                    
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
                        </div>

                        {/* Proposals & Vault */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Vault Dividends */}
                            <div className="glass-card p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Claimable Dividends
                                    </h2>
                                    <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                                        Claim All
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {dividends.map((div, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center border border-white/10">
                                                    <span className="text-xs font-bold text-white">{div.rwa.charAt(1)}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{div.rwa}</div>
                                                    <div className="text-sm text-emerald-400">{div.value}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{div.amount}</div>
                                                <button className="text-sm text-primary-400 hover:text-primary-300">Claim</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Governance Proposals */}
                            <div className="glass-card p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Active Proposals (Total: {proposalCount})</h2>
                                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                                        + New Proposal
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {mockProposals.map(prop => (
                                        <div key={prop.id} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-neutral-300">#{prop.id}</span>
                                                        <h3 className="font-bold text-white text-lg">{prop.targetRWA}</h3>
                                                    </div>
                                                    <p className="text-sm text-neutral-400">{prop.description}</p>
                                                </div>
                                                <span className={`text-xs px-3 py-1 rounded-full border ${prop.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'}`}>
                                                    {prop.status}
                                                </span>
                                            </div>

                                            {/* Vote Progress */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-emerald-400">Yes: {prop.yesVotes.toLocaleString()}</span>
                                                    <span className="text-red-400">No: {prop.noVotes.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full h-2 bg-red-500/20 rounded-full overflow-hidden flex">
                                                    <div 
                                                        className="h-full bg-emerald-500" 
                                                        style={{ width: `${(prop.yesVotes / (prop.yesVotes + prop.noVotes)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {prop.status === 'Active' && (
                                                <div className="flex gap-3">
                                                    <button className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors">
                                                        Vote Yes
                                                    </button>
                                                    <button className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors">
                                                        Vote No
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
