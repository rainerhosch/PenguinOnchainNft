"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Address
} from "viem";
import {
    useAccount,
    useReadContract,
    type BaseError
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";
import toast, { Toaster } from 'react-hot-toast';
import { parseEther } from "ethers";


interface NftCardProps {
    nftData: number;
}

type Accessory = {
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

    // for selling form
    const [accesoryForSale, setAccesoryForSale] = useState(Number);
    const [nftIdSellingAcc, setNftIdSellingAcc] = useState(Number);
    const [accPrice, setAccPrice] = useState(0);
    const [accessoryType, setAccessoryType] = useState("");
    const [accessoryName, setAccessoryName] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const abi = PengoContract.abi;
    const networkContract = PengoContract.networkDeployment.find(network =>  Number(network.chainId) === chain?.id);
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
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 5 seconds

                const base64Data = (tokenURI as string).split(",")[1];
                const metadata = JSON.parse(atob(base64Data));

                const nftList = [{
                    id: nftData,
                    name: metadata.name,
                    image: metadata.image,
                    traits: metadata.traits
                }];
                setNfts(nftList);
            } catch (error) {
                console.log("Error fetching NFTs:", (error as BaseError).shortMessage);
            } finally {
                setLoading(false);
            }
        };
            fetchNftData();
    }, [nftData, tokenURI]);

    return (
        <>
            <Toaster position="bottom-right" reverseOrder={true} />
            {loading === true ?
                (<div className="flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-900"></div>
                </div>) :
                nfts.map((nft) => (
                    <div
                        key={nft.id}
                        className="flex flex-col bg-white/10 p-2  rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center sm:w-48 justify-center"
                    >
                        <Image
                            className="bg-black/20 rounded-md"
                            src={nft.image}
                            alt={nft.name}
                            width={200}
                            height={200}
                        />
                        <h3 className="text-purple-950 text-sm sm:text-lg font-mono my-1">{nft.name}</h3>
                        {listOfAccessories.length > 0 ? (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 bg-purple-900 rounded-sm hover:bg-black/30 hover:text-white my-2">
                                View Trait
                            </button>
                        ) : (
                            <p className="text-[8px] sm:text-xs font-mono sm:font-light text-white/20 border border-white/60 py-1 px-2 rounded-sm bg-purple-950/50 my-2 disabled:">No accessories</p>
                        )}
                                                        </div>
                ))
                                        }
                                        {
                                            <div className="flex flex-col bg-white/20 p-2 rounded-md">
                                                <div className="flex flex-col justify-center text-xs font-mono">
                                                    <span className="text-center">Special Trait</span>
                                                    <span>Name : {specialTrait.category}</span>
                                                    <span>Networth : {specialTrait?.networth}</span>

                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="mt-4 bg-red-500/60 hover:bg-red-500 text-white py-1 px-2 rounded text-xs font-mono"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
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
}

export default NftCard;
