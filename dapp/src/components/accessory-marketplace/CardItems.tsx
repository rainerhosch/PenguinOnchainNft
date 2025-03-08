"use client";
import React, {
    useState,
    useEffect
} from "react";
import {
    useAccount,
    useReadContract
} from "wagmi";
import { Address } from "viem";
import toast from "react-hot-toast";
import PengoContract from "../../constants/PengoContract.json";

interface Accessory {
    bytePixel: string;
    forSale: boolean;
    lastPrice: bigint;
    owner: Address;
    sellingPrice: bigint;
    trait_name: string;
    trait_type: string;
}

type SpecialTrait = {
    category: string;
    networth: string;
};


interface CardItemProps {
    accessoryData: Accessory;
    onPurchase: (accessoryId: number, fromTokenId: number, toTokenId: string, price: bigint) => void;
    accessoryId: number;
    tokenId: string;
}

const parseBytePixel = (bytePixel: string) => {
    const pixels = [];
    const regex = /([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{6})/g;

    let match;
    while ((match = regex.exec(bytePixel)) !== null) {
        const x = parseInt(match[1], 16);
        const y = parseInt(match[2], 16);
        const w = parseInt(match[3], 16);
        const h = parseInt(match[4], 16);
        const color = `#${match[5]}`;

        pixels.push({ x, y, w, h, color });
    }

    return pixels;
};


export default function CardItem({ accessoryData, onPurchase, accessoryId, tokenId }: CardItemProps) {
    const { address, chain } = useAccount();
    const pixels = parseBytePixel(accessoryData.bytePixel);
    const [isYour, setIsYour] = useState(false);
    // const [accOwner, setAccOwner] = useState("");
    const [selectedPengo, setSelectedPengo] = useState("");
    const [loading, setLoading] = useState(true);
    const networkContract = PengoContract.networkDeployment.find(network => Number(network.chainId) === chain?.id);
    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address;

    const { data: listOf } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokensOfOwner",
        args: [address],
    });
    const listOfAddress: string[] = (listOf as string[]) || [];

    const { data: nftAccData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getNFTDetails",
        args: [selectedPengo],
    });
    
    const listOfAccessories: Accessory[] = (nftAccData as [Accessory[], SpecialTrait])?.[0] || [];
    // const specialTrait: SpecialTrait = (nftAccData as [Accessory[], SpecialTrait])?.[1] || { category: "", networth: "" };

    useEffect(() => {
        if(accessoryData.owner === address){
            setIsYour(true);
        }

        // setAccOwner(accessoryData.owner);
        if (listOfAddress !== undefined) {
            setLoading(false);
        }
    }, [accessoryData.owner, address, listOfAddress]);





    const handlePurchase = () => {
        for (let i = 0; i < listOfAccessories.length; i++) {
            if (listOfAccessories[i].trait_type === accessoryData.trait_type) {
                toast.error(`The ${accessoryData.trait_type}, already on pengo #${selectedPengo}`, { id: `invalid-token`, style: { background: 'rgba(255, 0, 191, 0.452)', color: '#fff', fontFamily: 'monospace' } });
                return; // Stop execution if error
            }
        }
        onPurchase(accessoryId, Number(tokenId), selectedPengo, accessoryData.sellingPrice);
    }

    return (
        <div className="border p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-bold">{accessoryData.trait_name}</h2>
            <p className="text-sm text-white/60">{accessoryData.trait_type}</p>

            <svg shapeRendering="crispEdges" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                {pixels.map((pixel, index) => (
                    <rect
                        key={index}
                        x={pixel.x}
                        y={pixel.y}
                        width={pixel.w}
                        height={pixel.h}
                        fill={pixel.color}
                    />
                ))}
            </svg>

            <p className="text-purple-950 font-mono text-sm">
                Price: {Number(accessoryData.sellingPrice) / 1e18} ETH
            </p>
            <select
                hidden={isYour}
                className='text-xs sm:text-sm bg-black/60 font-mono border-purple-500 text-white py-1 px-2 rounded transition duration-200 ease-in-out hover:border-white/30 border hover:bg-purple-500/80 w-40'
                onChange={(e) => setSelectedPengo(e.target.value)}
            >
                <option value="" className="text-xs">- Select Target -</option>
                {!loading && listOfAddress.map((tokenId, index) => (
                    <option key={index} value={`${tokenId}`}>Pengo #{tokenId}</option>
                ))}
            </select>

            <button
                onClick={handlePurchase}
                disabled={isYour} // Disable button if isYoure is true
                className={`text-[8px] sm:text-xs font-mono sm:font-light border border-white py-1 px-2 ${isYour ? 'bg-red' : 'bg-blue-500'} rounded-sm hover:bg-black/30 hover:text-white my-2`}>
                {isYour ? 'This Youre' : 'Buy Now'}
            </button>
        </div>
    );
}
