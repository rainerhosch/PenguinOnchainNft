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
import { Toaster } from 'react-hot-toast';
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

    const { data: tokenURI } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [nftData],
    });

    const { data: nftAccData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getNFTDetails",
        args: [nftData],
    });

    const listOfAccessories: Accessory[] = (nftAccData as [Accessory[], SpecialTrait])?.[0] || [];
    const specialTrait: SpecialTrait = (nftAccData as [Accessory[], SpecialTrait])?.[1] || { category: "", networth: "" };

    useEffect(() => {
        setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetchNftData();
    }, [nftData, tokenURI]);

    return (
        <>
            <Toaster position="bottom-right" reverseOrder={true} />
            {loading ? (
                <div className="flex flex-col bg-white/10 p-8 rounded-2xl text-white items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-900"></div>
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
                        <div className="flex flex-col gap-2 bg-white/10 rounded-md text-center py-2">
                            <span className="text-xs font-mono text-white/50">Special trait: {specialTrait.category}</span>
                            <span className="text-xs font-mono text-white/50">Networth : {specialTrait.networth}</span>
                        </div>
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
                    specialTrait={specialTrait}
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
