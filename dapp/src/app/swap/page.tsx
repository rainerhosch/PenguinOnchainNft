'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavBar";
import { useReadContract, useSimulateContract, useWriteContract, useAccount, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther, maxUint256 } from 'viem';
import PengoEcosystem from '../../constants/PengoEcosystem.json';
import UniswapV4QuoterAbi from '../../constants/UniswapV4QuoterAbi.json';
import UniswapPoolSwapTestAbi from '../../constants/UniswapPoolSwapTestAbi.json';
import Permit2Abi from '../../constants/Permit2Abi.json';
import UniversalRouterAbi from '../../constants/UniversalRouterAbi.json';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEthPrice } from '../../hooks/useEthPrice';
import { getAddresses, getV4DexAddresses } from '../../utils/addresses';
import { encodeAbiParameters, parseAbiParameters } from 'viem';



export default function SwapPage() {
    const [inputValue, setInputValue] = useState("");
    const [isEthTop, setIsEthTop] = useState(true);
    const [isClient, setIsClient] = useState(false);
    
    const { address, isConnected, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { POOL_MANAGER, V4_QUOTER, UNIVERSAL_ROUTER, PERMIT2 } = getV4DexAddresses(chainId);
    const addresses = getAddresses(chainId);
    const PENGO_ADDRESS = addresses.PengoToken;
    const BONDING_CURVE_ADDRESS = addresses.PengoBondingCurve;

    // PoolKey must EXACTLY match what PengoBondingCurve used during migration:
    //   currency0 = address(0) = ETH (native), currency1 = PengoToken
    //   fee = 3000, tickSpacing = 60, hooks = address(0)
    const poolKey = {
        currency0: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        currency1: PENGO_ADDRESS,
        fee: 3000,
        tickSpacing: 60,
        hooks: '0x0000000000000000000000000000000000000000' as `0x${string}`
    } as const;

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

    const ethPrice = useEthPrice();
    const ethValueUsd = ethPrice && userEthBalance ? `(~$${(Number(userEthBalance) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "";

    // Read Bonding Curve Migration Status
    const { data: isMigratedData } = useReadContract({
        address: BONDING_CURVE_ADDRESS,
        abi: PengoEcosystem.abis.PengoBondingCurve,
        functionName: 'isMigrated',
    });
    const isMigrated = isMigratedData as boolean;

    // 2. Fetch V4 Quote via quoteExactInputSingle
    //    V4Quoter is nonpayable (uses revert-based simulation).
    //    useSimulateContract calls eth_call which handles revert-return pattern correctly.
    const inputAmountParsed = inputValue && !isNaN(Number(inputValue)) && Number(inputValue) > 0 
        ? parseEther(inputValue.toString()) 
        : BigInt(0);

    const { data: simulateData } = useSimulateContract({
        address: V4_QUOTER,
        abi: UniswapV4QuoterAbi,
        functionName: 'quoteExactInputSingle',
        args: [{
            poolKey,
            zeroForOne: isEthTop,
            exactAmount: inputAmountParsed,
            hookData: '0x' as `0x${string}`
        }],
        query: { enabled: inputAmountParsed > BigInt(0) && isMigrated === true, retry: false }
    });

    // quoteExactInputSingle returns tuple: [amountOut, gasEstimate]
    // simulateData.result contains the decoded return value
    const quoteResult = simulateData?.result as readonly [bigint, bigint] | undefined;
    const expectedOutput = quoteResult ? quoteResult[0] : BigInt(0);
    const outputValueFormatted = expectedOutput > BigInt(0) ? formatEther(expectedOutput) : "";
    
    // Log simulation error to help debug
    const { error: simulateError } = useSimulateContract({
        address: V4_QUOTER,
        abi: UniswapV4QuoterAbi,
        functionName: 'quoteExactInputSingle',
        args: [{
            poolKey,
            zeroForOne: isEthTop,
            exactAmount: inputAmountParsed,
            hookData: '0x' as `0x${string}`
        }],
        query: { enabled: inputAmountParsed > BigInt(0) && isMigrated === true, retry: false }
    });
    
    useEffect(() => {
        if (simulateError) {
            console.error("V4 Quoter Simulation Error:", simulateError);
        }
    }, [simulateError]);

    const swapEthAmount = isEthTop ? Number(inputValue || 0) : Number(outputValueFormatted || 0);
    const swapEthUsd = ethPrice && swapEthAmount > 0 ? `~$${(swapEthAmount * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";

    // 3. Check Token Allowances for Selling PENGO via Universal Router
    const { data: tokenAllowanceData, refetch: refetchAllowance } = useReadContract({
        address: PENGO_ADDRESS,
        abi: PengoEcosystem.abis.PengoToken,
        functionName: 'allowance',
        args: [address, PERMIT2],
        query: { enabled: !!address && !isEthTop }
    });
    const hasErc20Allowance = tokenAllowanceData ? (tokenAllowanceData as bigint) >= inputAmountParsed : false;

    const { data: permit2AllowanceData, refetch: refetchPermit2Allowance } = useReadContract({
        address: PERMIT2,
        abi: Permit2Abi,
        functionName: 'allowance',
        args: [address, PENGO_ADDRESS, UNIVERSAL_ROUTER],
        query: { enabled: !!address && !isEthTop }
    });
    
    const permit2Amount = permit2AllowanceData ? (permit2AllowanceData as any)[0] as bigint : BigInt(0);
    const permit2Expiration = permit2AllowanceData ? (permit2AllowanceData as any)[1] as number : 0;
    const hasPermit2Allowance = permit2Amount >= inputAmountParsed && permit2Expiration > Math.floor(Date.now() / 1000);

    // 4. Write Contracts (Swap, Approve)
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchUserTokenBalance();
            refetchUserEthBalance();
            refetchAllowance();
            refetchPermit2Allowance();
            setInputValue(""); // Reset input on success
        }
    }, [isConfirmed, refetchUserTokenBalance, refetchUserEthBalance, refetchAllowance, refetchPermit2Allowance]);

    const handleSwap = () => {
        if (inputAmountParsed === BigInt(0) || expectedOutput === BigInt(0)) return;

        // UniversalRouter V4_SWAP encoding:
        // commands = 0x10 (V4_SWAP)
        // inputs[0] = abi.encode(bytes actions, bytes[] params)
        //   actions: packed bytes of:
        //     0x06 = SWAP_EXACT_IN_SINGLE
        //     0x0c = SETTLE_ALL (pay input token to PoolManager)
        //     0x0f = TAKE_ALL  (receive output token from PoolManager)

        const SWAP_EXACT_IN_SINGLE = 0x06;
        const SETTLE_ALL = 0x0c;
        const TAKE_ALL = 0x0f;

        // Pack actions as bytes
        const actions = `0x${SWAP_EXACT_IN_SINGLE.toString(16).padStart(2,'0')}${SETTLE_ALL.toString(16).padStart(2,'0')}${TAKE_ALL.toString(16).padStart(2,'0')}` as `0x${string}`;

        // Determine currencies for SETTLE_ALL and TAKE_ALL
        const currencyIn  = isEthTop ? '0x0000000000000000000000000000000000000000' as `0x${string}` : PENGO_ADDRESS;
        const currencyOut = isEthTop ? PENGO_ADDRESS : '0x0000000000000000000000000000000000000000' as `0x${string}`;

        // param0: ExactInputSingleParams
        const param0 = encodeAbiParameters(
            [{ type: 'tuple', components: [
                { type: 'tuple', name: 'poolKey', components: [
                    { type: 'address', name: 'currency0' },
                    { type: 'address', name: 'currency1' },
                    { type: 'uint24',  name: 'fee' },
                    { type: 'int24',   name: 'tickSpacing' },
                    { type: 'address', name: 'hooks' }
                ]},
                { type: 'bool',    name: 'zeroForOne' },
                { type: 'uint128', name: 'amountIn' },
                { type: 'uint128', name: 'amountOutMinimum' },
                { type: 'bytes',   name: 'hookData' }
            ]}],
            [{
                poolKey: {
                    currency0: poolKey.currency0,
                    currency1: poolKey.currency1,
                    fee: poolKey.fee,
                    tickSpacing: poolKey.tickSpacing,
                    hooks: poolKey.hooks
                },
                zeroForOne: isEthTop,
                amountIn: inputAmountParsed,
                amountOutMinimum: BigInt(0),
                hookData: '0x'
            }]
        );

        // param1: SETTLE_ALL — (Currency currency, uint256 maxAmount)
        const param1 = encodeAbiParameters(
            [{ type: 'address' }, { type: 'uint256' }],
            [currencyIn, inputAmountParsed]
        );

        // param2: TAKE_ALL — (Currency currency, uint256 minAmount)
        const param2 = encodeAbiParameters(
            [{ type: 'address' }, { type: 'uint256' }],
            [currencyOut, BigInt(0)]
        );

        // Encode the full V4_SWAP input
        const v4SwapInput = encodeAbiParameters(
            [{ type: 'bytes' }, { type: 'bytes[]' }],
            [actions, [param0, param1, param2]]
        );

        writeContract({
            address: UNIVERSAL_ROUTER,
            abi: UniversalRouterAbi,
            functionName: 'execute',
            args: [
                '0x10' as `0x${string}`,
                [v4SwapInput]
            ],
            value: isEthTop ? inputAmountParsed : BigInt(0)
        });
    };

    const handleApprove = () => {
        if (inputAmountParsed === BigInt(0)) return;
        
        if (!hasErc20Allowance) {
            writeContract({
                address: PENGO_ADDRESS,
                abi: PengoEcosystem.abis.PengoToken,
                functionName: 'approve',
                args: [PERMIT2, maxUint256],
            });
        } else if (!hasPermit2Allowance) {
            const maxUint160 = BigInt("1461501637330902918203684832716283019655932542975");
            writeContract({
                address: PERMIT2,
                abi: Permit2Abi,
                functionName: 'approve',
                args: [PENGO_ADDRESS, UNIVERSAL_ROUTER, maxUint160, Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30],
            });
        }
    };

    const handlePercentage = (percent: number) => {
        if (!isEthTop) {
            // Selling PENGO
            if (percent === 100) {
                setInputValue(formatEther(rawUserTokenBalance));
            } else {
                const amount = (rawUserTokenBalance * BigInt(percent)) / BigInt(100);
                setInputValue(formatEther(amount));
            }
        } else {
            // Buying with ETH
            if (percent === 100) {
                const gasBuffer = parseEther("0.005");
                let amount = userEthBalanceData ? userEthBalanceData.value : BigInt(0);
                amount = amount > gasBuffer ? amount - gasBuffer : BigInt(0);
                setInputValue(formatEther(amount));
            } else {
                let amount = userEthBalanceData ? userEthBalanceData.value : BigInt(0);
                amount = (amount * BigInt(percent)) / BigInt(100);
                setInputValue(formatEther(amount));
            }
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
                            Trade instantly via Uniswap V4 Liquidity Pool
                        </p>
                    </div>

                    {isMigrated === undefined ? (
                        <div className="flex justify-center mt-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : isMigrated === false ? (
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
                                    {isEthTop ? `${userEthBalance} ETH ${ethValueUsd}` : userTokenBalance}
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
                            {isEthTop && swapEthUsd && (
                                <div className="text-xs text-neutral-500 mt-2 ml-1">{swapEthUsd}</div>
                            )}
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
                                    {isEthTop ? userTokenBalance : `${userEthBalance} ETH ${ethValueUsd}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <input
                                    type="text"
                                    value={outputValueFormatted ? (isEthTop ? Number(outputValueFormatted).toFixed(2) : outputValueFormatted) : ""}
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
                            {!isEthTop && swapEthUsd && (
                                <div className="text-xs text-neutral-500 mt-2 ml-1">{swapEthUsd}</div>
                            )}
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
                                isEthTop || (hasErc20Allowance && hasPermit2Allowance) ? (
                                    <button
                                        onClick={handleSwap}
                                        disabled={isPending || isConfirming || !inputValue || expectedOutput === BigInt(0) || (isEthTop ? inputAmountParsed > parseEther(userEthBalance) : inputAmountParsed > rawUserTokenBalance)}
                                        className="w-full py-4 rounded-2xl font-bold text-primary-900 bg-gradient-to-r from-primary-400 to-accent-400 hover:from-primary-300 hover:to-accent-300 transition-all disabled:opacity-50 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-400 text-lg relative overflow-hidden"
                                    >
                                        {isPending ? 'Confirming...' : isConfirming ? 'Swapping...' : inputAmountParsed === BigInt(0) ? 'Enter amount' : expectedOutput === BigInt(0) ? 'Insufficient Liquidity / High Impact' : (isEthTop && inputAmountParsed > parseEther(userEthBalance)) || (!isEthTop && inputAmountParsed > rawUserTokenBalance) ? 'Insufficient Balance' : 'Swap'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isPending || isConfirming || !inputValue || inputAmountParsed > rawUserTokenBalance}
                                        className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-accent-500 to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:bg-neutral-700 text-lg relative overflow-hidden"
                                    >
                                        {isPending ? 'Confirming...' : isConfirming ? 'Approving...' : inputAmountParsed > rawUserTokenBalance ? 'Insufficient Balance' : !hasErc20Allowance ? 'Approve PENGO (1/2)' : 'Approve Router (2/2)'}
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
