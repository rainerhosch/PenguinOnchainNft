'use client'
import * as React from 'react';
import { Abi, Address, formatEther } from 'viem';
import Image from "next/image";
import image1 from "@/app/images/pengo-template.svg";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import { toast } from 'react-hot-toast';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PengoContract from "../../constants/PengoContract.json";
import { usePengoContract } from "../../hooks/usePengoContract";
import {
    txToastError,
    txToastPending,
    txToastSuccess,
    txToastWallet,
} from "@/lib/txToast";

export interface MintData {
    maxSupply: string;
    maxMintPerWallet: string;
    totalMinted: string;
}

interface PengosMintComponentProps {
    onDataLoad?: (data: MintData) => void;
}

export default function PengosMintComponent({ onDataLoad }: PengosMintComponentProps) {
    const { address, status, chain } = useAccount();
    const MINT_TX_TOAST = "mint-pengo-tx";

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[0];
    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress;
    const currencySymbols = networkContract?.currency;

    // Use the shared hook for on-chain data
    const {
        maxSupply,
        maxMintPerWallet: mintLimit,
        mintPrice: price,
        totalSupply: totalMinted,
        userBalance: balanceCount,
        isLoading
    } = usePengoContract();

    // Notify parent when data is loaded
    React.useEffect(() => {
        if (!isLoading && onDataLoad) {
            onDataLoad({
                maxSupply: maxSupply?.toString() || '0',
                maxMintPerWallet: mintLimit?.toString() || '0',
                totalMinted: totalMinted?.toString() || '0',
            });
        }
    }, [isLoading, maxSupply, mintLimit, totalMinted, onDataLoad]);

    // State for contract data
    const [totalMint, setTotalMint] = React.useState(1);
    const warnedNetworkRef = React.useRef(false);

    // Warn once when connected on an unsupported chain
    React.useEffect(() => {
        if (status !== "connected" || !chain) {
            warnedNetworkRef.current = false;
            return;
        }
        if (!networkContract && !warnedNetworkRef.current) {
            warnedNetworkRef.current = true;
            toast.error("Please switch to a supported network to mint.", {
                id: "mint-network",
            });
        }
    }, [status, chain, networkContract]);

    // Hook minting transaction
    const {
        data: hash,
        error,
        isPending,
        writeContract,
        reset: resetWrite,
    } = useWriteContract();

    const {
        isSuccess: isConfirmed,
        isLoading: isConfirming,
        isError: isReceiptError,
        error: receiptError,
    } = useWaitForTransactionReceipt({ hash });

    const handledErrorRef = React.useRef<string | null>(null);
    const handledSuccessRef = React.useRef(false);
    const handledHashRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (!error) return;
        const key = error.message;
        if (handledErrorRef.current === key) return;
        handledErrorRef.current = key;
        txToastError(
            MINT_TX_TOAST,
            (error as BaseError).shortMessage || error.message || "Mint failed"
        );
    }, [error]);

    React.useEffect(() => {
        if (!hash) return;
        if (handledHashRef.current === hash) return;
        handledHashRef.current = hash;
        txToastPending(MINT_TX_TOAST, hash, networkContract?.explore);
    }, [hash, networkContract?.explore]);

    React.useEffect(() => {
        if (!isConfirmed || !hash || handledSuccessRef.current) return;
        handledSuccessRef.current = true;
        txToastSuccess(MINT_TX_TOAST, {
            title: "Pengo minted successfully",
            hash,
            explorer: networkContract?.explore,
            reloadMs: 1800,
        });
    }, [isConfirmed, hash, networkContract?.explore]);

    React.useEffect(() => {
        if (!isReceiptError || !receiptError) return;
        txToastError(
            MINT_TX_TOAST,
            (receiptError as BaseError).shortMessage ||
                receiptError.message ||
                "Transaction reverted"
        );
    }, [isReceiptError, receiptError]);

    // Send mint transaction
    async function handleMint(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isPending || isConfirming) return;
        if (!totalMint || totalMint < 1) return;
        if (!networkContract || !contractAddress || !abi) {
            toast.error("Please switch to a supported network to mint.", {
                id: "mint-network",
            });
            return;
        }
        if (Number(balanceCount) + totalMint > Number(mintLimit)) {
            toast.error("Mint limit exceeded for this wallet.", { id: "mint-limit" });
            return;
        }

        handledErrorRef.current = null;
        handledSuccessRef.current = false;
        handledHashRef.current = null;
        resetWrite();

        txToastWallet(MINT_TX_TOAST, "Confirm mint in your wallet…");

        writeContract({
            address: contractAddress as Address,
            abi: abi as Abi,
            functionName: "mintPengo",
            args: [BigInt(totalMint)],
            value: (price ?? BigInt(0)) * BigInt(totalMint),
        });
    }

    return (
        <div className="glass-card p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Penguin Onchain NFT</h2>
                <p className="text-sm text-neutral-400">Mint your unique Pengo today</p>
            </div>

            {/* NFT Preview */}
            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-accent-500/20 to-secondary-500/30 rounded-2xl blur-xl animate-pulse-glow" />
                <div className="relative glass rounded-2xl p-4 h-full flex items-center justify-center">
                    <Image
                        src={image1}
                        alt="Penguin Template"
                        width={180}
                        height={180}
                        priority={true}
                        className="drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Mint Price</p>
                    <p className="text-lg font-bold text-white">
                        {price != null ? formatEther(price) : '0'}
                        <span className="text-primary-400 ml-1">{currencySymbols}</span>
                    </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Your Balance</p>
                    <p className="text-lg font-bold text-white">
                        {balanceCount?.toString() || '0'}
                        <span className="text-accent-400 ml-1">PENGO</span>
                    </p>
                </div>
            </div>

            {/* Mint Form */}
            <form onSubmit={handleMint} className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => setTotalMint((prev) => Math.max(1, prev - 1))}
                        className="w-12 h-12 rounded-xl glass text-white text-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center"
                    >
                        −
                    </button>
                    <div className="w-20 text-center">
                        <span className="text-3xl font-bold gradient-text">{totalMint}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTotalMint((prev) => Math.min(Number(mintLimit) || 10, prev + 1))}
                        className="w-12 h-12 rounded-xl glass text-white text-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center"
                    >
                        +
                    </button>
                </div>

                {/* Total Price */}
                <div className="text-center py-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-neutral-400">Total Price</p>
                    <p className="text-xl font-bold text-white">
                        {formatEther((price ?? BigInt(0)) * BigInt(totalMint))}
                        <span className="text-primary-400 ml-1">{currencySymbols}</span>
                    </p>
                </div>

                {/* Mint Button */}
                {(status === 'disconnected' || status === 'connecting' || address === undefined) ? (
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={isPending || isConfirming}
                        className={`w-full btn-primary py-4 text-lg font-bold ${
                            isPending || isConfirming ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isPending || isConfirming ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isPending ? "Confirm in wallet…" : "Confirming…"}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Mint Pengo
                            </span>
                        )}
                    </button>
                )}

                {/* Remaining Mints */}
                {address ? (
                    <p className="text-center text-xs text-neutral-500">
                        {Number(mintLimit) - Number(balanceCount || 0)} mints remaining for your wallet
                    </p>
                ) : (
                    <p className="text-center text-xs text-neutral-500">
                        Connect wallet to see your remaining mints
                    </p>
                )}
            </form>
        </div>
    );
}