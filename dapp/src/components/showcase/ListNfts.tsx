
"use client";

import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import NftCard from "@/components/showcase/NftCard";

export default function NftList() {
    const { address } = useAccount();
    const [loading, setLoading] = useState(true);

    const contractAddress = PengoContract.address as Address;
    const abi = PengoContract.abi;

    // Read list of NFT token IDs owned by the user
    const { data: listOfAddress } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });

    useEffect(() => {
        if (listOfAddress !== undefined) {
            setLoading(false);
        }
    }, [listOfAddress]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
            {!loading &&
                (listOfAddress as number[])?.map((index, id) => (
                    <NftCard key={index} nftData={id} />
                ))
            }
        </div>
    );
}