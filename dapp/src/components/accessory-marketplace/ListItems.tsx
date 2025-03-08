"use client";
import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
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

export default function ListItems() {
    const { chain } = useAccount();
    const [loading, setLoading] = useState(true);
    const [accessoryFS, setAccessoryFS] = useState<Accessory[]>([]);

    const networkContract = chain?.id !== undefined
    ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
    : PengoContract.networkDeployment[0];

    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: AccessoriesForSale } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getAllAccessoriesForSale",
    });

    const { writeContract } = useWriteContract();

    useEffect(() => {
        if (AccessoriesForSale && Array.isArray(AccessoriesForSale)) {
            setLoading(false);
            setAccessoryFS(AccessoriesForSale);
        }
    }, [AccessoriesForSale]);

    const handlePurchase = (accessoryId: number, fromTokenId: number, toTokenId: number) => {
        writeContract({
            address: contractAddress,
            abi,
            functionName: "purchaseAccessory",
            args: [accessoryId, fromTokenId, toTokenId],
        });
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 max-w-7xl mx-auto`}>
            {!loading &&
                accessoryFS.map((item, index) => (
                    <CardItem key={index} accessoryData={item} accessoryId={index} onPurchase={handlePurchase} />
                ))
            }
        </div>
    );
}
