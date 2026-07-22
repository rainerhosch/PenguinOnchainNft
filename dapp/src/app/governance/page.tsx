'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseEther, formatEther, type Abi, erc20Abi } from 'viem';
import { toast, Toaster } from 'react-hot-toast';
import PengoEcosystem from '../../constants/PengoEcosystem.json';

const strategyAddress = PengoEcosystem.addresses.sepolia.PengoStrategyProxy as `0x${string}`;
const strategyAbi = PengoEcosystem.abis.PengoStrategy as Abi;
const tokenAddress = PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`;
const tokenAbi = PengoEcosystem.abis.PengoToken as Abi;
const nftAddress = PengoEcosystem.addresses.sepolia.PenguinOnchain as `0x${string}`;
import PenguinOnchainAbiRaw from '../../constants/PenguinOnchainAbi.json';
const PenguinOnchainAbi = PenguinOnchainAbiRaw as Abi;

export default function GovernancePage() {
    const [burnAmount, setBurnAmount] = useState("");
    const { address } = useAccount();
    const [selectedNftToBurn, setSelectedNftToBurn] = useState("");

    // 1. Read User Token Balance
    const { data: userTokenBalanceData, refetch: refetchTokenBalance } = useReadContract({
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

    const proposalIds = Array.from({ length: proposalCount }, (_, i) => i + 1);

    const { data: proposalsData, refetch: refetchProposals } = useReadContracts({
        contracts: proposalIds.map(id => ({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'proposals',
            args: [id]
        })),
        query: { enabled: proposalCount > 0 }
    });

    const { data: hasVotedData, refetch: refetchHasVoted } = useReadContracts({
        contracts: proposalIds.map(id => ({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'hasVoted',
            args: [id, selectedNftToBurn ? BigInt(selectedNftToBurn) : BigInt(0)]
        })),
        query: { enabled: proposalCount > 0 && !!selectedNftToBurn }
    });

    // Fetch RWA Symbols dynamically for proposals
    const uniqueProposalRWAs = Array.from(new Set(
        (proposalsData || []).map(p => p.result ? (p.result as any[])[0] as `0x${string}` : null).filter(Boolean)
    ));

    const { data: proposalRWASymbols } = useReadContracts({
        contracts: uniqueProposalRWAs.map(address => ({
            address: address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'symbol'
        })),
        query: { enabled: uniqueProposalRWAs.length > 0 }
    });

    const getRWASymbol = (address: string) => {
        const index = uniqueProposalRWAs.findIndex(a => a?.toLowerCase() === address.toLowerCase());
        if (index !== -1 && proposalRWASymbols && proposalRWASymbols[index]?.result) {
            return proposalRWASymbols[index].result as string;
        }
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    };

    const activeProposals = proposalsData ? proposalsData.map((data, index) => {
        if (!data.result) return null;
        const [rwaToken, isAdd, yesVotes, noVotes, endTime, executed] = data.result as [string, boolean, bigint, bigint, bigint, boolean];
        const status = executed ? "Executed" : (Number(endTime) * 1000 < Date.now() ? "Pending Execution" : "Active");
        
        return {
            id: proposalIds[index],
            targetRWA: getRWASymbol(rwaToken),
            description: `${isAdd ? "Add to" : "Remove from"} Buy List`,
            yesVotes: Number(formatEther(yesVotes)),
            noVotes: Number(formatEther(noVotes)),
            status: status,
            rawEndTime: Number(endTime),
            isAdd: isAdd,
            hasVoted: hasVotedData && hasVotedData[index] ? (hasVotedData[index].result as boolean) : false,
            rwaToken: rwaToken
        };
    }).filter(p => p !== null) : [];
    // console.log(activeProposals)

    const knownRWAs = [
        { address: "0x604D2b8e573696B6e02925C9A5a7E4F2eAe62569" as `0x${string}`, symbol: "mAAPL" },
        { address: "0x128F31222E0DDE9EC4C3956a1A8D1c76294eb743" as `0x${string}`, symbol: "mGOLD" },
        { address: "0x6C91901C9509f6E35F38E22252a13b5D22b069df" as `0x${string}`, symbol: "mGOOGL" },
        { address: "0xa2717a61d1558E5E57cE8f58bB267793d5B5F37a" as `0x${string}`, symbol: "mNVDA" }
    ];



    const { data: totalDividendsData, refetch: refetchTotalDividends } = useReadContracts({
        contracts: knownRWAs.map(rwa => ({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'totalDividendsPerPower',
            args: [rwa.address]
        }))
    });


    const { data: claimableDividendsData, refetch: refetchClaimableDividends } = useReadContracts({
        contracts: knownRWAs.map(rwa => ({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'getClaimableDividends',
            args: [rwa.address, selectedNftToBurn ? BigInt(selectedNftToBurn) : BigInt(0)]
        }))
    });


    const { data: claimHash, writeContract: writeClaim, isPending: isClaiming } = useWriteContract();
    const { isLoading: isConfirmingClaim, isSuccess: isConfirmedClaim } = useWaitForTransactionReceipt({ hash: claimHash });

    useEffect(() => {
        if (isConfirmedClaim) {
            toast.success("Dividends claimed successfully!");
            refetchTotalDividends();
            refetchClaimableDividends();
        }
    }, [isConfirmedClaim]);



    const handleClaim = (rwaAddress: `0x${string}`) => {
        if (!selectedNftToBurn) {
            toast.error("Please select an NFT to claim dividends.");
            return;
        }
        writeClaim({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'claimDividends',
            args: [rwaAddress, BigInt(selectedNftToBurn)]
        });
    };

    // Fetch User NFTs
    const { data: userTokensData, refetch: refetchUserTokens } = useReadContract({
        address: nftAddress,
        abi: PenguinOnchainAbi,
        functionName: 'tokensOfOwner',
        args: [address],
        query: { enabled: !!address }
    });
    const userTokenIds = (userTokensData as bigint[]) || [];

    const { data: sharePowersData, refetch: refetchSharePowers } = useReadContracts({
        contracts: userTokenIds.map((tokenId) => ({
            address: nftAddress,
            abi: PenguinOnchainAbi,
            functionName: 'sharePower',
            args: [tokenId]
        })),
        query: { enabled: userTokenIds.length > 0 }
    });

    const dividends = knownRWAs.map((rwa, index) => {
        const payout = claimableDividendsData && claimableDividendsData[index]?.result ? (claimableDividendsData[index].result as bigint) : BigInt(0);

        return {
            rwa: rwa.symbol,
            address: rwa.address,
            amount: Number(formatEther(payout)).toFixed(4),
            value: payout > BigInt(0) ? "Claimable" : "0",
            canClaim: payout > BigInt(0)
        };
    });



    const { data: tokenURIsData } = useReadContracts({
        contracts: userTokenIds.map((tokenId) => ({
            address: nftAddress,
            abi: PenguinOnchainAbi,
            functionName: 'tokenURI',
            args: [tokenId]
        })),
        query: { enabled: userTokenIds.length > 0 }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            refetchTotalDividends();
            if (selectedNftToBurn) {
                refetchClaimableDividends();
                refetchSharePowers();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedNftToBurn, refetchTotalDividends, refetchClaimableDividends, refetchSharePowers]);

    const userNFTs = userTokenIds.map((id, index) => {
        const rawPower = sharePowersData && sharePowersData[index] ? (sharePowersData[index].result as bigint || BigInt(0)) : BigInt(0);
        const powerStr = Number(formatEther(rawPower)).toLocaleString(undefined, { maximumFractionDigits: 0 });

        let image = `https://api.dicebear.com/7.x/bottts/svg?seed=pengo${id.toString()}`;
        if (tokenURIsData && tokenURIsData[index] && tokenURIsData[index].result) {
            try {
                const uri = tokenURIsData[index].result as string;
                if (uri.startsWith('data:application/json;base64,')) {
                    const base64Data = uri.split(",")[1];
                    const metadata = JSON.parse(atob(base64Data));
                    if (metadata.image) {
                        image = metadata.image;
                    }
                }
            } catch (e) {
                console.error("Failed to parse tokenURI for token", id);
            }
        }

        return {
            id: id.toString(),
            name: `Pengo #${id.toString()}`,
            power: powerStr,
            rawPower: rawPower,
            image: image
        };
    });
    const totalPower = userNFTs.reduce((sum, nft) => sum + Number(formatEther(nft.rawPower)), 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

    const { data: burnHash, writeContract: writeBurn, isPending: isBurning } = useWriteContract();
    const { isLoading: isConfirmingBurn, isSuccess: isConfirmedBurn } = useWaitForTransactionReceipt({ hash: burnHash });

    useEffect(() => {
        if (isConfirmedBurn) {
            toast.success("Burn successful! Share Power updated.");
            refetchTokenBalance();
            refetchSharePowers();
            refetchUserTokens();
        }
    }, [isConfirmedBurn]);

    const handleBurn = () => {
        if (!burnAmount || isNaN(Number(burnAmount)) || !selectedNftToBurn) return;
        writeBurn({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'burnForPower',
            args: [BigInt(selectedNftToBurn), parseEther(burnAmount)],
        });
    };

    const { data: voteHash, writeContract: writeVote, isPending: isVoting } = useWriteContract();
    const { isLoading: isConfirmingVote, isSuccess: isConfirmedVote } = useWaitForTransactionReceipt({ hash: voteHash });
    const [votingOnId, setVotingOnId] = useState<number | null>(null);

    useEffect(() => {
        if (isConfirmedVote) {
            toast.success("Vote cast successfully!");
            refetchProposals();
            refetchHasVoted();
        }
    }, [isConfirmedVote]);

    const handleVote = (proposalId: number, support: boolean) => {
        if (!selectedNftToBurn) {
            toast.error("Please select an NFT from 'Your Profile' to cast a vote.");
            return;
        }

        const selectedNftObj = userNFTs.find(nft => nft.id === selectedNftToBurn);
        if (selectedNftObj && selectedNftObj.rawPower === BigInt(0)) {
            toast.error("Your selected NFT does not have any Share Power to vote.");
            return;
        }

        setVotingOnId(proposalId);
        writeVote({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'vote',
            args: [BigInt(proposalId), BigInt(selectedNftToBurn), support]
        });
    };

    return (
        <div className="min-h-screen bg-gradient-mesh">
            <Toaster position="top-center" />
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
                                                    onClick={() => handleClaim(div.address)}
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

                            {/* Governance Proposals */}
                            <div className="glass-card p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Active Proposals (Total: {proposalCount})</h2>
                                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                                        + New Proposal
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {activeProposals.length === 0 && (
                                        <div className="text-center py-8 text-neutral-400 border border-white/10 border-dashed rounded-xl">
                                            No active proposals at the moment.
                                        </div>
                                    )}
                                    {activeProposals.map(prop => (
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
                                                        style={{ width: `${(prop.yesVotes + prop.noVotes) > 0 ? (prop.yesVotes / (prop.yesVotes + prop.noVotes)) * 100 : 50}%` }}
                                                    />
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
                                                            {isVoting && votingOnId === prop.id ? "..." : "Vote Yes"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleVote(prop.id, false)}
                                                            disabled={isVoting || isConfirmingVote}
                                                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {isVoting && votingOnId === prop.id ? "..." : "Vote No"}
                                                        </button>
                                                    </div>
                                                )
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
