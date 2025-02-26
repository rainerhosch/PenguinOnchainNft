"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Address } from "viem";
import {
    // useAccount,
    useReadContract,
    type BaseError
} from "wagmi";
import PengoContract from "../../constants/PengoContract.json";


interface NftCardProps {
    nftData: number;
}
const NftCard: React.FC<NftCardProps> = ({ nftData }) => {
    const [nfts, setNfts] = useState<{ id: number; name: string; image: string; traits: unknown }[]>([]);
    const [loading, setLoading] = useState(true);
    // const { tokenId: id } = nftData; // Destructure tokenId from the object
    // const { address } = useAccount();
    // console.log(nftData)
    // console.log(tokenId)

    const contractAddress = PengoContract.address as Address;
    const abi = PengoContract.abi;

    // Read tokenURIs for each tokenId
    const { data: tokenURI } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [nftData],
    }) || "";
    // console.log(nftData)

    useEffect(() => {
        setLoading(true);
        try {

            if (tokenURI === 'undefined') {
                throw new Error();
            }
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
    }, [nftData, tokenURI]);
    // console.log(nfts)


    return (
        <>
            {loading === true ?
                (<div className="flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
                </div>) :
                nfts.map((nft) => (
                    <div
                        key={nft.id}
                        className="flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white hover:transform hover:scale-105 transition-all items-center"
                    >
                        <Image
                            className="bg-black/20 rounded-md"
                            src={nft.image}
                            alt={nft.name}
                            width={200}
                            height={200}
                            quality={75}
                            priority={false} // {false} | {true}
                        />
                        <h3 className="text-sm sm:text-xl font-bold my-4">{nft.name}</h3>
                        {/* <p>{nft.traits}</p> */}
                        <button className="text-[8px] sm:text-xs font-normal sm:font-light border border-white py-1 px-2 rounded-sm hover:bg-black/30">
                            Sell Accessory
                        </button>
                    </div>
                ))}
        </>
    );
}

export default NftCard;
