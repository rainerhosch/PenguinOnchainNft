"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Abi, Address } from "viem";
import toast, { Toaster } from "react-hot-toast";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    type BaseError,
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import CardItem from "@/components/accessory-marketplace/CardItems";

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
    const { chain } = useAccount();
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5); // Tampilkan 12 item pertama
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

    // Minting Transaction Hook
    const { data: hash, error, writeContract } = useWriteContract();
    const {
        isSuccess: isConfirmed,
        isLoading
    } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (AccessoriesForSale && Array.isArray(AccessoriesForSale)) {
            setLoading(false);
            setAccessoryFS(AccessoriesForSale);
            console.log(AccessoriesForSale)
        }
    }, [AccessoriesForSale]);

    useEffect(() => {
        if (isPurchasing && isLoading) {
            toast.loading("Waiting for confirmation...", { id: "txn-loading", style: { background: 'rgba(140, 0, 255, 0.582)', color: '#fff', fontFamily: 'monospace' } });
        } else {
            toast.dismiss("txn-loading");
        }
    }, [isLoading, isPurchasing]);

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${(error as BaseError).shortMessage || error.message}`, { id: `invalid-token`, style: { background: 'rgba(255, 0, 255, 0.582)', color: '#fff', fontFamily: 'monospace' } });
            setIsPurchasing(false);
        }
    }, [error]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Transaction confirmed!");
            toast.success(
                <p className="text-sm font-mono text-black/30">
                    Transaction Hash:<br />
                    <a
                        href={`${networkContract?.explore}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#60ff00] underline"
                    >
                        {`${hash?.slice(0, 4)}...${hash?.slice(-10)}`}
                    </a>
                </p>
            );
            setIsPurchasing(false);
        }
    }, [hash, isConfirmed, networkContract?.explore]);

    const handlePurchase = (accessoryId: number, fromTokenId: number, toTokenId: string, price: bigint) => {
        if (!toTokenId || isNaN(Number(toTokenId))) {
            toast.error(`Please enter a valid Target Token ID!`, { id: `invalid-token`, style: { background: 'rgba(140, 0, 255, 0.582)', color: '#fff', fontFamily: 'monospace' } });
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

    // Memoize sliced data to optimize performance
    const visibleAccessories = useMemo(() => accessoryFS.slice(0, visibleCount), [accessoryFS, visibleCount]);

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="bottom-right" reverseOrder={true} />

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {!loading &&
                    visibleAccessories.map((accessory, index) => (
                        <CardItem
                            key={`${index}`} // Ensuring unique keys by combining accessoryId with index
                            accessoryData={accessory.accessory}
                            accessoryId={Number(accessory.accessoryId)}
                            tokenId={accessory.tokenId.toString()}
                            onPurchase={handlePurchase}
                        />
                    ))}
            </div>

            {/* Tombol Load More */}
            {visibleCount < accessoryFS.length && (
                <div className="text-center mt-6">
                    <button
                        className="text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 bg-transparent rounded-sm hover:bg-black/30 hover:text-white my-2"
                        onClick={() => setVisibleCount((prev) => prev + 5)}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
