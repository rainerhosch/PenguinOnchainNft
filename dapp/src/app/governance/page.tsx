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

import ProfilePanel from '../../components/governance/ProfilePanel';
import ActiveBuyListPanel from '../../components/governance/ActiveBuyListPanel';
import EcosystemTreasuryPanel from '../../components/governance/EcosystemTreasuryPanel';
import ClaimableDividendsPanel from '../../components/governance/ClaimableDividendsPanel';
import ActiveProposalsPanel from '../../components/governance/ActiveProposalsPanel';

function useTransactionToast({
    actionName,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
}: {
    actionName: string;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    error: any;
    hash: string | undefined;
}) {
    useEffect(() => {
        const id = `${actionName.replace(/\s+/g, '-')}-tx`;
        if (isPending) {
            toast.loading(`Please confirm ${actionName} in your wallet...`, { id });
        } else if (isConfirming) {
            toast.loading(`Transaction submitted. Waiting for confirmation...`, { id });
        } else if (isSuccess) {
            toast.success(
                <div>
                    {actionName} successful!<br />
                    <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline text-emerald-400 font-bold">View on Etherscan</a>
                </div>, 
                { id }
            );
        } else if (error) {
            toast.error(`Transaction failed: ${error.shortMessage || error.message.substring(0, 50)}...`, { id });
        }
    }, [isPending, isConfirming, isSuccess, error, hash, actionName]);
}

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

    const { data: totalSharePowerData } = useReadContract({
        address: nftAddress,
        abi: PenguinOnchainAbi,
        functionName: 'totalSharePower',
    });
    const absoluteMajority = totalSharePowerData ? (totalSharePowerData as bigint) / BigInt(2) + BigInt(1) : BigInt(0);

    const activeProposals = proposalsData ? proposalsData.map((data, index) => {
        if (!data.result) return null;
        const [rwaToken, isAdd, yesVotes, noVotes, endTime, executed] = data.result as [string, boolean, bigint, bigint, bigint, boolean];

        const hasAbsoluteMajority = absoluteMajority > BigInt(0) && yesVotes >= absoluteMajority;
        const status = executed ? "Executed" : (Number(endTime) * 1000 < Date.now() ? "Pending Execution" : (hasAbsoluteMajority ? "Pending Execution (Fast-Track)" : "Active"));

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

    // Fetch dynamic RWA list from strategy
    const { data: rewardTokensData, refetch: refetchRewardTokens } = useReadContract({
        address: strategyAddress,
        abi: strategyAbi,
        functionName: 'getRewardTokens',
    });

    const dynamicRWAAddresses = (rewardTokensData as `0x${string}`[]) || [];

    const { data: dynamicRWASymbolsData } = useReadContracts({
        contracts: dynamicRWAAddresses.map(address => ({
            address,
            abi: erc20Abi,
            functionName: 'symbol'
        })),
        query: { enabled: dynamicRWAAddresses.length > 0 }
    });

    const knownRWAs = dynamicRWAAddresses.map((address, index) => {
        const symbolResult = dynamicRWASymbolsData && dynamicRWASymbolsData[index]?.result;
        const symbol = symbolResult
            ? (symbolResult as string)
            : `${address.substring(0, 6)}...${address.substring(38)}`;
        return { address, symbol, isValid: !!symbolResult };
    }).filter(rwa => rwa.isValid);

    const { data: strategyBalancesData, refetch: refetchStrategyBalances } = useReadContracts({
        contracts: knownRWAs.map(rwa => ({
            address: rwa.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [strategyAddress]
        }))
    });

    const ecosystemAssets = knownRWAs.map((rwa, index) => {
        const bal = strategyBalancesData && strategyBalancesData[index]?.result ? (strategyBalancesData[index].result as bigint) : BigInt(0);
        return {
            tokenName: rwa.symbol,
            amount: Number(formatEther(bal)).toLocaleString(undefined, { maximumFractionDigits: 2 })
        };
    });
    // console.log(knownRWAs)

    // Fetch Active Buy List
    const { data: activeBuyListData, refetch: refetchActiveBuyList } = useReadContract({
        address: strategyAddress,
        abi: strategyAbi,
        functionName: 'getActiveBuyList',
    });
    const activeBuyListAddresses = (activeBuyListData as `0x${string}`[]) || [];

    const { data: activeBuyListSymbolsData } = useReadContracts({
        contracts: activeBuyListAddresses.map(address => ({
            address,
            abi: erc20Abi,
            functionName: 'symbol'
        })),
        query: { enabled: activeBuyListAddresses.length > 0 }
    });

    const activeBuyList = activeBuyListAddresses.map((address, index) => {
        const symbolResult = activeBuyListSymbolsData && activeBuyListSymbolsData[index]?.result;
        const symbol = symbolResult
            ? (symbolResult as string)
            : `${address.substring(0, 6)}...${address.substring(38)}`;
        return { address, symbol, isValid: !!symbolResult };
    }).filter(rwa => rwa.isValid);

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
        })),
        query: { enabled: !!selectedNftToBurn }
    });


    const { data: claimHash, writeContract: writeClaim, isPending: isClaiming, error: claimError } = useWriteContract();
    const { isLoading: isConfirmingClaim, isSuccess: isConfirmedClaim } = useWaitForTransactionReceipt({ hash: claimHash });

    useTransactionToast({ actionName: 'Claim Dividends', isPending: isClaiming, isConfirming: isConfirmingClaim, isSuccess: isConfirmedClaim, error: claimError, hash: claimHash });

    useEffect(() => {
        if (isConfirmedClaim) {
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
        const payout = claimableDividendsData && claimableDividendsData[index]?.result && selectedNftToBurn ? (claimableDividendsData[index].result as bigint) : BigInt(0);

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
            refetchRewardTokens();
            refetchActiveBuyList();
            refetchStrategyBalances();
            refetchTotalDividends();
            if (selectedNftToBurn) {
                refetchClaimableDividends();
                refetchSharePowers();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedNftToBurn, refetchRewardTokens, refetchActiveBuyList, refetchStrategyBalances, refetchTotalDividends, refetchClaimableDividends, refetchSharePowers]);

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

    const { data: burnHash, writeContract: writeBurn, isPending: isBurning, error: burnError } = useWriteContract();
    const { isLoading: isConfirmingBurn, isSuccess: isConfirmedBurn } = useWaitForTransactionReceipt({ hash: burnHash });

    useTransactionToast({ actionName: 'Burn PENGO', isPending: isBurning, isConfirming: isConfirmingBurn, isSuccess: isConfirmedBurn, error: burnError, hash: burnHash });

    useEffect(() => {
        if (isConfirmedBurn) {
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

    const { data: voteHash, writeContract: writeVote, isPending: isVoting, error: voteError } = useWriteContract();
    const { isLoading: isConfirmingVote, isSuccess: isConfirmedVote } = useWaitForTransactionReceipt({ hash: voteHash });
    const [votingOnId, setVotingOnId] = useState<number | null>(null);

    useTransactionToast({ actionName: 'Vote', isPending: isVoting, isConfirming: isConfirmingVote, isSuccess: isConfirmedVote, error: voteError, hash: voteHash });

    useEffect(() => {
        if (isConfirmedVote) {
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

    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [newProposalRwa, setNewProposalRwa] = useState("");
    const [newProposalIsAdd, setNewProposalIsAdd] = useState(true);

    const { data: proposeHash, writeContract: writePropose, isPending: isProposing, error: proposeError } = useWriteContract();
    const { isLoading: isConfirmingPropose, isSuccess: isConfirmedPropose } = useWaitForTransactionReceipt({ hash: proposeHash });

    const { data: executeHash, writeContract: writeExecute, isPending: isExecuting, error: executeError } = useWriteContract();
    const { isLoading: isConfirmingExecute, isSuccess: isConfirmedExecute } = useWaitForTransactionReceipt({ hash: executeHash });
    const [executingId, setExecutingId] = useState<number | null>(null);

    useTransactionToast({ actionName: 'Create Proposal', isPending: isProposing, isConfirming: isConfirmingPropose, isSuccess: isConfirmedPropose, error: proposeError, hash: proposeHash });
    useTransactionToast({ actionName: 'Execute Proposal', isPending: isExecuting, isConfirming: isConfirmingExecute, isSuccess: isConfirmedExecute, error: executeError, hash: executeHash });

    const isValidRwaAddress = newProposalRwa.length === 42 && newProposalRwa.startsWith('0x');

    const { data: previewSymbolData } = useReadContract({
        address: isValidRwaAddress ? (newProposalRwa as `0x${string}`) : undefined,
        abi: erc20Abi,
        functionName: 'symbol',
        query: { enabled: isValidRwaAddress }
    });

    const { data: previewNameData } = useReadContract({
        address: isValidRwaAddress ? (newProposalRwa as `0x${string}`) : undefined,
        abi: erc20Abi,
        functionName: 'name',
        query: { enabled: isValidRwaAddress }
    });

    useEffect(() => {
        if (isConfirmedPropose) {
            setIsProposalModalOpen(false);
            setNewProposalRwa("");
            refetchProposals();
        }
    }, [isConfirmedPropose]);

    useEffect(() => {
        if (isConfirmedExecute) {
            refetchProposals();
        }
    }, [isConfirmedExecute]);

    const handlePropose = () => {
        if (!newProposalRwa) {
            toast.error("Please enter an RWA token address.");
            return;
        }
        if (!selectedNftToBurn) {
            toast.error("Please select an NFT from 'Your Profile' to create a proposal.");
            return;
        }

        const selectedNftObj = userNFTs.find(nft => nft.id === selectedNftToBurn);
        if (selectedNftObj && selectedNftObj.rawPower === BigInt(0)) {
            toast.error("Your selected NFT does not have any Share Power to create a proposal.");
            return;
        }

        writePropose({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'propose',
            args: [newProposalRwa as `0x${string}`, newProposalIsAdd, BigInt(selectedNftToBurn)]
        });
    };

    const handleExecute = (proposalId: number) => {
        setExecutingId(proposalId);
        writeExecute({
            address: strategyAddress,
            abi: strategyAbi,
            functionName: 'executeProposal',
            args: [BigInt(proposalId)]
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400 mb-4">
                            PenguinOnchain DAO Governance
                        </h1>
                        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                            Shape the future of the ecosystem. Burn $PENGO to boost your NFT's Share Power, then use your power to vote on RWA investments and claim dividends.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Dashboard Left Column */}
                        <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8">
                            <ProfilePanel
                                pengoBalance={pengoBalance}
                                rawPengoBalance={rawPengoBalance}
                                totalPower={totalPower}
                                userNFTs={userNFTs}
                                selectedNftToBurn={selectedNftToBurn}
                                setSelectedNftToBurn={setSelectedNftToBurn}
                                burnAmount={burnAmount}
                                setBurnAmount={setBurnAmount}
                                handleBurn={handleBurn}
                                isBurning={isBurning}
                                isConfirmingBurn={isConfirmingBurn}
                                isConfirmedBurn={isConfirmedBurn}
                            />

                            <ActiveBuyListPanel activeBuyList={activeBuyList} />

                            <EcosystemTreasuryPanel ecosystemAssets={ecosystemAssets} />
                        </div>

                        {/* Right Column: Proposals & Vault */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                            <ClaimableDividendsPanel
                                dividends={dividends}
                                handleClaim={handleClaim}
                                isClaiming={isClaiming}
                                isConfirmingClaim={isConfirmingClaim}
                            />

                            <ActiveProposalsPanel
                                proposalCount={proposalCount}
                                activeProposals={activeProposals}
                                setIsProposalModalOpen={setIsProposalModalOpen}
                                handleVote={handleVote}
                                isVoting={isVoting}
                                isConfirmingVote={isConfirmingVote}
                                votingOnId={votingOnId}
                                handleExecute={handleExecute}
                                isExecuting={isExecuting}
                                isConfirmingExecute={isConfirmingExecute}
                                executingId={executingId}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* New Proposal Modal */}
            {isProposalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setIsProposalModalOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Create New Proposal</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">RWA Token Address</label>
                                <input
                                    type="text"
                                    value={newProposalRwa}
                                    onChange={(e) => setNewProposalRwa(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Action</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewProposalIsAdd(true)}
                                        className={`flex-1 py-2 rounded-lg border ${newProposalIsAdd ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        Add to Buy List
                                    </button>
                                    <button
                                        onClick={() => setNewProposalIsAdd(false)}
                                        className={`flex-1 py-2 rounded-lg border ${!newProposalIsAdd ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {isValidRwaAddress && (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="text-xs text-neutral-400 mb-1">On-Chain Preview</div>
                                    {previewSymbolData ? (
                                        <>
                                            <div className="font-bold text-white">{previewNameData as string} ({previewSymbolData as string})</div>
                                            <a href={`https://sepolia.etherscan.io/token/${newProposalRwa}`} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-xs mt-2 inline-flex items-center gap-1">
                                                View on Etherscan
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </>
                                    ) : (
                                        <div className="text-sm text-neutral-500">Fetching token data... (if it fails, this might not be an ERC20 token)</div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handlePropose}
                                disabled={isProposing || isConfirmingPropose || !newProposalRwa || (isValidRwaAddress && !previewSymbolData)}
                                className="w-full mt-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:bg-neutral-600"
                            >
                                {isProposing ? "Confirming..." : isConfirmingPropose ? "Proposing..." : "Submit Proposal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
