"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Abi,
    Address
} from "viem";
import {
    useAccount,
    useReadContract,
    type BaseError
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import AccessoryModal from "./AccessoryModal";
import SellAccessoryModal from "./SellAccessoryModal";

interface NftCardProps {
    nftData: number;
}

type Accessory = {
    accessoryId: number;
    trait_name: string;
    trait_type: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: string;
    sellingPrice: bigint;
};

type SpecialTrait = {
    category: string;
    networth: string;
};

const NftCard: React.FC<NftCardProps> = ({ nftData }) => {
    const { chain } = useAccount();
    const [nfts, setNfts] = useState<{ id: number; name: string; image: string; traits: unknown }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSellAccessoryModal, setShowSellAccessoryModal] = useState(false);
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[1];

    const abi = networkContract?.abi as Abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: tokenURI, isLoading: isLoadingTokenURI } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [nftData],
    });

    const { data: nftAccData, isLoading: isLoadingNftAcc } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getNFTDetails",
        args: [nftData],
    });

    const listOfAccessories: Accessory[] = (nftAccData as [Accessory[], SpecialTrait])?.[0] || [];
    const specialTrait: SpecialTrait = (nftAccData as [Accessory[], SpecialTrait])?.[1] || { category: "", networth: "" };

    useEffect(() => {
        setLoading(true); // Set loading ke true sebelum mulai fetch data
        const fetchNftData = async () => {
            try {
                if (!tokenURI) return;

                const base64Data = (tokenURI as string).split(",")[1];
                const metadata = JSON.parse(atob(base64Data));

                setNfts([{
                    id: nftData,
                    name: metadata.name,
                    image: metadata.image,
                    traits: metadata.traits
                }]);
            } catch (error) {
                console.error("Error fetching NFTs:", (error as BaseError).shortMessage);
            }
        };

        fetchNftData();
        // console.log(tokenURI)
        // console.log(nftData)
    }, [nftData, tokenURI]);

    // Gunakan useEffect untuk menangani perubahan loading berdasarkan isLoading dari wagmi hooks
    useEffect(() => {
        if (!isLoadingTokenURI && !isLoadingNftAcc) {
            setLoading(false);
        }
    }, [isLoadingTokenURI, isLoadingNftAcc]);

    return (
        <>
            {loading ? (
                <div className="flex flex-col bg-white/10 p-2 rounded-2xl text-white items-center">
                    <div className="h-36 w-36 bg-gray-500 rounded-2xl animate-pulse"></div>
                    <div className="mt-4 h-4 w-3/4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="mt-2 h-4 w-3/4 bg-gray-600 rounded animate-pulse"></div>
                </div>
            ) : (
                nfts.map((nft) => (
                    <div key={nft.id} className="flex flex-col bg-white/10 p-2 rounded-2xl text-white items-center">
                        <Image
                            className="bg-black/20 rounded-md"
                            src={nft.image}
                            alt={nft.name}
                            width={200}
                            height={200}
                        />
                        <h3 className="text-purple-950 text-sm font-mono my-1">{nft.name}</h3>
                        {specialTrait.category != "" && <div className="flex flex-col gap-2 bg-white/10 rounded-md text-center py-2 px-2">
                            <span className="text-xs font-mono text-purple-950/70">{specialTrait.category}</span>
                            <span className="text-xs font-mono text-purple-950/70">Networth : {specialTrait.networth}</span>
                        </div>}
                        {listOfAccessories.length > 0 ? (
                            <button onClick={() => setShowModal(true)} className="text-xs font-mono border border-white py-1 px-2 bg-purple-900 rounded-sm hover:bg-black/30 my-2">
                                View Trait
                            </button>
                        ) : (
                            <p className="text-xs font-mono text-white/20 border border-white/60 py-1 px-2 rounded-sm bg-purple-950/50 my-2">No accessories</p>
                        )}
                    </div>
                ))
            )}

            {showModal && (
                <AccessoryModal
                    accessories={listOfAccessories}
                    setSelectedAccessory={setSelectedAccessory}
                    setShowModal={setShowModal}
                    setShowSellAccessoryModal={setShowSellAccessoryModal}
                />
            )}

            {showSellAccessoryModal && selectedAccessory && (
                <SellAccessoryModal
                    accessory={selectedAccessory}
                    nftId={nftData}
                    setShowSellAccessoryModal={setShowSellAccessoryModal}
                />
            )}
        </>
    );
};

export default NftCard;
