/* eslint-disable react-hooks/exhaustive-deps */
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
import { toast } from "react-hot-toast";
import PengoContract from "../../constants/PengoContract.json";
import SelectField from "@/components/ui/SelectField";

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
    isProcessing?: boolean;
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


export default function CardItem({ accessoryData, onPurchase, accessoryId, tokenId, isProcessing = false }: CardItemProps) {
    const { address, chain } = useAccount();
    const pixels = parseBytePixel(accessoryData.bytePixel);
    const [isYour, setIsYour] = useState(false);
    const [selectedPengo, setSelectedPengo] = useState("");
    const [loading, setLoading] = useState(true);
    const networkContract = PengoContract.networkDeployment.find(network => Number(network.chainId) === chain?.id);
    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address;
    const currencySymbols = networkContract?.currency;

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

    // Check if the selected Pengo already has an accessory in this slot
    const isSlotFilled = listOfAccessories.some(acc => acc.trait_type === accessoryData.trait_type);

    const { data: tokenURIData } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "tokenURI",
        args: [selectedPengo],
        query: { enabled: !!selectedPengo }
    });

    const [pengoImage, setPengoImage] = useState<string | null>(null);

    useEffect(() => {
        if (tokenURIData) {
            try {
                const base64Data = (tokenURIData as string).split(",")[1];
                const metadata = JSON.parse(atob(base64Data));
                if (metadata.image) {
                    setPengoImage(metadata.image);
                }
            } catch (e) {
                console.error("Failed to parse tokenURI for preview", e);
            }
        } else {
            setPengoImage(null);
        }
    }, [tokenURIData, selectedPengo]);

    useEffect(() => {
        if (accessoryData.owner === address) {
            setIsYour(true);
        }

        if (listOfAddress !== undefined) {
            setLoading(false);
        }
    }, [accessoryData.owner, address, listOfAddress]);

    const handlePurchase = () => {
        for (let i = 0; i < listOfAccessories.length; i++) {
            if (listOfAccessories[i].trait_type === accessoryData.trait_type) {
                toast.error(`The ${accessoryData.trait_type} already exists on Pengo #${selectedPengo}`, { id: `duplicate-trait` });
                return;
            }
        }
        onPurchase(accessoryId, Number(tokenId), selectedPengo, accessoryData.sellingPrice);
    }

    const formatPrice = (price: bigint) => {
        const eth = Number(price) / 1e18;
        if (eth < 0.001) return '<0.001';
        return eth.toFixed(3);
    };

    return (
        <div className="glass rounded-xl overflow-visible group hover:bg-white/10 transition-all duration-300 relative z-0 hover:z-20 focus-within:z-20">
            {/* SVG Preview */}
            <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 flex items-center justify-center overflow-hidden rounded-t-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative w-[120px] h-[120px] transition-transform duration-300 group-hover:scale-110">
                    {pengoImage && (
                        <img
                            src={pengoImage}
                            alt="Pengo Preview"
                            className="absolute inset-0 w-full h-full drop-shadow-lg rounded-xl"
                        />
                    )}
                    <svg
                        height={100}
                        width={100}
                        shapeRendering="crispEdges"
                        viewBox="0 0 30 30"
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 w-full h-full drop-shadow-lg"
                    >
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
                </div>

                {/* Trait Type Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-primary-500/80 text-white rounded-md">
                    {accessoryData.trait_type}
                </span>

                {/* Owner Badge */}
                {isYour && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium bg-green-500/80 text-white rounded-md">
                        Yours
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                {/* Name */}
                <h3 className="text-sm font-semibold text-white truncate mb-1">
                    {accessoryData.trait_name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-1 mb-3">
                    <svg className="w-3 h-3 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L4.5 12l7.5 4.5L19.5 12 12 0zM4.5 13.5L12 24l7.5-10.5L12 18l-7.5-4.5z" />
                    </svg>
                    <span className="text-sm font-bold text-white">{formatPrice(accessoryData.sellingPrice)}</span>
                    <span className="text-xs text-neutral-400">{currencySymbols}</span>
                </div>

                {/* Actions */}
                {!isYour ? (
                    <div className="space-y-2.5">
                        <SelectField
                            size="sm"
                            label="Equip On"
                            placeholder={loading ? "Loading Pengos…" : "Select target Pengo"}
                            value={selectedPengo}
                            onChange={(e) => setSelectedPengo(e.target.value)}
                            disabled={loading || listOfAddress.length === 0}
                            options={
                                !loading
                                    ? listOfAddress.map((id) => ({
                                        value: `${id}`,
                                        label: `Pengo #${id}`,
                                    }))
                                    : []
                            }
                            hint={
                                !loading && listOfAddress.length === 0
                                    ? "Mint a Pengo first to equip this accessory"
                                    : undefined
                            }
                        />

                        <button
                            onClick={handlePurchase}
                            disabled={!selectedPengo || isProcessing || isSlotFilled}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${isProcessing
                                ? 'bg-primary-500/50 text-white cursor-not-allowed flex justify-center items-center gap-2'
                                : !selectedPengo || isSlotFilled
                                    ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/10'
                                    : 'btn-primary'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : isSlotFilled ? (
                                "Slot Filled"
                            ) : (
                                "Buy Now"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <span className="text-xs text-neutral-500">You own this</span>
                    </div>
                )}
            </div>
        </div>
    );
}
