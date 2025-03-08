"use client";

import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import NftCard from "@/components/showcase/NftCard";

export default function NftList() {
    const { address, chain } = useAccount();
    const [loading, setLoading] = useState(true);
    const [nftListOf, setNftList] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(10); // Start with 10 NFT

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];

    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: listOf } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });

    useEffect(() => {
        if (listOf) {
            const listOfAddress: string[] = (listOf as string[]) || [];
            setNftList(listOfAddress);
            setLoading(false);
        }
    }, [listOf]);

    // Count colums with total Nft user
    const nftNumb = Math.min(6, Math.max(2, nftListOf.length > 6 ? 5 : nftListOf.length > 2 ? 4 : nftListOf.length));

    return (
        <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-2 md:grid-cols-${nftNumb} lg:grid-cols-${nftNumb} gap-4 justify-items-center`}>
                {!loading &&
                    nftListOf.slice(0, visibleCount).map((id, index) => (
                        <NftCard key={index} nftData={Number(id)} />
                    ))
                }
            </div>

            {/* Button Load More */}
            {visibleCount < nftListOf.length && (
                <div className="text-center mt-6">
                    <button
                        className="text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 bg-transparent rounded-sm hover:bg-black/30 hover:text-white my-2"
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
