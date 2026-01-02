"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Abi, Address } from "viem";
import { toast } from "react-hot-toast";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import CardItem from "@/components/accessory-marketplace/CardItems";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface Accessory {
    bytePixel: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: Address;
    sellingPrice: bigint;
    trait_name: string;
    trait_type: string;
}

interface AccessoryForSale {
    accessory: Accessory;
    accessoryId: bigint;
    tokenId: bigint;
}

export default function ListItems() {
    const { chain, address, status } = useAccount();
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const [accessoryFS, setAccessoryFS] = useState<AccessoryForSale[]>([]);

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];
    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: AccessoriesForSale } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getAllAccessoriesForSale",
    });

    const { data: hash, error, writeContract } = useWriteContract();
    const {
        isSuccess: isConfirmed,
        isLoading
    } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (AccessoriesForSale && Array.isArray(AccessoriesForSale)) {
            setLoading(false);
            setAccessoryFS(AccessoriesForSale);
        }
    }, [AccessoriesForSale]);

    useEffect(() => {
        if (isPurchasing && isLoading) {
            toast.loading("Processing transaction...", { id: "txn-loading" });
        } else {
            toast.dismiss("txn-loading");
        }
    }, [isLoading, isPurchasing]);

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${(error as BaseError).shortMessage || error.message}`, { id: `purchase-error` });
            setIsPurchasing(false);
        }
    }, [error]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success(`Transaction confirmed!`, { id: `purchase-success` });
            toast.success(
                <p className="text-sm">
                    Transaction Hash:<br />
                    <a
                        href={`${networkContract?.explore}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 underline hover:text-cyan-300"
                    >
                        {`${hash?.slice(0, 6)}...${hash?.slice(-4)}`}
                    </a>
                </p>
            );
            setIsPurchasing(false);
        }
    }, [hash, isConfirmed, networkContract?.explore]);

    const handlePurchase = (accessoryId: number, fromTokenId: number, toTokenId: string, price: bigint) => {
        if (!toTokenId || isNaN(Number(toTokenId))) {
            toast.error(`Please select a target Pengo!`, { id: `invalid-token` });
            return;
        }

        setIsPurchasing(true);
        writeContract({
            address: contractAddress,
            abi: abi as Abi,
            functionName: "purchaseAccessory",
            args: [accessoryId, fromTokenId, Number(toTokenId)],
            value: price,
        });
    };

    const visibleAccessories = useMemo(() => accessoryFS.slice(0, visibleCount), [accessoryFS, visibleCount]);

    // Not connected state
    if (status === 'disconnected' || status === 'connecting' || !address) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                    Connect your wallet to browse and purchase accessories for your Pengo NFTs.
                </p>
                <div className="flex justify-center">
                    <ConnectButton />
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-primary-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <p className="text-neutral-400">Loading accessories...</p>
            </div>
        );
    }

    // Empty state
    if (accessoryFS.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500/20 to-secondary-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Accessories Listed</h3>
                <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                    Be the first to list your custom accessory on the marketplace!
                </p>
                <a href="/studio" className="btn-primary py-2.5 px-6 inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Accessory
                </a>
            </div>
        );
    }

    return (
        <div>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <p className="text-sm text-neutral-400">
                    Showing <span className="text-white font-medium">{visibleAccessories.length}</span> of <span className="text-white font-medium">{accessoryFS.length}</span> items
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {visibleAccessories.map((accessory, index) => (
                    <CardItem
                        key={`${index}`}
                        accessoryData={accessory.accessory}
                        accessoryId={Number(accessory.accessoryId)}
                        tokenId={accessory.tokenId.toString()}
                        onPurchase={handlePurchase}
                    />
                ))}
            </div>

            {/* Load More */}
            {visibleCount < accessoryFS.length && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        className="btn-secondary py-3 px-8 inline-flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Load More ({accessoryFS.length - visibleCount} remaining)
                    </button>
                </div>
            )}
        </div>
    );
}
