'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import PengoEcosystem from '../../constants/PengoEcosystem.json';

const contractAddress = PengoEcosystem.addresses.sepolia.PengoBondingCurve as `0x${string}`;
const abi = PengoEcosystem.abis.PengoBondingCurve;

// Generate full curve points (x from 0 to 100)
const curvePoints = Array.from({ length: 101 }, (_, i) => {
    const x = i;
    // Parabolic curve: starts at y=95, ends at y=10
    const y = 95 - (0.5 * x + 0.0035 * x * x);
    return { x, y };
});

export default function BondingCurvePage() {
    const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
    const [inputValue, setInputValue] = useState<string>("");
    const [isEthTop, setIsEthTop] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 1. Read Current Price from Contract (Cost of 1 token)
    const { data: currentPriceData, refetch: refetchPrice } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getCost',
        args: [parseEther("1")],
    });
    const currentPrice = currentPriceData ? Number(formatEther(currentPriceData as bigint)) : 0;

    // 2. Fetch contract balance (ETH Raised) and Target Liquidity
    const { data: contractBalanceData, refetch: refetchContractBalance } = useBalance({
        address: contractAddress,
    });
    const ethRaised = contractBalanceData ? Number(formatEther(contractBalanceData.value)) : 0;
    
    const { data: targetLiquidityData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'TARGET_LIQUIDITY',
    });
    const targetLiquidity = targetLiquidityData ? Number(formatEther(targetLiquidityData as bigint)) : 25;
    
    // Check if already migrated
    const { data: isMigratedData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'isMigrated',
    });
    const isMigrated = isMigratedData ? Boolean(isMigratedData) : false;

    // If migrated, ethRaised is mathematically equal to targetLiquidity
    const displayEthRaised = isMigrated ? targetLiquidity : ethRaised;
    const progress = isMigrated ? "100.00" : Math.min((displayEthRaised / (targetLiquidity > 0 ? targetLiquidity : 1)) * 100, 100).toFixed(2);

    // Dynamic chart calculations based on progress
    const dotX = Number(progress);
    const dotY = 95 - (0.5 * dotX + 0.0035 * dotX * dotX);
    const activePoints = curvePoints.filter(p => p.x <= dotX);
    if (activePoints.length === 0 || activePoints[activePoints.length - 1].x < dotX) {
        activePoints.push({ x: dotX, y: dotY });
    }

    // 3. Read User Token Balance
    const { data: userTokenBalanceData, refetch: refetchUserTokenBalance } = useReadContract({
        address: PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address }
    });
    const userTokenBalance = userTokenBalanceData ? Number(formatEther(userTokenBalanceData as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";

    // 4. Read User ETH Balance
    const { data: userEthBalanceData, refetch: refetchUserEthBalance } = useBalance({
        address,
    });
    const userEthBalance = userEthBalanceData ? Number(formatEther(userEthBalanceData.value)).toFixed(4) : "0.0000";

    // 5. Fetch EXACT Cost for Buy
    const estimatedPengoAmount = isEthTop && currentPrice > 0 
        ? Math.floor(Number(inputValue) / currentPrice)
        : (inputValue ? Number(inputValue) : 0);

    const safeAmount = !isNaN(estimatedPengoAmount) && estimatedPengoAmount > 0 ? Math.floor(estimatedPengoAmount) : 0;
    const { data: exactCostData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getCost',
        args: safeAmount > 0 ? [parseEther(safeAmount.toString())] : undefined,
        query: { enabled: safeAmount > 0 && tradeMode === 'buy' }
    });
    const exactCostEth = exactCostData ? formatEther(exactCostData as bigint) : "0";
    
    // 6. Fetch EXACT Value for Sell (returns [returnEth, taxEth])
    const { data: exactSellData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getSellValue',
        args: safeAmount > 0 ? [parseEther(safeAmount.toString())] : undefined,
        query: { enabled: safeAmount > 0 && tradeMode === 'sell' }
    });
    
    const sellReturnEth = exactSellData && Array.isArray(exactSellData) ? formatEther((exactSellData as any)[0]) : "0";
    const sellTaxEth = exactSellData && Array.isArray(exactSellData) ? formatEther((exactSellData as any)[1]) : "0";

    const estimatedEthCost = tradeMode === 'buy' ? exactCostEth : sellReturnEth;

    // 7. Check Token Allowance for Sell
    const tokenAddress = PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`;
    const { data: tokenAllowanceData } = useReadContract({
        address: tokenAddress,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'allowance',
        args: [address, contractAddress],
        query: { enabled: !!address && tradeMode === 'sell' }
    });
    const hasEnoughAllowance = tokenAllowanceData && safeAmount > 0 ? (tokenAllowanceData as bigint) >= parseEther(safeAmount.toString()) : false;

    // 8. Write Contracts (Buy, Sell, Approve)
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchPrice();
            refetchContractBalance();
            refetchUserTokenBalance();
            refetchUserEthBalance();
            setInputValue(""); // Reset input on success
        }
    }, [isConfirmed, refetchPrice, refetchContractBalance, refetchUserTokenBalance, refetchUserEthBalance]);

    const handlePercentage = (percent: number) => {
        if (!isEthTop) {
            const bal = Number(userTokenBalance.replace(/,/g, ''));
            const amount = Math.floor(bal * (percent / 100));
            setInputValue(amount > 0 ? amount.toString() : "");
        } else {
            // Buy mode - calculate based on ETH
            let ethAvailable = Number(userEthBalance);
            // Subtract small gas buffer for 100% to ensure tx doesn't fail
            if (percent === 100) {
                ethAvailable = Math.max(0, ethAvailable - 0.005);
            }
            const targetEth = ethAvailable * (percent / 100);
            setInputValue(targetEth > 0 ? targetEth.toFixed(4).toString() : "");
        }
    };

    const handleBuy = () => {
        if (tradeMode !== 'buy' || !inputValue || isNaN(Number(inputValue)) || currentPrice <= 0 || safeAmount < 1) return;
        if (exactCostEth === "0") return;
        writeContract({
            address: contractAddress,
            abi,
            functionName: 'buy',
            args: [parseEther(safeAmount.toString())],
            value: parseEther(exactCostEth),
        });
    };

    const handleApprove = () => {
        if (tradeMode !== 'sell' || !inputValue || isNaN(Number(inputValue)) || safeAmount < 1) return;
        writeContract({
            address: tokenAddress,
            abi: PengoEcosystem.abis.PengoToken,
            functionName: 'approve',
            args: [contractAddress, parseEther(safeAmount.toString())],
        });
    };

    const handleSell = () => {
        if (tradeMode !== 'sell' || !inputValue || isNaN(Number(inputValue)) || safeAmount < 1) return;
        if (sellReturnEth === "0") return;
        writeContract({
            address: contractAddress,
            abi,
            functionName: 'sell',
            args: [parseEther(safeAmount.toString())],
        });
    };

    return (
        <div className="min-h-screen bg-gradient-mesh">
            <div className="fixed inset-0 grid-pattern pointer-events-none" />
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Transaction Alert */}
            {isConfirmed && hash && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className="bg-neutral-900 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-xl p-4 flex items-center gap-4 max-w-sm">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm">Transaction Successful!</h4>
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-neutral-400 hover:text-emerald-400 truncate block mt-0.5"
                            >
                                View on Explorer
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <AppNavbar />

            <main className="relative pt-24 pb-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            $PENGO <span className="gradient-text">Bonding Curve</span>
                        </h1>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Buy or Sell $PENGO tokens early on the bonding curve. Once the bonding curve hits 10 ETH (partly driven by a 3% sell tax!), liquidity is automatically seeded to Uniswap!
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="animate-pulse bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                                        Live on Sepolia
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-6">Migration Progress</h2>

                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-neutral-400">ETH Raised: {displayEthRaised.toFixed(4)} / {targetLiquidity} ETH</span>
                                    <span className="text-primary-400 font-bold">{progress}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-6 border border-white/10 overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-1000 ease-out relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 h-[400px]">
                                {isMigrated ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Migration Successful!</h3>
                                        <p className="text-neutral-400">
                                            The bonding curve has successfully raised {targetLiquidity} ETH. 
                                            Liquidity has been migrated to Uniswap and trading is now live on the DEX!
                                        </p>
                                        <a href={`https://sepolia.etherscan.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors border border-white/10 mt-2">
                                            View Contract
                                        </a>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col">
                                        <h2 className="text-xl font-bold text-white mb-4">Price Chart (Bonding Curve)</h2>
                                        <div className="flex-1 min-h-0 w-full relative bg-white/5 rounded-lg border border-white/10 p-4 overflow-hidden">
                                            <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                                <path d={`M ${curvePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke="rgba(128, 255, 0, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
                                                <path d={`M ${activePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke="#80ff00ff" strokeWidth="2" />
                                                {activePoints.length > 0 && (
                                                    <path d={`M 0 100 L 0 95 ${activePoints.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${dotX} 100 Z`} fill="url(#chartGradient)" />
                                                )}
                                                <circle cx={dotX} cy={dotY} r="1" fill="#bbff00ff" className="animate-pulse" />
                                            </svg>
                                            <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 -translate-y-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                                Current: {currentPrice > 0 ? currentPrice.toFixed(8) : "0.00000000"} ETH/PENGO
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Trade $PENGO</h2>
                            <div className="space-y-4">
                                <div className="flex bg-neutral-800/80 p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => setTradeMode('buy')}
                                        disabled={isMigrated}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tradeMode === 'buy' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'} ${isMigrated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => setTradeMode('sell')}
                                        disabled={isMigrated}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tradeMode === 'sell' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'} ${isMigrated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Sell (3% Tax)
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-400">You {isEthTop ? (tradeMode === 'buy' ? 'pay' : 'receive') : (tradeMode === 'buy' ? 'receive' : 'pay')}</span>
                                        <span className="text-neutral-400">Balance: {isEthTop ? userEthBalance + " ETH" : userTokenBalance}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
                                            placeholder="0"
                                            disabled={isMigrated}
                                            className="bg-transparent text-2xl text-white outline-none w-full font-mono disabled:opacity-50"
                                        />
                                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                            {isEthTop ? (
                                                <>
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-white">Ξ</span>
                                                    </div>
                                                    <span className="font-medium text-white">ETH</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full" />
                                                    <span className="font-medium text-white">PENGO</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {!isMigrated && (
                                        <div className="flex gap-2 mt-4">
                                            {[10, 25, 50, 100].map((pct) => (
                                                <button
                                                    key={pct}
                                                    onClick={() => handlePercentage(pct)}
                                                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    {pct}%
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center -my-2 relative z-10">
                                    <button 
                                        onClick={() => {
                                            setIsEthTop(!isEthTop);
                                            setInputValue("");
                                        }}
                                        className="bg-neutral-800 border border-white/10 rounded-full p-2 hover:bg-neutral-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-400">You {!isEthTop ? (tradeMode === 'buy' ? 'pay' : 'receive') : (tradeMode === 'buy' ? 'receive' : 'pay')}</span>
                                        <span className="text-neutral-400">Balance: {!isEthTop ? userEthBalance + " ETH" : userTokenBalance}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={isEthTop ? safeAmount : estimatedEthCost}
                                            readOnly
                                            className="bg-transparent text-2xl text-white outline-none w-full font-mono"
                                        />
                                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                            {!isEthTop ? (
                                                <>
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-white">Ξ</span>
                                                    </div>
                                                    <span className="font-medium text-white">ETH</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full" />
                                                    <span className="font-medium text-white">PENGO</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {!isEthTop && tradeMode === 'sell' && sellTaxEth !== "0" && (
                                        <div className="mt-2 text-xs text-red-400/80 flex justify-between">
                                            <span>3% Tax Deducted:</span>
                                            <span>-{Number(sellTaxEth).toFixed(6)} ETH</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="pt-4">
                                    {isMigrated ? (
                                        <button
                                            disabled
                                            className="w-full py-4 rounded-xl font-bold text-neutral-500 bg-neutral-800 border border-neutral-700 cursor-not-allowed transition-all"
                                        >
                                            Trading Live on DEX
                                        </button>
                                    ) : !isConnected ? (
                                        <button
                                            onClick={() => openConnectModal?.()}
                                            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                        >
                                            Connect Wallet to {tradeMode === 'buy' ? 'Buy' : 'Sell'}
                                        </button>
                                    ) : (
                                        tradeMode === 'buy' ? (
                                            <button
                                                onClick={handleBuy}
                                                disabled={isPending || isConfirming || !inputValue || exactCostEth === "0"}
                                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden"
                                            >
                                                {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Processing Transaction...' : 'Buy $PENGO'}
                                            </button>
                                        ) : (
                                            hasEnoughAllowance ? (
                                                <button
                                                    onClick={handleSell}
                                                    disabled={isPending || isConfirming || !inputValue || sellReturnEth === "0" || safeAmount > Number(userTokenBalance.replace(/,/g, ''))}
                                                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)] relative overflow-hidden"
                                                >
                                                    {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Processing Transaction...' : 'Sell $PENGO'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={isPending || isConfirming || !inputValue || safeAmount > Number(userTokenBalance.replace(/,/g, ''))}
                                                    className="w-full py-4 rounded-xl font-bold text-neutral-800 bg-white hover:bg-neutral-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] relative overflow-hidden"
                                                >
                                                    {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Approving...' : 'Approve PENGO'}
                                                </button>
                                            )
                                        )
                                    )}
                                </div>

                                <div className="text-xs text-neutral-500 text-center mt-4">
                                    Price updates on every trade. Max slippage 1%.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
