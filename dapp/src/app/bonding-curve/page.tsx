'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useBalance, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther, maxUint256 } from 'viem';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import PengoEcosystem from '../../constants/PengoEcosystem.json';
import { useEthPrice } from '../../hooks/useEthPrice';
import { getAddresses } from '../../utils/addresses';

// Generate full curve points (x from 0 to 100)
const curvePoints = Array.from({ length: 101 }, (_, i) => {
    const x = i;
    // Parabolic curve approximation for UI: starts low, grows exponentially
    // We can use a simpler power function to represent the bonding curve
    const y = Math.pow(x / 10, 2);
    return { progress: x, priceIndex: y };
});

export default function BondingCurvePage() {
    const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
    const [inputValue, setInputValue] = useState<string>("");
    const [isEthTop, setIsEthTop] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { address, isConnected, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();
    const addresses = getAddresses(chainId);
    const contractAddress = addresses.PengoBondingCurve as `0x${string}`;
    const abi = PengoEcosystem.abis.PengoBondingCurve;

    // Slippage States
    const [slippageMode, setSlippageMode] = useState<"auto" | number>("auto");
    const [showSettings, setShowSettings] = useState(false);
    const [customSlippage, setCustomSlippage] = useState("");

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 1. Read Current Price from Contract (Cost of 1 token)
    const { data: currentPriceData, refetch: refetchPrice } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getCost',
        args: [parseEther("1")],
        query: { refetchInterval: 3000 }
    });
    const currentPrice = currentPriceData && Array.isArray(currentPriceData) ? Number(formatEther((currentPriceData as any)[0])) : 0;

    // 2. Fetch contract balance (ETH Raised) and Target Liquidity
    const { data: contractBalanceData, refetch: refetchContractBalance } = useBalance({
        address: contractAddress,
        query: { refetchInterval: 3000 }
    });
    const ethRaised = contractBalanceData ? Number(formatEther(contractBalanceData.value)) : 0;
    
    const { data: targetLiquidityData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'TARGET_LIQUIDITY',
        query: { refetchInterval: 60000 }
    });
    const targetLiquidity = targetLiquidityData ? Number(formatEther(targetLiquidityData as bigint)) : 25;
    
    // Check if already migrated
    const { data: isMigratedData, refetch: refetchIsMigrated } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'isMigrated',
        query: { refetchInterval: 3000 }
    });
    const isMigrated = isMigratedData ? Boolean(isMigratedData) : false;

    // Fetch Curve Parameters for Math Estimation
    const { data: basePriceData } = useReadContract({ address: contractAddress, abi, functionName: 'basePrice', query: { refetchInterval: 60000 } });
    const { data: priceIncData } = useReadContract({ address: contractAddress, abi, functionName: 'priceIncrement', query: { refetchInterval: 60000 } });
    const { data: tokensSoldData, refetch: refetchTokensSold } = useReadContract({ address: contractAddress, abi, functionName: 'tokensSold', query: { refetchInterval: 3000 } });
    
    const basePriceNum = basePriceData ? Number(formatEther(basePriceData as bigint)) : 0;
    const priceIncNum = priceIncData ? Number(formatEther(priceIncData as bigint)) : 0;
    const soldNum = tokensSoldData ? Number(formatEther(tokensSoldData as bigint)) : 0;

    // If migrated, ethRaised is mathematically equal to targetLiquidity
    const displayEthRaised = isMigrated ? targetLiquidity : ethRaised;
    const progress = isMigrated ? "100.00" : Math.min((displayEthRaised / (targetLiquidity > 0 ? targetLiquidity : 1)) * 100, 100).toFixed(2);

    // Dynamic chart calculations based on progress
    const dotX = Number(progress);
    
    // Create actual active chart data
    const chartData = curvePoints.map(point => ({
        ...point,
        activeArea: point.progress <= dotX ? point.priceIndex : null
    }));

    // 3. Read User Token Balance
    const { data: userTokenBalanceData, refetch: refetchUserTokenBalance } = useReadContract({
        address: addresses.PengoToken as `0x${string}`,
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

    const ethPrice = useEthPrice();
    const ethValueUsd = ethPrice && userEthBalance ? `(~$${(Number(userEthBalance) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "";

    // 5. Fetch EXACT Cost for Buy
    let estimatedPengoAmount = 0;
    if (isEthTop && inputValue && !isNaN(Number(inputValue))) {
        const ethAmount = Number(inputValue);
        if (ethAmount > 0 && priceIncNum > 0) {
            if (tradeMode === 'buy') {
                const costEth = ethAmount / 1.01; // deduct 1% tax
                const A = priceIncNum;
                const B = 2 * (basePriceNum + soldNum * priceIncNum) - priceIncNum;
                const C = -2 * costEth;
                const discriminant = B * B - 4 * A * C;
                if (discriminant >= 0) {
                    estimatedPengoAmount = Math.floor((-B + Math.sqrt(discriminant)) / (2 * A));
                }
            } else {
                // Sell mode: User wants to receive `ethAmount` ETH. We must calculate how many PENGO they need to sell.
                const receiveEth = ethAmount / 0.99; // add 1% tax back to get gross eth value
                const A = priceIncNum;
                const B = priceIncNum - 2 * basePriceNum - 2 * soldNum * priceIncNum;
                const C = 2 * receiveEth;
                const discriminant = B * B - 4 * A * C;
                if (discriminant >= 0) {
                    estimatedPengoAmount = Math.floor((-B - Math.sqrt(discriminant)) / (2 * A));
                }
            }
        }
    } else {
        estimatedPengoAmount = inputValue ? Number(inputValue) : 0;
    }

    // Clamp estimation to not exceed available tokens for sale (800M max)
    const tokensRemaining = 800_000_000 - soldNum;
    if (estimatedPengoAmount > tokensRemaining && tradeMode === 'buy') {
        estimatedPengoAmount = tokensRemaining;
    }

    const safeAmount = !isNaN(estimatedPengoAmount) && estimatedPengoAmount > 0 ? Math.floor(estimatedPengoAmount) : 0;
    const { data: exactCostData, refetch: refetchExactCost } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getCost',
        args: safeAmount > 0 ? [parseEther(safeAmount.toString())] : undefined,
        query: { enabled: safeAmount > 0 && tradeMode === 'buy', refetchInterval: 3000 }
    });
    const exactCostEth = exactCostData && Array.isArray(exactCostData) ? formatEther((exactCostData as any)[0]) : "0";
    const exactCostTaxEth = exactCostData && Array.isArray(exactCostData) ? formatEther((exactCostData as any)[1]) : "0";
    
    // 6. Fetch EXACT Value for Sell (returns [returnEth, taxEth])
    const { data: exactSellData, refetch: refetchExactSell } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'getSellValue',
        args: safeAmount > 0 ? [parseEther(safeAmount.toString())] : undefined,
        query: { enabled: safeAmount > 0 && tradeMode === 'sell', refetchInterval: 3000 }
    });
    
    const sellReturnEth = exactSellData && Array.isArray(exactSellData) ? formatEther((exactSellData as any)[0]) : "0";
    const sellTaxEth = exactSellData && Array.isArray(exactSellData) ? formatEther((exactSellData as any)[1]) : "0";

    const estimatedEthCost = tradeMode === 'buy' ? exactCostEth : sellReturnEth;

    const currentEthAmount = isEthTop ? Number(inputValue || 0) : Number(estimatedEthCost || 0);
    const currentEthUsd = ethPrice && currentEthAmount > 0 ? `~$${(currentEthAmount * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";

    const marketCapEth = currentPrice * 1_000_000_000;
    const marketCapUsd = ethPrice ? marketCapEth * ethPrice : null;

    // 7. Check Token Allowance for Sell
    const tokenAddress = addresses.PengoToken as `0x${string}`;
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

    // 9. WebSockets Event Listeners for Instant UI Updates (Pump.fun style)
    const onTradeEvent = () => {
        refetchPrice();
        refetchContractBalance();
        refetchTokensSold();
        refetchIsMigrated();
        refetchExactCost();
        refetchExactSell();
    };

    useWatchContractEvent({
        address: contractAddress,
        abi,
        eventName: 'TokensPurchased',
        onLogs: onTradeEvent,
    });

    useWatchContractEvent({
        address: contractAddress,
        abi,
        eventName: 'TokensSold',
        onLogs: onTradeEvent,
    });

    useEffect(() => {
        if (isConfirmed) {
            refetchPrice();
            refetchContractBalance();
            refetchUserTokenBalance();
            refetchUserEthBalance();
            refetchTokensSold();
            refetchIsMigrated();
            refetchExactCost();
            refetchExactSell();
            setInputValue(""); // Reset input on success
        }
    }, [isConfirmed, refetchPrice, refetchContractBalance, refetchUserTokenBalance, refetchUserEthBalance, refetchTokensSold, refetchIsMigrated, refetchExactCost, refetchExactSell]);

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

    // Calculate effective slippage
    let effectiveSlippage = 1;
    if (slippageMode === 'auto') {
        const prog = Number(progress);
        if (prog < 50) effectiveSlippage = 1;
        else if (prog < 80) effectiveSlippage = 2.5;
        else if (prog < 95) effectiveSlippage = 5;
        else effectiveSlippage = 10;
    } else {
        effectiveSlippage = slippageMode;
    }

    const handleBuy = () => {
        if (tradeMode !== 'buy' || !inputValue || isNaN(Number(inputValue)) || currentPrice <= 0 || safeAmount < 1) return;
        if (exactCostEth === "0") return;
        
        // Smart Slippage Logic
        // The contract will automatically refund any excess ETH!
        const slippageMultiplier = 1 + (effectiveSlippage / 100);
        const slippageValueEth = (Number(exactCostEth) * slippageMultiplier).toFixed(18);

        writeContract({
            address: contractAddress,
            abi,
            functionName: 'buy',
            args: [parseEther(safeAmount.toString())],
            value: parseEther(slippageValueEth),
        });
    };

    const handleApprove = () => {
        if (tradeMode !== 'sell' || !inputValue || isNaN(Number(inputValue)) || safeAmount < 1) return;
        writeContract({
            address: tokenAddress,
            abi: PengoEcosystem.abis.PengoToken,
            functionName: 'approve',
            args: [contractAddress, maxUint256],
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
                            Buy or Sell $PENGO tokens early on the bonding curve. Once the bonding curve hits 10 ETH (partly driven by a 1% buy/sell tax!), liquidity is automatically seeded to Uniswap!
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
                                
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="text-sm text-neutral-400 mb-1">Current Price</div>
                                        <div className="font-medium text-white">{currentPrice > 0 ? currentPrice.toFixed(8) : "0.00000000"} ETH</div>
                                        {ethPrice && <div className="text-xs text-neutral-500 mt-1">~${(currentPrice * ethPrice).toFixed(6)}</div>}
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="text-sm text-neutral-400 mb-1">Est. Market Cap</div>
                                        <div className="font-medium text-white">{marketCapEth.toLocaleString()} ETH</div>
                                        {marketCapUsd && <div className="text-xs text-neutral-500 mt-1">~${marketCapUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>}
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
                                        <div className="flex-1 min-h-0 w-full relative bg-white/5 rounded-lg border border-white/10 p-4 overflow-hidden flex flex-col">
                                            <div className="text-xs text-neutral-400 mb-2 flex justify-between">
                                                <span>Live Trading Activity</span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="relative flex h-2 w-2">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    WSS Connected
                                                </span>
                                            </div>
                                            <div className="flex-1 w-full relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis 
                                                            dataKey="progress" 
                                                            stroke="rgba(255,255,255,0.1)" 
                                                            tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}}
                                                            tickFormatter={(val) => `${val}%`}
                                                        />
                                                        <YAxis 
                                                            stroke="rgba(255,255,255,0.1)" 
                                                            tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}}
                                                            domain={[0, 'dataMax']}
                                                            hide={true}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                            itemStyle={{ color: '#10b981' }}
                                                            formatter={(value: any) => [``, 'Curve Profile']}
                                                            labelFormatter={(label) => `Progress: ${label}%`}
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="priceIndex" 
                                                            stroke="rgba(255,255,255,0.1)" 
                                                            fill="none" 
                                                            strokeDasharray="4 4"
                                                            activeDot={false}
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="activeArea" 
                                                            stroke="#10b981" 
                                                            strokeWidth={2}
                                                            fillOpacity={1} 
                                                            fill="url(#colorPrice)" 
                                                        />
                                                        {dotX > 0 && (
                                                            <ReferenceDot 
                                                                x={dotX} 
                                                                y={Math.pow(dotX / 10, 2)} 
                                                                r={4} 
                                                                fill="#10b981" 
                                                                stroke="#ffffff" 
                                                                strokeWidth={2} 
                                                            />
                                                        )}
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 -translate-y-full bg-white/10 backdrop-blur-md border border-emerald-500/30 text-white text-xs py-1 px-3 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap">
                                                Current: {currentPrice > 0 ? currentPrice.toFixed(8) : "0.00000000"} ETH
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Trade $PENGO</h2>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowSettings(!showSettings)}
                                        className={`p-2 rounded-lg border transition-colors ${showSettings ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-400 hover:text-white'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    {showSettings && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 z-50 animate-fade-in-up">
                                            <div className="text-sm font-medium text-white mb-3 flex justify-between items-center">
                                                Slippage Tolerance
                                                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3">
                                                <button onClick={() => {setSlippageMode('auto'); setCustomSlippage("");}} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${slippageMode === 'auto' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/10 text-neutral-400 hover:bg-white/5'}`}>Auto</button>
                                                <button onClick={() => {setSlippageMode(1); setCustomSlippage("");}} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${slippageMode === 1 ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/10 text-neutral-400 hover:bg-white/5'}`}>1%</button>
                                                <button onClick={() => {setSlippageMode(5); setCustomSlippage("");}} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${slippageMode === 5 ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/10 text-neutral-400 hover:bg-white/5'}`}>5%</button>
                                                <button onClick={() => {setSlippageMode(10); setCustomSlippage("");}} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${slippageMode === 10 ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/10 text-neutral-400 hover:bg-white/5'}`}>10%</button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Custom" 
                                                    value={customSlippage}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        setCustomSlippage(val);
                                                        if (val && !isNaN(Number(val))) setSlippageMode(Number(val));
                                                        else if (val === "") setSlippageMode('auto');
                                                    }}
                                                    className={`w-full bg-black/30 border rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors ${typeof slippageMode === 'number' && slippageMode !== 1 && slippageMode !== 5 && slippageMode !== 10 ? 'border-primary-500' : 'border-white/10 focus:border-white/30'}`}
                                                />
                                                <span className="text-neutral-400 text-sm">%</span>
                                            </div>
                                            {slippageMode === 'auto' && (
                                                <div className="mt-3 text-[10px] text-emerald-400/80 leading-tight">
                                                    Smart Slippage active: Automatically adjusting to {effectiveSlippage}% based on curve progress ({progress}%).
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex bg-neutral-800/80 p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => setTradeMode('buy')}
                                        disabled={isMigrated}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tradeMode === 'buy' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'} ${isMigrated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Buy (1% Tax)
                                    </button>
                                    <button
                                        onClick={() => setTradeMode('sell')}
                                        disabled={isMigrated}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tradeMode === 'sell' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'text-neutral-400 hover:text-white'} ${isMigrated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Sell (1% Tax)
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-neutral-400">You {isEthTop ? (tradeMode === 'buy' ? 'pay' : 'receive') : (tradeMode === 'buy' ? 'receive' : 'pay')}</span>
                                        <span className="text-neutral-400">Balance: {isEthTop ? `${userEthBalance} ETH ${ethValueUsd}` : userTokenBalance}</span>
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
                                    {isEthTop && currentEthUsd && (
                                        <div className="text-xs text-neutral-500 mt-2 ml-1">{currentEthUsd}</div>
                                    )}
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
                                        <span className="text-neutral-400">Balance: {!isEthTop ? `${userEthBalance} ETH ${ethValueUsd}` : userTokenBalance}</span>
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
                                    {!isEthTop && currentEthUsd && (
                                        <div className="text-xs text-neutral-500 mt-2 ml-1">{currentEthUsd}</div>
                                    )}
                                    {!isEthTop && tradeMode === 'sell' && sellTaxEth !== "0" && (
                                        <div className="mt-2 text-xs text-red-400/80 flex justify-between">
                                            <span>1% Tax Deducted:</span>
                                            <span>-{Number(sellTaxEth).toFixed(6)} ETH</span>
                                        </div>
                                    )}
                                    {isEthTop && tradeMode === 'buy' && exactCostTaxEth !== "0" && (
                                        <div className="mt-2 text-xs text-emerald-400/80 flex justify-between">
                                            <span>1% Tax Included:</span>
                                            <span>+{Number(exactCostTaxEth).toFixed(6)} ETH</span>
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
                                    Price updates on every trade. Max slippage {slippageMode === 'auto' ? `Auto (${effectiveSlippage}%)` : `${effectiveSlippage}%`}.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
