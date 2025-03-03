
"use client";

import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import NftCard from "@/components/showcase/NftCard";

export default function NftList() {
    const { address, chain } = useAccount();
    const [loading, setLoading] = useState(true);
    const [nftListOf, setNftList] = useState<string[]>();
    const [nftNumb, setNftNumb] = useState("");

    const abi = PengoContract.abi;
    const networkContract = PengoContract.networkDeployment.find(network =>  Number(network.chainId) === chain?.id);
    const contractAddress = networkContract?.PengoAddress as Address;

    // Read list of NFT token IDs owned by the user
    const { data: listOf } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });
    
    useEffect(() => {
        const listOfAddress: string[] = (listOf as string[]) || [];
        if (listOfAddress !== undefined || listOfAddress > 0) {
            setLoading(false);
            setNftList(listOfAddress)
            if(listOfAddress.length > 6){
                setNftNumb("6");
            } if(listOfAddress.length > 2){
                setNftNumb("4");
            }else{
                setNftNumb((listOfAddress.length).toString());
            }
        }
    }, [listOf]);
    
    // console.log(nftListOf)
    return (
        <div className={`grid grid-cols-2 md:grid-cols-${nftNumb} lg:grid-cols-${nftNumb} gap-8 max-w-7xl mx-auto justify-items-center`}>
            {!loading &&
                nftListOf?.map((id, index) => (
                    <NftCard key={index} nftData={Number(id)} />
                ))
            }
        </div>
    );
}