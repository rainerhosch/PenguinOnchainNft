'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import PengoEcosystem from '../../constants/PengoEcosystem.json';
import UniswapRouterAbi from '../../constants/UniswapRouterAbi.json';
import { useConnectModal } from "@rainbow-me/rainbowkit";

// WETH used by the V2 Clone Router on Sepolia
const WETH_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const ROUTER_ADDRESS = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008" as `0x${string}`;
const PENGO_ADDRESS = PengoEcosystem.addresses.sepolia.PengoToken as `0x${string}`;
const BONDING_CURVE_ADDRESS = PengoEcosystem.addresses.sepolia.PengoBondingCurve as `0x${string}`;

export default function SwapPage() {
    const [inputValue, setInputValue] = useState("");
    const [isEthTop, setIsEthTop] = useState(true);
    const [isClient, setIsClient] = useState(false);
    
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // 1. Read User Balances
    const { data: userTokenBalanceData, refetch: refetchUserTokenBalance } = useReadContract({
        address: PENGO_ADDRESS,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address }
    });
    const userTokenBalance = userTokenBalanceData ? Number(formatEther(userTokenBalanceData as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";
    const rawUserTokenBalance = userTokenBalanceData ? (userTokenBalanceData as bigint) : BigInt(0);

    const { data: userEthBalanceData, refetch: refetchUserEthBalance } = useBalance({
        address,
    });
    const userEthBalance = userEthBalanceData ? Number(formatEther(userEthBalanceData.value)).toFixed(4) : "0.0000";

    // Read Bonding Curve Migration Status
    const { data: isMigratedData } = useReadContract({
        address: BONDING_CURVE_ADDRESS,
        abi: PengoEcosystem.abis.PengoBondingCurve,
        functionName: 'isMigrated',
    });
    const isMigrated = isMigratedData as boolean;

    // 2. Fetch Quotes (getAmountsOut)
    const inputAmountParsed = inputValue && !isNaN(Number(inputValue)) && Number(inputValue) > 0 ? parseEther(inputValue.toString()) : BigInt(0);
    const path = isEthTop ? [WETH_ADDRESS, PENGO_ADDRESS] : [PENGO_ADDRESS, WETH_ADDRESS];
    
    const { data: amountsOutData } = useReadContract({
        address: ROUTER_ADDRESS,
        abi: UniswapRouterAbi,
        functionName: 'getAmountsOut',
        args: [inputAmountParsed, path],
        query: { enabled: inputAmountParsed > BigInt(0) }
    });

    const expectedOutput = amountsOutData && Array.isArray(amountsOutData) ? (amountsOutData as any)[1] : BigInt(0);
    const outputValueFormatted = expectedOutput > BigInt(0) ? formatEther(expectedOutput) : "";
    
    // Calculate amountOutMin with 1% slippage
    const amountOutMin = expectedOutput > BigInt(0) ? (expectedOutput * BigInt(99)) / BigInt(100) : BigInt(0);

    // 3. Check Token Allowance (for Selling PENGO)
    const { data: tokenAllowanceData, refetch: refetchAllowance } = useReadContract({
        address: PENGO_ADDRESS,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'allowance',
        args: [address, ROUTER_ADDRESS],
        query: { enabled: !!address && !isEthTop }
    });
    const hasEnoughAllowance = tokenAllowanceData ? (tokenAllowanceData as bigint) >= inputAmountParsed : false;

    // 4. Write Contracts (Swap, Approve)
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchUserTokenBalance();
            refetchUserEthBalance();
            refetchAllowance();
            setInputValue(""); // Reset input on success
        }
    }, [isConfirmed, refetchUserTokenBalance, refetchUserEthBalance, refetchAllowance]);

    const handleSwap = () => {
        if (inputAmountParsed === BigInt(0) || expectedOutput === BigInt(0)) return;
        
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

        if (isEthTop) {
            // Buy PENGO with ETH
            writeContract({
                address: ROUTER_ADDRESS,
                abi: UniswapRouterAbi,
                functionName: 'swapExactETHForTokens',
                args: [amountOutMin, path, address, deadline],
                value: inputAmountParsed
            });
        } else {
            // Sell PENGO for ETH
            writeContract({
                address: ROUTER_ADDRESS,
                abi: UniswapRouterAbi,
                functionName: 'swapExactTokensForETH',
                args: [inputAmountParsed, amountOutMin, path, address, deadline],
            });
        }
    };

    const handleApprove = () => {
        if (inputAmountParsed === BigInt(0)) return;
        writeContract({
            address: PENGO_ADDRESS,
            abi: PengoEcosystem.abis.PengoToken,
            functionName: 'approve',
            args: [ROUTER_ADDRESS, inputAmountParsed],
        });
    };

    const handlePercentage = (percent: number) => {
        if (!isEthTop) {
            // Selling PENGO
            const bal = Number(userTokenBalance.replace(/,/g, ''));
            const amount = Math.floor(bal * (percent / 100));
            setInputValue(amount > 0 ? amount.toString() : "");
        } else {
            // Buying with ETH
            let ethAvailable = Number(userEthBalance);
            if (percent === 100) {
                ethAvailable = Math.max(0, ethAvailable - 0.005); // Gas buffer
            }
            const targetEth = ethAvailable * (percent / 100);
            setInputValue(targetEth > 0 ? targetEth.toFixed(4).toString() : "");
        }
    };

    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-dark-900 selection:bg-primary-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-600/10 blur-[120px]" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            {/* Success Alert */}
            {isConfirmed && (
                <div className="fixed top-24 right-4 z-50 animate-fade-in-up">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-4 flex gap-4 items-start shadow-2xl">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="max-w-md mx-auto mt-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Pengo <span className="gradient-text">Swap</span>
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Trade instantly via our V2 Liquidity Pool
                        </p>
                    </div>

                    {!isMigrated && isMigrated !== undefined ? (
                        <div className="bg-dark-800/80 backdrop-blur-xl rounded-[2rem] p-8 text-center border border-white/10 shadow-2xl mt-4">
                            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">DEX Trading Locked</h2>
                            <p className="text-neutral-400 text-sm mb-6">
                                PENGO is currently in its initial launch phase. It must complete the Bonding Curve before public DEX trading opens.
                            </p>
                            <Link href="/bonding-curve" className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-400 text-primary-950 font-bold rounded-xl transition-all">
                                Go to Bonding Curve
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-dark-800/80 backdrop-blur-xl rounded-[2rem] p-4 relative border border-white/10 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-white font-medium">Swap</span>
                            <span className="text-xs text-neutral-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">Slippage: 1%</span>
                        </div>

                        {/* Input Box */}
                        <div className="bg-dark-900/50 rounded-2xl p-4 hover:border-white/10 transition-colors border border-transparent">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-neutral-400">You Pay</span>
                                <span className="text-neutral-400 font-medium">
                                    {isEthTop ? userEthBalance : userTokenBalance}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
                                    placeholder="0"
                                    className="bg-transparent text-4xl text-white outline-none w-full font-medium placeholder:text-neutral-600"
                                />
                                <div className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 cursor-pointer px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    {isEthTop ? (
                                        <>
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">Ξ</span>
                                            </div>
                                            <span className="font-bold text-white text-lg pr-1">ETH</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full" />
                                            <span className="font-bold text-white text-lg pr-1">PENGO</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                {[25, 50, 75, 100].map((pct) => (
                                    <button
                                        key={pct}
                                        onClick={() => handlePercentage(pct)}
                                        className="py-1 px-3 text-xs font-medium rounded-lg border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all bg-dark-700/50"
                                    >
                                        {pct === 100 ? 'Max' : `${pct}%`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Flip Button */}
                        <div className="flex justify-center -my-3 relative z-10">
                            <button
                                onClick={() => {
                                    setIsEthTop(!isEthTop);
                                    setInputValue("");
                                }}
                                className="w-10 h-10 bg-dark-800 rounded-xl border-4 border-dark-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-dark-700 transition-all group"
                            >
                                <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </button>
                        </div>

                        {/* Output Box */}
                        <div className="bg-dark-900/50 rounded-2xl p-4 hover:border-white/10 transition-colors border border-transparent mb-2 mt-1">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-neutral-400">You Receive</span>
                                <span className="text-neutral-400 font-medium">
                                    {isEthTop ? userTokenBalance : userEthBalance}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <input
                                    type="text"
                                    value={outputValueFormatted ? Number(outputValueFormatted).toFixed(isEthTop ? 2 : 6) : ""}
                                    readOnly
                                    placeholder="0"
                                    className="bg-transparent text-4xl text-white outline-none w-full font-medium placeholder:text-neutral-600 opacity-80"
                                />
                                <div className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 cursor-pointer px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    {!isEthTop ? (
                                        <>
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">Ξ</span>
                                            </div>
                                            <span className="font-bold text-white text-lg pr-1">ETH</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full" />
                                            <span className="font-bold text-white text-lg pr-1">PENGO</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2 mt-2">
                            {!isConnected ? (
                                <button
                                    onClick={() => openConnectModal?.()}
                                    className="w-full py-4 rounded-xl font-bold text-primary-900 bg-primary-400 hover:bg-primary-300 transition-all text-lg"
                                >
                                    Connect Wallet
                                </button>
                            ) : (
                                isEthTop || hasEnoughAllowance ? (
                                    <button
                                        onClick={handleSwap}
                                        disabled={isPending || isConfirming || !inputValue || expectedOutput === BigInt(0) || (isEthTop ? inputAmountParsed > parseEther(userEthBalance) : inputAmountParsed > rawUserTokenBalance)}
                                        className="w-full py-4 rounded-2xl font-bold text-primary-900 bg-gradient-to-r from-primary-400 to-accent-400 hover:from-primary-300 hover:to-accent-300 transition-all disabled:opacity-50 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-400 text-lg relative overflow-hidden"
                                    >
                                        {isPending ? 'Confirming...' : isConfirming ? 'Swapping...' : expectedOutput === BigInt(0) ? 'Enter amount' : (isEthTop && inputAmountParsed > parseEther(userEthBalance)) || (!isEthTop && inputAmountParsed > rawUserTokenBalance) ? 'Insufficient Balance' : 'Swap'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isPending || isConfirming || !inputValue || inputAmountParsed > rawUserTokenBalance}
                                        className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-accent-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:bg-neutral-700 text-lg relative overflow-hidden"
                                    >
                                        {isPending ? 'Confirming...' : isConfirming ? 'Approving...' : inputAmountParsed > rawUserTokenBalance ? 'Insufficient Balance' : 'Approve PENGO'}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
}
