'use client'
import React, { useState } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import PengoEcosystem from '../../constants/PengoEcosystem.json';

const contractAddress = PengoEcosystem.addresses.sepolia.PengoBondingCurve as `0x${string}`;
const abi = PengoEcosystem.abis.PengoBondingCurve;

// Mock Candlestick Data (x, open, close, high, low mapped to 0-100 SVG coords where 100 is bottom)
const candleData = [
    { x: 10, open: 90, close: 85, high: 80, low: 95 },
    { x: 25, open: 85, close: 70, high: 65, low: 88 },
    { x: 40, open: 70, close: 75, high: 65, low: 78 },
    { x: 55, open: 75, close: 50, high: 45, low: 80 },
    { x: 70, open: 50, close: 30, high: 25, low: 55 },
    { x: 85, open: 30, close: 40, high: 25, low: 45 },
];

export default function BondingCurvePage() {
    const [buyAmount, setBuyAmount] = useState<string>("");
    const { address } = useAccount();

    // 1. Read Current Price from Contract
    const { data: currentPriceData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getCurrentPrice',
    });
    const currentPrice = currentPriceData ? Number(formatEther(currentPriceData as bigint)) : 0;

    // 2. Read ETH Raised (Contract Balance)
    const { data: contractBalanceData } = useBalance({
        address: contractAddress,
    });
    const ethRaised = contractBalanceData ? Number(formatEther(contractBalanceData.value)) : 0;
    const targetLiquidity = 25; // 25 ETH
    const progress = Math.min((ethRaised / targetLiquidity) * 100, 100).toFixed(2);

    // 3. Read User Token Balance
    const { data: userTokenBalanceData } = useReadContract({
        address: PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address }
    });
    const userTokenBalance = userTokenBalanceData ? Number(formatEther(userTokenBalanceData as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";

    // 4. Read User ETH Balance
    const { data: userEthBalanceData } = useBalance({
        address,
    });
    const userEthBalance = userEthBalanceData ? Number(formatEther(userEthBalanceData.value)).toFixed(4) : "0.0000";

    // 5. Write Contract (Buy Tokens)
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const handleBuy = () => {
        if (!buyAmount || isNaN(Number(buyAmount)) || currentPrice <= 0) return;
        
        // Contract buy(uint256 amount) expects amount in PENGO tokens.
        const pengoAmount = (parseFloat(buyAmount) / currentPrice).toFixed(18); // format properly
        
        writeContract({
            address: contractAddress,
            abi,
            functionName: 'buy',
            args: [parseEther(pengoAmount)],
            value: parseEther(buyAmount),
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
                            $PENGO <span className="gradient-text">Bonding Curve</span>
                        </h1>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Buy $PENGO tokens early on the bonding curve. Once the bonding curve hits 25 ETH, liquidity is automatically seeded to Uniswap!
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Progress & Chart */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Progress Card */}
                            <div className="glass-card p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="animate-pulse bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                                        Live on Sepolia
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-6">Migration Progress</h2>
                                
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-neutral-400">ETH Raised: {ethRaised.toFixed(4)} / {targetLiquidity} ETH</span>
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
                                <p className="text-sm text-neutral-500 mt-4 text-center">
                                    When the bar reaches 100%, trading on the AMM halts and all liquidity + remaining supply migrates to Uniswap.
                                </p>
                            </div>

                            {/* Chart Card (Simulated SVG) */}
                            <div className="glass-card p-6 h-80 flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-4">Price Chart (Simulated Candlesticks)</h2>
                                <div className="flex-1 w-full relative bg-white/5 rounded-lg border border-white/10 p-4 flex items-end">
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {/* Grid lines */}
                                        <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                        <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                        
                                        {/* Candlesticks */}
                                        {candleData.map((candle, idx) => {
                                            const isGreen = candle.close < candle.open; // Note: Y axis is inverted (0 is top, 100 is bottom)
                                            const color = isGreen ? '#10b981' : '#ef4444';
                                            const bodyTop = Math.min(candle.open, candle.close);
                                            const bodyHeight = Math.abs(candle.close - candle.open);
                                            
                                            return (
                                                <g key={idx}>
                                                    {/* Wick */}
                                                    <line x1={candle.x} y1={candle.high} x2={candle.x} y2={candle.low} stroke={color} strokeWidth="0.5" />
                                                    {/* Body */}
                                                    <rect 
                                                        x={candle.x - 2} 
                                                        y={bodyTop} 
                                                        width="4" 
                                                        height={Math.max(bodyHeight, 0.5)} 
                                                        fill={color} 
                                                        rx="0.5"
                                                    />
                                                </g>
                                            );
                                        })}

                                        {/* Exponential Background Curve */}
                                        <path 
                                            d="M 0 100 Q 40 95 90 20 L 90 100 Z" 
                                            fill="url(#chartGradient)" 
                                        />
                                        
                                        {/* Current Price Dot mapped to end of last candle */}
                                        <circle cx="85" cy="40" r="1.5" fill="#10b981" className="animate-pulse" />
                                    </svg>
                                    
                                    {/* Tooltip for Current Price */}
                                    <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 -translate-y-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                        Current: {currentPrice > 0 ? currentPrice.toFixed(8) : "0.00000000"} ETH
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Buy Panel */}
                        <div className="glass-card p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Trade $PENGO</h2>
                            
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-400">You pay</span>
                                        <span className="text-neutral-400">Balance: {userEthBalance} ETH</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number"
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            placeholder="0.0"
                                            className="bg-transparent text-2xl text-white outline-none w-full font-mono"
                                        />
                                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">Ξ</div>
                                            <span className="font-medium text-white">ETH</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="bg-neutral-800 border border-white/10 rounded-full p-2">
                                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-400">You receive (Est.)</span>
                                        <span className="text-neutral-400">Balance: {userTokenBalance}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="text"
                                            value={buyAmount && currentPrice > 0 ? (parseFloat(buyAmount) / currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
                                            readOnly
                                            className="bg-transparent text-2xl text-white outline-none w-full font-mono"
                                        />
                                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                            <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full" />
                                            <span className="font-medium text-white">PENGO</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        onClick={handleBuy}
                                        disabled={isPending || isConfirming || !buyAmount || ethRaised >= targetLiquidity}
                                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                                    >
                                        {isPending ? "Confirming in Wallet..." : 
                                         isConfirming ? "Processing Transaction..." : 
                                         ethRaised >= targetLiquidity ? "Target Reached!" : "Place Trade"}
                                    </button>
                                </div>
                                
                                {isConfirmed && (
                                    <div className="text-emerald-400 text-sm text-center font-medium mt-2">
                                        Transaction successful!
                                    </div>
                                )}

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
