"use client";

import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
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
    const [loading, setLoading] = useState(true);
    const [accessoryFS, setAccessoryFS] = useState<Accessory[]>([]);


    const contractAddress = PengoContract.address as Address;
    const abi = PengoContract.abi;

    const { data: AccessoriesForSale } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getAllAccessoriesForSale",
    });

    useEffect(() => {
        if (AccessoriesForSale && Array.isArray(AccessoriesForSale)) {
            setLoading(false);
            setAccessoryFS(AccessoriesForSale);
        }
    }, [AccessoriesForSale]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
            {!loading &&
                accessoryFS.map((item, index) => (
                    <CardItem key={index} accessoryData={item} />
                ))
            }
        </div>
    );
}
